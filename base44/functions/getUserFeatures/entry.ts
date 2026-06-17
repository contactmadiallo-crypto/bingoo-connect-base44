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

function normalizePlan(plan) {
  if (!plan) return 'free';
  if (plan === 'pro') return 'professional';
  if (PLAN_FEATURES[plan]) return plan;
  return 'free'; // unknown plan → free (secure default)
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
    let planName = 'free';

    if (subscription) {
      if (subscription.status === 'canceled') {
        planName = 'free';
      } else if (subscription.status === 'past_due') {
        // Grace period — keep current plan access
        planName = normalizePlan(subscription.plan);
      } else if (subscription.status === 'active') {
        planName = normalizePlan(subscription.plan);
      }
      // 'free' status → stays free
    }

    const features = PLAN_FEATURES[planName] || FREE;

    return Response.json({
      user_id: user.id,
      plan: planName,
      features,
    });
  } catch (error) {
    console.error('getUserFeatures error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});