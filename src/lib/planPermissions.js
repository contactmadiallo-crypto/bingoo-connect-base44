/**
 * Bingoo Connect — Plan Permissions
 * Single source of truth for all 6 industry plans.
 */

export const PLAN_HIERARCHY = {
  free:        0,
  professional: 1,
  salon:       2,
  restaurant:  3,
  lawfirm:     4,
  corporate:   5,
  // Legacy aliases
  pro:         1,
  business:    3,
};

export const PLAN_LABELS = {
  free:        'Free',
  professional: 'Professional',
  pro:         'Professional',
  salon:       'Salon',
  restaurant:  'Restaurant',
  lawfirm:     'Law Firm',
  business:    'Restaurant',
  corporate:   'Corporate Team',
};

export const PLAN_COLORS = {
  free:        { bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0' },
  professional: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
  pro:         { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
  salon:       { bg: '#fdf2f8', text: '#be185d', border: '#fbcfe8' },
  restaurant:  { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
  business:    { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
  lawfirm:     { bg: '#f0f9ff', text: '#0369a1', border: '#bae6fd' },
  corporate:   { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' },
};

// Maps plan ID → Stripe product ID from platform context
export const PLAN_STRIPE_PRODUCTS = {
  professional: 'prod_UdL2W8XwDY3Bmq',  // $4.99/mo — repurpose existing Pro
  lawfirm:     'prod_UdL2NqVtcHwKb2',   // $14.99/mo — repurpose existing Business
  // salon, restaurant, corporate — need new products (will be created dynamically)
};

export const FEATURE_REQUIREMENTS = {
  // Core features
  nfc_devices:          { plans: ['professional','pro','salon','restaurant','lawfirm','corporate','business'], maxDevices: { free: 0, professional: 5, pro: 5, salon: 10, restaurant: 10, lawfirm: 25, corporate: 50, business: 25 } },
  analytics:            { plans: ['professional','pro','salon','restaurant','lawfirm','corporate','business'] },
  lead_collection:      { plans: ['professional','pro','salon','restaurant','lawfirm','corporate','business'] },
  appointment_booking:  { plans: ['professional','pro','salon','restaurant','lawfirm','corporate','business'] },
  save_contact:         { plans: ['professional','pro','salon','restaurant','lawfirm','corporate','business'] },
  custom_colors:        { plans: ['professional','pro','salon','restaurant','lawfirm','corporate','business'] },
  qr_download:          { plans: ['professional','pro','salon','restaurant','lawfirm','corporate','business'] },
  digital_resume:       { plans: ['professional','pro','salon','restaurant','lawfirm','corporate','business'] },

  // Industry-specific
  storefront:           { plans: ['restaurant','business','corporate'] },
  team_members:         { plans: ['lawfirm','corporate'],   maxMembers: { lawfirm: 20, corporate: 100 } },
  advanced_analytics:   { plans: ['salon','restaurant','lawfirm','corporate','business'] },
  marketplace_listing:  { plans: ['restaurant','business'] },
  lead_export:          { plans: ['salon','restaurant','lawfirm','corporate','business'] },
  menu_services:        { plans: ['salon','restaurant','lawfirm','corporate','business'] },
  consultation_form:    { plans: ['lawfirm'] },
  crm_pipeline:         { plans: ['lawfirm','corporate'] },
  clock_in_out:         { plans: ['corporate'] },
  attendance_dashboard: { plans: ['corporate'] },
  admin_roles:          { plans: ['lawfirm','corporate'] },
  service_menu:         { plans: ['salon','restaurant'] },
  online_ordering:      { plans: ['restaurant'] },
  nfc_table_stand:      { plans: ['restaurant'] },
  nfc_counter_stand:    { plans: ['salon'] },
  staff_profiles:       { plans: ['salon','restaurant','lawfirm','corporate'] },
  instagram_integration:{ plans: ['salon','professional','pro'] },
  google_review_link:   { plans: ['salon','restaurant'] },
  whatsapp_booking:     { plans: ['salon','restaurant','lawfirm'] },
};

export const FEATURE_DESCRIPTIONS = {
  nfc_devices:          { title: 'NFC Device Activation',    upgradeTarget: 'Professional', message: 'Upgrade to activate NFC devices and tap-to-share your profile.' },
  analytics:            { title: 'Analytics Dashboard',      upgradeTarget: 'Professional', message: 'Upgrade to view full analytics and track profile performance.' },
  lead_collection:      { title: 'Lead Collection',          upgradeTarget: 'Professional', message: 'Upgrade to collect and manage leads from your profile.' },
  appointment_booking:  { title: 'Appointment Booking',      upgradeTarget: 'Professional', message: 'Upgrade to let clients book appointments directly.' },
  save_contact:         { title: 'Save Contact Button',      upgradeTarget: 'Professional', message: 'Upgrade to let visitors save your contact to their phone.' },
  custom_colors:        { title: 'Custom Profile Colors',    upgradeTarget: 'Professional', message: 'Upgrade to fully customize your profile colors and branding.' },
  qr_download:          { title: 'QR Code Download',         upgradeTarget: 'Professional', message: 'Upgrade to download and print your profile QR code.' },
  digital_resume:       { title: 'Digital Resume',           upgradeTarget: 'Professional', message: 'Upgrade to create a full digital resume profile.' },
  storefront:           { title: 'Digital Storefront',       upgradeTarget: 'Restaurant',   message: 'Upgrade to the Restaurant plan to sell products and services.' },
  team_members:         { title: 'Team Members',             upgradeTarget: 'Law Firm / Corporate', message: 'Upgrade to manage team cards and staff profiles.' },
  advanced_analytics:   { title: 'Advanced Analytics',       upgradeTarget: 'Salon+',       message: 'Upgrade for advanced analytics and customer insights.' },
  lead_export:          { title: 'Lead Export',              upgradeTarget: 'Salon+',       message: 'Upgrade to export your customer leads as CSV.' },
  consultation_form:    { title: 'Legal Consultation Form',  upgradeTarget: 'Law Firm',     message: 'Upgrade to the Law Firm plan for legal intake forms.' },
  crm_pipeline:         { title: 'CRM Pipeline',             upgradeTarget: 'Law Firm+',    message: 'Upgrade to Law Firm or Corporate for a full CRM pipeline.' },
  clock_in_out:         { title: 'Clock In / Clock Out',     upgradeTarget: 'Corporate',    message: 'Upgrade to the Corporate plan for time tracking.' },
  attendance_dashboard: { title: 'Attendance Dashboard',     upgradeTarget: 'Corporate',    message: 'Upgrade to the Corporate plan for attendance management.' },
  admin_roles:          { title: 'Admin Role Management',    upgradeTarget: 'Corporate',    message: 'Upgrade to manage admin roles across your team.' },
  service_menu:         { title: 'Service Menu',             upgradeTarget: 'Salon',        message: 'Upgrade to display your full service menu.' },
  online_ordering:      { title: 'Online Ordering',          upgradeTarget: 'Restaurant',   message: 'Upgrade to the Restaurant plan for online ordering.' },
  nfc_table_stand:      { title: 'NFC Table Stand',          upgradeTarget: 'Restaurant',   message: 'Upgrade to the Restaurant plan for NFC table stands.' },
  nfc_counter_stand:    { title: 'NFC Counter Stand',        upgradeTarget: 'Salon',        message: 'Upgrade to the Salon plan for NFC counter stands.' },
  staff_profiles:       { title: 'Staff Profiles',           upgradeTarget: 'Salon+',       message: 'Upgrade to manage staff profiles.' },
  google_review_link:   { title: 'Google Review Link',       upgradeTarget: 'Salon+',       message: 'Upgrade to add a Google review link to your profile.' },
  whatsapp_booking:     { title: 'WhatsApp Booking Button',  upgradeTarget: 'Salon+',       message: 'Upgrade to add a WhatsApp booking button.' },
  menu_services:        { title: 'Menu / Services Section',  upgradeTarget: 'Salon+',       message: 'Upgrade to showcase your menu or services.' },
};

/**
 * Returns true if the given plan can access a feature.
 */
export function canAccess(userPlan, featureKey) {
  const req = FEATURE_REQUIREMENTS[featureKey];
  if (!req) return true;
  const normalizedPlan = userPlan === 'pro' ? 'professional' : userPlan === 'business' ? 'restaurant' : userPlan;
  return (req.plans || []).includes(normalizedPlan);
}

export function maxNFCDevices(userPlan) {
  return FEATURE_REQUIREMENTS.nfc_devices.maxDevices[userPlan] ?? 0;
}

export function maxTeamMembers(userPlan) {
  return FEATURE_REQUIREMENTS.team_members.maxMembers?.[userPlan] ?? 0;
}

export function resolveActivePlan(subscription) {
  if (!subscription) return 'free';
  const { status, plan } = subscription;
  if (status === 'canceled' || status === 'past_due') return 'free';
  if (plan && plan !== 'free') return plan;
  return 'free';
}