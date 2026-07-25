import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { pickPublicProfileFields } from '../../shared/profileSanitizer.ts';

Deno.serve(async (req) => {
  const correlationId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'err-' + Date.now();
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { username } = body;

    if (!username || typeof username !== 'string') {
      return Response.json({ error: 'Username is required' }, { status: 400 });
    }

    // Require is_active === true.
    let profiles = await base44.asServiceRole.entities.Profile.filter({
      username: username, is_active: true,
    }, '-updated_date', 1);

    if (!profiles || profiles.length === 0) {
      // Fallback only catches legacy null is_active; still must be explicitly active after.
      profiles = await base44.asServiceRole.entities.Profile.filter({ username }, '-updated_date', 1);
      if (profiles && profiles.length && profiles[0].is_active !== true) {
        return Response.json({ profile: null, not_found: true }, { status: 404 });
      }
    }

    if (!profiles || profiles.length === 0) {
      return Response.json({ profile: null, not_found: true }, { status: 404 });
    }

    const profile = profiles[0];

    // Require exactly one active ProfileAccess record. Missing, duplicate, locked,
    // expired, or malformed-expiry access all fail closed with an IDENTICAL 404 body
    // so callers cannot distinguish between the states (no enumeration leak).
    const NOT_FOUND = Response.json({ profile: null, not_found: true }, { status: 404 });
    const access = await base44.asServiceRole.entities.ProfileAccess.filter({ profile_id: profile.id });
    if (!access || access.length === 0) {
      return NOT_FOUND;
    }
    if (access.length > 1) {
      // Configuration conflict — fail closed; admin must resolve.
      return NOT_FOUND;
    }
    const accessRecord = access[0];
    if (accessRecord.access_status !== 'active') {
      return NOT_FOUND;
    }
    // Enforce entitlement expiry using SERVER TIME only. A past (or exactly
    // current) expiry fails closed. A malformed expiry also fails closed and is
    // audited as a configuration error (the audit is the only side channel; the
    // public response stays identical to every other 404).
    const expiry = accessRecord.expires_at;
    if (expiry !== undefined && expiry !== null && expiry !== '') {
      const expiryMs = Date.parse(expiry);
      if (Number.isNaN(expiryMs)) {
        try {
          await base44.asServiceRole.entities.AdminAuditLog.create({
            action: 'public_profile_malformed_expiry',
            performed_by: 'system',
            target_type: 'ProfileAccess',
            target_id: accessRecord.id,
            notes: `profile_id=${profile.id} expires_at=${String(expiry).slice(0, 50)}`,
          });
        } catch (e) { console.error(`[getPublicProfile] malformed-expiry audit failed`, e.message); }
        return NOT_FOUND;
      }
      if (expiryMs <= Date.now()) {
        return NOT_FOUND;
      }
    }

    // Apply privacy + public-field allowlist (server-side, not only visual).
    // pickPublicProfileFields also revalidates legacy custom link / payment URLs.
    const publicProfile = pickPublicProfileFields(profile, profile.privacy_settings || {});

    return Response.json({ profile: publicProfile });
  } catch (error) {
    console.error(`[getPublicProfile] [${correlationId}]`, error.message);
    return Response.json({ error: 'internal_error', correlation_id: correlationId }, { status: 500 });
  }
});