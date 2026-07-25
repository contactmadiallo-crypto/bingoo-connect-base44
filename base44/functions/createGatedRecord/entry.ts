import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { GATED_ENTITIES, validateEntityRecord } from '../../shared/gatedEntityRegistry.ts';
import { resolveResourceEntitlement } from '../../shared/entitlementResolver.ts';

// Max team members per plan — mirrors src/lib/planPermissions.js maxTeamMembers().
const TEAM_MEMBER_LIMITS = {
  free: 0, professional: 0, pro: 0,
  business: 10, salon: 10, restaurant: 10,
  lawfirm: 20, corporate: 999,
};

const VALID_OPS = ['create', 'update', 'delete', 'attendance_clock_in', 'attendance_clock_out', 'create_menu_batch'];

function newCorrelationId() {
  try { return crypto.randomUUID(); } catch { return 'err-' + Date.now() + '-' + Math.random().toString(36).slice(2); }
}

async function audit(base44, user, action, targetType, targetId, details, correlationId) {
  try {
    await base44.asServiceRole.entities.AdminAuditLog.create({
      action,
      performed_by: user?.id || 'system',
      performed_by_email: (user?.email || '').toLowerCase(),
      performed_by_name: user?.full_name || '',
      target_type: targetType,
      target_id: targetId || 'none',
      notes: `[${correlationId}] ${details}`,
    });
  } catch (e) { console.error('audit failed', e.message); }
}

Deno.serve(async (req) => {
  const correlationId = newCorrelationId();
  let base44 = null, user = null, entityName = null, scopeId = null;
  try {
    base44 = createClientFromRequest(req);
    user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    entityName = body?.entity_name;
    const { profile_id, restaurant_id, data, op = 'create', record_id, items, team_member_id } = body;

    const cfg = GATED_ENTITIES[entityName];
    if (!cfg) return Response.json({ error: 'Invalid or unsupported entity' }, { status: 400 });
    if (!VALID_OPS.includes(op)) return Response.json({ error: 'Invalid op' }, { status: 400 });

    const scope = cfg.scope;
    scopeId = scope === 'restaurant' ? restaurant_id : profile_id;
    if (!scopeId) {
      return Response.json({ error: scope === 'restaurant' ? 'restaurant_id is required' : 'profile_id is required' }, { status: 400 });
    }

    // ── Ownership (admin bypasses ownership, but NOT the resource entitlement) ──
    let ownerEmail = null;
    if (scope === 'restaurant') {
      const restaurant = await base44.asServiceRole.entities.Restaurant.get(scopeId);
      if (!restaurant) return Response.json({ error: 'Restaurant not found' }, { status: 404 });
      if (restaurant.owner_email !== user.email && user.role !== 'admin') {
        return Response.json({ error: 'You do not own this restaurant' }, { status: 403 });
      }
      ownerEmail = restaurant.owner_email;
    } else {
      const profile = await base44.asServiceRole.entities.Profile.get(scopeId);
      if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 });
      if (profile.created_by_id !== user.id && user.role !== 'admin') {
        return Response.json({ error: 'You do not own this profile' }, { status: 403 });
      }
      const ownerUser = await base44.asServiceRole.entities.User.get(profile.created_by_id).catch(() => null);
      ownerEmail = ownerUser?.email || null;
    }

    // ── Resource-specific entitlement: resource → access record → subscription/trial → PlanEntitlement ──
    const ent = await resolveResourceEntitlement(base44, { scope, scopeId, ownerEmailFallback: ownerEmail });
    if (!ent.ok) {
      return Response.json({ error: ent.error, reason: ent.reason, plan: ent.plan }, { status: ent.status });
    }
    const { plan: resourcePlan, entitlement, accessRecord, usedFallback } = ent;

    const featureKey = cfg.feature;
    const isLockedFeature = !entitlement.features.includes(featureKey);
    const Entity = base44.asServiceRole.entities[entityName];

    // ── ATTENDANCE: dedicated server-controlled operations ──
    if (op === 'attendance_clock_in' || op === 'attendance_clock_out') {
      if (entityName !== 'AttendanceLog') return Response.json({ error: 'Op not valid for this entity' }, { status: 400 });
      return await handleAttendance(base44, user, scopeId, op, team_member_id, isLockedFeature, correlationId);
    }

    // ── MENU BATCH: compensating operations (NOT a DB transaction) ──
    if (op === 'create_menu_batch') {
      if (entityName !== 'MenuItem') return Response.json({ error: 'Op not valid for this entity' }, { status: 400 });
      return await handleMenuBatch(base44, user, scopeId, items, isLockedFeature, correlationId);
    }

    // ── Downgrade policy: locked features block create & update ──
    // (delete remains allowed for cleanup — authorized by ownership+scope only,
    //  without unlocking edit/create.)
    if ((op === 'create' || op === 'update') && isLockedFeature) {
      return Response.json({
        error: `Your current plan (${resourcePlan}) does not include the "${featureKey}" feature. Please upgrade to unlock it.`,
        locked_feature: featureKey,
      }, { status: 403 });
    }

    // ── UPDATE ──
    if (op === 'update') {
      if (!record_id) return Response.json({ error: 'record_id required for update' }, { status: 400 });
      const existing = await Entity.get(record_id);
      if (!existing) return Response.json({ error: 'Record not found' }, { status: 404 });
      const existingScope = scope === 'restaurant' ? existing.restaurant_id : existing.profile_id;
      if (existingScope !== scopeId) return Response.json({ error: 'Record scope mismatch' }, { status: 403 });
      const { sanitized, errors, rejected } = validateEntityRecord(entityName, data, 'update');
      if (errors.length) return Response.json({ error: 'validation_failed', errors }, { status: 400 });
      if (scope === 'restaurant') sanitized.restaurant_id = existingScope;
      else sanitized.profile_id = existingScope;
      const updated = await Entity.update(record_id, sanitized);
      return Response.json({ record: updated, rejected });
    }

    // ── DELETE (cleanup allowed after downgrade; ownership+scope only) ──
    if (op === 'delete') {
      if (!record_id) return Response.json({ error: 'record_id required for delete' }, { status: 400 });
      const existing = await Entity.get(record_id);
      if (!existing) return Response.json({ error: 'Record not found' }, { status: 404 });
      const existingScope = scope === 'restaurant' ? existing.restaurant_id : existing.profile_id;
      if (existingScope !== scopeId) return Response.json({ error: 'Record scope mismatch' }, { status: 403 });
      await Entity.delete(record_id);
      return Response.json({ record: null, deleted: true });
    }

    // ── CREATE ──
    const { sanitized, errors, rejected } = validateEntityRecord(entityName, data, 'create');
    if (errors.length) return Response.json({ error: 'validation_failed', errors }, { status: 400 });

    // TeamMember limit: OPTIMISTIC COMPENSATION with deterministic reconciliation.
    // Base44 does not expose DB transactions / unique constraints / atomic
    // compare-and-set to backend functions, so this is NOT an atomic concurrency
    // guarantee. Pre-check + create + post-check + rollback is optimistic
    // compensation: under true concurrency two requests can both pass the
    // pre-check and create. The post-create recheck detects the overrun and
    // reconciles by deleting the just-created record + writing an audit record
    // (teammember_limit_reconciled). The deterministic recheck on the next
    // request also enforces the cap. Do not rely on this for strict atomicity.
    if (entityName === 'TeamMember') {
      const limit = TEAM_MEMBER_LIMITS[resourcePlan] ?? 0;
      const existing = await Entity.filter({ profile_id: scopeId });
      if (existing.length >= limit) {
        return Response.json({ error: `You've reached the team member limit for your ${resourcePlan} plan (${limit}). Upgrade to add more.`, limit }, { status: 403 });
      }
      const created = await Entity.create({ ...sanitized, profile_id: scopeId });
      const after = await Entity.filter({ profile_id: scopeId });
      if (after.length > limit) {
        // Reconciliation: remove the record this request just created.
        let rollbackOk = true;
        try { await Entity.delete(created.id); }
        catch (de) {
          rollbackOk = false;
          await audit(base44, user, 'teammember_reconcile_rollback_failed', entityName, created.id,
            `limit=${limit} after=${after.length}; failed to delete overrun record: ${de.message}`, correlationId);
        }
        if (rollbackOk) {
          await audit(base44, user, 'teammember_limit_reconciled', entityName, created.id,
            `limit=${limit} after=${after.length}; overrun record deleted (optimistic compensation)`, correlationId);
        }
        return Response.json({ error: 'Team member limit reached (optimistic compensation applied)', limit, reconciled: rollbackOk }, { status: 403 });
      }
      return Response.json({ record: created, rejected });
    }

    const payload = scope === 'restaurant'
      ? { ...sanitized, restaurant_id: scopeId }
      : { ...sanitized, profile_id: scopeId };
    const created = await Entity.create(payload);
    return Response.json({ record: created, rejected });
  } catch (error) {
    console.error(`[createGatedRecord] [${correlationId}]`, error.message);
    if (base44) {
      await audit(base44, user, 'gated_record_error', entityName || 'unknown', scopeId || 'none', error.message, correlationId).catch(() => {});
    }
    return Response.json({ error: 'internal_error', correlation_id: correlationId }, { status: 500 });
  }
});

// ── Attendance dedicated operations (server-controlled) ──────────────────────
// Clients supply only team_member_id; the server resolves the member's canonical
// identity from the TeamMember record, generates timestamps, calculates hours,
// sets status, and prevents multiple open sessions per member.
async function handleAttendance(base44, user, profileId, op, teamMemberId, isLockedFeature, correlationId) {
  const Attendance = base44.asServiceRole.entities.AttendanceLog;
  const TeamMember = base44.asServiceRole.entities.TeamMember;

  if (!teamMemberId || typeof teamMemberId !== 'string') {
    return Response.json({ error: 'team_member_id required' }, { status: 400 });
  }

  // Canonical identity: validate the member belongs to this profile.
  const member = await TeamMember.get(teamMemberId);
  if (!member || member.profile_id !== profileId) {
    return Response.json({ error: 'Team member not found in this profile' }, { status: 404 });
  }
  if (member.status === 'inactive') {
    return Response.json({ error: 'Team member is inactive' }, { status: 403 });
  }

  if (op === 'attendance_clock_in') {
    if (isLockedFeature) {
      return Response.json({ error: 'Your current plan does not include the "attendance" feature. Please upgrade.', locked_feature: 'attendance' }, { status: 403 });
    }
    // Prevent multiple open sessions (reconciliation, not atomic).
    const open = await Attendance.filter({ team_member_id: teamMemberId, status: 'clocked_in' });
    if (open && open.length > 0) {
      return Response.json({ error: 'This team member already has an open attendance session', open_session_id: open[0].id }, { status: 409 });
    }
    const now = new Date();
    const created = await Attendance.create({
      profile_id: profileId,
      team_member_id: teamMemberId,
      team_member_name: member.name,
      clock_in: now.toISOString(),
      date: now.toISOString().slice(0, 10),
      status: 'clocked_in',
    });
    return Response.json({ record: created });
  }

  // op === 'attendance_clock_out' — allowed without the feature (completes a session).
  const open = await Attendance.filter({ team_member_id: teamMemberId, status: 'clocked_in' });
  if (!open || open.length === 0) {
    return Response.json({ error: 'No open attendance session for this team member' }, { status: 404 });
  }
  if (open.length > 1) {
    await audit(base44, user, 'attendance_multiple_open_sessions', 'AttendanceLog', open[0].profile_id,
      `member=${teamMemberId} open=${open.length}; admin must resolve`, correlationId);
    return Response.json({ error: 'Multiple open sessions detected — admin must resolve' }, { status: 409 });
  }
  const session = open[0];
  const clockOut = new Date();
  const hoursWorked = Math.max(0, (clockOut.getTime() - new Date(session.clock_in).getTime()) / 3600000);
  const updated = await Attendance.update(session.id, {
    clock_out: clockOut.toISOString(),
    hours_worked: Math.round(hoursWorked * 100) / 100,
    status: 'clocked_out',
  });
  return Response.json({ record: updated });
}

// ── Menu batch: COMPENSATING operations (NOT a DB transaction) ────────────────
// Base44 does not expose multi-record DB transactions to backend functions, so
// this is NOT "all-or-nothing" in the transactional sense. Behavior:
//   - Validate ALL items first; reject the batch on any validation error (no
//     items are created when validation fails).
//   - Create items sequentially; if a creation fails, attempt to delete every
//     item created so far (compensating rollback).
//   - If a compensating delete ALSO fails, write a recovery audit record
//     (menu_batch_rollback_failed) listing the orphaned ids so an admin can
//     reconcile. The caller receives a 500 with the orphan ids.
// Do not describe this as transactional; it is best-effort compensation + audit.
async function handleMenuBatch(base44, user, restaurantId, items, isLockedFeature, correlationId) {
  const MenuItem = base44.asServiceRole.entities.MenuItem;
  if (isLockedFeature) {
    return Response.json({ error: 'Your current plan does not include the "digital_menu" feature.', locked_feature: 'digital_menu' }, { status: 403 });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return Response.json({ error: 'items array required' }, { status: 400 });
  }

  // Test affordance (harmless in production — no UI sends this): an item with
  // `_test_fail_on_create: true` forces a synthetic create failure at that index
  // AFTER prior items are created, to exercise the compensating-rollback path.
  const failAtIndex = (() => {
    for (let i = 0; i < items.length; i++) {
      if (items[i] && items[i]._test_fail_on_create === true) return i;
    }
    return -1;
  })();

  // Validate ALL items; reject the whole batch on any validation error.
  const validated = [];
  const errors = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (i === failAtIndex) { validated.push({ __fail: true, index: i }); continue; }
    const { sanitized, errors: itemErrors } = validateEntityRecord('MenuItem', item, 'create');
    if (itemErrors.length) { errors.push({ index: i, errors: itemErrors }); continue; }
    for (const f of ['name', 'price', 'category']) {
      if (sanitized[f] === undefined || sanitized[f] === null || sanitized[f] === '') {
        errors.push({ index: i, errors: [{ field: f, error: 'required' }] });
      }
    }
    validated.push({ ...sanitized, restaurant_id: restaurantId, available: sanitized.available !== false });
  }
  if (errors.length) {
    return Response.json({ error: 'batch_validation_failed', errors }, { status: 400 });
  }

  // Create sequentially with compensating rollback on failure.
  const createdIds = [];
  for (let i = 0; i < validated.length; i++) {
    const v = validated[i];
    if (v.__fail) {
      // Synthetic create failure — exercise compensating rollback.
      const orphanIds = [...createdIds];
      const rollbackFailedIds = [];
      for (const id of orphanIds) {
        try { await MenuItem.delete(id); }
        catch (de) { rollbackFailedIds.push(id); console.error(`[${correlationId}] menu rollback failed ${id}`, de.message); }
      }
      if (rollbackFailedIds.length > 0) {
        await audit(base44, user, 'menu_batch_rollback_failed', 'MenuItem', restaurantId,
          `created ${orphanIds.length} then failed at index ${i}; ORPHANED ids (delete failed): ${JSON.stringify(rollbackFailedIds)}`, correlationId);
        return Response.json({ error: 'Menu creation failed; compensating rollback PARTIAL — orphaned items remain', orphan_ids: rollbackFailedIds, correlation_id: correlationId }, { status: 500 });
      }
      await audit(base44, user, 'menu_batch_rollback_ok', 'MenuItem', restaurantId,
        `created ${orphanIds.length} then failed at index ${i}; all compensated (deleted)`, correlationId);
      return Response.json({ error: 'Menu creation failed; all created items compensated (deleted)', created_then_rolled_back: orphanIds.length, correlation_id: correlationId }, { status: 500 });
    }
    try {
      const rec = await MenuItem.create(v);
      createdIds.push(rec.id);
    } catch (e) {
      // Real create failure — compensating rollback + recovery audit.
      const rollbackFailedIds = [];
      for (const id of createdIds) {
        try { await MenuItem.delete(id); }
        catch (de) { rollbackFailedIds.push(id); console.error(`[${correlationId}] menu rollback failed ${id}`, de.message); }
      }
      if (rollbackFailedIds.length > 0) {
        await audit(base44, user, 'menu_batch_rollback_failed', 'MenuItem', restaurantId,
          `created ${createdIds.length} then failed: ${e.message}; ORPHANED ids (delete failed): ${JSON.stringify(rollbackFailedIds)}`, correlationId);
        return Response.json({ error: 'Menu creation failed; compensating rollback PARTIAL — orphaned items remain', orphan_ids: rollbackFailedIds, correlation_id: correlationId }, { status: 500 });
      }
      await audit(base44, user, 'menu_batch_rollback_ok', 'MenuItem', restaurantId,
        `created ${createdIds.length} then failed: ${e.message}; all compensated (deleted)`, correlationId);
      return Response.json({ error: 'Menu creation failed; all created items compensated (deleted)', correlation_id: correlationId }, { status: 500 });
    }
  }
  return Response.json({ created: createdIds.length, ids: createdIds, note: 'compensating operations (not a DB transaction)' });
}