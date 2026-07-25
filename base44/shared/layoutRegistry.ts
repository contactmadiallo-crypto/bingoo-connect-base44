// base44/shared/layoutRegistry.ts
// Single canonical source of truth for profile layout IDs and Pro gating.
// Imported by the backend sanitizer AND the frontend design picker
// (src/lib/profileLayouts.js re-exports LAYOUT_CATALOG from here).

export const LAYOUT_CATALOG = [
  { id: "classic",         name: "Classic",             desc: "Cover + centered overlap",      pro: false },
  { id: "minimal",         name: "Minimal",             desc: "Horizontal accent header",      pro: false },
  { id: "card",            name: "Card",                desc: "Slim strip + floating card",    pro: false },
  { id: "image_hero",      name: "Image Hero",          desc: "Full-bleed photo, avatar BR",   pro: true  },
  { id: "glassmorphic",    name: "Glass",               desc: "Frosted glass on gradient",     pro: true  },
  { id: "dark",            name: "Dark Premium",        desc: "Cinematic dark + glow ring",    pro: true  },
  { id: "aurora",          name: "Aurora",              desc: "Northern-lights gradient",      pro: true  },
  { id: "magazine",        name: "Magazine",            desc: "Editorial photo header",        pro: true  },
  { id: "executive",       name: "Executive",           desc: "Right-aligned avatar",          pro: true  },
  { id: "premium_salon",   name: "Salon / Service",     desc: "Service menu, stylist showcase", pro: true  },
  { id: "modern_law",      name: "Law Firm",            desc: "Practice areas, attorney profiles", pro: true },
  { id: "corporate",       name: "Business Team",       desc: "Team directory, company branding", pro: true },
  { id: "modern_saas",     name: "Split",               desc: "Accent bar + horizontal row",   pro: true  },
  { id: "bold",            name: "Bold Gradient",        desc: "Color hero + wave divider",     pro: true  },
  { id: "neon",            name: "Neon",                desc: "Glow ring on near-black",       pro: true  },
  { id: "retro",           name: "Retro",               desc: "80s editorial serif header",    pro: true  },
  { id: "floating",        name: "Floating",            desc: "Detached radial bg card",       pro: true  },
  { id: "luxury_gold",     name: "Luxury Gold",         desc: "Gold ring, dark prestige",      pro: true  },
  { id: "ny_championship", name: "NY Championship",     desc: "Bold sports-style header",      pro: true  },
  { id: "lions_teranga",   name: "Lions de la Téranga", desc: "Heritage pride edition",        pro: true  },
];

export const DEFAULT_LAYOUT = "classic";

export const LAYOUT_IDS = new Set(LAYOUT_CATALOG.map((l) => l.id));
export const FREE_LAYOUT_IDS = new Set(LAYOUT_CATALOG.filter((l) => !l.pro).map((l) => l.id));
export const PRO_LAYOUT_IDS = new Set(LAYOUT_CATALOG.filter((l) => l.pro).map((l) => l.id));

export function isProLayout(id) {
  return PRO_LAYOUT_IDS.has(id);
}

export function isValidLayoutId(id) {
  return LAYOUT_IDS.has(id);
}