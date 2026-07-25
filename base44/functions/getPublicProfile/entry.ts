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

    // Try active profiles first
    let profiles = await base44.asServiceRole.entities.Profile.filter({
      username: username,
      is_active: true,
    }, '-updated_date', 1);

    console.log(`[getPublicProfile] username="${username}" is_active:true → found ${profiles?.length ?? 0} profiles`);

    // Fallback: try without is_active filter (handles null/undefined is_active)
    if (!profiles || profiles.length === 0) {
      profiles = await base44.asServiceRole.entities.Profile.filter(
        { username },
        '-updated_date',
        1
      );
      console.log(`[getPublicProfile] fallback (no is_active filter) → found ${profiles?.length ?? 0}`);
    }

    if (!profiles || profiles.length === 0) {
      console.log(`[getPublicProfile] NOT FOUND for username="${username}" — returning 404`);
      // Return true 404 so the frontend can detect "not found" vs "error"
      return Response.json({ profile: null, not_found: true }, { status: 404 });
    }

    const profile = profiles[0];

    // Enforce ProfileAccess access_status: locked/archived profiles are NOT public.
    const access = await base44.asServiceRole.entities.ProfileAccess.filter({ profile_id: profile.id });
    const accessRec = access?.[0];
    if (accessRec && accessRec.access_status !== 'active') {
      console.log(`[getPublicProfile] profile id=${profile.id} access_status=${accessRec.access_status} → 404`);
      return Response.json({ profile: null, not_found: true }, { status: 404 });
    }

    // Apply privacy + public-field allowlist (server-side, not only visual).
    const publicProfile = pickPublicProfileFields(profile, profile.privacy_settings || {});

    console.log(`[getPublicProfile] returning profile id=${profile?.id} username=${profile?.username} is_active=${profile.is_active}`);
    return Response.json({ profile: publicProfile });
  } catch (error) {
    console.error(`[getPublicProfile] error:`, error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});