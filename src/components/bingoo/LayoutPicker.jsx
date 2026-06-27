import { Link } from "react-router-dom";

// ── Generic sample avatars — never use personal user photos ──
// Rotate through these so thumbnails look varied and professional
const SAMPLE_AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=ffdfbf",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jade&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus&backgroundColor=d1d4f9",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia&backgroundColor=ffd5dc",
];

// ── Mini avatar — always uses a generic illustration, never user photo ──
function MiniAvatar({ avatarUrl, size = 28, color = "#2563eb", border = "2px solid white", shape = "circle" }) {
  const radius = shape === "circle" ? "50%" : shape === "rounded" ? "22%" : shape === "squircle" ? "28%" : "12%";
  return (
    <div style={{
      width: size, height: size, borderRadius: radius, flexShrink: 0,
      border, overflow: "hidden", background: color,
      boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
    }}>
      <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  );
}

// ── Mini cover area — uses brand color only, never personal cover photo ──
function MiniCover({ color, height = "35%", children }) {
  return (
    <div style={{
      height, position: "relative", flexShrink: 0, overflow: "hidden",
      background: `linear-gradient(135deg, ${color}, ${color}bb)`,
    }}>
      {children}
    </div>
  );
}

// ── Sample link rows ─────────────────────────────────────────
function MiniLinkRow({ color, isDark }) {
  const bg = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {[1, 2].map(i => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 4px", borderRadius: 5, background: bg }}>
          <div style={{ width: 8, height: 8, borderRadius: 3, background: color, opacity: 0.7, flexShrink: 0 }} />
          <div style={{ flex: 1, height: 3, borderRadius: 2, background: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.1)" }} />
        </div>
      ))}
    </div>
  );
}

// ── Name + title bars ────────────────────────────────────────
function MiniName({ isDark, wide = false }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <div style={{ width: wide ? 40 : 32, height: 4, borderRadius: 3, background: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.55)" }} />
      <div style={{ width: wide ? 28 : 22, height: 2.5, borderRadius: 2, background: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.2)" }} />
    </div>
  );
}

// ── 3 action icon dots ────────────────────────────────────────
function MiniActionDots({ color }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 3, marginBottom: 2 }}>
      {[color, "#94a3b8", "#94a3b8"].map((c, i) => (
        <div key={i} style={{ width: 14, height: 8, borderRadius: 4, background: i === 0 ? color : "rgba(0,0,0,0.07)", border: i !== 0 ? "1px solid #e2e8f0" : "none" }} />
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// Layout thumbnails — each receives (color, profile)
// ════════════════════════════════════════════════════════════════
const layouts = [
  // ── FREE ────────────────────────────────────────────────────
  {
    id: "classic",
    name: "Classic",
    desc: "Cover + card",
    pro: false,
    preview: (color, avatarUrl) => (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", background: "#f2f4f7", border: "1px solid #e2e8f0" }}>
        <MiniCover color={color} height="38%" />
        <div style={{ flex: 1, background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", padding: "0 6px 6px" }}>
          <div style={{ marginTop: -14 }}>
            <MiniAvatar avatarUrl={avatarUrl} size={28} color={color} border="2px solid #fff" />
          </div>
          <div style={{ marginTop: 3 }}><MiniName /></div>
          <MiniActionDots color={color} />
          <MiniLinkRow color={color} />
        </div>
      </div>
    ),
  },
  {
    id: "minimal",
    name: "Minimal",
    desc: "Clean, no cover",
    pro: false,
    preview: (color, avatarUrl) => (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", background: "#fff", border: "1px solid #e8eaf0", padding: 6, gap: 5 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <MiniAvatar avatarUrl={avatarUrl} size={24} color={color} border="1.5px solid #e2e8f0" />
          <div style={{ flex: 1 }}>
            <div style={{ height: 4, width: 36, borderRadius: 3, background: "#1e293b", marginBottom: 2 }} />
            <div style={{ height: 2.5, width: 24, borderRadius: 2, background: "#94a3b8" }} />
          </div>
        </div>
        <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 5 }}>
          <MiniLinkRow color={color} />
        </div>
        <MiniActionDots color={color} />
      </div>
    ),
  },
  {
    id: "card",
    name: "Card Grid",
    desc: "Portfolio grid",
    pro: false,
    preview: (color, avatarUrl) => (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", background: "#f8fafc", padding: 5, gap: 4 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, paddingBottom: 4, borderBottom: "1px solid #e2e8f0" }}>
          <MiniAvatar avatarUrl={avatarUrl} size={22} color={color} />
          <div style={{ height: 3, width: 28, borderRadius: 2, background: "#1e293b" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, flex: 1 }}>
          {[color + "33", "#f1f5f9", "#f1f5f9", color + "22"].map((bg, i) => (
            <div key={i} style={{ borderRadius: 5, background: bg, border: "1px solid #e2e8f0" }} />
          ))}
        </div>
      </div>
    ),
  },
  // ── PRO ─────────────────────────────────────────────────────
  {
    id: "dark",
    name: "Dark",
    desc: "Dark glassmorphism",
    pro: true,
    preview: (color, avatarUrl) => (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", background: "#0f172a", padding: 6, gap: 4 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <MiniAvatar avatarUrl={avatarUrl} size={26} color={color} border={`2px solid ${color}55`} />
          <MiniName isDark />
        </div>
        <MiniActionDots color={color} />
        <MiniLinkRow color={color} isDark />
      </div>
    ),
  },
  {
    id: "bold",
    name: "Bold",
    desc: "Full gradient",
    pro: true,
    preview: (color, avatarUrl) => (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", padding: 6, gap: 4, background: `linear-gradient(135deg, ${color}, ${color}bb)` }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <MiniAvatar avatarUrl={avatarUrl} size={26} color="#fff" border="2px solid rgba(255,255,255,0.5)" />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <div style={{ width: 32, height: 4, borderRadius: 3, background: "rgba(255,255,255,0.85)" }} />
            <div style={{ width: 22, height: 2.5, borderRadius: 2, background: "rgba(255,255,255,0.5)" }} />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ height: 6, borderRadius: 4, background: "rgba(255,255,255,0.3)" }} />
          <div style={{ height: 6, borderRadius: 4, background: "rgba(255,255,255,0.2)" }} />
        </div>
      </div>
    ),
  },
  {
    id: "split",
    name: "Split",
    desc: "Side accent bar",
    pro: true,
    preview: (color, avatarUrl) => (
      <div style={{ width: "100%", height: "100%", display: "flex", borderRadius: 10, overflow: "hidden", border: "1px solid #e2e8f0" }}>
        <div style={{ width: 6, background: color, flexShrink: 0 }} />
        <div style={{ flex: 1, background: "#fff", padding: 6, display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <MiniAvatar avatarUrl={avatarUrl} size={22} color={color} border="1.5px solid #e2e8f0" />
            <div style={{ flex: 1 }}>
              <div style={{ height: 4, width: 30, borderRadius: 2, background: "#1e293b" }} />
            </div>
          </div>
          <MiniLinkRow color={color} />
        </div>
      </div>
    ),
  },
  {
    id: "glassmorphic",
    name: "Glass",
    desc: "Frosted glass",
    pro: true,
    preview: (color, avatarUrl) => (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", padding: 5, gap: 4, background: `linear-gradient(135deg, ${color}44, #e0e7ff)` }}>
        <div style={{ background: "rgba(255,255,255,0.55)", borderRadius: 8, padding: 5, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <MiniAvatar avatarUrl={avatarUrl} size={22} color={color} border="1.5px solid rgba(255,255,255,0.8)" />
          <div style={{ height: 3, width: 28, borderRadius: 2, background: "rgba(255,255,255,0.8)" }} />
        </div>
        <div style={{ background: "rgba(255,255,255,0.3)", borderRadius: 8, padding: 4 }}>
          <MiniLinkRow color={color} isDark={false} />
        </div>
      </div>
    ),
  },
  {
    id: "gradient",
    name: "Gradient",
    desc: "Flowing colors",
    pro: true,
    preview: (color, avatarUrl) => (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", padding: 5, gap: 4, background: `linear-gradient(135deg, ${color}33, ${color}aa)` }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <MiniAvatar avatarUrl={avatarUrl} size={24} color={color} border="2px solid rgba(255,255,255,0.7)" />
          <div style={{ height: 3, width: 28, borderRadius: 2, background: "rgba(255,255,255,0.7)" }} />
          <div style={{ height: 2, width: 18, borderRadius: 2, background: "rgba(255,255,255,0.45)" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ height: 5, borderRadius: 4, background: "rgba(255,255,255,0.35)" }} />
          <div style={{ height: 5, borderRadius: 4, background: "rgba(255,255,255,0.2)" }} />
        </div>
      </div>
    ),
  },
  {
    id: "neon",
    name: "Neon",
    desc: "Glowing neon vibes",
    pro: true,
    preview: (color, avatarUrl) => (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", background: "#050010", padding: 6, gap: 4 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <div style={{ padding: 2, borderRadius: "50%", boxShadow: `0 0 8px ${color}, 0 0 16px ${color}66` }}>
            <MiniAvatar avatarUrl={avatarUrl} size={24} color={color} border={`1.5px solid ${color}`} />
          </div>
          <div style={{ height: 3, width: 28, borderRadius: 2, background: color, boxShadow: `0 0 6px ${color}` }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ height: 6, borderRadius: 4, border: `1px solid ${color}88`, background: `${color}11` }} />
          <div style={{ height: 6, borderRadius: 4, border: `1px solid ${color}55`, background: "transparent" }} />
        </div>
      </div>
    ),
  },
  {
    id: "retro",
    name: "Retro",
    desc: "80s bold style",
    pro: true,
    preview: (color, avatarUrl) => (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", background: "#fffbeb", border: "2px solid #1a1a1a", padding: 5, gap: 4 }}>
        <div style={{ background: "#1a1a1a", borderRadius: 4, padding: "3px 5px", textAlign: "center" }}>
          <div style={{ height: 3, width: 24, borderRadius: 2, background: "#fbbf24", margin: "0 auto" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, border: "1.5px solid #1a1a1a", borderRadius: 6, padding: 4 }}>
          <MiniAvatar avatarUrl={avatarUrl} size={22} color={color} border="2px solid #1a1a1a" />
          <div style={{ height: 3, width: 24, borderRadius: 2, background: "#1a1a1a" }} />
        </div>
        <div style={{ height: 6, borderRadius: 3, background: "#1a1a1a" }} />
      </div>
    ),
  },
  {
    id: "magazine",
    name: "Magazine",
    desc: "Editorial",
    pro: true,
    preview: (color, avatarUrl) => (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
        <MiniCover color={color} height="40%">
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 12, background: "linear-gradient(to top, #fff, transparent)" }} />
        </MiniCover>
        <div style={{ display: "flex", gap: 5, padding: "0 6px 6px", flex: 1 }}>
          <div style={{ marginTop: -14, flexShrink: 0 }}>
            <MiniAvatar avatarUrl={avatarUrl} size={26} color={color} border="2px solid #fff" />
          </div>
          <div style={{ flex: 1, paddingTop: 4, display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ height: 4, width: "100%", borderRadius: 2, background: "#1e293b" }} />
            <div style={{ height: 2.5, width: "65%", borderRadius: 2, background: "#94a3b8" }} />
            <div style={{ height: 3, width: "100%", borderRadius: 2, background: "#f1f5f9", marginTop: 2 }} />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "aurora",
    name: "Aurora",
    desc: "Northern lights",
    pro: true,
    preview: (color, avatarUrl) => (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", background: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)", padding: 5, gap: 4 }}>
        <div style={{ height: 8, borderRadius: 4, background: `linear-gradient(90deg, ${color}88, #a855f788, #06b6d488)` }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <MiniAvatar avatarUrl={avatarUrl} size={24} color={color} border="2px solid rgba(255,255,255,0.3)" />
          <MiniName isDark />
        </div>
        <MiniLinkRow color={color} isDark />
      </div>
    ),
  },
  {
    id: "minimal_dark",
    name: "Minimal Dark",
    desc: "Clean dark mode",
    pro: true,
    preview: (color, avatarUrl) => (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", background: "#18181b", padding: 6, gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 5 }}>
          <MiniAvatar avatarUrl={avatarUrl} size={22} color={color} border="1.5px solid rgba(255,255,255,0.15)" />
          <div style={{ flex: 1 }}>
            <div style={{ height: 4, width: 32, borderRadius: 2, background: "rgba(255,255,255,0.6)", marginBottom: 2 }} />
            <div style={{ height: 2.5, width: 22, borderRadius: 2, background: "rgba(255,255,255,0.25)" }} />
          </div>
        </div>
        <MiniLinkRow color={color} isDark />
      </div>
    ),
  },
  {
    id: "pastel",
    name: "Pastel",
    desc: "Soft pastel tones",
    pro: true,
    preview: (color, avatarUrl) => (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", background: "#fdf2f8", padding: 0 }}>
        <div style={{ height: "35%", background: `linear-gradient(135deg, ${color}55, #f9a8d455)`, position: "relative" }}>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 6px 6px" }}>
          <div style={{ marginTop: -14 }}>
            <MiniAvatar avatarUrl={avatarUrl} size={26} color={color} border="2px solid #fdf2f8" />
          </div>
          <div style={{ marginTop: 3 }}><MiniName /></div>
          <div style={{ marginTop: 5, display: "flex", flexDirection: "column", gap: 3, width: "100%" }}>
            <div style={{ height: 5, borderRadius: 6, background: "#fbcfe8", border: "1px solid #f9a8d4" }} />
            <div style={{ height: 5, borderRadius: 6, background: "#ede9fe", border: "1px solid #ddd6fe" }} />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "corporate",
    name: "Corporate",
    desc: "Professional B2B",
    pro: true,
    preview: (color, avatarUrl) => (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", background: "#fff", border: "1px solid #e2e8f0" }}>
        <div style={{ height: 4, background: color }} />
        <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 6px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: "#f8fafc", border: "1px solid #e2e8f0", overflow: "hidden", flexShrink: 0 }}>
            <MiniAvatar avatarUrl={avatarUrl} size={22} color={color} border="none" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ height: 4, width: 34, borderRadius: 2, background: "#1e293b", marginBottom: 2 }} />
            <div style={{ height: 2.5, width: 22, borderRadius: 2, background: "#94a3b8" }} />
          </div>
        </div>
        <div style={{ flex: 1, padding: "4px 6px", display: "flex", flexDirection: "column", gap: 3 }}>
          <MiniLinkRow color={color} />
        </div>
      </div>
    ),
  },
  {
    id: "floating",
    name: "Floating",
    desc: "Floating card style",
    pro: true,
    preview: (color, avatarUrl) => (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: 10, overflow: "hidden", padding: 5, gap: 4, background: `radial-gradient(circle at top, ${color}22, #f1f5f9)` }}>
        <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", padding: "6px 8px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, border: "1px solid #f1f5f9" }}>
          <MiniAvatar avatarUrl={avatarUrl} size={24} color={color} border="2px solid #fff" />
          <MiniName />
        </div>
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07)", padding: "4px 6px", width: "100%", border: "1px solid #f1f5f9" }}>
          <MiniLinkRow color={color} />
        </div>
      </div>
    ),
  },
  // ── Additional layouts ────────────────────────────────────
  {
    id: "sunset",
    name: "Sunset",
    desc: "Warm orange gradient",
    pro: true,
    preview: (color, avatarUrl) => (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", background: "linear-gradient(160deg,#ff6b35,#f7c59f,#ffe0cc)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 6px 4px", gap: 3 }}>
          <MiniAvatar avatarUrl={avatarUrl} size={24} color={color} border="2px solid rgba(255,255,255,0.6)" />
          <div style={{ height: 3, width: 28, borderRadius: 2, background: "rgba(255,255,255,0.85)" }} />
        </div>
        <div style={{ margin: "0 5px", flex: 1, borderRadius: 8, background: "rgba(255,255,255,0.3)", padding: 4 }}>
          <MiniLinkRow color="#fff" />
        </div>
      </div>
    ),
  },
  {
    id: "ocean",
    name: "Ocean",
    desc: "Deep sea vibes",
    pro: true,
    preview: (color, avatarUrl) => (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", background: "linear-gradient(160deg,#0077b6,#00b4d8,#90e0ef)" }}>
        <div style={{ height: "35%", background: "linear-gradient(160deg,#0077b655,#00b4d855)" }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 6px 6px", flex: 1, gap: 3 }}>
          <div style={{ marginTop: -14 }}>
            <MiniAvatar avatarUrl={avatarUrl} size={26} color={color} border="2px solid rgba(255,255,255,0.7)" />
          </div>
          <MiniName isDark />
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 3, marginTop: 2 }}>
            <div style={{ height: 5, borderRadius: 4, background: "rgba(255,255,255,0.25)" }} />
            <div style={{ height: 5, borderRadius: 4, background: "rgba(255,255,255,0.15)" }} />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "forest",
    name: "Forest",
    desc: "Nature & earthy tones",
    pro: true,
    preview: (color, avatarUrl) => (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", background: "#052e16", padding: 5, gap: 4 }}>
        <div style={{ height: 8, borderRadius: 4, background: "linear-gradient(90deg,#16a34a88,#14532d88)" }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <MiniAvatar avatarUrl={avatarUrl} size={24} color={color} border="2px solid rgba(74,222,128,0.4)" />
          <MiniName isDark />
        </div>
        <MiniLinkRow color="#4ade80" isDark />
      </div>
    ),
  },
  {
    id: "luxury",
    name: "Luxury",
    desc: "Gold & black",
    pro: true,
    preview: (color, avatarUrl) => (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", background: "#09090b", padding: 5, gap: 4 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, paddingBottom: 5, borderBottom: "1px solid rgba(212,175,55,0.3)" }}>
          <MiniAvatar avatarUrl={avatarUrl} size={24} color={color} border="1.5px solid rgba(212,175,55,0.6)" />
          <div style={{ height: 3, width: 28, borderRadius: 2, background: "linear-gradient(90deg,#b45309,#fbbf24)" }} />
        </div>
        <MiniLinkRow color="#fbbf24" isDark />
      </div>
    ),
  },
  {
    id: "bubbly",
    name: "Bubbly",
    desc: "Fun colorful",
    pro: true,
    preview: (color, avatarUrl) => (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", background: "#fff", padding: 5, gap: 4, position: "relative" }}>
        <div style={{ position: "absolute", top: 4, right: 4, width: 18, height: 18, borderRadius: "50%", background: color, opacity: 0.2 }} />
        <div style={{ position: "absolute", bottom: 8, left: 4, width: 12, height: 12, borderRadius: "50%", background: "#f472b6", opacity: 0.2 }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, position: "relative", zIndex: 1 }}>
          <MiniAvatar avatarUrl={avatarUrl} size={26} color={color} border="2px solid #fff" />
          <MiniName />
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <MiniLinkRow color={color} />
        </div>
      </div>
    ),
  },
  {
    id: "monochrome",
    name: "Mono",
    desc: "Black & white stark",
    pro: true,
    preview: (color, avatarUrl) => (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", background: "#fff", border: "2px solid #000" }}>
        <div style={{ background: "#000", padding: "5px 6px", display: "flex", alignItems: "center", gap: 5 }}>
          <MiniAvatar avatarUrl={avatarUrl} size={20} color="#fff" border="none" />
        </div>
        <div style={{ flex: 1, padding: "4px 6px", display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ height: 4, width: 30, borderRadius: 2, background: "#000" }} />
          <div style={{ height: 2.5, width: 20, borderRadius: 2, background: "#555" }} />
          <div style={{ height: 5, borderRadius: 3, border: "2px solid #000" }} />
          <div style={{ height: 5, borderRadius: 3, background: "#000" }} />
        </div>
      </div>
    ),
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    desc: "Futuristic",
    pro: true,
    preview: (color, avatarUrl) => (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", background: "#0a001f", padding: 5, gap: 4 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <div style={{ padding: 1, border: `1px solid ${color}`, boxShadow: `0 0 8px ${color}`, borderRadius: 4 }}>
            <MiniAvatar avatarUrl={avatarUrl} size={22} color={color} border="none" />
          </div>
          <div style={{ height: 3, width: 28, borderRadius: 2, background: color, boxShadow: `0 0 4px ${color}` }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ height: 5, borderRadius: 3, border: `1px solid ${color}88`, background: `${color}11` }} />
          <div style={{ height: 5, borderRadius: 3, border: `1px solid ${color}44` }} />
        </div>
      </div>
    ),
  },
  {
    id: "frosted",
    name: "Frosted",
    desc: "iOS blur panels",
    pro: true,
    preview: (color, avatarUrl) => (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", padding: 5, gap: 4, background: `linear-gradient(135deg,${color}44,${color}22,#e0e7ff88)` }}>
        <div style={{ background: "rgba(255,255,255,0.55)", borderRadius: 8, padding: 5, display: "flex", alignItems: "center", gap: 5, backdropFilter: "blur(8px)" }}>
          <MiniAvatar avatarUrl={avatarUrl} size={22} color={color} border="1.5px solid rgba(255,255,255,0.8)" />
          <div style={{ flex: 1 }}>
            <div style={{ height: 3, width: "100%", borderRadius: 2, background: "rgba(0,0,0,0.18)", marginBottom: 2 }} />
            <div style={{ height: 2, width: "65%", borderRadius: 2, background: "rgba(0,0,0,0.1)" }} />
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.4)", borderRadius: 8, padding: 4, backdropFilter: "blur(8px)" }}>
          <MiniLinkRow color={color} />
        </div>
      </div>
    ),
  },
  {
    id: "paper",
    name: "Paper",
    desc: "Clean editorial serif",
    pro: true,
    preview: (color, avatarUrl) => (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", background: "#fffbeb", border: "1px solid #d6b97a", padding: 5, gap: 4 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", borderBottom: "2px solid #1a1a1a", paddingBottom: 4 }}>
          <div>
            <div style={{ height: 5, width: 34, borderRadius: 2, background: "#1a1a1a", marginBottom: 2 }} />
            <div style={{ height: 3, width: 22, borderRadius: 2, background: "#78716c" }} />
          </div>
          <MiniAvatar avatarUrl={avatarUrl} size={20} color={color} border="1.5px solid #1a1a1a" />
        </div>
        <MiniLinkRow color={color} />
      </div>
    ),
  },
  {
    id: "wave",
    name: "Wave",
    desc: "Organic wave shapes",
    pro: true,
    preview: (color, avatarUrl) => (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
        <div style={{ height: "38%", position: "relative", background: `linear-gradient(135deg,${color},${color}88)` }}>
          <svg viewBox="0 0 100 20" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0, width: "100%", height: 12 }}>
            <path d="M0,10 C20,20 40,0 60,10 C80,20 100,5 100,10 L100,20 L0,20 Z" fill="white" />
          </svg>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 6px 6px", gap: 3 }}>
          <div style={{ marginTop: -14 }}>
            <MiniAvatar avatarUrl={avatarUrl} size={26} color={color} border="2px solid #fff" />
          </div>
          <MiniName />
          <MiniLinkRow color={color} />
        </div>
      </div>
    ),
  },
  {
    id: "glass_3d",
    name: "3D Glass",
    desc: "Depth & glass layers",
    pro: true,
    preview: (color, avatarUrl) => (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", padding: 5, gap: 4, background: `linear-gradient(135deg, ${color}33 0%, ${color}11 50%, rgba(255,255,255,0.5) 100%)` }}>
        <div style={{ borderRadius: 8, padding: 5, display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}>
          <MiniAvatar avatarUrl={avatarUrl} size={20} color={color} border="1px solid rgba(255,255,255,0.8)" />
          <div style={{ flex: 1 }}>
            <div style={{ height: 3, width: "100%", borderRadius: 2, background: "rgba(0,0,0,0.15)", marginBottom: 2 }} />
            <div style={{ height: 2, width: "60%", borderRadius: 2, background: "rgba(0,0,0,0.08)" }} />
          </div>
        </div>
        <div style={{ borderRadius: 8, padding: 4, flex: 1, background: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.6)" }}>
          <MiniLinkRow color={color} />
        </div>
      </div>
    ),
  },
  {
    id: "luxury_gold",
    name: "Luxury Gold",
    desc: "Premium gold prestige",
    pro: true,
    preview: (color, avatarUrl) => (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", background: "linear-gradient(160deg,#1a0a00,#2d1a00,#1a0a00)", padding: 5, gap: 4 }}>
        <div style={{ height: 2, borderRadius: 1, background: "linear-gradient(90deg,transparent,#D4AF37,#FFD700,#D4AF37,transparent)" }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <MiniAvatar avatarUrl={avatarUrl} size={24} color="#B8860B" border="1.5px solid #D4AF37" />
          <div style={{ height: 3, width: 28, borderRadius: 2, background: "linear-gradient(90deg,#B8860B,#FFD700,#B8860B)" }} />
        </div>
        <MiniLinkRow color="#D4AF37" isDark />
      </div>
    ),
  },
  {
    id: "executive_corp",
    name: "Executive",
    desc: "C-suite prestige",
    pro: true,
    preview: (color, avatarUrl) => (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", background: "#020617", padding: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 6px", borderBottom: `1px solid ${color}33` }}>
          <MiniAvatar avatarUrl={avatarUrl} size={20} color={color} border="1px solid rgba(255,255,255,0.15)" />
          <div style={{ flex: 1 }}>
            <div style={{ height: 3, width: 28, borderRadius: 2, background: "rgba(255,255,255,0.5)", marginBottom: 2 }} />
            <div style={{ height: 2, width: 18, borderRadius: 2, background: color, opacity: 0.7 }} />
          </div>
          <div style={{ width: 3, height: 18, borderRadius: 2, background: color }} />
        </div>
        <div style={{ flex: 1, padding: "4px 6px", display: "flex", flexDirection: "column", gap: 3 }}>
          <MiniLinkRow color={color} isDark />
        </div>
      </div>
    ),
  },
  {
    id: "neon_tech",
    name: "Neon Tech",
    desc: "Cybernetic glow",
    pro: true,
    preview: (color, avatarUrl) => (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", background: "#050510", padding: 5, gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, paddingBottom: 4, borderBottom: `1px solid ${color}44` }}>
          <div style={{ borderRadius: 4, border: `1px solid ${color}`, boxShadow: `0 0 6px ${color}`, overflow: "hidden" }}>
            <MiniAvatar avatarUrl={avatarUrl} size={20} color={color} border="none" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ height: 3, width: "100%", borderRadius: 2, background: `${color}77`, marginBottom: 2 }} />
            <div style={{ height: 2, width: "60%", borderRadius: 2, background: "rgba(6,182,212,0.4)" }} />
          </div>
        </div>
        <MiniLinkRow color={color} isDark />
      </div>
    ),
  },
  {
    id: "modern_law",
    name: "Modern Law",
    desc: "Prestigious legal",
    pro: true,
    preview: (color, avatarUrl) => (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", height: "40%", flexShrink: 0 }}>
          <div style={{ width: 4, background: color }} />
          <div style={{ flex: 1, background: "#1e293b", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 6px", gap: 2 }}>
            <div style={{ height: 3, width: 28, borderRadius: 2, background: "rgba(255,255,255,0.7)" }} />
            <div style={{ height: 2, width: 18, borderRadius: 2, background: color, opacity: 0.8 }} />
          </div>
          <div style={{ width: 22, background: "#334155", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MiniAvatar avatarUrl={avatarUrl} size={18} color={color} border="none" />
          </div>
        </div>
        <div style={{ flex: 1, padding: "4px 6px", display: "flex", flexDirection: "column", gap: 3 }}>
          <MiniLinkRow color={color} />
        </div>
      </div>
    ),
  },
  {
    id: "premium_salon",
    name: "Premium Salon",
    desc: "Chic & elegant",
    pro: true,
    preview: (color, avatarUrl) => (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", background: "linear-gradient(160deg,#1a0a14,#2d1020)", padding: 5, gap: 4 }}>
        <div style={{ height: 2, borderRadius: 1, background: `linear-gradient(90deg,transparent,${color},#f9a8d4,${color},transparent)` }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <MiniAvatar avatarUrl={avatarUrl} size={24} color={color} border="1.5px solid rgba(249,168,212,0.5)" />
          <div style={{ height: 3, width: 28, borderRadius: 2, background: "rgba(249,168,212,0.6)" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
          <div style={{ height: 16, borderRadius: 6, background: "rgba(249,168,212,0.15)", border: "1px solid rgba(249,168,212,0.2)" }} />
          <div style={{ height: 16, borderRadius: 6, background: "rgba(249,168,212,0.15)", border: "1px solid rgba(249,168,212,0.2)" }} />
        </div>
      </div>
    ),
  },
  {
    id: "realtor_luxury",
    name: "Realtor",
    desc: "Property prestige",
    pro: true,
    preview: (color, avatarUrl) => (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
        <div style={{ flex: 1, position: "relative", background: "linear-gradient(160deg,#0f2027,#203a43,#2c5364)" }}>
          <div style={{ position: "absolute", bottom: 6, left: 6 }}>
            <div style={{ height: 3, width: 28, borderRadius: 2, background: "rgba(255,255,255,0.85)", marginBottom: 2 }} />
            <div style={{ height: 2, width: 18, borderRadius: 2, background: color, opacity: 0.8 }} />
          </div>
        </div>
        <div style={{ padding: "4px 6px", background: "#fff", display: "flex", flexDirection: "column", gap: 3 }}>
          <MiniLinkRow color={color} />
        </div>
      </div>
    ),
  },
  {
    id: "animated_gradient",
    name: "Animated",
    desc: "Living gradient",
    pro: true,
    preview: (color, avatarUrl) => (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", background: `conic-gradient(from 0deg at 50% 50%, ${color}, #a855f7, #06b6d4, ${color})`, padding: 5, gap: 4 }}>
        <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: 5, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <MiniAvatar avatarUrl={avatarUrl} size={22} color="#fff" border="2px solid rgba(255,255,255,0.6)" />
          <div style={{ height: 3, width: 28, borderRadius: 2, background: "rgba(255,255,255,0.8)" }} />
        </div>
        <div style={{ background: "rgba(0,0,0,0.15)", borderRadius: 8, padding: 4 }}>
          <MiniLinkRow color="#fff" isDark />
        </div>
      </div>
    ),
  },
  {
    id: "video_bg",
    name: "Video BG",
    desc: "Dynamic video backdrop",
    pro: true,
    preview: (color, avatarUrl) => (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", background: "linear-gradient(135deg,#0f0f0f,#1a1a2e)", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 0, height: 0, borderLeft: "5px solid rgba(255,255,255,0.7)", borderTop: "3px solid transparent", borderBottom: "3px solid transparent", marginLeft: 2 }} />
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "4px 6px 6px", background: "linear-gradient(to top,rgba(0,0,0,0.8),transparent)" }}>
          <div style={{ height: 3, width: 28, borderRadius: 2, background: "rgba(255,255,255,0.8)", marginBottom: 2 }} />
          <div style={{ height: 2, width: 18, borderRadius: 2, background: color, opacity: 0.8 }} />
        </div>
      </div>
    ),
  },
  {
    id: "parallax",
    name: "Parallax",
    desc: "Depth scroll layers",
    pro: true,
    preview: (color, avatarUrl) => (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", background: "#0a0a0a" }}>
        <div style={{ height: "45%", position: "relative", background: `linear-gradient(160deg,${color}33,${color}11)` }}>
          <div style={{ position: "absolute", bottom: 4, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
            <MiniAvatar avatarUrl={avatarUrl} size={24} color={color} border="2px solid rgba(255,255,255,0.3)" />
          </div>
        </div>
        <div style={{ flex: 1, padding: "14px 6px 5px", display: "flex", flexDirection: "column", gap: 3 }}>
          <MiniName isDark />
          <MiniLinkRow color={color} isDark />
        </div>
      </div>
    ),
  },
  {
    id: "ny_championship",
    name: "🏀 NY Champ",
    desc: "NBA Finals Edition",
    pro: true,
    preview: (color, avatarUrl) => (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", background: "linear-gradient(160deg,#020818,#0B2E6B)" }}>
        <div style={{ height: 3, background: "linear-gradient(90deg,#FF7A00,#FDBA21,#FF7A00)" }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "5px 6px" }}>
          <span style={{ fontSize: 10 }}>🏀</span>
          <MiniAvatar avatarUrl={avatarUrl} size={24} color={color} border="2px solid #FF7A00" />
          <div style={{ height: 3, width: 28, borderRadius: 2, background: "rgba(255,255,255,0.7)" }} />
          <div style={{ height: 2, width: 20, borderRadius: 2, background: "#FF7A00", opacity: 0.8 }} />
        </div>
        <div style={{ margin: "0 5px", flex: 1 }}>
          <MiniLinkRow color="#FF7A00" isDark />
        </div>
        <div style={{ margin: "3px 5px 4px", borderRadius: 4, border: "1px solid rgba(255,122,0,0.3)", background: "rgba(255,255,255,0.05)", textAlign: "center", padding: "1px 0" }}>
          <span style={{ fontSize: 7, fontWeight: 900, color: "#FF7A00" }}>CHAMPIONSHIP</span>
        </div>
      </div>
    ),
  },
  {
    id: "lions_teranga",
    name: "🦁 Lions",
    desc: "World Cup Edition",
    pro: true,
    preview: (color, avatarUrl) => (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", background: "linear-gradient(160deg,#020f06,#004d1a)" }}>
        <div style={{ height: 3, display: "flex" }}>
          <div style={{ flex: 1, background: "#00853F" }} />
          <div style={{ flex: 1, background: "#FDEF42" }} />
          <div style={{ flex: 1, background: "#E31B23" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "5px 6px" }}>
          <span style={{ fontSize: 10 }}>⚽</span>
          <MiniAvatar avatarUrl={avatarUrl} size={24} color={color} border="2px solid #D4AF37" />
          <div style={{ height: 3, width: 28, borderRadius: 2, background: "rgba(255,255,255,0.7)" }} />
          <div style={{ height: 2, width: 20, borderRadius: 2, background: "#D4AF37", opacity: 0.8 }} />
        </div>
        <div style={{ margin: "0 5px", flex: 1 }}>
          <MiniLinkRow color="#D4AF37" isDark />
        </div>
        <div style={{ margin: "3px 5px 4px", borderRadius: 4, border: "1px solid rgba(212,175,55,0.3)", background: "rgba(255,255,255,0.05)", textAlign: "center", padding: "1px 0" }}>
          <span style={{ fontSize: 7, fontWeight: 900, color: "#FDEF42" }}>LIONS TERANGA</span>
        </div>
      </div>
    ),
  },
];

export { layouts };

export default function LayoutPicker({ value, onChange, color = "#2563eb", plan = "free", isAdmin = false, profile = null }) {
  const isPro = isAdmin || ["pro", "professional", "business", "salon", "restaurant", "lawfirm", "corporate"].includes(plan);
  // Assign each layout a fixed generic avatar (cycle through samples)
  const avatarMap = Object.fromEntries(layouts.map((l, i) => [l.id, SAMPLE_AVATARS[i % SAMPLE_AVATARS.length]]));
  return (
    <div>
      <div className="grid grid-cols-4 gap-3">
        {layouts.map((layout) => {
          const locked = layout.pro && !isPro;
          const avatarUrl = avatarMap[layout.id];
          return (
            <div key={layout.id} className="relative">
              {locked ? (
                <Link
                  to="/pricing"
                  className="flex flex-col gap-2 p-0 rounded-xl transition-all focus:outline-none hover:ring-2 hover:ring-amber-400 hover:ring-offset-1 block"
                >
                  <div className="w-full aspect-[3/2] rounded-xl overflow-hidden shadow-sm relative">
                    <div className="opacity-40 w-full h-full">{layout.preview(color, avatarUrl)}</div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 rounded-xl">
                      <span className="text-base">🔒</span>
                      <span className="text-[9px] font-black text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full mt-0.5">PRO</span>
                    </div>
                  </div>
                  <div className="text-center pb-1">
                    <p className="text-xs font-bold text-slate-400">{layout.name}</p>
                  </div>
                </Link>
              ) : (
                <button
                  onClick={() => onChange(layout.id)}
                  className={`flex flex-col gap-2 p-0 rounded-xl transition-all focus:outline-none w-full ${
                    value === layout.id ? "ring-2 ring-blue-600 ring-offset-2" : "hover:ring-2 hover:ring-slate-300 hover:ring-offset-1"
                  }`}
                >
                  <div className="w-full aspect-[3/2] rounded-xl overflow-hidden shadow-sm">
                    {layout.preview(color, avatarUrl)}
                  </div>
                  <div className="text-center pb-1">
                    <p className={`text-xs font-bold ${value === layout.id ? "text-blue-600" : "text-slate-700"}`}>
                      {layout.name}
                    </p>
                    <p className="text-[10px] text-slate-400 hidden sm:block">{layout.desc}</p>
                  </div>
                </button>
              )}
            </div>
          );
        })}
      </div>
      {!isPro && (
        <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
          <span className="text-base">✨</span>
          <p className="text-xs text-amber-700 font-semibold flex-1">
            Upgrade to <strong>Pro</strong> to unlock 28+ premium layout styles including NY Championship, Lions of Teranga, Neon, Luxury &amp; more.
          </p>
          <Link to="/pricing" className="text-xs font-black text-amber-600 hover:text-amber-700 whitespace-nowrap">
            Upgrade →
          </Link>
        </div>
      )}
    </div>
  );
}