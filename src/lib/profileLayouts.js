/**
 * Profile Layout System — Defines how different layouts render on the public profile.
 * Each layout controls positioning, styling, spacing, and component behavior.
 */

export const PROFILE_LAYOUTS = {
  classic: {
    id: "classic",
    label: "Classic",
    desc: "Timeless & professional",
    coverHeight: { mobile: 220, desktop: 280 },
    avatarOverlap: { mobile: -58, desktop: -70 },
    avatarSize: { mobile: 110, desktop: 128 },
    titleSize: { mobile: 26, desktop: 30 },
    titleGradient: true,
    bioBoxStyle: "highlight", // "highlight" | "plain" | "glassmorphic"
    bioBoxBg: (isDark, color) => isDark ? "rgba(255,255,255,0.05)" : `rgba(${parseInt(color.slice(1,3),16)},${parseInt(color.slice(3,5),16)},${parseInt(color.slice(5,7),16)},0.045)`,
    bioBoxBorder: (isDark, color) => isDark ? "1px solid rgba(255,255,255,0.09)" : `1px solid rgba(${parseInt(color.slice(1,3),16)},${parseInt(color.slice(3,5),16)},${parseInt(color.slice(5,7),16)},0.14)`,
    contentPadding: { mobile: "20px 18px 40px", desktop: "24px 32px 48px" },
    stickyBottomBar: true,
    coverOverlay: true,
  },
  portrait: {
    id: "portrait",
    label: "Portrait",
    desc: "Avatar-focused vertical",
    coverHeight: { mobile: 180, desktop: 200 },
    avatarOverlap: { mobile: -55, desktop: -60 },
    avatarSize: { mobile: 130, desktop: 160 },
    titleSize: { mobile: 28, desktop: 32 },
    titleGradient: false,
    bioBoxStyle: "plain",
    bioBoxBg: (isDark) => isDark ? "transparent" : "transparent",
    bioBoxBorder: (isDark) => isDark ? "none" : "none",
    contentPadding: { mobile: "24px 16px 40px", desktop: "32px 48px 48px" },
    stickyBottomBar: true,
    coverOverlay: true,
  },
  color: {
    id: "color",
    label: "Color Pop",
    desc: "Vibrant gradient background",
    coverHeight: { mobile: 240, desktop: 300 },
    avatarOverlap: { mobile: -65, desktop: -80 },
    avatarSize: { mobile: 120, desktop: 140 },
    titleSize: { mobile: 28, desktop: 34 },
    titleGradient: true,
    bioBoxStyle: "highlight",
    bioBoxBg: (isDark, color) => `rgba(255,255,255,0.12)`,
    bioBoxBorder: () => "1px solid rgba(255,255,255,0.2)",
    contentPadding: { mobile: "28px 18px 40px", desktop: "32px 40px 48px" },
    stickyBottomBar: true,
    coverOverlay: true,
  },
  card: {
    id: "card",
    label: "Card",
    desc: "Compact card design",
    coverHeight: { mobile: 140, desktop: 160 },
    avatarOverlap: { mobile: -50, desktop: -55 },
    avatarSize: { mobile: 90, desktop: 100 },
    titleSize: { mobile: 22, desktop: 26 },
    titleGradient: false,
    bioBoxStyle: "plain",
    bioBoxBg: () => "transparent",
    bioBoxBorder: () => "none",
    contentPadding: { mobile: "16px 16px 40px", desktop: "20px 28px 48px" },
    stickyBottomBar: true,
    coverOverlay: false,
  },
  glass: {
    id: "glass",
    label: "Glass",
    desc: "Glassmorphic modern",
    coverHeight: { mobile: 220, desktop: 280 },
    avatarOverlap: { mobile: -58, desktop: -70 },
    avatarSize: { mobile: 110, desktop: 128 },
    titleSize: { mobile: 26, desktop: 30 },
    titleGradient: true,
    bioBoxStyle: "glassmorphic",
    bioBoxBg: () => "rgba(255,255,255,0.08)",
    bioBoxBorder: () => "1px solid rgba(255,255,255,0.2)",
    contentPadding: { mobile: "20px 18px 40px", desktop: "24px 32px 48px" },
    stickyBottomBar: true,
    coverOverlay: true,
  },
  darkpremium: {
    id: "darkpremium",
    label: "Dark Premium",
    desc: "Luxury dark minimal",
    coverHeight: { mobile: 200, desktop: 240 },
    avatarOverlap: { mobile: -50, desktop: -60 },
    avatarSize: { mobile: 100, desktop: 120 },
    titleSize: { mobile: 24, desktop: 28 },
    titleGradient: false,
    bioBoxStyle: "highlight",
    bioBoxBg: (isDark, color) => "rgba(255,255,255,0.07)",
    bioBoxBorder: () => "1px solid rgba(255,255,255,0.12)",
    contentPadding: { mobile: "18px 16px 40px", desktop: "24px 36px 48px" },
    stickyBottomBar: true,
    coverOverlay: true,
  },
  minimal: {
    id: "minimal",
    label: "Minimal Business",
    desc: "Clean & professional",
    coverHeight: { mobile: 160, desktop: 180 },
    avatarOverlap: { mobile: -45, desktop: -50 },
    avatarSize: { mobile: 80, desktop: 90 },
    titleSize: { mobile: 20, desktop: 24 },
    titleGradient: false,
    bioBoxStyle: "plain",
    bioBoxBg: () => "transparent",
    bioBoxBorder: () => "none",
    contentPadding: { mobile: "14px 12px 40px", desktop: "18px 24px 48px" },
    stickyBottomBar: true,
    coverOverlay: false,
  },
};

export const DEFAULT_LAYOUT = "classic";

// ── Layout Catalog — display metadata for the design picker ───────────────
// Single source of truth for layout IDs, names, descriptions, and Pro gating.
// Structural rendering config lives in PROFILE_LAYOUTS above; getLayoutConfig()
// falls back to "classic" for any ID not explicitly listed there.
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
  { id: "bold",            name: "Bold Gradient",       desc: "Color hero + wave divider",     pro: true  },
  { id: "neon",            name: "Neon",                desc: "Glow ring on near-black",       pro: true  },
  { id: "retro",           name: "Retro",               desc: "80s editorial serif header",    pro: true  },
  { id: "floating",        name: "Floating",            desc: "Detached radial bg card",       pro: true  },
  { id: "luxury_gold",     name: "Luxury Gold",         desc: "Gold ring, dark prestige",      pro: true  },
  { id: "ny_championship", name: "NY Championship",     desc: "Bold sports-style header",      pro: true  },
  { id: "lions_teranga",   name: "Lions de la Téranga", desc: "Heritage pride edition",        pro: true  },
];

// Real layout type mapping — determines structural rendering
export const LAYOUT_TYPES = {
  classic: "default",
  portrait: "portrait",
  color: "color_hero",
  card: "card_compact",
  image: "image_hero",
  glass: "glassmorphic",
  darkpremium: "dark_premium",
  minimal: "minimal_business",
};

/**
 * Get layout config by ID, with fallback to default
 */
export function getLayoutConfig(layoutId) {
  return PROFILE_LAYOUTS[layoutId] || PROFILE_LAYOUTS[DEFAULT_LAYOUT];
}

/**
 * Get the structural layout type
 */
export function getLayoutType(layoutId) {
  return LAYOUT_TYPES[layoutId] || LAYOUT_TYPES[DEFAULT_LAYOUT];
}

/**
 * Determine if a layout is dark-styled (dark backgrounds)
 */
export function isLayoutDark(layoutId) {
  const darkLayouts = [
    "dark", "dark_premium", "darkpremium", "minimal_dark", "luxury",
    "cyberpunk", "premium_salon", "neon", "neon_tech",
    "aurora", "luxury_gold", "executive_corp", "ny_championship",
    "lions_teranga", "animated_gradient", "video_bg", "parallax",
    "monochrome",
  ];
  return darkLayouts.includes(layoutId);
}