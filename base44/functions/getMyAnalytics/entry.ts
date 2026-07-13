import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const profileId = body.profile_id;
    if (!profileId) return Response.json({ error: 'profile_id required' }, { status: 400 });

    // Verify ownership: the profile's created_by_id must match the user (admin bypasses)
    const profile = await base44.asServiceRole.entities.Profile.get(profileId);
    if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 });

    const isAdmin = user.role === 'admin';
    const isOwner = profile.created_by_id === user.id;
    if (!isOwner && !isAdmin) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ── Entitlement: check analytics feature via getUserFeatures ──
    if (!isAdmin) {
      const featResult = await base44.functions.invoke('getUserFeatures', {});
      const featData = featResult?.data || featResult;
      const userFeatures = featData?.features || [];
      if (!userFeatures.includes('analytics')) {
        return Response.json({
          error: 'Your current plan does not include analytics. Please upgrade to unlock it.',
        }, { status: 403 });
      }
    }

    // Fetch analytics with service role — bypasses RLS so the owner always sees every interaction
    const events = await base44.asServiceRole.entities.Analytics.filter(
      { profile_id: profileId },
      '-created_date',
      500
    );

    return Response.json({ events, count: events.length });
  } catch (error) {
    console.error('getMyAnalytics error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});