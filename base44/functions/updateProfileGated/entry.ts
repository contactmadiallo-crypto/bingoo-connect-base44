import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sanitizeProfileFields, pickOwnerProfileFields, normalizeUsername } from '../../shared/profileSanitizer.ts';

Deno.serve(async (req) => {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const profile_id = body?.profile_id;
    const input = body?.data || {};
    if (!profile_id) return Response.json({ error: 'profile_id required' }, { status: 400 });

    const profile = await base44.asServiceRole.entities.Profile.get(profile_id);
    if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 });
    if (profile.created_by_id !== user.id && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const accessList = await base44.asServiceRole.entities.ProfileAccess.filter({ profile_id });
    if (accessList.length > 1) {
      return Response.json({ error: 'Multiple ProfileAccess records detected — admin must resolve', conflict: accessList.map((a) => a.id) }, { status: 409 });
    }
    const access = accessList[0];
    if (!access || (access.owner_user_id !== user.id && user.role !== 'admin')) {
      return Response.json({ error: 'Access record mismatch' }, { status: 403 });
    }
    if (access.access_status !== 'active') {
      return Response.json({ error: `Profile is ${access.access_status}` }, { status: 403 });
    }

    // ── Resolve canonical plan + entitlement ──────────────────────────────────
    const featRes = await base44.functions.invoke('getUserFeatures', {});
    const featData = featRes?.data || featRes || {};
    const plan = featData.plan || 'free';
    const entitlements = await base44.asServiceRole.entities.PlanEntitlement.filter({ plan_name: plan, is_active: true });
    const entitlement = entitlements?.[0];
    if (!entitlement) {
      return Response.json({ error: `Entitlement configuration missing for plan "${plan}"` }, { status: 403 });
    }

    const { sanitized, rejected, errors } = sanitizeProfileFields({
      entitlement, input, currentProfile: profile, mode: 'update',
    });
    if (errors && errors.length) {
      return Response.json({ error: 'validation_failed', errors }, { status: 400 });
    }

    // ── Username change conflict ──────────────────────────────────────────────
    if (sanitized.username && normalizeUsername(sanitized.username) !== profile.username) {
      const taken = await base44.asServiceRole.entities.Profile.filter({ username: sanitized.username }, '-updated_date', 1);
      if (taken && taken.length && taken[0].id !== profile.id) {
        return Response.json({ error: 'Username taken', conflict: true }, { status: 409 });
      }
    }

    const updated = await base44.asServiceRole.entities.Profile.update(profile_id, sanitized);

    // ── Audit only security-relevant admin edits ─────────────────────────────
    if (user.role === 'admin') {
      await base44.asServiceRole.entities.AdminAuditLog.create({
        action: 'admin_update_profile',
        performed_by: user.id,
        performed_by_name: user.full_name || '',
        performed_by_email: (user.email || '').toLowerCase(),
        target_type: 'Profile',
        target_id: profile_id,
        old_value: JSON.stringify({ plan: profile.plan, is_active: profile.is_active }),
        new_value: JSON.stringify({ rejected, keys: Object.keys(sanitized) }),
        notes: 'Admin edited profile via updateProfileGated',
      }).catch(() => {});
    }

    return Response.json({ profile: pickOwnerProfileFields(updated, access, plan), rejected });
  } catch (error) {
    console.error('updateProfileGated error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});