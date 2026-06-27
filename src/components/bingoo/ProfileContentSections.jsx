/**
 * Reusable profile content sections rendered inside any layout shell.
 * Used by PublicProfile (default layout) AND passed as children to premium layouts.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppointmentBooking from "@/components/bingoo/AppointmentBooking";
import PortfolioSection from "@/components/bingoo/PortfolioSection";
import ProfileResumeSection from "@/components/bingoo/ProfileResumeSection";
import ZelleQRModal from "@/components/bingoo/ZelleQRModal";
import LeadCaptureSection from "@/components/bingoo/LeadCaptureSection";
import AttorneysSectionPublic from "@/components/bingoo/AttorneysSectionPublic";
import SaveProfileButton from "@/components/bingoo/SaveProfileButton";
import ReportAbuseButton from "@/components/bingoo/ReportAbuseButton";
import SalonServicesSection from "@/components/bingoo/SalonServicesSection";
import PublicFooter from "@/components/bingoo/PublicFooter";
import {
  InstagramIcon, FacebookIcon, TikTokIcon, LinkedInIcon, YouTubeIcon,
  SaveContactIcon, ShareIcon, CalendarSvgIcon, EmailSvgIcon, PhoneIcon,
  WebsiteIcon, MapPinIcon, WaveIconNew, OrangeMoneyIconNew,
  ZelleIcon, CashAppIcon, WhatsAppIcon,
} from "@/components/bingoo/SocialIcons";
import {
  PhoneIcon as BIPhone, WhatsAppIcon as BIWhatsApp, EmailIcon as BIEmail, WebsiteIcon as BIWebsite,
  InstagramIcon as BIInstagram, LinkedInIcon as BILinkedIn, FacebookIcon as BIFacebook,
  TikTokIcon as BITikTok, YouTubeIcon as BIYouTube, TwitterXIcon, SnapchatIcon,
  PinterestIcon, DiscordIcon, TwitchIcon, ThreadsIcon,
  PayPalIcon, CashAppIcon as BICashApp, ZelleIcon as BIZelle, VenmoIcon,
  WaveIcon as BIWave, OrangeMoneyIcon as BIOrangeMoney, SpotifyIcon,
  CalendarIcon as BICalendar, ShopIcon, PortfolioIcon, LocationIcon as BILocation,
} from "@/components/bingoo/BrandIcons";

// Map catalog IDs and labels to brand icons
const CATALOG_ICON_MAP = {
  phone: BIPhone, whatsapp_number: BIWhatsApp, email: BIEmail, website: BIWebsite,
  location: BILocation, instagram_url: BIInstagram, linkedin_url: BILinkedIn,
  facebook_url: BIFacebook, tiktok_url: BITikTok, youtube_url: BIYouTube,
  twitter_url: TwitterXIcon, snapchat_url: SnapchatIcon, pinterest_url: PinterestIcon,
  discord_url: DiscordIcon, twitch_url: TwitchIcon, threads_url: ThreadsIcon,
  payment_link: PayPalIcon, cashapp_link: BICashApp, zelle_link: BIZelle, venmo_url: VenmoIcon,
  wave_link: BIWave, orangemoney_link: BIOrangeMoney, music_link: SpotifyIcon,
  booking: BICalendar, shop_link: ShopIcon, portfolio_link: PortfolioIcon,
};

function LinkIcon({ link, size = 28 }) {
  // Try catalog id match first
  const byId = link._catalog_id ? CATALOG_ICON_MAP[link._catalog_id] : null;
  if (byId) {
    const Ic = byId;
    return <Ic size={size} />;
  }
  // Fallback: try matching label
  const label = (link.label || "").toLowerCase();
  if (label.includes("instagram")) return <BIInstagram size={size} />;
  if (label.includes("facebook")) return <BIFacebook size={size} />;
  if (label.includes("tiktok")) return <BITikTok size={size} />;
  if (label.includes("linkedin")) return <BILinkedIn size={size} />;
  if (label.includes("youtube")) return <BIYouTube size={size} />;
  if (label.includes("paypal")) return <PayPalIcon size={size} />;
  if (label.includes("cash")) return <BICashApp size={size} />;
  if (label.includes("zelle")) return <BIZelle size={size} />;
  if (label.includes("venmo")) return <VenmoIcon size={size} />;
  if (label.includes("wave")) return <BIWave size={size} />;
  if (label.includes("orange")) return <BIOrangeMoney size={size} />;
  if (label.includes("spotify") || label.includes("music")) return <SpotifyIcon size={size} />;
  if (label.includes("discord")) return <DiscordIcon size={size} />;
  if (label.includes("twitch")) return <TwitchIcon size={size} />;
  if (label.includes("thread")) return <ThreadsIcon size={size} />;
  if (label.includes("pinterest")) return <PinterestIcon size={size} />;
  if (label.includes("shop")) return <ShopIcon size={size} />;
  if (label.includes("portfolio")) return <PortfolioIcon size={size} />;
  if (label.includes("book") || label.includes("calendly")) return <BICalendar size={size} />;
  // Generic link icon  
  return <BIWebsite size={size} />;
}

const hexRgb = (hex, alpha = 1) => {
  if (!hex || hex.length < 7) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const btnRadius = (s) => s === "pill" ? "9999px" : s === "sharp" ? "10px" : "18px";

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

function SectionHead({ emoji, title, light = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <span style={{ fontSize: 18 }}>{emoji}</span>
      <span style={{ fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: light ? "rgba(255,255,255,0.5)" : "#94a3b8" }}>{title}</span>
    </div>
  );
}

const Divider = ({ light = false }) => (
  <div style={{ height: 1, background: light ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)", margin: "28px 0" }} />
);

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
        {p.e === "wave" ? <WaveIconNew size={28} /> : p.e === "orangemoney" ? <OrangeMoneyIconNew size={28} /> : p.e === "zelle" ? <ZelleIcon size={28} /> : p.e === "cashapp" ? <CashAppIcon size={28} /> : <span style={{ fontSize: 22 }}>{p.e}</span>}
        <span style={{ lineHeight: 1.2, textAlign: "center" }}>{p.l}{p.qr ? " 🔲" : ""}</span>
      </motion.button>
      <AnimatePresence>
        {open && <ZelleQRModal qrUrl={p.qr} link={p.h} label={p.l} emoji={p.e} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

export default function ProfileContentSections({ profile, color, isDark, isDemo, deviceCodeParam, track }) {
  const [bookOpen, setBookOpen] = useState(false);
  const [shared, setShared] = useState(false);

  const r = btnRadius(profile.button_style || "pill");
  const isSalonOrRestaurant = ["salon", "restaurant"].includes(profile.plan);
  const isLawFirmProfile = profile.plan === "lawfirm";
  const canBook = profile.booking_enabled && ["pro", "professional", "business", "corporate", "salon", "restaurant", "lawfirm"].includes(profile.plan);

  const waBookingHref = profile.whatsapp_number
    ? `https://wa.me/${(profile.whatsapp_number || "").replace(/\D/g, "")}${profile.whatsapp_booking_message ? `?text=${encodeURIComponent(profile.whatsapp_booking_message)}` : ""}`
    : null;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: profile.display_name, url: window.location.href }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(window.location.href).catch(() => {});
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const primaryLinks = [
    profile.phone && { label: "Call", href: `tel:${profile.phone}`, icon: <BIPhone size={48} />, ev: "phone_click" },
    isSalonOrRestaurant && waBookingHref
      ? { label: "Book via WA", href: waBookingHref, icon: <BIWhatsApp size={48} />, ev: "whatsapp_click" }
      : profile.whatsapp_number && { label: "WhatsApp", href: `https://wa.me/${(profile.whatsapp_number || "").replace(/\D/g, "")}`, icon: <BIWhatsApp size={48} />, ev: "whatsapp_click" },
    profile.email && { label: "Email", href: `mailto:${profile.email}`, icon: <BIEmail size={48} />, ev: "email_click" },
    canBook && { label: "Book", href: null, onClick: () => setBookOpen(true), icon: <BICalendar size={48} />, ev: null },
  ].filter(Boolean);

  const socialLinks = [
    profile.instagram_url && { Icon: BIInstagram, href: profile.instagram_url, label: "Instagram", ev: "instagram_click" },
    profile.facebook_url && { Icon: BIFacebook, href: profile.facebook_url, label: "Facebook", ev: "facebook_click" },
    profile.tiktok_url && { Icon: BITikTok, href: profile.tiktok_url, label: "TikTok", ev: "tiktok_click" },
    profile.linkedin_url && { Icon: BILinkedIn, href: profile.linkedin_url, label: "LinkedIn", ev: "linkedin_click" },
    profile.youtube_url && { Icon: BIYouTube, href: profile.youtube_url, label: "YouTube", ev: "youtube_click" },
  ].filter(Boolean);

  const payments = [
    (profile.zelle_qr || profile.zelle_link) && { e: "zelle", l: "Zelle", h: profile.zelle_link || null, qr: profile.zelle_qr || null },
    (profile.cashapp_qr || profile.cashapp_link) && { e: "cashapp", l: "Cash App", h: profile.cashapp_link || null, qr: profile.cashapp_qr || null },
    (profile.orangemoney_qr || profile.orangemoney_link) && { e: "orangemoney", l: "Orange Money", h: profile.orangemoney_link || null, qr: profile.orangemoney_qr || null },
    (profile.wave_qr || profile.wave_link) && { e: "wave", l: "Wave", h: profile.wave_link || null, qr: profile.wave_qr || null },
    ...((profile.custom_payments || []).filter(c => c.label && (c.link || c.qr)).map(c => ({ e: c.emoji || "💵", l: c.label, h: c.link || null, qr: c.qr || null }))),
  ].filter(Boolean);

  // ── Circo-style icon item (large iOS app icon + label below) ──
  const IconItem = ({ href, onClick, icon, label, ev, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.1, y: -3 }} whileTap={{ scale: 0.92 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer" }}
    >
      {href
        ? <a href={href} target="_blank" rel="noopener noreferrer" onClick={() => ev && track(ev)}
            style={{ display: "block", textDecoration: "none", borderRadius: Math.round((48 + 20) * 0.24) + 2, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.14)" }}>
            {icon}
          </a>
        : <button onClick={() => { ev && track(ev); onClick?.(); }}
            style={{ display: "block", background: "none", border: "none", padding: 0, cursor: "pointer", borderRadius: Math.round((48 + 20) * 0.24) + 2, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.14)" }}>
            {icon}
          </button>
      }
      <span style={{ fontSize: 10, fontWeight: 700, color: isDark ? "rgba(255,255,255,0.55)" : "#64748b", letterSpacing: "0.01em", textAlign: "center", maxWidth: 64, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
    </motion.div>
  );

  return (
    <div style={{ padding: "0" }}>
      {/* Save Contact + Connect + Share — 3-button Circo style row */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        <motion.button
          onClick={() => { track("save_contact_click"); saveContact(profile); }}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "13px 10px", borderRadius: 14, background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.8)})`, color: "#fff", fontWeight: 800, fontSize: 13, border: "none", cursor: "pointer", boxShadow: `0 8px 24px ${hexRgb(color, 0.38)}` }}
        >
          <SaveContactIcon size={16} /> Save
        </motion.button>
        <div style={{ flex: 1 }}>
          <SaveProfileButton profile={profile} color={color} source={deviceCodeParam ? "nfc_scan" : "manual"} />
        </div>
        <motion.button
          onClick={handleShare}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "13px 10px", borderRadius: 14, background: isDark ? "rgba(255,255,255,0.08)" : "#f1f5f9", color: isDark ? "#fff" : "#374151", fontWeight: 800, fontSize: 13, border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e2e8f0", cursor: "pointer" }}
        >
          <ShareIcon size={16} color={isDark ? "#fff" : "#374151"} />
          {shared ? "✓" : "Share"}
        </motion.button>
      </motion.div>

      {/* All action icons — Circo-style large icon grid (contact + social together) */}
      {(primaryLinks.length > 0 || socialLinks.length > 0) && (() => {
        // Build unified icon list: contact actions first, then social
        const contactIcons = primaryLinks.map((l, i) => ({
          href: l.href, onClick: l.onClick, icon: l.icon, label: l.label, ev: l.ev, delay: 0.32 + i * 0.06,
        }));
        const socialIcons = socialLinks.map(({ Icon, href, label, ev }, i) => ({
          href, icon: <Icon size={48} />, label, ev, delay: 0.32 + (primaryLinks.length + i) * 0.06,
        }));
        const allIcons = [...contactIcons, ...socialIcons];
        return (
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px 10px" }}>
              {allIcons.map((item, i) => (
                <IconItem key={item.label + i} {...item} />
              ))}
            </div>
          </div>
        );
      })()}

      {/* Custom links — premium list cards */}
      {(profile.custom_links || []).filter(l => l.enabled !== false && l.label && l.url).length > 0 && (
        <>
          <Divider light={isDark} />
          <div style={{ marginBottom: 28 }}>
            <SectionHead emoji="🔗" title="Links" light={isDark} />
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {(profile.custom_links || []).filter(l => l.enabled !== false && l.label && l.url).map((link, i) => (
                <motion.a key={link.id || i} href={link.url.startsWith("http") ? link.url : `https://${link.url}`}
                  target="_blank" rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.06 }}
                  whileHover={{ x: 5 }}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 16, background: isDark ? "rgba(255,255,255,0.06)" : "#f8fafc", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e2e8f0", textDecoration: "none", color: isDark ? "rgba(255,255,255,0.85)" : "#374151", fontWeight: 600, fontSize: 14 }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
                    <LinkIcon link={link} size={36} />
                  </div>
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{link.label}</span>
                  <span style={{ color: "#94a3b8", fontSize: 14, flexShrink: 0 }}>›</span>
                </motion.a>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Website + Location + Google Review */}
      {(profile.website || (profile.location && profile.show_location !== false) || profile.google_review_url) && (
        <>
          <Divider light={isDark} />
          <div style={{ marginBottom: 28 }}>
            <SectionHead emoji="📍" title="Business Info" light={isDark} />
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
          <Divider light={isDark} />
          <div style={{ marginBottom: 28 }}>
            <SectionHead emoji="💸" title="Send Money" light={isDark} />
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(payments.length, 4)}, 1fr)`, gap: 10 }}>
              {payments.map((p, i) => <PaymentBtn key={p.l} p={p} i={i} color={color} />)}
            </div>
          </div>
        </>
      )}

      {/* Services (salon & restaurant) */}
      {isSalonOrRestaurant && (
        <>
          <Divider light={isDark} />
          <SalonServicesSection profileId={profile.id} color={color} isDark={isDark} />
        </>
      )}

      {/* Business Hours */}
      {profile.business_hours && Object.keys(profile.business_hours).length > 0 && (() => {
        const DAYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
        const DAY_LABELS = { monday:"Mon",tuesday:"Tue",wednesday:"Wed",thursday:"Thu",friday:"Fri",saturday:"Sat",sunday:"Sun" };
        const activeDays = DAYS.filter(d => profile.business_hours[d]?.enabled);
        if (!activeDays.length) return null;
        const now = new Date();
        const todayKey = DAYS[now.getDay() === 0 ? 6 : now.getDay() - 1];
        const todayCfg = profile.business_hours[todayKey];
        const isOpenNow = todayCfg?.enabled && (() => {
          const [sh,sm] = (todayCfg.start||"00:00").split(":").map(Number);
          const [eh,em] = (todayCfg.end||"23:59").split(":").map(Number);
          const cur = now.getHours()*60 + now.getMinutes();
          return cur >= sh*60+sm && cur <= eh*60+em;
        })();
        return (
          <>
            <Divider light={isDark} />
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>🕐</span>
                  <span style={{ fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: isDark ? "rgba(255,255,255,0.5)" : "#94a3b8" }}>Business Hours</span>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 999,
                  background: isOpenNow
                    ? (isDark ? "rgba(34,197,94,0.18)" : "#dcfce7")
                    : (isDark ? "rgba(239,68,68,0.18)" : "#fee2e2"),
                  color: isOpenNow
                    ? (isDark ? "#4ade80" : "#16a34a")
                    : (isDark ? "#f87171" : "#dc2626"),
                  border: isDark ? `1px solid ${isOpenNow ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}` : "none",
                }}>
                  {isOpenNow ? "● Open Now" : "● Closed"}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {DAYS.filter(d => profile.business_hours[d]).map(d => {
                  const cfg = profile.business_hours[d];
                  const isToday = d === todayKey;
                  return (
                    <div key={d} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 12, background: isToday ? (isDark ? "rgba(255,255,255,0.08)" : hexRgb(color, 0.07)) : (isDark ? "rgba(255,255,255,0.03)" : "#f8fafc"), border: isToday ? `1px solid ${hexRgb(color, 0.25)}` : (isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e2e8f0") }}>
                      <span style={{ fontSize: 13, fontWeight: isToday ? 800 : 600, color: isToday ? (isDark ? "#fff" : color) : (isDark ? "rgba(255,255,255,0.6)" : "#64748b") }}>{DAY_LABELS[d]}{isToday ? " (Today)" : ""}</span>
                      {cfg.enabled
                        ? <span style={{ fontSize: 13, fontWeight: 700, color: isDark ? "rgba(255,255,255,0.8)" : "#374151" }}>{cfg.start} – {cfg.end}</span>
                        : <span style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>Closed</span>
                      }
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        );
      })()}

      {/* Resume */}
      <ProfileResumeSection profileId={profile.id} color={color} isDark={isDark} showDivider />

      {/* Portfolio */}
      <Divider light={isDark} />
      <div style={{ marginBottom: 28 }}>
        <SectionHead emoji="🎨" title="Portfolio" light={isDark} />
        <PortfolioSection profileId={profile.id} color={color} />
      </div>

      {/* Attorneys — Law Firm */}
      {isLawFirmProfile && (
        <AttorneysSectionPublic profileId={profile.id} color={color} />
      )}

      {/* Lead capture */}
      <Divider light={isDark} />
      <LeadCaptureSection profileId={profile.id} color={color} isLawFirm={isLawFirmProfile} />

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: 28, paddingTop: 20, borderTop: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.05)" }}>
        <a href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontSize: 11, color: isDark ? "rgba(255,255,255,0.35)" : "#94a3b8", fontWeight: 700 }}>Powered by Bingoo Connect</span>
        </a>
        {!isDemo && (
          <div style={{ marginTop: 8 }}>
            <ReportAbuseButton profileId={profile?.id} username={profile?.username} />
          </div>
        )}
        <PublicFooter dark={isDark} />
      </div>

      {/* Appointment modal */}
      {bookOpen && <AppointmentBooking profile={profile} onClose={() => setBookOpen(false)} />}
    </div>
  );
}