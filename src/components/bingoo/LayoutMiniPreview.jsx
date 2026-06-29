/**
 * LayoutMiniPreview — renders the REAL layout component scaled down.
 * Uses ONLY generic sample data. No personal user data ever.
 * Switch statement mirrors PublicProfile.jsx renderActiveLayout() exactly.
 */
import {
  ClassicLayout, ImageHeroLayout, GlassLayout,
  DarkPremiumLayout, ColorLayout, MinimalLayout, CardLayout,
  ModernSaasLayout, ExecutiveLayout, NeonLayout, RetroLayout,
  AuroraLayout, FloatingLayout, MagazineLayout, LuxuryGoldLayout,
} from "./ProfileLayoutRenderer";
import NewYorkChampionshipLayout from "./layouts/NewYorkChampionshipLayout";
import LionsOfTerangaLayout from "./layouts/LionsOfTerangaLayout";

// ── Two confirmed 3D Memoji assets ──────────────────────────────────────────
const MEMOJI_A = "https://media.base44.com/images/public/692bd9007b93ba81de543346/1ccea4ba2_image.png";
const MEMOJI_B = "https://media.base44.com/images/public/692bd9007b93ba81de543346/09d0f59fa_image.png";

// ── Per-layout config — each MUST look visually unique ───────────────────────
const LAYOUT_CONFIG = {
  classic: {
    color: "#2563eb",
    cover: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80",
    name: "Alex Johnson", title: "Marketing Director", company: "BrandCo",
    avatar: MEMOJI_A, isDark: false,
  },
  minimal: {
    color: "#0f172a",
    cover: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
    name: "Sophie Chen", title: "UX Designer", company: "Pixel Lab",
    avatar: MEMOJI_B, isDark: false,
  },
  card: {
    color: "#7c3aed",
    cover: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80",
    name: "Marcus Reid", title: "Software Engineer", company: "TechBase",
    avatar: MEMOJI_A, isDark: false,
  },
  image_hero: {
    color: "#dc2626",
    cover: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    name: "Nadia Kone", title: "Creative Director", company: "Apex Studio",
    avatar: MEMOJI_B, isDark: false,
  },
  glassmorphic: {
    color: "#6366f1",
    cover: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&q=80",
    name: "Liam Torres", title: "Product Manager", company: "Nexus HQ",
    avatar: MEMOJI_A, isDark: false,
  },
  dark: {
    color: "#6366f1",
    cover: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&q=80",
    name: "Karim Hassan", title: "CEO & Founder", company: "Onyx Group",
    avatar: MEMOJI_B, isDark: true,
  },
  aurora: {
    color: "#06b6d4",
    cover: "https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=800&q=80",
    name: "Priya Nair", title: "Brand Strategist", company: "Aurora Co",
    avatar: MEMOJI_A, isDark: true,
  },
  magazine: {
    color: "#be185d",
    cover: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80",
    name: "Isabella Rossi", title: "Fashion Editor", company: "Style Mag",
    avatar: MEMOJI_B, isDark: false,
  },
  executive: {
    color: "#1e3a5f",
    cover: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80",
    name: "David Morgan", title: "Executive Director", company: "Morgan & Co",
    avatar: MEMOJI_A, isDark: false,
  },
  modern_saas: {
    color: "#059669",
    cover: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
    name: "Taylor Kim", title: "Growth Lead", company: "SaaS Labs",
    avatar: MEMOJI_B, isDark: false,
  },
  bold: {
    color: "#ea580c",
    cover: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80",
    name: "Omar Diallo", title: "Entrepreneur", company: "Bold Studio",
    avatar: MEMOJI_A, isDark: false,
  },
  neon: {
    color: "#a21caf",
    cover: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
    name: "Zoe Park", title: "Digital Artist", company: "NeonWorks",
    avatar: MEMOJI_B, isDark: true,
  },
  retro: {
    color: "#b45309",
    cover: "https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=800&q=80",
    name: "James Collins", title: "Vintage Curator", company: "Retro House",
    avatar: MEMOJI_A, isDark: false,
  },
  floating: {
    color: "#0891b2",
    cover: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    name: "Amara Diallo", title: "Wellness Coach", company: "Serenity Co",
    avatar: MEMOJI_B, isDark: false,
  },
  luxury_gold: {
    color: "#B8860B",
    cover: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
    name: "Elena Voss", title: "Luxury Consultant", company: "Gold Class",
    avatar: MEMOJI_A, isDark: true,
  },
  ny_championship: {
    color: "#0B2E6B",
    cover: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80",
    name: "Marcus King", title: "Sports Director", company: "NY Champions",
    avatar: MEMOJI_B, isDark: true,
  },
  lions_teranga: {
    color: "#CC3322",
    cover: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
    name: "Oumar Diallo", title: "Cultural Ambassador", company: "Lions FC",
    avatar: MEMOJI_A, isDark: true,
  },
};

function buildSampleProfile(layoutId) {
  const cfg = LAYOUT_CONFIG[layoutId] || LAYOUT_CONFIG.classic;
  return {
    display_name: cfg.name,
    job_title: cfg.title,
    company_name: cfg.company,
    profile_photo: cfg.avatar,
    cover_photo: cfg.cover,
    cover_color: cfg.color,
    avatar_shape: "circle",
    avatar_placement: "center_overlap",
    avatar_position: "center top",
    cover_position: "center",
    layout: layoutId,
    phone: "+1 555 000 0000",
    email: "hello@example.com",
  };
}

function MiniContentStub({ color, isDark }) {
  // iOS glass-style icons
  const icons = [
    { c: color, shadow: color },
    { c: "#25D366", shadow: "#25D366" },
    { c: "#1877F2", shadow: "#1877F2" },
    { c: "#000000", shadow: "#555" },
    { c: "#E1306C", shadow: "#E1306C" },
  ];
  // Glass link rows
  const glassBg = isDark
    ? "rgba(255,255,255,0.10)"
    : "rgba(255,255,255,0.72)";
  const glassBorder = isDark
    ? "1px solid rgba(255,255,255,0.15)"
    : "1px solid rgba(255,255,255,0.9)";
  const lineColor = isDark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.14)";
  const subColor  = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";

  return (
    <div style={{ padding: "6px 10px", display: "flex", flexDirection: "column", gap: 5 }}>
      {/* iOS-style rounded app icon grid */}
      <div style={{ display: "flex", gap: 5, justifyContent: "center", marginBottom: 4 }}>
        {icons.map((ic, i) => (
          <div key={i} style={{
            width: 28, height: 28,
            borderRadius: 8,
            background: `linear-gradient(145deg, ${ic.c}dd, ${ic.c}88)`,
            flexShrink: 0,
            boxShadow: `0 3px 8px ${ic.shadow}55, inset 0 1px 0 rgba(255,255,255,0.35)`,
            border: "1px solid rgba(255,255,255,0.2)",
          }} />
        ))}
      </div>
      {/* Glass morphic link rows */}
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{
          background: glassBg,
          border: glassBorder,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRadius: 10,
          padding: "6px 9px",
          display: "flex", alignItems: "center", gap: 7,
          boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.06)",
        }}>
          <div style={{
            width: 20, height: 20, borderRadius: 7, flexShrink: 0,
            background: `linear-gradient(145deg, ${color}cc, ${color}66)`,
            boxShadow: `0 2px 6px ${color}44, inset 0 1px 0 rgba(255,255,255,0.3)`,
          }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ height: 5, borderRadius: 3, background: lineColor, width: "55%" }} />
            <div style={{ height: 3, borderRadius: 2, background: subColor, width: "38%" }} />
          </div>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: lineColor, flexShrink: 0 }} />
        </div>
      ))}
    </div>
  );
}

// EXACTLY mirrors PublicProfile.jsx renderActiveLayout()
function LayoutRenderer({ layoutId }) {
  const cfg     = LAYOUT_CONFIG[layoutId] || LAYOUT_CONFIG.classic; // eslint-disable-line no-unused-vars
  const profile = buildSampleProfile(layoutId);
  const color   = cfg.color;
  const isDark  = cfg.isDark;
  const stub    = <MiniContentStub color={color} isDark={isDark} />;
  const lp      = { profile, color, isDark, mobile: true, contentSections: stub };

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
    case "card":            return <CardLayout {...lp} />;
    case "ny_championship": return <NewYorkChampionshipLayout profile={profile}><MiniContentStub color="#FF7A00" isDark={true} /></NewYorkChampionshipLayout>;
    case "lions_teranga": return <LionsOfTerangaLayout profile={profile}><MiniContentStub color="#D4AF37" isDark={true} /></LionsOfTerangaLayout>;
    default:             return <ClassicLayout {...lp} />;
  }
}

export default function LayoutMiniPreview({ layoutId, isSelected = false, previewHeight = 260 }) {
  const cfg = LAYOUT_CONFIG[layoutId] || LAYOUT_CONFIG.classic;
  const RENDER_WIDTH  = 375;
  const RENDER_HEIGHT = 680;
  const scale = previewHeight / RENDER_HEIGHT;

  return (
    <div style={{
      width: "100%",
      height: previewHeight,
      borderRadius: 10,
      overflow: "hidden",
      position: "relative",
      // Use layout's own background color so even light layouts look distinct
      background: cfg.isDark ? "#0a0f1e" : "#f8fafc",
    }}>
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
        <LayoutRenderer layoutId={layoutId} />
      </div>
    </div>
  );
}