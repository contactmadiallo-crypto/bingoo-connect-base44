/**
 * Bingoo Connect — Plan Permissions (Capability-Based Model)
 *
 * ARCHITECTURE:
 * Each plan defines exactly which features it includes via explicit Sets.
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
 * canAccess(plan, featureKey):
 *   - Unknown plan → resolves to FREE (closed, not open)
 *   - Unknown feature key → returns false (closed, not open)
 *   - All features must be explicitly declared in ALL_KNOWN_FEATURES
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
  'custom_branding',      // canonical key (replaces custom_colors / custom_design)
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
  'services',             // canonical key (replaces service_menu / menu_services)
  'instagram_gallery',    // canonical key (replaces instagram_showcase)
  'google_reviews',       // canonical key (replaces google_review_link)
  'whatsapp_booking',     // canonical (same in restaurant)
  'nfc_counter_stand',
  'team_members',
  'advanced_analytics',
  'lead_export',
]);

const RESTAURANT_FEATURES = new Set([
  ...PROFESSIONAL_FEATURES,
  'restaurant_profile',
  'digital_menu',
  'delivery_links',       // canonical key (replaces delivery_link)
  'food_ordering',        // canonical key (replaces food_order_link)
  'google_reviews',
  'reservations',
  'whatsapp_ordering',    // canonical key (distinct from whatsapp_booking)
  'whatsapp_booking',     // keep for backward compat — same intent in restaurant context
  'nfc_table_stand',
  'nfc_counter_stand',    // keep — stands used in restaurants too
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
  'lead_intake_forms',    // canonical key (replaces consultation_form / client_intake)
  'crm_pipeline',
  'case_dashboard',
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
  'services',
  'nfc_counter_stand',
  'google_reviews',
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

// ── Complete registry of all known feature keys ───────────────────────────────
// canAccess() returns false for ANY key not in this set (closed by default).
const ALL_KNOWN_FEATURES = new Set([
  ...FREE_FEATURES,
  ...PROFESSIONAL_FEATURES,
  ...SALON_FEATURES,
  ...RESTAURANT_FEATURES,
  ...LAWFIRM_FEATURES,
  ...BUSINESS_FEATURES,
  ...CORPORATE_FEATURES,
  // Aliases kept for backward-compat checks elsewhere in the app
  'custom_colors',          // alias → custom_branding
  'custom_design',          // alias → custom_branding
  'service_menu',           // alias → services
  'menu_services',          // alias → services
  'instagram_showcase',     // alias → instagram_gallery
  'google_review_link',     // alias → google_reviews
  'food_order_link',        // alias → food_ordering
  'delivery_link',          // alias → delivery_links
  'consultation_form',      // alias → lead_intake_forms
  'client_intake',          // alias → lead_intake_forms
  'whatsapp_ordering',      // canonical for restaurant (also in set above)
  'nfc_table_stand',
  'reservations',
  'case_dashboard',
  'family_forms',
]);

// Alias map: old key → canonical key that actually lives in the Sets
const FEATURE_ALIASES = {
  custom_colors:       'custom_branding',
  custom_design:       'custom_branding',
  service_menu:        'services',
  menu_services:       'services',
  instagram_showcase:  'instagram_gallery',
  google_review_link:  'google_reviews',
  food_order_link:     'food_ordering',
  delivery_link:       'delivery_links',
  consultation_form:   'lead_intake_forms',
  client_intake:       'lead_intake_forms',
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
  professional: 'prod_UdL2W8XwDY3Bmq',
  business:     'prod_UdL2NqVtcHwKb2',
  salon:        'prod_UfF46myS8RxwKE',
  lawfirm:      'prod_UfFHNuhuWhyGVZ',
};

export const PLAN_FEATURES = {
  free:         ['1 profile', 'Public profile link', 'Basic contact sharing', 'Social links', 'QR code', 'WhatsApp button'],
  professional: ['Everything in Free', 'Multiple NFC Devices', 'Lead Collection', 'Analytics Dashboard', 'Portfolio & Gallery', 'Custom Branding', 'QR Code Download', 'Save Contact Button', 'Appointment Booking', 'Lost Mode for NFC', 'Google Wallet Pass', 'Apple Wallet Pass', 'Business Hours', 'Digital Resume'],
  business:     ['Everything in Professional', 'Team Management', 'Services Section', 'Google Reviews', 'WhatsApp Booking', 'NFC Counter Stand', 'Advanced Analytics', 'Lead Export'],
  salon:        ['Everything in Professional', 'Salon Business Profile', 'Staff Profiles', 'Services Menu', 'Instagram Gallery', 'Google Reviews', 'WhatsApp Booking', 'NFC Counter Stand', 'Advanced Analytics', 'Lead Export'],
  restaurant:   ['Everything in Professional', 'Restaurant Business Profile', 'Digital Menu', 'Delivery Links', 'Food Ordering', 'Google Reviews', 'Reservations', 'WhatsApp Ordering', 'NFC Table Stand', 'Advanced Analytics', 'Lead Export'],
  lawfirm:      ['Everything in Professional', 'Law Firm Profile', 'Practice Areas', 'Attorney Profiles', 'Legal Services', 'Office Locations', 'Team Members', 'Lead Intake Forms', 'CRM Pipeline', 'Case Dashboard', 'Immigration, Criminal, Civil & Family Forms', 'Advanced Analytics', 'Lead Export'],
  corporate:    ['Everything in Law Firm', 'Employee Profiles', 'Attendance Dashboard (Clock In/Out)'],
};

// ── Core Functions ────────────────────────────────────────────────────────────

/**
 * Normalize legacy plan names to canonical values.
 * Unknown plans resolve to 'free' (closed/safe default).
 */
export function normalizePlan(plan) {
  if (!plan) return 'free';
  if (plan === 'pro') return 'professional';
  if (PLAN_CAPABILITIES[plan]) return plan;
  return 'free'; // unknown plan → free (not open)
}

/**
 * Returns true if the given plan includes the feature.
 *
 * Security rules:
 * - Unknown plan → resolves to 'free' (never opens paid features)
 * - Unknown feature key → returns false (never opens unregistered features)
 * - Alias keys → resolved to canonical key before lookup
 */
export function canAccess(userPlan, featureKey) {
  if (!featureKey) return false;

  // Resolve alias to canonical key
  const canonical = FEATURE_ALIASES[featureKey] || featureKey;

  // If the key is unknown to the system entirely, deny
  if (!ALL_KNOWN_FEATURES.has(canonical) && !ALL_KNOWN_FEATURES.has(featureKey)) {
    return false;
  }

  const normalized = normalizePlan(userPlan);
  const caps = PLAN_CAPABILITIES[normalized] || FREE_FEATURES;
  return caps.has(canonical) || caps.has(featureKey);
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
 * - No subscription → free
 * - canceled → free
 * - past_due → keep current plan (grace period, Stripe retries)
 * - active → use plan field
 */
export function resolveActivePlan(subscription) {
  if (!subscription) return 'free';
  const { status, plan } = subscription;
  if (status === 'canceled') return 'free';
  // past_due: keep access during grace period
  if (status === 'past_due') return normalizePlan(plan);
  if (plan && plan !== 'free') return normalizePlan(plan);
  return 'free';
}

// ── Feature Descriptions ──────────────────────────────────────────────────────
// upgradeTarget is shown in UpgradeModal / PlanGateScreen.
// Industry plans that include Professional features should NEVER see
// "Upgrade to Professional" — those features are already included in their plan.
// The upgradeTarget here is the MINIMUM plan that unlocks this feature.
// Components consuming this must only show the gate if canAccess() returns false.

export const FEATURE_DESCRIPTIONS = {
  // ── Professional tier ──
  nfc_devices:          { title: 'NFC Device Activation',      upgradeTarget: 'Professional', message: 'Upgrade to Professional to activate NFC devices and tap-to-share your profile.' },
  analytics:            { title: 'Analytics Dashboard',        upgradeTarget: 'Professional', message: 'Upgrade to Professional to view full analytics and track profile performance.' },
  lead_collection:      { title: 'Lead Collection',            upgradeTarget: 'Professional', message: 'Upgrade to Professional to collect and manage leads from your profile.' },
  appointment_booking:  { title: 'Appointment Booking',        upgradeTarget: 'Professional', message: 'Upgrade to Professional to let clients book appointments directly.' },
  save_contact:         { title: 'Save Contact Button',        upgradeTarget: 'Professional', message: 'Upgrade to Professional to let visitors save your contact to their phone.' },
  custom_branding:      { title: 'Custom Branding & Design',   upgradeTarget: 'Professional', message: 'Upgrade to Professional to fully customize your profile branding and colors.' },
  qr_download:          { title: 'QR Code Download',           upgradeTarget: 'Professional', message: 'Upgrade to Professional to download and print your profile QR code.' },
  digital_resume:       { title: 'Digital Resume',             upgradeTarget: 'Professional', message: 'Upgrade to Professional to create a full digital resume profile.' },
  portfolio:            { title: 'Portfolio / Gallery',        upgradeTarget: 'Professional', message: 'Upgrade to Professional to showcase your portfolio and projects.' },
  lost_mode:            { title: 'Lost Mode Recovery',         upgradeTarget: 'Professional', message: 'Upgrade to Professional to enable Lost Mode for your NFC devices.' },
  instagram_integration:{ title: 'Instagram Integration',      upgradeTarget: 'Professional', message: 'Upgrade to Professional to connect your Instagram to your profile.' },
  google_wallet_pass:   { title: 'Google Wallet Pass',         upgradeTarget: 'Professional', message: 'Upgrade to Professional to generate a Google Wallet digital card.' },
  apple_wallet_pass:    { title: 'Apple Wallet Pass',          upgradeTarget: 'Professional', message: 'Upgrade to Professional to generate an Apple Wallet digital card.' },
  business_hours:       { title: 'Business Hours',             upgradeTarget: 'Professional', message: 'Upgrade to Professional to display your business hours.' },
  calendar:             { title: 'Calendar View',              upgradeTarget: 'Professional', message: 'Upgrade to Professional to access the calendar view.' },
  // Aliases for backward compat — same gate as canonical
  custom_colors:        { title: 'Custom Branding & Design',   upgradeTarget: 'Professional', message: 'Upgrade to Professional to fully customize your profile branding and colors.' },
  custom_design:        { title: 'Custom Branding & Design',   upgradeTarget: 'Professional', message: 'Upgrade to Professional to fully customize your profile branding and colors.' },

  // ── Business / Industry shared tier ──
  team_members:         { title: 'Team Members',               upgradeTarget: 'Business',     message: 'Upgrade to a Business, Salon, Restaurant, or Law Firm plan to manage team members.' },
  google_reviews:       { title: 'Google Review Link',         upgradeTarget: 'Business',     message: 'Upgrade to a Business or industry plan to add a Google review link.' },
  google_review_link:   { title: 'Google Review Link',         upgradeTarget: 'Business',     message: 'Upgrade to a Business or industry plan to add a Google review link.' },
  whatsapp_booking:     { title: 'WhatsApp Booking Button',    upgradeTarget: 'Business',     message: 'Upgrade to a Business or industry plan to add a WhatsApp booking button.' },
  advanced_analytics:   { title: 'Advanced Analytics',         upgradeTarget: 'Business',     message: 'Upgrade to a Business or industry plan for advanced analytics.' },
  lead_export:          { title: 'Lead Export',                upgradeTarget: 'Business',     message: 'Upgrade to a Business or industry plan to export leads as CSV.' },
  services:             { title: 'Services / Menu Section',    upgradeTarget: 'Business',     message: 'Upgrade to a Business, Salon, or Restaurant plan to showcase services or a menu.' },
  service_menu:         { title: 'Services / Menu Section',    upgradeTarget: 'Business',     message: 'Upgrade to a Business, Salon, or Restaurant plan to showcase services or a menu.' },
  menu_services:        { title: 'Services / Menu Section',    upgradeTarget: 'Business',     message: 'Upgrade to a Business, Salon, or Restaurant plan to showcase services or a menu.' },
  nfc_counter_stand:    { title: 'NFC Counter Stand',          upgradeTarget: 'Business',     message: 'Upgrade to a Business, Salon, or Restaurant plan for NFC counter stand support.' },

  // ── Salon-specific ──
  salon_profile:        { title: 'Salon Business Profile',     upgradeTarget: 'Salon',        message: 'Upgrade to the Salon plan for a full salon business profile.' },
  staff_profiles:       { title: 'Staff Profiles',             upgradeTarget: 'Salon',        message: 'Upgrade to the Salon or Law Firm plan to manage staff profiles.' },
  instagram_gallery:    { title: 'Instagram Gallery',          upgradeTarget: 'Salon',        message: 'Upgrade to the Salon plan for a full Instagram gallery showcase.' },
  instagram_showcase:   { title: 'Instagram Gallery',          upgradeTarget: 'Salon',        message: 'Upgrade to the Salon plan for a full Instagram gallery showcase.' },

  // ── Restaurant-specific ──
  restaurant_profile:   { title: 'Restaurant Business Profile', upgradeTarget: 'Restaurant',  message: 'Upgrade to the Restaurant plan for a full restaurant business profile.' },
  digital_menu:         { title: 'Digital Menu',               upgradeTarget: 'Restaurant',   message: 'Upgrade to the Restaurant plan to display your digital menu.' },
  food_ordering:        { title: 'Food Ordering',              upgradeTarget: 'Restaurant',   message: 'Upgrade to the Restaurant plan to add food ordering links.' },
  food_order_link:      { title: 'Food Ordering',              upgradeTarget: 'Restaurant',   message: 'Upgrade to the Restaurant plan to add food ordering links.' },
  delivery_links:       { title: 'Delivery Links',             upgradeTarget: 'Restaurant',   message: 'Upgrade to the Restaurant plan to add delivery links.' },
  delivery_link:        { title: 'Delivery Links',             upgradeTarget: 'Restaurant',   message: 'Upgrade to the Restaurant plan to add delivery links.' },
  reservations:         { title: 'Reservations',               upgradeTarget: 'Restaurant',   message: 'Upgrade to the Restaurant plan to enable table reservations.' },
  whatsapp_ordering:    { title: 'WhatsApp Ordering',          upgradeTarget: 'Restaurant',   message: 'Upgrade to the Restaurant plan for WhatsApp ordering.' },
  nfc_table_stand:      { title: 'NFC Table Stand',            upgradeTarget: 'Restaurant',   message: 'Upgrade to the Restaurant plan for NFC table stand support.' },

  // ── Law Firm-specific ──
  law_firm_profile:     { title: 'Law Firm Profile',           upgradeTarget: 'Law Firm',     message: 'Upgrade to the Law Firm plan for a full law firm business profile.' },
  practice_areas:       { title: 'Practice Areas',             upgradeTarget: 'Law Firm',     message: 'Upgrade to the Law Firm plan to manage your practice areas.' },
  legal_services:       { title: 'Legal Services',             upgradeTarget: 'Law Firm',     message: 'Upgrade to the Law Firm plan to list your legal services.' },
  lead_intake_forms:    { title: 'Legal Intake Forms',         upgradeTarget: 'Law Firm',     message: 'Upgrade to the Law Firm plan for legal intake forms.' },
  consultation_form:    { title: 'Legal Intake Forms',         upgradeTarget: 'Law Firm',     message: 'Upgrade to the Law Firm plan for legal intake forms.' },
  client_intake:        { title: 'Client Intake',              upgradeTarget: 'Law Firm',     message: 'Upgrade to the Law Firm plan for client intake workflows.' },
  crm_pipeline:         { title: 'CRM Pipeline',               upgradeTarget: 'Law Firm',     message: 'Upgrade to the Law Firm plan for a full CRM pipeline.' },
  case_dashboard:       { title: 'Case Dashboard',             upgradeTarget: 'Law Firm',     message: 'Upgrade to the Law Firm plan for the case management dashboard.' },
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

// ── Legacy compatibility shims ─────────────────────────────────────────────────
// These are kept so any file that imports them doesn't hard-crash.
// canAccess() no longer uses PLAN_HIERARCHY or FEATURE_REQUIREMENTS internally.

export const FEATURE_REQUIREMENTS = {
  nfc_devices: {
    maxDevices: {
      free: 0, professional: 5, pro: 5,
      business: 10, salon: 10, restaurant: 10,
      lawfirm: 25, corporate: 50,
    }
  }
};

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