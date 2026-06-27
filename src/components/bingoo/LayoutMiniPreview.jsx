/**
 * LayoutMiniPreview — renders the REAL layout component scaled down inside
 * a thumbnail card. Uses a generic sample profile (no personal user data).
 * This guarantees thumbnail === actual public profile output.
 */
import {
  ClassicLayout, ImageHeroLayout, PortraitLayout, GlassLayout,
  DarkPremiumLayout, ColorLayout, MinimalLayout, CardLayout,
  ModernSaasLayout, ExecutiveLayout, NeonLayout, RetroLayout,
} from "./ProfileLayoutRenderer";

// ── Generic sample profile — NO personal user data ──────────
const SAMPLE_AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=ffdfbf",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jade&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus&backgroundColor=d1d4f9",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia&backgroundColor=ffd5dc",
];

// Assign a fixed avatar per layout slot so thumbnails look varied
const LAYOUT_IDS = [
  "classic","minimal","card","dark","bold","split","glassmorphic","gradient","neon","retro",
  "magazine","aurora","minimal_dark","pastel","corporate","floating","sunset","ocean","forest",
  "luxury","bubbly","monochrome","cyberpunk","frosted","paper","wave","glass_3d","luxury_gold",
  "executive_corp","neon_tech","modern_law","premium_salon","realtor_luxury","animated_gradient",
  "video_bg","parallax","ny_championship","lions_teranga","portrait","image_hero","glass_card",
  "modern_saas","executive","color_gradient",
];
const AVATAR_MAP = Object.fromEntries(
  LAYOUT_IDS.map((id, i) => [id, SAMPLE_AVATARS[i % SAMPLE_AVATARS.length]])
);

function buildSampleProfile(layoutId, accentColor) {
  return {
    display_name: "Alex Johnson",
    job_title: "Product Designer",
    company_name: "Studio Co.",
    bio: "Creative professional",
    profile_photo: AVATAR_MAP[layoutId] || SAMPLE_AVATARS[0],
    cover_photo: null,           // never use personal cover
    cover_color: accentColor || "#2563eb",
    avatar_shape: "circle",
    avatar_placement: "center_overlap",
    avatar_position: "center top",
    cover_position: "center",
    layout: layoutId,
    phone: "+1 555 000 0000",
    email: "hello@studio.co",
    website: "https://studio.co",
    instagram_url: "https://instagram.com",
    linkedin_url: "https://linkedin.com",
  };
}

// Simple content stub shown inside each mini preview
function MiniContentStub({ color, isDark }) {
  const bg = isDark ? "rgba(255,255,255,0.07)" : "#f1f5f9";
  const line = isDark ? "rgba(255,255,255,0.18)" : "#cbd5e1";
  return (
    <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 7 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          background: bg, borderRadius: 10, padding: "8px 12px",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <div style={{ width: 18, height: 18, borderRadius: 6, background: `${color}33`, flexShrink: 0 }} />
          <div style={{ flex: 1, height: 7, borderRadius: 4, background: line }} />
        </div>
      ))}
    </div>
  );
}

// Routes layoutId → the correct renderer (mirrors LivePreviewPanel exactly)
function LayoutRenderer({ layoutId, color }) {
  const profile = buildSampleProfile(layoutId, color);
  const isDark = [
    "dark","dark_premium","darkpremium","luxury","minimal_dark","cyberpunk","forest",
    "premium_salon","aurora","neon","neon_tech","ny_championship","lions_teranga",
    "luxury_gold","executive_corp","parallax","video_bg","animated_gradient",
  ].includes(layoutId);
  const stub = <MiniContentStub color={color} isDark={isDark} />;
  const lp = { profile, color, isDark, mobile: true, contentSections: stub };

  if (["image_hero","image","video_bg","parallax","magazine","realtor_luxury"].includes(layoutId))
    return <ImageHeroLayout {...lp} />;
  if (["portrait","floating","pastel","bubbly","wave","animated_gradient","aurora","gradient"].includes(layoutId))
    return <PortraitLayout {...lp} />;
  if (["glass_card","glass","glassmorphic","frosted","glass_3d"].includes(layoutId))
    return <GlassLayout {...lp} />;
  if (["modern_saas","corporate","modern_law","split"].includes(layoutId))
    return <ModernSaasLayout {...lp} />;
  if (["executive","executive_corp","luxury_gold"].includes(layoutId))
    return <ExecutiveLayout {...lp} />;
  if (["dark","dark_premium","darkpremium","luxury","minimal_dark","cyberpunk","forest","premium_salon"].includes(layoutId))
    return <DarkPremiumLayout {...lp} isDark={true} />;
  if (["neon","neon_tech"].includes(layoutId))
    return <NeonLayout {...lp} isDark={true} />;
  if (["retro","monochrome","paper"].includes(layoutId))
    return <RetroLayout {...lp} />;
  if (["color_gradient","bold","sunset","ocean","color","color_hero"].includes(layoutId))
    return <ColorLayout {...lp} />;
  if (["minimal","minimal_business"].includes(layoutId))
    return <MinimalLayout {...lp} />;
  if (["card","card_compact"].includes(layoutId))
    return <CardLayout {...lp} />;
  // Special sport layouts — fall back to DarkPremium with their accent colors
  if (layoutId === "ny_championship")
    return <DarkPremiumLayout {...lp} isDark={true} profile={{ ...profile, cover_color: "#FF7A00" }} color="#FF7A00" />;
  if (layoutId === "lions_teranga")
    return <DarkPremiumLayout {...lp} isDark={true} profile={{ ...profile, cover_color: "#D4AF37" }} color="#D4AF37" />;
  return <ClassicLayout {...lp} />;
}

// ── Public component ─────────────────────────────────────────
// Renders the real layout renderer scaled into a thumbnail box.
// Scale is applied via CSS transform so the layout itself is never aware.
export default function LayoutMiniPreview({ layoutId, color = "#2563eb", isSelected = false }) {
  // Thumbnail box: 3/2 aspect, ~120px wide by default (parent controls width)
  // We render at 375px wide (mobile standard) and scale down
  const RENDER_WIDTH = 375;
  const RENDER_HEIGHT = 580;
  // scale so 375 fits inside the thumbnail container
  // Container is controlled by parent via aspect-ratio; we use a fixed scale
  // that maps 375px → ~120px visible width → scale ≈ 0.32
  const SCALE = 0.32;
  const scaledH = Math.round(RENDER_HEIGHT * SCALE);

  return (
    <div
      style={{
        width: "100%",
        height: scaledH,
        borderRadius: 10,
        overflow: "hidden",
        position: "relative",
        boxShadow: isSelected
          ? "0 0 0 2.5px #2563eb, 0 4px 16px rgba(37,99,235,0.2)"
          : "0 2px 8px rgba(0,0,0,0.12)",
        border: isSelected ? "none" : "1px solid rgba(0,0,0,0.07)",
        background: "#f8fafc",
      }}
    >
      {/* Fixed-width renderer scaled down */}
      <div
        style={{
          width: RENDER_WIDTH,
          height: RENDER_HEIGHT,
          transform: `scale(${SCALE})`,
          transformOrigin: "top left",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <LayoutRenderer layoutId={layoutId} color={color} />
      </div>
    </div>
  );
}