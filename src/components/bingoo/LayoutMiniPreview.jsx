/**
 * LayoutMiniPreview — renders the REAL layout component scaled down.
 * Uses generic sample profiles — NO personal user data ever.
 * Routing mirrors PublicProfile.jsx exactly (15 layouts only).
 */
import {
  ClassicLayout, ImageHeroLayout, GlassLayout,
  DarkPremiumLayout, ColorLayout, MinimalLayout, CardLayout,
  ModernSaasLayout, ExecutiveLayout, NeonLayout, RetroLayout,
  AuroraLayout, FloatingLayout, MagazineLayout,
} from "./ProfileLayoutRenderer";
import { hexRgb } from "./ProfileLayoutRenderer";

// Generic sample avatars — no personal user photos
const SAMPLE_AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=ffdfbf",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jade&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus&backgroundColor=d1d4f9",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia&backgroundColor=ffd5dc",
];

const LAYOUT_AVATARS = {
  classic: 0, minimal: 1, card: 2, image_hero: 3, glassmorphic: 1,
  dark: 4, aurora: 0, magazine: 3, executive: 2, modern_saas: 1,
  bold: 3, neon: 4, retro: 0, floating: 2, luxury_gold: 1,
};

function buildSampleProfile(layoutId, accentColor) {
  const avatarIdx = LAYOUT_AVATARS[layoutId] ?? 0;
  return {
    display_name: "Alex Johnson",
    job_title: "Product Designer",
    company_name: "Studio Co.",
    profile_photo: SAMPLE_AVATARS[avatarIdx],
    cover_photo: null,
    cover_color: accentColor || "#2563eb",
    avatar_shape: "circle",
    avatar_placement: "center_overlap",
    avatar_position: "center top",
    cover_position: "center",
    layout: layoutId,
    phone: "+1 555 000 0000",
    email: "hello@studio.co",
  };
}

function MiniContentStub({ color, isDark }) {
  const bg = isDark ? "rgba(255,255,255,0.07)" : "#f1f5f9";
  const line = isDark ? "rgba(255,255,255,0.16)" : "#cbd5e1";
  const dot = isDark ? hexRgb(color, 0.45) : hexRgb(color, 0.3);
  return (
    <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          background: bg, borderRadius: 10, padding: "8px 12px",
          display: "flex", alignItems: "center", gap: 9,
        }}>
          <div style={{ width: 20, height: 20, borderRadius: 7, background: dot, flexShrink: 0 }} />
          <div style={{ flex: 1, height: 8, borderRadius: 4, background: line }} />
        </div>
      ))}
    </div>
  );
}

// Routes a layoutId → the correct renderer — identical to PublicProfile.jsx
function LayoutRenderer({ layoutId, color }) {
  const profile = buildSampleProfile(layoutId, color);
  const isDark = ["dark", "dark_premium", "neon", "aurora", "luxury_gold"].includes(layoutId);
  const stub = <MiniContentStub color={color} isDark={isDark} />;
  const lp = { profile, color, isDark, mobile: true, contentSections: stub };

  switch (layoutId) {
    case "image_hero":    return <ImageHeroLayout {...lp} />;
    case "magazine":      return <MagazineLayout {...lp} />;
    case "aurora":        return <AuroraLayout {...lp} color={color} />;
    case "glassmorphic":  return <GlassLayout {...lp} />;
    case "modern_saas":   return <ModernSaasLayout {...lp} />;
    case "executive":     return <ExecutiveLayout {...lp} />;
    case "dark":          return <DarkPremiumLayout {...lp} isDark={true} />;
    case "luxury_gold":   return <DarkPremiumLayout {...lp} isDark={true} profile={{ ...profile, cover_color: "#B8860B" }} color="#B8860B" />;
    case "neon":          return <NeonLayout {...lp} isDark={true} />;
    case "retro":         return <RetroLayout {...lp} />;
    case "bold":          return <ColorLayout {...lp} />;
    case "floating":      return <FloatingLayout {...lp} />;
    case "minimal":       return <MinimalLayout {...lp} />;
    case "card":          return <CardLayout {...lp} />;
    default:              return <ClassicLayout {...lp} />;
  }
}

export default function LayoutMiniPreview({ layoutId, color = "#2563eb", isSelected = false, previewHeight = 185 }) {
  // We render at 375px wide (phone width) then scale down to fit the card
  const RENDER_WIDTH = 375;
  const RENDER_HEIGHT = 620;
  const scale = previewHeight / RENDER_HEIGHT;
  const scaledW = Math.round(RENDER_WIDTH * scale);

  return (
    <div style={{
      width: "100%",
      height: previewHeight,
      borderRadius: 10,
      overflow: "hidden",
      position: "relative",
      background: "#f8fafc",
    }}>
      {/* Scaled render container — centered horizontally */}
      <div style={{
        position: "absolute",
        top: 0,
        left: "50%",
        transform: `translateX(-50%) scale(${scale})`,
        transformOrigin: "top center",
        width: RENDER_WIDTH,
        height: RENDER_HEIGHT,
        pointerEvents: "none",
        userSelect: "none",
      }}>
        <LayoutRenderer layoutId={layoutId} color={color} />
      </div>
    </div>
  );
}