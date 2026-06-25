/**
 * Bingoo Connect — Sidebar Configuration
 *
 * Single source of truth for sidebar items.
 * Visibility is derived from the SELECTED PROFILE's plan, not the user's account_type.
 *
 * allowedPlans: array of plan names that see this item, or "any" for all plans.
 */

import {
  User, BarChart3, Smartphone, AlertOctagon, CalendarDays, Users,
  Scissors, Clock, Scale, Briefcase, MapPin, UserCheck, GitBranch,
  ClipboardList, Link2, CreditCard, HeadphonesIcon,
} from "lucide-react";

// Plan groups for readability
const ALL_PLANS = ["free", "professional", "pro", "salon", "restaurant", "lawfirm", "business", "corporate"];
const PRO_AND_ABOVE = ["professional", "pro", "salon", "restaurant", "lawfirm", "business", "corporate"];
const BUSINESS_PLANS = ["salon", "restaurant", "lawfirm", "business", "corporate"];
const SALON_PLANS = ["salon"];
const LAWFIRM_PLANS = ["lawfirm", "corporate"];
const CORPORATE_PLANS = ["corporate"];

export const SIDEBAR_NAV = [
  // ── Always visible ────────────────────────────────────────────────
  {
    id: "profiles",
    label: "Profiles",
    icon: User,
    href: "/bingoo",
    iconColor: "#FF7A00",
    iconBg: "rgba(255,122,0,0.18)",
    allowedPlans: "any",
  },

  // ── Shared business features (all paid business plans) ────────────
  {
    id: "appointments",
    label: "Appointments",
    icon: CalendarDays,
    href: "/bingoo?view=appointments",
    iconColor: "#10b981",
    iconBg: "rgba(16,185,129,0.18)",
    allowedPlans: BUSINESS_PLANS,
  },
  {
    id: "leads",
    label: "Leads",
    icon: Users,
    href: "/bingoo?view=leads",
    iconColor: "#f59e0b",
    iconBg: "rgba(245,158,11,0.18)",
    allowedPlans: BUSINESS_PLANS,
  },

  // ── Salon & Business General only (NOT law firm / corporate) ──────
  {
    id: "services",
    label: "Services",
    icon: Scissors,
    href: "/bingoo?view=services",
    iconColor: "#ec4899",
    iconBg: "rgba(236,72,153,0.18)",
    allowedPlans: ["salon", "business"],
  },
  {
    id: "hours",
    label: "Hours",
    icon: Clock,
    href: "/bingoo?view=hours",
    iconColor: "#8b5cf6",
    iconBg: "rgba(139,92,246,0.18)",
    allowedPlans: ["salon", "business"],
  },

  // ── Law Firm only ─────────────────────────────────────────────────
  {
    id: "practiceareas",
    label: "Practice Areas",
    icon: Scale,
    href: "/bingoo?view=practiceareas",
    iconColor: "#0369a1",
    iconBg: "rgba(3,105,161,0.18)",
    allowedPlans: LAWFIRM_PLANS,
  },
  {
    id: "legalservices",
    label: "Legal Services",
    icon: Briefcase,
    href: "/bingoo?view=legalservices",
    iconColor: "#1d4ed8",
    iconBg: "rgba(29,78,216,0.18)",
    allowedPlans: LAWFIRM_PLANS,
  },
  {
    id: "offices",
    label: "Offices",
    icon: MapPin,
    href: "/bingoo?view=offices",
    iconColor: "#0891b2",
    iconBg: "rgba(8,145,178,0.18)",
    allowedPlans: LAWFIRM_PLANS,
  },

  // ── Shared: all business plans ────────────────────────────────────
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    href: "/bingoo?view=analytics",
    iconColor: "#d97706",
    iconBg: "rgba(217,119,6,0.18)",
    allowedPlans: PRO_AND_ABOVE,
  },
  {
    id: "devices",
    label: "NFC Devices",
    icon: Smartphone,
    href: "/my-nfc-devices",
    iconColor: "#f97316",
    iconBg: "rgba(249,115,22,0.18)",
    allowedPlans: PRO_AND_ABOVE,
  },
  {
    id: "lostmode",
    label: "Lost Mode",
    icon: AlertOctagon,
    href: "/bingoo?view=lostmode",
    iconColor: "#ef4444",
    iconBg: "rgba(239,68,68,0.18)",
    allowedPlans: PRO_AND_ABOVE,
  },
  {
    id: "team",
    label: "Team",
    icon: UserCheck,
    href: "/bingoo?view=team",
    iconColor: "#7c3aed",
    iconBg: "rgba(124,58,237,0.18)",
    allowedPlans: BUSINESS_PLANS,
  },

  // ── CRM: Law Firm & Corporate only ───────────────────────────────
  {
    id: "crm",
    label: "CRM",
    icon: GitBranch,
    href: "/bingoo?view=crm",
    iconColor: "#10b981",
    iconBg: "rgba(16,185,129,0.18)",
    allowedPlans: LAWFIRM_PLANS,
  },

  // ── Attendance: Corporate only ────────────────────────────────────
  {
    id: "attendance",
    label: "Attendance",
    icon: ClipboardList,
    href: "/bingoo?view=attendance",
    iconColor: "#15803d",
    iconBg: "rgba(21,128,61,0.18)",
    allowedPlans: CORPORATE_PLANS,
  },

  // ── Always visible ────────────────────────────────────────────────
  {
    id: "connections",
    label: "Connections",
    icon: Link2,
    href: "/bingoo?view=connections",
    iconColor: "#e11d48",
    iconBg: "rgba(225,29,72,0.18)",
    allowedPlans: "any",
  },
  {
    id: "billing",
    label: "Billing",
    icon: CreditCard,
    href: "/billing",
    iconColor: "#0891b2",
    iconBg: "rgba(8,145,178,0.18)",
    allowedPlans: "any",
  },
  {
    id: "support",
    label: "Support",
    icon: HeadphonesIcon,
    href: "/contact-support",
    iconColor: "#64748b",
    iconBg: "rgba(100,116,139,0.18)",
    allowedPlans: "any",
  },
];

/**
 * Returns the list of sidebar items visible for a given profile plan.
 * @param {string} profilePlan - The selected profile's plan (e.g. "salon", "lawfirm")
 * @param {boolean} isAdmin - Whether the current user is an admin (sees everything + admin panel)
 */
export function getVisibleNavItems(profilePlan, isAdmin = false) {
  if (isAdmin) return SIDEBAR_NAV; // admins see all items (plus Admin Panel added separately)

  const plan = profilePlan || "free";

  return SIDEBAR_NAV.filter(item => {
    if (item.allowedPlans === "any") return true;
    return item.allowedPlans.includes(plan);
  });
}