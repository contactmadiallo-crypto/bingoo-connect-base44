import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Allowlist of entities that require a plan feature to create.
// Maps entity name -> feature key required to create records of that type.
const ALLOWED_ENTITIES = {
  TeamMember:     'team_members',
  LegalService:   'legal_services',
  PracticeArea:   'practice_areas',
  OfficeLocation: 'office_locations',
  SalonService:   'services',
  PortfolioItem:  'portfolio',
};

// Minimal server-side copy of plan -> feature entitlement (mirrors src/lib/planPermissions.js).
const PLAN_FEATURES = {
  free:         [],
  professional: ['portfolio'],
  pro:          ['portfolio'],
  business:     ['team_members', 'services', 'portfolio'],
  salon:        ['team_members', 'services', 'portfolio'],
  restaurant:   ['team_members', 'portfolio'],
  lawfirm:      ['team_members', 'legal_services', 'practice_areas', 'office_locations', 'services', 'portfolio'],
  corporate:    ['team_members', 'legal_services', 'practice_areas', 'office_locations', 'services', 'portfolio'],
};

// Max team members per plan (mirrors src/lib/planPermissions.js maxTeamMembers()).
const TEAM_MEMBER_LIMITS = {
  free: 0, professional: 0, pro: 0,
  business: 10, salon: 10, restaurant: 10,
  lawfirm: 20, corporate: 999,
};

function normalizePlan(plan) {
  if (!plan) return 'free';
  if (plan === 'pro') return 'professional';
  return PLAN_FEATURES[plan] ? plan : 'free';
}

// Trusted effective plan — resolved ONLY from the Subscription entity, whose `update`
// RLS is admin-only. Profile.plan is owner-writable and must NEVER be used for entitlement.
async function getEffectivePlan(base44, user) {
  const subs = await base44.asServiceRole.entities.Subscription.filter({ customer_email: user.email });
  const sub = subs?.[0];
  if (sub && (sub.status === 'active' || sub.status === 'trialing' || sub.status === 'past_due')) {
    return normalizePlan(sub.plan);
  }
  // Legacy grace: existing users with profiles but no subscription get Professional.
  // Mirrors getUserFeatures — prevents blocking current users during subscription migration.
  try {
    const profiles = await base44.asServiceRole.entities.Profile.filter({ created_by_id: user.id });
    if (profiles.length > 0) return 'professional';
  } catch (e) { /* default to free below */ }
  return 'free';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { entity_name, profile_id, data } = await req.json();

    const featureKey = ALLOWED_ENTITIES[entity_name];
    if (!featureKey) {
      return Response.json({ error: 'Invalid or unsupported entity' }, { status: 400 });
    }
    if (!profile_id) {
      return Response.json({ error: 'profile_id is required' }, { status: 400 });
    }

    const profile = await base44.asServiceRole.entities.Profile.get(profile_id);
    if (!profile) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }
    if (profile.created_by_id !== user.id && user.role !== 'admin') {
      return Response.json({ error: 'You do not own this profile' }, { status: 403 });
    }

    // Effective plan comes only from the trusted Subscription record — never from Profile.plan.
    const plan = await getEffectivePlan(base44, user);
    const allowedFeatures = PLAN_FEATURES[plan] || [];
    if (!allowedFeatures.includes(featureKey)) {
      return Response.json({
        error: `Your current plan (${plan}) does not include this feature. Please upgrade to unlock it.`,
      }, { status: 403 });
    }

    // Enforce count limits for entities that have one (currently: TeamMember).
    if (entity_name === 'TeamMember') {
      const existing = await base44.asServiceRole.entities.TeamMember.filter({ profile_id });
      const limit = TEAM_MEMBER_LIMITS[plan] ?? 0;
      if (existing.length >= limit) {
        return Response.json({
          error: `You've reached the team member limit for your ${plan} plan (${limit}). Upgrade to add more.`,
        }, { status: 403 });
      }
    }

    const created = await base44.asServiceRole.entities[entity_name].create({ ...data, profile_id });
    return Response.json({ record: created });
  } catch (error) {
    console.error('createGatedRecord error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});