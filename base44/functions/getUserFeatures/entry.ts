import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Capability-based feature sets per plan.
 * MUST stay in sync with lib/planPermissions.js PLAN_CAPABILITIES.
 *
 * Rules:
 * - Industry plans inherit Professional but NOT each other
 * - Canonical feature keys are used (aliases listed in comments)
 * - Unknown plan → resolves to FREE (closed default)
 * - digital_resume removed from all plans (Resume module deprecated)
 */

// ── Test Account Overrides ──────────────────────────────────────────────────
// MUST stay in sync with src/lib/testAccounts.js
// Protected test accounts never get downgraded, regardless of Stripe status.
// The admin_switcher account reads its plan from the Subscription entity so the
// admin can switch plans for testing without Stripe payment.
const TEST_ACCOUNT_OVERRIDES = {
  'contact.madiallo@gmail.com':              { plan: null,           role: 'admin_switcher', protected: true },
  'mdiallo9225@gmail.com':                   { plan: 'lawfirm',      protected: true },
  'msfall0510@gmail.com':                    { plan: 'salon',        protected: true },
  'skilibeng110@gmail.com':                  { plan: 'professional', protected: true },
  '9ztjvf42zs@privaterelay.appleid.com':     { plan: 'professional', protected: true },
  'kvartz.alexander@googlemail.com':         { plan: 'professional', protected: true },
};

function getTestOverride(email) {
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
  'instagram_integration', 'business_hours', 'calendar',
  'google_wallet_pass', 'apple_wallet_pass',
];

const BUSINESS = [
  ...PROFESSIONAL,
  'services',
  'nfc_counter_stand',
  'google_reviews',
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
  'instagram_gallery',
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
  'delivery_links',
  'food_ordering',
  'google_reviews',
  'reservations',
  'whatsapp_ordering',
  'whatsapp_booking',
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
  'lead_intake_forms',
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
  pro:          PROFESSIONAL,
  business:     BUSINESS,
  salon:        SALON,
  restaurant:   RESTAURANT,
  lawfirm:      LAWFIRM,
  corporate:    CORPORATE,
};

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
  return 'free';
}

function planScore(plan) {
  return PLAN_HIERARCHY[normalizePlan(plan)] ?? 0;
}

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

    // ── 1. Check test account overrides first ──────────────────────────────
    const override = getTestOverride(user.email);

    // Protected accounts with a hardcoded plan always get that plan,
    // regardless of Subscription entity or Stripe status.
    if (override && override.protected && override.plan) {
      const planName = normalizePlan(override.plan);
      const features = PLAN_FEATURES[planName] || FREE;
      return Response.json({
        user_id: user.id,
        plan: planName,
        features,
        subscription_plan: planName,
        is_test_account: true,
      });
    }

    // ── 2. Fetch subscription ──────────────────────────────────────────────
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
        // Protected test accounts always keep their plan regardless
        subPlan = normalizePlan(subscription.plan);
      } else {
        // 'canceled' or terminal status: apply tiered downgrade policy
        // BUT protected test accounts never downgrade
        if (override?.protected) {
          subPlan = normalizePlan(subscription.plan);
        } else {
          subPlan = downgradedPlan(normalizePlan(subscription.plan));
        }
      }
    } else {
      // No subscription record.
      // Existing users who already have profiles → Professional (temporary,
      // so current testing is not blocked).
      // New users with no profiles → Free (normal subscription rules).
      // Test accounts use their override above, so they skip this block.
      if (!override) {
        try {
          const profiles = await base44.entities.Profile.filter({ created_by_id: user.id });
          if (profiles.length > 0) {
            subPlan = 'professional';
          }
        } catch (e) {
          // If profile query fails, default to free
        }
      }
    }

    const planName = subPlan;
    const features = PLAN_FEATURES[planName] || FREE;

    return Response.json({
      user_id: user.id,
      plan: planName,
      features,
      subscription_plan: subPlan,
      is_test_account: !!override,
    });
  } catch (error) {
    console.error('getUserFeatures error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});