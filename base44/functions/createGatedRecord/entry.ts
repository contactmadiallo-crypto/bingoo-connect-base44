import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Allowlist of entities that require a plan feature to create.
// Maps entity name -> feature key required to create records of that type.
const ALLOWED_ENTITIES = {
  TeamMember:     'team_members',
  LegalService:   'legal_services',
  PracticeArea:   'practice_areas',
  OfficeLocation: 'office_locations',
};

// Minimal server-side copy of plan -> feature entitlement (mirrors src/lib/planPermissions.js).
const PLAN_FEATURES = {
  free:         [],
  professional: [],
  pro:          [],
  business:     ['team_members'],
  salon:        ['team_members'],
  restaurant:   ['team_members'],
  lawfirm:      ['team_members', 'legal_services', 'practice_areas', 'office_locations'],
  corporate:    ['team_members', 'legal_services', 'practice_areas', 'office_locations'],
};

function normalizePlan(plan) {
  if (!plan) return 'free';
  if (plan === 'pro') return 'professional';
  return PLAN_FEATURES[plan] ? plan : 'free';
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

    const plan = normalizePlan(profile.plan);
    const allowedFeatures = PLAN_FEATURES[plan] || [];
    if (!allowedFeatures.includes(featureKey)) {
      return Response.json({
        error: `Your current plan (${plan}) does not include this feature. Please upgrade to unlock it.`,
      }, { status: 403 });
    }

    const created = await base44.asServiceRole.entities[entity_name].create({ ...data, profile_id });
    return Response.json({ record: created });
  } catch (error) {
    console.error('createGatedRecord error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});