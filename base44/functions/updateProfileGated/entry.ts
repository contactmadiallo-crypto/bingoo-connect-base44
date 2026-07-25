import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sanitizeProfileFields, pickOwnerProfileFields, normalizeUsername } from '../../shared/profileSanitizer.ts';
import { resolveEffectivePlan, loadPlanEntitlement } from '../../shared/entitlementResolver.ts';

function newCorrelationId() {
  try { return crypto.randomUUID(); } catch { return 'err-' + Date.now() + '-' + Math.random().toString(36).slice(2); }
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
    const profile_id = body?.profile_id;
    const input = body?.data || {};
    if (!profile_id) return Response.json({ error: 'profile_id required' }, { status: 400 });

    const profile = await base44.asServiceRole.entities.Profile.get(profile_id);
    if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 });
    // ProfileAccess is the ownership authority because service-role creation records
    // the service identity in Profile.created_by_id.
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

    // ── Resolve entitlement from the RESOURCE owner (not the calling user),
    // so an admin acting on a free user's profile cannot unlock paid fields via
    // the admin's own plan. ─────────────────────────────────────────────────────
    const ownerUser = await base44.asServiceRole.entities.User.get(access.owner_user_id).catch(() => null);
    const ownerEmail = ownerUser?.email || user.email;
    const subs = await base44.asServiceRole.entities.Subscription.filter({ customer_email: ownerEmail });
    const { plan } = resolveEffectivePlan(subs, ownerEmail);
    const { entitlement, error: entError } = await loadPlanEntitlement(base44, plan);
    if (entError === 'missing') {
      return Response.json({ error: `Entitlement configuration missing for plan "${plan}"` }, { status: 403 });
    }
    if (entError === 'conflict') {
      return Response.json({ error: 'Entitlement configuration conflict (duplicate active PlanEntitlement)', plan }, { status: 409 });
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
    console.error(`[updateProfileGated] [${correlationId}]`, error.message);
    try {
      if (base44) {
        await base44.asServiceRole.entities.AdminAuditLog.create({
          action: 'update_profile_error', performed_by: user?.id || 'system',
          performed_by_email: (user?.email || '').toLowerCase(),
          notes: `[${correlationId}] ${error.message}`,
        }).catch(() => {});
      }
    } catch {}
    return Response.json({ error: 'internal_error', correlation_id: correlationId }, { status: 500 });
  }
});