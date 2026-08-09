import { ShoppingBag, Package, Settings, FileText, PackageCheck, Route } from "lucide-react";
import { SIDEBAR_NAV_MAP } from "./sidebarConfig";

// Additional nav items not in the original sidebarConfig.
// Profile Score is intentionally not a sidebar destination anymore.
const EXTRA_NAV_ITEMS = {
  shop:        { id: "shop", label: "Shop", labelFr: "Boutique", icon: ShoppingBag, href: "/shop", iconColor: "#f97316", iconBg: "rgba(249,115,22,0.18)" },
  orders:      { id: "orders", label: "My Orders", labelFr: "Commandes", icon: Package, href: "/my-orders", iconColor: "#8b5cf6", iconBg: "rgba(139,92,246,0.18)" },
  account:     { id: "account", label: "Account Settings", labelFr: "Compte", icon: Settings, href: "/account-settings", iconColor: "#64748b", iconBg: "rgba(100,116,139,0.18)" },
  docwallet:   { id: "docwallet", label: "Document Wallet", labelFr: "Documents", icon: FileText, href: "/bingoo?view=docwallet", iconColor: "#3b82f6", iconBg: "rgba(59,130,246,0.18)" },
  myassets:    { id: "myassets", label: "My Assets", labelFr: "Mes Biens", icon: PackageCheck, href: "/bingoo?view=myassets", iconColor: "#10b981", iconBg: "rgba(16,185,129,0.18)" },
  planjourney: { id: "planjourney", label: "Plan Journeys", labelFr: "Parcours Plans", icon: Route, href: "/bingoo?view=planjourney", iconColor: "#8b5cf6", iconBg: "rgba(139,92,246,0.18)" },
};

const CORE = ["landing", "profiles", "qrwallet", "connections", "shop", "orders", "billing", "account", "support"];
const PRO = [...CORE, "myassets", "analytics", "devices", "lostmode"];
const BUSINESS = [...PRO, "appointments", "leads", "crm", "services", "team", "designstudio", "strategic", "planjourney"];
const SALON = [...BUSINESS];
const RESTAURANT = [...BUSINESS];
const LAWFIRM = [
  ...PRO,
  "appointments", "leads", "crm", "team", "designstudio",
  "practiceareas", "legalservices", "offices",
  "strategic", "planjourney",
];
const CORPORATE = [...BUSINESS, "attendance"];

const PLAN_ITEM_IDS = {
  free: CORE,
  professional: PRO,
  pro: PRO,
  business: BUSINESS,
  salon: SALON,
  restaurant: RESTAURANT,
  lawfirm: LAWFIRM,
  corporate: CORPORATE,
};

const SECTIONS = [
  { id: "home",      label: "Home",          labelFr: "Accueil",      itemIds: ["landing"] },
  { id: "identity",  label: "Identity",      labelFr: "Identité",     itemIds: ["profiles", "qrwallet", "connections", "myassets"] },
  { id: "engage",    label: "Engage",        labelFr: "Engagement",   itemIds: ["appointments", "leads", "crm"] },
  { id: "growth",    label: "Growth",        labelFr: "Croissance",   itemIds: ["analytics"] },
  { id: "business",  label: "Business",      labelFr: "Business",     itemIds: ["services", "team", "practiceareas", "legalservices", "offices", "attendance"] },
  { id: "design",    label: "Design Studio", labelFr: "Studio Design", itemIds: ["designstudio"] },
  { id: "nfc",       label: "NFC",           labelFr: "NFC",          itemIds: ["devices", "lostmode"] },
  { id: "shop",      label: "Shop",          labelFr: "Boutique",     itemIds: ["shop", "orders"] },
  { id: "advanced",  label: "Advanced",      labelFr: "Avancé",       itemIds: ["strategic", "planjourney"] },
  { id: "account",   label: "Account",       labelFr: "Compte",       itemIds: ["billing", "account", "support"] },
];

function normalizeSidebarPlan(plan) {
  const value = String(plan || "free").toLowerCase().trim();
  if (value === "pro") return "professional";
  return PLAN_ITEM_IDS[value] ? value : "free";
}

function planBadge(plan) {
  const normalized = normalizeSidebarPlan(plan);
  const labels = {
    free: "FREE",
    professional: "PRO",
    business: "BUSINESS",
    salon: "SALON",
    restaurant: "RESTAURANT",
    lawfirm: "LAW FIRM",
    corporate: "CORPORATE",
  };
  return labels[normalized] || "FREE";
}

/**
 * Sidebar visibility is subscription-first and intentionally closed by default.
 * Admin status controls access to the separate Admin Panel link only; it does not
 * override the subscription sidebar. This lets the owner/admin test each rollout
 * exactly as a customer on that plan would see it.
 */
export function getVisibleNavSections(profile, isAdmin = false, lang = "en", effectivePlan = null) {
  const normalizedPlan = normalizeSidebarPlan(effectivePlan);
  const ids = new Set(PLAN_ITEM_IDS[normalizedPlan] || CORE);
  const allItems = { ...SIDEBAR_NAV_MAP, ...EXTRA_NAV_ITEMS };

  return SECTIONS.map((section) => {
    const items = section.itemIds
      .filter((id) => ids.has(id))
      .map((id) => {
        const item = allItems[id];
        if (!item) return null;

        let label = lang === "fr" && item.labelFr ? item.labelFr : item.label;
        if (id === "billing") label = lang === "fr" ? "Forfait & Facturation" : "Plan & Billing";
        if (normalizedPlan === "business") {
          if (id === "services") label = lang === "fr" ? "Services et Produits" : "Services & Products";
          if (id === "team") label = lang === "fr" ? "Gestion d'équipe" : "Team Management";
        } else if (normalizedPlan === "salon" && id === "services") {
          label = lang === "fr" ? "Services Salon" : "Salon Services";
        }

        return {
          ...item,
          label,
          ...(id === "billing" ? { planBadge: planBadge(normalizedPlan) } : {}),
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

export { EXTRA_NAV_ITEMS, normalizeSidebarPlan };
