import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's subscription to find plan
    const subscriptions = await base44.entities.Subscription.filter({
      customer_email: user.email,
      status: { $in: ['active', 'free'] }
    });

    const subscription = subscriptions[0] || null;
    let planName = subscription?.plan || 'free';
    if (planName === 'pro') planName = 'professional'; // normalize legacy

    const features = getInheritedFeatures(planName);

    return Response.json({
      user_id: user.id,
      plan: planName,
      features
    });
  } catch (error) {
    console.error('getUserFeatures error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

/**
 * Stacked feature inheritance.
 * Each plan includes all features from lower tiers + its own.
 */
function getInheritedFeatures(planName) {
  // Base features every authenticated user gets
  const base = ['profile', 'public_profile', 'qr_code', 'contact_sharing', 'social_links', 'whatsapp_button'];

  // Professional tier features (level 1+)
  const professional = [
    ...base,
    'nfc_activation', 'appointments', 'lead_collection', 'analytics', 'portfolio',
    'custom_branding', 'save_contact', 'qr_download', 'lost_mode', 'digital_resume',
    'instagram_integration', 'business_hours', 'calendar'
  ];

  // Industry tier features (level 2+) — added on top of professional
  const industryBase = [
    ...professional,
    'team_members', 'google_review_link', 'whatsapp_booking',
    'advanced_analytics', 'lead_export'
  ];

  const hierarchy = {
    free: base,

    professional,

    business: [
      ...industryBase,
      'service_menu', 'nfc_counter_stand'
    ],

    salon: [
      ...industryBase,
      'salon_profile', 'staff_profiles', 'service_menu', 'nfc_counter_stand', 'instagram_showcase'
    ],

    restaurant: [
      ...industryBase,
      'restaurant_profile', 'digital_menu', 'food_order_link', 'delivery_link',
      'service_menu', 'nfc_counter_stand'
    ],

    // Law Firm (level 3) — inherits professional + industry base + legal features
    lawfirm: [
      ...industryBase,
      'staff_profiles',
      'law_firm_profile', 'attorney_profiles', 'practice_areas', 'legal_services',
      'crm_pipeline', 'client_intake', 'consultation_form', 'admin_roles'
    ],

    // Corporate (level 4) — inherits everything + corporate features
    corporate: [
      ...industryBase,
      'staff_profiles',
      'law_firm_profile', 'attorney_profiles', 'practice_areas', 'legal_services',
      'crm_pipeline', 'client_intake', 'consultation_form', 'admin_roles',
      'employee_profiles', 'attendance_dashboard', 'attendance'
    ],
  };

  return hierarchy[planName] || base;
}