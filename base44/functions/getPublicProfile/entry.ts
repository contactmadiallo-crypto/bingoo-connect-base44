import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { username } = body;

    if (!username) {
      return Response.json({ error: 'Username is required' }, { status: 400 });
    }

    // Use service role so unauthenticated (public) visitors can load profiles
    const profiles = await base44.asServiceRole.entities.Profile.filter({
      username: username,
      is_active: true,
    });

    if (!profiles || profiles.length === 0) {
      return Response.json({ profile: null });
    }

    return Response.json({ profile: profiles[0] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});