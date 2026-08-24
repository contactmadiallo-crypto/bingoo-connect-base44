/**
 * ProfileContentSections — Circo-inspired modern layout.
 * Custom links are routed to their correct category row via getLinkCategory().
 */
import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import AppointmentBooking from "@/components/bingoo/AppointmentBooking";
import ProfileResumeSection from "@/components/bingoo/ProfileResumeSection";
import ZelleQRModal from "@/components/bingoo/ZelleQRModal";
import LeadCaptureSection from "@/components/bingoo/LeadCaptureSection";
import AttorneysSectionPublic from "@/components/bingoo/AttorneysSectionPublic";
import SaveProfileButton from "@/components/bingoo/SaveProfileButton";
import ReportAbuseButton from "@/components/bingoo/ReportAbuseButton";
import SalonServicesSection from "@/components/bingoo/SalonServicesSection";
import SalonTeamSection from "@/components/bingoo/SalonTeamSection";
import SalonLoyaltyCard from "@/components/bingoo/SalonLoyaltyCard";
import BusinessProfileExtras from "@/components/bingoo/BusinessProfileExtras";
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
import { getLinkCategory } from "@/lib/linkCategories";

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
  const byId = link._catalog_id ? CATALOG_ICON_MAP[link._catalog_id] : null;
  if (byId) { const Ic = byId; return <Ic size={size} />; }

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

  const label = (link.label || "").toLowerCase();
  if (label.includes("snapchat"))  return <SnapchatIcon size={size} />;
  if (label.includes("instagram")) return <BIInstagram size={size} />;
  if (label.includes("facebook"))  return <BIFacebook size={size} />;
  if (label.includes("tiktok"))    return <BITikTok size={size} />;
  if (label.includes("linkedin"))  return <BILinkedIn size={size} />;
  if (label.includes("youtube"))   return <BIYouTube size={size} />;
  if (label.includes("twitter") || label === "x") return <TwitterXIcon size={size} />;
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

function SLabel({ children, isDark }) {
  return (
    <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
      color: isDark ? "rgba(255,255,255,0.35)" : "#94a3b8", margin: "0 0 10px", fontFamily: FONT_BODY }}>
      {children}
    </p>
  );
}

const Div = ({ isDark }) => (
  <div style={{ height: 1, background: isDark ? "rgba(255,255,255,0.07)" : "#f0f0f0", margin: "22px 0" }} />
);

function resolveButtonDesign(profile, fallbackColor) {
  const style = profile?.button_style || "pill";
  const color = profile?.button_color || fallbackColor || "#0b2149";
  const radius = style === "pill" ? 999 : style === "rounded" ? 14 : style === "sharp" ? 6 : style === "flat" ? 8 : 14;
  return { style, color, radius, outlined: style === "outlined", flat: style === "flat" };
}

function IconGridItem({ href, onClick, icon, label, ev, track, isDark, tileSize = 58 }) {
  const inner = (
    <motion.div
      whileHover={{ scale: 1.06, y: -1 }} whileTap={{ scale: 0.93 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: "pointer", width: "100%" }}
    >
      <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.13)", flexShrink: 0, width: tileSize, height: tileSize, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </div>
      <span style={{ fontSize: 9.5, fontWeight: 600, color: isDark ? "rgba(255,255,255,0.5)" : "#64748b",
        textAlign: "center", width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
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

function PaymentBtn({ p, color, isDark, buttonDesign }) {
  const [open, setOpen] = useState(false);
  const iconEl = p.e === "wave" ? <WaveIconNew size={32} /> : p.e === "orangemoney" ? <OrangeMoneyIconNew size={32} /> : p.e === "zelle" ? <ZelleIcon size={32} /> : p.e === "cashapp" ? <CashAppIcon size={32} /> : <span style={{ fontSize: 26 }}>{p.e}</span>;
  return (
    <>
      <motion.button type="button" onClick={() => setOpen(true)}
        whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.94 }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7,
          padding: "14px 8px", borderRadius: buttonDesign.radius, cursor: "pointer",
          background: buttonDesign.outlined ? "transparent" : (isDark ? "rgba(255,255,255,0.06)" : hexRgb(buttonDesign.color, buttonDesign.flat ? 0.03 : 0.07)),
          border: buttonDesign.outlined ? `2px solid ${buttonDesign.color}` : `1.5px solid ${hexRgb(buttonDesign.color, isDark ? 0.15 : 0.18)}`,
          color: buttonDesign.color, fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {iconEl}
        <span style={{ textAlign: "center", lineHeight: 1.2 }}>{p.l}{p.qr ? " 🔲" : ""}</span>
      </motion.button>
      <AnimatePresence>
        {open && <ZelleQRModal qrUrl={p.qr} link={p.h} label={p.l} emoji={p.e} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

function RowLink({ href, onClick, iconEl, title, subtitle, chevron = true, isDark, ev, track, buttonDesign, rowStyle = "ios", iconShape = "rounded" }) {
  const radius = rowStyle === "pill" ? 999 : 14;
  const iconRadius = iconShape === "circle" ? "50%" : iconShape === "square" ? 6 : 10;
  const style = {
    display: "flex", alignItems: "center", gap: 12,
    minHeight: 58, padding: "10px 12px", borderRadius: radius,
    background: rowStyle === "outline" ? "transparent" : (isDark ? "rgba(255,255,255,0.07)" : "rgba(248,250,252,0.96)"),
    border: rowStyle === "outline" ? `1px solid ${buttonDesign.color}` : (isDark ? "1px solid rgba(255,255,255,0.09)" : "1px solid rgba(15,23,42,0.07)"),
    boxShadow: rowStyle === "ios" ? (isDark ? "0 1px 0 rgba(255,255,255,0.03) inset" : "0 1px 2px rgba(15,23,42,0.035)") : "none",
    textDecoration: "none", color: "inherit", transition: "transform .16s ease, background .16s ease, box-shadow .16s ease",
  };
  const content = (
    <>
      <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: iconRadius, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>{iconEl}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 14, fontFamily: FONT_BODY,
          color: isDark ? "rgba(255,255,255,0.9)" : "#1e293b",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</p>
        {subtitle && <p style={{ margin: 0, fontSize: 11, color: "#0077b6", fontWeight: 600, fontFamily: FONT_BODY }}>{subtitle}</p>}
      </div>
      {chevron && <span aria-hidden="true" style={{ color: isDark ? "rgba(255,255,255,0.36)" : "#94a3b8", fontSize: 24, lineHeight: 1, fontWeight: 300, flexShrink: 0 }}>›</span>}
    </>
  );
  if (href) return <motion.a href={href} target="_blank" rel="noopener noreferrer" style={style} whileHover={{ x: 3 }} onClick={() => ev && track(ev)}>{content}</motion.a>;
  return <motion.button onClick={onClick} style={{ ...style, width: "100%", border: style.border, cursor: "pointer" }} whileHover={{ x: 3 }}>{content}</motion.button>;
}

// ── Icon grid row renderer ────────────────────────────────────
// wrap=true → CSS grid that wraps (social), wrap=false → single scrollable flex row (contact)
function IconRow({ items, isDark, track, delay = 0.3, wrap = false }) {
  if (!items.length) return null;

  if (wrap) {
    // Wrapping grid: 5 columns on mobile, auto-fit on desktop
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
        style={{ marginBottom: 18 }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: 10,
          padding: "2px 0 4px",
        }}>
          {items.map((item, i) => (
            <IconGridItem key={item.label + i} {...item} track={track} isDark={isDark} tileSize={58} />
          ))}
        </div>
      </motion.div>
    );
  }

  // Non-wrapping: single centered flex row (contact actions — max 4-5 items)
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      style={{ marginBottom: 18 }}>
      <div style={{
        display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap",
        padding: "2px 0 4px",
      }}>
        {items.map((item, i) => (
          <IconGridItem key={item.label + i} {...item} track={track} isDark={isDark} tileSize={58} />
        ))}
      </div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════
export default function ProfileContentSections({ profile, color, isDark, isDemo, deviceCodeParam, track }) {
  const [bookOpen, setBookOpen] = useState(false);
  const [bookService, setBookService] = useState(null);
  const [bookStylist, setBookStylist] = useState(null);
  const [shared, setShared] = useState(false);

  const buttonDesign = resolveButtonDesign(profile, color);
  const linkDisplayStyle = profile.link_display_style || "icons";
  const linkRowStyle = profile.link_row_style || "ios";
  const linkIconShape = profile.link_icon_shape || "rounded";
  const isSalonOrRestaurant = ["salon", "restaurant"].includes(profile.plan);
  const isBusinessProfile = ["business", "corporate"].includes(profile.plan);
  const supportsWhatsAppBooking = isSalonOrRestaurant || profile.plan === "business";
  // Corporate does NOT manage services (no Services sidebar tab) — exclude from public display
  const showsServicesAndTeam = isSalonOrRestaurant || profile.plan === "business";
  const isLawFirmProfile = profile.plan === "lawfirm";
  const canBook = profile.booking_enabled && ["pro", "professional", "business", "corporate", "salon", "restaurant", "lawfirm"].includes(profile.plan);

  // hidden_links: array of profile field keys the owner has disabled
  const hiddenLinks = new Set(profile.hidden_links || []);

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

  // ── Active custom_links (enabled, with url) split by category ──────────────
  const activeCustomLinks = (profile.custom_links || []).filter(l => l.enabled !== false && l.label && l.url);

  // Route each custom link to its category bucket
  const clSocial   = activeCustomLinks.filter(l => getLinkCategory(l) === "social");
  const clPayment  = activeCustomLinks.filter(l => getLinkCategory(l) === "payment");
  const clBusiness = activeCustomLinks.filter(l => getLinkCategory(l) === "business");
  const clContent  = activeCustomLinks.filter(l => getLinkCategory(l) === "content");
  // True generic custom links — anything that didn't resolve to a known category
  const clGeneric  = activeCustomLinks.filter(l => getLinkCategory(l) === "generic");

  // ── Primary contact row ───────────────────────────────────────────────────
  const contactIcons = [
    profile.phone && !hiddenLinks.has("phone") && { href: `tel:${profile.phone}`, icon: <BIPhone size={58} />, label: "Call", ev: "phone_click" },
    supportsWhatsAppBooking && waBookingHref && profile.whatsapp_booking_message && !hiddenLinks.has("whatsapp_number")
      ? { href: waBookingHref, icon: <BIWhatsApp size={58} />, label: "Book WA", ev: "whatsapp_click" }
      : profile.whatsapp_number && !hiddenLinks.has("whatsapp_number") && { href: `https://wa.me/${(profile.whatsapp_number || "").replace(/\D/g, "")}`, icon: <BIWhatsApp size={58} />, label: "WhatsApp", ev: "whatsapp_click" },
    profile.email && !hiddenLinks.has("email") && { href: `mailto:${profile.email}`, icon: <BIEmail size={58} />, label: "Email", ev: "email_click" },
    canBook && { onClick: () => setBookOpen(true), icon: <BICalendar size={58} />, label: "Book", ev: null },
    // Booking custom link goes into contact row too
    ...clBusiness.filter(l => l._catalog_id === "booking").map(l => ({
      href: l.url.startsWith("http") ? l.url : `https://${l.url}`,
      icon: <BICalendar size={58} />, label: l.label, ev: null,
    })),
  ].filter(Boolean);

  // ── Social row: profile fields + custom_links categorized as social ───────
  const socialIcons = [
    profile.instagram_url && !hiddenLinks.has("instagram_url") && { href: profile.instagram_url, icon: <BIInstagram size={58} />, label: "Instagram", ev: "instagram_click" },
    profile.facebook_url && !hiddenLinks.has("facebook_url") && { href: profile.facebook_url, icon: <BIFacebook size={58} />, label: "Facebook", ev: "facebook_click" },
    profile.tiktok_url && !hiddenLinks.has("tiktok_url") && { href: profile.tiktok_url, icon: <BITikTok size={58} />, label: "TikTok", ev: "tiktok_click" },
    profile.linkedin_url && !hiddenLinks.has("linkedin_url") && { href: profile.linkedin_url, icon: <BILinkedIn size={58} />, label: "LinkedIn", ev: "linkedin_click" },
    profile.youtube_url && !hiddenLinks.has("youtube_url") && { href: profile.youtube_url, icon: <BIYouTube size={58} />, label: "YouTube", ev: "youtube_click" },
    // Custom social links (Snapchat, Twitter, Threads, Pinterest, Discord, Twitch)
    ...clSocial.map(l => ({
      href: l.url.startsWith("http") ? l.url : `https://${l.url}`,
      icon: getLinkBrandIcon(l, 58),
      label: l.label,
      ev: null,
    })),
  ].filter(Boolean);

  // ── Payment row (profile fields) ──────────────────────────────────────────
  const payments = [
    profile.payment_link && !hiddenLinks.has("payment_link") && { e: "paypal", l: "PayPal", h: profile.payment_link, qr: null },
    (profile.zelle_qr || profile.zelle_link) && !hiddenLinks.has("zelle_link") && { e: "zelle", l: "Zelle", h: profile.zelle_link || null, qr: profile.zelle_qr || null },
    (profile.cashapp_qr || profile.cashapp_link) && !hiddenLinks.has("cashapp_link") && { e: "cashapp", l: "Cash App", h: profile.cashapp_link || null, qr: profile.cashapp_qr || null },
    (profile.orangemoney_qr || profile.orangemoney_link) && !hiddenLinks.has("orangemoney_link") && { e: "orangemoney", l: "Orange Money", h: profile.orangemoney_link || null, qr: profile.orangemoney_qr || null },
    (profile.wave_qr || profile.wave_link) && !hiddenLinks.has("wave_link") && { e: "wave", l: "Wave", h: profile.wave_link || null, qr: profile.wave_qr || null },
    ...((profile.custom_payments || []).filter(c => c.label && (c.link || c.qr)).map(c => ({ e: c.emoji || "💵", l: c.label, h: c.link || null, qr: c.qr || null }))),
    // Custom payment links (Venmo, etc.)
    ...clPayment.filter(l => !["payment_link","zelle_link","cashapp_link","orangemoney_link","wave_link"].includes(l._catalog_id))
      .map(l => ({ e: "custom", l: l.label, h: l.url, qr: null, icon: getLinkBrandIcon(l, 32) })),
  ].filter(Boolean);

  // ── Business Info row ─────────────────────────────────────────────────────
  const businessCustomLinks = clBusiness.filter(l => l._catalog_id !== "booking");

  return (
    <div>

      {/* ── 3-button action row ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <motion.button onClick={() => { track("save_contact_click"); saveContact(profile); }}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "13px 8px", borderRadius: buttonDesign.radius,
            background: buttonDesign.outlined ? "transparent" : buttonDesign.flat ? buttonDesign.color : `linear-gradient(135deg, ${buttonDesign.color}, ${hexRgb(buttonDesign.color, 0.8)})`,
            color: buttonDesign.outlined ? buttonDesign.color : "#fff", fontWeight: 800, fontSize: 12.5, border: buttonDesign.outlined ? `2px solid ${buttonDesign.color}` : "none", cursor: "pointer",
            boxShadow: buttonDesign.flat || buttonDesign.outlined ? "none" : `0 6px 20px ${hexRgb(buttonDesign.color, 0.35)}`, fontFamily: FONT_BODY }}>
          <SaveContactIcon size={15} /> Save
        </motion.button>
        <div style={{ flex: 1 }}>
          <SaveProfileButton profile={profile} color={buttonDesign.color} buttonStyle={buttonDesign.style} source={deviceCodeParam ? "nfc_scan" : "manual"} />
        </div>
        <motion.button onClick={handleShare}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "13px 8px", borderRadius: buttonDesign.radius,
            background: buttonDesign.outlined || buttonDesign.flat ? "transparent" : (isDark ? "rgba(255,255,255,0.09)" : "#f0f2f5"),
            color: buttonDesign.outlined ? buttonDesign.color : (isDark ? "#fff" : "#374151"), fontWeight: 800, fontSize: 12.5,
            border: buttonDesign.outlined ? `2px solid ${buttonDesign.color}` : (buttonDesign.flat ? "1px solid transparent" : (isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #e4e7ec")), cursor: "pointer", fontFamily: FONT_BODY }}>
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

      {/* ── Business profile extras: logo, offer, gallery, review CTA ── */}
      <BusinessProfileExtras profile={profile} color={color} isDark={isDark} track={track} />

      {/* ── Figma Link Display Style: icon grid or iOS list ── */}
      {linkDisplayStyle === "icons" ? (
        <>
          <IconRow items={contactIcons} isDark={isDark} track={track} delay={0.3} maxInline={4} />
          <IconRow items={socialIcons} isDark={isDark} track={track} delay={0.33} wrap={true} />
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
          {[...contactIcons, ...socialIcons].map((item, i) => (
            <RowLink key={item.label + i} href={item.href} onClick={item.onClick} iconEl={item.icon} title={item.label}
              ev={item.ev} track={track} isDark={isDark} buttonDesign={buttonDesign} rowStyle={linkRowStyle} iconShape={linkIconShape} />
          ))}
        </div>
      )}

      {/* ── Content custom links (Spotify, Shop, Portfolio) as wrapping icon grid ── */}
      {clContent.length > 0 && (
        <IconRow
          items={clContent.map(l => ({
            href: l.url.startsWith("http") ? l.url : `https://${l.url}`,
            icon: getLinkBrandIcon(l, 58),
            label: l.label,
            ev: null,
          }))}
          isDark={isDark} track={track} delay={0.36} wrap={true}
        />
      )}

      {/* ── Generic custom links (true custom web links) ── */}
      {clGeneric.length > 0 && (
        <>
          <Div isDark={isDark} />
          <SLabel isDark={isDark}>Links</SLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 4 }}>
            {clGeneric.map((link, i) => (
              <motion.div key={link.id || i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.05 }}>
                <RowLink
                  href={link.url.startsWith("http") ? link.url : `https://${link.url}`}
                  iconEl={<div style={{ width: 36, height: 36, borderRadius: 10, overflow: "hidden" }}>{getLinkBrandIcon(link, 36)}</div>}
                  title={link.label}
                  isDark={isDark} track={track} buttonDesign={buttonDesign} rowStyle={linkRowStyle} iconShape={linkIconShape}
                />
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* ── Website / Location / Google Review + business custom links ── */}
      {(profile.website && !hiddenLinks.has("website") || (profile.location && profile.show_location !== false && !hiddenLinks.has("location")) || profile.google_review_url || businessCustomLinks.length > 0) && (
        <>
          <Div isDark={isDark} />
          <SLabel isDark={isDark}>Business Info</SLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {profile.website && !hiddenLinks.has("website") && (
              <RowLink href={profile.website} ev="website_click" track={track}
                iconEl={<WebsiteIcon size={20} color={color} />}
                title={profile.website.replace(/^https?:\/\//, "")}
                isDark={isDark} buttonDesign={buttonDesign} rowStyle={linkRowStyle} iconShape={linkIconShape} />
            )}
            {profile.location && profile.show_location !== false && !hiddenLinks.has("location") && (
              <RowLink href={`https://maps.google.com/?q=${encodeURIComponent(profile.location)}`} ev="location_click" track={track}
                iconEl={<MapPinIcon size={20} color="#ef4444" />}
                title={profile.location} subtitle="Get Directions →"
                isDark={isDark} buttonDesign={buttonDesign} rowStyle={linkRowStyle} iconShape={linkIconShape} />
            )}
            {profile.google_review_url && (
              <RowLink href={profile.google_review_url} track={track}
                iconEl={<span style={{ fontSize: 22 }}>⭐</span>}
                title="Leave a Google Review" subtitle="Share your experience →"
                isDark={isDark} buttonDesign={buttonDesign} rowStyle={linkRowStyle} iconShape={linkIconShape} />
            )}
            {businessCustomLinks.map((link, i) => (
              <RowLink key={link.id || i}
                href={link.url.startsWith("http") ? link.url : `https://${link.url}`}
                iconEl={<div style={{ width: 36, height: 36, borderRadius: 10, overflow: "hidden" }}>{getLinkBrandIcon(link, 36)}</div>}
                title={link.label}
                isDark={isDark} track={track} buttonDesign={buttonDesign} rowStyle={linkRowStyle} iconShape={linkIconShape}
              />
            ))}
          </div>
        </>
      )}

      {/* ── Payments ── */}
      {payments.length > 0 && (
        <>
          <Div isDark={isDark} />
          <SLabel isDark={isDark}>Send Money</SLabel>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(payments.length, 4)}, 1fr)`, gap: 10 }}>
            {payments.map((p) => <PaymentBtn key={p.l} p={p} color={color} isDark={isDark} buttonDesign={buttonDesign} rowStyle={linkRowStyle} iconShape={linkIconShape} />)}
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

      {/* ── Services + Team (salon, restaurant, business, corporate) ── */}
      {showsServicesAndTeam && (
        <>
          <Div isDark={isDark} />
          <SalonServicesSection
            profileId={profile.id} color={color} isDark={isDark}
            mode={profile.plan === "business" ? "business" : "salon"}
            onBookService={canBook ? (svc) => { setBookService(svc); setBookOpen(true); } : undefined}
          />
          <SalonTeamSection profileId={profile.id} color={color} isDark={isDark} profile={profile} canBook={true} onBookWithStylist={(stylistName) => { setBookService(null); setBookStylist(stylistName); setBookOpen(true); }} />
          {isSalonOrRestaurant && (
            <SalonLoyaltyCard profileId={profile.id} color={color} isDark={isDark} />
          )}

        </>
      )}

      {/* ── Careers (Business / Corporate only) ── */}
      {isBusinessProfile && (
        <>
          <Div isDark={isDark} />
          <SLabel isDark={isDark}>Careers</SLabel>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            style={{
              display: "flex", alignItems: "center", gap: 14, padding: "16px",
              borderRadius: 16,
              background: isDark ? "rgba(255,255,255,0.05)" : "#f7f8fa",
              border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #ebebeb",
            }}>
            <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
              background: `${color}15` }}>
              <span style={{ fontSize: 20 }}>💼</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14, fontFamily: FONT_BODY, color: isDark ? "rgba(255,255,255,0.9)" : "#1e293b" }}>
                Join Our Team
              </p>
              <p style={{ margin: 0, fontSize: 11, color: isDark ? "rgba(255,255,255,0.4)" : "#64748b", fontFamily: FONT_BODY }}>
                We're always looking for talented people
              </p>
            </div>
            {profile.email && (
              <a href={`mailto:${profile.email}?subject=Career Opportunity at ${encodeURIComponent(profile.company_name || profile.display_name)}`}
                style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 10, background: color, color: "#fff",
                  fontWeight: 700, fontSize: 11, textDecoration: "none", fontFamily: FONT_BODY }}>
                Apply →
              </a>
            )}
          </motion.div>
        </>
      )}

      {/* ── Resume / Portfolio ── */}
      <ProfileResumeSection profileId={profile.id} color={color} isDark={isDark} showDivider />

      {/* ── Attorneys ── */}
      {isLawFirmProfile && (
        <AttorneysSectionPublic profileId={profile.id} color={color} />
      )}

      {/* ── Lead capture — controlled by the profile editor and mirrored publicly ── */}
      {profile.lead_capture_enabled !== false && (
        <>
          <Div isDark={isDark} />
          <LeadCaptureSection profileId={profile.id} color={color} isLawFirm={isLawFirmProfile} />
        </>
      )}

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

      {bookOpen && createPortal(
        <AppointmentBooking
          profile={profile}
          onClose={() => { setBookOpen(false); setBookService(null); setBookStylist(null); }}
          prefilledService={bookService}
          prefilledStylist={bookStylist}
        />,
        document.body
      )}
    </div>
  );
}