import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { GATED_ENTITIES, validateEntityRecord } from '../../shared/gatedEntityRegistry.ts';
import { resolveEffectivePlan, loadPlanEntitlement } from '../../shared/entitlementResolver.ts';

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

async function auditError(base44, user, action, targetType, targetId, details, correlationId) {
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
  } catch (e) { console.error('auditError failed', e.message); }
}

Deno.serve(async (req) => {
  const correlationId = newCorrelationId();
  let base44 = null;
  let user = null;
  let entityName = null;
  let scopeId = null;
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

    // ── Ownership (admin bypasses ownership, but NOT the resource entitlement check) ──
    let ownerEmail = null;
    if (scope === 'restaurant') {
      const restaurant = await base44.asServiceRole.entities.Restaurant.get(scopeId);
      if (!restaurant) return Response.json({ error: 'Restaurant not found' }, { status: 404 });
      // Canonical ownership: Restaurant.owner_email === user.email
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
      // Locked/archived profile → block all mutation (exactly one active access).
      const accessList = await base44.asServiceRole.entities.ProfileAccess.filter({ profile_id: scopeId });
      const activeAccess = (accessList || []).filter((a) => a.access_status === 'active');
      if (activeAccess.length !== 1) {
        return Response.json({ error: activeAccess.length === 0 ? 'Profile is locked' : 'ProfileAccess configuration conflict' }, { status: 403 });
      }
      // Resolve owner email from the User record (account-level entitlement).
      const ownerUser = await base44.asServiceRole.entities.User.get(profile.created_by_id).catch(() => null);
      ownerEmail = ownerUser?.email || null;
    }

    // ── Resolve RESOURCE entitlement (not the calling user's general features) ──
    const subs = ownerEmail
      ? await base44.asServiceRole.entities.Subscription.filter({ customer_email: ownerEmail })
      : [];
    const { plan: resourcePlan } = resolveEffectivePlan(subs, ownerEmail);
    const { entitlement, error: entError } = await loadPlanEntitlement(base44, resourcePlan);
    if (entError === 'missing') {
      return Response.json({ error: `Entitlement configuration missing for plan "${resourcePlan}"` }, { status: 403 });
    }
    if (entError === 'conflict') {
      return Response.json({ error: 'Entitlement configuration conflict (duplicate active PlanEntitlement)', plan: resourcePlan }, { status: 409 });
    }

    const featureKey = cfg.feature;
    const isLockedFeature = !entitlement.features.includes(featureKey);
    const Entity = base44.asServiceRole.entities[entityName];

    // ── ATTENDANCE: dedicated server-controlled operations ──
    if (op === 'attendance_clock_in' || op === 'attendance_clock_out') {
      if (entityName !== 'AttendanceLog') return Response.json({ error: 'Op not valid for this entity' }, { status: 400 });
      return await handleAttendance(base44, user, scopeId, op, team_member_id, isLockedFeature, correlationId);
    }

    // ── MENU BATCH: all-or-nothing with rollback ──
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
      // Force-preserve scope ID (ignore any client attempt to change it).
      if (scope === 'restaurant') sanitized.restaurant_id = existingScope;
      else sanitized.profile_id = existingScope;
      const updated = await Entity.update(record_id, sanitized);
      return Response.json({ record: updated, rejected });
    }

    // ── DELETE (cleanup allowed after downgrade; ownership+scope only, no feature check) ──
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

    // Concurrency-safe TeamMember limit (pre-check + create + post-check + rollback),
    // mirroring createProfileGated's reservation pattern.
    if (entityName === 'TeamMember') {
      const limit = TEAM_MEMBER_LIMITS[resourcePlan] ?? 0;
      const existing = await Entity.filter({ profile_id: scopeId });
      if (existing.length >= limit) {
        return Response.json({ error: `You've reached the team member limit for your ${resourcePlan} plan (${limit}). Upgrade to add more.`, limit }, { status: 403 });
      }
      const created = await Entity.create({ ...sanitized, profile_id: scopeId });
      const after = await Entity.filter({ profile_id: scopeId });
      if (after.length > limit) {
        try { await Entity.delete(created.id); }
        catch (de) { await auditError(base44, user, 'teammember_concurrency_rollback_failed', entityName, created.id, de.message, correlationId); }
        return Response.json({ error: 'Team member limit reached (concurrency)', limit }, { status: 403 });
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
      await auditError(base44, user, 'gated_record_error', entityName || 'unknown', scopeId || 'none', error.message, correlationId).catch(() => {});
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
    // clock_in CREATES a new paid attendance record → requires the feature.
    if (isLockedFeature) {
      return Response.json({ error: 'Your current plan does not include the "attendance" feature. Please upgrade.', locked_feature: 'attendance' }, { status: 403 });
    }
    // Prevent multiple open sessions for the same team member.
    const open = await Attendance.filter({ team_member_id: teamMemberId, status: 'clocked_in' });
    if (open && open.length > 0) {
      return Response.json({ error: 'This team member already has an open attendance session', open_session_id: open[0].id }, { status: 409 });
    }
    const now = new Date();
    const created = await Attendance.create({
      profile_id: profileId,
      team_member_id: teamMemberId,
      team_member_name: member.name,         // server-resolved, not client-supplied
      clock_in: now.toISOString(),           // server-generated
      date: now.toISOString().slice(0, 10),  // server-generated
      status: 'clocked_in',                  // server-set
    });
    return Response.json({ record: created });
  }

  // op === 'attendance_clock_out'
  // clock_out COMPLETES an existing open session — allowed without the feature
  // check (it is not creating/editing paid content; blocking it would leave
  // phantom open sessions after a downgrade).
  const open = await Attendance.filter({ team_member_id: teamMemberId, status: 'clocked_in' });
  if (!open || open.length === 0) {
    return Response.json({ error: 'No open attendance session for this team member' }, { status: 404 });
  }
  if (open.length > 1) {
    return Response.json({ error: 'Multiple open sessions detected — admin must resolve' }, { status: 409 });
  }
  const session = open[0];
  const clockOut = new Date();
  const hoursWorked = Math.max(0, (clockOut.getTime() - new Date(session.clock_in).getTime()) / 3600000);
  const updated = await Attendance.update(session.id, {
    clock_out: clockOut.toISOString(),                       // server-generated
    hours_worked: Math.round(hoursWorked * 100) / 100,       // server-calculated
    status: 'clocked_out',                                    // server-set
  });
  return Response.json({ record: updated });
}

// ── Menu batch: validate all, then create all-or-nothing with rollback ───────
async function handleMenuBatch(base44, user, restaurantId, items, isLockedFeature, correlationId) {
  const MenuItem = base44.asServiceRole.entities.MenuItem;
  if (isLockedFeature) {
    return Response.json({ error: 'Your current plan does not include the "digital_menu" feature.', locked_feature: 'digital_menu' }, { status: 403 });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return Response.json({ error: 'items array required' }, { status: 400 });
  }

  // Validate ALL items first; reject the whole batch on any validation error
  // so onboarding never silently completes with a partial menu.
  const validated = [];
  const errors = [];
  for (let i = 0; i < items.length; i++) {
    const { sanitized, errors: itemErrors } = validateEntityRecord('MenuItem', items[i], 'create');
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

  // Create all; rollback everything created on any failure (no partial success).
  const createdIds = [];
  try {
    for (const payload of validated) {
      const rec = await MenuItem.create(payload);
      createdIds.push(rec.id);
    }
    return Response.json({ created: createdIds.length, ids: createdIds });
  } catch (e) {
    for (const id of createdIds) {
      try { await MenuItem.delete(id); }
      catch (de) { console.error(`[${correlationId}] menu batch rollback failed for ${id}`, de.message); }
    }
    await auditError(base44, user, 'menu_batch_rollback', 'MenuItem', restaurantId, `created ${createdIds.length} then failed: ${e.message}`, correlationId);
    return Response.json({ error: 'Menu creation failed; all items rolled back', correlation_id: correlationId }, { status: 500 });
  }
}