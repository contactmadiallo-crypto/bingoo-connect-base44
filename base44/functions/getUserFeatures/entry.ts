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

    if (!subscriptions.length) {
      return Response.json({ features: getInheritedFeatures('free'), plan: 'free' });
    }

    const subscription = subscriptions[0];
    let planName = subscription.plan || 'free';

    // Get all features for this plan via PlanFeature junction table
    const planFeatures = await base44.asServiceRole.entities.PlanFeature.filter({
      plan_name: planName
    });

    const featureKeys = planFeatures.map(pf => pf.feature_key).filter(Boolean);

    // Get inherited features based on plan hierarchy
    const inheritedFeatures = getInheritedFeatures(planName);
    const allFeatureKeys = [...new Set([...featureKeys, ...inheritedFeatures])];

    return Response.json({
      user_id: user.id,
      plan: planName,
      features: allFeatureKeys
    });
  } catch (error) {
    console.error('getUserFeatures error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// Feature inheritance hierarchy
function getInheritedFeatures(planName) {
  const hierarchy = {
    free: [],
    professional: ['profile', 'public_profile', 'qr_code', 'contact_sharing', 'social_links', 'whatsapp_button'],
    pro: ['profile', 'public_profile', 'qr_code', 'contact_sharing', 'social_links', 'whatsapp_button', 'nfc_activation', 'appointments', 'lead_collection', 'analytics', 'portfolio', 'custom_branding', 'save_contact', 'qr_download'],
    salon: ['profile', 'public_profile', 'qr_code', 'contact_sharing', 'social_links', 'whatsapp_button', 'nfc_activation', 'appointments', 'lead_collection', 'analytics', 'portfolio', 'custom_branding', 'save_contact', 'qr_download', 'salon_profile', 'staff_profiles', 'service_menu', 'instagram_showcase'],
    restaurant: ['profile', 'public_profile', 'qr_code', 'contact_sharing', 'social_links', 'whatsapp_button', 'nfc_activation', 'appointments', 'lead_collection', 'analytics', 'portfolio', 'custom_branding', 'save_contact', 'qr_download', 'restaurant_profile', 'digital_menu', 'food_order_link', 'delivery_link'],
    lawfirm: ['profile', 'public_profile', 'qr_code', 'contact_sharing', 'social_links', 'whatsapp_button', 'nfc_activation', 'appointments', 'lead_collection', 'analytics', 'portfolio', 'custom_branding', 'save_contact', 'qr_download', 'law_firm_profile', 'attorney_profiles', 'practice_areas', 'crm_pipeline', 'client_intake'],
    corporate: ['profile', 'public_profile', 'qr_code', 'contact_sharing', 'social_links', 'whatsapp_button', 'nfc_activation', 'appointments', 'lead_collection', 'analytics', 'portfolio', 'custom_branding', 'save_contact', 'qr_download', 'employee_profiles', 'attendance_dashboard', 'admin_roles'],
    business: ['profile', 'public_profile', 'qr_code', 'contact_sharing', 'social_links', 'whatsapp_button', 'nfc_activation', 'appointments', 'lead_collection', 'analytics', 'portfolio', 'custom_branding', 'save_contact', 'qr_download']
  };
  return hierarchy[planName] || [];
}