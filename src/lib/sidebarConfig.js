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
 *   - PRO_INDIVIDUAL sees analytics / nfc_devices / lost_mode / resume / portfolio but NO business verticals
 */

import {
  User, BarChart3, Smartphone, AlertOctagon, CalendarDays, Users,
  Scissors, Clock, Scale, Briefcase, MapPin, UserCheck, GitBranch,
  ClipboardList, Link2, CreditCard, HeadphonesIcon, FileText, Image, Home,
} from "lucide-react";
import { t } from "@/lib/i18n";

// ── Normalized profile type constants ────────────────────────────────────────
export const TYPE_FREE       = "free_individual";
export const TYPE_PRO        = "pro_individual";
export const TYPE_BUSINESS   = "business";
export const TYPE_SALON      = "salon";
export const TYPE_LAWFIRM    = "lawfirm";
export const TYPE_CORPORATE  = "corporate";

/**
 * Derives a canonical profile type from a profile object.
 * Checks fields in priority order:
 *   profile.plan → profile.profile_type → profile.business_type → profile.industry → profile.account_type
 */
export function normalizeProfileType(profile) {
  if (!profile) return TYPE_FREE;

  const candidates = [
    profile.plan,
    profile.profile_type,
    profile.business_type,
    profile.industry,
    profile.account_type,
  ].filter(Boolean).map(s => String(s).toLowerCase().trim());

  for (const raw of candidates) {
    if (raw === "corporate") return TYPE_CORPORATE;
    if (["lawfirm", "law_firm", "law firm", "legal", "attorney", "law"].includes(raw)) return TYPE_LAWFIRM;
    if (["salon", "barber", "barbershop", "beauty", "spa", "nail", "nails", "hair"].includes(raw)) return TYPE_SALON;
    if (["business", "restaurant"].includes(raw)) return TYPE_BUSINESS;
    if (["professional", "pro"].includes(raw)) return TYPE_PRO;
    if (raw === "free") return TYPE_FREE;
  }

  return TYPE_FREE;
}

// ── Sidebar item ids visible per type ────────────────────────────────────────
export const SIDEBAR_ITEMS_BY_TYPE = {
  [TYPE_FREE]: [
    "landing",
    "profiles",
    "connections",
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
    "resume",
    "connections",
    "billing",
    "support",
  ],
  [TYPE_BUSINESS]: [
    "landing",
    "profiles",
    "appointments",
    "leads",
    "services",
    "hours",
    "analytics",
    "devices",
    "lostmode",
    "team",
    "connections",
    "billing",
    "support",
  ],
  [TYPE_SALON]: [
    "landing",
    "profiles",
    "appointments",
    "leads",
    "services",
    "hours",
    "analytics",
    "devices",
    "lostmode",
    "team",
    "connections",
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
    "lostmode",
    "team",
    "crm",
    "connections",
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
    "lostmode",
    "team",
    "crm",
    "attendance",
    "connections",
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
  "hours",
  "practiceareas",
  "legalservices",
  "offices",
  "analytics",
  "devices",
  "lostmode",
  "team",
  "crm",
  "attendance",
  "resume",
  "connections",
  "billing",
  "support",
];

// ── Full item definitions ─────────────────────────────────────────────────────
export const SIDEBAR_NAV_MAP = {
  landing: {
    id: "landing", label: "Landing Page", labelFr: "Page d'accueil",
    icon: Home, href: "/",
    iconColor: "#FF7A00", iconBg: "rgba(255,122,0,0.18)",
  },
  profiles: {
    id: "profiles", label: "Profiles", labelFr: "Profils",
    icon: User, href: "/bingoo",
    iconColor: "#FF7A00", iconBg: "rgba(255,122,0,0.18)",
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
  hours: {
    id: "hours", label: "Hours", labelFr: "Horaires",
    icon: Clock, href: "/bingoo?view=hours",
    iconColor: "#8b5cf6", iconBg: "rgba(139,92,246,0.18)",
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
    id: "lostmode", label: "Lost Mode", labelFr: "Mode Perdu",
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
  resume: {
    id: "resume", label: "Resume", labelFr: "CV",
    icon: FileText, href: "/bingoo?view=resume",
    iconColor: "#0284c7", iconBg: "rgba(2,132,199,0.18)",
  },
  portfolio: {
    id: "portfolio", label: "Portfolio", labelFr: "Portfolio",
    icon: Image, href: "/bingoo?view=portfolio",
    iconColor: "#7c3aed", iconBg: "rgba(124,58,237,0.18)",
  },
  connections: {
    id: "connections", label: "Connections", labelFr: "Connexions",
    icon: Link2, href: "/bingoo?view=connections",
    iconColor: "#e11d48", iconBg: "rgba(225,29,72,0.18)",
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
};

/**
 * Returns the ordered list of sidebar item objects for a given profile and admin status.
 * @param {object|null} profile - The selected profile entity (or null)
 * @param {boolean} isAdmin - user.role === "admin"
 * @param {string} lang - "en" | "fr"
 * @param {string|null} effectivePlan - Optional pre-computed effective plan (from getEffectiveProfilePlan).
 *   When provided, this overrides the plan derived from profile fields alone.
 *   Pass this from BingooLayout so account subscription is respected by sidebar gating.
 * @returns {Array} ordered sidebar items with localized labels
 */
export function getVisibleNavItems(profile, isAdmin = false, lang = "en", effectivePlan = null) {
  let type;
  if (isAdmin) {
    type = null; // admin uses ADMIN_SIDEBAR_ITEMS directly
  } else if (effectivePlan && effectivePlan !== "free") {
    // Map the effective plan to a sidebar type — effective plan wins over stale profile.plan
    const planToType = {
      professional: TYPE_PRO,
      pro: TYPE_PRO,
      salon: TYPE_SALON,
      restaurant: TYPE_BUSINESS,
      business: TYPE_BUSINESS,
      lawfirm: TYPE_LAWFIRM,
      corporate: TYPE_CORPORATE,
    };
    type = planToType[effectivePlan] || normalizeProfileType(profile);
  } else {
    type = normalizeProfileType(profile);
  }

  const ids = isAdmin
    ? ADMIN_SIDEBAR_ITEMS
    : (SIDEBAR_ITEMS_BY_TYPE[type] || SIDEBAR_ITEMS_BY_TYPE[TYPE_FREE]);

  return ids.map(id => {
    const item = SIDEBAR_NAV_MAP[id];
    if (!item) return null;
    return {
      ...item,
      label: lang === "fr" && item.labelFr ? item.labelFr : item.label,
    };
  }).filter(Boolean);
}