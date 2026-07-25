import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { pickPublicProfileFields } from '../../shared/profileSanitizer.ts';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { username } = body;

    if (!username) {
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
    // or expired (non-active) access fails closed (404).
    const access = await base44.asServiceRole.entities.ProfileAccess.filter({ profile_id: profile.id });
    if (!access || access.length === 0) {
      return Response.json({ profile: null, not_found: true }, { status: 404 });
    }
    if (access.length > 1) {
      // Configuration conflict — fail closed; admin must resolve.
      return Response.json({ profile: null, not_found: true }, { status: 404 });
    }
    if (access[0].access_status !== 'active') {
      return Response.json({ profile: null, not_found: true }, { status: 404 });
    }

    // Apply privacy + public-field allowlist (server-side, not only visual).
    // pickPublicProfileFields also revalidates legacy custom link / payment URLs.
    const publicProfile = pickPublicProfileFields(profile, profile.privacy_settings || {});

    return Response.json({ profile: publicProfile });
  } catch (error) {
    console.error(`[getPublicProfile] error:`, error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});