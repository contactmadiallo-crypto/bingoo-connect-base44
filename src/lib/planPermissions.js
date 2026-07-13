import { Zap, Star, Building2, Scissors, Scale, Briefcase } from 'lucide-react';

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
  'instagram_integration',
  'calendar',
  // Wallet passes
  'google_wallet_pass',
  'apple_wallet_pass',
]);

const BUSINESS_FEATURES = new Set([
  ...PROFESSIONAL_FEATURES,
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
]);

const SALON_FEATURES = new Set([
  ...BUSINESS_FEATURES,
  'business_hours',
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
  'business_hours',
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
  ...BUSINESS_FEATURES,
  'business_hours',
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

const CORPORATE_FEATURES = new Set([
  ...BUSINESS_FEATURES,
  'api_access',
  'bulk_nfc_orders',
  'custom_onboarding',
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
  // Business-tier features
  'business_profile',
  'design_studio',
  'product_showcase',
  'staff_cards',
  'customer_inquiry',
  'multi_profile',
  'business_qr_landing',
  // Enterprise-tier features
  'api_access',
  'bulk_nfc_orders',
  'custom_onboarding',
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
  corporate:    'Enterprise / Bulk',
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
  corporate:    'prod_UsKCo8sDBXEsuY',
};

export const PLAN_FEATURES = {
  free:         ['1 profile', 'Public profile link', 'Basic contact links', 'Social links', 'QR code', 'Save contact', 'Limited analytics preview'],
  professional: ['Everything in Free', 'Multiple NFC Devices', 'Lead Collection', 'Analytics Dashboard', 'Portfolio & Gallery', 'Custom Branding', 'QR Code Download', 'Save Contact Button', 'Appointment Booking', 'Lost Mode for NFC', 'Instagram Integration', 'Calendar View', 'Google Wallet Pass', 'Apple Wallet Pass'],
  business:     ['Everything in Professional', 'Business Public Profile', 'Design Studio', 'Team Management', 'Services & Product Showcase', 'WhatsApp Booking', 'NFC Counter Stand', 'Business Hours', 'Staff Cards', 'Customer Inquiry Buttons', 'Multi-Profile Management', 'Business QR/NFC Landing', 'Advanced Analytics', 'Lead Export'],
  salon:        ['Everything in Business', 'Salon Business Profile', 'Staff Profiles', 'Services Menu', 'Instagram Gallery', 'Google Reviews', 'WhatsApp Booking', 'NFC Counter Stand', 'Advanced Analytics', 'Lead Export'],
  lawfirm:      ['Everything in Business', 'Law Firm Profile', 'Practice Areas', 'Attorney Profiles', 'Legal Services', 'Office Locations', 'Team Members', 'Lead Intake Forms', 'CRM Pipeline', 'Case Dashboard', 'Immigration, Criminal, Civil & Family Forms', 'Advanced Analytics', 'Lead Export'],
  corporate:    ['Everything in Business', 'Custom Onboarding', 'Team Management', 'API Access', 'Bulk NFC Orders', 'Admin Support', 'Employee Profiles', 'Attendance Dashboard'],
};

// Plain-language taglines explaining what each plan is for
export const PLAN_TAGLINES = {
  free:         'Basic personal profile and QR sharing',
  professional: 'Premium profile, NFC, analytics, leads, and appointments',
  business:     'Company profile, team, services, business tools, and multi-device',
  salon:        'Business foundation plus salon services, staff, gallery, reviews, and booking',
  lawfirm:      'Business foundation plus attorneys, practice areas, legal intake, and offices',
  corporate:    'Custom onboarding, teams, API, bulk NFC, and admin support',
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

// Industry/business-tier plans fall back to Professional (not Free) when a subscription
// is canceled or a trial ends unpaid — they're built on top of Professional.
// Professional itself falls back to Free. Mirrors the policy in getUserFeatures.
const INDUSTRY_PLANS = new Set(['salon', 'restaurant', 'lawfirm', 'business', 'corporate']);
function downgradedPlan(plan) {
  return INDUSTRY_PLANS.has(plan) ? 'professional' : 'free';
}

/**
 * Resolves active plan from a subscription record.
 * - No subscription → free
 * - canceled → Professional if it was a business-tier plan, else Free
 * - past_due → keep current plan (grace period, Stripe retries)
 * - active → use plan field
 */
export function resolveActivePlan(subscription) {
  if (!subscription) return 'free';
  const { status, plan } = subscription;
  if (status === 'canceled') return downgradedPlan(normalizePlan(plan));
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
  portfolio:            { title: 'Portfolio / Gallery',        upgradeTarget: 'Professional', message: 'Upgrade to Professional to showcase your portfolio and projects.' },
  lost_mode:            { title: 'Lost Mode Recovery',         upgradeTarget: 'Professional', message: 'Upgrade to Professional to enable Lost Mode for your NFC devices.' },
  instagram_integration:{ title: 'Instagram Integration',      upgradeTarget: 'Professional', message: 'Upgrade to Professional to connect your Instagram to your profile.' },
  google_wallet_pass:   { title: 'Google Wallet Pass',         upgradeTarget: 'Professional', message: 'Upgrade to Professional to generate a Google Wallet digital card.' },
  apple_wallet_pass:    { title: 'Apple Wallet Pass',          upgradeTarget: 'Professional', message: 'Upgrade to Professional to generate an Apple Wallet digital card.' },
  business_hours:       { title: 'Business Hours',             upgradeTarget: 'Business',     message: 'Upgrade to the Business plan to display your business hours.' },
  calendar:             { title: 'Calendar View',              upgradeTarget: 'Professional', message: 'Upgrade to Professional to access the calendar view.' },
  // Aliases for backward compat — same gate as canonical
  custom_colors:        { title: 'Custom Branding & Design',   upgradeTarget: 'Professional', message: 'Upgrade to Professional to fully customize your profile branding and colors.' },
  custom_design:        { title: 'Custom Branding & Design',   upgradeTarget: 'Professional', message: 'Upgrade to Professional to fully customize your profile branding and colors.' },

  // ── Business / Industry shared tier (cheapest purchasable = Salon) ──
  team_members:         { title: 'Team Members',               upgradeTarget: 'Business',     message: 'Upgrade to the Business plan to manage team members.' },
  google_reviews:       { title: 'Google Review Link',         upgradeTarget: 'Business',     message: 'Upgrade to the Business plan to add a Google review link.' },
  google_review_link:   { title: 'Google Review Link',         upgradeTarget: 'Salon',        message: 'Upgrade to the Salon or Law Firm plan to add a Google review link.' },
  whatsapp_booking:     { title: 'WhatsApp Booking Button',    upgradeTarget: 'Business',     message: 'Upgrade to the Business plan to add a WhatsApp booking button.' },
  advanced_analytics:   { title: 'Advanced Analytics',         upgradeTarget: 'Business',     message: 'Upgrade to the Business plan for advanced analytics.' },
  lead_export:          { title: 'Lead Export',                upgradeTarget: 'Business',     message: 'Upgrade to the Business plan to export leads as CSV.' },
  services:             { title: 'Services / Menu Section',    upgradeTarget: 'Business',     message: 'Upgrade to the Business plan to showcase services or a menu.' },
  service_menu:         { title: 'Services / Menu Section',    upgradeTarget: 'Salon',        message: 'Upgrade to the Salon plan to showcase services or a menu.' },
  menu_services:        { title: 'Services / Menu Section',    upgradeTarget: 'Salon',        message: 'Upgrade to the Salon plan to showcase services or a menu.' },
  nfc_counter_stand:    { title: 'NFC Counter Stand',          upgradeTarget: 'Business',     message: 'Upgrade to the Business plan for NFC counter stand support.' },

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

  // ── Business-tier features ──
  design_studio:        { title: 'Design Studio',              upgradeTarget: 'Business',     message: 'Upgrade to the Business plan to access the Design Studio for custom NFC cards.' },
  business_profile:     { title: 'Business Public Profile',    upgradeTarget: 'Business',     message: 'Upgrade to the Business plan for a full business public profile.' },
  product_showcase:     { title: 'Product / Service Showcase', upgradeTarget: 'Business',     message: 'Upgrade to the Business plan to showcase products and services.' },
  staff_cards:          { title: 'Staff Cards',                upgradeTarget: 'Business',     message: 'Upgrade to the Business plan to create staff NFC cards.' },
  customer_inquiry:     { title: 'Customer Inquiry Buttons',   upgradeTarget: 'Business',     message: 'Upgrade to the Business plan for customer inquiry buttons.' },
  multi_profile:        { title: 'Multi-Profile Management',   upgradeTarget: 'Business',     message: 'Upgrade to the Business plan to manage multiple profiles.' },
  business_qr_landing:  { title: 'Business QR/NFC Landing',    upgradeTarget: 'Business',     message: 'Upgrade to the Business plan for a business QR/NFC landing page.' },
  api_access:           { title: 'API Access',                 upgradeTarget: 'Enterprise / Bulk', message: 'Contact us for API access on the Enterprise plan.' },
  bulk_nfc_orders:      { title: 'Bulk NFC Orders',            upgradeTarget: 'Enterprise / Bulk', message: 'Contact us for bulk NFC ordering on the Enterprise plan.' },
  custom_onboarding:    { title: 'Custom Onboarding',          upgradeTarget: 'Enterprise / Bulk', message: 'Contact us for custom onboarding on the Enterprise plan.' },

  // ── Corporate-specific ──
  attendance:           { title: 'Attendance Dashboard',       upgradeTarget: 'Corporate',    message: 'Upgrade to the Corporate plan for clock in/out and attendance tracking.' },
  attendance_dashboard: { title: 'Attendance Dashboard',       upgradeTarget: 'Corporate',    message: 'Upgrade to the Corporate plan for clock in/out and attendance tracking.' },
  employee_profiles:    { title: 'Employee Profiles',          upgradeTarget: 'Corporate',    message: 'Upgrade to the Corporate plan to manage employee profiles.' },
};

// ── Dashboard Tab Visibility Matrix ──────────────────────────────────────────
//
// Single source of truth for which tabs appear in BingooDashboard.
// Each entry describes the conditions under which a tab is visible.
//
// account_type:
//   "any"        → shown to all account types (including legacy null → treated as individual)
//   "business"   → only shown when account_type === "business" (or legacy null)
//   "!individual"→ hidden only for explicit account_type === "individual"
//
// planFeature (optional):
//   canAccess(plan, planFeature) must return true
//
// Tab visibility rules (evaluated in BingooDashboard):
//   - "any"         → always shown
//   - "!individual" → shown unless explicitlyIndividual
//   - "business"    → same as "!individual" (business accounts or legacy null)
//
// FEATURE PERMISSION MATRIX
// ─────────────────────────────────────────────────────────────────────────────
// Tab               | free | pro | business | salon | lawfirm | corporate | admin
// ─────────────────────────────────────────────────────────────────────────────
// overview          |  ✓   |  ✓  |    ✓     |   ✓   |    ✓    |     ✓     |  ✓
// profile           |  ✓   |  ✓  |    ✓     |   ✓   |    ✓    |     ✓     |  ✓
// analytics         |  ✗*  |  ✓  |    ✓     |   ✓   |    ✓    |     ✓     |  ✓
// portfolio         |  ✓†  |  ✓  |    ✓     |   ✓   |    ✓    |     ✓     |  ✓
// resumes           |  ✓†  |  ✓  |    ✓     |   ✗   |    ✗    |     ✓     |  ✓
// connections       |  ✓   |  ✓  |    ✓     |   ✓   |    ✓    |     ✓     |  ✓
// lost_mode         |  ✗   |  ✓  |    ✓     |   ✓   |    ✓    |     ✓     |  ✓
// appointments      |  ✗   |  ✗  |    ✓     |   ✓   |    ✓    |     ✓     |  ✓
// leads             |  ✗   |  ✗  |    ✓     |   ✓   |    ✓    |     ✓     |  ✓
// services/hours    |  ✗   |  ✗  |    ✓†    |   ✓   |    ✗    |     ✗     |  ✓
// practice_areas    |  ✗   |  ✗  |    ✗     |   ✗   |    ✓    |     ✓     |  ✓
// legal_services    |  ✗   |  ✗  |    ✗     |   ✗   |    ✓    |     ✓     |  ✓
// offices           |  ✗   |  ✗  |    ✗     |   ✗   |    ✓    |     ✓     |  ✓
// team              |  ✗   |  ✗  |    ✓     |   ✓   |    ✓    |     ✓     |  ✓
// crm               |  ✗   |  ✗  |    ✗     |   ✗   |    ✓    |     ✓     |  ✓
// attendance        |  ✗   |  ✗  |    ✗     |   ✗   |    ✗    |     ✓     |  ✓
// ─────────────────────────────────────────────────────────────────────────────
// * analytics: hidden for explicitlyIndividual + free plan (canAccess check)
// † portfolio/resumes/portfolio gate: content-gated via PlanGateScreen inside tab
//
// ProfileEditor field gating:
//   Company Logo        → hidden when isFreeIndividual (individual + free)
//   Booking Settings    → hidden when isFreeIndividual (individual + free)
//   Business Extras     → only shown when profile.plan in [salon, restaurant, business]
//
// Stripe precedence (usePlan):
//   1. Stripe-backed sub (has stripe_subscription_id or stripe_customer_id)
//      - active    → use sub.plan
//      - past_due  → use sub.plan (grace period)
//      - canceled  → downgrade to free
//   2. Manual/legacy: max(sub.plan, profile.plan) — no downgrade on manual cancel
//   3. Default: free

// ── Effective Profile Plan ────────────────────────────────────────────────────
/**
 * getEffectiveProfilePlan(accountPlan, profile)
 *
 * The account subscription is the SOURCE OF TRUTH for entitlement.
 * A stale profile.plan of "free" must never override a paid account subscription.
 *
 * Rules:
 *   1. If accountPlan is a paid plan (non-free), it is the floor — always win.
 *   2. If profile has a vertical plan (salon/lawfirm/restaurant/corporate/business),
 *      that vertical overrides an equal-or-lower account plan IF the account is also paid.
 *   3. Free account → profile.plan is only used when it is also "free".
 *      (No free profile badge for paid accounts.)
 *
 * This means:
 *   - accountPlan=professional, profile.plan=free  → returns "professional"
 *   - accountPlan=professional, profile.plan=salon → returns "salon" (salon > professional)
 *   - accountPlan=free,         profile.plan=free  → returns "free"
 *   - accountPlan=free,         profile.plan=salon → returns "salon" (manually set vertical)
 */
export function getEffectiveProfilePlan(accountPlan, profile) {
  const accNorm   = normalizePlan(accountPlan || 'free');
  const profNorm  = normalizePlan(profile?.plan || 'free');
  const accScore  = PLAN_HIERARCHY[accNorm]  ?? 0;
  const profScore = PLAN_HIERARCHY[profNorm] ?? 0;
  // Return whichever is higher
  return profScore >= accScore ? profNorm : accNorm;
}

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
  salon:        3,
  restaurant:   2,
  lawfirm:      3,
  corporate:    4,
};

// ── Purchasable vs Coming Soon Plans ──────────────────────────────────────────
// Only these plans can be purchased right now. Others are under construction.
export const PURCHASABLE_PLANS = ['professional', 'business', 'salon', 'lawfirm'];
export const COMING_SOON_PLANS = [];
export const COMING_SOON_PLAN_META = [];

// Enterprise / Bulk is a contact-sales plan (no self-serve checkout)
export const CONTACT_SALES_PLANS = ['corporate'];

// Helper: is this plan purchasable right now?
export function isPurchasable(planId) {
  return PURCHASABLE_PLANS.includes(planId);
}

// ── Unified Plan Configuration (Single Source of Truth) ───────────────────────
// All customer-facing plan metadata lives here. Every page that displays plan
// information — landing pricing, /plans, Plan Journeys, billing, upgrade modals,
// onboarding, dashboard previews — should import from PLAN_CONFIG.
// Do NOT create duplicate hardcoded plan lists elsewhere.

export const PLAN_CONFIG = {
  free: {
    id: 'free',
    label: 'Free',
    tagline: PLAN_TAGLINES.free,
    priceMonthly: 0,
    priceAnnual: 0,
    icon: Zap,
    color: PLAN_COLORS.free,
    hierarchy: 0,
    status: 'free', // free | purchasable | contact_sales
    features: PLAN_FEATURES.free,
    dashboardPreview: ['1 Profile', 'Public Link', 'QR Code', 'Basic Analytics Preview'],
    includedTools: ['Profile Editor', 'QR Code'],
  },
  professional: {
    id: 'professional',
    label: 'Professional',
    tagline: PLAN_TAGLINES.professional,
    priceMonthly: PLAN_PRICES_USD.professional,
    priceAnnual: 53.89,
    icon: Star,
    color: PLAN_COLORS.professional,
    stripeProductId: PLAN_STRIPE_PRODUCTS.professional,
    hierarchy: 1,
    status: 'purchasable',
    features: PLAN_FEATURES.professional,
    dashboardPreview: ['Multiple NFC Devices', 'Lead Collection', 'Analytics Dashboard', 'Portfolio & Gallery', 'Appointment Booking', 'Lost Mode', 'Google & Apple Wallet'],
    includedTools: ['Profile Editor', 'QR & Wallet', 'NFC Devices', 'Leads', 'Analytics', 'Portfolio', 'Appointments', 'Lost Mode'],
  },
  business: {
    id: 'business',
    label: 'Business',
    tagline: PLAN_TAGLINES.business,
    priceMonthly: PLAN_PRICES_USD.business,
    priceAnnual: 161.89,
    icon: Building2,
    color: PLAN_COLORS.business,
    stripeProductId: PLAN_STRIPE_PRODUCTS.business,
    hierarchy: 2,
    status: 'purchasable',
    features: PLAN_FEATURES.business,
    dashboardPreview: ['Business Public Profile', 'Design Studio', 'Team Management', 'Services & Products', 'WhatsApp Booking', 'Advanced Analytics', 'Lead Export', 'Multi-Profile'],
    includedTools: ['Profile Editor', 'QR & Wallet', 'NFC Devices', 'Leads', 'Analytics', 'Portfolio', 'Appointments', 'Lost Mode', 'Design Studio', 'Business Profile', 'Team', 'Services', 'Business Hours'],
  },
  salon: {
    id: 'salon',
    label: 'Salon',
    tagline: PLAN_TAGLINES.salon,
    priceMonthly: PLAN_PRICES_USD.salon,
    priceAnnual: 215.89,
    icon: Scissors,
    color: PLAN_COLORS.salon,
    stripeProductId: PLAN_STRIPE_PRODUCTS.salon,
    hierarchy: 3,
    status: 'purchasable',
    features: PLAN_FEATURES.salon,
    dashboardPreview: ['Salon Business Profile', 'Staff Profiles', 'Services Menu', 'Instagram Gallery', 'Google Reviews', 'WhatsApp Booking', 'NFC Counter Stand'],
    includedTools: ['Everything in Business', 'Salon Profile', 'Staff Profiles', 'Services Menu', 'Instagram Gallery'],
  },
  lawfirm: {
    id: 'lawfirm',
    label: 'Law Firm',
    tagline: PLAN_TAGLINES.lawfirm,
    priceMonthly: PLAN_PRICES_USD.lawfirm,
    priceAnnual: 529.20,
    icon: Scale,
    color: PLAN_COLORS.lawfirm,
    stripeProductId: PLAN_STRIPE_PRODUCTS.lawfirm,
    hierarchy: 3,
    status: 'purchasable',
    features: PLAN_FEATURES.lawfirm,
    dashboardPreview: ['Law Firm Profile', 'Practice Areas', 'Attorney Profiles', 'Legal Services', 'Office Locations', 'Lead Intake Forms', 'CRM Pipeline'],
    includedTools: ['Everything in Business', 'Law Firm Profile', 'Practice Areas', 'Attorneys', 'Legal Services', 'Offices', 'CRM Pipeline'],
  },
  corporate: {
    id: 'corporate',
    label: 'Enterprise / Bulk',
    tagline: PLAN_TAGLINES.corporate,
    priceMonthly: PLAN_PRICES_USD.corporate,
    priceAnnual: 1069.20,
    icon: Briefcase,
    color: PLAN_COLORS.corporate,
    hierarchy: 4,
    status: 'contact_sales',
    features: PLAN_FEATURES.corporate,
    dashboardPreview: ['Custom Onboarding', 'API Access', 'Bulk NFC Orders', 'Employee Profiles', 'Attendance Dashboard', 'Admin Support'],
    includedTools: ['Everything in Business', 'API Access', 'Bulk Orders', 'Employee Profiles', 'Attendance'],
  },
};

// Ordered list of customer-facing plan IDs (excludes admin; restaurant kept for backward compat only)
export const CUSTOMER_PLAN_IDS = ['free', 'professional', 'business', 'salon', 'lawfirm', 'corporate'];

// Helper: get PLAN_CONFIG entry for a plan ID (normalized)
export function getPlanConfig(planId) {
  const normalized = normalizePlan(planId);
  return PLAN_CONFIG[normalized] || PLAN_CONFIG.free;
}

// Helper: format monthly price as string
export function formatPlanPrice(planId, cycle = 'monthly') {
  const config = getPlanConfig(planId);
  const price = cycle === 'annual' ? config.priceAnnual : config.priceMonthly;
  if (price === 0) return 'Free';
  return cycle === 'annual' ? `$${price.toFixed(2)}/yr` : `$${price.toFixed(2)}/mo`;
}