/**
 * ProfileLayoutShell — applies the chosen layout visual style
 * to the public profile page while keeping all content slots identical.
 * 
 * Props:
 *   profile   — full profile object
 *   color     — resolved cover_color hex
 *   isDark    — whether bg_style === "night"
 *   children  — the content (avatar header + action sections)
 */

import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import NewYorkChampionshipLayout from "@/components/bingoo/layouts/NewYorkChampionshipLayout";
import LionsOfTerangaLayout from "@/components/bingoo/layouts/LionsOfTerangaLayout";

const hexRgb = (hex, alpha = 1) => {
  if (!hex || hex.length < 7) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

export default function ProfileLayoutShell({ profile, color, isDark, children }) {
  const mobile = useIsMobile();
  const layout = profile?.layout || "classic";

  // ── DARK ──
  if (layout === "dark") return (
    <div style={{ minHeight: "100vh", background: "#0f172a", padding: mobile ? 0 : "32px 16px 100px", display: "flex", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
        style={{ width: "100%", maxWidth: mobile ? "100%" : 440 }}>
        <div style={{ background: "#1e293b", borderRadius: mobile ? 0 : 28, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 40px 80px rgba(0,0,0,0.6)" }}>
          <div style={{ height: 8, background: `linear-gradient(90deg, ${color}, ${hexRgb(color, 0.5)})` }} />
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── MINIMAL ──
  if (layout === "minimal") return (
    <div style={{ minHeight: "100vh", background: "#fff", padding: mobile ? "0 0 140px" : "32px 16px 100px", display: "flex", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
        style={{ width: "100%", maxWidth: mobile ? "100%" : 440 }}>
        <div style={{ borderTop: `4px solid ${color}`, background: "#fff", borderRadius: mobile ? 0 : "0 0 24px 24px" }}>
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── BOLD ──
  if (layout === "bold") return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${color} 0%, ${hexRgb(color, 0.75)} 100%)`, padding: mobile ? "0 0 140px" : "32px 16px 100px", display: "flex", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
        style={{ width: "100%", maxWidth: mobile ? "100%" : 440 }}>
        <div style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(20px)", borderRadius: mobile ? 0 : 28, border: "1px solid rgba(255,255,255,0.25)", boxShadow: "0 40px 80px rgba(0,0,0,0.3)" }}>
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── SPLIT ──
  if (layout === "split") return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", padding: mobile ? "0 0 140px" : "32px 16px 100px", display: "flex", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
        style={{ width: "100%", maxWidth: mobile ? "100%" : 440 }}>
        <div style={{ display: "flex", background: "#fff", borderRadius: mobile ? 0 : 24, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0" }}>
          <div style={{ width: 8, flexShrink: 0, background: `linear-gradient(180deg, ${color}, ${hexRgb(color,0.5)})` }} />
          <div style={{ flex: 1 }}>{children}</div>
        </div>
      </motion.div>
    </div>
  );

  // ── NEON ──
  if (layout === "neon") return (
    <div style={{ minHeight: "100vh", background: "#000", padding: mobile ? "0 0 140px" : "32px 16px 100px", display: "flex", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
        style={{ width: "100%", maxWidth: mobile ? "100%" : 440 }}>
        <div style={{ border: `1px solid ${hexRgb(color, 0.6)}`, borderRadius: mobile ? 0 : 28, boxShadow: `0 0 40px ${hexRgb(color, 0.3)}, inset 0 0 40px ${hexRgb(color, 0.05)}`, background: "#0a0a0a" }}>
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── RETRO ──
  if (layout === "retro") return (
    <div style={{ minHeight: "100vh", background: "#fefce8", padding: mobile ? "0 0 140px" : "32px 16px 100px", display: "flex", justifyContent: "center", fontFamily: "monospace" }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
        style={{ width: "100%", maxWidth: mobile ? "100%" : 440 }}>
        <div style={{ border: "4px solid #000", background: "#fff", boxShadow: "6px 6px 0 #000" }}>
          <div style={{ background: "#000", color: "#facc15", textAlign: "center", padding: "10px 16px", fontSize: 11, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase" }}>
            ◆ {profile?.company_name || "BINGOO CONNECT"} ◆
          </div>
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── MAGAZINE ──
  if (layout === "magazine") return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: mobile ? "0 0 140px" : "32px 16px 100px", display: "flex", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
        style={{ width: "100%", maxWidth: mobile ? "100%" : 440 }}>
        <div style={{ background: "#fff", borderRadius: mobile ? 0 : 24, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
          {/* Magazine-style top bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: "3px solid #000", background: "#fff" }}>
            <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: "#64748b" }}>DIGITAL PROFILE</span>
            <div style={{ width: 32, height: 3, background: color }} />
          </div>
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── AURORA ──
  if (layout === "aurora") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)", padding: mobile ? "0 0 140px" : "32px 16px 100px", display: "flex", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
        style={{ width: "100%", maxWidth: mobile ? "100%" : 440 }}>
        {/* Aurora top bar */}
        <div style={{ height: 4, borderRadius: "4px 4px 0 0", background: `linear-gradient(90deg, ${color}, #a855f7, #06b6d4)`, marginBottom: 0 }} />
        <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", borderRadius: mobile ? 0 : "0 0 28px 28px", border: "1px solid rgba(255,255,255,0.1)", borderTop: "none", boxShadow: "0 40px 80px rgba(0,0,0,0.5)" }}>
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── MINIMAL DARK ──
  if (layout === "minimal_dark") return (
    <div style={{ minHeight: "100vh", background: "#18181b", padding: mobile ? "0 0 140px" : "32px 16px 100px", display: "flex", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
        style={{ width: "100%", maxWidth: mobile ? "100%" : 440 }}>
        <div style={{ background: "#09090b", borderRadius: mobile ? 0 : 24, border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 40px 80px rgba(0,0,0,0.6)" }}>
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── PASTEL ──
  if (layout === "pastel") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #fdf2f8 0%, #eff6ff 100%)", padding: mobile ? "0 0 140px" : "32px 16px 100px", display: "flex", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
        style={{ width: "100%", maxWidth: mobile ? "100%" : 440 }}>
        <div style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", borderRadius: mobile ? 0 : 28, boxShadow: "0 20px 60px rgba(219,112,147,0.15)", border: "1px solid rgba(255,192,203,0.3)" }}>
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── CORPORATE ──
  if (layout === "corporate") return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", padding: mobile ? "0 0 140px" : "32px 16px 100px", display: "flex", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
        style={{ width: "100%", maxWidth: mobile ? "100%" : 440 }}>
        <div style={{ background: "#fff", borderRadius: mobile ? 0 : 12, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ height: 6, background: color }} />
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── FLOATING ──
  if (layout === "floating") return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(ellipse at 50% -10%, ${hexRgb(color, 0.18)} 0%, #f1f5f9 60%)`, padding: mobile ? "0 0 140px" : "32px 16px 100px", display: "flex", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
        style={{ width: "100%", maxWidth: mobile ? "100%" : 440 }}>
        <div style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)", borderRadius: mobile ? 0 : 32, boxShadow: `0 40px 80px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.9)` }}>
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── GRADIENT ──
  if (layout === "gradient") return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, ${color} 0%, ${hexRgb(color,0.4)} 40%, #f8fafc 100%)`, padding: mobile ? "0 0 140px" : "32px 16px 100px", display: "flex", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
        style={{ width: "100%", maxWidth: mobile ? "100%" : 440 }}>
        <div style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(16px)", borderRadius: mobile ? 0 : 28, boxShadow: "0 30px 60px rgba(0,0,0,0.15)" }}>
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── SUNSET ──
  if (layout === "sunset") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #ff6b35 0%, #f7931e 30%, #ffcd3c 60%, #c0392b 100%)", padding: mobile ? "0 0 140px" : "32px 16px 100px", display: "flex", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
        style={{ width: "100%", maxWidth: mobile ? "100%" : 440 }}>
        <div style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(20px)", borderRadius: mobile ? 0 : 28, border: "1px solid rgba(255,255,255,0.3)" }}>
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── OCEAN ──
  if (layout === "ocean") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0077b6 0%, #00b4d8 50%, #90e0ef 100%)", padding: mobile ? "0 0 140px" : "32px 16px 100px", display: "flex", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
        style={{ width: "100%", maxWidth: mobile ? "100%" : 440 }}>
        <div style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(20px)", borderRadius: mobile ? 0 : 28, border: "1px solid rgba(255,255,255,0.3)" }}>
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── FOREST ──
  if (layout === "forest") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #134e4a 0%, #065f46 40%, #022c22 100%)", padding: mobile ? "0 0 140px" : "32px 16px 100px", display: "flex", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
        style={{ width: "100%", maxWidth: mobile ? "100%" : 440 }}>
        <div style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(20px)", borderRadius: mobile ? 0 : 28, border: "1px solid rgba(255,255,255,0.15)" }}>
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── LUXURY ──
  if (layout === "luxury") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0a0a0a 0%, #1c1c1c 100%)", padding: mobile ? "0 0 140px" : "32px 16px 100px", display: "flex", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
        style={{ width: "100%", maxWidth: mobile ? "100%" : 440 }}>
        <div style={{ background: "#111", borderRadius: mobile ? 0 : 24, border: `1px solid ${hexRgb(color,0.5)}`, boxShadow: `0 0 60px ${hexRgb(color,0.2)}, inset 0 0 40px rgba(0,0,0,0.5)` }}>
          <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── BUBBLY ──
  if (layout === "bubbly") return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${hexRgb(color,0.15)} 0%, #fff0f6 50%, ${hexRgb(color,0.08)} 100%)`, padding: mobile ? "0 0 140px" : "32px 16px 100px", display: "flex", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
        style={{ width: "100%", maxWidth: mobile ? "100%" : 440 }}>
        <div style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)", borderRadius: mobile ? 0 : 40, boxShadow: `0 20px 60px ${hexRgb(color,0.2)}`, border: `1px solid ${hexRgb(color,0.15)}` }}>
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── MONOCHROME ──
  if (layout === "monochrome") return (
    <div style={{ minHeight: "100vh", background: "#fafafa", padding: mobile ? "0 0 140px" : "32px 16px 100px", display: "flex", justifyContent: "center", filter: "grayscale(1)" }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
        style={{ width: "100%", maxWidth: mobile ? "100%" : 440 }}>
        <div style={{ background: "#fff", borderRadius: mobile ? 0 : 16, border: "2px solid #000", boxShadow: "4px 4px 0 #000" }}>
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── CYBERPUNK ──
  if (layout === "cyberpunk") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0d0221 0%, #190341 50%, #0d0221 100%)", padding: mobile ? "0 0 140px" : "32px 16px 100px", display: "flex", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
        style={{ width: "100%", maxWidth: mobile ? "100%" : 440 }}>
        <div style={{ background: "rgba(13,2,33,0.9)", borderRadius: mobile ? 0 : 4, border: `1px solid ${color}`, boxShadow: `0 0 30px ${hexRgb(color,0.4)}, 0 0 80px ${hexRgb(color,0.1)}, inset 0 0 20px rgba(0,0,0,0.5)` }}>
          <div style={{ height: 2, background: color, boxShadow: `0 0 10px ${color}` }} />
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── FROSTED ──
  if (layout === "frosted") return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${hexRgb(color,0.3)} 0%, rgba(200,220,255,0.4) 100%)`, backdropFilter: "blur(40px)", padding: mobile ? "0 0 140px" : "32px 16px 100px", display: "flex", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
        style={{ width: "100%", maxWidth: mobile ? "100%" : 440 }}>
        <div style={{ background: "rgba(255,255,255,0.3)", backdropFilter: "blur(40px)", borderRadius: mobile ? 0 : 28, border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── PAPER ──
  if (layout === "paper") return (
    <div style={{ minHeight: "100vh", background: "#f5f0e8", padding: mobile ? "0 0 140px" : "32px 16px 100px", display: "flex", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
        style={{ width: "100%", maxWidth: mobile ? "100%" : 440 }}>
        <div style={{ background: "#faf8f4", borderRadius: mobile ? 0 : 4, boxShadow: "0 2px 4px rgba(0,0,0,0.1), 0 8px 24px rgba(0,0,0,0.08)", border: "1px solid #e8e0d0" }}>
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── WAVE ──
  if (layout === "wave") return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(180deg, ${color} 0%, ${hexRgb(color,0.3)} 40%, #f8fafc 100%)`, padding: mobile ? "0 0 140px" : "32px 16px 100px", display: "flex", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
        style={{ width: "100%", maxWidth: mobile ? "100%" : 440 }}>
        <div style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(16px)", borderRadius: mobile ? 0 : "0 0 28px 28px", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── GLASSMORPHIC ──
  if (layout === "glassmorphic") return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${hexRgb(color,0.6)} 0%, ${hexRgb(color,0.3)} 100%)`, padding: mobile ? "0 0 140px" : "32px 16px 100px", display: "flex", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
        style={{ width: "100%", maxWidth: mobile ? "100%" : 440 }}>
        <div style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(30px)", borderRadius: mobile ? 0 : 28, border: "1px solid rgba(255,255,255,0.4)", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── CARD ──
  if (layout === "card") return (
    <div style={{ minHeight: "100vh", background: "#e2e8f0", padding: mobile ? "0 0 140px" : "32px 16px 100px", display: "flex", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
        style={{ width: "100%", maxWidth: mobile ? "100%" : 440 }}>
        <div style={{ background: "#fff", borderRadius: mobile ? 0 : 20, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", border: "1px solid rgba(0,0,0,0.05)" }}>
          <div style={{ height: 5, background: `linear-gradient(90deg, ${color}, ${hexRgb(color,0.6)})`, borderRadius: "20px 20px 0 0" }} />
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── GLASS 3D ──
  if (layout === "glass_3d") return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${hexRgb(color, 0.12)} 0%, #e0e7ff 50%, #f8fafc 100%)`, padding: mobile ? "0 0 140px" : "32px 16px 100px", display: "flex", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }} style={{ width: "100%", maxWidth: mobile ? "100%" : 440 }}>
        <div style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(20px)", borderRadius: mobile ? 0 : 28, boxShadow: "0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.8)" }}>
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── LUXURY GOLD ──
  if (layout === "luxury_gold") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #1a0a00, #2d1a00, #1a0a00)", padding: mobile ? "0 0 140px" : "32px 16px 100px", display: "flex", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }} style={{ width: "100%", maxWidth: mobile ? "100%" : 440 }}>
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #D4AF37, #FFD700, #D4AF37, transparent)", marginBottom: 0 }} />
        <div style={{ background: "rgba(26,10,0,0.95)", borderRadius: mobile ? 0 : 24, border: "1px solid rgba(212,175,55,0.3)", boxShadow: "0 40px 80px rgba(0,0,0,0.8)" }}>
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── EXECUTIVE CORP ──
  if (layout === "executive_corp") return (
    <div style={{ minHeight: "100vh", background: "#060b14", padding: mobile ? "0 0 140px" : "32px 16px 100px", display: "flex", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }} style={{ width: "100%", maxWidth: mobile ? "100%" : 440 }}>
        <div style={{ background: "#0d1117", borderRadius: mobile ? 0 : 12, border: `1px solid ${hexRgb(color, 0.25)}`, boxShadow: "0 40px 80px rgba(0,0,0,0.6)", overflow: "hidden" }}>
          <div style={{ height: 3, background: `linear-gradient(90deg, ${color}, ${hexRgb(color, 0.4)}, transparent)` }} />
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── NEON TECH ──
  if (layout === "neon_tech") return (
    <div style={{ minHeight: "100vh", background: "#050510", padding: mobile ? "0 0 140px" : "32px 16px 100px", display: "flex", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }} style={{ width: "100%", maxWidth: mobile ? "100%" : 440 }}>
        <div style={{ background: "rgba(5,5,16,0.98)", borderRadius: mobile ? 0 : 8, border: `1px solid ${hexRgb(color, 0.35)}`, boxShadow: `0 0 40px ${hexRgb(color, 0.2)}, 0 40px 80px rgba(0,0,0,0.8)` }}>
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── MODERN LAW ──
  if (layout === "modern_law") return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", padding: mobile ? "0 0 140px" : "32px 16px 100px", display: "flex", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }} style={{ width: "100%", maxWidth: mobile ? "100%" : 440 }}>
        <div style={{ background: "#fff", borderRadius: mobile ? 0 : 0, boxShadow: "0 4px 40px rgba(0,0,0,0.12)", overflow: "hidden", borderLeft: `4px solid ${color}` }}>
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── PREMIUM SALON ──
  if (layout === "premium_salon") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #1a0a14, #2d1020, #1a0a14)", padding: mobile ? "0 0 140px" : "32px 16px 100px", display: "flex", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }} style={{ width: "100%", maxWidth: mobile ? "100%" : 440 }}>
        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, #f9a8d4, ${color}, #f9a8d4, transparent)` }} />
        <div style={{ background: "rgba(26,10,20,0.96)", borderRadius: mobile ? 0 : 24, border: `1px solid ${hexRgb(color, 0.25)}`, boxShadow: "0 40px 80px rgba(0,0,0,0.8)" }}>
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── REALTOR LUXURY ──
  if (layout === "realtor_luxury") return (
    <div style={{ minHeight: "100vh", background: "#fff", padding: mobile ? "0 0 140px" : "32px 16px 100px", display: "flex", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }} style={{ width: "100%", maxWidth: mobile ? "100%" : 440 }}>
        <div style={{ background: "#fff", borderRadius: mobile ? 0 : 16, boxShadow: "0 20px 60px rgba(0,0,0,0.12)", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── ANIMATED GRADIENT ──
  if (layout === "animated_gradient") return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${color}, #a855f7, #06b6d4, ${color})`, backgroundSize: "300% 300%", animation: "gradientShift 6s ease infinite", padding: mobile ? "0 0 140px" : "32px 16px 100px", display: "flex", justifyContent: "center" }}>
      <style>{`@keyframes gradientShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }`}</style>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }} style={{ width: "100%", maxWidth: mobile ? "100%" : 440 }}>
        <div style={{ background: "rgba(0,0,0,0.15)", backdropFilter: "blur(12px)", borderRadius: mobile ? 0 : 28, border: "1px solid rgba(255,255,255,0.2)" }}>
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── VIDEO BG ──
  if (layout === "video_bg") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f0f0f, #1a1a2e)", padding: mobile ? "0 0 140px" : "32px 16px 100px", display: "flex", justifyContent: "center", position: "relative" }}>
      <div style={{ position: "fixed", inset: 0, opacity: 0.06, backgroundImage: "linear-gradient(45deg,#333 25%,transparent 25%),linear-gradient(-45deg,#333 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#333 75%),linear-gradient(-45deg,transparent 75%,#333 75%)", backgroundSize: "8px 8px", pointerEvents: "none", zIndex: 0 }} />
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }} style={{ width: "100%", maxWidth: mobile ? "100%" : 440, position: "relative", zIndex: 1 }}>
        <div style={{ background: "rgba(15,15,15,0.9)", backdropFilter: "blur(20px)", borderRadius: mobile ? 0 : 16, border: "1px solid rgba(255,255,255,0.08)" }}>
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── PARALLAX ──
  if (layout === "parallax") return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", padding: mobile ? "0 0 140px" : "32px 16px 100px", display: "flex", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }} style={{ width: "100%", maxWidth: mobile ? "100%" : 440 }}>
        <div style={{ background: "#0a0a0a", borderRadius: mobile ? 0 : 16, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
          {children}
        </div>
      </motion.div>
    </div>
  );

  // ── NEW YORK CHAMPIONSHIP ──
  if (layout === "ny_championship") return (
    <NewYorkChampionshipLayout profile={profile} color={color}>{children}</NewYorkChampionshipLayout>
  );

  // ── LIONS OF TERANGA ──
  if (layout === "lions_teranga") return (
    <LionsOfTerangaLayout profile={profile} color={color}>{children}</LionsOfTerangaLayout>
  );

  // ── CLASSIC (default) ──
  return (
    <div style={{ minHeight: "100vh", background: isDark ? "linear-gradient(160deg,#080a18 0%,#0d1022 100%)" : `linear-gradient(160deg, ${hexRgb(color,0.05)} 0%, #f8fafc 100%)`, padding: mobile ? "0 0 140px" : "32px 16px 100px", display: "flex", justifyContent: "center", position: "relative", overflowX: "hidden" }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
        style={{ width: "100%", maxWidth: mobile ? "100%" : 440, position: "relative", zIndex: 1 }}>
        <div style={{
          background: isDark ? "rgba(10,12,28,0.95)" : "rgba(255,255,255,0.97)",
          backdropFilter: "blur(24px)",
          border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(255,255,255,0.9)",
          borderRadius: mobile ? 0 : 28,
          boxShadow: isDark ? "0 40px 80px rgba(0,0,0,0.6)" : "0 32px 80px rgba(0,0,0,0.1)",
        }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}