/**
 * Bingoo Connect — Plan Permissions Helper
 * Single source of truth for feature access by plan.
 */

export const PLAN_HIERARCHY = { free: 0, pro: 1, business: 2 };

export const PLAN_LABELS = {
  free: 'Free',
  pro: 'Pro',
  business: 'Business',
};

export const FEATURE_REQUIREMENTS = {
  nfc_devices:         { minPlan: 'pro',      maxDevices: { free: 0, pro: 5, business: 25 } },
  analytics:           { minPlan: 'pro' },
  lead_collection:     { minPlan: 'pro' },
  appointment_booking: { minPlan: 'pro' },
  save_contact:        { minPlan: 'pro' },
  custom_colors:       { minPlan: 'pro' },
  qr_download:         { minPlan: 'pro' },
  digital_resume:      { minPlan: 'pro' },
  storefront:          { minPlan: 'business' },
  team_members:        { minPlan: 'business',  maxMembers: { pro: 0, business: 10 } },
  advanced_analytics:  { minPlan: 'business' },
  marketplace_listing: { minPlan: 'business' },
  lead_export:         { minPlan: 'business' },
  menu_services:       { minPlan: 'business' },
};

export const FEATURE_DESCRIPTIONS = {
  nfc_devices:         { title: 'NFC Device Activation', upgradeTarget: 'Pro',      message: 'Upgrade to Pro to activate NFC devices and tap-to-share your profile.' },
  analytics:           { title: 'Analytics Dashboard',   upgradeTarget: 'Pro',      message: 'Upgrade to Pro to view full analytics and track profile performance.' },
  lead_collection:     { title: 'Lead Collection',       upgradeTarget: 'Pro',      message: 'Upgrade to Pro to collect and manage leads from your profile.' },
  save_contact:        { title: 'Save Contact Button',   upgradeTarget: 'Pro',      message: 'Upgrade to Pro to let visitors save your contact directly to their phone.' },
  custom_colors:       { title: 'Custom Profile Colors', upgradeTarget: 'Pro',      message: 'Upgrade to Pro to fully customize your profile colors and branding.' },
  qr_download:         { title: 'QR Code Download',      upgradeTarget: 'Pro',      message: 'Upgrade to Pro to download and print your profile QR code.' },
  digital_resume:      { title: 'Digital Resume',        upgradeTarget: 'Pro',      message: 'Upgrade to Pro to create a full digital resume profile.' },
  storefront:          { title: 'Digital Storefront',    upgradeTarget: 'Business', message: 'Upgrade to Business to sell products and services from your profile.' },
  appointment_booking: { title: 'Appointment Booking',   upgradeTarget: 'Pro',      message: 'Upgrade to Pro to let clients book appointments directly.' },
  team_members:        { title: 'Team Members',          upgradeTarget: 'Business', message: 'Upgrade to Business to manage team cards and staff profiles.' },
  advanced_analytics:  { title: 'Advanced Analytics',    upgradeTarget: 'Business', message: 'Upgrade to Business for advanced analytics and customer insights.' },
  marketplace_listing: { title: 'Marketplace Listing',   upgradeTarget: 'Business', message: 'Upgrade to Business to get listed in the Bingoo Marketplace.' },
  lead_export:         { title: 'Lead Export',           upgradeTarget: 'Business', message: 'Upgrade to Business to export your customer leads as CSV.' },
  menu_services:       { title: 'Menu / Services',       upgradeTarget: 'Business', message: 'Upgrade to Business to showcase your menu or services section.' },
};

/**
 * Returns true if the given plan can access a feature.
 */
export function canAccess(userPlan, featureKey) {
  const req = FEATURE_REQUIREMENTS[featureKey];
  if (!req) return true;
  const userLevel = PLAN_HIERARCHY[userPlan] ?? 0;
  const reqLevel  = PLAN_HIERARCHY[req.minPlan] ?? 0;
  return userLevel >= reqLevel;
}

/**
 * Returns the max devices allowed for the given plan.
 */
export function maxNFCDevices(userPlan) {
  return FEATURE_REQUIREMENTS.nfc_devices.maxDevices[userPlan] ?? 0;
}

/**
 * Returns the max team members allowed for the given plan.
 */
export function maxTeamMembers(userPlan) {
  return FEATURE_REQUIREMENTS.team_members.maxMembers[userPlan] ?? 0;
}

/**
 * Determines if a subscription is active (not canceled/past_due).
 * Falls back to free plan if status is degraded.
 */
export function resolveActivePlan(subscription) {
  if (!subscription) return 'free';
  const { status, plan } = subscription;
  // Always trust the plan field if it's set to a paid tier
  if (plan && plan !== 'free') return plan;
  // Degraded statuses
  if (status === 'canceled' || status === 'past_due') return 'free';
  return 'free';
}