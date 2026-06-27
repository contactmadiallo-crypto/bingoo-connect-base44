/**
 * ProfileContentSections — Circo-inspired modern layout.
 * Clean rows, iOS app icons, minimal section labels, card feel.
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
  SaveContactIcon, ShareIcon, WebsiteIcon, MapPinIcon,
  WaveIconNew, OrangeMoneyIconNew, ZelleIcon, CashAppIcon,
} from "@/components/bingoo/SocialIcons";
import {
  PhoneIcon as BIPhone, WhatsAppIcon as BIWhatsApp, EmailIcon as BIEmail,
  WebsiteIcon as BIWebsite, InstagramIcon as BIInstagram, LinkedInIcon as BILinkedIn,
  FacebookIcon as BIFacebook, TikTokIcon as BITikTok, YouTubeIcon as BIYouTube,
  TwitterXIcon, SnapchatIcon, PinterestIcon, DiscordIcon, TwitchIcon, ThreadsIcon,
  PayPalIcon, CashAppIcon as BICashApp, ZelleIcon as BIZelle, VenmoIcon,
  WaveIcon as BIWave, OrangeMoneyIcon as BIOrangeMoney, SpotifyIcon,
  CalendarIcon as BICalendar, ShopIcon, PortfolioIcon, LocationIcon as BILocation,
} from "@/components/bingoo/BrandIcons";

// ── Helpers ──────────────────────────────────────────────────
const hexRgb = (hex, alpha = 1) => {
  if (!hex || hex.length < 7) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

// Canonical catalog_id → BrandIcon map (single source of truth)
const CATALOG_ICON_MAP = {
  phone:            BIPhone,
  whatsapp_number:  BIWhatsApp,
  email:            BIEmail,
  website:          BIWebsite,
  location:         BILocation,
  instagram_url:    BIInstagram,
  linkedin_url:     BILinkedIn,
  facebook_url:     BIFacebook,
  tiktok_url:       BITikTok,
  youtube_url:      BIYouTube,
  twitter_url:      TwitterXIcon,
  snapchat_url:     SnapchatIcon,
  pinterest_url:    PinterestIcon,
  discord_url:      DiscordIcon,
  twitch_url:       TwitchIcon,
  threads_url:      ThreadsIcon,
  payment_link:     PayPalIcon,
  cashapp_link:     BICashApp,
  zelle_link:       BIZelle,
  venmo_url:        VenmoIcon,
  wave_link:        BIWave,
  orangemoney_link: BIOrangeMoney,
  music_link:       SpotifyIcon,
  booking:          BICalendar,
  shop_link:        ShopIcon,
  portfolio_link:   PortfolioIcon,
};

// Resolve icon by catalog_id first, then URL domain, then label keywords
function getLinkBrandIcon(link, size = 32) {
  // 1. Canonical _catalog_id — always wins
  const byId = link._catalog_id ? CATALOG_ICON_MAP[link._catalog_id] : null;
  if (byId) { const Ic = byId; return <Ic size={size} />; }

  // 2. URL domain inference
  const url = (link.url || "").toLowerCase();
  if (url.includes("snapchat.com"))  return <SnapchatIcon size={size} />;
  if (url.includes("instagram.com")) return <BIInstagram size={size} />;
  if (url.includes("facebook.com") || url.includes("fb.com")) return <BIFacebook size={size} />;
  if (url.includes("tiktok.com"))    return <BITikTok size={size} />;
  if (url.includes("linkedin.com"))  return <BILinkedIn size={size} />;
  if (url.includes("youtube.com") || url.includes("youtu.be")) return <BIYouTube size={size} />;
  if (url.includes("x.com") || url.includes("twitter.com"))    return <TwitterXIcon size={size} />;
  if (url.includes("threads.net"))   return <ThreadsIcon size={size} />;
  if (url.includes("pinterest.com")) return <PinterestIcon size={size} />;
  if (url.includes("discord."))      return <DiscordIcon size={size} />;
  if (url.includes("twitch.tv"))     return <TwitchIcon size={size} />;
  if (url.includes("paypal."))       return <PayPalIcon size={size} />;
  if (url.includes("cash.app") || url.includes("cashapp")) return <BICashApp size={size} />;
  if (url.includes("venmo.com"))     return <VenmoIcon size={size} />;
  if (url.includes("zelle") || url.includes("zellepay")) return <BIZelle size={size} />;
  if (url.includes("wave.com"))      return <BIWave size={size} />;
  if (url.includes("orange"))        return <BIOrangeMoney size={size} />;
  if (url.includes("spotify.com"))   return <SpotifyIcon size={size} />;
  if (url.includes("calendly.com") || url.includes("cal.com")) return <BICalendar size={size} />;

  // 3. Label keyword fallback
  const label = (link.label || "").toLowerCase();
  if (label.includes("snapchat"))  return <SnapchatIcon size={size} />;
  if (label.includes("instagram")) return <BIInstagram size={size} />;
  if (label.includes("facebook"))  return <BIFacebook size={size} />;
  if (label.includes("tiktok"))    return <BITikTok size={size} />;
  if (label.includes("linkedin"))  return <BILinkedIn size={size} />;
  if (label.includes("youtube"))   return <BIYouTube size={size} />;
  if (label.includes("twitter") || label.includes("x.com") || label === "x") return <TwitterXIcon size={size} />;
  if (label.includes("thread"))    return <ThreadsIcon size={size} />;
  if (label.includes("paypal"))    return <PayPalIcon size={size} />;
  if (label.includes("cash"))      return <BICashApp size={size} />;
  if (label.includes("zelle"))     return <BIZelle size={size} />;
  if (label.includes("venmo"))     return <VenmoIcon size={size} />;
  if (label.includes("wave"))      return <BIWave size={size} />;
  if (label.includes("orange"))    return <BIOrangeMoney size={size} />;
  if (label.includes("spotify") || label.includes("music")) return <SpotifyIcon size={size} />;
  if (label.includes("discord"))   return <DiscordIcon size={size} />;
  if (label.includes("twitch"))    return <TwitchIcon size={size} />;
  if (label.includes("pinterest")) return <PinterestIcon size={size} />;
  if (label.includes("shop"))      return <ShopIcon size={size} />;
  if (label.includes("portfolio")) return <PortfolioIcon size={size} />;
  if (label.includes("book") || label.includes("calendly")) return <BICalendar size={size} />;
  return <BIWebsite size={size} />;
}

function LinkIcon({ link, size = 32 }) {
  return getLinkBrandIcon(link, size);
}

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

const FONT_DISPLAY = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";
const FONT_BODY    = "'Inter', system-ui, sans-serif";

// ── Tiny section label ───────────────────────────────────────
function SLabel({ children, isDark }) {
  return (
    <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
      color: isDark ? "rgba(255,255,255,0.35)" : "#94a3b8", margin: "0 0 10px", fontFamily: FONT_BODY }}>
      {children}
    </p>
  );
}

// ── Thin divider ─────────────────────────────────────────────
const Div = ({ isDark }) => (
  <div style={{ height: 1, background: isDark ? "rgba(255,255,255,0.07)" : "#f0f0f0", margin: "22px 0" }} />
);

// ── iOS-style icon grid item ─────────────────────────────────
function IconGridItem({ href, onClick, icon, label, ev, track, isDark }) {
  const inner = (
    <motion.div
      whileHover={{ scale: 1.08, y: -2 }} whileTap={{ scale: 0.93 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer" }}
    >
      <div style={{ borderRadius: 17, overflow: "hidden", boxShadow: "0 3px 12px rgba(0,0,0,0.15)", flexShrink: 0 }}>
        {icon}
      </div>
      <span style={{ fontSize: 10, fontWeight: 600, color: isDark ? "rgba(255,255,255,0.5)" : "#64748b",
        textAlign: "center", maxWidth: 60, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        fontFamily: FONT_BODY }}>
        {label}
      </span>
    </motion.div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer"
        style={{ textDecoration: "none" }} onClick={() => ev && track(ev)}>
        {inner}
      </a>
    );
  }
  return (
    <button onClick={() => { ev && track(ev); onClick?.(); }}
      style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
      {inner}
    </button>
  );
}

// ── Payment button ───────────────────────────────────────────
function PaymentBtn({ p, color, isDark }) {
  const [open, setOpen] = useState(false);
  const iconEl = p.e === "wave" ? <WaveIconNew size={32} /> : p.e === "orangemoney" ? <OrangeMoneyIconNew size={32} /> : p.e === "zelle" ? <ZelleIcon size={32} /> : p.e === "cashapp" ? <CashAppIcon size={32} /> : <span style={{ fontSize: 26 }}>{p.e}</span>;
  return (
    <>
      <motion.button type="button" onClick={() => setOpen(true)}
        whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.94 }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7,
          padding: "14px 8px", borderRadius: 18, cursor: "pointer",
          background: isDark ? "rgba(255,255,255,0.06)" : hexRgb(color, 0.07),
          border: `1.5px solid ${hexRgb(color, isDark ? 0.15 : 0.18)}`,
          color, fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {iconEl}
        <span style={{ textAlign: "center", lineHeight: 1.2 }}>{p.l}{p.qr ? " 🔲" : ""}</span>
      </motion.button>
      <AnimatePresence>
        {open && <ZelleQRModal qrUrl={p.qr} link={p.h} label={p.l} emoji={p.e} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

// ── Row link (for website, location, custom links, google review) ──
function RowLink({ href, onClick, iconEl, title, subtitle, chevron = true, isDark, ev, track }) {
  const style = {
    display: "flex", alignItems: "center", gap: 14,
    padding: "13px 16px", borderRadius: 16,
    background: isDark ? "rgba(255,255,255,0.05)" : "#f7f8fa",
    border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #ebebeb",
    textDecoration: "none", color: "inherit",
  };
  const content = (
    <>
      <div style={{ flexShrink: 0 }}>{iconEl}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 14, fontFamily: FONT_BODY,
          color: isDark ? "rgba(255,255,255,0.9)" : "#1e293b",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</p>
        {subtitle && <p style={{ margin: 0, fontSize: 11, color: "#0077b6", fontWeight: 600, fontFamily: FONT_BODY }}>{subtitle}</p>}
      </div>
      {chevron && <span style={{ color: "#c0c8d4", fontSize: 18, fontWeight: 300, flexShrink: 0 }}>›</span>}
    </>
  );
  if (href) return <motion.a href={href} target="_blank" rel="noopener noreferrer" style={style} whileHover={{ x: 3 }} onClick={() => ev && track(ev)}>{content}</motion.a>;
  return <motion.button onClick={onClick} style={{ ...style, width: "100%", border: style.border, cursor: "pointer" }} whileHover={{ x: 3 }}>{content}</motion.button>;
}

// ════════════════════════════════════════════════════════════
export default function ProfileContentSections({ profile, color, isDark, isDemo, deviceCodeParam, track }) {
  const [bookOpen, setBookOpen] = useState(false);
  const [shared, setShared] = useState(false);

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

  // ── Primary contact row: Call / WhatsApp / Email / Book ──────────────
  const contactIcons = [
    profile.phone && { href: `tel:${profile.phone}`, icon: <BIPhone size={54} />, label: "Call", ev: "phone_click" },
    isSalonOrRestaurant && waBookingHref
      ? { href: waBookingHref, icon: <BIWhatsApp size={54} />, label: "Book WA", ev: "whatsapp_click" }
      : profile.whatsapp_number && { href: `https://wa.me/${(profile.whatsapp_number || "").replace(/\D/g, "")}`, icon: <BIWhatsApp size={54} />, label: "WhatsApp", ev: "whatsapp_click" },
    profile.email && { href: `mailto:${profile.email}`, icon: <BIEmail size={54} />, label: "Email", ev: "email_click" },
    canBook && { onClick: () => setBookOpen(true), icon: <BICalendar size={54} />, label: "Book", ev: null },
  ].filter(Boolean);

  // ── Social row: Instagram / Facebook / TikTok / LinkedIn / YouTube / etc. ─
  const socialIcons = [
    profile.instagram_url && { href: profile.instagram_url, icon: <BIInstagram size={54} />, label: "Instagram", ev: "instagram_click" },
    profile.facebook_url && { href: profile.facebook_url, icon: <BIFacebook size={54} />, label: "Facebook", ev: "facebook_click" },
    profile.tiktok_url && { href: profile.tiktok_url, icon: <BITikTok size={54} />, label: "TikTok", ev: "tiktok_click" },
    profile.linkedin_url && { href: profile.linkedin_url, icon: <BILinkedIn size={54} />, label: "LinkedIn", ev: "linkedin_click" },
    profile.youtube_url && { href: profile.youtube_url, icon: <BIYouTube size={54} />, label: "YouTube", ev: "youtube_click" },
  ].filter(Boolean);

  const payments = [
    (profile.zelle_qr || profile.zelle_link) && { e: "zelle", l: "Zelle", h: profile.zelle_link || null, qr: profile.zelle_qr || null },
    (profile.cashapp_qr || profile.cashapp_link) && { e: "cashapp", l: "Cash App", h: profile.cashapp_link || null, qr: profile.cashapp_qr || null },
    (profile.orangemoney_qr || profile.orangemoney_link) && { e: "orangemoney", l: "Orange Money", h: profile.orangemoney_link || null, qr: profile.orangemoney_qr || null },
    (profile.wave_qr || profile.wave_link) && { e: "wave", l: "Wave", h: profile.wave_link || null, qr: profile.wave_qr || null },
    ...((profile.custom_payments || []).filter(c => c.label && (c.link || c.qr)).map(c => ({ e: c.emoji || "💵", l: c.label, h: c.link || null, qr: c.qr || null }))),
  ].filter(Boolean);

  const customLinks = (profile.custom_links || []).filter(l => l.enabled !== false && l.label && l.url);

  return (
    <div>

      {/* ── 3-button action row ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {/* Save Contact */}
        <motion.button onClick={() => { track("save_contact_click"); saveContact(profile); }}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "13px 8px", borderRadius: 14,
            background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.8)})`,
            color: "#fff", fontWeight: 800, fontSize: 12.5, border: "none", cursor: "pointer",
            boxShadow: `0 6px 20px ${hexRgb(color, 0.35)}`, fontFamily: FONT_BODY }}>
          <SaveContactIcon size={15} /> Save
        </motion.button>
        {/* Connect */}
        <div style={{ flex: 1 }}>
          <SaveProfileButton profile={profile} color={color} source={deviceCodeParam ? "nfc_scan" : "manual"} />
        </div>
        {/* Share */}
        <motion.button onClick={handleShare}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "13px 8px", borderRadius: 14,
            background: isDark ? "rgba(255,255,255,0.09)" : "#f0f2f5",
            color: isDark ? "#fff" : "#374151", fontWeight: 800, fontSize: 12.5,
            border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #e4e7ec", cursor: "pointer", fontFamily: FONT_BODY }}>
          <ShareIcon size={15} color={isDark ? "#fff" : "#374151"} />
          {shared ? "✓" : "Share"}
        </motion.button>
      </motion.div>

      {/* ── Bio ── */}
      {profile.bio && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
          style={{ fontSize: 14, lineHeight: 1.7, color: isDark ? "rgba(255,255,255,0.65)" : "#475569",
            textAlign: "center", margin: "0 0 22px", fontWeight: 400, fontFamily: FONT_BODY }}>
          {profile.bio}
        </motion.p>
      )}

      {/* ── Primary contact row: Call / WhatsApp / Email / Book ── */}
      {contactIcons.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ marginBottom: 18, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <div style={{
            display: "flex", gap: 12,
            justifyContent: contactIcons.length <= 4 ? "center" : "flex-start",
            minWidth: "max-content", padding: "2px 2px 4px",
          }}>
            {contactIcons.map((item, i) => (
              <div key={item.label + i} style={{ width: 68, flexShrink: 0 }}>
                <IconGridItem {...item} track={track} isDark={isDark} />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Social row: Instagram / Facebook / TikTok / LinkedIn / YouTube ── */}
      {socialIcons.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.33 }}
          style={{ marginBottom: 24, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <div style={{
            display: "flex", gap: 12,
            justifyContent: socialIcons.length <= 5 ? "center" : "flex-start",
            minWidth: "max-content", padding: "2px 2px 4px",
          }}>
            {socialIcons.map((item, i) => (
              <div key={item.label + i} style={{ width: 68, flexShrink: 0 }}>
                <IconGridItem {...item} track={track} isDark={isDark} />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Custom links as clean rows ── */}
      {customLinks.length > 0 && (
        <>
          <Div isDark={isDark} />
          <SLabel isDark={isDark}>Links</SLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 4 }}>
            {customLinks.map((link, i) => (
              <motion.div key={link.id || i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.05 }}>
                <RowLink
                  href={link.url.startsWith("http") ? link.url : `https://${link.url}`}
                  iconEl={<div style={{ width: 36, height: 36, borderRadius: 10, overflow: "hidden" }}><LinkIcon link={link} size={36} /></div>}
                  title={link.label}
                  isDark={isDark} track={track}
                />
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* ── Website / Location / Google Review ── */}
      {(profile.website || (profile.location && profile.show_location !== false) || profile.google_review_url) && (
        <>
          <Div isDark={isDark} />
          <SLabel isDark={isDark}>Business Info</SLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {profile.website && (
              <RowLink href={profile.website} ev="website_click" track={track}
                iconEl={<WebsiteIcon size={20} color={color} />}
                title={profile.website.replace(/^https?:\/\//, "")}
                isDark={isDark} />
            )}
            {profile.location && profile.show_location !== false && (
              <RowLink href={`https://maps.google.com/?q=${encodeURIComponent(profile.location)}`} ev="location_click" track={track}
                iconEl={<MapPinIcon size={20} color="#ef4444" />}
                title={profile.location} subtitle="Get Directions →"
                isDark={isDark} />
            )}
            {profile.google_review_url && (
              <RowLink href={profile.google_review_url} track={track}
                iconEl={<span style={{ fontSize: 22 }}>⭐</span>}
                title="Leave a Google Review" subtitle="Share your experience →"
                isDark={isDark} />
            )}
          </div>
        </>
      )}

      {/* ── Payments ── */}
      {payments.length > 0 && (
        <>
          <Div isDark={isDark} />
          <SLabel isDark={isDark}>Send Money</SLabel>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(payments.length, 4)}, 1fr)`, gap: 10 }}>
            {payments.map((p) => <PaymentBtn key={p.l} p={p} color={color} isDark={isDark} />)}
          </div>
        </>
      )}

      {/* ── Business Hours ── */}
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
          const cur = now.getHours()*60+now.getMinutes();
          return cur >= sh*60+sm && cur <= eh*60+em;
        })();
        return (
          <>
            <Div isDark={isDark} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <SLabel isDark={isDark}>Hours</SLabel>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
                background: isOpenNow ? (isDark ? "rgba(34,197,94,0.18)" : "#dcfce7") : (isDark ? "rgba(239,68,68,0.18)" : "#fee2e2"),
                color: isOpenNow ? (isDark ? "#4ade80" : "#16a34a") : (isDark ? "#f87171" : "#dc2626") }}>
                {isOpenNow ? "● Open" : "● Closed"}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {DAYS.filter(d => profile.business_hours[d]).map(d => {
                const cfg = profile.business_hours[d];
                const isToday = d === todayKey;
                return (
                  <div key={d} style={{ display: "flex", justifyContent: "space-between", padding: "9px 14px", borderRadius: 12,
                    background: isToday ? (isDark ? "rgba(255,255,255,0.08)" : hexRgb(color, 0.07)) : (isDark ? "rgba(255,255,255,0.03)" : "#f7f8fa"),
                    border: isToday ? `1px solid ${hexRgb(color, 0.2)}` : (isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid #ebebeb") }}>
                    <span style={{ fontSize: 13, fontWeight: isToday ? 700 : 500,
                      color: isToday ? (isDark ? "#fff" : color) : (isDark ? "rgba(255,255,255,0.55)" : "#64748b") }}>
                      {DAY_LABELS[d]}{isToday ? " (Today)" : ""}
                    </span>
                    {cfg.enabled
                      ? <span style={{ fontSize: 13, fontWeight: 600, color: isDark ? "rgba(255,255,255,0.8)" : "#1e293b" }}>{cfg.start} – {cfg.end}</span>
                      : <span style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>Closed</span>}
                  </div>
                );
              })}
            </div>
          </>
        );
      })()}

      {/* ── Salon services ── */}
      {isSalonOrRestaurant && (
        <>
          <Div isDark={isDark} />
          <SalonServicesSection profileId={profile.id} color={color} isDark={isDark} />
        </>
      )}

      {/* ── Resume ── */}
      <ProfileResumeSection profileId={profile.id} color={color} isDark={isDark} showDivider />

      {/* ── Portfolio ── */}
      <Div isDark={isDark} />
      <SLabel isDark={isDark}>Portfolio</SLabel>
      <PortfolioSection profileId={profile.id} color={color} />

      {/* ── Attorneys ── */}
      {isLawFirmProfile && (
        <AttorneysSectionPublic profileId={profile.id} color={color} />
      )}

      {/* ── Lead capture ── */}
      <Div isDark={isDark} />
      <LeadCaptureSection profileId={profile.id} color={color} isLawFirm={isLawFirmProfile} />

      {/* ── Footer ── */}
      <div style={{ textAlign: "center", marginTop: 28, paddingTop: 18,
        borderTop: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #f0f0f0" }}>
        <a href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontSize: 11, color: isDark ? "rgba(255,255,255,0.3)" : "#b0b8c8", fontWeight: 600 }}>
            Powered by Bingoo Connect
          </span>
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