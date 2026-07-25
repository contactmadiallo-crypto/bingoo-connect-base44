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

const INDUSTRY_PLANS = ['salon', 'restaurant', 'lawfirm', 'business', 'corporate'];
export function downgradedPlan(plan) {
  return INDUSTRY_PLANS.includes(plan) ? 'professional' : 'free';
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