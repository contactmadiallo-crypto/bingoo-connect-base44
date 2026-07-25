import { ShoppingBag, Package, Settings, FileText, PackageCheck, ShieldCheck, Route } from "lucide-react";
import { getVisibleNavItems, SIDEBAR_NAV_MAP } from "./sidebarConfig";

// ── Additional nav items not in the original sidebarConfig ──
const EXTRA_NAV_ITEMS = {
  shop:    { id: "shop", label: "Shop", labelFr: "Boutique", icon: ShoppingBag, href: "/shop", iconColor: "#f97316", iconBg: "rgba(249,115,22,0.18)" },
  orders:  { id: "orders", label: "My Orders", labelFr: "Commandes", icon: Package, href: "/my-orders", iconColor: "#8b5cf6", iconBg: "rgba(139,92,246,0.18)" },
  account:      { id: "account", label: "Account Settings", labelFr: "Compte", icon: Settings, href: "/account-settings", iconColor: "#64748b", iconBg: "rgba(100,116,139,0.18)" },
  docwallet:    { id: "docwallet", label: "Document Wallet", labelFr: "Documents", icon: FileText, href: "/bingoo?view=docwallet", iconColor: "#3b82f6", iconBg: "rgba(59,130,246,0.18)" },
  myassets:     { id: "myassets", label: "My Assets", labelFr: "Mes Biens", icon: PackageCheck, href: "/bingoo?view=myassets", iconColor: "#10b981", iconBg: "rgba(16,185,129,0.18)" },
  quality:      { id: "quality", label: "Profile Score", labelFr: "Score Profil", icon: ShieldCheck, href: "/bingoo?view=quality", iconColor: "#f97316", iconBg: "rgba(249,115,22,0.18)" },
  planjourney:  { id: "planjourney", label: "Plan Journeys", labelFr: "Parcours Plans", icon: Route, href: "/bingoo?view=planjourney", iconColor: "#8b5cf6", iconBg: "rgba(139,92,246,0.18)" },
};

const EXTRA_PLAN_REQUIREMENTS = {
  myassets: "professional",
  quality: "professional",
  planjourney: "business",
  docwallet: "professional",
};

const PAID_PLANS = new Set(["professional", "pro", "business", "salon", "restaurant", "lawfirm", "corporate"]);
const BUSINESS_PLANS = new Set(["business", "salon", "restaurant", "lawfirm", "corporate"]);

// ── Grouped sidebar sections (Phase 3 IA) ──
const SECTIONS = [
  { id: "home",      label: "Home",      labelFr: "Accueil",    itemIds: ["landing"] },
  { id: "identity",  label: "Identity",  labelFr: "Identité",   itemIds: ["profiles", "qrwallet", "connections", "myassets", "planjourney"] },
  { id: "business",  label: "Business",  labelFr: "Business",   itemIds: ["appointments", "leads", "crm", "analytics", "services", "team", "practiceareas", "legalservices", "offices", "attendance"] },
  { id: "nfc",       label: "NFC",       labelFr: "NFC",        itemIds: ["devices", "designstudio", "lostmode"] },
  { id: "shop",      label: "Shop",      labelFr: "Boutique",   itemIds: ["shop", "orders"] },
  { id: "advanced",  label: "Advanced",  labelFr: "Avancé",     itemIds: ["strategic"] },
  { id: "settings",  label: "Settings",  labelFr: "Paramètres", itemIds: ["billing", "account", "support"] },
];

/**
 * Returns grouped sidebar sections with only visible items for the current profile type.
 * Each section: { id, label, items: [{ id, label, icon, href, iconColor, iconBg }] }
 * Sections with zero visible items are omitted.
 */
export function getVisibleNavSections(profile, isAdmin = false, lang = "en", effectivePlan = null) {
  const visibleItems = getVisibleNavItems(profile, isAdmin, lang, effectivePlan);
  const visibleIds = new Set(visibleItems.map((i) => i.id));
  const allItems = { ...SIDEBAR_NAV_MAP, ...EXTRA_NAV_ITEMS };

  return SECTIONS.map((section) => {
    const items = section.itemIds
      .filter((id) => {
        if (!EXTRA_NAV_ITEMS[id]) return visibleIds.has(id);
        const requirement = EXTRA_PLAN_REQUIREMENTS[id];
        if (!requirement) return true;
        if (isAdmin) return true;
        if (requirement === "professional") return PAID_PLANS.has(effectivePlan);
        if (requirement === "business") return BUSINESS_PLANS.has(effectivePlan);
        return false;
      })
      .map((id) => {
        const item = allItems[id];
        if (!item) return null;
        return {
          ...item,
          label: lang === "fr" && item.labelFr ? item.labelFr : item.label,
        };
      })
      .filter(Boolean);
    return {
      ...section,
      label: lang === "fr" && section.labelFr ? section.labelFr : section.label,
      items,
    };
  }).filter((section) => section.items.length > 0);
}

export { EXTRA_NAV_ITEMS };
