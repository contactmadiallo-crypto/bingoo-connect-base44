/**
 * Lions of Teranga Edition — Senegal World Cup inspired premium layout
 * Deep green luxury background, gold/red accents, Senegal flag colors, lion & football motifs
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

// Football SVG (soccer ball)
function FootballSVG({ size = 80, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
      <defs>
        <radialGradient id="football-grad" cx="35%" cy="35%">
          <stop offset="0%" stopColor="#f8f8f8" />
          <stop offset="70%" stopColor="#d0d0d0" />
          <stop offset="100%" stopColor="#999" />
        </radialGradient>
        <filter id="football-glow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <circle cx="50" cy="50" r="47" fill="url(#football-grad)" filter="url(#football-glow)" />
      {/* Pentagon patches */}
      {[
        { cx: 50, cy: 50 },
        { cx: 50, cy: 22 },
        { cx: 72, cy: 35 },
        { cx: 64, cy: 65 },
        { cx: 36, cy: 65 },
        { cx: 28, cy: 35 },
      ].map((p, i) => (
        <polygon key={i} points={`${p.cx},${p.cy-8} ${p.cx+7.6},${p.cy-2.5} ${p.cx+4.7},${p.cy+6.5} ${p.cx-4.7},${p.cy+6.5} ${p.cx-7.6},${p.cy-2.5}`}
          fill={i === 0 ? "#333" : i % 2 === 0 ? "#222" : "#444"} opacity="0.85" />
      ))}
      {/* shine */}
      <ellipse cx="36" cy="30" rx="9" ry="5" fill="rgba(255,255,255,0.35)" />
    </svg>
  );
}

// Senegal flag colors component
function SenegalFlag({ style = {} }) {
  return (
    <div style={{ display: "flex", width: 44, height: 30, borderRadius: 4, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.4)", ...style }}>
      <div style={{ flex: 1, background: "#00853F" }} />
      <div style={{ flex: 1, background: "#FDEF42", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 12 }}>⭐</span>
      </div>
      <div style={{ flex: 1, background: "#E31B23" }} />
    </div>
  );
}

// Lion illustration (CSS-based)
function LionSilhouette({ style = {} }) {
  return (
    <div style={{ position: "relative", ...style }}>
      <div style={{ fontSize: 70, lineHeight: 1, filter: "drop-shadow(0 0 20px rgba(212,175,55,0.6))", userSelect: "none" }}>🦁</div>
    </div>
  );
}

// Stadium light beams
function StadiumLights() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {[
        { top: 0, left: "20%", rotate: "15deg" },
        { top: 0, left: "50%", rotate: "0deg" },
        { top: 0, left: "78%", rotate: "-15deg" },
      ].map((b, i) => (
        <div key={i} style={{
          position: "absolute", top: b.top, left: b.left,
          width: 180, height: "100%",
          background: "linear-gradient(to bottom, rgba(255,215,0,0.08), transparent)",
          transform: `rotate(${b.rotate}) translateX(-50%)`,
          transformOrigin: "top center",
        }} />
      ))}
    </div>
  );
}

// Gold particle confetti
function GoldParticles() {
  const pts = Array.from({ length: 16 }, (_, i) => ({
    id: i, x: 5 + Math.random() * 90, delay: Math.random() * 4,
    dur: 3 + Math.random() * 3, size: 3 + Math.random() * 5,
    color: i % 3 === 0 ? "#FDEF42" : i % 3 === 1 ? "#E31B23" : "#00853F",
  }));
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {pts.map(p => (
        <motion.div key={p.id}
          style={{ position: "absolute", top: "-5%", left: `${p.x}%`, width: p.size, height: p.size, borderRadius: "50%", background: p.color, opacity: 0 }}
          animate={{ y: ["0vh", "110vh"], opacity: [0, 0.8, 0.6, 0], rotate: [0, 360] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: "linear" }}
        />
      ))}
    </div>
  );
}

export default function LionsOfTerangaLayout({ profile, color, children }) {
  const mobile = useIsMobile();

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #020f06 0%, #012c0e 40%, #004d1a 70%, #013a0e 100%)",
      padding: mobile ? "0 0 140px" : "32px 16px 100px",
      display: "flex", justifyContent: "center",
      position: "relative", overflowX: "hidden",
    }}>
      {/* Gold ambient glow */}
      <div style={{ position: "fixed", top: "15%", right: "10%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,175,55,0.1), transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", top: "60%", left: "5%", width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(227,27,35,0.08), transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <GoldParticles />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: "100%", maxWidth: mobile ? "100%" : 440, position: "relative", zIndex: 1 }}
      >
        {/* Top badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, gap: 10 }}>
          <SenegalFlag />
          <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: "#FDEF42", textShadow: "0 0 12px rgba(253,239,66,0.5)" }}>WORLD CUP EDITION</span>
          <span style={{ fontSize: 14 }}>🏆</span>
        </div>

        {/* Main card */}
        <div style={{
          background: "linear-gradient(160deg, rgba(0,77,26,0.96) 0%, rgba(1,44,14,0.98) 100%)",
          borderRadius: mobile ? 0 : 28,
          border: "1px solid rgba(212,175,55,0.35)",
          boxShadow: "0 0 60px rgba(212,175,55,0.12), 0 40px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
          overflow: "hidden",
          position: "relative",
        }}>

          {/* Gold top bar with Senegal flag colors */}
          <div style={{ height: 5, background: "linear-gradient(90deg, #00853F 0%, #00853F 33%, #FDEF42 33%, #FDEF42 66%, #E31B23 66%, #E31B23 100%)", boxShadow: "0 0 15px rgba(212,175,55,0.5)" }} />

          {/* Hero section */}
          <div style={{ position: "relative", height: 220, overflow: "hidden" }}>
            {/* User's cover photo — shown behind the graphics */}
            {profile.cover_photo && (
              <img src={profile.cover_photo} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: profile.cover_position || "center", opacity: 0.28 }} />
            )}
            <StadiumLights />

            {/* Flag colors background stripes (subtle) */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,133,63,0.08) 0%, transparent 40%, rgba(227,27,35,0.06) 100%)" }} />

            {/* Lion on right */}
            <div style={{ position: "absolute", bottom: 10, right: -8, opacity: 0.6 }}>
              <LionSilhouette />
            </div>

            {/* Flag large background (very subtle) */}
            <div style={{ position: "absolute", top: 10, left: 16 }}>
              <SenegalFlag style={{ width: 56, height: 38 }} />
            </div>

            {/* Trophy */}
            <div style={{ position: "absolute", bottom: 55, right: 24, fontSize: 28, filter: "drop-shadow(0 0 10px rgba(253,239,66,0.8))", opacity: 0.85 }}>
              🏆
            </div>

            {/* Floating football */}
            <motion.div
              animate={{ y: [0, -18, 0], rotate: [0, -12, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ position: "absolute", top: 15, left: "50%", transform: "translateX(-50%)", filter: "drop-shadow(0 0 18px rgba(212,175,55,0.5))" }}
            >
              <FootballSVG size={68} />
            </motion.div>

            {/* Pro badge */}
            <div style={{ position: "absolute", top: 14, right: 16 }}>
              <motion.div
                animate={{ boxShadow: ["0 0 8px rgba(212,175,55,0.4)", "0 0 20px rgba(212,175,55,0.9)", "0 0 8px rgba(212,175,55,0.4)"] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ padding: "4px 10px", borderRadius: 999, background: "linear-gradient(135deg, #D4AF37, #FDEF42)", fontSize: 9, fontWeight: 900, color: "#003300", letterSpacing: "0.1em" }}
              >
                ✦ VERIFIED PRO
              </motion.div>
            </div>
          </div>

          {/* Profile photo + name */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: -30, position: "relative", zIndex: 5, padding: "0 20px" }}>
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div style={{
                padding: 4,
                background: "linear-gradient(135deg, #D4AF37, #00853F, #E31B23)",
                borderRadius: "50%",
                boxShadow: "0 0 0 4px rgba(1,44,14,0.95), 0 0 30px rgba(212,175,55,0.5), 0 16px 40px rgba(0,0,0,0.5)",
              }}>
                {profile.profile_photo
                  ? <img src={profile.profile_photo} alt={profile.display_name} style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", display: "block" }} />
                  : <div style={{ width: 100, height: 100, borderRadius: "50%", background: "linear-gradient(135deg, #00853F, #D4AF37)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 40 }}>
                      {profile.display_name?.charAt(0) || "?"}
                    </div>
                }
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{ margin: "14px 0 0", fontSize: 26, fontWeight: 950, color: "#fff", textAlign: "center", letterSpacing: "-0.5px", textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}
            >
              {profile.display_name} <span style={{ color: "#00853F" }}>✓</span>
            </motion.h1>

            {profile.job_title && (
              <p style={{ margin: "5px 0 0", fontSize: 14, fontWeight: 700, color: "#D4AF37", textAlign: "center", letterSpacing: "0.02em" }}>
                {profile.job_title}
              </p>
            )}

            <motion.p
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ margin: "8px 0 0", fontSize: 13, fontStyle: "italic", fontWeight: 700, color: "#FDEF42", textAlign: "center", textShadow: "0 0 12px rgba(253,239,66,0.4)" }}
            >
              One People. One Goal. One Victory.
            </motion.p>
          </div>

          {/* Content */}
          <div style={{ padding: mobile ? "20px 16px 32px" : "20px 24px 40px", position: "relative" }}>
            {children}
          </div>

          {/* Footer banner */}
          <div style={{
            background: "linear-gradient(90deg, rgba(0,77,26,0.9), rgba(212,175,55,0.15), rgba(0,77,26,0.9))",
            borderTop: "1px solid rgba(212,175,55,0.3)",
            padding: "12px 20px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 20 }}>🏆</span>
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 900, color: "#FDEF42", letterSpacing: "0.15em", textTransform: "uppercase" }}>LIONS DE LA TERANGA</p>
              <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.5)" }}>Un Peuple, Un But, Une Victoire ⭐</p>
            </div>
            <span style={{ fontSize: 20 }}>🦁</span>
          </div>
        </div>

        {/* Bottom badges */}
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
          {["Premium 3D Design", "Floating Animations", "Exclusive to Paid Plans"].map(t => (
            <span key={t} style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{t}</span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}