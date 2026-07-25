import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Allowlist of entities that require a plan feature to mutate (create/update/delete).
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

// Profile-scoped entities use profile_id; restaurant-scoped use restaurant_id.
const RESTAURANT_SCOPED = new Set(['MenuItem']);

// Max team members per plan — mirrors src/lib/planPermissions.js maxTeamMembers().
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

    const { entity_name, profile_id, restaurant_id, data, op = 'create', record_id } = await req.json();

    const featureKey = ALLOWED_ENTITIES[entity_name];
    if (!featureKey) return Response.json({ error: 'Invalid or unsupported entity' }, { status: 400 });
    if (!['create', 'update', 'delete'].includes(op)) return Response.json({ error: 'Invalid op' }, { status: 400 });

    const isRestaurantScoped = RESTAURANT_SCOPED.has(entity_name);
    const scopeId = isRestaurantScoped ? restaurant_id : profile_id;
    if (!scopeId) return Response.json({ error: isRestaurantScoped ? 'restaurant_id is required' : 'profile_id is required' }, { status: 400 });

    // ── Ownership + access verification ──────────────────────────────────────────
    if (isRestaurantScoped) {
      const restaurant = await base44.asServiceRole.entities.Restaurant.get(scopeId);
      if (!restaurant) return Response.json({ error: 'Restaurant not found' }, { status: 404 });
      if (restaurant.created_by_id !== user.id && user.role !== 'admin') {
        return Response.json({ error: 'You do not own this restaurant' }, { status: 403 });
      }
    } else {
      const profile = await base44.asServiceRole.entities.Profile.get(scopeId);
      if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 });
      if (profile.created_by_id !== user.id && user.role !== 'admin') {
        return Response.json({ error: 'You do not own this profile' }, { status: 403 });
      }
      // Reject writes to locked/archived profiles.
      const access = (await base44.asServiceRole.entities.ProfileAccess.filter({ profile_id: scopeId }))[0];
      if (!access || access.access_status !== 'active') {
        return Response.json({ error: `Profile is ${access?.access_status || 'locked'}` }, { status: 403 });
      }
    }

    // ── Entitlement (single server-side authority) ──────────────────────────────
    const result = await base44.functions.invoke('getUserFeatures', {});
    const featuresData = result?.data || result;
    const userFeatures = featuresData?.features || [];
    const userPlan = normalizePlan(featuresData?.plan || 'free');

    if (!userFeatures.includes(featureKey)) {
      return Response.json({
        error: `Your current plan (${userPlan}) does not include this feature. Please upgrade to unlock it.`,
      }, { status: 403 });
    }

    const Entity = base44.asServiceRole.entities[entity_name];

    // ── UPDATE ──────────────────────────────────────────────────────────────────
    if (op === 'update') {
      if (!record_id) return Response.json({ error: 'record_id required for update' }, { status: 400 });
      const existing = await Entity.get(record_id);
      if (!existing) return Response.json({ error: 'Record not found' }, { status: 404 });
      // Scope integrity: the record must belong to the claimed scope.
      const recordScope = isRestaurantScoped ? existing.restaurant_id : existing.profile_id;
      if (recordScope !== scopeId) return Response.json({ error: 'Record scope mismatch' }, { status: 403 });
      const updated = await Entity.update(record_id, data);
      return Response.json({ record: updated });
    }

    // ── DELETE ──────────────────────────────────────────────────────────────────
    if (op === 'delete') {
      if (!record_id) return Response.json({ error: 'record_id required for delete' }, { status: 400 });
      const existing = await Entity.get(record_id);
      if (!existing) return Response.json({ error: 'Record not found' }, { status: 404 });
      const recordScope = isRestaurantScoped ? existing.restaurant_id : existing.profile_id;
      if (recordScope !== scopeId) return Response.json({ error: 'Record scope mismatch' }, { status: 403 });
      await Entity.delete(record_id);
      return Response.json({ record: null, deleted: true });
    }

    // ── CREATE ───────────────────────────────────────────────────────────────────
    // Count limits for TeamMember.
    if (entity_name === 'TeamMember') {
      const existing = await Entity.filter({ profile_id: scopeId });
      const limit = TEAM_MEMBER_LIMITS[userPlan] ?? 0;
      if (existing.length >= limit) {
        return Response.json({
          error: `You've reached the team member limit for your ${userPlan} plan (${limit}). Upgrade to add more.`,
        }, { status: 403 });
      }
    }
    const payload = isRestaurantScoped
      ? { ...data, restaurant_id: scopeId }
      : { ...data, profile_id: scopeId };
    const created = await Entity.create(payload);
    return Response.json({ record: created });
  } catch (error) {
    console.error('createGatedRecord error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});