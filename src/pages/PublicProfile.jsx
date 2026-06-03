import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

import RequestInfoModal from "@/components/bingoo/RequestInfoModal";
import AppointmentBooking from "@/components/bingoo/AppointmentBooking";
import PortfolioSection from "@/components/bingoo/PortfolioSection";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import NFCTapMockup from "@/components/bingoo/NFCTapMockup";

// ── Analytics ─────────────────────────────────────────────────────────────────
const trackEvent = (profileId, eventType) => {
  base44.entities.Analytics.create({
    profile_id: profileId,
    event_type: eventType,
    visitor_device: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
    created_at: new Date().toISOString(),
  }).catch(() => {});
};

// ── VCF Download ──────────────────────────────────────────────────────────────
const saveContact = (profile) => {
  const lines = [
    "BEGIN:VCARD", "VERSION:3.0",
    `FN:${profile.display_name || ""}`,
    profile.company_name ? `ORG:${profile.company_name}` : "",
    profile.job_title ? `TITLE:${profile.job_title}` : "",
    profile.phone ? `TEL;TYPE=VOICE:${profile.phone}` : "",
    profile.whatsapp_number ? `TEL;TYPE=CELL:${profile.whatsapp_number}` : "",
    profile.email ? `EMAIL:${profile.email}` : "",
    profile.website ? `URL:${profile.website}` : "",
    profile.location && profile.show_location !== false ? `ADR:;;${profile.location};;;;` : "",
    "END:VCARD",
  ].filter(Boolean).join("\n");
  const url = URL.createObjectURL(new Blob([lines], { type: "text/vcard" }));
  Object.assign(document.createElement("a"), { href: url, download: `${(profile.display_name || "contact").replace(/\s+/g, "_")}.vcf` }).click();
  URL.revokeObjectURL(url);
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const useLinks = (p) => ({
  primary: [
    p?.whatsapp_number && { e: "💬", l: "WhatsApp", h: `https://wa.me/${(p.whatsapp_number||"").replace(/\D/g,"")}`, ev: "whatsapp_click" },
    p?.phone && { e: "📞", l: "Call", h: `tel:${p.phone}`, ev: "phone_click" },
    p?.email && { e: "📧", l: "Email", h: `mailto:${p.email}`, ev: "email_click" },
  ].filter(Boolean),
  secondary: [
    p?.instagram_url && { e: "📸", l: "Instagram", h: p.instagram_url, ev: "instagram_click" },
    p?.facebook_url && { e: "👤", l: "Facebook", h: p.facebook_url, ev: "facebook_click" },
    p?.tiktok_url && { e: "🎵", l: "TikTok", h: p.tiktok_url, ev: "tiktok_click" },
    p?.linkedin_url && { e: "💼", l: "LinkedIn", h: p.linkedin_url, ev: "linkedin_click" },
    p?.youtube_url && { e: "▶️", l: "YouTube", h: p.youtube_url, ev: "youtube_click" },
    p?.website && { e: "🌐", l: "Website", h: p.website, ev: "website_click" },
    p?.location && p?.show_location !== false && { e: "📍", l: "Address", h: `https://maps.google.com/?q=${encodeURIComponent(p.location)}`, ev: "location_click" },
    p?.payment_link && { e: "💳", l: "Pay / Support", h: p.payment_link, ev: "payment_click" },
  ].filter(Boolean),
  payments: [
    p?.zelle_link && { e: "💳", l: "Zelle", h: p.zelle_link, ev: "zelle_click" },
    p?.cashapp_link && { e: "💰", l: "Cash App", h: p.cashapp_link, ev: "cashapp_click" },
    p?.orangemoney_link && { e: "🟠", l: "Orange Money", h: p.orangemoney_link, ev: "orangemoney_click" },
    p?.wave_link && { e: "📲", l: "Wave", h: p.wave_link, ev: "wave_click" },
  ].filter(Boolean),
});

const btnRadius = (s) => s === "pill" ? "9999px" : s === "sharp" ? "8px" : "16px";

// ── Hex to rgba ───────────────────────────────────────────────────────────────
const hexRgb = (hex, alpha = 1) => {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
};

// ── Floating animated orb ─────────────────────────────────────────────────────
function AnimatedOrb({ style, delay = 0 }) {
  return (
    <motion.div
      style={{ position: "fixed", borderRadius: "50%", pointerEvents: "none", zIndex: 0, ...style }}
      animate={{ y: [0, -20, 0], scale: [1, 1.06, 1] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ profile, size = 90, ring = true, floating = false }) {
  const color = profile.cover_color || "#2563eb";
  const ringStyle = ring ? {
    padding: 4,
    background: `linear-gradient(135deg, ${color}, ${color}88)`,
    borderRadius: "50%",
    boxShadow: `0 0 0 4px white, 0 0 0 1px ${hexRgb(color, 0.2)}, 0 12px 40px ${hexRgb(color, 0.35)}, 0 0 24px ${hexRgb(color, 0.15)}`,
    display: "inline-block",
    flexShrink: 0,
  } : {};
  const imgStyle = { width: size, height: size, borderRadius: "50%", objectFit: "cover", display: "block" };
  const inner = profile.profile_photo
    ? <img src={profile.profile_photo} alt={profile.display_name} style={imgStyle} />
    : <div style={{ ...imgStyle, background: `linear-gradient(135deg, ${color}, ${color}99)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: size * 0.38, letterSpacing: "-1px" }}>
        {profile.display_name?.charAt(0) || "?"}
      </div>;
  const wrapped = ring ? <div style={ringStyle}>{inner}</div> : inner;
  if (!floating) return wrapped;
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      style={{ display: "inline-block" }}
    >
      {wrapped}
    </motion.div>
  );
}

// ── Actions ───────────────────────────────────────────────────────────────────
function Actions({ profile, track, color, dark = false }) {
  const [infoOpen, setInfoOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const r = btnRadius(profile.button_style || "pill");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <motion.button
        onClick={() => { track("save_contact_click"); saveContact(profile); }}
        whileHover={{ scale: 1.03, y: -3 }}
        whileTap={{ scale: 0.97 }}
        style={{ width: "100%", padding: "17px 22px", borderRadius: r, background: `linear-gradient(135deg, ${color}, ${color}dd)`, color: "#fff", fontWeight: 800, fontSize: 14.5, letterSpacing: "0.03em", border: "none", cursor: "pointer", boxShadow: `0 10px 32px ${hexRgb(color, 0.5)}, 0 0 0 1px ${hexRgb(color, 0.3)}`, transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)" }}
      >
        💾 &nbsp;Save Contact
      </motion.button>
      <div style={{ display: "grid", gridTemplateColumns: profile.booking_enabled ? "1fr 1fr" : "1fr", gap: 11 }}>
        <motion.button
          onClick={() => setInfoOpen(true)}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          style={{ padding: "15px 18px", borderRadius: r, background: dark ? "rgba(255,255,255,0.12)" : hexRgb(color, 0.1), color: dark ? "#fff" : color, fontWeight: 700, fontSize: 13.5, border: `1.5px solid ${dark ? "rgba(255,255,255,0.22)" : hexRgb(color, 0.35)}`, cursor: "pointer", boxShadow: dark ? `0 4px 12px rgba(0,0,0,0.15)` : `0 2px 8px ${hexRgb(color, 0.1)}`, transition: "all 0.25s cubic-bezier(0.22, 1, 0.36, 1)" }}
        >
          📋 &nbsp;Request Info
        </motion.button>
        {profile.booking_enabled && (
          <motion.button
            onClick={() => setBookOpen(true)}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            style={{ padding: "15px 18px", borderRadius: r, background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)", color: dark ? "rgba(255,255,255,0.85)" : "#374151", fontWeight: 700, fontSize: 13.5, border: dark ? "1px solid rgba(255,255,255,0.14)" : "1px solid rgba(0,0,0,0.1)", cursor: "pointer", boxShadow: dark ? `0 2px 8px rgba(0,0,0,0.1)` : `0 1px 4px rgba(0,0,0,0.06)`, transition: "all 0.25s cubic-bezier(0.22, 1, 0.36, 1)" }}
          >
            📅 &nbsp;Book Meeting
          </motion.button>
        )}
      </div>
      {infoOpen && <RequestInfoModal profileId={profile.id} onClose={() => setInfoOpen(false)} />}
      {bookOpen && <AppointmentBooking profile={profile} onClose={() => setBookOpen(false)} />}
    </div>
  );
}

// ── Link Row ──────────────────────────────────────────────────────────────────
function LinkRow({ e, l, h, onClick, dark, profile, index = 0 }) {
  const color = profile.cover_color || "#2563eb";
  const r = btnRadius(profile.button_style || "pill");
  return (
    <motion.a
      href={h} target="_blank" rel="noopener noreferrer" onClick={onClick}
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 + index * 0.07, duration: 0.4 }}
      whileHover={{ x: 6, scale: 1.01, background: dark ? "rgba(255,255,255,0.12)" : hexRgb(color, 0.1) }}
      whileTap={{ scale: 0.98 }}
      style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderRadius: r, background: dark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.9)", border: dark ? "1px solid rgba(255,255,255,0.12)" : `1px solid ${hexRgb(color, 0.12)}`, textDecoration: "none", color: dark ? "rgba(255,255,255,0.85)" : "#1e293b", fontWeight: 600, fontSize: 14.5, backdropFilter: "blur(12px)", boxShadow: dark ? `0 4px 16px rgba(0,0,0,0.2)` : `0 2px 8px ${hexRgb(color, 0.08)}`, transition: "all 0.25s cubic-bezier(0.22, 1, 0.36, 1)" }}
    >
      <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>{e}</span>
      <span style={{ flex: 1 }}>{l}</span>
      <span style={{ width: 22, height: 22, borderRadius: "50%", background: dark ? "rgba(255,255,255,0.1)" : hexRgb(color, 0.12), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: color, fontWeight: 700 }}>›</span>
    </motion.a>
  );
}

// ── Primary CTAs ──────────────────────────────────────────────────────────────
function PrimaryCtAs({ links, color, track, profile }) {
  if (!links.length) return null;
  const r = btnRadius(profile.button_style || "pill");
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${links.length}, 1fr)`, gap: 12 }}>
      {links.map((l, i) => (
        <motion.a
          key={l.l} href={l.h} target="_blank" rel="noopener noreferrer" onClick={() => track(l.ev)}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 + i * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ scale: 1.06, y: -4 }}
          whileTap={{ scale: 0.95 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "18px 10px", borderRadius: r, background: `linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08))`, backdropFilter: "blur(20px)", color: "#fff", fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", textDecoration: "none", border: "1px solid rgba(255,255,255,0.35)", boxShadow: `0 8px 24px ${hexRgb(color, 0.35)}, inset 0 1px 0 rgba(255,255,255,0.4)`, transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)" }}
        >
          <span style={{ fontSize: 26 }}>{l.e}</span>{l.l}
        </motion.a>
      ))}
    </div>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────
const SectionLabel = ({ text, dark }) => (
  <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.14em", color: dark ? "rgba(255,255,255,0.25)" : "#94a3b8", margin: "0 0 8px 2px" }}>{text}</p>
);

// ── Powered by ────────────────────────────────────────────────────────────────
const PoweredBy = ({ color, dark }) => (
  <p style={{ textAlign: "center", fontSize: 11, color: dark ? "rgba(255,255,255,0.18)" : "#94a3b8", marginTop: 24 }}>
    Powered by <a href="/" style={{ fontWeight: 700, color: dark ? "rgba(255,255,255,0.35)" : color, textDecoration: "none" }}>Bingoo Connect</a>
  </p>
);

// ── Ambient orbs background ───────────────────────────────────────────────────
const AmbientBg = ({ color, dark }) => (
  <>
    <AnimatedOrb delay={0} style={{ top: "-10%", left: "-10%", width: "60vw", height: "60vw", maxWidth: 500, maxHeight: 500, background: `radial-gradient(circle, ${hexRgb(color, dark ? 0.22 : 0.14)} 0%, transparent 70%)` }} />
    <AnimatedOrb delay={2} style={{ bottom: "-5%", right: "-10%", width: "50vw", height: "50vw", maxWidth: 400, maxHeight: 400, background: `radial-gradient(circle, ${hexRgb(color, dark ? 0.15 : 0.1)} 0%, transparent 70%)` }} />
    <AnimatedOrb delay={4} style={{ top: "40%", right: "15%", width: "30vw", height: "30vw", maxWidth: 250, maxHeight: 250, background: `radial-gradient(circle, ${hexRgb(color, dark ? 0.1 : 0.07)} 0%, transparent 70%)` }} />
  </>
);

// ── Responsive size tokens ───────────────────────────────────────────────────
const rz = (mobile, small, large) => mobile ? small : large;

// ── Theme tokens ──────────────────────────────────────────────────────────────
const getThemeTokens = (profile, color) => {
  const theme = profile.profile_theme || "modern";
  const dark = profile.bg_style === "night";
  if (dark) {
    return {
      dark: true,
      cardBg: "rgba(15,16,34,0.88)",
      pageBg: "linear-gradient(160deg,#080a18 0%,#0d1022 100%)",
      headColor: "#fff",
      subColor: "rgba(255,255,255,0.45)",
      bioColor: "rgba(255,255,255,0.5)",
      divider: "rgba(255,255,255,0.07)",
      cardRadius: 32,
      cardShadow: `0 60px 100px rgba(0,0,0,0.8), 0 0 0 1px ${hexRgb(color,0.25)}, inset 0 1px 0 rgba(255,255,255,0.12)`,
      pagePadding: "28px 16px 56px",
    };
  }
  if (theme === "glassmorphic") {
    const bgBase = profile.bg_style === "gradient"
      ? `linear-gradient(135deg,${hexRgb(color,0.2)} 0%,#e0e7ff 50%,#ede9fe 100%)`
      : profile.bg_style === "mesh"
      ? `radial-gradient(at 20% 20%,${hexRgb(color,0.25)},transparent 50%),radial-gradient(at 80% 80%,${hexRgb(color,0.15)},transparent 50%),#ddd6fe22`
      : `linear-gradient(135deg,${hexRgb(color,0.18)} 0%,${hexRgb(color,0.06)} 100%),radial-gradient(at top left,${hexRgb(color,0.25)},transparent 50%),#f0f4ff`;
    return {
      dark: false,
      cardBg: "rgba(255,255,255,0.6)",
      pageBg: bgBase,
      headColor: "#0f172a",
      subColor: "#4c6080",
      bioColor: "#64748b",
      divider: `${hexRgb(color,0.12)}`,
      cardRadius: 28,
      cardShadow: `0 8px 32px ${hexRgb(color,0.18)}, inset 0 1px 0 rgba(255,255,255,0.9)`,
      cardBlur: "blur(32px)",
      pagePadding: "32px 16px 60px",
      cardBorder: `1px solid rgba(255,255,255,0.75)`,
    };
  }
  if (theme === "classic") {
    const bgBase = profile.bg_style === "gradient"
      ? `linear-gradient(150deg,${hexRgb(color,0.06)} 0%,#f0f4ff 100%)`
      : profile.bg_style === "mesh"
      ? `radial-gradient(at 15% 25%,${hexRgb(color,0.08)},transparent 50%),#e9eef4`
      : "#e8edf2";
    return {
      dark: false,
      cardBg: "#fff",
      pageBg: bgBase,
      headColor: "#0f172a",
      subColor: "#475569",
      bioColor: "#64748b",
      divider: "rgba(0,0,0,0.08)",
      cardRadius: 8,
      cardShadow: "0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
      pagePadding: "0px 0px 48px",
      cardBorder: "1px solid #d1d5db",
    };
  }
  // modern (default)
  const bgBase = profile.bg_style === "gradient"
    ? `linear-gradient(150deg,${hexRgb(color,0.1)} 0%,#f0f4ff 40%,#faf5ff 100%)`
    : profile.bg_style === "mesh"
    ? `radial-gradient(at 15% 25%,${hexRgb(color,0.12)},transparent 50%),radial-gradient(at 85% 75%,${hexRgb(color,0.08)},transparent 50%),#f1f5f9`
    : `linear-gradient(160deg,${hexRgb(color,0.06)} 0%,#f8faff 100%)`;
  return {
    dark: false,
    cardBg: "rgba(255,255,255,0.96)",
    pageBg: bgBase,
    headColor: "#0f172a",
    subColor: "#64748b",
    bioColor: "#64748b",
    divider: "rgba(0,0,0,0.06)",
    cardRadius: 32,
    cardShadow: `0 2px 8px rgba(0,0,0,0.04), 0 24px 72px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,1)`,
    pagePadding: "28px 16px 56px",
    cardBorder: "1px solid rgba(255,255,255,0.95)",
  };
};

// ────────────────────────────────────────────────────────────────────────────
// LAYOUT: CLASSIC
// ────────────────────────────────────────────────────────────────────────────
function LayoutClassic({ profile, track, mobile }) {
  const { primary, secondary, payments } = useLinks(profile);
  const color = profile.cover_color || "#2563eb";
  const t = getThemeTokens(profile, color);
  const { dark, cardBg, pageBg: bgBase, headColor, subColor, bioColor, divider } = t;
  const cardRadius = t.cardRadius || 32;
  const cardShadow = t.cardShadow;
  const cardBorder = t.cardBorder || "1px solid rgba(255,255,255,0.95)";
  const cardBlur = t.cardBlur || "blur(24px)";

  const desktopPad = t.pagePadding || "28px 16px 56px";

  return (
    <div style={{ minHeight: "100vh", background: bgBase, display: "flex", justifyContent: "center", alignItems: "flex-start", padding: mobile ? "0 0 48px" : desktopPad, position: "relative", overflow: "hidden", width: "100vw", boxSizing: "border-box" }}>
      <AmbientBg color={color} dark={dark} />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: "100%", maxWidth: mobile ? "100%" : 420, position: "relative", zIndex: 1 }}
      >
        <div style={{ borderRadius: mobile ? 0 : cardRadius, background: cardBg, backdropFilter: cardBlur, border: cardBorder, overflow: "visible", boxShadow: cardShadow, width: "100%" }}>

          {/* Cover banner */}
           <motion.div
             style={{ 
               height: mobile ? 160 : 200, 
               borderRadius: mobile ? 0 : `${cardRadius}px ${cardRadius}px 0 0`, 
               position: "relative", 
               background: profile.cover_photo 
                 ? `url(${profile.cover_photo}) center/cover`
                 : `linear-gradient(135deg, ${color} 0%, ${color}99 60%, ${color}44 100%)`, 
               overflow: "hidden",
               backgroundSize: "cover",
               backgroundPosition: "center"
             }}
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 0.5 }}
           >
             <div style={{ position: "absolute", inset: 0, background: profile.cover_photo 
               ? "linear-gradient(135deg,rgba(0,0,0,0.15) 0%,rgba(0,0,0,0.08) 100%)"
               : "linear-gradient(120deg,rgba(255,255,255,0.22) 0%,transparent 50%,rgba(255,255,255,0.06) 100%)" }} />
             {!profile.cover_photo && (
               <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.15) 1px,transparent 1px)", backgroundSize: "22px 22px", opacity: 0.5 }} />
             )}
             <motion.div
               style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }}
               animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.15, 0.08] }}
               transition={{ duration: 5, repeat: Infinity }}
             />
             <motion.div
               style={{ position: "absolute", bottom: -20, left: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }}
               animate={{ scale: [1, 1.12, 1] }}
               transition={{ duration: 6, repeat: Infinity, delay: 1 }}
             />
             {profile.company_logo && (
               <motion.img src={profile.company_logo} alt="Logo" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.4 }} style={{ position: "absolute", top: 20, left: 20, height: 50, objectFit: "contain", filter: profile.cover_photo ? "" : "brightness(0) invert(1)", opacity: 0.9 }} />
             )}
           </motion.div>

          {/* Body */}
          <div style={{ padding: mobile ? "0 18px 32px" : "0 32px 40px" }}>
            {/* Avatar & Branding Section */}
             <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: mobile ? -60 : -85, marginBottom: 32, position: "relative", zIndex: 10 }}>
               <div style={{ boxShadow: `0 20px 60px ${hexRgb(color, 0.6)}, 0 0 0 8px white`, borderRadius: "50%", display: "inline-block" }}>
                 <Avatar profile={profile} size={mobile ? 92 : 120} ring floating />
               </div>
              {profile.plan !== "free" && (
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                  style={{ marginTop: -14, fontSize: 10, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", padding: "5px 14px", borderRadius: 999, background: `linear-gradient(135deg,${color},${color}99)`, color: "#fff", boxShadow: `0 4px 12px ${hexRgb(color,0.4)}`, position: "relative", zIndex: 20 }}
                >PRO</motion.span>
              )}
            </div>

            {/* Identity */}
             <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} style={{ textAlign: "center", marginBottom: 8 }}>
               <h1 style={{ margin: "0 0 8px", fontSize: mobile ? 28 : 32, fontWeight: 950, color: headColor, lineHeight: 1.1, letterSpacing: "-0.8px" }}>{profile.display_name}</h1>
               {profile.job_title && <p style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 750, background: `linear-gradient(90deg,${color},${color}99)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "0.02em" }}>{profile.job_title}</p>}
               {profile.company_name && <p style={{ margin: "0 0 12px", fontSize: 14.5, color: subColor, fontWeight: 600, letterSpacing: "0.01em" }}>{profile.company_name}</p>}
               {profile.bio && (
                 <p style={{ margin: "0", fontSize: 14, lineHeight: 1.8, color: bioColor, padding: "16px 18px", borderRadius: 16, background: dark ? "rgba(255,255,255,0.06)" : hexRgb(color, 0.07), border: dark ? "1px solid rgba(255,255,255,0.1)" : `1px solid ${hexRgb(color, 0.15)}`, fontWeight: 500, letterSpacing: "0.005em" }}>{profile.bio}</p>
               )}
             </motion.div>

            <div style={{ height: 1.5, background: divider, margin: "28px 0" }} />

           {/* Payment Methods */}
            {payments.length > 0 && (
              <div style={{ marginTop: 28 }}>
                <SectionLabel text="Send Money" dark={dark} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                  {payments.map((p, i) => (
                    <motion.a key={p.l} href={p.h} target="_blank" rel="noopener noreferrer" onClick={() => track(p.ev)}
                      initial={{ opacity: 0, scale: 0.75 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.08 }}
                      whileHover={{ scale: 1.12, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "16px 10px", borderRadius: 16, background: dark ? "rgba(255,255,255,0.08)" : hexRgb(color, 0.1), border: dark ? "1px solid rgba(255,255,255,0.14)" : `1.5px solid ${hexRgb(color, 0.28)}`, textDecoration: "none", color: dark ? "rgba(255,255,255,0.8)" : color, fontWeight: 700, fontSize: 11, textAlign: "center", cursor: "pointer", transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)", boxShadow: dark ? `0 2px 8px rgba(0,0,0,0.2)` : `0 2px 12px ${hexRgb(color, 0.15)}` }}>
                      <span style={{ fontSize: 24 }}>{p.e}</span>
                      <span style={{ lineHeight: 1.2, fontSize: "10px" }}>{p.l}</span>
                    </motion.a>
                  ))}
                </div>
              </div>
            )}

           {/* Secondary links */}
             {secondary.length > 0 && (
               <div style={{ marginTop: 28 }}>
                 <SectionLabel text="Links & Socials" dark={dark} />
                 <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                   {secondary.map((l, i) => <LinkRow key={l.l} {...l} index={i} onClick={() => track(l.ev)} dark={dark} profile={profile} />)}
                 </div>
               </div>
             )}

            <div style={{ marginTop: 28 }}>
              <PortfolioSection profileId={profile.id} color={color} />
            </div>
          </div>
        </div>
        <PoweredBy color={color} dark={dark} />
      </motion.div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// LAYOUT: MINIMAL
// ────────────────────────────────────────────────────────────────────────────
function LayoutMinimal({ profile, track, mobile }) {
  const { primary, secondary, payments } = useLinks(profile);
  const color = profile.cover_color || "#2563eb";
  const dark = profile.bg_style === "night";
  const headColor = dark ? "#fff" : "#0f172a";
  const subColor = dark ? "rgba(255,255,255,0.45)" : "#64748b";
  const cardBg = dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.9)";
  const bgBase = dark ? "linear-gradient(160deg,#08091a 0%,#0d1022 100%)" : `radial-gradient(at 50% 0%,${hexRgb(color,0.1)},transparent 60%),#f1f5f9`;

  return (
    <div style={{ minHeight: "100vh", background: bgBase, display: "flex", justifyContent: "center", padding: mobile ? "0" : "44px 16px 64px", position: "relative", overflow: "hidden", width: "100vw", boxSizing: "border-box" }}>
      <AmbientBg color={color} dark={dark} />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: "100%", maxWidth: mobile ? "100%" : 420, position: "relative", zIndex: 1 }}
      >
        <div style={{ borderRadius: mobile ? 0 : 32, background: cardBg, backdropFilter: "blur(24px)", border: dark ? "1px solid rgba(255,255,255,0.09)" : "1px solid rgba(255,255,255,0.8)", padding: mobile ? "36px 0 32px" : "40px 28px 36px", boxShadow: dark ? "0 40px 80px rgba(0,0,0,0.6)" : "0 20px 60px rgba(0,0,0,0.09), inset 0 1px 0 #fff", width: "100%" }}>
          {profile.company_logo && (
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }} style={{ display: "flex", justifyContent: "center", marginBottom: 28, marginTop: -2 }}>
              <div style={{ padding: "18px 20px", background: dark ? "rgba(255,255,255,0.09)" : hexRgb(color, 0.11), borderRadius: 20, border: dark ? "1.5px solid rgba(255,255,255,0.14)" : `2px solid ${hexRgb(color, 0.35)}`, boxShadow: `0 16px 40px ${hexRgb(color, dark ? 0.2 : 0.3)}` }}>
                <img src={profile.company_logo} alt="Logo" style={{ height: 80, objectFit: "contain" }} />
              </div>
            </motion.div>
          )}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 22 }}>
            <Avatar profile={profile} size={mobile ? 72 : 88} ring floating />
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 0.5 }} style={{ textAlign: "center", marginTop: 12 }}>
              <h1 style={{ margin: "0 0 4px", fontSize: mobile ? 20 : 24, fontWeight: 900, color: headColor, lineHeight: 1.2, letterSpacing: "-0.4px" }}>{profile.display_name}</h1>
              {profile.job_title && <p style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 700, background: `linear-gradient(90deg,${color},${color}99)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{profile.job_title}</p>}
              {profile.company_name && <p style={{ margin: 0, fontSize: 13, color: subColor }}>{profile.company_name}</p>}
            </motion.div>
          </div>
          {profile.bio && <p style={{ margin: "0 0 22px", fontSize: 13.5, lineHeight: 1.7, color: subColor }}>{profile.bio}</p>}
          <div style={{ height: 1, background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", marginBottom: 20 }} />
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
            {primary.length > 0 && <div style={{ marginBottom: 10 }}><PrimaryCtAs links={primary} color={color} track={track} profile={profile} /></div>}
            <Actions profile={profile} track={track} color={color} dark={dark} />
          </motion.div>
          {payments.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <SectionLabel text="Send Money" dark={dark} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 18 }}>
                {payments.map((p, i) => (
                  <motion.a key={p.l} href={p.h} target="_blank" rel="noopener noreferrer" onClick={() => track(p.ev)}
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.07 }}
                    whileHover={{ scale: 1.08 }}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "10px 6px", borderRadius: 12, background: dark ? "rgba(255,255,255,0.05)" : hexRgb(color, 0.06), border: dark ? "1px solid rgba(255,255,255,0.1)" : `1px solid ${hexRgb(color, 0.2)}`, textDecoration: "none", color: dark ? "rgba(255,255,255,0.7)" : color, fontWeight: 600, fontSize: 9, textAlign: "center", cursor: "pointer" }}>
                    <span style={{ fontSize: 18 }}>{p.e}</span>
                    <span style={{ lineHeight: 1 }}>{p.l}</span>
                  </motion.a>
                ))}
              </div>
            </div>
          )}
          {secondary.length > 0 && (
            <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8 }}>
              <SectionLabel text="Links" dark={dark} />
              {secondary.map((l, i) => <LinkRow key={l.l} {...l} index={i} onClick={() => track(l.ev)} dark={dark} profile={profile} />)}
            </div>
          )}
          <div style={{ marginTop: 22 }}><PortfolioSection profileId={profile.id} color={color} /></div>
        </div>
        <PoweredBy color={color} dark={dark} />
      </motion.div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// LAYOUT: DARK
// ────────────────────────────────────────────────────────────────────────────
function LayoutDark({ profile, track, mobile }) {
  const { primary, secondary, payments } = useLinks(profile);
  const color = profile.cover_color || "#2563eb";

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#050714 0%,#0a0d1f 100%)", display: "flex", justifyContent: "center", padding: mobile ? "0 0 40px" : "32px 16px 60px", position: "relative", overflow: "hidden", width: "100vw", boxSizing: "border-box" }}>
      <AnimatedOrb delay={0} style={{ top: 0, left: "50%", transform: "translateX(-50%)", width: 700, height: 400, background: `radial-gradient(ellipse at 50% 0%,${hexRgb(color,0.35)},transparent 65%)` }} />
      <AnimatedOrb delay={2} style={{ bottom: 0, left: 0, width: 400, height: 400, background: `radial-gradient(circle,${hexRgb(color,0.12)},transparent 70%)` }} />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: "100%", maxWidth: mobile ? "100%" : 420, position: "relative", zIndex: 1 }}
      >
        <div style={{ borderRadius: mobile ? 0 : 32, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(32px)", boxShadow: `0 40px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.15)`, overflow: "hidden", width: "100%" }}>
          <div style={{ height: 5, background: `linear-gradient(90deg,${color},${color}66,transparent)` }} />
          <div style={{ padding: mobile ? "24px 0 32px" : "32px 26px 36px" }}>
            {profile.company_logo && (
              <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }} style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
                <div style={{ padding: "14px 16px", background: "rgba(255,255,255,0.1)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 10px 28px rgba(0,0,0,0.3)" }}>
                  <img src={profile.company_logo} alt="Logo" style={{ height: 68, objectFit: "contain" }} />
                </div>
              </motion.div>
            )}
            <div style={{ display: "flex", gap: 14, marginBottom: 20, alignItems: "center" }}>
              <Avatar profile={profile} size={mobile ? 68 : 82} ring floating />
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25, duration: 0.5 }} style={{ flex: 1 }}>
                <h1 style={{ margin: "0 0 5px", fontSize: mobile ? 19 : 23, fontWeight: 900, color: "#fff", letterSpacing: "-0.3px" }}>{profile.display_name}</h1>
                {profile.job_title && <p style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 700, background: `linear-gradient(90deg,${color},${color}aa)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{profile.job_title}</p>}
                {profile.company_name && <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{profile.company_name}</p>}
              </motion.div>
            </div>
            {profile.bio && <p style={{ margin: "0 0 24px", fontSize: 13.5, lineHeight: 1.7, color: "rgba(255,255,255,0.5)", padding: "12px 14px", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>{profile.bio}</p>}
            <div style={{ height: 1, background: "rgba(255,255,255,0.07)", marginBottom: 20 }} />
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }}>
              {primary.length > 0 && <div style={{ marginBottom: 10 }}><PrimaryCtAs links={primary} color={color} track={track} profile={profile} /></div>}
              <Actions profile={profile} track={track} color={color} dark />
            </motion.div>
            {payments.length > 0 && (
              <div style={{ marginTop: 18 }}>
                <SectionLabel text="Send Money" dark />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 12 }}>
                  {payments.map((p, i) => (
                    <motion.a key={p.l} href={p.h} target="_blank" rel="noopener noreferrer" onClick={() => track(p.ev)}
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 + i * 0.07 }}
                      whileHover={{ scale: 1.08 }}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "10px 6px", borderRadius: 12, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", textDecoration: "none", color: "rgba(255,255,255,0.8)", fontWeight: 600, fontSize: 9, textAlign: "center", cursor: "pointer" }}>
                      <span style={{ fontSize: 18 }}>{p.e}</span>
                      <span style={{ lineHeight: 1 }}>{p.l}</span>
                    </motion.a>
                  ))}
                </div>
              </div>
            )}
            {secondary.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <SectionLabel text="Links & Socials" dark />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {secondary.map((l, i) => <LinkRow key={l.l} {...l} index={i} onClick={() => track(l.ev)} dark profile={profile} />)}
                </div>
              </div>
            )}
            <div style={{ marginTop: 22 }}><PortfolioSection profileId={profile.id} color={color} /></div>
          </div>
        </div>
        <PoweredBy color={color} dark />
      </motion.div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// LAYOUT: BOLD
// ────────────────────────────────────────────────────────────────────────────
function LayoutBold({ profile, track, mobile }) {
  const { primary, secondary, payments } = useLinks(profile);
  const color = profile.cover_color || "#2563eb";

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg,${color} 0%,${color}cc 30%,#f0f4ff 75%,#f8f0ff 100%)`, display: "flex", justifyContent: "center", padding: mobile ? "0 0 48px" : "0 16px 60px", position: "relative", overflow: "hidden", width: "100vw", boxSizing: "border-box" }}>
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "50vh", backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.12) 1px,transparent 1px)", backgroundSize: "24px 24px", pointerEvents: "none" }} />
      <AnimatedOrb delay={0} style={{ top: "10%", right: "-10%", width: 300, height: 300, background: "rgba(255,255,255,0.1)" }} />
      <div style={{ width: mobile ? "100vw" : "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ padding: mobile ? "40px 0 28px" : "52px 0 36px", textAlign: "center" }}
        >
          {profile.company_logo && (
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.5 }} style={{ marginBottom: 28, display: "flex", justifyContent: "center" }}>
              <div style={{ padding: "18px 22px", background: "rgba(255,255,255,0.28)", backdropFilter: "blur(18px)", borderRadius: 20, border: "1.5px solid rgba(255,255,255,0.38)", boxShadow: "0 14px 44px rgba(0,0,0,0.28)" }}>
                <img src={profile.company_logo} alt="Logo" style={{ height: 84, objectFit: "contain" }} />
              </div>
            </motion.div>
          )}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <Avatar profile={profile} size={mobile ? 94 : 114} ring floating />
          </div>
          <h1 style={{ margin: "0 0 8px", fontSize: mobile ? 26 : 32, fontWeight: 900, color: "#fff", textShadow: "0 2px 14px rgba(0,0,0,0.25)", letterSpacing: "-0.6px" }}>{profile.display_name}</h1>
          {profile.job_title && <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>{profile.job_title}</p>}
          {profile.company_name && <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.55)" }}>{profile.company_name}</p>}
          {profile.bio && <p style={{ margin: "16px auto 0", fontSize: 13.5, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", maxWidth: 300 }}>{profile.bio}</p>}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          style={{ borderRadius: 28, background: "rgba(255,255,255,0.18)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.3)", padding: mobile ? "26px 12px" : "26px 22px", marginBottom: 14, marginLeft: mobile ? 12 : 0, marginRight: mobile ? 12 : 0, boxShadow: "0 20px 60px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {primary.length > 0 && <PrimaryCtAs links={primary} color={color} track={track} profile={profile} />}
            <Actions profile={profile} track={track} color={color} dark />
            {payments.length > 0 && payments.map((p, i) => (
              <motion.button key={p.l} type="button" onClick={() => { track(p.ev); window.open(p.h, '_blank'); }}
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.38 + i * 0.06 }}
                whileHover={{ x: 4 }}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: btnRadius(profile.button_style || "pill"), background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", color: "#fff", fontWeight: 600, fontSize: 13, textDecoration: "none", backdropFilter: "blur(8px)", cursor: "pointer", width: "100%" }}>
                <span style={{ fontSize: 18 }}>{p.e}</span>{p.l}
              </motion.button>
            ))}
            {secondary.map((l, i) => (
              <motion.a key={l.l} href={l.h} target="_blank" rel="noopener noreferrer" onClick={() => track(l.ev)}
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + (payments.length + i) * 0.06 }}
                whileHover={{ x: 4 }}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: btnRadius(profile.button_style || "pill"), background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.22)", color: "#fff", fontWeight: 600, fontSize: 14, textDecoration: "none", backdropFilter: "blur(8px)" }}>
                <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>{l.e}</span>{l.l}
              </motion.a>
            ))}
          </div>
        </motion.div>
        <div style={{ borderRadius: 24, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.18)", padding: 18, marginBottom: 16 }}>
          <PortfolioSection profileId={profile.id} color="#fff" />
        </div>
        <PoweredBy color={color} dark />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// LAYOUT: SPLIT
// ────────────────────────────────────────────────────────────────────────────
function LayoutSplit({ profile, track, mobile }) {
  const { primary, secondary, payments } = useLinks(profile);
  const color = profile.cover_color || "#2563eb";
  const dark = profile.bg_style === "night";
  const cardBg = dark ? "rgba(10,12,26,0.9)" : "rgba(255,255,255,0.92)";
  const headColor = dark ? "#fff" : "#0f172a";
  const subColor = dark ? "rgba(255,255,255,0.4)" : "#64748b";
  const bgBase = dark ? "linear-gradient(160deg,#070818 0%,#0b0e20 100%)" : `linear-gradient(150deg,${hexRgb(color,0.06)} 0%,#f1f5f9 100%)`;

  return (
    <div style={{ minHeight: "100vh", background: bgBase, display: "flex", justifyContent: "center", padding: mobile ? "0 0 48px" : "32px 16px 60px", position: "relative", overflow: "hidden" }}>
      <AmbientBg color={color} dark={dark} />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: "100%", maxWidth: mobile ? "100%" : 420, position: "relative", zIndex: 1 }}
      >
        <div style={{ borderRadius: mobile ? 0 : 32, background: cardBg, backdropFilter: "blur(24px)", border: dark ? "1px solid rgba(255,255,255,0.09)" : "1px solid rgba(255,255,255,0.8)", overflow: "hidden", boxShadow: dark ? "0 40px 80px rgba(0,0,0,0.65)" : "0 20px 60px rgba(0,0,0,0.1), inset 0 1px 0 #fff", display: "flex" }}>
          <div style={{ width: 7, flexShrink: 0, background: `linear-gradient(180deg,${color} 0%,${color}55 100%)`, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.3) 1px,transparent 1px)", backgroundSize: "6px 12px" }} />
          </div>
          <div style={{ flex: 1, padding: mobile ? "24px 12px 32px" : "30px 24px 36px" }}>
            {profile.company_logo && (
              <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.5 }} style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                <div style={{ padding: "16px 18px", background: dark ? "rgba(255,255,255,0.1)" : hexRgb(color, 0.11), borderRadius: 18, border: dark ? "1.5px solid rgba(255,255,255,0.16)" : `2px solid ${hexRgb(color, 0.36)}`, boxShadow: `0 12px 36px ${hexRgb(color, dark ? 0.22 : 0.32)}` }}>
                  <img src={profile.company_logo} alt="Logo" style={{ height: 76, objectFit: "contain" }} />
                </div>
              </motion.div>
            )}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
              <Avatar profile={profile} size={mobile ? 70 : 86} ring floating />
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} style={{ textAlign: "center", marginTop: 12 }}>
                <h1 style={{ margin: "0 0 4px", fontSize: mobile ? 19 : 23, fontWeight: 900, color: headColor, lineHeight: 1.2, letterSpacing: "-0.4px" }}>{profile.display_name}</h1>
                {profile.job_title && <p style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 700, background: `linear-gradient(90deg,${color},${color}99)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{profile.job_title}</p>}
                {profile.company_name && <p style={{ margin: 0, fontSize: 13, color: subColor }}>{profile.company_name}</p>}
              </motion.div>
            </div>
            {profile.bio && <p style={{ margin: "0 0 20px", fontSize: 13.5, lineHeight: 1.7, color: subColor }}>{profile.bio}</p>}
            <div style={{ height: 1, background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", marginBottom: 20 }} />
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }}>
              {primary.length > 0 && <div style={{ marginBottom: 10 }}><PrimaryCtAs links={primary} color={color} track={track} profile={profile} /></div>}
              <Actions profile={profile} track={track} color={color} dark={dark} />
              {payments.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <SectionLabel text="Send Money" dark={dark} />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                    {payments.map((p, i) => (
                      <motion.a key={p.l} href={p.h} target="_blank" rel="noopener noreferrer" onClick={() => track(p.ev)}
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.07 }}
                        whileHover={{ scale: 1.08 }}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "10px 6px", borderRadius: 12, background: dark ? "rgba(255,255,255,0.05)" : hexRgb(color, 0.06), border: dark ? "1px solid rgba(255,255,255,0.1)" : `1px solid ${hexRgb(color, 0.2)}`, textDecoration: "none", color: dark ? "rgba(255,255,255,0.7)" : color, fontWeight: 600, fontSize: 9, textAlign: "center", cursor: "pointer" }}>
                        <span style={{ fontSize: 18 }}>{p.e}</span>
                        <span style={{ lineHeight: 1 }}>{p.l}</span>
                      </motion.a>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
            {secondary.length > 0 && (
              <div style={{ marginTop: 18 }}>
                <SectionLabel text="Links" dark={dark} />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {secondary.map((l, i) => <LinkRow key={l.l} {...l} index={i} onClick={() => track(l.ev)} dark={dark} profile={profile} />)}
                </div>
              </div>
            )}
            <div style={{ marginTop: 22 }}><PortfolioSection profileId={profile.id} color={color} /></div>
          </div>
        </div>
        <PoweredBy color={color} dark={dark} />
      </motion.div>
    </div>
  );
}

// ── Home Button ──────────────────────────────────────────────────────────────
function HomeButton() {
  return (
    <motion.a
      href="/"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      whileHover={{ scale: 1.05, boxShadow: "0 8px 24px rgba(0,0,0,0.18)" }}
      style={{ position: "fixed", top: 16, left: 16, zIndex: 100, display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 999, background: "rgba(255,255,255,0.88)", backdropFilter: "blur(16px)", boxShadow: "0 4px 16px rgba(0,0,0,0.14)", color: "#374151", fontWeight: 700, fontSize: 13, textDecoration: "none", border: "1px solid rgba(0,0,0,0.08)" }}
    >
      ← Home
    </motion.a>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// LAYOUT: CARD (Portfolio grid)
// ────────────────────────────────────────────────────────────────────────────────
function LayoutCard({ profile, track, mobile }) {
  const { primary, secondary, payments } = useLinks(profile);
  const color = profile.cover_color || "#2563eb";
  const dark = profile.bg_style === "night";
  const bgBase = dark ? "linear-gradient(160deg,#080a18 0%,#0d1022 100%)" : `radial-gradient(at 50% 0%,${hexRgb(color,0.08)},transparent 60%),#f8fafc`;

  return (
    <div style={{ minHeight: "100vh", background: bgBase, display: "flex", justifyContent: "center", padding: mobile ? "0 0 48px" : "32px 16px 60px", position: "relative", overflow: "hidden", width: "100vw", boxSizing: "border-box" }}>
      <AmbientBg color={color} dark={dark} />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} style={{ width: "100%", maxWidth: mobile ? "100%" : 500, position: "relative", zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }} style={{ textAlign: "center", marginBottom: 32 }}>
          <Avatar profile={profile} size={mobile ? 80 : 100} ring floating />
          <h1 style={{ margin: "16px 0 4px", fontSize: mobile ? 22 : 28, fontWeight: 900, color: dark ? "#fff" : "#0f172a", letterSpacing: "-0.5px" }}>{profile.display_name}</h1>
          {profile.job_title && <p style={{ margin: "0 0 3px", fontSize: 15, fontWeight: 700, background: `linear-gradient(90deg,${color},${color}bb)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{profile.job_title}</p>}
          {profile.company_name && <p style={{ margin: 0, fontSize: 14, color: dark ? "rgba(255,255,255,0.4)" : "#64748b" }}>{profile.company_name}</p>}
          {profile.bio && <p style={{ margin: "12px 0 0", fontSize: 13.5, lineHeight: 1.6, color: dark ? "rgba(255,255,255,0.5)" : "#64748b", maxWidth: 350 }}>{profile.bio}</p>}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
          {secondary.slice(0, 6).map((l, i) => (
            <motion.a key={l.l} href={l.h} target="_blank" rel="noopener noreferrer" onClick={() => track(l.ev)}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 + i * 0.07 }}
              whileHover={{ scale: 1.06, y: -2 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "16px 12px", borderRadius: 16, background: dark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.9)", border: dark ? "1px solid rgba(255,255,255,0.12)" : `1px solid ${hexRgb(color, 0.2)}`, textDecoration: "none", color: dark ? "rgba(255,255,255,0.8)" : color, fontWeight: 600, fontSize: 12, textAlign: "center", cursor: "pointer", backdropFilter: "blur(12px)", boxShadow: dark ? "0 8px 24px rgba(0,0,0,0.3)" : `0 4px 12px ${hexRgb(color, 0.15)}` }}
            >
              <span style={{ fontSize: 24 }}>{l.e}</span>{l.l}
            </motion.a>
          ))}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
          {primary.length > 0 && <div style={{ marginBottom: 16 }}><PrimaryCtAs links={primary} color={color} track={track} profile={profile} /></div>}
          <Actions profile={profile} track={track} color={color} dark={dark} />
        </motion.div>
        <div style={{ marginTop: 24 }}><PortfolioSection profileId={profile.id} color={color} /></div>
        <PoweredBy color={color} dark={dark} />
      </motion.div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// LAYOUT: GLASSMORPHIC
// ────────────────────────────────────────────────────────────────────────────────
function LayoutGlassmorphic({ profile, track, mobile }) {
  const { primary, secondary, payments } = useLinks(profile);
  const color = profile.cover_color || "#2563eb";
  const bgBase = `linear-gradient(135deg,${hexRgb(color,0.05)} 0%,${hexRgb(color,0.02)} 100%),radial-gradient(at top left,${hexRgb(color,0.1)},transparent 50%),#f8fafc`;

  return (
    <div style={{ minHeight: "100vh", background: bgBase, display: "flex", justifyContent: "center", padding: mobile ? "0 0 48px" : "32px 16px 60px", position: "relative", overflow: "hidden", width: "100vw", boxSizing: "border-box" }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} style={{ width: "100%", maxWidth: mobile ? "100%" : 420, position: "relative", zIndex: 1 }}>
        <div style={{ borderRadius: 32, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)", border: `1px solid rgba(255,255,255,0.9)`, boxShadow: `0 8px 32px ${hexRgb(color, 0.1)}, inset 0 1px 0 rgba(255,255,255,0.9)`, overflow: "hidden", width: "100%" }}>
           <motion.div style={{ height: mobile ? 160 : 200, borderRadius: "32px 32px 0 0", position: "relative", background: profile.cover_photo 
             ? `url(${profile.cover_photo}) center/cover`
             : `linear-gradient(135deg,${hexRgb(color,0.15)},${hexRgb(color,0.08)})`, overflow: "hidden", backgroundSize: "cover", backgroundPosition: "center" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
             <div style={{ position: "absolute", inset: 0, background: profile.cover_photo 
               ? "linear-gradient(135deg,rgba(255,255,255,0.2) 0%,rgba(255,255,255,0.08) 100%)"
               : "none" }} />
             {!profile.cover_photo && (
               <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.4) 1px,transparent 1px)", backgroundSize: "24px 24px", opacity: 0.5 }} />
             )}
           </motion.div>
          <div style={{ padding: mobile ? "0 20px 24px" : "0 28px 32px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: mobile ? -64 : -80, marginBottom: 20, position: "relative", zIndex: 10 }}>
              <div style={{ boxShadow: `0 16px 48px ${hexRgb(color, 0.4)}, 0 0 0 6px white`, borderRadius: "50%", display: "inline-block" }}>
                <Avatar profile={profile} size={mobile ? 90 : 110} ring floating />
              </div>
            </div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} style={{ textAlign: "center", marginBottom: 22 }}>
              <h1 style={{ margin: "0 0 6px", fontSize: mobile ? 24 : 28, fontWeight: 900, color: "#0f172a", lineHeight: 1.1, letterSpacing: "-0.6px" }}>{profile.display_name}</h1>
              {profile.job_title && <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, background: `linear-gradient(90deg,${color},${color}bb)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{profile.job_title}</p>}
              {profile.company_name && <p style={{ margin: 0, fontSize: 14, color: "#64748b", fontWeight: 500 }}>{profile.company_name}</p>}
              {profile.bio && <p style={{ margin: "14px 0 0", fontSize: 13.5, lineHeight: 1.7, color: "#64748b", padding: "12px 14px", borderRadius: 14, background: hexRgb(color, 0.05), borderLeft: `3px solid ${hexRgb(color, 0.5)}` }}>{profile.bio}</p>}
            </motion.div>
            <div style={{ height: 1, background: "rgba(0,0,0,0.06)", margin: "20px 0" }} />
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
              {primary.length > 0 && <div style={{ marginBottom: 10 }}><PrimaryCtAs links={primary} color={color} track={track} profile={profile} /></div>}
              <Actions profile={profile} track={track} color={color} dark={false} />
            </motion.div>
            {secondary.length > 0 && <div style={{ marginTop: 18 }}><SectionLabel text="Links" dark={false} /><div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{secondary.map((l, i) => <LinkRow key={l.l} {...l} index={i} onClick={() => track(l.ev)} dark={false} profile={profile} />)}</div></div>}
            <div style={{ marginTop: 22 }}><PortfolioSection profileId={profile.id} color={color} /></div>
          </div>
        </div>
        <PoweredBy color={color} dark={false} />
      </motion.div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// LAYOUT: GRADIENT (Flowing colors)
// ────────────────────────────────────────────────────────────────────────────────
function LayoutGradient({ profile, track, mobile }) {
  const { primary, secondary, payments } = useLinks(profile);
  const color = profile.cover_color || "#2563eb";

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg,${color}15 0%,${color}08 40%,${hexRgb(color,0.04)} 100%),radial-gradient(at top right,${hexRgb(color,0.15)},transparent 50%),#fbfdfe`, display: "flex", justifyContent: "center", padding: mobile ? "0 0 48px" : "28px 16px 56px", position: "relative", overflow: "hidden", width: "100vw", boxSizing: "border-box" }}>
      <AmbientBg color={color} dark={false} />
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }} style={{ width: "100%", maxWidth: mobile ? "100%" : 420, position: "relative", zIndex: 1 }}>
        <div style={{ borderRadius: mobile ? 0 : 32, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(24px)", border: `1px solid ${hexRgb(color, 0.15)}`, overflow: "visible", boxShadow: `0 4px 6px rgba(0,0,0,0.02), 0 20px 60px ${hexRgb(color, 0.1)}, inset 0 1px 0 rgba(255,255,255,1)`, width: "100%" }}>
          <motion.div style={{ height: mobile ? 160 : 200, borderRadius: mobile ? 0 : "32px 32px 0 0", position: "relative", background: profile.cover_photo 
            ? `url(${profile.cover_photo}) center/cover`
            : `linear-gradient(135deg,${color}22,${color}11 60%,${color}08 100%)`, overflow: "hidden", backgroundSize: "cover", backgroundPosition: "center" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div style={{ position: "absolute", inset: 0, background: profile.cover_photo 
              ? "linear-gradient(120deg,rgba(255,255,255,0.2) 0%,transparent 50%,rgba(255,255,255,0.08) 100%)"
              : "linear-gradient(120deg,rgba(255,255,255,0.3) 0%,transparent 50%,rgba(255,255,255,0.1) 100%)" }} />
            {!profile.cover_photo && (
              <motion.div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: hexRgb(color, 0.1) }} animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.18, 0.1] }} transition={{ duration: 5, repeat: Infinity }} />
            )}
          </motion.div>
          <div style={{ padding: mobile ? "0 0 28px" : "0 26px 32px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: mobile ? -56 : -75, marginBottom: 20, position: "relative", zIndex: 10 }}>
              <div style={{ boxShadow: `0 16px 48px ${hexRgb(color, 0.5)}, 0 0 0 6px white`, borderRadius: "50%", display: "inline-block" }}>
                <Avatar profile={profile} size={mobile ? 88 : 110} ring floating />
              </div>
            </div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} style={{ textAlign: "center", marginBottom: 2 }}>
              <h1 style={{ margin: "0 0 6px", fontSize: mobile ? 24 : 28, fontWeight: 900, color: "#0f172a", lineHeight: 1.1, letterSpacing: "-0.6px" }}>{profile.display_name}</h1>
              {profile.job_title && <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, background: `linear-gradient(90deg,${color},${color}bb)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{profile.job_title}</p>}
              {profile.company_name && <p style={{ margin: 0, fontSize: 14, color: "#64748b", fontWeight: 500 }}>{profile.company_name}</p>}
              {profile.bio && <p style={{ margin: "14px 0 0", fontSize: 13.5, lineHeight: 1.7, color: "#64748b", padding: "12px 14px", borderRadius: 14, background: hexRgb(color, 0.05), borderLeft: `3px solid ${hexRgb(color, 0.5)}` }}>{profile.bio}</p>}
            </motion.div>
            <div style={{ height: 1, background: "rgba(0,0,0,0.06)", margin: "22px 0" }} />
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
              {primary.length > 0 && <div style={{ marginBottom: 10 }}><PrimaryCtAs links={primary} color={color} track={track} profile={profile} /></div>}
              <Actions profile={profile} track={track} color={color} dark={false} />
            </motion.div>
            {secondary.length > 0 && <div style={{ marginTop: 18 }}><SectionLabel text="Links & Socials" dark={false} /><div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{secondary.map((l, i) => <LinkRow key={l.l} {...l} index={i} onClick={() => track(l.ev)} dark={false} profile={profile} />)}</div></div>}
            <div style={{ marginTop: 22 }}><PortfolioSection profileId={profile.id} color={color} /></div>
          </div>
        </div>
        <PoweredBy color={color} dark={false} />
      </motion.div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// LAYOUT: NEON
// ────────────────────────────────────────────────────────────────────────────────
function LayoutNeon({ profile, track, mobile }) {
  const { primary, secondary, payments } = useLinks(profile);
  const color = profile.cover_color || "#00ff88";
  const r = btnRadius(profile.button_style || "pill");
  return (
    <div style={{ minHeight: "100vh", background: "#050505", display: "flex", justifyContent: "center", padding: mobile ? "0 0 48px" : "32px 16px 60px", position: "relative", overflow: "hidden", width: "100vw", boxSizing: "border-box" }}>
      <AnimatedOrb delay={0} style={{ top: "10%", left: "20%", width: 300, height: 300, background: `radial-gradient(circle, ${hexRgb(color,0.25)},transparent 70%)` }} />
      <AnimatedOrb delay={3} style={{ bottom: "10%", right: "10%", width: 250, height: 250, background: `radial-gradient(circle, ${hexRgb(color,0.15)},transparent 70%)` }} />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} style={{ width: "100%", maxWidth: mobile ? "100%" : 420, position: "relative", zIndex: 1 }}>
        <div style={{ borderRadius: mobile ? 0 : 28, border: `1px solid ${hexRgb(color,0.4)}`, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(24px)", boxShadow: `0 0 60px ${hexRgb(color,0.2)}, inset 0 1px 0 ${hexRgb(color,0.2)}`, overflow: "hidden" }}>
          <div style={{ padding: mobile ? "36px 16px 32px" : "40px 28px 36px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
              <Avatar profile={profile} size={mobile ? 88 : 110} ring floating />
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ textAlign: "center", marginTop: 14 }}>
                <h1 style={{ margin: "0 0 6px", fontSize: mobile ? 26 : 30, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px", textShadow: `0 0 20px ${hexRgb(color,0.6)}` }}>{profile.display_name}</h1>
                {profile.job_title && <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color }}>{profile.job_title}</p>}
                {profile.company_name && <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.35)" }}>{profile.company_name}</p>}
                {profile.bio && <p style={{ margin: "12px 0 0", fontSize: 13.5, lineHeight: 1.7, color: "rgba(255,255,255,0.5)", padding: "12px", borderRadius: 12, background: `${hexRgb(color,0.07)}`, border: `1px solid ${hexRgb(color,0.2)}` }}>{profile.bio}</p>}
              </motion.div>
            </div>
            <div style={{ height: 1, background: `${hexRgb(color,0.2)}`, marginBottom: 20 }} />
            <Actions profile={profile} track={track} color={color} dark />
            {secondary.length > 0 && <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8 }}>{secondary.map((l, i) => <LinkRow key={l.l} {...l} index={i} onClick={() => track(l.ev)} dark profile={profile} />)}</div>}
            <PortfolioSection profileId={profile.id} color={color} />
          </div>
        </div>
        <PoweredBy color={color} dark />
      </motion.div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// LAYOUT: AURORA
// ────────────────────────────────────────────────────────────────────────────────
function LayoutAurora({ profile, track, mobile }) {
  const { primary, secondary, payments } = useLinks(profile);
  const color = profile.cover_color || "#8b5cf6";
  const r = btnRadius(profile.button_style || "pill");
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)", display: "flex", justifyContent: "center", padding: mobile ? "0 0 48px" : "32px 16px 60px", position: "relative", overflow: "hidden", width: "100vw", boxSizing: "border-box" }}>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg,${color},#a855f7,#06b6d4)`, zIndex: 10 }} />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} style={{ width: "100%", maxWidth: mobile ? "100%" : 420, position: "relative", zIndex: 1 }}>
        <div style={{ borderRadius: mobile ? 0 : 28, background: "rgba(255,255,255,0.07)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)", overflow: "hidden" }}>
          <div style={{ padding: mobile ? "36px 16px 32px" : "40px 28px 36px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
              <Avatar profile={profile} size={mobile ? 88 : 110} ring floating />
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ textAlign: "center", marginTop: 14 }}>
                <h1 style={{ margin: "0 0 6px", fontSize: mobile ? 26 : 30, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>{profile.display_name}</h1>
                {profile.job_title && <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, background: `linear-gradient(90deg,${color},#06b6d4)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{profile.job_title}</p>}
                {profile.company_name && <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.35)" }}>{profile.company_name}</p>}
                {profile.bio && <p style={{ margin: "12px 0 0", fontSize: 13.5, lineHeight: 1.7, color: "rgba(255,255,255,0.5)" }}>{profile.bio}</p>}
              </motion.div>
            </div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.1)", marginBottom: 20 }} />
            <Actions profile={profile} track={track} color={color} dark />
            {secondary.length > 0 && <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8 }}>{secondary.map((l, i) => <LinkRow key={l.l} {...l} index={i} onClick={() => track(l.ev)} dark profile={profile} />)}</div>}
            <PortfolioSection profileId={profile.id} color={color} />
          </div>
        </div>
        <PoweredBy color={color} dark />
      </motion.div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// LAYOUT: PASTEL
// ────────────────────────────────────────────────────────────────────────────────
function LayoutPastel({ profile, track, mobile }) {
  const { primary, secondary, payments } = useLinks(profile);
  const color = profile.cover_color || "#ec4899";
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#fdf2f8,#eff6ff)", display: "flex", justifyContent: "center", padding: mobile ? "0 0 48px" : "32px 16px 60px", position: "relative", overflow: "hidden", width: "100vw", boxSizing: "border-box" }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} style={{ width: "100%", maxWidth: mobile ? "100%" : 420, position: "relative", zIndex: 1 }}>
        <div style={{ borderRadius: mobile ? 0 : 32, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,192,203,0.4)", overflow: "hidden", boxShadow: "0 20px 60px rgba(236,72,153,0.1), inset 0 1px 0 #fff" }}>
          <motion.div style={{ height: mobile ? 140 : 180, position: "relative", background: profile.cover_photo ? `url(${profile.cover_photo}) center/cover` : `linear-gradient(135deg,${hexRgb(color,0.4)},#f9a8d455)`, backgroundSize: "cover", backgroundPosition: "center" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.3) 1px,transparent 1px)", backgroundSize: "20px 20px", opacity: 0.5 }} />
          </motion.div>
          <div style={{ padding: mobile ? "0 18px 32px" : "0 28px 36px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: mobile ? -52 : -68, marginBottom: 20, position: "relative", zIndex: 10 }}>
              <div style={{ boxShadow: `0 12px 32px ${hexRgb(color,0.4)}, 0 0 0 6px white`, borderRadius: "50%" }}>
                <Avatar profile={profile} size={mobile ? 88 : 110} ring floating />
              </div>
            </div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ textAlign: "center", marginBottom: 20 }}>
              <h1 style={{ margin: "0 0 6px", fontSize: mobile ? 24 : 28, fontWeight: 900, color: "#1e1b4b", letterSpacing: "-0.5px" }}>{profile.display_name}</h1>
              {profile.job_title && <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, background: `linear-gradient(90deg,${color},#a855f7)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{profile.job_title}</p>}
              {profile.company_name && <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>{profile.company_name}</p>}
              {profile.bio && <p style={{ margin: "12px 0 0", fontSize: 13.5, lineHeight: 1.7, color: "#64748b", padding: "12px", borderRadius: 16, background: hexRgb(color, 0.06), border: `1px solid ${hexRgb(color, 0.15)}` }}>{profile.bio}</p>}
            </motion.div>
            <div style={{ height: 1, background: "rgba(0,0,0,0.06)", marginBottom: 18 }} />
            <Actions profile={profile} track={track} color={color} dark={false} />
            {secondary.length > 0 && <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8 }}>{secondary.map((l, i) => <LinkRow key={l.l} {...l} index={i} onClick={() => track(l.ev)} dark={false} profile={profile} />)}</div>}
            <PortfolioSection profileId={profile.id} color={color} />
          </div>
        </div>
        <PoweredBy color={color} dark={false} />
      </motion.div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// LAYOUT: CORPORATE
// ────────────────────────────────────────────────────────────────────────────────
function LayoutCorporate({ profile, track, mobile }) {
  const { primary, secondary, payments } = useLinks(profile);
  const color = profile.cover_color || "#2563eb";
  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", display: "flex", justifyContent: "center", padding: mobile ? "0 0 48px" : "32px 16px 60px", position: "relative", width: "100vw", boxSizing: "border-box" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ width: "100%", maxWidth: mobile ? "100%" : 420, position: "relative", zIndex: 1 }}>
        <div style={{ borderRadius: mobile ? 0 : 16, background: "#fff", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
          <div style={{ height: 6, background: `linear-gradient(90deg,${color},${color}88)` }} />
          <div style={{ padding: "24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 72, height: 72, borderRadius: 12, overflow: "hidden", border: "2px solid #e2e8f0", flexShrink: 0 }}>
              {profile.profile_photo
                ? <img src={profile.profile_photo} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                : <div style={{ width: "100%", height: "100%", background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 28 }}>{profile.display_name?.charAt(0) || "?"}</div>
              }
            </div>
            <div>
              <h1 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 900, color: "#0f172a" }}>{profile.display_name}</h1>
              {profile.job_title && <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color }}>{profile.job_title}</p>}
              {profile.company_name && <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>{profile.company_name}</p>}
            </div>
          </div>
          <div style={{ padding: "20px 24px 28px" }}>
            {profile.bio && <p style={{ margin: "0 0 18px", fontSize: 13.5, lineHeight: 1.7, color: "#64748b", padding: "12px", background: "#f8fafc", borderRadius: 8, borderLeft: `3px solid ${color}` }}>{profile.bio}</p>}
            <Actions profile={profile} track={track} color={color} dark={false} />
            {secondary.length > 0 && <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>{secondary.map((l, i) => <LinkRow key={l.l} {...l} index={i} onClick={() => track(l.ev)} dark={false} profile={profile} />)}</div>}
            <PortfolioSection profileId={profile.id} color={color} />
          </div>
        </div>
        <PoweredBy color={color} dark={false} />
      </motion.div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// LAYOUT: FLOATING
// ────────────────────────────────────────────────────────────────────────────────
function LayoutFloating({ profile, track, mobile }) {
  const { primary, secondary, payments } = useLinks(profile);
  const color = profile.cover_color || "#2563eb";
  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(circle at 50% 0%, ${hexRgb(color,0.12)},#f1f5f9 55%)`, display: "flex", justifyContent: "center", padding: mobile ? "32px 16px 64px" : "40px 16px 64px", position: "relative", overflow: "hidden", width: "100vw", boxSizing: "border-box" }}>
      <AmbientBg color={color} dark={false} />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} style={{ width: "100%", maxWidth: mobile ? "100%" : 420, position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ borderRadius: 28, background: "#fff", boxShadow: `0 24px 64px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.9)`, padding: "32px 24px", textAlign: "center" }}>
          <Avatar profile={profile} size={mobile ? 88 : 110} ring floating />
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ marginTop: 16 }}>
            <h1 style={{ margin: "0 0 6px", fontSize: mobile ? 26 : 30, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.5px" }}>{profile.display_name}</h1>
            {profile.job_title && <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, background: `linear-gradient(90deg,${color},${color}99)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{profile.job_title}</p>}
            {profile.company_name && <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>{profile.company_name}</p>}
            {profile.bio && <p style={{ margin: "12px 0 0", fontSize: 13.5, lineHeight: 1.7, color: "#64748b" }}>{profile.bio}</p>}
          </motion.div>
        </div>
        <div style={{ borderRadius: 24, background: "#fff", boxShadow: "0 12px 40px rgba(0,0,0,0.08)", padding: "20px 20px" }}>
          <Actions profile={profile} track={track} color={color} dark={false} />
          {secondary.length > 0 && <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>{secondary.map((l, i) => <LinkRow key={l.l} {...l} index={i} onClick={() => track(l.ev)} dark={false} profile={profile} />)}</div>}
        </div>
        <div style={{ borderRadius: 20, background: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.06)", padding: "16px 20px" }}>
          <PortfolioSection profileId={profile.id} color={color} />
        </div>
        <PoweredBy color={color} dark={false} />
      </motion.div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// LAYOUT: MAGAZINE
// ────────────────────────────────────────────────────────────────────────────────
function LayoutMagazine({ profile, track, mobile }) {
  const { primary, secondary, payments } = useLinks(profile);
  const color = profile.cover_color || "#2563eb";
  return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", justifyContent: "center", padding: mobile ? "0 0 48px" : "0 16px 60px", position: "relative", width: "100vw", boxSizing: "border-box" }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} style={{ width: "100%", maxWidth: mobile ? "100%" : 420, position: "relative", zIndex: 1 }}>
        {/* Hero cover */}
        <div style={{ height: mobile ? 200 : 260, position: "relative", background: profile.cover_photo ? `url(${profile.cover_photo}) center/cover` : `linear-gradient(135deg,${color},${color}77)`, backgroundSize: "cover", backgroundPosition: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.7))" }} />
          <div style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
            <h1 style={{ margin: "0 0 4px", fontSize: mobile ? 24 : 30, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>{profile.display_name}</h1>
            {profile.job_title && <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>{profile.job_title}</p>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, padding: "16px 20px 20px", borderBottom: "1px solid #f1f5f9", alignItems: "flex-end" }}>
          <div style={{ marginTop: -40, flexShrink: 0, boxShadow: "0 4px 20px rgba(0,0,0,0.2)", borderRadius: "50%", border: "4px solid #fff" }}>
            <Avatar profile={profile} size={72} ring={false} />
          </div>
          <div style={{ flex: 1, paddingBottom: 4 }}>
            {profile.company_name && <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color }}>{profile.company_name}</p>}
            {profile.bio && <p style={{ margin: 0, fontSize: 12.5, color: "#64748b", lineHeight: 1.6, WebkitLineClamp: 2, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}>{profile.bio}</p>}
          </div>
        </div>
        <div style={{ padding: "20px" }}>
          <Actions profile={profile} track={track} color={color} dark={false} />
          {secondary.length > 0 && <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>{secondary.map((l, i) => <LinkRow key={l.l} {...l} index={i} onClick={() => track(l.ev)} dark={false} profile={profile} />)}</div>}
          <PortfolioSection profileId={profile.id} color={color} />
        </div>
        <PoweredBy color={color} dark={false} />
      </motion.div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// LAYOUT: MINIMAL_DARK
// ────────────────────────────────────────────────────────────────────────────────
function LayoutMinimalDark({ profile, track, mobile }) {
  const { primary, secondary, payments } = useLinks(profile);
  const color = profile.cover_color || "#2563eb";
  return (
    <div style={{ minHeight: "100vh", background: "#18181b", display: "flex", justifyContent: "center", padding: mobile ? "0 0 48px" : "32px 16px 60px", position: "relative", width: "100vw", boxSizing: "border-box" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ width: "100%", maxWidth: mobile ? "100%" : 420, position: "relative", zIndex: 1 }}>
        <div style={{ borderRadius: mobile ? 0 : 24, background: "#27272a", border: "1px solid #3f3f46", overflow: "hidden" }}>
          <div style={{ padding: "28px 24px", borderBottom: "1px solid #3f3f46", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: 14, overflow: "hidden", border: `2px solid ${hexRgb(color,0.4)}`, flexShrink: 0 }}>
              {profile.profile_photo
                ? <img src={profile.profile_photo} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                : <div style={{ width: "100%", height: "100%", background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 26 }}>{profile.display_name?.charAt(0) || "?"}</div>
              }
            </div>
            <div>
              <h1 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 900, color: "#fff" }}>{profile.display_name}</h1>
              {profile.job_title && <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, color }}>{profile.job_title}</p>}
              {profile.company_name && <p style={{ margin: 0, fontSize: 11, color: "#71717a" }}>{profile.company_name}</p>}
            </div>
          </div>
          <div style={{ padding: "20px 24px 28px" }}>
            {profile.bio && <p style={{ margin: "0 0 18px", fontSize: 13, lineHeight: 1.7, color: "#a1a1aa" }}>{profile.bio}</p>}
            <Actions profile={profile} track={track} color={color} dark />
            {secondary.length > 0 && <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>{secondary.map((l, i) => <LinkRow key={l.l} {...l} index={i} onClick={() => track(l.ev)} dark profile={profile} />)}</div>}
            <PortfolioSection profileId={profile.id} color={color} />
          </div>
        </div>
        <PoweredBy color={color} dark />
      </motion.div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// LAYOUT: RETRO
// ────────────────────────────────────────────────────────────────────────────────
function LayoutRetro({ profile, track, mobile }) {
  const { primary, secondary, payments } = useLinks(profile);
  const color = profile.cover_color || "#2563eb";
  return (
    <div style={{ minHeight: "100vh", background: "#fffbeb", display: "flex", justifyContent: "center", padding: mobile ? "24px 16px 60px" : "40px 16px 60px", position: "relative", width: "100vw", boxSizing: "border-box" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ width: "100%", maxWidth: mobile ? "100%" : 420, position: "relative", zIndex: 1 }}>
        <div style={{ border: "4px solid #000", borderRadius: 4, background: "#fff", overflow: "hidden" }}>
          <div style={{ background: "#000", padding: "12px 16px", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
            <p style={{ margin: "0 0 0 8px", color: "#fff", fontSize: 11, fontWeight: 700, fontFamily: "monospace", opacity: 0.6 }}>{profile.username || "profile"}.nfc</p>
          </div>
          <div style={{ padding: "24px 20px 28px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
              <div style={{ border: "4px solid #000", borderRadius: "50%", padding: 2 }}>
                <Avatar profile={profile} size={mobile ? 80 : 100} ring={false} />
              </div>
              <h1 style={{ margin: "12px 0 4px", fontSize: mobile ? 22 : 26, fontWeight: 900, color: "#000", textAlign: "center", fontFamily: "monospace" }}>{profile.display_name}</h1>
              {profile.job_title && <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color, fontFamily: "monospace" }}>{profile.job_title}</p>}
              {profile.company_name && <p style={{ margin: 0, fontSize: 12, color: "#666", fontFamily: "monospace" }}>{profile.company_name}</p>}
            </div>
            <div style={{ height: 3, background: "#000", marginBottom: 18 }} />
            {profile.bio && <p style={{ margin: "0 0 16px", fontSize: 12.5, lineHeight: 1.7, color: "#444", fontFamily: "monospace", borderLeft: "3px solid #000", paddingLeft: 10 }}>{profile.bio}</p>}
            <Actions profile={profile} track={track} color={color} dark={false} />
            {secondary.length > 0 && <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>{secondary.map((l, i) => <LinkRow key={l.l} {...l} index={i} onClick={() => track(l.ev)} dark={false} profile={profile} />)}</div>}
          </div>
        </div>
        <PoweredBy color={color} dark={false} />
      </motion.div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
const LAYOUTS = {
  classic: LayoutClassic, minimal: LayoutMinimal, card: LayoutCard,
  dark: LayoutDark, bold: LayoutBold, split: LayoutSplit,
  glassmorphic: LayoutGlassmorphic, gradient: LayoutGradient,
  neon: LayoutNeon, aurora: LayoutAurora, pastel: LayoutPastel,
  corporate: LayoutCorporate, floating: LayoutFloating, magazine: LayoutMagazine,
  minimal_dark: LayoutMinimalDark, retro: LayoutRetro,
};

const DEMO_PROFILE = {
  id: "demo",
  username: "demo",
  display_name: "Amadou Diallo",
  job_title: "Digital Marketing Expert",
  company_name: "Bingoo Connect",
  bio: "Helping African businesses grow their digital presence. One tap to share everything.",
  cover_color: "#2563eb",
  layout: "classic",
  bg_style: "clean",
  button_style: "pill",
  phone: "+221 77 000 0000",
  whatsapp_number: "221770000000",
  email: "amadou@bingooconnect.com",
  website: "https://bingooconnect.com",
  instagram_url: "https://instagram.com",
  linkedin_url: "https://linkedin.com",
  location: "Dakar, Senegal",
  show_location: true,
  plan: "pro",
  is_active: true,
  booking_enabled: true,
};

export default function PublicProfile() {
  const { username } = useParams();
  const mobile = useIsMobile();
  const isDemo = username === "demo";

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["public-profile", username],
    queryFn: async () => {
      if (isDemo) return [DEMO_PROFILE];
      const res = await base44.functions.invoke('getPublicProfile', { username });
      return res.data?.profile ? [res.data.profile] : [];
    },
  });

  const profile = profiles[0];

  useEffect(() => {
    if (profile?.id && !isDemo) trackEvent(profile.id, "profile_view");
  }, [profile?.id]);

  if (isLoading) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f1f5f9", gap: 14 }}>
      <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
      <p style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>Loading profile…</p>
    </div>
  );

  if (!profile) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9", padding: 24 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 60, marginBottom: 18 }}>😕</div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", margin: "0 0 8px", letterSpacing: "-0.3px" }}>Profile not found</h2>
        <p style={{ color: "#64748b", fontSize: 14 }}>This link may be inactive or the username is incorrect.</p>
      </div>
    </div>
  );

  const track = (ev) => !isDemo && trackEvent(profile.id, ev);
  const Layout = LAYOUTS[profile.layout || "classic"] || LayoutClassic;
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <HomeButton />
      {isDemo && (
        <div style={{ background: "linear-gradient(135deg,#2d1b4e 0%,#1a0b3f 40%,#0a1428 80%,#0f0820 100%)", padding: "40px 16px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 80% 20%, rgba(139,92,246,0.15) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(6,182,212,0.1) 0%, transparent 50%)", pointerEvents: "none" }} />
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", margin: 0, position: "relative", zIndex: 1 }}>Live Demo — Tap to Experience</p>
          <div style={{ position: "relative", zIndex: 1 }}>
            <NFCTapMockup />
          </div>
          <p style={{ color: "rgba(255,255,255,0.22)", fontSize: 11, margin: 0, position: "relative", zIndex: 1 }}>NFC card taps phone · profile opens instantly</p>
        </div>
      )}
      <Layout profile={profile} track={track} mobile={mobile} />
    </motion.div>
  );
}