/**
 * Bingoo Connect — Sidebar Configuration (v2)
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
 *   - PRO_INDIVIDUAL sees analytics / nfc_devices / lost_mode but NO business verticals
 */

import {
  User, BarChart3, Smartphone, AlertOctagon, CalendarDays, Users,
  Scissors, Clock, Scale, Briefcase, MapPin, UserCheck, GitBranch,
  ClipboardList, Link2, CreditCard, HeadphonesIcon,
} from "lucide-react";

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
 *   profile.plan → profile.profile_type → profile.account_type →
 *   profile.business_type → profile.industry
 *
 * Returns one of the TYPE_* constants above.
 */
export function normalizeProfileType(profile) {
  if (!profile) return TYPE_FREE;

  // Collect all candidate strings to check (priority order)
  const candidates = [
    profile.plan,
    profile.profile_type,
    profile.business_type,
    profile.industry,
    profile.account_type,
  ].filter(Boolean).map(s => String(s).toLowerCase().trim());

  for (const raw of candidates) {
    // Corporate
    if (raw === "corporate") return TYPE_CORPORATE;

    // Law firm aliases
    if (["lawfirm", "law_firm", "law firm", "legal", "attorney", "law"].includes(raw)) return TYPE_LAWFIRM;

    // Salon aliases
    if (["salon", "barber", "barbershop", "beauty", "spa", "nail", "nails", "hair"].includes(raw)) return TYPE_SALON;

    // Business general
    if (["business", "restaurant"].includes(raw)) return TYPE_BUSINESS;

    // Pro individual aliases
    if (["professional", "pro"].includes(raw)) return TYPE_PRO;

    // Free
    if (raw === "free") return TYPE_FREE;
  }

  // Default: if any profile exists but plan is unrecognized, treat as free
  return TYPE_FREE;
}

// ── Sidebar item ids visible per type ────────────────────────────────────────
// Order matters — this is the order they appear in the sidebar.
export const SIDEBAR_ITEMS_BY_TYPE = {
  [TYPE_FREE]: [
    "profiles",
    "connections",
    "billing",
    "support",
  ],
  [TYPE_PRO]: [
    "profiles",
    "analytics",
    "devices",
    "lostmode",
    "connections",
    "billing",
    "support",
  ],
  [TYPE_BUSINESS]: [
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

// Admin sees everything (all ids)
export const ADMIN_SIDEBAR_ITEMS = [
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
  "connections",
  "billing",
  "support",
];

// ── Full item definitions ─────────────────────────────────────────────────────
export const SIDEBAR_NAV_MAP = {
  profiles: {
    id: "profiles",
    label: "Profiles",
    icon: User,
    href: "/bingoo",
    iconColor: "#FF7A00",
    iconBg: "rgba(255,122,0,0.18)",
  },
  appointments: {
    id: "appointments",
    label: "Appointments",
    icon: CalendarDays,
    href: "/bingoo?view=appointments",
    iconColor: "#10b981",
    iconBg: "rgba(16,185,129,0.18)",
  },
  leads: {
    id: "leads",
    label: "Leads",
    icon: Users,
    href: "/bingoo?view=leads",
    iconColor: "#f59e0b",
    iconBg: "rgba(245,158,11,0.18)",
  },
  services: {
    id: "services",
    label: "Services",
    icon: Scissors,
    href: "/bingoo?view=services",
    iconColor: "#ec4899",
    iconBg: "rgba(236,72,153,0.18)",
  },
  hours: {
    id: "hours",
    label: "Hours",
    icon: Clock,
    href: "/bingoo?view=hours",
    iconColor: "#8b5cf6",
    iconBg: "rgba(139,92,246,0.18)",
  },
  practiceareas: {
    id: "practiceareas",
    label: "Practice Areas",
    icon: Scale,
    href: "/bingoo?view=practiceareas",
    iconColor: "#0369a1",
    iconBg: "rgba(3,105,161,0.18)",
  },
  legalservices: {
    id: "legalservices",
    label: "Legal Services",
    icon: Briefcase,
    href: "/bingoo?view=legalservices",
    iconColor: "#1d4ed8",
    iconBg: "rgba(29,78,216,0.18)",
  },
  offices: {
    id: "offices",
    label: "Offices",
    icon: MapPin,
    href: "/bingoo?view=offices",
    iconColor: "#0891b2",
    iconBg: "rgba(8,145,178,0.18)",
  },
  analytics: {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    href: "/bingoo?view=analytics",
    iconColor: "#d97706",
    iconBg: "rgba(217,119,6,0.18)",
  },
  devices: {
    id: "devices",
    label: "NFC Devices",
    icon: Smartphone,
    href: "/my-nfc-devices",
    iconColor: "#f97316",
    iconBg: "rgba(249,115,22,0.18)",
  },
  lostmode: {
    id: "lostmode",
    label: "Lost Mode",
    icon: AlertOctagon,
    href: "/bingoo?view=lostmode",
    iconColor: "#ef4444",
    iconBg: "rgba(239,68,68,0.18)",
  },
  team: {
    id: "team",
    label: "Team",
    icon: UserCheck,
    href: "/bingoo?view=team",
    iconColor: "#7c3aed",
    iconBg: "rgba(124,58,237,0.18)",
  },
  crm: {
    id: "crm",
    label: "CRM",
    icon: GitBranch,
    href: "/bingoo?view=crm",
    iconColor: "#10b981",
    iconBg: "rgba(16,185,129,0.18)",
  },
  attendance: {
    id: "attendance",
    label: "Attendance",
    icon: ClipboardList,
    href: "/bingoo?view=attendance",
    iconColor: "#15803d",
    iconBg: "rgba(21,128,61,0.18)",
  },
  connections: {
    id: "connections",
    label: "Connections",
    icon: Link2,
    href: "/bingoo?view=connections",
    iconColor: "#e11d48",
    iconBg: "rgba(225,29,72,0.18)",
  },
  billing: {
    id: "billing",
    label: "Billing",
    icon: CreditCard,
    href: "/billing",
    iconColor: "#0891b2",
    iconBg: "rgba(8,145,178,0.18)",
  },
  support: {
    id: "support",
    label: "Support",
    icon: HeadphonesIcon,
    href: "/contact-support",
    iconColor: "#64748b",
    iconBg: "rgba(100,116,139,0.18)",
  },
};

/**
 * Returns the ordered list of sidebar item objects for a given profile and admin status.
 * @param {object|null} profile - The selected profile entity (or null)
 * @param {boolean} isAdmin - user.role === "admin"
 * @returns {Array} ordered sidebar items
 */
export function getVisibleNavItems(profile, isAdmin = false) {
  const ids = isAdmin ? ADMIN_SIDEBAR_ITEMS : (SIDEBAR_ITEMS_BY_TYPE[normalizeProfileType(profile)] || SIDEBAR_ITEMS_BY_TYPE[TYPE_FREE]);
  return ids.map(id => SIDEBAR_NAV_MAP[id]).filter(Boolean);
}