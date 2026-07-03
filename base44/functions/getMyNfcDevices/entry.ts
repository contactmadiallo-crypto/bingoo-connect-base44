import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Require authenticated user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user's owned profile IDs from the database (authoritative source,
    // not the possibly-stale auth token).
    const freshUser = await base44.asServiceRole.entities.User.get(user.id);
    const ownedProfileIds = freshUser?.owned_profile_ids || [];

    // Also fetch profiles the user created (in case owned_profile_ids is stale)
    const ownedProfiles = await base44.asServiceRole.entities.Profile.filter({ created_by_id: user.id });
    const ownedProfileIdsFromQuery = ownedProfiles.map(p => p.id);

    // Union both sources
    const allProfileIds = [...new Set([...ownedProfileIds, ...ownedProfileIdsFromQuery])];

    if (allProfileIds.length === 0) {
      return Response.json({ devices: [] });
    }

    // Fetch ALL devices for these profiles using service role (bypasses RLS).
    // This ensures activated devices always show up regardless of token state.
    const deviceResults = await Promise.all(
      allProfileIds.map(pid =>
        base44.asServiceRole.entities.NFCDevice.filter({ profile_id: pid })
      )
    );

    // Flatten, deduplicate (a device could match if profile_id appears in multiple sets),
    // and sort by assigned_at descending (most recent first).
    const seen = new Set();
    const devices = deviceResults
      .flat()
      .filter(d => {
        if (seen.has(d.id)) return false;
        seen.add(d.id);
        return true;
      })
      .sort((a, b) => {
        const ad = a.assigned_at ? new Date(a.assigned_at).getTime() : 0;
        const bd = b.assigned_at ? new Date(b.assigned_at).getTime() : 0;
        return bd - ad;
      });

    // Return profile names for display
    const profileMap = {};
    ownedProfiles.forEach(p => { profileMap[p.id] = p.display_name; });

    return Response.json({
      devices,
      profile_names: profileMap,
      profile_ids: allProfileIds,
    });
  } catch (error) {
    console.error('[getMyNfcDevices] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});