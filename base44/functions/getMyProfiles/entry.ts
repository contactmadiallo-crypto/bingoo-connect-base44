import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { pickOwnerProfileFields } from '../../shared/profileSanitizer.ts';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const requestedProfileId = body?.profile_id || null;
    const accessRows = await base44.asServiceRole.entities.ProfileAccess.filter({ owner_user_id: user.id });
    const activeAccess = (accessRows || []).filter((row) =>
      row.owner_user_id === user.id && row.access_status === 'active' && row.profile_id,
    );

    const profiles = [];
    for (const access of activeAccess) {
      if (requestedProfileId && access.profile_id !== requestedProfileId) continue;
      const profile = await base44.asServiceRole.entities.Profile.get(access.profile_id).catch(() => null);
      if (!profile || profile.is_active === false) continue;
      const ownerProfile = pickOwnerProfileFields(profile, access, access.plan_name || profile.plan || 'free');
      ownerProfile.created_date = profile.created_date;
      ownerProfile.updated_date = profile.updated_date;
      ownerProfile.is_active = profile.is_active !== false;
      profiles.push(ownerProfile);
    }

    if (requestedProfileId) {
      if (!profiles.length) return Response.json({ error: 'Profile not found' }, { status: 404 });
      return Response.json({ profile: profiles[0] });
    }
    return Response.json({ profiles });
  } catch (error) {
    console.error('getMyProfiles error:', error);
    return Response.json({ error: 'internal_error' }, { status: 500 });
  }
});
