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

    // ── Entitlement: check lead_collection feature via getUserFeatures ──
    if (!isAdmin) {
      const featResult = await base44.functions.invoke('getUserFeatures', {});
      const featData = featResult?.data || featResult;
      const userFeatures = featData?.features || [];
      if (!userFeatures.includes('lead_collection')) {
        return Response.json({
          error: 'Your current plan does not include lead collection. Please upgrade to unlock it.',
        }, { status: 403 });
      }
    }

    // Fetch leads with service role — bypasses RLS so the owner always sees every lead
    // submitted via the public contact form (created by the service account).
    const leads = await base44.asServiceRole.entities.Lead.filter(
      { profile_id: profileId },
      '-created_date',
      500
    );

    return Response.json({ leads, count: leads.length });
  } catch (error) {
    console.error('getMyLeads error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});