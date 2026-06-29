/**
 * LayoutMiniPreview — iOS frosted-glass thumbnail for every profile layout.
 * Each card has a unique color identity while sharing the same glass aesthetic.
 */

// ── Two Memoji assets ────────────────────────────────────────────
const MEMOJI_A = "https://media.base44.com/images/public/692bd9007b93ba81de543346/1ccea4ba2_image.png";
const MEMOJI_B = "https://media.base44.com/images/public/692bd9007b93ba81de543346/09d0f59fa_image.png";

// ── Per-layout identity config ───────────────────────────────────
const LAYOUT_CONFIG = {
  classic:       { accent: "#2563eb",  bg: ["#0f1e3d","#1a3a6b"],  avatar: MEMOJI_A, name: "Alex Johnson",    title: "Marketing Director", icons: ["#2563eb","#25D366","#1877F2","#E1306C"] },
  minimal:       { accent: "#0f172a",  bg: ["#f0fdf4","#dcfce7"],  avatar: MEMOJI_B, name: "Sophie Chen",     title: "UX Designer",        icons: ["#0f172a","#25D366","#1877F2","#FF6B6B"], dark: false },
  card:          { accent: "#7c3aed",  bg: ["#1a0533","#2e1065"],  avatar: MEMOJI_A, name: "Marcus Reid",     title: "Software Engineer",  icons: ["#7c3aed","#a855f7","#06b6d4","#25D366"] },
  image_hero:    { accent: "#dc2626",  bg: ["#1a0000","#3b0000"],  avatar: MEMOJI_B, name: "Nadia Kone",      title: "Creative Director",  icons: ["#dc2626","#FF6B00","#25D366","#1877F2"] },
  glassmorphic:  { accent: "#6366f1",  bg: ["#1c1c1e","#28282a"],  avatar: MEMOJI_A, name: "Liam Torres",     title: "Product Manager",    icons: ["#25D366","#5856D6","#007AFF","#1c1c1e"] },
  dark:          { accent: "#6366f1",  bg: ["#0a0f1e","#111827"],  avatar: MEMOJI_B, name: "Karim Hassan",    title: "CEO & Founder",      icons: ["#6366f1","#a855f7","#25D366","#06b6d4"] },
  aurora:        { accent: "#06b6d4",  bg: ["#0f0c29","#302b63"],  avatar: MEMOJI_A, name: "Priya Nair",      title: "Brand Strategist",   icons: ["#06b6d4","#a855f7","#25D366","#f59e0b"] },
  magazine:      { accent: "#be185d",  bg: ["#fff0f6","#fce7f3"],  avatar: MEMOJI_B, name: "Isabella Rossi",  title: "Fashion Editor",     icons: ["#be185d","#ec4899","#1877F2","#25D366"], dark: false },
  executive:     { accent: "#1e3a5f",  bg: ["#0f1e2e","#1e3a5f"],  avatar: MEMOJI_A, name: "David Morgan",    title: "Executive Director", icons: ["#1e3a5f","#2563eb","#25D366","#f59e0b"] },
  modern_saas:   { accent: "#059669",  bg: ["#022c22","#064e3b"],  avatar: MEMOJI_B, name: "Taylor Kim",      title: "Growth Lead",        icons: ["#059669","#10b981","#1877F2","#f59e0b"] },
  bold:          { accent: "#ea580c",  bg: ["#1c0a00","#431407"],  avatar: MEMOJI_A, name: "Omar Diallo",     title: "Entrepreneur",       icons: ["#ea580c","#f97316","#25D366","#1877F2"] },
  neon:          { accent: "#c026d3",  bg: ["#060912","#0c0e1e"],  avatar: MEMOJI_B, name: "Zoe Park",        title: "Digital Artist",     icons: ["#c026d3","#7c3aed","#00ffcc","#f59e0b"] },
  retro:         { accent: "#b45309",  bg: ["#fdf8ef","#fef3c7"],  avatar: MEMOJI_A, name: "James Collins",   title: "Vintage Curator",    icons: ["#b45309","#d97706","#25D366","#dc2626"], dark: false },
  floating:      { accent: "#0891b2",  bg: ["#e0f2fe","#bae6fd"],  avatar: MEMOJI_B, name: "Amara Diallo",    title: "Wellness Coach",     icons: ["#0891b2","#06b6d4","#25D366","#7c3aed"], dark: false },
  luxury_gold:   { accent: "#B8860B",  bg: ["#0c0700","#1a1000"],  avatar: MEMOJI_A, name: "Elena Voss",      title: "Luxury Consultant",  icons: ["#FFD700","#B8860B","#25D366","#dc2626"] },
  ny_championship:{ accent: "#FF7A00", bg: ["#0B2E6B","#1a4a9e"],  avatar: MEMOJI_B, name: "Marcus King",     title: "Sports Director",    icons: ["#FF7A00","#FFD700","#25D366","#dc2626"] },
  lions_teranga: { accent: "#D4AF37",  bg: ["#1a0800","#3d1200"],  avatar: MEMOJI_A, name: "Oumar Diallo",    title: "Cultural Ambassador",icons: ["#D4AF37","#CC3322","#25D366","#1877F2"] },
};

// ── Shared glass tile builder ─────────────────────────────────────
function glassTile(extraStyle = {}, children, dark = true) {
  return (
    <div style={{
      background: dark ? "rgba(60,60,65,0.82)" : "rgba(255,255,255,0.72)",
      border: dark ? "1px solid rgba(255,255,255,0.11)" : "1px solid rgba(255,255,255,0.9)",
      borderRadius: 14,
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      boxShadow: dark ? "0 4px 16px rgba(0,0,0,0.35)" : "0 2px 10px rgba(0,0,0,0.08)",
      ...extraStyle,
    }}>{children}</div>
  );
}

// ── Unified iOS-glass thumbnail ───────────────────────────────────
function GlassLayoutThumbnail({ layoutId }) {
  const cfg = LAYOUT_CONFIG[layoutId] || LAYOUT_CONFIG.classic;
  const { accent, bg, avatar, name, title, icons } = cfg;
  const dark = cfg.dark !== false; // default true
  const textPrimary   = dark ? "rgba(255,255,255,0.88)" : "rgba(0,0,0,0.82)";
  const textSecondary = dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)";
  const lineColor     = dark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.16)";
  const subColor      = dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";

  // Unique layout-specific header style
  const headerStyle = getHeaderStyle(layoutId, accent, bg, dark);

  return (
    <div style={{
      width: "100%", height: "100%",
      background: dark
        ? `linear-gradient(160deg, ${bg[0]} 0%, ${bg[1]} 100%)`
        : `linear-gradient(160deg, ${bg[0]} 0%, ${bg[1]} 100%)`,
      display: "flex", flexDirection: "column",
      overflow: "hidden", position: "relative",
    }}>
      {/* ── Header area — unique per layout ── */}
      <div style={{ position: "relative", flexShrink: 0, ...headerStyle.container }}>
        {headerStyle.bgLayer}

        {/* Avatar */}
        <div style={{ ...headerStyle.avatarWrapper }}>
          <img src={avatar} alt="" style={{
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center top",
            borderRadius: "inherit",
          }} />
        </div>

        {/* Identity */}
        <div style={{ ...headerStyle.identity }}>
          <div style={{ height: 7, borderRadius: 4, background: textPrimary, width: "58%", marginBottom: 4 }} />
          <div style={{ height: 4, borderRadius: 3, background: accent, width: "38%", opacity: 0.9 }} />
        </div>
      </div>

      {/* ── Content area ── */}
      <div style={{ flex: 1, padding: "8px 10px 10px", display: "flex", flexDirection: "column", gap: 6 }}>
        {/* Icon row */}
        <div style={{ display: "flex", gap: 5, justifyContent: "center" }}>
          {icons.map((c, i) => (
            <div key={i} style={{
              width: 30, height: 30, borderRadius: 9,
              background: `linear-gradient(145deg, ${c}ee, ${c}99)`,
              boxShadow: `0 3px 8px ${c}55, inset 0 1px 0 rgba(255,255,255,0.3)`,
              border: "1px solid rgba(255,255,255,0.18)",
              flexShrink: 0,
            }} />
          ))}
        </div>

        {/* Glass link rows */}
        {[1, 2, 3].map(i =>
          glassTile({
            padding: "7px 9px",
            display: "flex", alignItems: "center", gap: 7,
          },
          <>
            <div style={{
              width: 18, height: 18, borderRadius: 6, flexShrink: 0,
              background: `linear-gradient(145deg, ${accent}cc, ${accent}66)`,
              boxShadow: `0 2px 6px ${accent}44`,
            }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
              <div style={{ height: 5, borderRadius: 3, background: lineColor, width: `${50 + i * 10}%` }} />
              <div style={{ height: 3, borderRadius: 2, background: subColor, width: "35%" }} />
            </div>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: lineColor, flexShrink: 0 }} />
          </>,
          dark
          )
        )}
      </div>

      {/* Subtle accent glow */}
      <div style={{
        position: "absolute", bottom: -20, right: -20,
        width: 100, height: 100,
        background: accent, filter: "blur(40px)", opacity: 0.18,
        borderRadius: "50%", pointerEvents: "none",
      }} />
    </div>
  );
}

// ── Per-layout header variant ─────────────────────────────────────
function getHeaderStyle(layoutId, accent, bg, dark) {
  const textColor = dark ? "#fff" : "#0f172a";
  const avatarBorder = dark ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.9)";

  // Default: centered avatar overlapping cover
  const defaults = {
    container: { height: 90 },
    bgLayer: (
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(135deg, ${accent} 0%, ${accent}88 100%)`,
        opacity: 0.85,
      }} />
    ),
    avatarWrapper: {
      position: "absolute", bottom: -22, left: "50%", transform: "translateX(-50%)",
      width: 44, height: 44, borderRadius: "50%",
      border: `3px solid ${avatarBorder}`,
      overflow: "hidden", zIndex: 2,
      boxShadow: `0 4px 14px rgba(0,0,0,0.35)`,
    },
    identity: {
      position: "absolute", bottom: -54, left: 0, right: 0,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 0,
    },
  };

  const variants = {
    // Minimal: left-strip accent, horizontal layout
    minimal: {
      container: { height: 70, display: "flex", alignItems: "center", gap: 10, padding: "0 10px", background: dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.85)", borderBottom: `3px solid ${accent}` },
      bgLayer: null,
      avatarWrapper: { width: 40, height: 40, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: `2px solid ${accent}55` },
      identity: { flex: 1, display: "flex", flexDirection: "column", gap: 4 },
    },
    // Card: small top strip + avatar in floating card
    card: {
      container: { height: 80 },
      bgLayer: <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${accent}, ${accent}66)` }} />,
      avatarWrapper: {
        position: "absolute", bottom: -18, left: 10,
        width: 36, height: 36, borderRadius: "50%",
        border: `2px solid ${avatarBorder}`, overflow: "hidden", zIndex: 2,
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      },
      identity: {
        position: "absolute", bottom: -50, left: 52, right: 8,
        display: "flex", flexDirection: "column", gap: 3,
      },
    },
    // Image hero: avatar bottom-right
    image_hero: {
      container: { height: 100 },
      bgLayer: <div style={{ position: "absolute", inset: 0, background: `linear-gradient(150deg, ${accent}cc, ${accent}44)` }} />,
      avatarWrapper: {
        position: "absolute", bottom: -18, right: 10,
        width: 40, height: 40, borderRadius: 10,
        border: `2px solid rgba(255,255,255,0.5)`, overflow: "hidden", zIndex: 2,
        boxShadow: "0 6px 18px rgba(0,0,0,0.4)",
      },
      identity: {
        position: "absolute", bottom: -52, left: 10, right: 55,
        display: "flex", flexDirection: "column", gap: 3,
      },
    },
    // Executive: avatar right, text left
    executive: {
      container: { height: 95 },
      bgLayer: <div style={{ position: "absolute", inset: 0, background: `linear-gradient(150deg, ${accent} 0%, ${accent}66 100%)` }} />,
      avatarWrapper: {
        position: "absolute", bottom: -18, right: 10,
        width: 42, height: 42, borderRadius: "50%",
        border: `3px solid rgba(255,255,255,0.4)`, overflow: "hidden", zIndex: 2,
        boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
      },
      identity: {
        position: "absolute", bottom: -50, left: 10, right: 58,
        display: "flex", flexDirection: "column", gap: 3,
      },
    },
    // Modern SaaS: horizontal header card
    modern_saas: {
      container: { height: 72, display: "flex", alignItems: "center", gap: 10, padding: "0 10px", background: dark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.9)", borderTop: `4px solid ${accent}` },
      bgLayer: null,
      avatarWrapper: { width: 38, height: 38, borderRadius: 10, overflow: "hidden", flexShrink: 0, border: `2px solid ${accent}55` },
      identity: { flex: 1, display: "flex", flexDirection: "column", gap: 4 },
    },
    // Bold/color: full-color, centered
    bold: {
      container: { height: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "12px 10px 28px", gap: 8, background: `linear-gradient(145deg, ${accent}, ${accent}99)` },
      bgLayer: null,
      avatarWrapper: { width: 44, height: 44, borderRadius: "50%", overflow: "hidden", border: `3px solid rgba(255,255,255,0.5)`, boxShadow: "0 4px 14px rgba(0,0,0,0.3)" },
      identity: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3, marginTop: 4 },
    },
    // Magazine: photo strip + avatar lower-left
    magazine: {
      container: { height: 90 },
      bgLayer: <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, #0f2027, ${accent}88, #203a43)` }} />,
      avatarWrapper: {
        position: "absolute", bottom: -16, left: 10,
        width: 36, height: 36, borderRadius: "50%",
        border: `2px solid rgba(255,255,255,0.6)`, overflow: "hidden", zIndex: 2,
        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
      },
      identity: {
        position: "absolute", bottom: -46, left: 52, right: 8,
        display: "flex", flexDirection: "column", gap: 3,
      },
    },
    // Retro: warm paper, horizontal, dashed border
    retro: {
      container: { height: 72, display: "flex", alignItems: "center", gap: 10, padding: "0 10px", borderBottom: `3px double ${accent}55`, borderTop: `2px solid ${accent}33`, background: "rgba(255,255,255,0.7)" },
      bgLayer: null,
      avatarWrapper: { width: 38, height: 38, borderRadius: 6, overflow: "hidden", flexShrink: 0, border: `2px solid ${accent}`, boxShadow: `3px 3px 0 ${accent}44` },
      identity: { flex: 1, display: "flex", flexDirection: "column", gap: 4 },
    },
    // Floating: identity card floating above content
    floating: {
      container: { height: 80, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "8px 10px" },
      bgLayer: null,
      avatarWrapper: { width: 40, height: 40, borderRadius: "50%", overflow: "hidden", border: `3px solid ${accent}`, boxShadow: `0 4px 14px ${accent}55` },
      identity: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3 },
    },
    // NY Championship & Lions Teranga: bold hero
    ny_championship: {
      container: { height: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "10px", background: `linear-gradient(160deg, #0B2E6B, #1a4a9e)`, gap: 6 },
      bgLayer: null,
      avatarWrapper: { width: 44, height: 44, borderRadius: "50%", overflow: "hidden", border: `3px solid ${accent}`, boxShadow: `0 0 0 2px rgba(255,125,0,0.3), 0 4px 14px rgba(0,0,0,0.5)` },
      identity: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3 },
    },
    lions_teranga: {
      container: { height: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "10px", background: `linear-gradient(160deg, #1a0800, #3d1200)`, gap: 6 },
      bgLayer: null,
      avatarWrapper: { width: 44, height: 44, borderRadius: "50%", overflow: "hidden", border: `3px solid ${accent}`, boxShadow: `0 0 0 2px rgba(212,175,55,0.3), 0 4px 14px rgba(0,0,0,0.5)` },
      identity: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3 },
    },
  };

  // Merged fallback
  return variants[layoutId] || defaults;
}

export default function LayoutMiniPreview({ layoutId, isSelected = false, previewHeight = 260 }) {
  return (
    <div style={{
      width: "100%",
      height: previewHeight,
      borderRadius: 10,
      overflow: "hidden",
      position: "relative",
    }}>
      <div style={{ width: "100%", height: "100%", pointerEvents: "none", userSelect: "none" }}>
        <GlassLayoutThumbnail layoutId={layoutId} />
      </div>
    </div>
  );
}