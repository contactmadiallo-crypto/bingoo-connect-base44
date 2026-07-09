import React, { useState, useCallback, useRef, useEffect } from "react";
import { X, Plus, Check, Search, ChevronLeft } from "lucide-react";
import {
  InstagramIcon, LinkedInIcon, FacebookIcon, TikTokIcon,
  YouTubeIcon, XIcon as TwitterXIcon, SnapchatIcon,
  WaveIcon, OrangeMoneyIcon, ZelleIcon, CashAppIcon,
} from "@/components/bingoo/SocialIcons";

const S = (size) => ({ width: size, height: size });
const AppBox = ({ bg, size, radius, children }) => (
  <div style={{ width: size, height: size, borderRadius: radius, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    {children}
  </div>
);

const PhoneIcon = ({ size = 20 }) => (
  <AppBox bg="linear-gradient(145deg,#34c759,#28a745)" size={size + 20} radius={Math.round((size + 20) * 0.24)}>
    <svg viewBox="0 0 24 24" fill="white" style={S(size)}><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>
  </AppBox>
);
const WhatsAppIcon = ({ size = 20 }) => (
  <AppBox bg="linear-gradient(145deg,#25d366,#128c7e)" size={size + 20} radius={Math.round((size + 20) * 0.24)}>
    <svg viewBox="0 0 24 24" fill="white" style={S(size)}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
  </AppBox>
);
const EmailIcon = ({ size = 20 }) => (
  <AppBox bg="linear-gradient(145deg,#4A90D9,#1a6fc4)" size={size + 20} radius={Math.round((size + 20) * 0.24)}>
    <svg viewBox="0 0 24 24" fill="white" style={S(size)}><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
  </AppBox>
);
const WebsiteIcon = ({ size = 20 }) => (
  <AppBox bg="linear-gradient(145deg,#6366f1,#4338ca)" size={size + 20} radius={Math.round((size + 20) * 0.24)}>
    <svg viewBox="0 0 24 24" fill="white" style={S(size)}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
  </AppBox>
);
const LocationIcon = ({ size = 20 }) => (
  <AppBox bg="linear-gradient(145deg,#ef4444,#b91c1c)" size={size + 20} radius={Math.round((size + 20) * 0.24)}>
    <svg viewBox="0 0 24 24" fill="white" style={S(size)}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
  </AppBox>
);

// ── Extra icons not in SocialIcons ───────────────────────────────────────────
const PinterestIcon = ({ size = 20 }) => (
  <AppBox bg="#E60023" size={size + 20} radius={Math.round((size + 20) * 0.24)}>
    <svg viewBox="0 0 24 24" fill="white" style={S(size)}><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
  </AppBox>
);
const DiscordIcon = ({ size = 20 }) => (
  <AppBox bg="#5865F2" size={size + 20} radius={Math.round((size + 20) * 0.24)}>
    <svg viewBox="0 0 24 24" fill="white" style={S(size)}><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/></svg>
  </AppBox>
);
const TwitchIcon = ({ size = 20 }) => (
  <AppBox bg="#9146FF" size={size + 20} radius={Math.round((size + 20) * 0.24)}>
    <svg viewBox="0 0 24 24" fill="white" style={S(size)}><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>
  </AppBox>
);
const ThreadsIcon = ({ size = 20 }) => (
  <AppBox bg="#101010" size={size + 20} radius={Math.round((size + 20) * 0.24)}>
    <svg viewBox="0 0 24 24" fill="white" style={S(size)}><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 013.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.366-.888h-.048c-.84 0-1.964.242-2.684 1.887l-1.92-.404c.66-2.616 2.512-3.282 4.604-3.282h.065c1.566.007 2.888.463 3.826 1.52.94 1.057 1.466 2.62 1.456 4.512.03.12.032.241.006.363l.116.07c1.028.605 1.763 1.44 2.174 2.424.717 1.641.714 4.368-1.57 6.61-1.765 1.727-4.054 2.568-7.025 2.59z"/></svg>
  </AppBox>
);
const PayPalIcon = ({ size = 20 }) => (
  <AppBox bg="linear-gradient(145deg,#003087,#0070BA)" size={size + 20} radius={Math.round((size + 20) * 0.24)}>
    <svg viewBox="0 0 24 24" fill="white" style={S(size)}><path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 00-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 00-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 00.554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 01.923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z"/></svg>
  </AppBox>
);
const VenmoIcon = ({ size = 20 }) => (
  <AppBox bg="linear-gradient(145deg,#3D95CE,#1f7ab5)" size={size + 20} radius={Math.round((size + 20) * 0.24)}>
    <svg viewBox="0 0 24 24" fill="white" style={S(size)}><path d="M19.06 2C19.7 3.17 20 4.37 20 5.76c0 4.4-3.76 10.12-6.82 14.14H6.35L3 2.92l6.07-.57 1.72 13.9c1.6-2.6 3.58-6.7 3.58-9.5 0-1.53-.27-2.57-.7-3.42L19.06 2z"/></svg>
  </AppBox>
);
const CalendarIcon = ({ size = 20 }) => (
  <AppBox bg="linear-gradient(145deg,#006BFF,#0057d4)" size={size + 20} radius={Math.round((size + 20) * 0.24)}>
    <svg viewBox="0 0 24 24" fill="white" style={S(size)}><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
  </AppBox>
);
const SpotifyIcon = ({ size = 20 }) => (
  <AppBox bg="linear-gradient(145deg,#1DB954,#158a3e)" size={size + 20} radius={Math.round((size + 20) * 0.24)}>
    <svg viewBox="0 0 24 24" fill="white" style={S(size)}><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
  </AppBox>
);
const ShopIcon = ({ size = 20 }) => (
  <AppBox bg="linear-gradient(145deg,#96bf48,#6a8e2a)" size={size + 20} radius={Math.round((size + 20) * 0.24)}>
    <svg viewBox="0 0 24 24" fill="white" style={S(size)}><path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12zM12 13c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>
  </AppBox>
);
const PortfolioIcon = ({ size = 20 }) => (
  <AppBox bg="linear-gradient(145deg,#7c3aed,#5b21b6)" size={size + 20} radius={Math.round((size + 20) * 0.24)}>
    <svg viewBox="0 0 24 24" fill="white" style={S(size)}><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>
  </AppBox>
);

// ── Link catalog with real brand icons ───────────────────────────────────────
const LINK_CATALOG = [
  // Contact
  { id: "phone",           label: "Phone",           category: "contact",  Icon: PhoneIcon,       field: "phone",            placeholder: "+1 555 000 0000",            type: "field" },
  { id: "whatsapp_number", label: "WhatsApp",         category: "contact",  Icon: WhatsAppIcon,    field: "whatsapp_number",  placeholder: "+1 555 000 0000",            type: "field" },
  { id: "email",           label: "Email",            category: "contact",  Icon: EmailIcon,       field: "email",            placeholder: "you@example.com",            type: "field" },
  { id: "website",         label: "Website",          category: "contact",  Icon: WebsiteIcon,     field: "website",          placeholder: "https://yoursite.com",       type: "field" },
  { id: "location",        label: "Location",         category: "contact",  Icon: LocationIcon,    field: "location",         placeholder: "City, Country",              type: "field" },
  // Social
  { id: "instagram_url",   label: "Instagram",        category: "social",   Icon: InstagramIcon,   field: "instagram_url",    placeholder: "https://instagram.com/you",  type: "field" },
  { id: "linkedin_url",    label: "LinkedIn",         category: "social",   Icon: LinkedInIcon,    field: "linkedin_url",     placeholder: "https://linkedin.com/in/you",type: "field" },
  { id: "facebook_url",    label: "Facebook",         category: "social",   Icon: FacebookIcon,    field: "facebook_url",     placeholder: "https://facebook.com/you",   type: "field" },
  { id: "tiktok_url",      label: "TikTok",           category: "social",   Icon: TikTokIcon,      field: "tiktok_url",       placeholder: "https://tiktok.com/@you",    type: "field" },
  { id: "youtube_url",     label: "YouTube",          category: "social",   Icon: YouTubeIcon,     field: "youtube_url",      placeholder: "https://youtube.com/@you",   type: "field" },
  { id: "twitter_url",     label: "X / Twitter",      category: "social",   Icon: TwitterXIcon,    field: null,               placeholder: "https://x.com/you",          type: "custom" },
  { id: "snapchat_url",    label: "Snapchat",         category: "social",   Icon: SnapchatIcon,    field: null,               placeholder: "https://snapchat.com/add/you",type: "custom" },
  { id: "pinterest_url",   label: "Pinterest",        category: "social",   Icon: PinterestIcon,   field: null,               placeholder: "https://pinterest.com/you",  type: "custom" },
  { id: "discord_url",     label: "Discord",          category: "social",   Icon: DiscordIcon,     field: null,               placeholder: "https://discord.gg/...",     type: "custom" },
  { id: "twitch_url",      label: "Twitch",           category: "social",   Icon: TwitchIcon,      field: null,               placeholder: "https://twitch.tv/you",      type: "custom" },
  { id: "threads_url",     label: "Threads",          category: "social",   Icon: ThreadsIcon,     field: null,               placeholder: "https://threads.net/@you",   type: "custom" },
  // Payment
  { id: "payment_link",    label: "PayPal",           category: "payment",  Icon: PayPalIcon,      field: "payment_link",     placeholder: "https://paypal.me/...",      type: "field" },
  { id: "cashapp_link",    label: "Cash App",         category: "payment",  Icon: CashAppIcon,     field: "cashapp_link",     placeholder: "https://cash.app/$...",      type: "field" },
  { id: "zelle_link",      label: "Zelle",            category: "payment",  Icon: ZelleIcon,       field: "zelle_link",       placeholder: "https://enroll.zellepay.com/",type: "field" },
  { id: "wave_link",       label: "Wave",             category: "payment",  Icon: WaveIcon,        field: "wave_link",        placeholder: "https://wave.com/...",       type: "field" },
  { id: "orangemoney_link",label: "Orange Money",     category: "payment",  Icon: OrangeMoneyIcon, field: "orangemoney_link", placeholder: "https://...",                type: "field" },
  { id: "venmo_url",       label: "Venmo",            category: "payment",  Icon: VenmoIcon,       field: null,               placeholder: "https://venmo.com/u/...",    type: "custom" },
  // Business
  { id: "booking",         label: "Booking / Calendly",category:"business", Icon: CalendarIcon,    field: null,               placeholder: "https://calendly.com/...",   type: "custom" },
  // Content
  { id: "music_link",      label: "Music / Spotify",  category: "content",  Icon: SpotifyIcon,     field: null,               placeholder: "https://open.spotify.com/...",type: "custom" },
  { id: "shop_link",       label: "Online Shop",      category: "content",  Icon: ShopIcon,        field: null,               placeholder: "https://yourshop.com/...",   type: "custom" },
  { id: "portfolio_link",  label: "Portfolio Site",   category: "content",  Icon: PortfolioIcon,   field: null,               placeholder: "https://yourportfolio.com/...",type: "custom" },
];

const CATEGORIES = [
  { id: "all",     label: "All" },
  { id: "popular", label: "Popular" },
  { id: "contact", label: "Contact" },
  { id: "social",  label: "Social" },
  { id: "business",label: "Business" },
  { id: "content", label: "Content" },
  { id: "payment", label: "Payment" },
];

const POPULAR_IDS = new Set(["phone", "whatsapp_number", "instagram_url", "linkedin_url", "website", "payment_link", "email", "facebook_url"]);

// Group catalog by category for sectioned display
const CATEGORY_LABELS = {
  contact: "Contact Info",
  social: "Social Media",
  payment: "Payment",
  business: "Business",
  content: "Content",
};

// ── Focused form for editing a single link item ──────────────────────────────
// Returns [formEl, saveCallback] so parent can render a sticky Save button
function LinkEditForm({ item, currentValue, currentLabel, onSave, onBack, isDark, saveRef }) {
  const [val, setVal]     = useState(currentValue || "");
  const [label, setLabel] = useState(currentLabel || item.label);

  // Expose save fn to parent via ref — update on every render so val/label are always fresh
  useEffect(() => {
    if (saveRef) saveRef.current = () => onSave(val, label);
  });

  const inputCls = `w-full px-3 py-2.5 rounded-xl text-sm border outline-none transition-all ${
    isDark
      ? "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-orange-400/60"
      : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-300 focus:border-orange-400"
  }`;

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className={`p-2 rounded-xl transition-colors ${isDark ? "hover:bg-white/8 text-white/60" : "hover:bg-slate-100 text-slate-500"}`}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3">
          <item.Icon size={16} />
          <span className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>{item.label}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className={`block text-xs font-bold mb-1.5 ${isDark ? "text-white/50" : "text-slate-500"}`}>Label</label>
          <input
            type="text" className={inputCls}
            value={label} onChange={e => setLabel(e.target.value)}
            placeholder={item.label} autoComplete="off"
          />
        </div>
        <div>
          <label className={`block text-xs font-bold mb-1.5 ${isDark ? "text-white/50" : "text-slate-500"}`}>
            {item.id === "phone" || item.id === "whatsapp_number" ? "Phone Number" : item.id === "email" ? "Email Address" : "URL / Link"}
          </label>
          <input
            type="text" className={inputCls}
            value={val} onChange={e => setVal(e.target.value)}
            placeholder={item.placeholder} autoComplete="off" autoFocus
          />
        </div>
      </div>
    </div>
  );
}

// ── Catalog row (single item) ─────────────────────────────────────────────────
function CatalogRow({ item, added, valuePreview, onEdit, isDark }) {
  const headText = isDark ? "text-white" : "text-slate-900";
  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl border transition-all ${
      added
        ? isDark ? "border-emerald-500/25 bg-emerald-500/5" : "border-emerald-200 bg-emerald-50/60"
        : isDark ? "border-white/6 bg-white/[0.025] hover:bg-white/[0.05]" : "border-slate-100 bg-white hover:bg-slate-50"
    }`}>
      <item.Icon size={16} />
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm ${headText}`}>{item.label}</p>
        {added && valuePreview && (
          <p className={`text-xs truncate ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>{valuePreview}</p>
        )}
      </div>
      <button
        onClick={onEdit}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 transition-all ${
          added
            ? isDark ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25" : "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100"
            : "text-white hover:opacity-90"
        }`}
        style={!added ? { background: "#f97316" } : {}}>
        {added ? <><Check className="w-3 h-3" />Edit</> : <><Plus className="w-3 h-3" />Add</>}
      </button>
    </div>
  );
}

// ── Main LinkStore sheet ──────────────────────────────────────────────────────
export default function LinkStore({ liveForm, setVal, set, onSave, isPending, isDark, lang, onClose }) {
  const [cat, setCat]           = useState("all");
  const [search, setSearch]     = useState("");
  const [editing, setEditing]   = useState(null);
  const editSaveRef             = useRef(null);
  const [webOpen, setWebOpen]   = useState(false);
  const [webLabel, setWebLabel] = useState("");
  const [webUrl, setWebUrl]     = useState("https://");

  const headText  = isDark ? "text-white"    : "text-slate-900";
  const mutedText = isDark ? "text-white/40" : "text-slate-400";
  const borderCls = isDark ? "border-white/8" : "border-slate-200";
  const inputCls  = `w-full px-3 py-2 rounded-xl text-sm border outline-none ${isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/20" : "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400"}`;

  const getFieldValue = useCallback((item) => {
    if (item.type === "field" && item.field) return liveForm[item.field] || "";
    const cl = (liveForm.custom_links || []).find(l => l._catalog_id === item.id);
    return cl?.url || "";
  }, [liveForm]);

  // Robust active detection: checks field value, _catalog_id, URL domain, and label
  const isCatalogItemActive = useCallback((item) => {
    // 1. Direct field value (phone, email, instagram_url, etc.)
    if (item.type === "field" && item.field && liveForm[item.field]) return true;
    // 2. custom_links match by _catalog_id
    const byId = (liveForm.custom_links || []).find(l => l._catalog_id === item.id);
    if (byId) return true;
    // 3. custom_links match by URL domain (for platforms like snapchat that have no field)
    const domainMap = {
      twitter_url:    ["x.com", "twitter.com"],
      snapchat_url:   ["snapchat.com"],
      pinterest_url:  ["pinterest.com"],
      discord_url:    ["discord.gg", "discord.com"],
      twitch_url:     ["twitch.tv"],
      threads_url:    ["threads.net"],
      venmo_url:      ["venmo.com"],
      booking:        ["calendly.com", "cal.com"],
      music_link:     ["spotify.com", "open.spotify"],
      shop_link:      ["shopify.com", "etsy.com", "gumroad.com"],
      portfolio_link: ["portfolio", "behance.net", "dribbble.com"],
    };
    const domains = domainMap[item.id];
    if (domains) {
      const match = (liveForm.custom_links || []).find(l => {
        const url = (l.url || "").toLowerCase();
        return domains.some(d => url.includes(d));
      });
      if (match) return true;
    }
    // 4. custom_links match by normalized label
    const normalizedLabel = item.label.toLowerCase().replace(/[^a-z]/g, "");
    const byLabel = (liveForm.custom_links || []).find(l =>
      (l.label || "").toLowerCase().replace(/[^a-z]/g, "") === normalizedLabel
    );
    if (byLabel) return true;
    return false;
  }, [liveForm]);

  const getValuePreview = useCallback((item) => {
    if (item.type === "field" && item.field) return liveForm[item.field] || "";
    const cl = (liveForm.custom_links || []).find(l =>
      l._catalog_id === item.id ||
      (l.label || "").toLowerCase().replace(/[^a-z]/g, "") === item.label.toLowerCase().replace(/[^a-z]/g, "")
    );
    return cl?.url || "";
  }, [liveForm]);

  const isAdded = (item) => isCatalogItemActive(item);

  const filtered = LINK_CATALOG.filter(item => {
    const matchCat = cat === "all" || (cat === "popular" ? POPULAR_IDS.has(item.id) : item.category === cat);
    const matchSearch = !search || item.label.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Build grouped view for "all" category
  const grouped = {};
  if (cat === "all" && !search) {
    // Popular first
    const popularItems = filtered.filter(i => POPULAR_IDS.has(i.id));
    if (popularItems.length) grouped["Popular"] = popularItems;
    for (const [key, label] of Object.entries(CATEGORY_LABELS)) {
      const items = filtered.filter(i => i.category === key);
      if (items.length) grouped[label] = items;
    }
  }

  const handleSaveItem = (item, val, label) => {
    if (item.type === "field" && item.field) {
      // For direct profile fields (phone, email, etc.) — save immediately
      setVal(item.field, val);
      setEditing(null);
      // Defer save to next tick so React state flush completes
      setTimeout(() => onSave("links"), 0);
    } else {
      // For custom_links — build the new array first, then set + save atomically
      const current = liveForm.custom_links || [];
      const existing = current.findIndex(l => l._catalog_id === item.id);
      let updated;
      if (existing >= 0) {
        updated = [...current];
        updated[existing] = { ...updated[existing], label, url: val };
      } else {
        updated = [...current, { id: Date.now().toString(), _catalog_id: item.id, category: item.category, label, url: val, enabled: true }];
      }
      setVal("custom_links", updated);
      setEditing(null);
      // Defer save so React flushes the state update before reading liveForm in the mutation
      setTimeout(() => onSave("links"), 0);
    }
  };

  const handleAddWebLink = () => {
    if (!webLabel || !webUrl || webUrl === "https://") return;
    const current = liveForm.custom_links || [];
    const updated = [...current, { id: Date.now().toString(), label: webLabel, url: webUrl, enabled: true }];
    setVal("custom_links", updated);
    setWebLabel(""); setWebUrl("https://"); setWebOpen(false);
    setTimeout(() => onSave("links"), 0);
  };

  const addedCount = LINK_CATALOG.filter(i => isCatalogItemActive(i)).length + (liveForm.custom_links?.filter(l => !l._catalog_id).length || 0);

  return (
    <div className="flex flex-col h-full safe-top">
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-4 border-b ${borderCls} flex-shrink-0`}
        style={{ paddingTop: "calc(1rem + env(safe-area-inset-top))" }}>
        <div>
          <h2 className={`font-black text-base ${headText}`}>Add Link</h2>
          {addedCount > 0 && <p className={`text-xs ${mutedText}`}>{addedCount} added</p>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWebOpen(v => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold text-white transition-all hover:opacity-90"
            style={{ background: "#0b2149" }}>
            <Plus className="w-3.5 h-3.5" /> Web Link
          </button>
          <button onClick={onClose} className={`p-2 rounded-xl transition-colors ${isDark ? "hover:bg-white/8 text-white/50" : "hover:bg-slate-100 text-slate-500"}`}>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Web Link quick-add */}
      {webOpen && (
        <div className={`px-4 py-3 border-b ${borderCls} space-y-2 flex-shrink-0 ${isDark ? "bg-white/[0.03]" : "bg-slate-50"} max-h-24 overflow-y-auto`}>
          <div className="flex gap-2">
            <input type="text" className={inputCls + " flex-1"} placeholder="Label (e.g. Book Now)" value={webLabel} onChange={e => setWebLabel(e.target.value)} />
            <input type="text" className={inputCls + " flex-1"} placeholder="https://..." value={webUrl} onChange={e => setWebUrl(e.target.value)} />
            <button onClick={handleAddWebLink} className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-white flex-shrink-0" style={{ background: "#f97316" }}>
              <Plus className="w-3.5 h-3.5" />Add
            </button>
          </div>
        </div>
      )}

      {editing ? (
        <>
          {/* Scrollable form content with bottom padding to clear sticky button */}
          <div className="flex-1 overflow-y-auto px-4 py-4"
            style={{ paddingBottom: "calc(120px + env(safe-area-inset-bottom))" }}>
            <LinkEditForm
              item={editing}
              currentValue={getFieldValue(editing)}
              currentLabel={editing.label}
              onSave={(val, label) => handleSaveItem(editing, val, label)}
              onBack={() => setEditing(null)}
              isDark={isDark}
              saveRef={editSaveRef}
            />
          </div>
          {/* Sticky Save — fixed above bottom nav, always visible on iOS Safari + Android */}
          <div style={{
            position: "fixed",
            bottom: "calc(84px + env(safe-area-inset-bottom))",
            left: "50%",
            transform: "translateX(-50%)",
            width: "calc(100% - 32px)",
            maxWidth: 520,
            zIndex: 100,
          }}>
            <button
              onClick={() => editSaveRef.current?.()}
              className="w-full py-3.5 rounded-2xl text-sm font-black text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: "linear-gradient(135deg, #f97316, #FDBA21)", boxShadow: "0 4px 20px rgba(249,115,22,0.4)" }}>
              Save
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Category pills + Search */}
          <div className={`px-4 py-3 border-b ${borderCls} flex-shrink-0 space-y-2 max-h-28 overflow-y-auto`}>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setCat(c.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                    cat === c.id ? "text-white" : isDark ? "bg-white/5 text-white/50 hover:bg-white/10" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                  style={cat === c.id ? { background: "#0b2149" } : {}}>
                  {c.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input type="text" className={inputCls + " pl-8"} placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          {/* Catalog */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {filtered.length === 0 && (
              <p className={`text-center py-8 text-sm ${mutedText}`}>No links found</p>
            )}

            {/* Grouped view (all + no search) */}
            {cat === "all" && !search && Object.keys(grouped).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(grouped).map(([groupLabel, items]) => (
                  <div key={groupLabel}>
                    <p className={`text-[11px] font-bold uppercase tracking-widest mb-2 ${mutedText}`}>{groupLabel}</p>
                    <div className="space-y-2">
                      {items.map(item => (
                        <CatalogRow key={item.id} item={item} added={isAdded(item)}
                          valuePreview={getValuePreview(item)} onEdit={() => setEditing(item)} isDark={isDark} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Flat view
              <div className="space-y-2">
                {filtered.map(item => (
                  <CatalogRow key={item.id} item={item} added={isAdded(item)}
                    valuePreview={getValuePreview(item)} onEdit={() => setEditing(item)} isDark={isDark} />
                ))}
              </div>
            )}
          </div>

          {/* Done button */}
          <div className={`flex-shrink-0 px-4 py-4 border-t ${borderCls}`}
            style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl text-sm font-black text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: "linear-gradient(135deg, #0b2149, #13284f)" }}>
              Done
            </button>
          </div>
        </>
      )}
    </div>
  );
}