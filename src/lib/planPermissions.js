/**
 * Bingoo Connect — Plan Permissions (Stacked Benefits Model)
 * Each plan inherits ALL features from lower plans + adds its own.
 * Hierarchy: free(0) → professional(1) → salon/restaurant/lawfirm/corporate(2+)
 */

export const PLAN_HIERARCHY = {
  free:         0,
  professional: 1,
  pro:          1,   // legacy alias
  salon:        2,
  restaurant:   2,
  lawfirm:      3,
  business:     2,   // legacy alias → restaurant level
  corporate:    4,
};

export const PLAN_LABELS = {
  free:         'Free',
  professional: 'Professional',
  pro:          'Professional',
  salon:        'Salon',
  restaurant:   'Restaurant',
  lawfirm:      'Law Firm',
  business:     'Restaurant',
  corporate:    'Corporate Team',
};

export const PLAN_COLORS = {
  free:         { bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0' },
  professional: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
  pro:          { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
  salon:        { bg: '#fdf2f8', text: '#be185d', border: '#fbcfe8' },
  restaurant:   { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
  business:     { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
  lawfirm:      { bg: '#f0f9ff', text: '#0369a1', border: '#bae6fd' },
  corporate:    { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' },
};

export const PLAN_PRICES_USD = {
  free:         0,
  professional: 4.99,
  salon:        19.99,
  restaurant:   29.99,
  lawfirm:      49,
  corporate:    99,
};

// Stripe product IDs (existing from catalog)
export const PLAN_STRIPE_PRODUCTS = {
  professional: 'prod_UdL2W8XwDY3Bmq',  // $4.99/mo
  // salon, restaurant, lawfirm, corporate → created dynamically
};

/**
 * FEATURE REQUIREMENTS — uses minimum plan level (hierarchy).
 * Any plan at or above the required level gets the feature.
 * For industry-specific features, list exact allowed plans.
 */
export const FEATURE_REQUIREMENTS = {
  // ── Tier 1: Professional+ (level >= 1) ──
  nfc_devices:          { minLevel: 1, maxDevices: { free: 0, professional: 5, pro: 5, salon: 10, restaurant: 10, lawfirm: 25, business: 10, corporate: 50 } },
  analytics:            { minLevel: 1 },
  lead_collection:      { minLevel: 1 },
  appointment_booking:  { minLevel: 1 },
  save_contact:         { minLevel: 1 },
  custom_colors:        { minLevel: 1 },
  qr_download:          { minLevel: 1 },
  digital_resume:       { minLevel: 1 },
  portfolio:            { minLevel: 1 },
  lost_mode:            { minLevel: 1 },

  // ── Tier 2: Salon (exact plan) ──
  nfc_counter_stand:    { exactPlans: ['salon'] },
  salon_profile:        { exactPlans: ['salon'] },
  instagram_integration:{ exactPlans: ['salon', 'professional', 'pro'] },

  // ── Tier 2: Restaurant (exact plan) ──
  nfc_table_stand:      { exactPlans: ['restaurant', 'business'] },
  restaurant_profile:   { exactPlans: ['restaurant', 'business'] },
  online_ordering:      { exactPlans: ['restaurant', 'business'] },
  digital_menu:         { exactPlans: ['restaurant', 'business'] },

  // ── Shared Tier 2+ (salon OR restaurant OR lawfirm) ──
  service_menu:         { exactPlans: ['salon', 'restaurant', 'lawfirm', 'business'] },
  team_members:         { exactPlans: ['salon', 'restaurant', 'lawfirm', 'corporate', 'business'] },
  staff_profiles:       { exactPlans: ['salon', 'restaurant', 'lawfirm', 'corporate'] },
  google_review_link:   { exactPlans: ['salon', 'restaurant', 'lawfirm', 'business'] },
  whatsapp_booking:     { exactPlans: ['salon', 'restaurant', 'lawfirm', 'business'] },
  advanced_analytics:   { exactPlans: ['salon', 'restaurant', 'lawfirm', 'corporate', 'business'] },
  lead_export:          { exactPlans: ['salon', 'restaurant', 'lawfirm', 'corporate', 'business'] },
  menu_services:        { exactPlans: ['salon', 'restaurant', 'business'] },

  // ── Tier 3: Law Firm ──
  consultation_form:    { exactPlans: ['lawfirm', 'corporate'] },
  crm_pipeline:         { exactPlans: ['lawfirm', 'corporate'] },
  attorney_profiles:    { exactPlans: ['lawfirm', 'corporate'] },
  admin_roles:          { exactPlans: ['lawfirm', 'corporate'] },

  // ── Tier 4: Corporate ──
  clock_in_out:         { exactPlans: ['corporate'] },
  attendance_dashboard: { exactPlans: ['corporate'] },
  employee_profiles:    { exactPlans: ['corporate'] },
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
  service_menu:         { title: 'Service Menu',             upgradeTarget: 'Salon',        message: 'Upgrade to the Salon plan to display your full service menu.' },
  salon_profile:        { title: 'Salon Business Profile',   upgradeTarget: 'Salon',        message: 'Upgrade to the Salon plan for a full salon business profile.' },
  nfc_counter_stand:    { title: 'NFC Counter Stand',        upgradeTarget: 'Salon',        message: 'Upgrade to the Salon plan for NFC counter stand support.' },
  google_review_link:   { title: 'Google Review Link',       upgradeTarget: 'Salon',        message: 'Upgrade to the Salon plan to add a Google review link to your profile.' },
  whatsapp_booking:     { title: 'WhatsApp Booking Button',  upgradeTarget: 'Salon',        message: 'Upgrade to add a WhatsApp booking button to your profile.' },
  advanced_analytics:   { title: 'Advanced Analytics',       upgradeTarget: 'Salon',        message: 'Upgrade for advanced analytics and customer insights.' },
  lead_export:          { title: 'Lead Export',              upgradeTarget: 'Salon',        message: 'Upgrade to export your customer leads as CSV.' },
  menu_services:        { title: 'Menu / Services Section',  upgradeTarget: 'Salon',        message: 'Upgrade to showcase your full menu or services.' },
  restaurant_profile:   { title: 'Restaurant Business Profile', upgradeTarget: 'Restaurant', message: 'Upgrade to the Restaurant plan for a full restaurant profile.' },
  online_ordering:      { title: 'Online Ordering',          upgradeTarget: 'Restaurant',   message: 'Upgrade to the Restaurant plan for online ordering.' },
  digital_menu:         { title: 'Digital Menu',             upgradeTarget: 'Restaurant',   message: 'Upgrade to the Restaurant plan to add a digital menu.' },
  nfc_table_stand:      { title: 'NFC Table Stand',          upgradeTarget: 'Restaurant',   message: 'Upgrade to the Restaurant plan for NFC table stands.' },
  staff_profiles:       { title: 'Staff Profiles',           upgradeTarget: 'Salon',        message: 'Upgrade to manage staff profiles.' },
  instagram_integration:{ title: 'Instagram Showcase',       upgradeTarget: 'Professional', message: 'Upgrade to showcase your Instagram feed on your profile.' },
  consultation_form:    { title: 'Legal Consultation Form',  upgradeTarget: 'Law Firm',     message: 'Upgrade to the Law Firm plan for legal intake forms.' },
  crm_pipeline:         { title: 'CRM Pipeline',             upgradeTarget: 'Law Firm',     message: 'Upgrade to Law Firm or Corporate for a full CRM pipeline.' },
  team_members:         { title: 'Team Members',             upgradeTarget: 'Law Firm',     message: 'Upgrade to Law Firm or Corporate to manage team cards and staff profiles.' },
  attorney_profiles:    { title: 'Attorney Profiles',        upgradeTarget: 'Law Firm',     message: 'Upgrade to the Law Firm plan to add attorney profiles.' },
  admin_roles:          { title: 'Admin Role Management',    upgradeTarget: 'Law Firm',     message: 'Upgrade to Law Firm or Corporate to manage admin roles.' },
  clock_in_out:         { title: 'Clock In / Clock Out',     upgradeTarget: 'Corporate',    message: 'Upgrade to the Corporate plan for time tracking.' },
  attendance_dashboard: { title: 'Attendance Dashboard',     upgradeTarget: 'Corporate',    message: 'Upgrade to the Corporate plan for attendance management.' },
  employee_profiles:    { title: 'Employee Profiles',        upgradeTarget: 'Corporate',    message: 'Upgrade to the Corporate plan for employee profile management.' },
};

/**
 * Normalize legacy plan names
 */
export function normalizePlan(plan) {
  if (plan === 'pro') return 'professional';
  if (plan === 'business') return 'restaurant';
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

  // exactPlans: must be in the list (but corporate gets everything lawfirm has too)
  if (req.exactPlans) {
    if (req.exactPlans.includes(normalized)) return true;
    // Corporate inherits law firm features
    if (normalized === 'corporate' && req.exactPlans.includes('lawfirm')) return true;
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
  return FEATURE_REQUIREMENTS.team_members.maxMembers?.[normalized] ?? 0;
}

export function resolveActivePlan(subscription) {
  if (!subscription) return 'free';
  const { status, plan } = subscription;
  // Only hard-lock on canceled. past_due gets a grace period (Stripe retries 3-7 days).
  if (status === 'canceled') return 'free';
  if (plan && plan !== 'free') return plan;
  return 'free';
}