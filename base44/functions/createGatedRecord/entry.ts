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
  MenuItem:       'digital_menu',
  AttendanceLog:  'attendance',
};

// Max team members per plan — MUST mirror src/lib/planPermissions.js maxTeamMembers().
// Kept locally because getUserFeatures returns a feature list, not count limits.
// When the client-side plan-to-feature map is consolidated, this count map is the
// only remaining duplicate — it cannot be served by getUserFeatures.
const TEAM_MEMBER_LIMITS = {
  free: 0, professional: 0, pro: 0,
  business: 10, salon: 10, restaurant: 10,
  lawfirm: 20, corporate: 999,
};

function normalizePlan(plan) {
  if (!plan) return 'free';
  if (plan === 'pro') return 'professional';
  return TEAM_MEMBER_LIMITS[plan] !== undefined ? plan : 'free';
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

    // Reject writes to locked/archived profiles (trial_locked or archived access).
    const access = (await base44.asServiceRole.entities.ProfileAccess.filter({ profile_id }))[0];
    if (!access || access.access_status !== 'active') {
      return Response.json({ error: `Profile is ${access?.access_status || 'locked'}` }, { status: 403 });
    }

    // ── Entitlement: invoke getUserFeatures (single server-side authority) ──────
    // Eliminates the redundant PLAN_FEATURES copy — getUserFeatures resolves the
    // plan from the Subscription entity and returns the authoritative feature list.
    // Profile.plan is owner-writable and must NEVER be used for entitlement.
    const result = await base44.functions.invoke('getUserFeatures', {});
    const featuresData = result?.data || result;
    const userFeatures = featuresData?.features || [];
    const userPlan = normalizePlan(featuresData?.plan || 'free');

    if (!userFeatures.includes(featureKey)) {
      return Response.json({
        error: `Your current plan (${userPlan}) does not include this feature. Please upgrade to unlock it.`,
      }, { status: 403 });
    }

    // Enforce count limits for entities that have one (currently: TeamMember).
    if (entity_name === 'TeamMember') {
      const existing = await base44.asServiceRole.entities.TeamMember.filter({ profile_id });
      const limit = TEAM_MEMBER_LIMITS[userPlan] ?? 0;
      if (existing.length >= limit) {
        return Response.json({
          error: `You've reached the team member limit for your ${userPlan} plan (${limit}). Upgrade to add more.`,
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