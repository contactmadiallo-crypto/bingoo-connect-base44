/**
 * Bingoo Connect — Plan Permissions (Capability-Based Model)
 *
 * ARCHITECTURE:
 * Each plan defines exactly which features it includes.
 * Industry plans (salon, restaurant, lawfirm) inherit Professional features
 * but do NOT inherit each other.
 *
 * Inheritance:
 *   free         → base only
 *   professional → free + professional features
 *   salon        → free + professional + salon features
 *   restaurant   → free + professional + restaurant features
 *   lawfirm      → free + professional + lawfirm features
 *   business     → free + professional + business features
 *   corporate    → free + professional + lawfirm + corporate features
 *
 * canAccess(plan, featureKey) looks up PLAN_CAPABILITIES[plan] set — O(1).
 * No numeric levels. No cross-industry inheritance.
 */

// ── Feature Sets ──────────────────────────────────────────────────────────────

const FREE_FEATURES = new Set([
  'profile',
  'public_profile',
  'qr_code',
  'contact_sharing',
  'social_links',
  'whatsapp_button',
]);

const PROFESSIONAL_FEATURES = new Set([
  ...FREE_FEATURES,
  // NFC
  'nfc_devices',
  'lost_mode',
  // CRM & Engagement
  'lead_collection',
  'analytics',
  'appointment_booking',
  'save_contact',
  // Profile customization
  'portfolio',
  'custom_colors',
  'custom_branding',
  'qr_download',
  'digital_resume',
  'instagram_integration',
  'business_hours',
  'calendar',
  // Wallet passes
  'google_wallet_pass',
  'apple_wallet_pass',
]);

const SALON_FEATURES = new Set([
  ...PROFESSIONAL_FEATURES,
  'salon_profile',
  'staff_profiles',
  'service_menu',
  'menu_services',
  'instagram_showcase',
  'google_review_link',
  'whatsapp_booking',
  'nfc_counter_stand',
  'team_members',
  'advanced_analytics',
  'lead_export',
]);

const RESTAURANT_FEATURES = new Set([
  ...PROFESSIONAL_FEATURES,
  'restaurant_profile',
  'digital_menu',
  'food_order_link',
  'delivery_link',
  'google_review_link',
  'whatsapp_booking',
  'nfc_counter_stand',
  'nfc_table_stand',
  'team_members',
  'advanced_analytics',
  'lead_export',
]);

const LAWFIRM_FEATURES = new Set([
  ...PROFESSIONAL_FEATURES,
  'law_firm_profile',
  'practice_areas',
  'attorney_profiles',
  'staff_profiles',
  'legal_services',
  'office_locations',
  'team_members',
  'consultation_form',
  'client_intake',
  'crm_pipeline',
  'admin_roles',
  'advanced_analytics',
  'lead_export',
  // Case-type intake forms
  'immigration_forms',
  'criminal_forms',
  'civil_forms',
  'family_forms',
]);

const BUSINESS_FEATURES = new Set([
  ...PROFESSIONAL_FEATURES,
  'service_menu',
  'menu_services',
  'nfc_counter_stand',
  'google_review_link',
  'whatsapp_booking',
  'team_members',
  'advanced_analytics',
  'lead_export',
]);

const CORPORATE_FEATURES = new Set([
  ...LAWFIRM_FEATURES,
  'employee_profiles',
  'attendance',
  'attendance_dashboard',
]);

// ── Master Capability Map ─────────────────────────────────────────────────────

export const PLAN_CAPABILITIES = {
  free:         FREE_FEATURES,
  professional: PROFESSIONAL_FEATURES,
  pro:          PROFESSIONAL_FEATURES,   // legacy alias
  salon:        SALON_FEATURES,
  restaurant:   RESTAURANT_FEATURES,
  lawfirm:      LAWFIRM_FEATURES,
  business:     BUSINESS_FEATURES,
  corporate:    CORPORATE_FEATURES,
};

// ── Plan Metadata ─────────────────────────────────────────────────────────────

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

// Stripe product IDs
export const PLAN_STRIPE_PRODUCTS = {
  professional: 'prod_UdL2W8XwDY3Bmq',  // $4.99/mo
  business:     'prod_UdL2NqVtcHwKb2',  // $14.99/mo
  salon:        'prod_UfF46myS8RxwKE',  // $19.99/mo
  lawfirm:      'prod_UfFHNuhuWhyGVZ',  // $49.00/mo
};

/**
 * Plan features — human-readable list for display (marketing copy).
 * Each list shows additions for that plan on top of Professional.
 */
export const PLAN_FEATURES = {
  free:         ['1 profile', 'Public profile link', 'Basic contact sharing', 'Social links', 'QR code', 'WhatsApp button'],
  professional: ['Everything in Free', 'Multiple NFC Devices', 'Lead Collection', 'Analytics Dashboard', 'Portfolio & Gallery', 'Custom Design & Colors', 'QR Code Download', 'Save Contact Button', 'Appointment Booking', 'Lost Mode for NFC', 'Google Wallet Pass', 'Apple Wallet Pass', 'Business Hours', 'Digital Resume'],
  business:     ['Everything in Professional', 'Team Management', 'Service / Menu Section', 'Google Review Link', 'WhatsApp Booking Button', 'NFC Counter Stand', 'Advanced Analytics', 'Lead Export'],
  salon:        ['Everything in Professional', 'Salon Business Profile', 'Staff Profiles', 'Services Menu', 'Instagram Gallery', 'Google Reviews', 'WhatsApp Booking', 'NFC Counter Stand', 'Advanced Analytics', 'Lead Export'],
  restaurant:   ['Everything in Professional', 'Restaurant Business Profile', 'Digital Menu', 'Delivery Links', 'Food Ordering', 'Google Reviews', 'WhatsApp Ordering', 'NFC Table Stand', 'Advanced Analytics', 'Lead Export'],
  lawfirm:      ['Everything in Professional', 'Law Firm Profile', 'Practice Areas', 'Attorney Profiles', 'Legal Services', 'Office Locations', 'Team Members', 'Lead Intake Forms', 'CRM Pipeline', 'Immigration, Criminal, Civil & Family Forms', 'Advanced Analytics', 'Lead Export'],
  corporate:    ['Everything in Law Firm', 'Employee Profiles', 'Attendance Dashboard (Clock In/Out)'],
};

// ── Core Functions ────────────────────────────────────────────────────────────

/**
 * Normalize legacy plan names to canonical values.
 */
export function normalizePlan(plan) {
  if (plan === 'pro') return 'professional';
  return plan || 'free';
}

/**
 * Returns true if the given plan includes the feature.
 * Uses capability set lookup — O(1), no numeric levels.
 * Unknown features: returns true (open by default).
 */
export function canAccess(userPlan, featureKey) {
  const normalized = normalizePlan(userPlan);
  const caps = PLAN_CAPABILITIES[normalized];
  if (!caps) return true; // unknown plan → open
  // Unknown feature key → open (don't gate things we haven't defined)
  if (!isKnownFeature(featureKey)) return true;
  return caps.has(featureKey);
}

/**
 * Returns true if the featureKey is defined in any plan's capability set.
 */
function isKnownFeature(featureKey) {
  return PLAN_CAPABILITIES.corporate.has(featureKey) ||
    PLAN_CAPABILITIES.salon.has(featureKey) ||
    PLAN_CAPABILITIES.restaurant.has(featureKey);
}

/**
 * Returns the max number of NFC devices for a plan.
 */
export function maxNFCDevices(userPlan) {
  const normalized = normalizePlan(userPlan);
  const map = {
    free: 0, professional: 5, pro: 5,
    business: 10, salon: 10, restaurant: 10,
    lawfirm: 25, corporate: 50,
  };
  return map[normalized] ?? 0;
}

/**
 * Returns the max number of team members for a plan.
 */
export function maxTeamMembers(userPlan) {
  const normalized = normalizePlan(userPlan);
  const map = {
    free: 0, professional: 0, pro: 0,
    business: 10, salon: 10, restaurant: 10,
    lawfirm: 20, corporate: 999,
  };
  return map[normalized] ?? 0;
}

/**
 * Resolves active plan from a subscription record.
 * Canceled subscriptions → free.
 */
export function resolveActivePlan(subscription) {
  if (!subscription) return 'free';
  const { status, plan } = subscription;
  if (status === 'canceled') return 'free';
  if (plan && plan !== 'free') return plan;
  return 'free';
}

// ── Feature Descriptions (for FeatureGate / UpgradeModal / PlanGateScreen) ───

/**
 * upgradeTarget: the plan name shown in "Upgrade to X" prompts.
 * For features shared by salon/restaurant/lawfirm, we show the generic industry label.
 * For professional-only features, we always say "Professional".
 */
export const FEATURE_DESCRIPTIONS = {
  // ── Professional tier ──
  nfc_devices:          { title: 'NFC Device Activation',      upgradeTarget: 'Professional', message: 'Upgrade to Professional to activate NFC devices and tap-to-share your profile.' },
  analytics:            { title: 'Analytics Dashboard',        upgradeTarget: 'Professional', message: 'Upgrade to Professional to view full analytics and track profile performance.' },
  lead_collection:      { title: 'Lead Collection',            upgradeTarget: 'Professional', message: 'Upgrade to Professional to collect and manage leads from your profile.' },
  appointment_booking:  { title: 'Appointment Booking',        upgradeTarget: 'Professional', message: 'Upgrade to Professional to let clients book appointments directly.' },
  save_contact:         { title: 'Save Contact Button',        upgradeTarget: 'Professional', message: 'Upgrade to Professional to let visitors save your contact to their phone.' },
  custom_colors:        { title: 'Custom Profile Colors',      upgradeTarget: 'Professional', message: 'Upgrade to Professional to fully customize your profile colors and branding.' },
  custom_branding:      { title: 'Custom Branding',            upgradeTarget: 'Professional', message: 'Upgrade to Professional to fully customize your profile branding.' },
  qr_download:          { title: 'QR Code Download',           upgradeTarget: 'Professional', message: 'Upgrade to Professional to download and print your profile QR code.' },
  digital_resume:       { title: 'Digital Resume',             upgradeTarget: 'Professional', message: 'Upgrade to Professional to create a full digital resume profile.' },
  portfolio:            { title: 'Portfolio / Gallery',        upgradeTarget: 'Professional', message: 'Upgrade to Professional to showcase your portfolio and projects.' },
  lost_mode:            { title: 'Lost Mode Recovery',         upgradeTarget: 'Professional', message: 'Upgrade to Professional to enable Lost Mode for your NFC devices.' },
  instagram_integration:{ title: 'Instagram Integration',      upgradeTarget: 'Professional', message: 'Upgrade to Professional to connect your Instagram to your profile.' },
  google_wallet_pass:   { title: 'Google Wallet Pass',         upgradeTarget: 'Professional', message: 'Upgrade to Professional to generate a Google Wallet digital card.' },
  apple_wallet_pass:    { title: 'Apple Wallet Pass',          upgradeTarget: 'Professional', message: 'Upgrade to Professional to generate an Apple Wallet digital card.' },
  business_hours:       { title: 'Business Hours',             upgradeTarget: 'Professional', message: 'Upgrade to Professional to display your business hours.' },
  calendar:             { title: 'Calendar View',              upgradeTarget: 'Professional', message: 'Upgrade to Professional to access the calendar view.' },

  // ── Business tier (shared by business/salon/restaurant) ──
  team_members:         { title: 'Team Members',               upgradeTarget: 'Business',     message: 'Upgrade to a Business, Salon, Restaurant, or Law Firm plan to manage team members.' },
  google_review_link:   { title: 'Google Review Link',         upgradeTarget: 'Business',     message: 'Upgrade to a Business or industry plan to add a Google review link.' },
  whatsapp_booking:     { title: 'WhatsApp Booking Button',    upgradeTarget: 'Business',     message: 'Upgrade to a Business or industry plan to add a WhatsApp booking button.' },
  advanced_analytics:   { title: 'Advanced Analytics',         upgradeTarget: 'Business',     message: 'Upgrade to a Business or industry plan for advanced analytics.' },
  lead_export:          { title: 'Lead Export',                upgradeTarget: 'Business',     message: 'Upgrade to a Business or industry plan to export leads as CSV.' },
  service_menu:         { title: 'Service / Menu Section',     upgradeTarget: 'Business',     message: 'Upgrade to a Business, Salon, or Restaurant plan to showcase services or a menu.' },
  menu_services:        { title: 'Menu / Services Section',    upgradeTarget: 'Business',     message: 'Upgrade to a Business, Salon, or Restaurant plan to showcase services or a menu.' },
  nfc_counter_stand:    { title: 'NFC Counter Stand',          upgradeTarget: 'Business',     message: 'Upgrade to a Business, Salon, or Restaurant plan for NFC counter stand support.' },

  // ── Salon-specific ──
  salon_profile:        { title: 'Salon Business Profile',     upgradeTarget: 'Salon',        message: 'Upgrade to the Salon plan for a full salon business profile.' },
  staff_profiles:       { title: 'Staff Profiles',             upgradeTarget: 'Salon',        message: 'Upgrade to the Salon or Law Firm plan to manage staff profiles.' },
  instagram_showcase:   { title: 'Instagram Gallery',          upgradeTarget: 'Salon',        message: 'Upgrade to the Salon plan for a full Instagram gallery showcase.' },

  // ── Restaurant-specific ──
  restaurant_profile:   { title: 'Restaurant Business Profile', upgradeTarget: 'Restaurant',  message: 'Upgrade to the Restaurant plan for a full restaurant business profile.' },
  digital_menu:         { title: 'Digital Menu',               upgradeTarget: 'Restaurant',   message: 'Upgrade to the Restaurant plan to display your digital menu.' },
  food_order_link:      { title: 'Food Ordering',              upgradeTarget: 'Restaurant',   message: 'Upgrade to the Restaurant plan to add food ordering links.' },
  delivery_link:        { title: 'Delivery Links',             upgradeTarget: 'Restaurant',   message: 'Upgrade to the Restaurant plan to add delivery links.' },
  nfc_table_stand:      { title: 'NFC Table Stand',            upgradeTarget: 'Restaurant',   message: 'Upgrade to the Restaurant plan for NFC table stand support.' },

  // ── Law Firm-specific ──
  law_firm_profile:     { title: 'Law Firm Profile',           upgradeTarget: 'Law Firm',     message: 'Upgrade to the Law Firm plan for a full law firm business profile.' },
  practice_areas:       { title: 'Practice Areas',             upgradeTarget: 'Law Firm',     message: 'Upgrade to the Law Firm plan to manage your practice areas.' },
  legal_services:       { title: 'Legal Services',             upgradeTarget: 'Law Firm',     message: 'Upgrade to the Law Firm plan to list your legal services.' },
  consultation_form:    { title: 'Legal Consultation Form',    upgradeTarget: 'Law Firm',     message: 'Upgrade to the Law Firm plan for legal intake forms.' },
  client_intake:        { title: 'Client Intake',              upgradeTarget: 'Law Firm',     message: 'Upgrade to the Law Firm plan for client intake workflows.' },
  crm_pipeline:         { title: 'CRM Pipeline',               upgradeTarget: 'Law Firm',     message: 'Upgrade to the Law Firm plan for a full CRM pipeline.' },
  attorney_profiles:    { title: 'Attorney Profiles',          upgradeTarget: 'Law Firm',     message: 'Upgrade to the Law Firm plan to add attorney profiles.' },
  office_locations:     { title: 'Office Locations',           upgradeTarget: 'Law Firm',     message: 'Upgrade to the Law Firm plan to manage office locations.' },
  admin_roles:          { title: 'Admin Role Management',      upgradeTarget: 'Law Firm',     message: 'Upgrade to the Law Firm plan to manage admin roles.' },
  immigration_forms:    { title: 'Immigration Intake Forms',   upgradeTarget: 'Law Firm',     message: 'Upgrade to the Law Firm plan for immigration intake forms.' },
  criminal_forms:       { title: 'Criminal Case Forms',        upgradeTarget: 'Law Firm',     message: 'Upgrade to the Law Firm plan for criminal case intake forms.' },
  civil_forms:          { title: 'Civil Case Forms',           upgradeTarget: 'Law Firm',     message: 'Upgrade to the Law Firm plan for civil case intake forms.' },
  family_forms:         { title: 'Family Law Forms',           upgradeTarget: 'Law Firm',     message: 'Upgrade to the Law Firm plan for family law intake forms.' },

  // ── Corporate-specific ──
  attendance:           { title: 'Attendance Dashboard',       upgradeTarget: 'Corporate',    message: 'Upgrade to the Corporate plan for clock in/out and attendance tracking.' },
  attendance_dashboard: { title: 'Attendance Dashboard',       upgradeTarget: 'Corporate',    message: 'Upgrade to the Corporate plan for clock in/out and attendance tracking.' },
  employee_profiles:    { title: 'Employee Profiles',          upgradeTarget: 'Corporate',    message: 'Upgrade to the Corporate plan to manage employee profiles.' },
};

// ── Legacy compatibility shim ─────────────────────────────────────────────────
// The old FEATURE_REQUIREMENTS was used by some components for maxDevices.
// Kept as a thin shim so any import doesn't break.
export const FEATURE_REQUIREMENTS = {
  nfc_devices: {
    maxDevices: {
      free: 0, professional: 5, pro: 5,
      business: 10, salon: 10, restaurant: 10,
      lawfirm: 25, corporate: 50,
    }
  }
};

// Legacy numeric hierarchy — kept for any external code that reads it, but
// canAccess() no longer uses this.
export const PLAN_HIERARCHY = {
  free:         0,
  professional: 1,
  pro:          1,
  business:     2,
  salon:        2,
  restaurant:   2,
  lawfirm:      3,
  corporate:    4,
};