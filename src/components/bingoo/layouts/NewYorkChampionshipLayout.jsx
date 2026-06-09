/**
 * New York Championship Edition — NBA Finals inspired premium layout
 * Deep blue luxury background, orange fire accents, NY skyline, basketball motifs
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

const hexRgb = (hex, alpha = 1) => {
  if (!hex || hex.length < 7) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

// Floating basketball SVG
function BasketballSVG({ size = 80, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
      <defs>
        <radialGradient id="bball-ny" cx="35%" cy="35%">
          <stop offset="0%" stopColor="#ff9a3c" />
          <stop offset="60%" stopColor="#e85d04" />
          <stop offset="100%" stopColor="#9d2b00" />
        </radialGradient>
        <filter id="bball-glow-ny">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <circle cx="50" cy="50" r="47" fill="url(#bball-ny)" filter="url(#bball-glow-ny)" />
      {/* seams */}
      <path d="M50 3 Q80 50 50 97" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="2.5" />
      <path d="M50 3 Q20 50 50 97" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="2.5" />
      <path d="M3 50 Q50 20 97 50" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="2.5" />
      <path d="M3 50 Q50 80 97 50" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="2.5" />
      {/* shine */}
      <ellipse cx="36" cy="30" rx="10" ry="6" fill="rgba(255,255,255,0.25)" />
    </svg>
  );
}

// Basketball hoop SVG
function HoopSVG({ style = {} }) {
  return (
    <svg width="140" height="80" viewBox="0 0 140 80" style={style}>
      <defs>
        <filter id="hoop-glow">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Backboard */}
      <rect x="100" y="2" width="36" height="26" rx="3" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      <rect x="107" y="9" width="22" height="16" rx="2" fill="none" stroke="rgba(255,122,0,0.6)" strokeWidth="1.5" />
      {/* Pole */}
      <rect x="116" y="28" width="4" height="52" fill="rgba(255,255,255,0.2)" />
      {/* Arm */}
      <rect x="72" y="28" width="46" height="4" rx="2" fill="rgba(255,255,255,0.2)" />
      {/* Rim */}
      <ellipse cx="72" cy="38" rx="26" ry="7" fill="none" stroke="#FF7A00" strokeWidth="4" filter="url(#hoop-glow)" />
      {/* Net lines */}
      {[0,1,2,3,4,5,6].map(i => (
        <line key={i} x1={48 + i*7} y1={44} x2={50 + i*5.5} y2={72} stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
      ))}
      {[45,53,61,69].map((y, i) => (
        <path key={i} d={`M ${48 + (y-45)*0.5} ${y} Q 72 ${y+4} ${94-(y-45)*0.5} ${y}`} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
      ))}
    </svg>
  );
}

// NY Skyline silhouette
function NYSkyline({ style = {} }) {
  return (
    <svg viewBox="0 0 400 80" preserveAspectRatio="xMidYMax meet" style={{ width: "100%", height: 60, display: "block", ...style }}>
      <path d="M0 80 L0 55 L10 55 L10 45 L15 45 L15 30 L18 30 L18 25 L21 25 L21 30 L24 30 L24 20 L27 20 L27 15 L28 15 L28 10 L29 10 L29 15 L30 15 L30 20 L33 20 L33 30 L36 30 L36 25 L40 25 L40 55 L45 55 L45 40 L50 40 L50 30 L53 30 L53 25 L58 25 L58 30 L61 30 L61 55 L70 55 L70 35 L75 35 L75 20 L78 20 L78 8 L79 8 L79 4 L80 4 L80 8 L81 8 L81 20 L84 20 L84 35 L89 35 L89 55 L100 55 L100 45 L105 45 L105 38 L110 38 L110 32 L113 32 L113 28 L118 28 L118 32 L121 32 L121 38 L126 38 L126 55 L140 55 L140 42 L145 42 L145 35 L148 35 L148 20 L151 20 L151 14 L153 14 L153 9 L155 9 L155 14 L157 14 L157 20 L160 20 L160 35 L163 35 L163 55 L175 55 L175 40 L180 40 L180 32 L185 32 L185 40 L190 40 L190 55 L200 55 L200 38 L205 38 L205 28 L208 28 L208 22 L212 22 L212 17 L213 17 L213 12 L214 12 L214 17 L215 17 L215 22 L219 22 L219 28 L222 28 L222 55 L235 55 L235 44 L240 44 L240 36 L245 36 L245 44 L250 44 L250 55 L260 55 L260 42 L265 42 L265 30 L268 30 L268 22 L272 22 L272 30 L275 30 L275 55 L290 55 L290 48 L295 48 L295 40 L300 40 L300 48 L305 48 L305 55 L320 55 L320 42 L325 42 L325 35 L328 35 L328 22 L330 22 L330 16 L331 16 L331 10 L332 10 L332 16 L333 16 L333 22 L335 22 L335 35 L338 35 L338 55 L355 55 L355 44 L362 44 L362 35 L366 35 L366 44 L370 44 L370 55 L385 55 L385 48 L390 48 L390 55 L400 55 L400 80 Z" fill="rgba(255,122,0,0.12)" />
      <path d="M0 80 L0 55 L10 55 L10 45 L15 45 L15 30 L18 30 L18 25 L21 25 L21 30 L24 30 L24 20 L27 20 L27 15 L28 15 L28 10 L29 10 L29 15 L30 15 L30 20 L33 20 L33 30 L36 30 L36 25 L40 25 L40 55 L45 55 L45 40 L50 40 L50 30 L53 30 L53 25 L58 25 L58 30 L61 30 L61 55 L70 55 L70 35 L75 35 L75 20 L78 20 L78 8 L79 8 L79 4 L80 4 L80 8 L81 8 L81 20 L84 20 L84 35 L89 35 L89 55 L100 55 L100 45 L105 45 L105 38 L110 38 L110 32 L113 32 L113 28 L118 28 L118 32 L121 32 L121 38 L126 38 L126 55 L140 55 L140 42 L145 42 L145 35 L148 35 L148 20 L151 20 L151 14 L153 14 L153 9 L155 9 L155 14 L157 14 L157 20 L160 20 L160 35 L163 35 L163 55 L175 55 L175 40 L180 40 L180 32 L185 32 L185 40 L190 40 L190 55 L200 55 L200 38 L205 38 L205 28 L208 28 L208 22 L212 22 L212 17 L213 17 L213 12 L214 12 L214 17 L215 17 L215 22 L219 22 L219 28 L222 28 L222 55 L235 55 L235 44 L240 44 L240 36 L245 36 L245 44 L250 44 L250 55 L260 55 L260 42 L265 42 L265 30 L268 30 L268 22 L272 22 L272 30 L275 30 L275 55 L290 55 L290 48 L295 48 L295 40 L300 40 L300 48 L305 48 L305 55 L320 55 L320 42 L325 42 L325 35 L328 35 L328 22 L330 22 L330 16 L331 16 L331 10 L332 10 L332 16 L333 16 L333 22 L335 22 L335 35 L338 35 L338 55 L355 55 L355 44 L362 44 L362 35 L366 35 L366 44 L370 44 L370 55 L385 55 L385 48 L390 48 L390 55 L400 55 L400 80 Z" fill="none" stroke="rgba(255,122,0,0.25)" strokeWidth="0.5" />
    </svg>
  );
}

// Animated fire particles
function FireParticles() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i, x: 20 + Math.random() * 60, delay: Math.random() * 2, dur: 1.5 + Math.random() * 1.5, size: 4 + Math.random() * 8,
  }));
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {particles.map(p => (
        <motion.div key={p.id}
          style={{ position: "absolute", bottom: 0, left: `${p.x}%`, width: p.size, height: p.size, borderRadius: "50%", background: `radial-gradient(circle, #ffcd3c, #ff7a00, transparent)`, opacity: 0 }}
          animate={{ y: [-10, -80, -120], opacity: [0, 0.8, 0], scale: [0.5, 1, 0.3] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

// Spotlight beams
function SpotlightBeams() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {[
        { left: "10%", rotate: "20deg", opacity: 0.06 },
        { left: "50%", rotate: "0deg", opacity: 0.1 },
        { left: "80%", rotate: "-20deg", opacity: 0.06 },
      ].map((b, i) => (
        <div key={i} style={{ position: "absolute", top: 0, left: b.left, width: "200px", height: "100%", background: "linear-gradient(to bottom, rgba(255,255,255,0.15), transparent)", transform: `rotate(${b.rotate}) translateX(-50%)`, opacity: b.opacity, transformOrigin: "top center" }} />
      ))}
    </div>
  );
}

export default function NewYorkChampionshipLayout({ profile, color, children }) {
  const mobile = useIsMobile();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 50);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #020818 0%, #051530 40%, #0B2E6B 75%, #0d1a3a 100%)",
      padding: mobile ? "0 0 140px" : "32px 16px 100px",
      display: "flex", justifyContent: "center",
      position: "relative", overflowX: "hidden",
    }}>
      {/* Background spotlight beams */}
      <SpotlightBeams />

      {/* Ambient orange glow orbs */}
      <div style={{ position: "fixed", top: "20%", left: "10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,122,0,0.12), transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", top: "60%", right: "5%", width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(253,186,33,0.08), transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: "100%", maxWidth: mobile ? "100%" : 440, position: "relative", zIndex: 1 }}
      >
        {/* Top badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, gap: 8 }}>
          <span style={{ fontSize: 16 }}>🏀</span>
          <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: "#FF7A00", textShadow: "0 0 12px rgba(255,122,0,0.6)" }}>NBA FINALS EDITION</span>
          <span style={{ fontSize: 16 }}>🏀</span>
        </div>

        {/* Main card */}
        <div style={{
          background: "linear-gradient(160deg, rgba(11,46,107,0.95) 0%, rgba(5,21,60,0.98) 100%)",
          borderRadius: mobile ? 0 : 28,
          border: "1px solid rgba(255,122,0,0.3)",
          boxShadow: "0 0 60px rgba(255,122,0,0.15), 0 40px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)",
          overflow: "hidden",
          position: "relative",
        }}>

          {/* Orange top accent bar */}
          <div style={{ height: 4, background: "linear-gradient(90deg, #FF7A00, #FDBA21, #FF7A00)", boxShadow: "0 0 20px rgba(255,122,0,0.8)" }} />

          {/* Hero section with hoop, ball, skyline */}
          <div style={{ position: "relative", height: 220, overflow: "hidden" }}>
            {/* Skyline at bottom */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
              <NYSkyline />
            </div>

            {/* Arena spotlight from top */}
            <div style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)", width: 200, height: 300, background: "radial-gradient(ellipse at top, rgba(255,255,255,0.08), transparent 70%)", pointerEvents: "none" }} />

            {/* Hoop on the right */}
            <div style={{ position: "absolute", top: 20, right: 10 }}>
              <HoopSVG />
            </div>

            {/* Fire at bottom center */}
            <div style={{ position: "absolute", bottom: 40, left: "35%", width: "30%", height: 60 }}>
              <FireParticles />
            </div>

            {/* Floating basketball */}
            <motion.div
              animate={{ y: [0, -18, 0], rotate: [0, 15, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ position: "absolute", top: 15, left: "50%", transform: "translateX(-50%)", filter: "drop-shadow(0 0 20px rgba(255,122,0,0.6))" }}
            >
              <BasketballSVG size={70} />
            </motion.div>

            {/* NY Knicks inspired badge top-left */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #0B2E6B, #FF7A00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: "0 4px 16px rgba(255,122,0,0.4)", border: "1px solid rgba(255,255,255,0.2)" }}>
                🗽
              </div>
              <span style={{ fontSize: 8, fontWeight: 900, color: "#FF7A00", letterSpacing: "0.1em", marginTop: 3, textTransform: "uppercase" }}>NEW YORK</span>
            </div>

            {/* Gold trophy top-right overlay */}
            <div style={{ position: "absolute", bottom: 55, right: 18, fontSize: 28, filter: "drop-shadow(0 0 10px rgba(253,186,33,0.8))" }}>
              🏆
            </div>

            {/* Verified badge */}
            <div style={{ position: "absolute", top: 14, right: 16 }}>
              <motion.div
                animate={{ boxShadow: ["0 0 8px rgba(255,122,0,0.4)", "0 0 20px rgba(255,122,0,0.8)", "0 0 8px rgba(255,122,0,0.4)"] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ padding: "4px 10px", borderRadius: 999, background: "linear-gradient(135deg, #FDBA21, #FF7A00)", fontSize: 9, fontWeight: 900, color: "#fff", letterSpacing: "0.1em" }}
              >
                ✦ VERIFIED PRO
              </motion.div>
            </div>
          </div>

          {/* Profile photo + name section */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: -30, position: "relative", zIndex: 5, padding: "0 20px" }}>
            {/* Avatar with fire ring */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div style={{
                padding: 4,
                background: "linear-gradient(135deg, #FF7A00, #FDBA21, #FF7A00)",
                borderRadius: "50%",
                boxShadow: "0 0 0 4px rgba(11,46,107,0.95), 0 0 30px rgba(255,122,0,0.5), 0 16px 40px rgba(0,0,0,0.5)",
              }}>
                {profile.profile_photo
                  ? <img src={profile.profile_photo} alt={profile.display_name} style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", display: "block" }} />
                  : <div style={{ width: 100, height: 100, borderRadius: "50%", background: "linear-gradient(135deg, #0B2E6B, #FF7A00)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 40 }}>
                      {profile.display_name?.charAt(0) || "?"}
                    </div>
                }
              </div>
            </motion.div>

            {/* Name */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{ margin: "14px 0 0", fontSize: 26, fontWeight: 950, color: "#fff", textAlign: "center", letterSpacing: "-0.5px", textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}
            >
              {profile.display_name} <span style={{ color: "#FF7A00" }}>✓</span>
            </motion.h1>

            {/* Job title */}
            {profile.job_title && (
              <p style={{ margin: "5px 0 0", fontSize: 14, fontWeight: 700, color: "#FF7A00", textAlign: "center", letterSpacing: "0.02em" }}>
                {profile.job_title}
              </p>
            )}

            {/* Championship tagline */}
            <motion.p
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ margin: "8px 0 0", fontSize: 13, fontStyle: "italic", fontWeight: 700, color: "#FDBA21", textAlign: "center", textShadow: "0 0 12px rgba(253,186,33,0.5)" }}
            >
              New York. Heart. Hustle. Champion.
            </motion.p>
          </div>

          {/* Content area */}
          <div style={{
            padding: mobile ? "20px 16px 32px" : "20px 24px 40px",
            position: "relative",
          }}>
            {/* Action buttons */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20, justifyContent: "center" }}>
              {[
                { icon: "📞", label: "Call", action: () => window.location.href = `tel:${profile.phone}` },
                { icon: "📅", label: "Book Appointment", action: () => {} },
                { icon: "💬", label: "WhatsApp", action: () => window.location.href = `https://wa.me/${profile.whatsapp_number}` }
              ].map((btn, i) => (
                <motion.button
                  key={i}
                  onClick={btn.action}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #FF7A00, #FDBA21)",
                    border: "none",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    boxShadow: "0 4px 12px rgba(255,122,0,0.3)"
                  }}
                >
                  <span style={{ fontSize: 16 }}>{btn.icon}</span>
                  {btn.label}
                </motion.button>
              ))}
            </div>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
              {[
                { label: "Connections", value: "128" },
                { label: "Leads", value: "47" },
                { label: "Profile Views", value: "2.3K" },
                { label: "NFC Scans", value: "89" }
              ].map((stat, i) => (
                <div key={i} style={{
                  textAlign: "center",
                  padding: "12px 8px",
                  borderRadius: 12,
                  background: "rgba(255,122,0,0.08)",
                  border: "1px solid rgba(255,122,0,0.2)"
                }}>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#FF7A00" }}>{stat.value}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 10, color: "rgba(255,255,255,0.6)" }}>{stat.label}</p>
                </div>
              ))}
            </div>

            {/* About Me section */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 16 }}>▸</span>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "#FF7A00" }}>About Me</h3>
              </div>
              <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: "rgba(255,255,255,0.7)" }}>
                {profile.bio || "Passionate about helping clients achieve their goals. Dedicated to Excellence. Integrity. Results."}
              </p>
            </div>

            {/* Services grid */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>▸</span>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "#FF7A00" }}>My Services</h3>
                </div>
                <a href="#" style={{ fontSize: 10, color: "#FF7A00", textDecoration: "none", fontWeight: 700 }}>View All</a>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
                {[
                  { icon: "⚖️", label: "Legal Advice" },
                  { icon: "📋", label: "Consultation" },
                  { icon: "🏢", label: "Corporate" },
                  { icon: "✈️", label: "Immigration" },
                  { icon: "👨‍⚖️", label: "Defense" }
                ].map((svc, i) => (
                  <div key={i} style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    padding: 10,
                    borderRadius: 12,
                    background: "rgba(255,122,0,0.05)",
                    border: "1px solid rgba(255,122,0,0.15)"
                  }}>
                    <span style={{ fontSize: 20 }}>{svc.icon}</span>
                    <p style={{ margin: 0, fontSize: 9, textAlign: "center", color: "rgba(255,255,255,0.6)" }}>{svc.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {children}
          </div>

          {/* Bottom navigation */}
          <div style={{
            background: "linear-gradient(90deg, rgba(11,46,107,0.95), rgba(255,122,0,0.12), rgba(11,46,107,0.95))",
            borderTop: "1px solid rgba(255,122,0,0.3)",
            padding: "16px 20px",
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 8,
          }}>
            {[
              { icon: "🏠", label: "Home" },
              { icon: "📱", label: "Portfolio" },
              { icon: "📊", label: "Leads" },
              { icon: "🖼️", label: "Gallery" },
              { icon: "📞", label: "Contact" }
            ].map((nav, i) => (
              <button
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  padding: "8px",
                  borderRadius: 8,
                  border: "none",
                  background: "rgba(255,122,0,0.08)",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 10,
                  fontWeight: 700
                }}
              >
                <span style={{ fontSize: 18 }}>{nav.icon}</span>
                {nav.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom badge row */}
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
          {["Premium 3D Design", "Floating Animations", "Exclusive to Paid Plans"].map(t => (
            <span key={t} style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{t}</span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}