import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import RequestInfoModal from "@/components/bingoo/RequestInfoModal";
import AppointmentBooking from "@/components/bingoo/AppointmentBooking";
import PortfolioSection from "@/components/bingoo/PortfolioSection";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

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
});

// Button radius based on style
const btnRadius = (s) => s === "pill" ? "9999px" : s === "sharp" ? "8px" : "16px";

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ profile, size = 80, borderColor = "#fff", borderWidth = 4 }) {
  const style = { width: size, height: size, borderRadius: "50%", border: `${borderWidth}px solid ${borderColor}`, flexShrink: 0, objectFit: "cover", boxShadow: "0 8px 24px rgba(0,0,0,0.18)" };
  return profile.profile_photo
    ? <img src={profile.profile_photo} alt={profile.display_name} style={style} />
    : <div style={{ ...style, background: profile.cover_color || "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: size * 0.4 }}>
        {profile.display_name?.charAt(0) || "?"}
      </div>;
}

// ── Actions ───────────────────────────────────────────────────────────────────
function Actions({ profile, track, color, dark = false }) {
  const [infoOpen, setInfoOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const r = btnRadius(profile.button_style || "pill");
  const softBg = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)";
  const softBorder = dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <button onClick={() => { track("save_contact_click"); saveContact(profile); }}
        style={{ width: "100%", padding: "15px 20px", borderRadius: r, background: color, color: "#fff", fontWeight: 800, fontSize: 14, letterSpacing: "0.02em", border: "none", cursor: "pointer", boxShadow: `0 6px 20px ${color}50`, transition: "opacity 0.15s" }}
        onMouseOver={e => e.target.style.opacity = 0.88} onMouseOut={e => e.target.style.opacity = 1}>
        💾 &nbsp;Save Contact
      </button>
      <div style={{ display: "grid", gridTemplateColumns: profile.booking_enabled ? "1fr 1fr" : "1fr", gap: 10 }}>
        <button onClick={() => setInfoOpen(true)}
          style={{ padding: "13px 16px", borderRadius: r, background: "transparent", color, fontWeight: 700, fontSize: 13, border: `2px solid ${color}`, cursor: "pointer", transition: "background 0.15s" }}>
          📋 &nbsp;Request Info
        </button>
        {profile.booking_enabled && (
          <button onClick={() => setBookOpen(true)}
            style={{ padding: "13px 16px", borderRadius: r, background: softBg, color: dark ? "#fff" : "#374151", fontWeight: 700, fontSize: 13, border: `1px solid ${softBorder}`, cursor: "pointer" }}>
            📅 &nbsp;Book Meeting
          </button>
        )}
      </div>
      {infoOpen && <RequestInfoModal profileId={profile.id} onClose={() => setInfoOpen(false)} />}
      {bookOpen && <AppointmentBooking profile={profile} onClose={() => setBookOpen(false)} />}
    </div>
  );
}

// ── Link Row ──────────────────────────────────────────────────────────────────
function LinkRow({ e, l, h, onClick, dark, profile }) {
  const r = btnRadius(profile.button_style || "pill");
  return (
    <a href={h} target="_blank" rel="noopener noreferrer" onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 16px", borderRadius: r, background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)", border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.07)", textDecoration: "none", color: dark ? "rgba(255,255,255,0.85)" : "#374151", fontWeight: 600, fontSize: 14, transition: "background 0.15s" }}
      onMouseOver={ev => ev.currentTarget.style.background = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)"}
      onMouseOut={ev => ev.currentTarget.style.background = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)"}>
      <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>{e}</span>
      <span style={{ flex: 1 }}>{l}</span>
      <span style={{ opacity: 0.3, fontSize: 12 }}>›</span>
    </a>
  );
}

// ── Primary CTAs ──────────────────────────────────────────────────────────────
function PrimaryCtAs({ links, color, track, profile }) {
  if (!links.length) return null;
  const r = btnRadius(profile.button_style || "pill");
  const count = links.length;
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${count}, 1fr)`, gap: 10 }}>
      {links.map(l => (
        <a key={l.l} href={l.h} target="_blank" rel="noopener noreferrer" onClick={() => track(l.ev)}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "14px 8px", borderRadius: r, background: color, color: "#fff", fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", textDecoration: "none", boxShadow: `0 4px 14px ${color}40` }}>
          <span style={{ fontSize: 22 }}>{l.e}</span>{l.l}
        </a>
      ))}
    </div>
  );
}

// ── Page backgrounds ──────────────────────────────────────────────────────────
const pageBg = (profile) => {
  const c = profile.cover_color || "#2563eb";
  switch (profile.bg_style) {
    case "gradient": return `linear-gradient(150deg, ${c}22 0%, #f0f4ff 50%, #faf5ff 100%)`;
    case "mesh":     return `radial-gradient(at 20% 30%, ${c}18 0px, transparent 50%), radial-gradient(at 80% 70%, #8b5cf618 0px, transparent 50%), #f8fafc`;
    case "night":    return "linear-gradient(160deg, #0a0c1a 0%, #0f1022 100%)";
    default:         return "#f8fafc";
  }
};
const isNight = (p) => p.bg_style === "night";

// ── Powered by ────────────────────────────────────────────────────────────────
const PoweredBy = ({ color, dark }) => (
  <p style={{ textAlign: "center", fontSize: 11, color: dark ? "rgba(255,255,255,0.2)" : "#94a3b8", marginTop: 20 }}>
    Powered by <a href="/" style={{ fontWeight: 700, color: dark ? "rgba(255,255,255,0.35)" : color, textDecoration: "none" }}>Bingoo Connect</a>
  </p>
);

// ────────────────────────────────────────────────────────────────────────────
// LAYOUT: CLASSIC — floating avatar, clean premium card
// ────────────────────────────────────────────────────────────────────────────
function LayoutClassic({ profile, track }) {
  const { primary, secondary } = useLinks(profile);
  const color = profile.cover_color || "#2563eb";
  const night = isNight(profile);
  const cardBg = night ? "rgba(255,255,255,0.05)" : "#ffffff";
  const cardBorder = night ? "1px solid rgba(255,255,255,0.1)" : "none";
  const headColor = night ? "#fff" : "#0f172a";
  const subColor = night ? "rgba(255,255,255,0.45)" : "#64748b";
  const bioColor = night ? "rgba(255,255,255,0.55)" : "#64748b";

  return (
    <div style={{ minHeight: "100vh", background: pageBg(profile), display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "32px 16px 48px" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ borderRadius: 28, background: cardBg, border: cardBorder, overflow: "hidden", boxShadow: night ? `0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px ${color}30` : `0 2px 6px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.08)` }}>

          {/* Cover banner */}
          <div style={{ height: 140, position: "relative", background: `linear-gradient(135deg, ${color} 0%, ${color}bb 100%)`, overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 75% 25%, rgba(255,255,255,0.18), transparent 55%)" }} />
            <div style={{ position: "absolute", bottom: -30, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
            <div style={{ position: "absolute", top: 16, right: 24, width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.12)" }} />
            {profile.company_logo && (
              <img src={profile.company_logo} alt="Logo" style={{ position: "absolute", top: 16, left: 20, height: 32, objectFit: "contain", opacity: 0.85, filter: "brightness(0) invert(1)" }} />
            )}
          </div>

          {/* Body — avatar floats above with negative margin, NO overflow-hidden here */}
          <div style={{ padding: "0 24px 32px" }}>
            {/* Avatar row — floated out of the cover cleanly */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: -48, marginBottom: 16 }}>
              <Avatar profile={profile} size={96} borderColor={night ? "#0f1022" : "#fff"} borderWidth={4} />
              {profile.plan !== "free" && (
                <span style={{ marginBottom: 8, fontSize: 10, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", padding: "5px 12px", borderRadius: 999, background: color, color: "#fff" }}>PRO</span>
              )}
            </div>

            {/* Identity */}
            <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 900, color: headColor, lineHeight: 1.2 }}>{profile.display_name}</h1>
            {profile.job_title && <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color }}>{profile.job_title}</p>}
            {profile.company_name && <p style={{ margin: 0, fontSize: 13, color: subColor, fontWeight: 500 }}>{profile.company_name}</p>}
            {profile.bio && (
              <p style={{ margin: "12px 0 0", fontSize: 13, lineHeight: 1.65, color: bioColor, borderLeft: `3px solid ${color}50`, paddingLeft: 12 }}>{profile.bio}</p>
            )}

            <div style={{ height: 1, background: night ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", margin: "20px 0" }} />

            {/* CTAs */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <PrimaryCtAs links={primary} color={color} track={track} profile={profile} />
              <Actions profile={profile} track={track} color={color} dark={night} />
            </div>

            {/* Secondary links */}
            {secondary.length > 0 && (
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: night ? "rgba(255,255,255,0.2)" : "#94a3b8", margin: "0 0 4px 4px" }}>More</p>
                {secondary.map(l => <LinkRow key={l.l} {...l} onClick={() => track(l.ev)} dark={night} profile={profile} />)}
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              <PortfolioSection profileId={profile.id} color={color} />
            </div>
          </div>
        </div>
        <PoweredBy color={color} dark={night} />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// LAYOUT: MINIMAL — centered avatar, no cover, ultra-clean
// ────────────────────────────────────────────────────────────────────────────
function LayoutMinimal({ profile, track }) {
  const { primary, secondary } = useLinks(profile);
  const color = profile.cover_color || "#2563eb";
  const night = isNight(profile);
  const headColor = night ? "#fff" : "#0f172a";
  const subColor = night ? "rgba(255,255,255,0.45)" : "#64748b";
  const cardBg = night ? "rgba(255,255,255,0.04)" : "#ffffff";
  const cardBorder = night ? "1px solid rgba(255,255,255,0.09)" : "1px solid rgba(0,0,0,0.07)";

  return (
    <div style={{ minHeight: "100vh", background: pageBg(profile), display: "flex", justifyContent: "center", padding: "40px 16px 60px" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ borderRadius: 28, background: cardBg, border: cardBorder, padding: "36px 28px 32px", boxShadow: night ? "0 32px 80px rgba(0,0,0,0.5)" : "0 4px 40px rgba(0,0,0,0.08)" }}>
          {/* Colored dot accent */}
          <div style={{ width: 40, height: 4, borderRadius: 999, background: color, marginBottom: 24 }} />

          {/* Avatar + info */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <Avatar profile={profile} size={72} borderColor={color} borderWidth={3} />
            <div>
              <h1 style={{ margin: "0 0 3px", fontSize: 20, fontWeight: 900, color: headColor, lineHeight: 1.2 }}>{profile.display_name}</h1>
              {profile.job_title && <p style={{ margin: "0 0 1px", fontSize: 13, fontWeight: 700, color }}>{profile.job_title}</p>}
              {profile.company_name && <p style={{ margin: 0, fontSize: 12, color: subColor }}>{profile.company_name}</p>}
            </div>
          </div>

          {profile.bio && <p style={{ margin: "0 0 20px", fontSize: 13, lineHeight: 1.65, color: subColor }}>{profile.bio}</p>}

          <div style={{ height: 1, background: night ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", marginBottom: 20 }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <PrimaryCtAs links={primary} color={color} track={track} profile={profile} />
            <Actions profile={profile} track={track} color={color} dark={night} />
          </div>

          {secondary.length > 0 && (
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              {secondary.map(l => <LinkRow key={l.l} {...l} onClick={() => track(l.ev)} dark={night} profile={profile} />)}
            </div>
          )}
          <div style={{ marginTop: 20 }}><PortfolioSection profileId={profile.id} color={color} /></div>
        </div>
        <PoweredBy color={color} dark={night} />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// LAYOUT: DARK — glassmorphism, always dark
// ────────────────────────────────────────────────────────────────────────────
function LayoutDark({ profile, track }) {
  const { primary, secondary } = useLinks(profile);
  const color = profile.cover_color || "#2563eb";

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#060812 0%,#0e1020 100%)", display: "flex", justifyContent: "center", padding: "32px 16px 56px" }}>
      {/* Ambient glow */}
      <div style={{ position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", width: 600, height: 300, background: `radial-gradient(ellipse at 50% 0%,${color}40,transparent 70%)`, pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 400, position: "relative" }}>
        <div style={{ borderRadius: 28, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(30px)", boxShadow: `0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12)`, overflow: "hidden" }}>

          {/* Top accent gradient band */}
          <div style={{ height: 6, background: `linear-gradient(90deg,${color},${color}80)` }} />

          <div style={{ padding: "32px 24px 32px" }}>
            {/* Avatar + info — no cover to overlap, clean layout */}
            <div style={{ display: "flex", gap: 16, marginBottom: 24, alignItems: "center" }}>
              <Avatar profile={profile} size={80} borderColor="rgba(255,255,255,0.15)" borderWidth={2} />
              <div style={{ flex: 1 }}>
                <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 900, color: "#fff" }}>{profile.display_name}</h1>
                {profile.job_title && <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color }}>{profile.job_title}</p>}
                {profile.company_name && <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>{profile.company_name}</p>}
              </div>
            </div>

            {profile.bio && <p style={{ margin: "0 0 24px", fontSize: 13, lineHeight: 1.65, color: "rgba(255,255,255,0.5)" }}>{profile.bio}</p>}

            <div style={{ height: 1, background: "rgba(255,255,255,0.07)", marginBottom: 20 }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <PrimaryCtAs links={primary} color={color} track={track} profile={profile} />
              <Actions profile={profile} track={track} color={color} dark />
            </div>

            {secondary.length > 0 && (
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.2)", margin: "0 0 4px" }}>More</p>
                {secondary.map(l => <LinkRow key={l.l} {...l} onClick={() => track(l.ev)} dark profile={profile} />)}
              </div>
            )}
            <div style={{ marginTop: 20 }}><PortfolioSection profileId={profile.id} color={color} /></div>
          </div>
        </div>
        <PoweredBy color={color} dark />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// LAYOUT: BOLD — full gradient cover, bold typography
// ────────────────────────────────────────────────────────────────────────────
function LayoutBold({ profile, track }) {
  const { primary, secondary } = useLinks(profile);
  const color = profile.cover_color || "#2563eb";

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(150deg,${color} 0%,${color}90 35%,#f8fafc 100%)`, display: "flex", justifyContent: "center", padding: "0 16px 56px" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Hero section */}
        <div style={{ padding: "48px 0 32px", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <Avatar profile={profile} size={100} borderColor="rgba(255,255,255,0.5)" borderWidth={4} />
          </div>
          <h1 style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 900, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>{profile.display_name}</h1>
          {profile.job_title && <p style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>{profile.job_title}</p>}
          {profile.company_name && <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.55)" }}>{profile.company_name}</p>}
          {profile.bio && <p style={{ margin: "14px auto 0", fontSize: 13, lineHeight: 1.65, color: "rgba(255,255,255,0.65)", maxWidth: 300 }}>{profile.bio}</p>}
        </div>

        {/* Action card */}
        <div style={{ borderRadius: 28, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.25)", padding: "24px 20px", marginBottom: 12, boxShadow: "0 16px 48px rgba(0,0,0,0.15)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <PrimaryCtAs links={primary} color={color} track={track} profile={profile} />
            <Actions profile={profile} track={track} color={color} dark />
            {secondary.map(l => (
              <a key={l.l} href={l.h} target="_blank" rel="noopener noreferrer" onClick={() => track(l.ev)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderRadius: btnRadius(profile.button_style || "pill"), background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
                <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>{l.e}</span>{l.l}
              </a>
            ))}
          </div>
        </div>
        <div style={{ borderRadius: 24, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.15)", padding: 16, marginBottom: 16 }}>
          <PortfolioSection profileId={profile.id} color="#fff" />
        </div>
        <PoweredBy color={color} dark />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// LAYOUT: SPLIT — vertical accent bar, side-by-side header
// ────────────────────────────────────────────────────────────────────────────
function LayoutSplit({ profile, track }) {
  const { primary, secondary } = useLinks(profile);
  const color = profile.cover_color || "#2563eb";
  const night = isNight(profile);
  const cardBg = night ? "rgba(255,255,255,0.05)" : "#fff";
  const headColor = night ? "#fff" : "#0f172a";
  const subColor = night ? "rgba(255,255,255,0.4)" : "#64748b";

  return (
    <div style={{ minHeight: "100vh", background: pageBg(profile), display: "flex", justifyContent: "center", padding: "32px 16px 56px" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ borderRadius: 28, background: cardBg, border: night ? "1px solid rgba(255,255,255,0.09)" : "none", overflow: "hidden", boxShadow: night ? "0 32px 80px rgba(0,0,0,0.5)" : "0 4px 40px rgba(0,0,0,0.09)", display: "flex" }}>
          {/* Accent bar */}
          <div style={{ width: 6, flexShrink: 0, background: `linear-gradient(180deg,${color} 0%,${color}60 100%)` }} />

          {/* Content */}
          <div style={{ flex: 1, padding: "28px 22px 32px" }}>
            {/* Header */}
            <div style={{ display: "flex", gap: 14, marginBottom: 20, alignItems: "center" }}>
              <Avatar profile={profile} size={72} borderColor={color} borderWidth={3} />
              <div>
                <h1 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 900, color: headColor, lineHeight: 1.2 }}>{profile.display_name}</h1>
                {profile.job_title && <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color }}>{profile.job_title}</p>}
                {profile.company_name && <p style={{ margin: 0, fontSize: 12, color: subColor }}>{profile.company_name}</p>}
              </div>
            </div>

            {profile.bio && <p style={{ margin: "0 0 20px", fontSize: 13, lineHeight: 1.65, color: subColor }}>{profile.bio}</p>}

            <div style={{ height: 1, background: night ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", marginBottom: 20 }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <PrimaryCtAs links={primary} color={color} track={track} profile={profile} />
              <Actions profile={profile} track={track} color={color} dark={night} />
            </div>

            {secondary.length > 0 && (
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                {secondary.map(l => <LinkRow key={l.l} {...l} onClick={() => track(l.ev)} dark={night} profile={profile} />)}
              </div>
            )}
            <div style={{ marginTop: 20 }}><PortfolioSection profileId={profile.id} color={color} /></div>
          </div>
        </div>
        <PoweredBy color={color} dark={night} />
      </div>
    </div>
  );
}

// ── Home Button ──────────────────────────────────────────────────────────────
function HomeButton() {
  return (
    <a href="/"
      style={{ position: "fixed", top: 16, left: 16, zIndex: 100, display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 999, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", boxShadow: "0 2px 12px rgba(0,0,0,0.12)", color: "#374151", fontWeight: 700, fontSize: 13, textDecoration: "none", border: "1px solid rgba(0,0,0,0.08)" }}>
      ← Home
    </a>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
const LAYOUTS = { classic: LayoutClassic, minimal: LayoutMinimal, dark: LayoutDark, bold: LayoutBold, split: LayoutSplit };

export default function PublicProfile() {
  const { username } = useParams();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["public-profile", username],
    queryFn: () => base44.entities.Profile.filter({ username }),
  });

  const profile = profiles[0];

  useEffect(() => {
    if (profile?.id) trackEvent(profile.id, "profile_view");
  }, [profile?.id]);

  if (isLoading) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8fafc", gap: 12 }}>
      <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
      <p style={{ color: "#94a3b8", fontSize: 13, fontWeight: 500 }}>Loading profile…</p>
    </div>
  );

  if (!profile) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: 24 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>😕</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>Profile not found</h2>
        <p style={{ color: "#64748b", fontSize: 14 }}>This link may be inactive or the username is incorrect.</p>
      </div>
    </div>
  );

  const track = (ev) => trackEvent(profile.id, ev);
  const Layout = LAYOUTS[profile.layout || "classic"] || LayoutClassic;
  return <><HomeButton /><Layout profile={profile} track={track} /></>;
}