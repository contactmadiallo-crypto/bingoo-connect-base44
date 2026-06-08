/**
 * Bingoo Connect — Plan Permissions (Stacked Benefits Model)
 * 
 * HIERARCHY: free(0) → professional(1) → salon/restaurant/business(2) → lawfirm(3) → corporate(4)
 * 
 * INHERITANCE RULES:
 * - minLevel: any plan AT OR ABOVE that level gets the feature automatically
 * - exactPlans: only specific named plans (used for industry-specific UI panels)
 * 
 * IMPORTANT: exactPlans must always include ALL higher-tier plans too (lawfirm, corporate)
 * unless the feature is truly exclusive to one plan type.
 */

export const PLAN_HIERARCHY = {
  free:         0,
  professional: 1,
  pro:          1,   // legacy alias
  business:     2,
  salon:        2,
  restaurant:   2,
  lawfirm:      3,
  corporate:    4,
};

export const PLAN_LABELS = {
  free:         'Free',
  professional: 'Professional',
  pro:          'Professional',
  business:     'Business',
  salon:        'Salon',
  restaurant:   'Restaurant',
  lawfirm:      'Law Firm',
  corporate:    'Corporate',
};

export const PLAN_COLORS = {
  free:         { bg: '#f1f5f9', text: '#64748b',  border: '#e2e8f0' },
  professional: { bg: '#eff6ff', text: '#2563eb',  border: '#bfdbfe' },
  pro:          { bg: '#eff6ff', text: '#2563eb',  border: '#bfdbfe' },
  business:     { bg: '#f5f3ff', text: '#7c3aed',  border: '#ddd6fe' },
  salon:        { bg: '#fdf2f8', text: '#be185d',  border: '#fbcfe8' },
  restaurant:   { bg: '#fff7ed', text: '#c2410c',  border: '#fed7aa' },
  lawfirm:      { bg: '#f0f9ff', text: '#0369a1',  border: '#bae6fd' },
  corporate:    { bg: '#f0fdf4', text: '#15803d',  border: '#bbf7d0' },
};

export const PLAN_PRICES_USD = {
  free:         0,
  professional: 4.99,
  business:     14.99,
  salon:        19.99,
  restaurant:   29.99,
  lawfirm:      49,
  corporate:    99,
};

/**
 * Plan features — human-readable list for display
 * Uses stacked model: each plan list shows its OWN additions (inherits all below)
 */
export const PLAN_FEATURES = {
  free:         ['1 profile', 'Public profile link', 'Basic contact sharing', 'Social links', 'QR code', 'WhatsApp button'],
  professional: ['Everything in Free', 'Unlimited profiles', 'Appointment booking', 'Lead collection & CRM', 'Portfolio & gallery', 'Full analytics dashboard', 'Custom branding & colors', 'QR code downloads', 'Up to 5 NFC devices', 'Lost Mode for NFC devices', 'Save contact button', 'Business hours', 'Calendar view'],
  business:     ['Everything in Professional', 'Team management (up to 5)', 'Up to 10 NFC devices', 'Google review link', 'WhatsApp booking button', 'Advanced analytics', 'Lead export', 'Service/menu display', 'NFC counter stand support'],
  salon:        ['Everything in Professional', 'Salon business profile', 'Staff profiles', 'Service menu', 'WhatsApp booking button', 'Instagram showcase', 'Google review link', 'NFC counter stand support', 'Up to 10 NFC devices', 'Advanced analytics', 'Lead export'],
  restaurant:   ['Everything in Professional', 'Restaurant business profile', 'Digital menu', 'Food order link', 'Delivery link', 'WhatsApp booking button', 'Google review link', 'NFC counter stand support', 'Up to 10 NFC devices', 'Advanced analytics', 'Lead export'],
  lawfirm:      ['Everything in Professional', 'Law firm business profile', 'Attorney profiles', 'Practice areas display', 'Legal services listing', 'Legal consultation intake form', 'Lead dashboard & CRM pipeline', 'Team management (up to 20)', 'Up to 25 NFC devices', 'WhatsApp contact button', 'Google review link', 'Advanced analytics', 'Lead export', 'Admin role management'],
  corporate:    ['Everything in Law Firm', 'Employee profiles', 'Attendance dashboard (clock in/out)', 'Up to 50 NFC devices', 'Corporate team management', 'Admin role management'],
};

// Stripe product IDs
export const PLAN_STRIPE_PRODUCTS = {
  professional: 'prod_UdL2W8XwDY3Bmq',  // $4.99/mo
  business:     'prod_UdL2NqVtcHwKb2',  // $14.99/mo
  salon:        'prod_UfF46myS8RxwKE',  // $19.99/mo
  lawfirm:      'prod_UfFHNuhuWhyGVZ',  // $49.00/mo
};

/**
 * FEATURE REQUIREMENTS
 * 
 * minLevel: feature unlocks at this hierarchy level and ALL levels above it.
 * exactPlans: feature is ONLY for these specific plan types (industry-specific panels).
 *             Must include ALL plans that should have it, including higher tiers.
 * 
 * PERMISSION MATRIX:
 * ┌─────────────────────────┬──────┬──────┬──────┬──────┬──────┬──────┐
 * │ Feature                 │ Free │ Pro  │ Salon│ Rest │ Law  │ Corp │
 * ├─────────────────────────┼──────┼──────┼──────┼──────┼──────┼──────┤
 * │ analytics               │  ✗   │  ✓   │  ✓   │  ✓   │  ✓   │  ✓   │
 * │ lead_collection         │  ✗   │  ✓   │  ✓   │  ✓   │  ✓   │  ✓   │
 * │ appointment_booking     │  ✗   │  ✓   │  ✓   │  ✓   │  ✓   │  ✓   │
 * │ portfolio               │  ✗   │  ✓   │  ✓   │  ✓   │  ✓   │  ✓   │
 * │ lost_mode               │  ✗   │  ✓   │  ✓   │  ✓   │  ✓   │  ✓   │
 * │ custom_colors           │  ✗   │  ✓   │  ✓   │  ✓   │  ✓   │  ✓   │
 * │ qr_download             │  ✗   │  ✓   │  ✓   │  ✓   │  ✓   │  ✓   │
 * │ digital_resume          │  ✗   │  ✓   │  ✓   │  ✓   │  ✓   │  ✓   │
 * │ save_contact            │  ✗   │  ✓   │  ✓   │  ✓   │  ✓   │  ✓   │
 * │ nfc_devices             │  ✗   │  ✓   │  ✓   │  ✓   │  ✓   │  ✓   │
 * │ team_members            │  ✗   │  ✗   │  ✓   │  ✓   │  ✓   │  ✓   │
 * │ staff_profiles          │  ✗   │  ✗   │  ✓   │  ✗   │  ✓   │  ✓   │
 * │ google_review_link      │  ✗   │  ✗   │  ✓   │  ✓   │  ✓   │  ✓   │
 * │ whatsapp_booking        │  ✗   │  ✗   │  ✓   │  ✓   │  ✓   │  ✓   │
 * │ advanced_analytics      │  ✗   │  ✗   │  ✓   │  ✓   │  ✓   │  ✓   │
 * │ lead_export             │  ✗   │  ✗   │  ✓   │  ✓   │  ✓   │  ✓   │
 * │ service_menu            │  ✗   │  ✗   │  ✓   │  ✓   │  ✗   │  ✗   │
 * │ nfc_counter_stand       │  ✗   │  ✗   │  ✓   │  ✓   │  ✗   │  ✗   │
 * │ salon_profile           │  ✗   │  ✗   │  ✓   │  ✗   │  ✗   │  ✗   │
 * │ restaurant_profile      │  ✗   │  ✗   │  ✗   │  ✓   │  ✗   │  ✗   │
 * │ practice_areas          │  ✗   │  ✗   │  ✗   │  ✗   │  ✓   │  ✓   │
 * │ legal_services          │  ✗   │  ✗   │  ✗   │  ✗   │  ✓   │  ✓   │
 * │ consultation_form       │  ✗   │  ✗   │  ✗   │  ✗   │  ✓   │  ✓   │
 * │ crm_pipeline            │  ✗   │  ✗   │  ✗   │  ✗   │  ✓   │  ✓   │
 * │ attorney_profiles       │  ✗   │  ✗   │  ✗   │  ✗   │  ✓   │  ✓   │
 * │ admin_roles             │  ✗   │  ✗   │  ✗   │  ✗   │  ✓   │  ✓   │
 * │ attendance              │  ✗   │  ✗   │  ✗   │  ✗   │  ✗   │  ✓   │
 * └─────────────────────────┴──────┴──────┴──────┴──────┴──────┴──────┘
 */
export const FEATURE_REQUIREMENTS = {
  // ── Tier 1: Professional+ (level >= 1) — ALL plans above free inherit these ──
  nfc_devices:          { minLevel: 1, maxDevices: { free: 0, professional: 5, pro: 5, business: 10, salon: 10, restaurant: 10, lawfirm: 25, corporate: 50 } },
  analytics:            { minLevel: 1 },
  lead_collection:      { minLevel: 1 },
  appointment_booking:  { minLevel: 1 },
  save_contact:         { minLevel: 1 },
  custom_colors:        { minLevel: 1 },
  qr_download:          { minLevel: 1 },
  digital_resume:       { minLevel: 1 },
  portfolio:            { minLevel: 1 },
  lost_mode:            { minLevel: 1 },
  instagram_integration:{ minLevel: 1 },

  // ── Tier 2: Business/Salon/Restaurant/Lawfirm/Corporate (level >= 2) ──
  team_members:         { minLevel: 2 },
  google_review_link:   { minLevel: 2 },
  whatsapp_booking:     { minLevel: 2 },
  advanced_analytics:   { minLevel: 2 },
  lead_export:          { minLevel: 2 },

  // ── Tier 2: Industry-specific (salon + restaurant only, NOT lawfirm) ──
  service_menu:         { exactPlans: ['business', 'salon', 'restaurant'] },
  menu_services:        { exactPlans: ['business', 'salon', 'restaurant'] },
  nfc_counter_stand:    { exactPlans: ['business', 'salon', 'restaurant'] },

  // ── Salon-only ──
  salon_profile:        { exactPlans: ['salon'] },
  staff_profiles:       { exactPlans: ['salon', 'lawfirm', 'corporate'] },

  // ── Restaurant-only ──
  restaurant_profile:   { exactPlans: ['restaurant'] },

  // ── Tier 3: Law Firm+ (level >= 3) — lawfirm AND corporate inherit these ──
  practice_areas:       { minLevel: 3 },
  legal_services:       { minLevel: 3 },
  consultation_form:    { minLevel: 3 },
  crm_pipeline:         { minLevel: 3 },
  attorney_profiles:    { minLevel: 3 },
  admin_roles:          { minLevel: 3 },

  // ── Tier 4: Corporate only (level >= 4) ──
  attendance:           { minLevel: 4 },
  employee_profiles:    { minLevel: 4 },
};

export const FEATURE_DESCRIPTIONS = {
  nfc_devices:          { title: 'NFC Device Activation',     upgradeTarget: 'Professional', message: 'Upgrade to Professional to activate NFC devices and tap-to-share your profile.' },
  analytics:            { title: 'Analytics Dashboard',       upgradeTarget: 'Professional', message: 'Upgrade to Professional to view full analytics and track profile performance.' },
  lead_collection:      { title: 'Lead Collection',           upgradeTarget: 'Professional', message: 'Upgrade to Professional to collect and manage leads from your profile.' },
  appointment_booking:  { title: 'Appointment Booking',       upgradeTarget: 'Professional', message: 'Upgrade to Professional to let clients book appointments directly.' },
  save_contact:         { title: 'Save Contact Button',       upgradeTarget: 'Professional', message: 'Upgrade to Professional to let visitors save your contact to their phone.' },
  custom_colors:        { title: 'Custom Profile Colors',     upgradeTarget: 'Professional', message: 'Upgrade to Professional to fully customize your profile colors and branding.' },
  qr_download:          { title: 'QR Code Download',          upgradeTarget: 'Professional', message: 'Upgrade to Professional to download and print your profile QR code.' },
  digital_resume:       { title: 'Digital Resume',            upgradeTarget: 'Professional', message: 'Upgrade to Professional to create a full digital resume profile.' },
  portfolio:            { title: 'Portfolio / Gallery',       upgradeTarget: 'Professional', message: 'Upgrade to Professional to showcase your portfolio and projects.' },
  lost_mode:            { title: 'Lost Mode Recovery',        upgradeTarget: 'Professional', message: 'Upgrade to Professional to enable Lost Mode for your NFC devices.' },
  instagram_integration:{ title: 'Instagram Showcase',        upgradeTarget: 'Professional', message: 'Upgrade to Professional to showcase your Instagram feed on your profile.' },
  team_members:         { title: 'Team Members',              upgradeTarget: 'Salon',        message: 'Upgrade to Salon, Restaurant, or Law Firm to manage team members and staff.' },
  google_review_link:   { title: 'Google Review Link',        upgradeTarget: 'Salon',        message: 'Upgrade to Salon, Restaurant, or Law Firm to add a Google review link.' },
  whatsapp_booking:     { title: 'WhatsApp Booking Button',   upgradeTarget: 'Salon',        message: 'Upgrade to add a WhatsApp booking button to your profile.' },
  advanced_analytics:   { title: 'Advanced Analytics',        upgradeTarget: 'Salon',        message: 'Upgrade for advanced analytics and customer insights.' },
  lead_export:          { title: 'Lead Export',               upgradeTarget: 'Salon',        message: 'Upgrade to export your customer leads as CSV.' },
  service_menu:         { title: 'Service / Menu Section',    upgradeTarget: 'Salon',        message: 'Upgrade to Salon or Restaurant to showcase your full menu or services.' },
  menu_services:        { title: 'Menu / Services Section',   upgradeTarget: 'Salon',        message: 'Upgrade to Salon or Restaurant to showcase your full menu or services.' },
  nfc_counter_stand:    { title: 'NFC Counter Stand',         upgradeTarget: 'Salon',        message: 'Upgrade to Salon or Restaurant for NFC counter stand support.' },
  salon_profile:        { title: 'Salon Business Profile',    upgradeTarget: 'Salon',        message: 'Upgrade to the Salon plan for a full salon business profile.' },
  staff_profiles:       { title: 'Staff Profiles',            upgradeTarget: 'Salon',        message: 'Upgrade to Salon or Law Firm to manage staff profiles.' },
  restaurant_profile:   { title: 'Restaurant Business Profile', upgradeTarget: 'Restaurant', message: 'Upgrade to the Restaurant plan for a full restaurant business profile.' },
  practice_areas:       { title: 'Practice Areas',            upgradeTarget: 'Law Firm',     message: 'Upgrade to the Law Firm plan to manage your practice areas and services.' },
  legal_services:       { title: 'Legal Services',            upgradeTarget: 'Law Firm',     message: 'Upgrade to the Law Firm plan to list your legal services.' },
  consultation_form:    { title: 'Legal Consultation Form',   upgradeTarget: 'Law Firm',     message: 'Upgrade to the Law Firm plan for legal intake forms.' },
  crm_pipeline:         { title: 'CRM Pipeline',              upgradeTarget: 'Law Firm',     message: 'Upgrade to the Law Firm plan for a full CRM pipeline.' },
  attorney_profiles:    { title: 'Attorney Profiles',         upgradeTarget: 'Law Firm',     message: 'Upgrade to the Law Firm plan to add attorney profiles.' },
  admin_roles:          { title: 'Admin Role Management',     upgradeTarget: 'Law Firm',     message: 'Upgrade to the Law Firm plan to manage admin roles.' },
  attendance:           { title: 'Attendance Dashboard',      upgradeTarget: 'Corporate',    message: 'Upgrade to the Corporate plan for clock in/out and attendance tracking.' },
  employee_profiles:    { title: 'Employee Profiles',         upgradeTarget: 'Corporate',    message: 'Upgrade to the Corporate plan to manage employee profiles.' },
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
 * minLevel: any plan at or above the level gets the feature.
 * exactPlans: must be in the explicit list.
 */
export function canAccess(userPlan, featureKey) {
  const req = FEATURE_REQUIREMENTS[featureKey];
  if (!req) return true;

  const normalized = normalizePlan(userPlan);
  const userLevel = PLAN_HIERARCHY[normalized] ?? 0;

  if (req.minLevel !== undefined) {
    return userLevel >= req.minLevel;
  }

  if (req.exactPlans) {
    return req.exactPlans.includes(normalized);
  }

  return true;
}

export function maxNFCDevices(userPlan) {
  const normalized = normalizePlan(userPlan);
  return FEATURE_REQUIREMENTS.nfc_devices.maxDevices[normalized] ?? 0;
}

export function maxTeamMembers(userPlan) {
  const normalized = normalizePlan(userPlan);
  const level = PLAN_HIERARCHY[normalized] ?? 0;
  if (level >= 4) return 999; // corporate
  if (normalized === 'lawfirm') return 20;
  if (level >= 2) return 10;  // salon, restaurant, business
  return 0;
}

export function resolveActivePlan(subscription) {
  if (!subscription) return 'free';
  const { status, plan } = subscription;
  if (status === 'canceled') return 'free';
  if (plan && plan !== 'free') return plan;
  return 'free';
}