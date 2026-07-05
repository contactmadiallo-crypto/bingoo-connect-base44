import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Capability-based feature sets per plan.
 * MUST stay in sync with lib/planPermissions.js PLAN_CAPABILITIES.
 *
 * Rules:
 * - Industry plans inherit Professional but NOT each other
 * - Canonical feature keys are used (aliases listed in comments)
 * - Unknown plan → resolves to FREE (closed default)
 */

const FREE = [
  'profile', 'public_profile', 'qr_code', 'contact_sharing', 'social_links', 'whatsapp_button',
];

const PROFESSIONAL = [
  ...FREE,
  'nfc_devices', 'lost_mode',
  'lead_collection', 'analytics', 'appointment_booking', 'save_contact',
  'portfolio', 'custom_branding', 'qr_download', 'digital_resume',
  'instagram_integration', 'business_hours', 'calendar',
  'google_wallet_pass', 'apple_wallet_pass',
];

const BUSINESS = [
  ...PROFESSIONAL,
  'services',           // canonical (was service_menu / menu_services)
  'nfc_counter_stand',
  'google_reviews',     // canonical (was google_review_link)
  'whatsapp_booking',
  'team_members',
  'advanced_analytics',
  'lead_export',
];

const SALON = [
  ...PROFESSIONAL,
  'salon_profile',
  'staff_profiles',
  'services',
  'instagram_gallery',  // canonical (was instagram_showcase)
  'google_reviews',
  'whatsapp_booking',
  'nfc_counter_stand',
  'team_members',
  'advanced_analytics',
  'lead_export',
];

const RESTAURANT = [
  ...PROFESSIONAL,
  'restaurant_profile',
  'digital_menu',
  'delivery_links',     // canonical (was delivery_link)
  'food_ordering',      // canonical (was food_order_link)
  'google_reviews',
  'reservations',
  'whatsapp_ordering',
  'whatsapp_booking',   // kept for backward compat
  'nfc_table_stand',
  'nfc_counter_stand',
  'team_members',
  'advanced_analytics',
  'lead_export',
];

const LAWFIRM = [
  ...PROFESSIONAL,
  'law_firm_profile',
  'practice_areas',
  'attorney_profiles',
  'staff_profiles',
  'legal_services',
  'office_locations',
  'team_members',
  'lead_intake_forms',  // canonical (was consultation_form / client_intake)
  'crm_pipeline',
  'case_dashboard',
  'admin_roles',
  'advanced_analytics',
  'lead_export',
  'immigration_forms',
  'criminal_forms',
  'civil_forms',
  'family_forms',
];

const CORPORATE = [
  ...LAWFIRM,
  'employee_profiles',
  'attendance',
  'attendance_dashboard',
];

const PLAN_FEATURES = {
  free:         FREE,
  professional: PROFESSIONAL,
  pro:          PROFESSIONAL,   // legacy alias
  business:     BUSINESS,
  salon:        SALON,
  restaurant:   RESTAURANT,
  lawfirm:      LAWFIRM,
  corporate:    CORPORATE,
};

// Hierarchy used to pick the higher entitlement between a subscription-derived plan
// and a profile-level plan (admin override / legacy grant). MUST stay in sync with
// PLAN_HIERARCHY in lib/planPermissions.js.
const PLAN_HIERARCHY = {
  free:         0,
  professional: 1,
  pro:          1,
  business:     2,
  salon:        2,
  restaurant:   2,
  lawfirm:      3,
  corporate:    4,
};

function normalizePlan(plan) {
  if (!plan) return 'free';
  if (plan === 'pro') return 'professional';
  if (PLAN_FEATURES[plan]) return plan;
  return 'free'; // unknown plan → free (secure default)
}

function planScore(plan) {
  return PLAN_HIERARCHY[normalizePlan(plan)] ?? 0;
}

// Industry/business-tier plans fall back to Professional (not Free) when payment fails
// or a trial ends unpaid — they're built on top of Professional, so losing the paid
// upgrade should not strip the base Professional tier. Professional itself falls back to Free.
const INDUSTRY_PLANS = ['salon', 'restaurant', 'lawfirm', 'business', 'corporate'];
function downgradedPlan(plan) {
  return INDUSTRY_PLANS.includes(plan) ? 'professional' : 'free';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch subscription — it is the billing authority
    const subscriptions = await base44.entities.Subscription.filter({
      customer_email: user.email,
    });

    const subscription = subscriptions?.[0] || null;
    let subPlan = 'free';

    if (subscription) {
      if (subscription.status === 'active' || subscription.status === 'trialing') {
        subPlan = normalizePlan(subscription.plan);
      } else if (subscription.status === 'past_due') {
        // Grace period — keep current plan access
        subPlan = normalizePlan(subscription.plan);
      } else {
        // 'canceled' or any other terminal status: apply the tiered downgrade policy —
        // Business/Salon/Restaurant/Law Firm/Corporate → Professional, Professional → Free.
        subPlan = downgradedPlan(normalizePlan(subscription.plan));
      }
    }

    // Profile-level plans: an admin may grant a paid plan on a specific profile
    // (admin_override / legacy grant) without a Stripe subscription. To honor the
    // product policy that Pro/Business/industry profiles open their features, treat
    // the highest owned-profile plan as a floor — the effective plan is the max of
    // the subscription-derived plan and the best profile plan.
    const profiles = await base44.asServiceRole.entities.Profile.filter({
      created_by_id: user.id,
    });

    let bestProfilePlan = 'free';
    for (const p of profiles || []) {
      if (planScore(p?.plan) > planScore(bestProfilePlan)) {
        bestProfilePlan = normalizePlan(p?.plan);
      }
    }

    // Effective plan = higher of subscription plan and best profile plan.
    // Free stays free only when BOTH are free (i.e. no paid sub AND no paid profile grant).
    const planName = planScore(bestProfilePlan) > planScore(subPlan) ? bestProfilePlan : subPlan;

    const features = PLAN_FEATURES[planName] || FREE;

    return Response.json({
      user_id: user.id,
      plan: planName,
      features,
      subscription_plan: subPlan,
      profile_plan: bestProfilePlan,
    });
  } catch (error) {
    console.error('getUserFeatures error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});