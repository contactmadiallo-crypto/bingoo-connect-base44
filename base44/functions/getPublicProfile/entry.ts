import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { username } = body;

    if (!username) {
      return Response.json({ error: 'Username is required' }, { status: 400 });
    }

    // Use service role so unauthenticated (public) visitors can load profiles
    // First try with is_active: true
    let profiles = await base44.asServiceRole.entities.Profile.filter({
      username: username,
      is_active: true,
    }, '-updated_date', 1);

    console.log(`[getPublicProfile] username="${username}" is_active:true → found ${profiles?.length ?? 0} profiles`);

    // If not found, try without is_active filter (profile may have is_active=false or null/undefined)
    if (!profiles || profiles.length === 0) {
      profiles = await base44.asServiceRole.entities.Profile.filter({
        username: username,
      }, '-updated_date', 1);
      console.log(`[getPublicProfile] username="${username}" no is_active filter → found ${profiles?.length ?? 0} profiles`);
      if (profiles?.length > 0) {
        console.log(`[getPublicProfile] profile found but is_active=${profiles[0]?.is_active} — returning it anyway`);
      }
    }

    if (!profiles || profiles.length === 0) {
      console.log(`[getPublicProfile] profile NOT found for username="${username}"`);
      return Response.json({ profile: null });
    }

    console.log(`[getPublicProfile] returning profile id=${profiles[0]?.id} username=${profiles[0]?.username} is_active=${profiles[0]?.is_active}`);
    return Response.json({ profile: profiles[0] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});