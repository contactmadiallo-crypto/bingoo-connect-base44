import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const PAID_PLANS = new Set(['professional', 'pro', 'business', 'salon', 'restaurant', 'lawfirm', 'corporate']);

function normalizePlan(plan) {
  const value = String(plan || 'free').toLowerCase().trim();
  if (value === 'pro') return 'professional';
  return PAID_PLANS.has(value) ? value : 'free';
}

async function getEffectivePlan(base44, profile) {
  const ownerUserId = profile?.created_by_id;
  if (!ownerUserId) return normalizePlan(profile?.plan);

  try {
    const owner = await base44.asServiceRole.entities.User.get(ownerUserId);
    if (owner?.email) {
      const subs = await base44.asServiceRole.entities.Subscription.filter({ customer_email: owner.email });
      const active = (subs || []).find((sub) => ['active', 'trialing', 'past_due'].includes(sub?.status));
      if (active?.plan) return normalizePlan(active.plan);
    }
  } catch (error) {
    console.error('getPublicProfileCategory subscription lookup failed:', error?.message || error);
  }

  return normalizePlan(profile?.plan);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { profile_id } = await req.json();

    if (!profile_id) {
      return Response.json({ error: 'profile_id is required' }, { status: 400 });
    }

    const profile = await base44.asServiceRole.entities.Profile.get(profile_id);
    if (!profile || profile.is_active === false) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    const effectivePlan = await getEffectivePlan(base44, profile);

    return Response.json({
      profile_category: profile.profile_category || null,
      profile_type: profile.profile_type || null,
      effective_plan: effectivePlan,
      plan: effectivePlan,
    });
  } catch (error) {
    console.error('getPublicProfileCategory error:', error?.message || error);
    return Response.json({ error: 'Unable to load profile category' }, { status: 500 });
  }
});
