import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Capability-based feature sets per plan.
 * Industry plans inherit Professional but NOT each other.
 * Must stay in sync with lib/planPermissions.js PLAN_CAPABILITIES.
 */

const FREE = [
  'profile', 'public_profile', 'qr_code', 'contact_sharing', 'social_links', 'whatsapp_button',
];

const PROFESSIONAL = [
  ...FREE,
  'nfc_devices', 'lost_mode',
  'lead_collection', 'analytics', 'appointment_booking', 'save_contact',
  'portfolio', 'custom_colors', 'custom_branding', 'qr_download', 'digital_resume',
  'instagram_integration', 'business_hours', 'calendar',
  'google_wallet_pass', 'apple_wallet_pass',
];

const BUSINESS = [
  ...PROFESSIONAL,
  'service_menu', 'menu_services', 'nfc_counter_stand',
  'google_review_link', 'whatsapp_booking',
  'team_members', 'advanced_analytics', 'lead_export',
];

const SALON = [
  ...PROFESSIONAL,
  'salon_profile', 'staff_profiles', 'service_menu', 'menu_services',
  'instagram_showcase', 'google_review_link', 'whatsapp_booking',
  'nfc_counter_stand', 'team_members', 'advanced_analytics', 'lead_export',
];

const RESTAURANT = [
  ...PROFESSIONAL,
  'restaurant_profile', 'digital_menu', 'food_order_link', 'delivery_link',
  'google_review_link', 'whatsapp_booking', 'nfc_counter_stand', 'nfc_table_stand',
  'team_members', 'advanced_analytics', 'lead_export',
];

const LAWFIRM = [
  ...PROFESSIONAL,
  'law_firm_profile', 'practice_areas', 'attorney_profiles', 'staff_profiles',
  'legal_services', 'office_locations', 'team_members',
  'consultation_form', 'client_intake', 'crm_pipeline', 'admin_roles',
  'advanced_analytics', 'lead_export',
  'immigration_forms', 'criminal_forms', 'civil_forms', 'family_forms',
];

const CORPORATE = [
  ...LAWFIRM,
  'employee_profiles', 'attendance', 'attendance_dashboard',
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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Resolve subscription plan
    const subscriptions = await base44.entities.Subscription.filter({
      customer_email: user.email,
    });

    const subscription = subscriptions?.[0] || null;
    let planName = 'free';

    if (subscription && subscription.status !== 'canceled') {
      planName = subscription.plan || 'free';
    }
    if (planName === 'pro') planName = 'professional'; // normalize legacy

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