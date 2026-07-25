import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import {
  sanitizeProfileFields, mapLegacyPlan, pickOwnerProfileFields, normalizeUsername,
  RESERVED_USERNAMES,
} from '../../shared/profileSanitizer.ts';

async function sha256Hex(str) {
  const data = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function canonicalPayload(input, plan) {
  return JSON.stringify({ input: input || {}, plan });
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const input = body?.data || body?.profile || {};
    const idempotencyKey = body?.idempotency_key;
    if (!idempotencyKey || typeof idempotencyKey !== 'string') {
      return Response.json({ error: 'idempotency_key required' }, { status: 400 });
    }

    // ── Resolve canonical plan + entitlement (server authority) ──────────────
    const featRes = await base44.functions.invoke('getUserFeatures', {});
    const featData = featRes?.data || featRes || {};
    const plan = featData.plan || 'free';
    const entitlements = await base44.asServiceRole.entities.PlanEntitlement.filter({ plan_name: plan, is_active: true });
    const entitlement = entitlements?.[0];
    if (!entitlement) {
      return Response.json({ error: `Entitlement configuration missing for plan "${plan}"` }, { status: 403 });
    }

    const payloadHash = await sha256Hex(canonicalPayload(input, plan));

    // ── Idempotency: prior request lookup ────────────────────────────────────
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
      // failed → allow retry: mark new attempt below (delete prior failed record)
      await base44.asServiceRole.entities.ProfileCreationRequest.delete(priorRec.id).catch(() => {});
    }

    // ── Sanitize input by resolved plan ──────────────────────────────────────
    const { sanitized, rejected, errors } = sanitizeProfileFields({
      entitlement, input, currentProfile: null, mode: 'create',
    });
    if (errors && errors.length) {
      return Response.json({ error: 'validation_failed', errors }, { status: 400 });
    }
    if (!sanitized.display_name || !sanitized.username) {
      return Response.json({ error: 'display_name and username required' }, { status: 400 });
    }

    // ── Username conflict (409) ──────────────────────────────────────────────
    const taken = await base44.asServiceRole.entities.Profile.filter({ username: sanitized.username }, '-updated_date', 1);
    if (taken && taken.length) {
      return Response.json({ error: 'Username taken', conflict: true }, { status: 409 });
    }

    // ── Enforce maximum_active_profiles ─────────────────────────────────────
    const maxProfiles = typeof entitlement.maximum_active_profiles === 'number' ? entitlement.maximum_active_profiles : 1;
    const active = await base44.asServiceRole.entities.ProfileAccess.filter({ owner_user_id: user.id, access_status: 'active' });
    if (active.length >= maxProfiles) {
      return Response.json({ error: `Profile limit reached (${maxProfiles})` }, { status: 403 });
    }

    // ── Record in-progress idempotency request ───────────────────────────────
    let requestRec;
    try {
      requestRec = await base44.asServiceRole.entities.ProfileCreationRequest.create({
        user_id: user.id, idempotency_key: idempotencyKey, status: 'in_progress',
        payload_hash: payloadHash, created_at: new Date().toISOString(),
      });
    } catch (e) {
      return Response.json({ error: 'Could not start creation: ' + e.message }, { status: 500 });
    }

    // ── created_during_trial from subscription status + trial end ───────────
    const sub = featData.subscription || null;
    const now = Date.now();
    const createdDuringTrial = !!(sub && sub.status === 'trialing' && sub.trial_ends_at && new Date(sub.trial_ends_at).getTime() > now);
    const willBePrimary = !active.some((a) => a.is_primary);

    // ── Create Profile (service role) ────────────────────────────────────────
    let profile;
    try {
      profile = await base44.asServiceRole.entities.Profile.create({
        ...sanitized, is_active: true, plan: mapLegacyPlan(plan), created_by_id: user.id,
      });
    } catch (e) {
      await base44.asServiceRole.entities.ProfileCreationRequest.update(requestRec.id, {
        status: 'failed', error: 'profile_create: ' + e.message, completed_at: new Date().toISOString(),
      }).catch(() => {});
      return Response.json({ error: e.message }, { status: 400 });
    }

    // ── Create ProfileAccess; rollback Profile on failure ────────────────────
    let access;
    try {
      access = await base44.asServiceRole.entities.ProfileAccess.create({
        profile_id: profile.id, owner_user_id: user.id, access_status: 'active',
        is_primary: willBePrimary, created_during_trial: createdDuringTrial,
        locked_at: null, lock_reason: '',
      });
    } catch (e) {
      console.error('ProfileAccess create failed — rollback Profile', profile.id, e.message);
      try { await base44.asServiceRole.entities.Profile.delete(profile.id); } catch (de) { console.error('rollback failed', de.message); }
      await base44.asServiceRole.entities.ProfileCreationRequest.update(requestRec.id, {
        status: 'failed', error: 'access_create: ' + e.message, completed_at: new Date().toISOString(),
      }).catch(() => {});
      return Response.json({ error: 'Failed to initialize profile access' }, { status: 500 });
    }

    // ── Complete idempotency record ──────────────────────────────────────────
    await base44.asServiceRole.entities.ProfileCreationRequest.update(requestRec.id, {
      status: 'completed', profile_id: profile.id, completed_at: new Date().toISOString(),
    }).catch(() => {});

    return Response.json({
      profile: pickOwnerProfileFields(profile, access, plan),
      rejected,
    });
  } catch (error) {
    console.error('createProfileGated error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});