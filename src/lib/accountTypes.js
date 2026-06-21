/**
 * Bingoo Connect V3 — Account Type Constants
 *
 * account_type: "individual" | "business" | undefined (legacy = treated as individual)
 * business_type: one of BUSINESS_TYPES keys — only meaningful when account_type === "business"
 *
 * Backward compatibility:
 *   - Existing users with no account_type are treated as "individual" everywhere.
 *   - No feature gates depend on these fields yet — they are data-only in V3 phase 1.
 */

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

/**
 * Returns the effective account type for a user.
 * Existing users with no account_type default to "individual" — no blocking behavior.
 * @param {object} user - user object from base44.auth.me()
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