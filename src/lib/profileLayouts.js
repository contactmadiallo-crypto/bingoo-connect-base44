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

// ── Unified Profile Architecture ────────────────────────────────────────────
// These 15 are the ONLY layouts shown to users. Hidden aliases below keep older
// profiles working without exposing a second layout system in the editor.
export const LAYOUT_RECIPES = {
  classic: {
    id: "classic", name: "Classic", desc: "Cover + centered overlap", pro: false,
    dark: false, defaultAccent: "#2563eb", defaultBackground: "#ffffff",
    surface: "clean", avatar: "center_overlap", typography: "modern",
    allowBackgroundOverride: true,
  },
  minimal: {
    id: "minimal", name: "Minimal", desc: "Compact business identity", pro: false,
    dark: false, defaultAccent: "#0b2149", defaultBackground: "#f8fafc",
    surface: "flat", avatar: "left_overlap", typography: "clean",
    allowBackgroundOverride: true,
  },
  card: {
    id: "card", name: "Card", desc: "Slim cover + compact floating card", pro: false,
    dark: false, defaultAccent: "#0b2149", defaultBackground: "#f8fafc",
    surface: "card", avatar: "left_overlap", typography: "modern",
    allowBackgroundOverride: true,
  },
  image_hero: {
    id: "image_hero", name: "Image Hero", desc: "Full-bleed visual hero", pro: true,
    dark: false, defaultAccent: "#f97316", defaultBackground: "#ffffff",
    surface: "hero", avatar: "right_overlap", typography: "modern",
    allowBackgroundOverride: false,
  },
  glassmorphic: {
    id: "glassmorphic", name: "Glass", desc: "Frosted glass on atmospheric gradient", pro: true,
    dark: false, defaultAccent: "#6366f1", defaultBackground: "linear-gradient(145deg,#e0e7ff,#f8fafc)",
    surface: "glass", avatar: "center_overlap", typography: "modern",
    allowBackgroundOverride: true,
  },
  dark: {
    id: "dark", name: "Dark Premium", desc: "Cinematic dark identity", pro: true,
    dark: true, defaultAccent: "#f97316", defaultBackground: "#080b12",
    surface: "dark", avatar: "center_overlap", typography: "modern",
    allowBackgroundOverride: false,
  },
  aurora: {
    id: "aurora", name: "Aurora", desc: "Northern-lights gradient", pro: true,
    dark: true, defaultAccent: "#22d3ee", defaultBackground: "linear-gradient(160deg,#07111f,#10244d,#0f766e)",
    surface: "glow", avatar: "center_overlap", typography: "modern",
    allowBackgroundOverride: false,
  },
  magazine: {
    id: "magazine", name: "Magazine", desc: "Editorial photo-led profile", pro: true,
    dark: false, defaultAccent: "#111827", defaultBackground: "#fffdf8",
    surface: "editorial", avatar: "left_overlap", typography: "classic",
    allowBackgroundOverride: false,
  },
  executive: {
    id: "executive", name: "Executive", desc: "Premium corporate hero", pro: true,
    dark: true, defaultAccent: "#d4a017", defaultBackground: "#0f172a",
    surface: "executive", avatar: "right_overlap", typography: "modern",
    allowBackgroundOverride: false,
  },
  premium_salon: {
    id: "premium_salon", name: "Salon / Service", desc: "Beauty and service-forward profile", pro: true,
    dark: true, defaultAccent: "#ec4899", defaultBackground: "linear-gradient(160deg,#1a0a14,#38162d)",
    surface: "salon", avatar: "center_overlap", typography: "elegant",
    allowBackgroundOverride: false,
  },
  modern_law: {
    id: "modern_law", name: "Law Firm", desc: "Formal legal identity and practice focus", pro: true,
    dark: false, defaultAccent: "#b8872d", defaultBackground: "#f8fafc",
    surface: "legal", avatar: "right_overlap", typography: "classic",
    allowBackgroundOverride: false,
  },
  corporate: {
    id: "corporate", name: "Business Team", desc: "Company-first team identity", pro: true,
    dark: false, defaultAccent: "#2563eb", defaultBackground: "#f1f5f9",
    surface: "corporate", avatar: "left_overlap", typography: "clean",
    allowBackgroundOverride: true,
  },
  modern_saas: {
    id: "modern_saas", name: "Split", desc: "SaaS-style horizontal identity row", pro: true,
    dark: false, defaultAccent: "#0d9488", defaultBackground: "#ecfdf5",
    surface: "split", avatar: "left_overlap", typography: "clean",
    allowBackgroundOverride: true,
  },
  ny_championship: {
    id: "ny_championship", name: "NY Championship", desc: "Bold championship edition", pro: true,
    dark: true, defaultAccent: "#f97316", defaultBackground: "#070b16",
    surface: "sports", avatar: "center_overlap", typography: "modern",
    allowBackgroundOverride: false,
  },
  lions_teranga: {
    id: "lions_teranga", name: "Lions de la Téranga", desc: "Senegal heritage edition", pro: true,
    dark: true, defaultAccent: "#D4AF37", defaultBackground: "#063f2d",
    surface: "heritage", avatar: "center_overlap", typography: "modern",
    allowBackgroundOverride: false,
  },
};

export const LAYOUT_CATALOG = Object.values(LAYOUT_RECIPES);

// Old IDs remain readable, but are no longer shown in the user-facing picker.
export const LEGACY_LAYOUT_ALIASES = {
  portrait: "classic",
  color: "aurora",
  color_hero: "aurora",
  bold: "aurora",
  sunset: "aurora",
  ocean: "aurora",
  forest: "aurora",
  wave: "aurora",
  bubbly: "aurora",
  pastel: "classic",
  gradient: "glassmorphic",
  image: "image_hero",
  realtor_luxury: "image_hero",
  video_bg: "image_hero",
  parallax: "image_hero",
  glass: "glassmorphic",
  glass_card: "glassmorphic",
  frosted: "glassmorphic",
  glass_3d: "glassmorphic",
  darkpremium: "dark",
  dark_premium: "dark",
  minimal_dark: "dark",
  luxury: "dark",
  cyberpunk: "dark",
  monochrome: "dark",
  animated_gradient: "aurora",
  executive_corp: "executive",
  split: "modern_saas",
  neon: "dark",
  neon_tech: "dark",
  retro: "magazine",
  paper: "magazine",
  floating: "card",
  luxury_gold: "executive",
};

export function canonicalLayoutId(layoutId) {
  if (!layoutId) return DEFAULT_LAYOUT;
  if (LAYOUT_RECIPES[layoutId]) return layoutId;
  return LEGACY_LAYOUT_ALIASES[layoutId] || DEFAULT_LAYOUT;
}

// Layout is authoritative. Legacy profile_layout is consulted only when the
// canonical layout field is absent/default from an older profile.
export function resolveProfileLayout(profile) {
  if (!profile) return DEFAULT_LAYOUT;
  const current = profile.layout;
  const legacy = profile.profile_layout;
  if (current && current !== "default" && !(current === "classic" && ["ny_championship","lions_teranga"].includes(legacy))) {
    return current;
  }
  if (legacy && legacy !== "default") return legacy;
  return current || DEFAULT_LAYOUT;
}

export function getLayoutRecipe(profileOrLayout) {
  const raw = typeof profileOrLayout === "string" ? profileOrLayout : resolveProfileLayout(profileOrLayout);
  return LAYOUT_RECIPES[canonicalLayoutId(raw)] || LAYOUT_RECIPES[DEFAULT_LAYOUT];
}

export function resolveProfileAppearance(profile) {
  const layout = resolveProfileLayout(profile);
  const recipe = getLayoutRecipe(layout);
  const accent = profile?.cover_color || recipe.defaultAccent;
  const overrideAllowed = recipe.allowBackgroundOverride;
  const style = profile?.bg_style || "clean";
  const customBackground = overrideAllowed ? profile?.theme_background_color : null;

  let background = customBackground || recipe.defaultBackground;
  let dark = recipe.dark;

  if (overrideAllowed && !customBackground) {
    if (style === "night") {
      background = "#071A3D";
      dark = true;
    } else if (style === "gradient") {
      background = `linear-gradient(160deg, ${accent}24 0%, #F7F9FC 58%, #ffffff 100%)`;
    } else if (style === "mesh") {
      background = `radial-gradient(circle at 15% 15%, ${accent}30, transparent 38%), radial-gradient(circle at 85% 10%, rgba(249,115,22,0.13), transparent 34%), #F7F9FC`;
    } else if (style === "blur") {
      background = `linear-gradient(145deg, ${accent}20, rgba(255,255,255,0.94))`;
    }
  }

  return { layout, canonicalLayout: recipe.id, recipe, accent, background, dark };
}

// Older structural helper API is preserved for compatibility.
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

export function getLayoutConfig(layoutId) {
  return PROFILE_LAYOUTS[layoutId] || PROFILE_LAYOUTS[canonicalLayoutId(layoutId)] || PROFILE_LAYOUTS[DEFAULT_LAYOUT];
}

export function getLayoutType(layoutId) {
  return LAYOUT_TYPES[layoutId] || LAYOUT_TYPES[canonicalLayoutId(layoutId)] || LAYOUT_TYPES[DEFAULT_LAYOUT];
}

export function isLayoutDark(layoutId) {
  return getLayoutRecipe(layoutId).dark;
}