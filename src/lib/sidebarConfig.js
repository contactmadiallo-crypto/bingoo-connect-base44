/**
 * Bingoo Connect — Sidebar Configuration (v3)
 *
 * Single source of truth for sidebar visibility.
 * Visibility is driven by normalizeProfileType(profile) — NOT user.account_type.
 *
 * Architecture:
 *   1. normalizeProfileType(profile) → one of the TYPE_* constants below
 *   2. SIDEBAR_ITEMS_BY_TYPE[type] → ordered list of item ids visible for that type
 *   3. SIDEBAR_NAV_MAP[id] → full item definition (icon, href, colors)
 *
 * Strict vertical isolation:
 *   - SALON never sees practice_areas / legal_services / offices / crm / attendance
 *   - LAWFIRM never sees services / hours / attendance
 *   - CORPORATE never sees services / hours / practice_areas / legal_services / offices
 *   - FREE_INDIVIDUAL never sees any business/pro tools
 *   - PRO_INDIVIDUAL sees analytics / nfc_devices / lost_mode / portfolio but NO business verticals
 */

import {
  User, BarChart3, Smartphone, AlertOctagon, CalendarDays, Users,
  Scissors, Scale, Briefcase, MapPin, UserCheck, GitBranch,
  ClipboardList, Link2, CreditCard, HeadphonesIcon, Home, QrCode, PenTool, Sparkles,
} from "lucide-react";
import { t } from "@/lib/i18n";

// ── Normalized profile type constants ────────────────────────────────────────
export const TYPE_FREE       = "free_individual";
export const TYPE_PRO        = "pro_individual";
export const TYPE_BUSINESS   = "business";
export const TYPE_SALON      = "salon";
export const TYPE_LAWFIRM    = "lawfirm";
export const TYPE_CORPORATE  = "corporate";

// Layout family → profile type mapping. Used as a fallback when profile_type
// is not explicitly set (e.g. legacy profiles created before profile_type existed).
// Layout is a visual template, NOT a subscription plan — safe to use for category.
const LAYOUT_TYPE_FALLBACK = {
  premium_salon: TYPE_SALON,
  modern_law: TYPE_LAWFIRM,
  executive_corp: TYPE_CORPORATE,
  corporate: TYPE_BUSINESS,
  executive: TYPE_PRO,
  realtor_luxury: TYPE_BUSINESS,
  modern_saas: TYPE_BUSINESS,
  ny_championship: TYPE_PRO,
  lions_teranga: TYPE_PRO,
};

/**
 * Derives a canonical profile type from a profile object.
 *
 * Profile category controls navigation sections; subscription controls access and gates.
 *
 * Priority order (NONE of these are subscription plans):
 *   1. profile.profile_type  — explicit category field (set by onboarding/editor)
 *   2. profile.business_type / profile.industry / profile.account_type — legacy category fields
 *   3. profile.layout        — visual template, mapped to a category as a last resort
 *
 * profile.plan is deliberately NOT checked — it mirrors the subscription and must
 * never decide whether a profile is Business, Salon, Law Firm, etc.
 */
export function normalizeProfileType(profile) {
  if (!profile) return TYPE_FREE;

  // 1. Explicit profile_type field (the source of truth going forward)
  const pt = String(profile.profile_type || "").toLowerCase().trim();
  if (pt) return _matchType(pt);

  // 2. Legacy category fields
  const legacyCandidates = [
    profile.business_type,
    profile.industry,
    profile.account_type,
  ].filter(Boolean).map(s => String(s).toLowerCase().trim());
  for (const raw of legacyCandidates) {
    const matched = _matchType(raw);
    if (matched !== TYPE_FREE) return matched;
  }

  // 3. Layout fallback (visual template → category)
  const layout = String(profile.layout || "").toLowerCase().trim();
  if (LAYOUT_TYPE_FALLBACK[layout]) return LAYOUT_TYPE_FALLBACK[layout];

  return TYPE_FREE;
}

function _matchType(raw) {
  if (raw === "corporate") return TYPE_CORPORATE;
  if (["lawfirm", "law_firm", "law firm", "legal", "attorney", "law"].includes(raw)) return TYPE_LAWFIRM;
  if (["salon", "barber", "barbershop", "beauty", "spa", "nail", "nails", "hair"].includes(raw)) return TYPE_SALON;
  if (["business", "restaurant", "agency", "retail"].includes(raw)) return TYPE_BUSINESS;
  if (["professional", "pro", "creative", "personal"].includes(raw)) return raw === "personal" ? TYPE_FREE : TYPE_PRO;
  if (raw === "free") return TYPE_FREE;
  return TYPE_FREE;
}

// ── Sidebar item ids visible per type ────────────────────────────────────────
export const SIDEBAR_ITEMS_BY_TYPE = {
  [TYPE_FREE]: [
    "landing",
    "profiles",
    "connections",
    "qrwallet",
    "billing",
    "support",
  ],
  [TYPE_PRO]: [
    "landing",
    "profiles",
    "appointments",
    "leads",
    "analytics",
    "devices",
    "lostmode",
    "designstudio",
    "connections",
    "qrwallet",
    "billing",
    "support",
  ],
  [TYPE_BUSINESS]: [
    "landing",
    "profiles",
    "appointments",
    "leads",
    "services",
    "analytics",
    "devices",
    "designstudio",
    "lostmode",
    "team",
    "connections",
    "qrwallet",
    "billing",
    "support",
  ],
  [TYPE_SALON]: [
    "landing",
    "profiles",
    "appointments",
    "leads",
    "services",
    "analytics",
    "devices",
    "designstudio",
    "lostmode",
    "team",
    "connections",
    "qrwallet",
    "billing",
    "support",
  ],
  [TYPE_LAWFIRM]: [
    "landing",
    "profiles",
    "appointments",
    "leads",
    "practiceareas",
    "legalservices",
    "offices",
    "analytics",
    "devices",
    "designstudio",
    "lostmode",
    "team",
    "crm",
    "connections",
    "qrwallet",
    "billing",
    "support",
  ],
  [TYPE_CORPORATE]: [
    "landing",
    "profiles",
    "appointments",
    "leads",
    "analytics",
    "devices",
    "designstudio",
    "lostmode",
    "team",
    "crm",
    "attendance",
    "connections",
    "qrwallet",
    "billing",
    "support",
  ],
};

export const ADMIN_SIDEBAR_ITEMS = [
  "landing",
  "profiles",
  "appointments",
  "leads",
  "services",
  "practiceareas",
  "legalservices",
  "offices",
  "analytics",
  "devices",
  "lostmode",
  "designstudio",
  "team",
  "crm",
  "attendance",
  "connections",
  "qrwallet",
  "billing",
  "support",
];

// ── Full item definitions ─────────────────────────────────────────────────────
export const SIDEBAR_NAV_MAP = {
  landing: {
    id: "landing", label: "Dashboard", labelFr: "Tableau de bord",
    icon: Home, href: "/bingoo?view=home",
    iconColor: "#f97316", iconBg: "rgba(249,115,22,0.18)",
  },
  profiles: {
    id: "profiles", label: "Profiles", labelFr: "Profils",
    icon: User, href: "/bingoo?view=hub",
    iconColor: "#f97316", iconBg: "rgba(249,115,22,0.18)",
  },
  appointments: {
    id: "appointments", label: "Appointments", labelFr: "Rendez-vous",
    icon: CalendarDays, href: "/bingoo?view=appointments",
    iconColor: "#10b981", iconBg: "rgba(16,185,129,0.18)",
  },
  leads: {
    id: "leads", label: "Leads", labelFr: "Prospects",
    icon: Users, href: "/bingoo?view=leads",
    iconColor: "#f59e0b", iconBg: "rgba(245,158,11,0.18)",
  },
  services: {
    id: "services", label: "Services", labelFr: "Services",
    icon: Scissors, href: "/bingoo?view=services",
    iconColor: "#ec4899", iconBg: "rgba(236,72,153,0.18)",
  },
  practiceareas: {
    id: "practiceareas", label: "Practice Areas", labelFr: "Domaines",
    icon: Scale, href: "/bingoo?view=practiceareas",
    iconColor: "#0369a1", iconBg: "rgba(3,105,161,0.18)",
  },
  legalservices: {
    id: "legalservices", label: "Legal Services", labelFr: "Services Juridiques",
    icon: Briefcase, href: "/bingoo?view=legalservices",
    iconColor: "#1d4ed8", iconBg: "rgba(29,78,216,0.18)",
  },
  offices: {
    id: "offices", label: "Offices", labelFr: "Bureaux",
    icon: MapPin, href: "/bingoo?view=offices",
    iconColor: "#0891b2", iconBg: "rgba(8,145,178,0.18)",
  },
  analytics: {
    id: "analytics", label: "Analytics", labelFr: "Analytique",
    icon: BarChart3, href: "/bingoo?view=analytics",
    iconColor: "#d97706", iconBg: "rgba(217,119,6,0.18)",
  },
  devices: {
    id: "devices", label: "NFC Devices", labelFr: "Appareils NFC",
    icon: Smartphone, href: "/my-nfc-devices",
    iconColor: "#f97316", iconBg: "rgba(249,115,22,0.18)",
  },
  lostmode: {
    id: "lostmode", label: "Lost & Found", labelFr: "Perdu & Retrouvé",
    icon: AlertOctagon, href: "/bingoo?view=lostmode",
    iconColor: "#ef4444", iconBg: "rgba(239,68,68,0.18)",
  },
  team: {
    id: "team", label: "Team", labelFr: "Équipe",
    icon: UserCheck, href: "/bingoo?view=team",
    iconColor: "#7c3aed", iconBg: "rgba(124,58,237,0.18)",
  },
  crm: {
    id: "crm", label: "CRM", labelFr: "CRM",
    icon: GitBranch, href: "/bingoo?view=crm",
    iconColor: "#10b981", iconBg: "rgba(16,185,129,0.18)",
  },
  attendance: {
    id: "attendance", label: "Attendance", labelFr: "Présence",
    icon: ClipboardList, href: "/bingoo?view=attendance",
    iconColor: "#15803d", iconBg: "rgba(21,128,61,0.18)",
  },
  connections: {
    id: "connections", label: "Connections", labelFr: "Connexions",
    icon: Link2, href: "/bingoo?view=connections",
    iconColor: "#e11d48", iconBg: "rgba(225,29,72,0.18)",
  },
  qrwallet: {
    id: "qrwallet", label: "QR & Wallet", labelFr: "QR & Wallet",
    icon: QrCode, href: "/bingoo?view=qrwallet",
    iconColor: "#3b82f6", iconBg: "rgba(59,130,246,0.18)",
  },
  designstudio: {
    id: "designstudio", label: "Design Studio", labelFr: "Studio de design",
    icon: PenTool, href: "/bingoo?view=designstudio",
    iconColor: "#f97316", iconBg: "rgba(249,115,22,0.18)",
  },
  billing: {
    id: "billing", label: "Billing", labelFr: "Facturation",
    icon: CreditCard, href: "/billing",
    iconColor: "#0891b2", iconBg: "rgba(8,145,178,0.18)",
  },
  support: {
    id: "support", label: "Support", labelFr: "Support",
    icon: HeadphonesIcon, href: "/contact-support",
    iconColor: "#64748b", iconBg: "rgba(100,116,139,0.18)",
  },
  strategic: {
    id: "strategic", label: "Strategic Tools", labelFr: "Outils Stratégiques",
    icon: Sparkles, href: "/bingoo?view=strategic",
    iconColor: "#f97316", iconBg: "rgba(249,115,22,0.18)",
  },
};

/**
 * Returns the ordered list of sidebar item objects for a given profile and admin status.
 *
 * SIDEBAR VISIBILITY vs FEATURE ACCESS (requirements 1 + 4):
 *   - Sidebar SECTION visibility is driven by PROFILE CATEGORY (normalizeProfileType)
 *     so a Business / Salon / Law Firm / Corporate profile shows its relevant tools
 *     (Services, Team, Practice Areas, etc.) regardless of subscription.
 *   - Feature ACCESS within each section is gated by the SUBSCRIPTION plan via
 *     canAccess() / FeatureGate / PlanGateScreen — selecting a category during
 *     onboarding never unlocks paid features (the entitlement source is getUserFeatures,
 *     which reads only the Subscription entity).
 *
 * @param {object|null} profile - The selected profile entity (or null → free sidebar)
 * @param {boolean} isAdmin - user.role === "admin"
 * @param {string} lang - "en" | "fr"
 * @param {string|null} effectivePlan - reserved for panel-level access checks; NOT used
 *   for sidebar type (profile category drives visibility).
 * @returns {Array} ordered sidebar items with localized labels
 */
// ── Account-plan entitlement floor ─────────────────────────────────────────────
// The server-resolved active Subscription plan (from getUserFeatures / usePlan) sets a
// guaranteed MINIMUM set of nav items. A paid account NEVER collapses to the Free nav
// set just because the selected profile has a missing/unclassified category. The profile
// category may add organization-specific items on top of this floor, but can never remove
// items the account's subscription already entitles.
const PLAN_TO_FLOOR_TYPE = {
  free: TYPE_FREE,
  professional: TYPE_PRO,
  pro: TYPE_PRO,
  business: TYPE_BUSINESS,
  salon: TYPE_SALON,
  restaurant: TYPE_BUSINESS,
  lawfirm: TYPE_LAWFIRM,
  corporate: TYPE_CORPORATE,
};
function planFloorType(plan) {
  if (!plan) return TYPE_FREE;
  return PLAN_TO_FLOOR_TYPE[plan] || TYPE_FREE;
}

export function getVisibleNavItems(profile, isAdmin = false, lang = "en", effectivePlan = null) {
  // Profile category — drives organization (which vertical's tools are surfaced).
  const type = isAdmin ? null : normalizeProfileType(profile);
  // Account-plan floor — the subscription-entitled minimum (from getUserFeatures/usePlan).
  const floorType = isAdmin ? null : planFloorType(effectivePlan);

  let ids;
  if (isAdmin) {
    ids = [...ADMIN_SIDEBAR_ITEMS];
  } else {
    const profileIds = SIDEBAR_ITEMS_BY_TYPE[type] || SIDEBAR_ITEMS_BY_TYPE[TYPE_FREE];
    const floorIds = SIDEBAR_ITEMS_BY_TYPE[floorType] || SIDEBAR_ITEMS_BY_TYPE[TYPE_FREE];
    if (floorType !== TYPE_FREE) {
      // Paid account: the subscription floor is the guaranteed minimum, in floor order.
      // Append any profile-category-specific items not already included — the profile
      // category can never remove items the subscription already entitles.
      ids = [...floorIds];
      for (const id of profileIds) if (!ids.includes(id)) ids.push(id);
    } else {
      // Free account: keep the navigation intentionally limited. Selecting a
      // business category during onboarding must never surface paid tools.
      ids = [...floorIds];
    }
  }

  // Strategic tools — secondary advanced section, eligible for admins and when the
  // account plan OR selected profile category is Business / Salon / Law Firm / Corporate.
  const STRATEGIC_ELIGIBLE = new Set([TYPE_BUSINESS, TYPE_SALON, TYPE_LAWFIRM, TYPE_CORPORATE]);
  if (isAdmin || STRATEGIC_ELIGIBLE.has(floorType)) {
    if (!ids.includes("strategic")) {
      ids = [...ids, "strategic"];
    }
  }

  return ids.map(id => {
    const item = SIDEBAR_NAV_MAP[id];
    if (!item) return null;
    let label = lang === "fr" && item.labelFr ? item.labelFr : item.label;
    // Name shared tools according to the active subscription vertical. Business
    // gets general-purpose tools; salon keeps explicitly salon-specific wording.
    if (effectivePlan === "business") {
      if (id === "services") label = lang === "fr" ? "Services et Produits" : "Services & Products";
      if (id === "team") label = lang === "fr" ? "Gestion d'équipe" : "Team Management";
      if (id === "analytics") label = lang === "fr" ? "Analytique Avancée" : "Advanced Analytics";
      if (id === "qrwallet") label = lang === "fr" ? "QR Business et Wallet" : "Business QR & Wallet";
    } else if (effectivePlan === "salon" && id === "services") {
      label = lang === "fr" ? "Services Salon" : "Salon Services";
    }
    return { ...item, label };
  }).filter(Boolean);
}
