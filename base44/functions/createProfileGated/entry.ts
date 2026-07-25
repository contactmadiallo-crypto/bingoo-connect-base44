import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import {
  sanitizeProfileFields, mapLegacyPlan, pickOwnerProfileFields,
} from '../../shared/profileSanitizer.ts';
import { resolveEffectivePlan, loadPlanEntitlement } from '../../shared/entitlementResolver.ts';

async function sha256Hex(str) {
  const data = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function newCorrelationId() {
  try { return crypto.randomUUID(); } catch { return 'err-' + Date.now() + '-' + Math.random().toString(36).slice(2); }
}

async function auditFailure(base44, user, requestRecId, stage, message) {
  try {
    await base44.asServiceRole.entities.AdminAuditLog.create({
      action: 'profile_creation_failure',
      performed_by: user.id,
      performed_by_email: (user.email || '').toLowerCase(),
      target_type: 'ProfileCreationRequest',
      target_id: requestRecId || 'none',
      notes: `${stage}: ${message}`,
    });
  } catch (e) { console.error('auditFailure failed', e.message); }
}

Deno.serve(async (req) => {
  const correlationId = newCorrelationId();
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });
  let base44 = null;
  let user = null;
  try {
    base44 = createClientFromRequest(req);
    user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const input = body?.data || body?.profile || {};
    const idempotencyKey = body?.idempotency_key;
    if (!idempotencyKey || typeof idempotencyKey !== 'string') {
      return Response.json({ error: 'idempotency_key required' }, { status: 400 });
    }

    // ── Resolve canonical plan from the CALLING user's account (they will be the
    // owner of the new profile; the resource doesn't exist yet). ──────────────
    const subs = await base44.asServiceRole.entities.Subscription.filter({ customer_email: user.email });
    const { plan } = resolveEffectivePlan(subs, user.email);

    // ── Resolve entitlement; detect duplicate active PlanEntitlement ──────────
    const { entitlement, error: entError } = await loadPlanEntitlement(base44, plan);
    if (entError === 'missing') {
      return Response.json({ error: `Entitlement configuration missing for plan "${plan}"` }, { status: 403 });
    }
    if (entError === 'conflict') {
      return Response.json({ error: 'Entitlement configuration conflict (duplicate active PlanEntitlement)', plan }, { status: 409 });
    }

    // ── Sanitize input by resolved plan ────────────────────────────────────────
    const { sanitized, rejected, errors } = sanitizeProfileFields({
      entitlement, input, currentProfile: null, mode: 'create',
    });
    if (errors && errors.length) {
      return Response.json({ error: 'validation_failed', errors }, { status: 400 });
    }
    if (!sanitized.display_name || !sanitized.username) {
      return Response.json({ error: 'display_name and username required' }, { status: 400 });
    }

    // ── Idempotency hash from canonical SANITIZED payload ─────────────────────
    const payloadHash = await sha256Hex(JSON.stringify({ sanitized, plan }));

    // ── Prior request lookup (preserve failed history) ────────────────────────
    const prior = await base44.asServiceRole.entities.ProfileCreationRequest.filter({
      user_id: user.id, idempotency_key: idempotencyKey,
    });
    const priorRec = prior?.[0];
    if (priorRec) {
      if (priorRec.status === 'completed') {
        if (priorRec.payload_hash && priorRec.payload_hash !== payloadHash) {
          return Response.json({ error: 'idempotency_key reused with different payload' }, { status: 409 });
        }
        const profile = await base44.asServiceRole.entities.Profile.get(priorRec.profile_id);
        const access = (await base44.asServiceRole.entities.ProfileAccess.filter({ profile_id: priorRec.profile_id }))[0];
        return Response.json({ profile: pickOwnerProfileFields(profile, access, plan), idempotent: true });
      }
      if (priorRec.status === 'in_progress') {
        return Response.json({ error: 'creation already in progress', request_id: priorRec.id }, { status: 409 });
      }
      // failed → preserve history: audit prior failure, then reset to in_progress for retry.
      await auditFailure(base44, user, priorRec.id, 'retry_after_failure', priorRec.error || 'prior failed');
      await base44.asServiceRole.entities.ProfileCreationRequest.update(priorRec.id, {
        status: 'in_progress', error: '', payload_hash: payloadHash, completed_at: null,
      }).catch(async (e) => { await auditFailure(base44, user, priorRec.id, 'reset_failed', e.message); });
    }

    // ── Username conflict (409) ────────────────────────────────────────────────
    const taken = await base44.asServiceRole.entities.Profile.filter({ username: sanitized.username }, '-updated_date', 1);
    if (taken && taken.length) {
      return Response.json({ error: 'Username taken', conflict: true }, { status: 409 });
    }

    // ── Enforce maximum_active_profiles ───────────────────────────────────────
    const maxProfiles = typeof entitlement.maximum_active_profiles === 'number' ? entitlement.maximum_active_profiles : 1;
    const active = await base44.asServiceRole.entities.ProfileAccess.filter({ owner_user_id: user.id, access_status: 'active' });
    const byProfile = new Map();
    for (const a of active) { byProfile.set(a.profile_id, (byProfile.get(a.profile_id) || 0) + 1); }
    for (const [, c] of byProfile) {
      if (c > 1) return Response.json({ error: 'ProfileAccess configuration conflict (duplicate active access)', plan }, { status: 409 });
    }
    if (active.length >= maxProfiles) {
      return Response.json({ error: `Profile limit reached (${maxProfiles})` }, { status: 403 });
    }

    // ── Record in-progress idempotency request ────────────────────────────────
    let requestRecId = priorRec?.id;
    if (!requestRecId) {
      try {
        const requestRec = await base44.asServiceRole.entities.ProfileCreationRequest.create({
          user_id: user.id, idempotency_key: idempotencyKey, status: 'in_progress',
          payload_hash: payloadHash, created_at: new Date().toISOString(),
        });
        requestRecId = requestRec.id;
      } catch (e) {
        return Response.json({ error: 'Could not start creation', correlation_id: correlationId }, { status: 500 });
      }
    }

    // ── created_during_trial from subscription status + trial end ─────────────
    const subRec = subs && subs[0];
    const now = Date.now();
    const createdDuringTrial = !!(subRec && subRec.status === 'trialing' && subRec.trial_ends_at && new Date(subRec.trial_ends_at).getTime() > now);
    const willBePrimary = !active.some((a) => a.is_primary);

    // ── Create Profile (service role) ──────────────────────────────────────────
    let profile;
    try {
      profile = await base44.asServiceRole.entities.Profile.create({
        ...sanitized, is_active: true, plan: mapLegacyPlan(plan), created_by_id: user.id,
      });
    } catch (e) {
      await base44.asServiceRole.entities.ProfileCreationRequest.update(requestRecId, {
        status: 'failed', error: 'profile_create: ' + e.message, completed_at: new Date().toISOString(),
      }).catch(async (u) => { await auditFailure(base44, user, requestRecId, 'mark_failed_failed', u.message); });
      return Response.json({ error: 'Failed to create profile', correlation_id: correlationId }, { status: 400 });
    }

    // ── Create ProfileAccess; rollback Profile on failure ──────────────────────
    let access;
    try {
      access = await base44.asServiceRole.entities.ProfileAccess.create({
        profile_id: profile.id, owner_user_id: user.id, access_status: 'active',
        is_primary: willBePrimary, created_during_trial: createdDuringTrial,
        locked_at: null, lock_reason: '',
      });
    } catch (e) {
      console.error('ProfileAccess create failed — rollback Profile', profile.id, e.message);
      try { await base44.asServiceRole.entities.Profile.delete(profile.id); }
      catch (de) { await auditFailure(base44, user, requestRecId, 'rollback_failed', de.message); }
      await base44.asServiceRole.entities.ProfileCreationRequest.update(requestRecId, {
        status: 'failed', error: 'access_create: ' + e.message, completed_at: new Date().toISOString(),
      }).catch(async (u) => { await auditFailure(base44, user, requestRecId, 'mark_failed_failed', u.message); });
      return Response.json({ error: 'Failed to initialize profile access', correlation_id: correlationId }, { status: 500 });
    }

    // ── Concurrency guard: post-create limit verification ──────────────────────
    const activeAfter = await base44.asServiceRole.entities.ProfileAccess.filter({ owner_user_id: user.id, access_status: 'active' });
    if (activeAfter.length > maxProfiles) {
      try { await base44.asServiceRole.entities.ProfileAccess.delete(access.id); } catch {}
      try { await base44.asServiceRole.entities.Profile.delete(profile.id); } catch (de) { await auditFailure(base44, user, requestRecId, 'concurrency_rollback_failed', de.message); }
      await base44.asServiceRole.entities.ProfileCreationRequest.update(requestRecId, {
        status: 'failed', error: 'concurrency_limit_exceeded', completed_at: new Date().toISOString(),
      }).catch(async (u) => { await auditFailure(base44, user, requestRecId, 'mark_failed_failed', u.message); });
      return Response.json({ error: 'Profile limit reached (concurrency)' }, { status: 403 });
    }

    // ── Complete idempotency record ────────────────────────────────────────────
    try {
      await base44.asServiceRole.entities.ProfileCreationRequest.update(requestRecId, {
        status: 'completed', profile_id: profile.id, completed_at: new Date().toISOString(),
      });
    } catch (e) {
      await auditFailure(base44, user, requestRecId, 'completion_mark_failed', e.message);
    }

    return Response.json({ profile: pickOwnerProfileFields(profile, access, plan), rejected });
  } catch (error) {
    console.error(`[createProfileGated] [${correlationId}]`, error.message);
    try {
      if (base44) {
        await base44.asServiceRole.entities.AdminAuditLog.create({
          action: 'profile_creation_error', performed_by: user?.id || 'system',
          performed_by_email: (user?.email || '').toLowerCase(),
          notes: `[${correlationId}] ${error.message}`,
        }).catch(() => {});
      }
    } catch {}
    return Response.json({ error: 'internal_error', correlation_id: correlationId }, { status: 500 });
  }
});