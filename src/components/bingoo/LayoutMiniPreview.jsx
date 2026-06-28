/**
 * LayoutMiniPreview — renders the REAL layout component scaled down.
 * Uses generic sample profiles — NO personal user data ever.
 * Routing mirrors PublicProfile.jsx exactly (15 layouts only).
 */
import {
  ClassicLayout, ImageHeroLayout, GlassLayout,
  DarkPremiumLayout, ColorLayout, MinimalLayout, CardLayout,
  ModernSaasLayout, ExecutiveLayout, NeonLayout, RetroLayout,
  AuroraLayout, FloatingLayout, MagazineLayout, LuxuryGoldLayout, PortraitLayout,
} from "./ProfileLayoutRenderer";
import { hexRgb } from "./ProfileLayoutRenderer";

// 3D Memoji-style avatars — diverse professional characters
const SAMPLE_AVATARS = [
  "https://media.base44.com/images/public/692bd9007b93ba81de543346/1ccea4ba2_image.png",
  "https://media.base44.com/images/public/692bd9007b93ba81de543346/09d0f59fa_image.png",
  "https://media.base44.com/images/public/692bd9007b93ba81de543346/1ccea4ba2_image.png",
  "https://media.base44.com/images/public/692bd9007b93ba81de543346/09d0f59fa_image.png",
  "https://media.base44.com/images/public/692bd9007b93ba81de543346/1ccea4ba2_image.png",
];

// Sample cover photos — high-quality Unsplash professional images per layout
const SAMPLE_COVERS = {
  image_hero:   "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  magazine:     "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=600&fit=crop&crop=top&q=80",
  executive:    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80",
  classic:      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80",
  retro:        "https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=800&q=80",
  floating:     "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  modern_saas:  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
  luxury_gold:  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
  aurora:       "https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=800&q=80",
  glassmorphic: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&q=80",
  dark:         "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&q=80",
  neon:         "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
  bold:         "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80",
  card:         "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80",
  minimal:      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
};

// Each layout gets a UNIQUE accent color so previews look visually distinct
const LAYOUT_ACCENT_COLORS = {
  classic:      "#2563eb",
  minimal:      "#0f172a",
  card:         "#7c3aed",
  image_hero:   "#dc2626",
  glassmorphic: "#6366f1",
  dark:         "#1e293b",
  aurora:       "#06b6d4",
  magazine:     "#be185d",
  executive:    "#1e3a5f",
  modern_saas:  "#059669",
  bold:         "#ea580c",
  neon:         "#a21caf",
  retro:        "#b45309",
  floating:     "#0891b2",
  luxury_gold:  "#92400e",
};

const LAYOUT_AVATARS = {
  classic: 0, minimal: 1, card: 0, image_hero: 1, glassmorphic: 0,
  dark: 1, aurora: 0, magazine: 1, executive: 0, modern_saas: 1,
  bold: 0, neon: 1, retro: 0, floating: 1, luxury_gold: 0,
};

function buildSampleProfile(layoutId, accentColor) {
  const avatarIdx = LAYOUT_AVATARS[layoutId] ?? 0;
  const coverPhoto = SAMPLE_COVERS[layoutId] || null;
  // Use the layout's unique accent if caller didn't override
  const resolvedColor = LAYOUT_ACCENT_COLORS[layoutId] || accentColor || "#2563eb";
  return {
    display_name: "Sarah Mitchell",
    job_title: "Creative Director",
    company_name: "Apex Studio",
    profile_photo: SAMPLE_AVATARS[avatarIdx],
    cover_photo: coverPhoto,
    cover_color: resolvedColor,
    avatar_shape: "circle",
    avatar_placement: "center_overlap",
    avatar_position: "center top",
    cover_position: "center",
    layout: layoutId,
    phone: "+1 555 000 0000",
    email: "hello@apexstudio.co",
  };
}

function MiniContentStub({ color, isDark }) {
  const bg   = isDark ? "rgba(255,255,255,0.08)" : "#f1f5f9";
  const line = isDark ? "rgba(255,255,255,0.18)" : "#cbd5e1";
  const subline = isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0";
  const dot  = color;
  return (
    <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: 7 }}>
      {/* Icon row — 4 app-style icons */}
      <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 2 }}>
        {[color, "#25D366", "#1877F2", "#000"].map((c, i) => (
          <div key={i} style={{
            width: 30, height: 30, borderRadius: 9,
            background: c, flexShrink: 0,
            boxShadow: `0 2px 6px ${c}55`,
          }} />
        ))}
      </div>
      {/* Link rows */}
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          background: bg, borderRadius: 10, padding: "7px 10px",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <div style={{ width: 18, height: 18, borderRadius: 6, background: dot, flexShrink: 0, opacity: 0.85 }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ height: 6, borderRadius: 3, background: line, width: "60%" }} />
            <div style={{ height: 4, borderRadius: 2, background: subline, width: "40%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Routes a layoutId → the correct renderer — identical to PublicProfile.jsx
function LayoutRenderer({ layoutId, color }) {
  const profile = buildSampleProfile(layoutId, color);
  const resolvedColor = profile.cover_color;
  const isDark  = ["dark", "dark_premium", "neon", "aurora", "luxury_gold"].includes(layoutId);
  const stub    = <MiniContentStub color={resolvedColor} isDark={isDark} />;
  const lp      = { profile, color: resolvedColor, isDark, mobile: true, contentSections: stub };

  switch (layoutId) {
    case "image_hero":   return <ImageHeroLayout {...lp} />;
    case "magazine":     return <MagazineLayout {...lp} />;
    case "aurora":       return <AuroraLayout {...lp} color={color} />;
    case "glassmorphic": return <GlassLayout {...lp} />;
    case "modern_saas":  return <ModernSaasLayout {...lp} />;
    case "executive":    return <ExecutiveLayout {...lp} />;
    case "luxury_gold":  return <LuxuryGoldLayout profile={profile} mobile={true} contentSections={stub} />;
    case "dark":         return <DarkPremiumLayout {...lp} />;
    case "neon":         return <NeonLayout {...lp} />;
    case "retro":        return <RetroLayout {...lp} />;
    case "bold":         return <ColorLayout {...lp} />;
    case "floating":     return <FloatingLayout {...lp} />;
    case "minimal":      return <MinimalLayout {...lp} />;
    case "card":         return <CardLayout {...lp} />;
    default:             return <ClassicLayout {...lp} />;
  }
}

export default function LayoutMiniPreview({ layoutId, color = "#2563eb", isSelected = false, previewHeight = 185 }) {
  const RENDER_WIDTH  = 375;
  const RENDER_HEIGHT = 620;
  const scale    = previewHeight / RENDER_HEIGHT;
  const scaledW  = Math.round(RENDER_WIDTH * scale);

  return (
    <div style={{
      width: "100%", height: previewHeight,
      borderRadius: 10, overflow: "hidden",
      position: "relative", background: "#f8fafc",
    }}>
      {/* Scaled render container — centered */}
      <div style={{
        position: "absolute", top: 0, left: "50%",
        transform: `translateX(-50%) scale(${scale})`,
        transformOrigin: "top center",
        width: RENDER_WIDTH, height: RENDER_HEIGHT,
        pointerEvents: "none", userSelect: "none",
      }}>
        <LayoutRenderer layoutId={layoutId} color={color} />
      </div>
    </div>
  );
}