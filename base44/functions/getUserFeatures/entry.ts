import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Capability-based feature sets per plan.
 *
 * SINGLE SOURCE OF TRUTH: src/lib/planPermissions.js (PLAN_CAPABILITIES).
 * This file MUST mirror the feature sets exactly. When adding/changing a
 * feature, update planPermissions.js FIRST, then mirror the change here.
 * createGatedRecord delegates to getUserFeatures (no separate copy).
 *
 * Inheritance (mirrors planPermissions.js):
 *   free         → base only
 *   professional → free + professional features
 *   business     → free + professional + business features
 *   salon        → business + salon-specific
 *   restaurant   → professional + restaurant-specific (does NOT inherit business)
 *   lawfirm      → business + lawfirm-specific
 *   corporate    → business + corporate-specific (does NOT inherit lawfirm)
 *
 * Rules:
 * - Unknown plan → resolves to FREE (closed default)
 * - Canonical feature keys are used (aliases listed in comments)
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
  'instagram_integration', 'calendar',
  'google_wallet_pass', 'apple_wallet_pass',
];

const BUSINESS = [
  ...PROFESSIONAL,
  'business_hours',
  'business_profile',
  'design_studio',
  'services',
  'product_showcase',
  'nfc_counter_stand',
  'google_reviews',
  'whatsapp_booking',
  'team_members',
  'staff_cards',
  'customer_inquiry',
  'multi_profile',
  'business_qr_landing',
  'advanced_analytics',
  'lead_export',
];

const SALON = [
  ...BUSINESS,
  'business_hours',
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
  'business_hours',
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
  ...BUSINESS,
  'business_hours',
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
  ...BUSINESS,
  'api_access',
  'bulk_nfc_orders',
  'custom_onboarding',
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
  salon:        3,
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
      // No subscription record and no test override → Free.
      // Paid entitlement comes ONLY from a real Subscription record
      // (Stripe payment or admin_override). The profile category
      // (profile.plan) is a presentation-only field and is NEVER read
      // here, so selecting "Professional" during onboarding cannot unlock
      // paid features without payment.
    }

    const planName = subPlan;
    const features = PLAN_FEATURES[planName] || FREE;

    // Debug logging — verifies server-side plan resolution per user
    console.log('[getUserFeatures] Audit:', {
      userEmail: user.email,
      userRole: user.role,
      resolvedPlan: planName,
      subscriptionStatus: subscription?.status || 'none',
      subscriptionPlan: subscription?.plan || 'none',
      planSource: subscription?.plan_source || 'none',
      isTestAccount: !!override,
      featuresCount: features.length,
    });

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