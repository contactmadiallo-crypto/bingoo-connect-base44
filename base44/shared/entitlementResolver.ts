// base44/shared/entitlementResolver.ts
// Single source of truth for plan → features resolution + PlanEntitlement loading.
// Imported by getUserFeatures, createGatedRecord, createProfileGated, updateProfileGated.
//
// Mirrors src/lib/planPermissions.js (PLAN_CAPABILITIES). When adding/changing a
// feature, update planPermissions.js FIRST, then mirror here.
//
// Inheritance:
//   free         → base only
//   professional → free + professional
//   business     → free + professional + business
//   salon        → business + salon-specific
//   restaurant   → professional + restaurant-specific (does NOT inherit business)
//   lawfirm      → business + lawfirm-specific
//   corporate    → business + corporate-specific (does NOT inherit lawfirm)

// ── Test Account Overrides (must stay in sync with src/lib/testAccounts.js) ──
const TEST_ACCOUNT_OVERRIDES = {
  'contact.madiallo@gmail.com':          { plan: null,           role: 'admin_switcher', protected: true },
  'mdiallo9225@gmail.com':               { plan: 'lawfirm',      protected: true },
  'msfall0510@gmail.com':                { plan: 'salon',        protected: true },
  'skilibeng110@gmail.com':              { plan: 'professional', protected: true },
  '9ztjvf42zs@privaterelay.appleid.com': { plan: 'professional', protected: true },
  'kvartz.alexander@googlemail.com':     { plan: 'professional', protected: true },
};

export function getTestOverride(email) {
  if (!email) return null;
  return TEST_ACCOUNT_OVERRIDES[email.toLowerCase()] || null;
}

const FREE = [
  'profile', 'public_profile', 'qr_code', 'contact_sharing', 'social_links', 'whatsapp_button',
];

const PROFESSIONAL = [
  ...FREE,
  'nfc_devices', 'lost_mode',
  'lead_collection', 'analytics', 'appointment_booking', 'save_contact',
  'portfolio', 'custom_branding', 'qr_download',
  'instagram_integration', 'calendar',
  'google_wallet_pass', 'apple_wallet_pass',
];

const BUSINESS = [
  ...PROFESSIONAL,
  'business_hours', 'business_profile', 'design_studio', 'services', 'product_showcase',
  'nfc_counter_stand', 'google_reviews', 'whatsapp_booking', 'team_members', 'staff_cards',
  'customer_inquiry', 'multi_profile', 'business_qr_landing', 'advanced_analytics', 'lead_export',
];

const SALON = [
  ...BUSINESS,
  'business_hours', 'salon_profile', 'staff_profiles', 'services', 'instagram_gallery',
  'google_reviews', 'whatsapp_booking', 'nfc_counter_stand', 'team_members',
  'advanced_analytics', 'lead_export',
];

const RESTAURANT = [
  ...PROFESSIONAL,
  'business_hours', 'restaurant_profile', 'digital_menu', 'delivery_links', 'food_ordering',
  'google_reviews', 'reservations', 'whatsapp_ordering', 'whatsapp_booking',
  'nfc_table_stand', 'nfc_counter_stand', 'team_members', 'advanced_analytics', 'lead_export',
];

const LAWFIRM = [
  ...BUSINESS,
  'business_hours', 'law_firm_profile', 'practice_areas', 'attorney_profiles', 'staff_profiles',
  'legal_services', 'office_locations', 'team_members', 'lead_intake_forms', 'crm_pipeline',
  'case_dashboard', 'admin_roles', 'advanced_analytics', 'lead_export',
  'immigration_forms', 'criminal_forms', 'civil_forms', 'family_forms',
];

const CORPORATE = [
  ...BUSINESS,
  'api_access', 'bulk_nfc_orders', 'custom_onboarding', 'employee_profiles',
  'attendance', 'attendance_dashboard',
];

export const PLAN_FEATURES = {
  free: FREE,
  professional: PROFESSIONAL,
  pro: PROFESSIONAL,
  business: BUSINESS,
  salon: SALON,
  restaurant: RESTAURANT,
  lawfirm: LAWFIRM,
  corporate: CORPORATE,
};

export function normalizePlan(plan) {
  if (!plan) return 'free';
  if (plan === 'pro') return 'professional';
  if (PLAN_FEATURES[plan]) return plan;
  return 'free';
}

export function downgradedPlan(_plan) {
  // A canceled, incomplete, unpaid, or otherwise terminal subscription never
  // grants a paid fallback tier. Category/plan selection is not entitlement.
  return 'free';
}

export function featuresForPlan(planName) {
  return PLAN_FEATURES[normalizePlan(planName)] || FREE;
}

// Resolve the effective plan for an arbitrary owner (the resource owner), from
// their Subscription records. This lets createGatedRecord resolve the RESOURCE's
// entitlement (not the calling user's), so an admin acting on a free user's
// profile cannot unlock paid features via the admin's own plan.
export function resolveEffectivePlan(subscriptions, ownerEmail) {
  const override = getTestOverride(ownerEmail);
  if (override && override.protected && override.plan) {
    return { plan: normalizePlan(override.plan), subscription: null, is_test_account: true };
  }
  const sub = (subscriptions && subscriptions[0]) || null;
  if (!sub) return { plan: 'free', subscription: null, is_test_account: !!override };
  let p = 'free';
  if (sub.status === 'active' || sub.status === 'trialing' || sub.status === 'past_due') {
    p = normalizePlan(sub.plan);
  } else if (override && override.protected) {
    p = normalizePlan(sub.plan);
  } else {
    // canceled / terminal → tiered downgrade (protected accounts never downgrade)
    p = downgradedPlan(normalizePlan(sub.plan));
  }
  return { plan: p, subscription: sub, is_test_account: !!override };
}

// Load the single active PlanEntitlement for a plan. Fails closed on missing
// (403) or duplicate-active conflict (409).
export async function loadPlanEntitlement(base44, planName) {
  const ents = await base44.asServiceRole.entities.PlanEntitlement.filter({
    plan_name: planName, is_active: true,
  });
  if (!ents || ents.length === 0) return { entitlement: null, error: 'missing' };
  if (ents.length > 1) return { entitlement: null, error: 'conflict' };
  return { entitlement: ents[0], error: null };
}

// ── Resource-specific entitlement resolution ──────────────────────────────────
// Authorization chain:  resource → access record → subscription/trial → PlanEntitlement
//
// Each ProfileAccess / RestaurantAccess may pin the specific Subscription
// governing that resource (subscription_id), so one owner can hold resources on
// different plans / trials / expiry dates. The resolver:
//   1. Loads access records for the resource. Requires EXACTLY ONE active
//      access record — zero → locked (fail closed), >1 → conflict (fail closed).
//      (Restaurants with NO RestaurantAccess records yet fall back to the
//       legacy owner-account path until backfilled — see `usedLegacyNoAccess`.)
//   2. Resolves the effective plan:
//        - access.subscription_id → load that Subscription by id (fail closed
//          if the referenced subscription is missing)
//        - else access.plan_name (admin_override / trial without Stripe sub)
//        - else (legacy, no ref) → owner-account subscription fallback
//      Honors access.expires_at (past expiry → locked for mutation).
//   3. Loads the single active PlanEntitlement for the plan — fail closed on
//      missing or duplicate.
//
// Returns { ok, status, error, reason, plan, entitlement, accessRecord,
//           subscription, usedFallback, usedLegacyNoAccess }.
//
// PLATFORM LIMITATION (honest): Base44 does not expose DB transactions or
// unique constraints to backend functions, so "exactly one active access
// record" is enforced by a read filter, not a DB-level unique constraint.
// Concurrent writes could in principle create a transient duplicate; the
// duplicate is detected on the next resolution and fails closed. This is
// deterministic reconciliation, not an atomic guarantee.
export async function resolveResourceEntitlement(base44, opts) {
  const { scope, scopeId, ownerEmailFallback } = opts; // 'profile' | 'restaurant'
  const isRestaurant = scope === 'restaurant';
  const AccessEntity = isRestaurant
    ? base44.asServiceRole.entities.RestaurantAccess
    : base44.asServiceRole.entities.ProfileAccess;
  const filterKey = isRestaurant ? { restaurant_id: scopeId } : { profile_id: scopeId };

  let accessRecord = null;
  let usedLegacyNoAccess = false;
  try {
    const accessList = await AccessEntity.filter(filterKey);
    if (accessList && accessList.length > 0) {
      const active = accessList.filter((a) => a.access_status === 'active');
      if (active.length === 0) {
        return { ok: false, status: 403, error: 'resource_locked', reason: 'no_active_access' };
      }
      if (active.length > 1) {
        return { ok: false, status: 409, error: 'access_conflict', reason: 'duplicate_active_access' };
      }
      accessRecord = active[0];
    } else if (!isRestaurant) {
      // Profiles REQUIRE an access record (fail closed). Restaurants fall back
      // until RestaurantAccess is backfilled (legacy migration gate).
      return { ok: false, status: 403, error: 'resource_locked', reason: 'no_access_record' };
    } else {
      usedLegacyNoAccess = true;
    }
  } catch (e) {
    return { ok: false, status: 500, error: 'internal_error', reason: 'access_lookup_failed' };
  }

  // ── Resolve plan from the access record (or legacy fallback) ──
  let planName = null;
  let subscription = null;
  let usedFallback = false;

  if (accessRecord) {
    if (accessRecord.expires_at && new Date(accessRecord.expires_at).getTime() < Date.now()) {
      return { ok: false, status: 403, error: 'resource_locked', reason: 'entitlement_expired' };
    }
    if (accessRecord.subscription_id) {
      try {
        subscription = await base44.asServiceRole.entities.Subscription.get(accessRecord.subscription_id);
      } catch { subscription = null; }
      if (!subscription) {
        return { ok: false, status: 403, error: 'entitlement_missing', reason: 'subscription_not_found' };
      }
      const { plan } = resolveEffectivePlan([subscription], accessRecord.owner_email || ownerEmailFallback);
      planName = plan;
    } else if (accessRecord.plan_name) {
      planName = normalizePlan(accessRecord.plan_name);
    } else {
      // Legacy record without a ref → owner-account fallback (documented).
      usedFallback = true;
      const subs = ownerEmailFallback
        ? await base44.asServiceRole.entities.Subscription.filter({ customer_email: ownerEmailFallback })
        : [];
      const { plan } = resolveEffectivePlan(subs, ownerEmailFallback);
      planName = plan;
    }
  } else {
    // Restaurant with no RestaurantAccess yet → legacy owner-account fallback.
    usedFallback = true;
    const subs = ownerEmailFallback
      ? await base44.asServiceRole.entities.Subscription.filter({ customer_email: ownerEmailFallback })
      : [];
    const { plan } = resolveEffectivePlan(subs, ownerEmailFallback);
    planName = plan;
  }

  // ── Exactly one active PlanEntitlement (fail closed) ──
  const { entitlement, error: entError } = await loadPlanEntitlement(base44, planName);
  if (entError === 'missing') {
    return { ok: false, status: 403, error: 'entitlement_missing', reason: 'no_catalog_entitlement', plan: planName };
  }
  if (entError === 'conflict') {
    return { ok: false, status: 409, error: 'entitlement_conflict', reason: 'duplicate_catalog_entitlement', plan: planName };
  }

  return { ok: true, plan: planName, entitlement, accessRecord, subscription, usedFallback, usedLegacyNoAccess };
}