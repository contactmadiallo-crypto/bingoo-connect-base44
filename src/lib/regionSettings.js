const REGION_KEY = "bingoo_region";
const REGION_SOURCE_KEY = "bingoo_region_source";

export const REGION_OPTIONS = {
  US: { name: "United States", currency: "USD" },
  CA: { name: "Canada", currency: "CAD" },
  GB: { name: "United Kingdom", currency: "GBP" },
  FR: { name: "France", currency: "EUR" },
  DE: { name: "Germany", currency: "EUR" },
  IT: { name: "Italy", currency: "EUR" },
  ES: { name: "Spain", currency: "EUR" },
  PT: { name: "Portugal", currency: "EUR" },
  SN: { name: "Senegal", currency: "XOF" },
  GN: { name: "Guinea", currency: "GNF" },
  CI: { name: "Cote d'Ivoire", currency: "XOF" },
  ML: { name: "Mali", currency: "XOF" },
  MA: { name: "Morocco", currency: "MAD" },
  AE: { name: "United Arab Emirates", currency: "AED" },
  JP: { name: "Japan", currency: "JPY" },
  KR: { name: "South Korea", currency: "KRW" },
  CN: { name: "China", currency: "CNY" },
  BR: { name: "Brazil", currency: "BRL" },
};

function regionFromLocale(locale) {
  const match = String(locale || "").replace("_", "-").match(/-([A-Za-z]{2})(?:-|$)/);
  return match ? match[1].toUpperCase() : null;
}

export function detectDeviceRegion() {
  if (typeof navigator === "undefined") return "US";
  const locales = [...(navigator.languages || []), navigator.language].filter(Boolean);
  for (const locale of locales) {
    const region = regionFromLocale(locale);
    if (region) return region;
  }
  return "US";
}

export function getRegion() {
  const saved = localStorage.getItem(REGION_KEY);
  if (saved) return saved;
  const detected = detectDeviceRegion();
  localStorage.setItem(REGION_KEY, detected);
  localStorage.setItem(REGION_SOURCE_KEY, "device");
  return detected;
}

export function setRegion(region) {
  const normalized = String(region || "").trim().toUpperCase() || "US";
  localStorage.setItem(REGION_KEY, normalized);
  localStorage.setItem(REGION_SOURCE_KEY, "user");
}

export function getCurrency(region = getRegion()) {
  return REGION_OPTIONS[region]?.currency || "USD";
}
