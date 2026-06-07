import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import AppointmentBooking from "@/components/bingoo/AppointmentBooking";
import PortfolioSection from "@/components/bingoo/PortfolioSection";
import ProfileResumeSection from "@/components/bingoo/ProfileResumeSection";
import ZelleQRModal from "@/components/bingoo/ZelleQRModal";
import LeadCaptureSection from "@/components/bingoo/LeadCaptureSection";
import ProspectPopup from "@/components/bingoo/ProspectPopup";
import SaveProfileButton from "@/components/bingoo/SaveProfileButton";
import ReportAbuseButton from "@/components/bingoo/ReportAbuseButton";
import SalonServicesSection from "@/components/bingoo/SalonServicesSection";
import PublicFooter from "@/components/bingoo/PublicFooter";
import ProfileLayoutShell from "@/components/bingoo/ProfileLayoutShell";
import {
  InstagramIcon, FacebookIcon, TikTokIcon, LinkedInIcon, YouTubeIcon,
  XIcon, WhatsAppIcon, SnapchatIcon, WebsiteIcon, MapPinIcon,
  SaveContactIcon, ShareIcon, CalendarSvgIcon, EmailSvgIcon, PhoneIcon
} from "@/components/bingoo/SocialIcons";

// ── Brand palette
const B = { navy: "#0B2E6B", orange: "#FF7A00", gold: "#FDBA21", teal: "#0D9488" };

// ── Analytics
const trackEvent = (profileId, eventType) => {
  base44.entities.Analytics.create({
    profile_id: profileId, event_type: eventType,
    visitor_device: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
    created_at: new Date().toISOString(),
  }).catch(() => {});
};

// ── Save contact VCF
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

const hexRgb = (hex, alpha = 1) => {
  if (!hex || hex.length < 7) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const btnRadius = (s) => s === "pill" ? "9999px" : s === "sharp" ? "10px" : "18px";

// ── Animated orb
function Orb({ style, delay = 0 }) {
  return (
    <motion.div style={{ position: "absolute", borderRadius: "50%", pointerEvents: "none", zIndex: 0, ...style }}
      animate={{ y: [0, -16, 0], scale: [1, 1.04, 1] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

// ── Avatar
function Avatar({ profile, color }) {
  return (
    <motion.div
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      style={{ display: "inline-block" }}
    >
      <div style={{ padding: 4, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.6)})`, borderRadius: "50%", boxShadow: `0 0 0 6px rgba(255,255,255,0.9), 0 16px 48px ${hexRgb(color, 0.4)}` }}>
        {profile.profile_photo
          ? <img src={profile.profile_photo} alt={profile.display_name} style={{ width: 110, height: 110, borderRadius: "50%", objectFit: "cover", display: "block" }} />
          : <div style={{ width: 110, height: 110, borderRadius: "50%", background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.7)})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 44 }}>
              {profile.display_name?.charAt(0) || "?"}
            </div>
        }
      </div>
    </motion.div>
  );
}

// ── Primary action button
function ActionBtn({ icon, label, color, bg, href, onClick, delay = 0 }) {
  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.04, y: -3 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 8, padding: "18px 10px", borderRadius: 20, background: bg || color,
        color: "#fff", fontWeight: 800, fontSize: 11.5, textTransform: "uppercase",
        letterSpacing: "0.06em", cursor: "pointer", textDecoration: "none",
        boxShadow: `0 12px 32px ${hexRgb(color, 0.4)}`,
        border: "1px solid rgba(255,255,255,0.2)",
        minHeight: 88,
      }}
    >
      {icon}
      <span>{label}</span>
    </motion.div>
  );
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>{inner}</a>;
  return inner;
}

// ── Social icon button
function SocialBtn({ IconComp, href, label, onClick, delay = 0 }) {
  if (!href) return null;
  return (
    <motion.a
      href={href} target="_blank" rel="noopener noreferrer"
      title={label}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.15, y: -4 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
        textDecoration: "none",
      }}
    >
      <div style={{ width: 52, height: 52, borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", background: "#fff" }}>
        <IconComp size={52} />
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b", letterSpacing: "0.02em" }}>{label}</span>
    </motion.a>
  );
}

// ── Payment button
function PaymentBtn({ p, i, color }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <motion.button
        type="button" onClick={() => setOpen(true)}
        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 + i * 0.07, duration: 0.4 }}
        whileHover={{ scale: 1.1, y: -3 }}
        whileTap={{ scale: 0.95 }}
        style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          padding: "14px 10px", borderRadius: 18, cursor: "pointer",
          background: `linear-gradient(135deg, ${hexRgb(color, 0.1)}, ${hexRgb(color, 0.05)})`,
          border: `1.5px solid ${hexRgb(color, 0.2)}`, color, fontWeight: 800, fontSize: 10,
          textTransform: "uppercase", letterSpacing: "0.05em", minHeight: 76,
        }}
      >
        <span style={{ fontSize: 22 }}>{p.e}</span>
        <span style={{ lineHeight: 1.2, textAlign: "center" }}>{p.l}{p.qr ? " 🔲" : ""}</span>
      </motion.button>
      <AnimatePresence>
        {open && <ZelleQRModal qrUrl={p.qr} link={p.h} label={p.l} emoji={p.e} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

// ── Section header
function SectionHead({ emoji, title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <span style={{ fontSize: 18 }}>{emoji}</span>
      <span style={{ fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#94a3b8" }}>{title}</span>
    </div>
  );
}

// ── Divider
const Divider = () => <div style={{ height: 1, background: "rgba(0,0,0,0.05)", margin: "28px 0" }} />;

// ── Demo profile
const DEMO_PROFILE = {
  id: "demo", username: "demo", display_name: "Amadou Diallo",
  job_title: "Digital Marketing Expert", company_name: "Bingoo Connect",
  bio: "Helping African businesses grow their digital presence. One tap to share everything.",
  cover_color: "#0B2E6B", layout: "classic", bg_style: "clean", button_style: "pill",
  phone: "+221 77 000 0000", whatsapp_number: "221770000000",
  email: "amadou@bingooconnect.com", website: "https://bingooconnect.com",
  instagram_url: "https://instagram.com", linkedin_url: "https://linkedin.com",
  location: "Dakar, Senegal", show_location: true, plan: "pro", is_active: true,
  booking_enabled: true,
};

// ── Main component
export default function PublicProfile() {
  const { username } = useParams();
  const mobile = useIsMobile();
  const isDemo = username === "demo";
  const urlParams = new URLSearchParams(window.location.search);
  const deviceCodeParam = urlParams.get("device") || urlParams.get("d") || null;
  const topRef = useRef(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["public-profile", username],
    queryFn: async () => {
      if (isDemo) return [DEMO_PROFILE];
      const res = await base44.functions.invoke("getPublicProfile", { username });
      return res.data?.profile ? [res.data.profile] : [];
    },
  });

  const profile = profiles[0];

  useEffect(() => {
    if (profile?.id && !isDemo) trackEvent(profile.id, "profile_view");
  }, [profile?.id]);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: profile.display_name, url: window.location.href }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(window.location.href).catch(() => {});
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  if (isLoading) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8fafc", gap: 16 }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        style={{ width: 40, height: 40, borderRadius: "50%", border: `3px solid ${B.navy}20`, borderTopColor: B.navy }} />
      <p style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>Loading profile…</p>
    </div>
  );

  if (!profile) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: 24 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>😕</div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", margin: "0 0 8px" }}>Profile not found</h2>
        <p style={{ color: "#64748b", fontSize: 14 }}>This link may be inactive.</p>
        <a href="/" style={{ display: "inline-block", marginTop: 20, padding: "12px 28px", borderRadius: 999, background: B.navy, color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>← Go Home</a>
      </div>
    </div>
  );

  const color = profile.cover_color || B.navy;
  const r = btnRadius(profile.button_style || "pill");
  const track = (ev) => !isDemo && trackEvent(profile.id, ev);

  // Build link lists
  const canBook = profile.booking_enabled && ["pro", "professional", "business", "corporate", "salon", "restaurant", "lawfirm"].includes(profile.plan);

  const isSalonOrRestaurant = ["salon", "restaurant"].includes(profile.plan);
  const waBookingHref = profile.whatsapp_number
    ? `https://wa.me/${(profile.whatsapp_number || "").replace(/\D/g, "")}${profile.whatsapp_booking_message ? `?text=${encodeURIComponent(profile.whatsapp_booking_message)}` : ""}`
    : null;

  const primaryLinks = [
    profile.phone && { label: "Call", color: "#16a34a", bg: "linear-gradient(135deg,#16a34a,#15803d)", href: `tel:${profile.phone}`, icon: <PhoneIcon size={24} />, ev: "phone_click" },
    // Salon/Restaurant: show WhatsApp Booking as primary action when whatsapp_booking_message set
    isSalonOrRestaurant && waBookingHref
      ? { label: "Book via WA", color: "#25D366", bg: "linear-gradient(135deg,#25D366,#128C7E)", href: waBookingHref, icon: <WhatsAppIcon size={24} />, ev: "whatsapp_click" }
      : profile.whatsapp_number && { label: "WhatsApp", color: "#25D366", bg: "linear-gradient(135deg,#25D366,#128C7E)", href: `https://wa.me/${(profile.whatsapp_number||"").replace(/\D/g,"")}`, icon: <WhatsAppIcon size={24} />, ev: "whatsapp_click" },
    profile.email && { label: "Email", color: "#6366f1", bg: "linear-gradient(135deg,#6366f1,#4f46e5)", href: `mailto:${profile.email}`, icon: <EmailSvgIcon size={24} />, ev: "email_click" },
    canBook && { label: "Book", color: color, bg: `linear-gradient(135deg,${color},${hexRgb(color,0.8)})`, href: null, onClick: () => setBookOpen(true), icon: <CalendarSvgIcon size={24} />, ev: null },
  ].filter(Boolean);

  const socialLinks = [
    profile.instagram_url && { Icon: InstagramIcon, href: profile.instagram_url, label: "Instagram", ev: "instagram_click" },
    profile.facebook_url && { Icon: FacebookIcon, href: profile.facebook_url, label: "Facebook", ev: "facebook_click" },
    profile.tiktok_url && { Icon: TikTokIcon, href: profile.tiktok_url, label: "TikTok", ev: "tiktok_click" },
    profile.linkedin_url && { Icon: LinkedInIcon, href: profile.linkedin_url, label: "LinkedIn", ev: "linkedin_click" },
    profile.youtube_url && { Icon: YouTubeIcon, href: profile.youtube_url, label: "YouTube", ev: "youtube_click" },
  ].filter(Boolean);

  const payments = [
    (profile.zelle_qr || profile.zelle_link) && { e: "💳", l: "Zelle", h: profile.zelle_link || null, qr: profile.zelle_qr || null },
    profile.cashapp_link && { e: "💰", l: "Cash App", h: profile.cashapp_link, qr: null },
    profile.orangemoney_link && { e: "🟠", l: "Orange Money", h: profile.orangemoney_link, qr: null },
    (profile.wave_qr || profile.wave_link) && { e: "📲", l: "Wave", h: profile.wave_link || null, qr: profile.wave_qr || null },
    ...((profile.custom_payments || []).filter(c => c.label && (c.link || c.qr)).map(c => ({ e: c.emoji || "💵", l: c.label, h: c.link || null, qr: c.qr || null }))),
  ].filter(Boolean);

  const darkLayouts = ["dark", "neon", "aurora", "minimal_dark", "luxury", "cyberpunk", "forest", "ocean"];
  const isDark = profile.bg_style === "night" || darkLayouts.includes(profile.layout);

  return (
    <div ref={topRef} style={{ position: "relative", overflowX: "hidden" }}>

      {/* Back button */}
      <motion.button
        onClick={() => {
          if (window.history.length > 1) {
            window.history.back();
          } else {
            window.location.href = "/bingoo";
          }
        }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.05 }}
        style={{ position: "fixed", top: 16, left: 16, zIndex: 100, display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 999, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(16px)", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.06)", color: "#374151", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
      >
        ← Back
      </motion.button>

      {/* Main card */}
      <ProfileLayoutShell profile={profile} color={color} isDark={isDark}>
        {/* ── COVER + HEADER ── */}
        <div style={{ position: "relative", borderRadius: mobile ? 0 : "28px 28px 0 0", overflow: "hidden" }}>
          {/* Cover image / gradient */}
          <div style={{
            height: mobile ? 160 : 190,
            position: "relative",
            background: `linear-gradient(135deg, ${color} 0%, ${hexRgb(color, 0.7)} 50%, ${B.navy} 100%)`,
            overflow: "hidden",
          }}>
            {/* Cover photo — full bleed */}
            {profile.cover_photo && (
              <img src={profile.cover_photo} alt="Cover"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
              />
            )}
            {/* Pattern overlay when no cover photo */}
            {!profile.cover_photo && (
              <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.1) 1px,transparent 1px)", backgroundSize: "22px 22px", opacity: 0.5 }} />
            )}
            {/* Bottom gradient */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.25))" }} />

            {/* Pro badge */}
            {profile.plan !== "free" && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, type: "spring" }}
                style={{ position: "absolute", top: 16, right: 16, display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 999, background: `linear-gradient(135deg, ${B.gold}, ${B.orange})`, color: "#fff", fontSize: 10, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", boxShadow: "0 4px 12px rgba(253,186,33,0.5)" }}
              >
                ✦ VERIFIED PRO
              </motion.div>
            )}
          </div>

          {/* Card body — transparent so the shell background shows */}
          <div style={{ overflow: "visible" }}>

              {/* Avatar section */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: -50, paddingTop: 0, position: "relative", zIndex: 10, paddingBottom: 0 }}>
                <div style={{ padding: mobile ? "0 20px" : "0 32px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Avatar profile={profile} color={color} />

                  <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} style={{ textAlign: "center", marginTop: 16, paddingBottom: 4 }}>
                    <h1 style={{ margin: "0 0 6px", fontSize: mobile ? 28 : 32, fontWeight: 950, color: isDark ? "#fff" : "#0f172a", lineHeight: 1.1, letterSpacing: "-0.8px" }}>
                      {profile.display_name}
                    </h1>
                    {profile.job_title && (
                      <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 750, background: `linear-gradient(90deg, ${color}, ${hexRgb(color, 0.7)})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "0.02em" }}>
                        {profile.job_title}
                      </p>
                    )}
                    {profile.company_name && (
                      <p style={{ margin: "0 0 10px", fontSize: 13.5, color: isDark ? "rgba(255,255,255,0.4)" : "#64748b", fontWeight: 600 }}>
                        {profile.company_name}
                      </p>
                    )}
                    {profile.bio && (
                      <p style={{ margin: "0 0 4px", fontSize: 14, lineHeight: 1.75, color: isDark ? "rgba(255,255,255,0.55)" : "#64748b", padding: "12px 16px", borderRadius: 16, background: isDark ? "rgba(255,255,255,0.05)" : hexRgb(color, 0.05), border: isDark ? "1px solid rgba(255,255,255,0.08)" : `1px solid ${hexRgb(color, 0.12)}`, maxWidth: 340, textAlign: "left", fontWeight: 500 }}>
                        {profile.bio}
                      </p>
                    )}
                  </motion.div>
                </div>
              </div>

              {/* ── CONTENT AREA ── */}
              <div style={{ padding: mobile ? "24px 20px 32px" : "24px 32px 40px" }}>

                {/* Save + Share row */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                  style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
                  <motion.button
                    onClick={() => { track("save_contact_click"); saveContact(profile); }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 16px", borderRadius: r, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.85)})`, color: "#fff", fontWeight: 800, fontSize: 13.5, border: "none", cursor: "pointer", boxShadow: `0 10px 28px ${hexRgb(color, 0.45)}` }}
                  >
                    <SaveContactIcon size={18} /> Save Contact
                  </motion.button>
                  <SaveProfileButton profile={profile} color={color} source={deviceCodeParam ? "nfc_scan" : "manual"} />
                  <motion.button
                    onClick={handleShare}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 16px", borderRadius: r, background: isDark ? "rgba(255,255,255,0.1)" : hexRgb(color, 0.08), color: isDark ? "#fff" : color, fontWeight: 800, fontSize: 13.5, border: `1.5px solid ${isDark ? "rgba(255,255,255,0.15)" : hexRgb(color, 0.25)}`, cursor: "pointer" }}
                  >
                    <ShareIcon size={18} color={isDark ? "#fff" : color} />
                    {shared ? "Copied!" : "Share"}
                  </motion.button>
                </motion.div>

                {/* Primary action buttons */}
                {primaryLinks.length > 0 && (
                  <div style={{ marginBottom: 28 }}>
                    <SectionHead emoji="⚡" title="Contact" />
                    <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(primaryLinks.length, 4)}, 1fr)`, gap: 10 }}>
                      {primaryLinks.map((l, i) => (
                        <ActionBtn key={l.label} icon={l.icon} label={l.label} color={l.color} bg={l.bg} href={l.href} onClick={l.onClick ? () => { track(l.ev); l.onClick(); } : undefined} delay={0.4 + i * 0.08} />
                      ))}
                    </div>
                  </div>
                )}

                <Divider />

                {/* Social icons */}
                {socialLinks.length > 0 && (
                  <div style={{ marginBottom: 28 }}>
                    <SectionHead emoji="🌐" title="Social Media" />
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: socialLinks.length <= 4 ? "flex-start" : "space-between" }}>
                      {socialLinks.map(({ Icon, href, label, ev }, i) => (
                        <SocialBtn key={label} IconComp={Icon} href={href} label={label} onClick={() => track(ev)} delay={0.45 + i * 0.07} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Website + Location + Google Review */}
                {(profile.website || (profile.location && profile.show_location !== false) || profile.google_review_url) && (
                  <>
                    <Divider />
                    <div style={{ marginBottom: 28 }}>
                      <SectionHead emoji="📍" title="Business Info" />
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {profile.website && (
                          <motion.a href={profile.website} target="_blank" rel="noopener noreferrer" onClick={() => track("website_click")}
                            whileHover={{ x: 4 }}
                            style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 16, background: isDark ? "rgba(255,255,255,0.06)" : "#f8fafc", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e2e8f0", textDecoration: "none", color: isDark ? "rgba(255,255,255,0.8)" : "#374151", fontWeight: 600, fontSize: 14 }}>
                            <WebsiteIcon size={20} color={color} />
                            <span style={{ flex: 1 }}>{profile.website.replace(/^https?:\/\//, "")}</span>
                            <span style={{ color: "#94a3b8", fontSize: 12 }}>›</span>
                          </motion.a>
                        )}
                        {profile.location && profile.show_location !== false && (
                          <motion.a href={`https://maps.google.com/?q=${encodeURIComponent(profile.location)}`} target="_blank" rel="noopener noreferrer" onClick={() => track("location_click")}
                            whileHover={{ x: 4 }}
                            style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 16, background: isDark ? "rgba(255,255,255,0.06)" : "#f8fafc", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e2e8f0", textDecoration: "none", color: isDark ? "rgba(255,255,255,0.8)" : "#374151", fontWeight: 600, fontSize: 14 }}>
                            <MapPinIcon size={20} color="#ef4444" />
                            <div style={{ flex: 1 }}>
                              <p style={{ margin: 0, fontWeight: 600 }}>{profile.location}</p>
                              <p style={{ margin: 0, fontSize: 11, color: "#0077b6", fontWeight: 700 }}>Get Directions →</p>
                            </div>
                          </motion.a>
                        )}
                        {profile.google_review_url && (
                          <motion.a href={profile.google_review_url} target="_blank" rel="noopener noreferrer"
                            whileHover={{ x: 4 }}
                            style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 16, background: isDark ? "rgba(255,255,255,0.06)" : "#fffbeb", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #fde68a", textDecoration: "none", color: isDark ? "rgba(255,255,255,0.8)" : "#374151", fontWeight: 700, fontSize: 14 }}>
                            <span style={{ fontSize: 22 }}>⭐</span>
                            <div style={{ flex: 1 }}>
                              <p style={{ margin: 0, fontWeight: 700 }}>Leave a Google Review</p>
                              <p style={{ margin: 0, fontSize: 11, color: "#d97706", fontWeight: 700 }}>Share your experience →</p>
                            </div>
                          </motion.a>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Payment methods */}
                {payments.length > 0 && (
                  <>
                    <Divider />
                    <div style={{ marginBottom: 28 }}>
                      <SectionHead emoji="💸" title="Send Money" />
                      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(payments.length, 4)}, 1fr)`, gap: 10 }}>
                        {payments.map((p, i) => <PaymentBtn key={p.l} p={p} i={i} color={color} />)}
                      </div>
                    </div>
                  </>
                )}

                {/* Salon / Restaurant Services */}
                {["salon","restaurant"].includes(profile.plan) && (
                  <>
                    <Divider />
                    <SalonServicesSection profileId={profile.id} color={color} isDark={isDark} />
                  </>
                )}

                {/* Resume / Experience — only renders if a resume is attached */}
                <ProfileResumeSection profileId={profile.id} color={color} isDark={isDark} showDivider />

                {/* Portfolio */}
                <Divider />
                <div style={{ marginBottom: 28 }}>
                  <SectionHead emoji="🎨" title="Portfolio" />
                  <PortfolioSection profileId={profile.id} color={color} />
                </div>

                {/* Lead capture */}
                <Divider />
                <LeadCaptureSection profileId={profile.id} color={color} />

                {/* Powered by + Footer */}
                <div style={{ textAlign: "center", marginTop: 28, paddingTop: 20, borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                  <a href="/" style={{ textDecoration: "none" }}>
                    <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>Powered by Bingoo Connect</span>
                  </a>
                  {!isDemo && (
                    <div style={{ marginTop: 8 }}>
                      <ReportAbuseButton profileId={profile?.id} username={profile?.username} />
                    </div>
                  )}
                  <PublicFooter dark={isDark} />
                </div>
              </div>
            </div>
          </div>
        </ProfileLayoutShell>

      {/* ── STICKY BOTTOM BAR ── */}
      {profile.phone && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 200, damping: 25 }}
          style={{
            position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
            padding: "12px 16px calc(12px + env(safe-area-inset-bottom))",
            background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ maxWidth: 440, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <a href={`tel:${profile.phone}`}
              onClick={() => track("phone_click")}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px 16px", borderRadius: 14, background: "linear-gradient(135deg,#16a34a,#15803d)", color: "#fff", fontWeight: 800, fontSize: 13.5, textDecoration: "none", boxShadow: "0 6px 20px rgba(22,163,74,0.4)" }}>
              <PhoneIcon size={18} /> Call Now
            </a>
            {profile.whatsapp_number
              ? <a href={waBookingHref || `https://wa.me/${(profile.whatsapp_number||"").replace(/\D/g,"")}`}
                  onClick={() => track("whatsapp_click")}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px 16px", borderRadius: 14, background: "linear-gradient(135deg,#25D366,#128C7E)", color: "#fff", fontWeight: 800, fontSize: 13.5, textDecoration: "none", boxShadow: "0 6px 20px rgba(37,211,102,0.4)" }}>
                  <WhatsAppIcon size={18} /> {isSalonOrRestaurant && profile.whatsapp_booking_message ? "Book via WA" : "WhatsApp"}
                </a>
              : <button
                  onClick={() => { track("save_contact_click"); saveContact(profile); }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px 16px", borderRadius: 14, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.8)})`, color: "#fff", fontWeight: 800, fontSize: 13.5, border: "none", cursor: "pointer", boxShadow: `0 6px 20px ${hexRgb(color, 0.4)}` }}>
                  <SaveContactIcon size={18} /> Save Contact
                </button>
            }
          </div>
        </motion.div>
      )}

      {/* ── BACK TO TOP ── */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            key="btt"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => { topRef.current?.scrollIntoView({ behavior: "smooth" }); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            whileHover={{ scale: 1.1 }}
            style={{ position: "fixed", bottom: profile.phone ? 100 : 24, right: 20, zIndex: 50, width: 44, height: 44, borderRadius: "50%", background: color, color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: `0 6px 20px ${hexRgb(color, 0.5)}` }}
          >
            ↑
          </motion.button>
        )}
      </AnimatePresence>

      {/* Appointment modal */}
      {bookOpen && <AppointmentBooking profile={profile} onClose={() => setBookOpen(false)} />}

      {/* Prospect marketing popup */}
      <ProspectPopup profileId={profile?.id} profileOwnerId={profile?.created_by_id} deviceCode={deviceCodeParam} isDemo={isDemo} />

    </div>
  );
}