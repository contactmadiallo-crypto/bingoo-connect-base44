import { ShoppingBag, Package, Settings } from "lucide-react";
import { getVisibleNavItems, SIDEBAR_NAV_MAP } from "./sidebarConfig";

// ── Additional nav items not in the original sidebarConfig ──
const EXTRA_NAV_ITEMS = {
  shop:    { id: "shop", label: "Shop", labelFr: "Boutique", icon: ShoppingBag, href: "/shop", iconColor: "#f97316", iconBg: "rgba(249,115,22,0.18)" },
  orders:  { id: "orders", label: "My Orders", labelFr: "Commandes", icon: Package, href: "/my-orders", iconColor: "#8b5cf6", iconBg: "rgba(139,92,246,0.18)" },
  account: { id: "account", label: "Account Settings", labelFr: "Compte", icon: Settings, href: "/account-settings", iconColor: "#64748b", iconBg: "rgba(100,116,139,0.18)" },
};

// ── Grouped sidebar sections (Phase 3 IA) ──
const SECTIONS = [
  { id: "home",      label: "Home",      labelFr: "Accueil",    itemIds: ["landing"] },
  { id: "identity",  label: "Identity",  labelFr: "Identité",   itemIds: ["profiles", "qrwallet", "connections"] },
  { id: "business",  label: "Business",  labelFr: "Business",   itemIds: ["appointments", "leads", "crm", "analytics", "services", "hours", "team", "practiceareas", "legalservices", "offices", "attendance"] },
  { id: "nfc",       label: "NFC",       labelFr: "NFC",        itemIds: ["devices", "designstudio", "lostmode"] },
  { id: "shop",      label: "Shop",      labelFr: "Boutique",   itemIds: ["shop", "orders"] },
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
      .filter((id) => visibleIds.has(id) || EXTRA_NAV_ITEMS[id])
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