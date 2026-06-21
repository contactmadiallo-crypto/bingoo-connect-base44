/**
 * Bingoo Connect V3 — Account Type Constants & Capability Map
 *
 * account_type: "individual" | "business" | undefined (legacy = treated as individual)
 * business_type: one of BUSINESS_TYPES keys — only meaningful when account_type === "business"
 *
 * Backward compatibility:
 *   - Existing users with no account_type are treated as "individual" everywhere.
 *   - Legacy users are mapped to the "individual_free" group by default.
 *   - No features are hidden or blocked by this module — it is config-only.
 */

// ─── Account & Business Type Metadata ────────────────────────────────────────

export const ACCOUNT_TYPES = [
  { id: "individual", label: "Individual / Freelancer", icon: "👤" },
  { id: "business",   label: "Business / Organization", icon: "🏢" },
];

export const BUSINESS_TYPES = [
  { id: "law_firm",   label: "Law Firm",        icon: "⚖️" },
  { id: "salon",      label: "Salon / Beauty",  icon: "💇" },
  { id: "restaurant", label: "Restaurant",      icon: "🍽️" },
  { id: "agency",     label: "Agency",          icon: "📣" },
  { id: "retail",     label: "Retail / Shop",   icon: "🛍️" },
  { id: "corporate",  label: "Corporate",       icon: "🏗️" },
];

// ─── Account Groups ───────────────────────────────────────────────────────────
// These are internal plan groups used to resolve capabilities.
// They do NOT map 1:1 with Stripe plan names — that mapping lives in usePlan/planPermissions.

/** @typedef {"individual_free"|"individual_pro"|"business"} AccountGroup */

export const ACCOUNT_GROUPS = {
  INDIVIDUAL_FREE: "individual_free",
  INDIVIDUAL_PRO:  "individual_pro",
  BUSINESS:        "business",
};

// ─── Capability Keys ──────────────────────────────────────────────────────────
// Canonical string keys for every capability in the system.
// Import and use these constants instead of raw strings to avoid typos.

export const CAP = {
  // Profile basics
  SINGLE_PROFILE:       "single_profile",
  MULTIPLE_PROFILES:    "multiple_profiles",
  PROFILE_PHOTO:        "profile_photo",
  COVER_PHOTO:          "cover_photo",
  CONTACT_INFO:         "contact_info",
  SOCIAL_LINKS:         "social_links",
  QR_CODE_DOWNLOAD:     "qr_code_download",

  // Navigation / dashboard sections
  OVERVIEW:             "overview",
  PROFILE_STUDIO:       "profile_studio",
  CONNECTIONS:          "connections",

  // Layouts
  BASIC_LAYOUTS:        "basic_layouts",
  PREMIUM_LAYOUTS:      "premium_layouts",

  // Pro individual features
  NFC_ACTIVATION:       "nfc_activation",
  NFC_PROFILE_ASSIGN:   "nfc_profile_assign",
  NFC_DEVICES:          "nfc_devices",
  RESUME:               "resume",
  PORTFOLIO:            "portfolio",
  ANALYTICS:            "analytics",
  PROFILE_LIKES:        "profile_likes",
  QR_TRACKING:          "qr_tracking",
  LOST_MODE:            "lost_mode",
  APPLE_WALLET:         "apple_wallet",
  GOOGLE_WALLET:        "google_wallet",

  // Business features
  LEADS:                "leads",
  CRM:                  "crm",
  APPOINTMENTS:         "appointments",
  REVIEWS:              "reviews",
  TEAM_PROFILES:        "team_profiles",
  STAFF_MANAGEMENT:     "staff_management",
  INDUSTRY_MODULES:     "industry_modules",
  SERVICES:             "services",
};

// ─── Capability Sets per Account Group ───────────────────────────────────────

const CAPABILITIES = {
  [ACCOUNT_GROUPS.INDIVIDUAL_FREE]: new Set([
    CAP.SINGLE_PROFILE,
    CAP.PROFILE_PHOTO,
    CAP.COVER_PHOTO,
    CAP.CONTACT_INFO,
    CAP.SOCIAL_LINKS,
    CAP.CONNECTIONS,
    CAP.QR_CODE_DOWNLOAD,
    CAP.OVERVIEW,
    CAP.PROFILE_STUDIO,
    CAP.BASIC_LAYOUTS,
  ]),

  [ACCOUNT_GROUPS.INDIVIDUAL_PRO]: new Set([
    // Inherits all individual_free capabilities
    CAP.SINGLE_PROFILE,
    CAP.PROFILE_PHOTO,
    CAP.COVER_PHOTO,
    CAP.CONTACT_INFO,
    CAP.SOCIAL_LINKS,
    CAP.CONNECTIONS,
    CAP.QR_CODE_DOWNLOAD,
    CAP.OVERVIEW,
    CAP.PROFILE_STUDIO,
    CAP.BASIC_LAYOUTS,
    // Pro additions
    CAP.MULTIPLE_PROFILES,
    CAP.NFC_ACTIVATION,
    CAP.NFC_PROFILE_ASSIGN,
    CAP.RESUME,
    CAP.PORTFOLIO,
    CAP.ANALYTICS,
    CAP.PROFILE_LIKES,
    CAP.QR_TRACKING,
    CAP.LOST_MODE,
    CAP.APPLE_WALLET,
    CAP.GOOGLE_WALLET,
    CAP.PREMIUM_LAYOUTS,
  ]),

  [ACCOUNT_GROUPS.BUSINESS]: new Set([
    // Inherits all individual_pro capabilities
    CAP.SINGLE_PROFILE,
    CAP.PROFILE_PHOTO,
    CAP.COVER_PHOTO,
    CAP.CONTACT_INFO,
    CAP.SOCIAL_LINKS,
    CAP.CONNECTIONS,
    CAP.QR_CODE_DOWNLOAD,
    CAP.OVERVIEW,
    CAP.PROFILE_STUDIO,
    CAP.BASIC_LAYOUTS,
    CAP.MULTIPLE_PROFILES,
    CAP.NFC_ACTIVATION,
    CAP.NFC_PROFILE_ASSIGN,
    CAP.RESUME,
    CAP.PORTFOLIO,
    CAP.ANALYTICS,
    CAP.PROFILE_LIKES,
    CAP.QR_TRACKING,
    CAP.LOST_MODE,
    CAP.APPLE_WALLET,
    CAP.GOOGLE_WALLET,
    CAP.PREMIUM_LAYOUTS,
    // Business additions
    CAP.LEADS,
    CAP.CRM,
    CAP.APPOINTMENTS,
    CAP.REVIEWS,
    CAP.TEAM_PROFILES,
    CAP.STAFF_MANAGEMENT,
    CAP.INDUSTRY_MODULES,
    CAP.SERVICES,
    CAP.NFC_DEVICES,
  ]),
};

// ─── Helper: resolve account group from user object ───────────────────────────

/**
 * Derives the AccountGroup for a user.
 * - business account_type → "business"
 * - individual + paid plan (pro/professional/salon/lawfirm/business/corporate) → "individual_pro"
 * - everything else (including legacy null account_type) → "individual_free"
 *
 * NOTE: This is config-only. It does not hide features or block routes.
 *
 * @param {object} user - user object from base44.auth.me()
 * @returns {AccountGroup}
 */
export function getAccountGroup(user) {
  if (user?.account_type === "business") return ACCOUNT_GROUPS.BUSINESS;

  // Check profile.plan as a proxy for paid tier (mirrors existing usePlan logic)
  const plan = user?.plan || "";
  const paidPlans = ["pro", "professional", "salon", "lawfirm", "business", "corporate", "restaurant"];
  if (paidPlans.includes(plan)) return ACCOUNT_GROUPS.INDIVIDUAL_PRO;

  return ACCOUNT_GROUPS.INDIVIDUAL_FREE;
}

/**
 * Returns the full capability Set for a user.
 * @param {object} user
 * @returns {Set<string>}
 */
export function getCapabilitiesForUser(user) {
  const group = getAccountGroup(user);
  return CAPABILITIES[group] ?? CAPABILITIES[ACCOUNT_GROUPS.INDIVIDUAL_FREE];
}

/**
 * Returns true if the user has a specific capability.
 * Safe to call with null/undefined user — returns false.
 * @param {object} user
 * @param {string} capability - use CAP.* constants
 * @returns {boolean}
 */
export function hasCapability(user, capability) {
  return getCapabilitiesForUser(user).has(capability);
}

// ─── Existing helpers (unchanged) ────────────────────────────────────────────

/**
 * Returns the effective account type for a user.
 * Existing users with no account_type default to "individual" — no blocking behavior.
 * @param {object} user
 * @returns {"individual"|"business"}
 */
export function getAccountType(user) {
  return user?.account_type || "individual";
}

/**
 * Returns true if this is a business account.
 * @param {object} user
 */
export function isBusinessAccount(user) {
  return user?.account_type === "business";
}

/**
 * Returns the display label for a business_type id, or null.
 * @param {string} businessTypeId
 */
export function getBusinessTypeLabel(businessTypeId) {
  return BUSINESS_TYPES.find(t => t.id === businessTypeId)?.label || null;
}