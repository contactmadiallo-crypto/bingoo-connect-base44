/**
 * Bingoo Connect — Plan Permissions (Stacked Benefits Model)
 * Each plan inherits ALL features from lower plans + adds its own.
 * Hierarchy: free(0) → professional(1) → salon/restaurant/lawfirm/corporate(2+)
 */

export const PLAN_HIERARCHY = {
   free:         0,
   professional: 1,
   pro:          1,   // legacy alias
   business:     2,
   salon:        2,
   lawfirm:      3,
};

export const PLAN_LABELS = {
   free:         'Free',
   professional: 'Professional',
   pro:          'Professional',
   business:     'Business',
   salon:        'Salon',
   lawfirm:      'Law Firm',
};

export const PLAN_COLORS = {
   free:         { bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0' },
   professional: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
   pro:          { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
   business:     { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe' },
   salon:        { bg: '#fdf2f8', text: '#be185d', border: '#fbcfe8' },
   lawfirm:      { bg: '#f0f9ff', text: '#0369a1', border: '#bae6fd' },
};

export const PLAN_PRICES_USD = {
   free:         0,
   professional: 4.99,
   business:     14.99,
   salon:        19.99,
   lawfirm:      49,
};

// Stripe product IDs (existing from catalog)
export const PLAN_STRIPE_PRODUCTS = {
   professional: 'prod_UdL2W8XwDY3Bmq',  // $4.99/mo
   business:     'prod_UdL2NqVtcHwKb2',  // $14.99/mo
   salon:        'prod_UfF46myS8RxwKE',  // $19.99/mo
   lawfirm:      'prod_UfFHNuhuWhyGVZ',  // $49.00/mo
};

/**
 * FEATURE REQUIREMENTS — uses minimum plan level (hierarchy).
 * Any plan at or above the required level gets the feature.
 * For industry-specific features, list exact allowed plans.
 */
export const FEATURE_REQUIREMENTS = {
   // ── Tier 1: Professional+ (level >= 1) ──
   nfc_devices:          { minLevel: 1, maxDevices: { free: 0, professional: 5, pro: 5, business: 10, salon: 10, lawfirm: 25 } },
   analytics:            { minLevel: 1 },
   lead_collection:      { minLevel: 1 },
   appointment_booking:  { minLevel: 1 },
   save_contact:         { minLevel: 1 },
   custom_colors:        { minLevel: 1 },
   qr_download:          { minLevel: 1 },
   digital_resume:       { minLevel: 1 },
   portfolio:            { minLevel: 1 },
   lost_mode:            { minLevel: 1 },

   // ── Tier 2: Business (exact plan) ──
   nfc_counter_stand:    { exactPlans: ['business', 'salon'] },
   salon_profile:        { exactPlans: ['salon'] },
   instagram_integration:{ exactPlans: ['salon', 'professional', 'pro', 'business'] },

   // ── Tier 2: Shared (Business OR Salon, NOT lawfirm) ──
   service_menu:         { exactPlans: ['salon', 'business'] },
   menu_services:        { exactPlans: ['salon', 'business'] },
   team_members:         { exactPlans: ['salon', 'lawfirm', 'business'] },
   staff_profiles:       { exactPlans: ['salon', 'lawfirm'] },
   google_review_link:   { exactPlans: ['salon', 'lawfirm', 'business'] },
   whatsapp_booking:     { exactPlans: ['salon', 'lawfirm', 'business'] },
   advanced_analytics:   { exactPlans: ['salon', 'lawfirm', 'business'] },
   lead_export:          { exactPlans: ['salon', 'lawfirm', 'business'] },

   // ── Tier 3: Law Firm (practice areas, legal services, attorneys) ──
   practice_areas:       { exactPlans: ['lawfirm'] },
   legal_services:       { exactPlans: ['lawfirm'] },
   consultation_form:    { exactPlans: ['lawfirm'] },
   crm_pipeline:         { exactPlans: ['lawfirm'] },
   attorney_profiles:    { exactPlans: ['lawfirm'] },
   admin_roles:          { exactPlans: ['lawfirm'] },
};

export const FEATURE_DESCRIPTIONS = {
   nfc_devices:          { title: 'NFC Device Activation',    upgradeTarget: 'Professional', message: 'Upgrade to Professional to activate NFC devices and tap-to-share your profile.' },
   analytics:            { title: 'Analytics Dashboard',      upgradeTarget: 'Professional', message: 'Upgrade to Professional to view full analytics and track profile performance.' },
   lead_collection:      { title: 'Lead Collection',          upgradeTarget: 'Professional', message: 'Upgrade to Professional to collect and manage leads from your profile.' },
   appointment_booking:  { title: 'Appointment Booking',      upgradeTarget: 'Professional', message: 'Upgrade to Professional to let clients book appointments directly.' },
   save_contact:         { title: 'Save Contact Button',      upgradeTarget: 'Professional', message: 'Upgrade to Professional to let visitors save your contact to their phone.' },
   custom_colors:        { title: 'Custom Profile Colors',    upgradeTarget: 'Professional', message: 'Upgrade to Professional to fully customize your profile colors and branding.' },
   qr_download:          { title: 'QR Code Download',         upgradeTarget: 'Professional', message: 'Upgrade to Professional to download and print your profile QR code.' },
   digital_resume:       { title: 'Digital Resume',           upgradeTarget: 'Professional', message: 'Upgrade to Professional to create a full digital resume profile.' },
   portfolio:            { title: 'Portfolio / Gallery',      upgradeTarget: 'Professional', message: 'Upgrade to Professional to showcase your portfolio and projects.' },
   lost_mode:            { title: 'Lost Mode Recovery',       upgradeTarget: 'Professional', message: 'Upgrade to Professional to enable Lost Mode for your NFC devices.' },
   service_menu:         { title: 'Service Menu',             upgradeTarget: 'Business',     message: 'Upgrade to the Business plan to display your full service menu.' },
   salon_profile:        { title: 'Salon Business Profile',   upgradeTarget: 'Salon',        message: 'Upgrade to the Salon plan for a full salon business profile.' },
   nfc_counter_stand:    { title: 'NFC Counter Stand',        upgradeTarget: 'Business',     message: 'Upgrade to the Business or Salon plan for NFC counter stand support.' },
   google_review_link:   { title: 'Google Review Link',       upgradeTarget: 'Business',     message: 'Upgrade to the Business plan to add a Google review link to your profile.' },
   whatsapp_booking:     { title: 'WhatsApp Booking Button',  upgradeTarget: 'Business',     message: 'Upgrade to add a WhatsApp booking button to your profile.' },
   advanced_analytics:   { title: 'Advanced Analytics',       upgradeTarget: 'Business',     message: 'Upgrade for advanced analytics and customer insights.' },
   lead_export:          { title: 'Lead Export',              upgradeTarget: 'Business',     message: 'Upgrade to export your customer leads as CSV.' },
   menu_services:        { title: 'Menu / Services Section',  upgradeTarget: 'Business',     message: 'Upgrade to showcase your full menu or services.' },
   practice_areas:       { title: 'Practice Areas',           upgradeTarget: 'Law Firm',     message: 'Upgrade to the Law Firm plan to manage your practice areas and services.' },
   legal_services:       { title: 'Legal Services',           upgradeTarget: 'Law Firm',     message: 'Upgrade to the Law Firm plan to list your legal services.' },
   instagram_integration:{ title: 'Instagram Showcase',       upgradeTarget: 'Professional', message: 'Upgrade to showcase your Instagram feed on your profile.' },
   consultation_form:    { title: 'Legal Consultation Form',  upgradeTarget: 'Law Firm',     message: 'Upgrade to the Law Firm plan for legal intake forms.' },
   crm_pipeline:         { title: 'CRM Pipeline',             upgradeTarget: 'Law Firm',     message: 'Upgrade to the Law Firm plan for a full CRM pipeline.' },
   team_members:         { title: 'Team Members',             upgradeTarget: 'Business',     message: 'Upgrade to Business, Salon, or Law Firm to manage team cards and staff profiles.' },
   staff_profiles:       { title: 'Staff / Attorney Profiles', upgradeTarget: 'Salon',       message: 'Upgrade to manage staff profiles.' },
   attorney_profiles:    { title: 'Attorney Profiles',        upgradeTarget: 'Law Firm',     message: 'Upgrade to the Law Firm plan to add attorney profiles.' },
   admin_roles:          { title: 'Admin Role Management',    upgradeTarget: 'Law Firm',     message: 'Upgrade to the Law Firm plan to manage admin roles.' },
};

/**
 * Normalize legacy plan names
 */
export function normalizePlan(plan) {
   if (plan === 'pro') return 'professional';
   return plan || 'free';
}

/**
 * Returns true if the given plan can access a feature (stacked model).
 */
export function canAccess(userPlan, featureKey) {
  const req = FEATURE_REQUIREMENTS[featureKey];
  if (!req) return true;

  const normalized = normalizePlan(userPlan);
  const userLevel = PLAN_HIERARCHY[normalized] ?? 0;

  // minLevel check: any plan at or above the level gets it
  if (req.minLevel !== undefined) {
    return userLevel >= req.minLevel;
  }

  // exactPlans: must be in the list
  if (req.exactPlans) {
    if (req.exactPlans.includes(normalized)) return true;
    return false;
  }

  return true;
}

export function maxNFCDevices(userPlan) {
  const normalized = normalizePlan(userPlan);
  return FEATURE_REQUIREMENTS.nfc_devices.maxDevices[normalized] ?? 0;
}

export function maxTeamMembers(userPlan) {
   const normalized = normalizePlan(userPlan);
   // Team members limits: salon/business/lawfirm only (unlimited for now)
   const hasTeam = ['salon', 'business', 'lawfirm'].includes(normalized);
   return hasTeam ? 999 : 0;
}

export function resolveActivePlan(subscription) {
  if (!subscription) return 'free';
  const { status, plan } = subscription;
  // Only hard-lock on canceled. past_due gets a grace period (Stripe retries 3-7 days).
  if (status === 'canceled') return 'free';
  if (plan && plan !== 'free') return plan;
  return 'free';
}