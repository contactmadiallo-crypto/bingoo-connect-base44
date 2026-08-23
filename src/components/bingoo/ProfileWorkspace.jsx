import { publicProfileQrUrl, publicProfileUrl } from '@/lib/publicProfileUrl';
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft, Eye, QrCode, Copy, Check, Download, Info, Link2,
  Palette, Share2, Settings, ExternalLink, Plus, Trash2, GripVertical,
  Save, Shield, AlertTriangle, Globe, Mail, Phone, Instagram, Linkedin,
  Facebook, Youtube, Smartphone, CreditCard, AlertOctagon, Lock, Star, X,
  Image as ImageIcon, Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import LivePreviewPanel from "@/components/bingoo/LivePreviewPanel";
import { ProfileHeaderPreview } from "@/components/bingoo/SectionPreview";
import { ClassicLayout, ImageHeroLayout, GlassLayout, DarkPremiumLayout, ColorLayout, MinimalLayout, CardLayout, ModernSaasLayout, ExecutiveLayout, NeonLayout, RetroLayout, AuroraLayout, FloatingLayout, MagazineLayout, LuxuryGoldLayout, PortraitLayout } from "@/components/bingoo/ProfileLayoutRenderer";
import { isLayoutDark } from "@/lib/profileLayouts";
import NewYorkChampionshipLayout from "@/components/bingoo/layouts/NewYorkChampionshipLayout";
import LionsOfTerangaLayout from "@/components/bingoo/layouts/LionsOfTerangaLayout";
import ProfileContentSections from "@/components/bingoo/ProfileContentSections";
import LostDeviceManager from "@/components/bingoo/LostDeviceManager";
import LinkStore from "@/components/bingoo/LinkStore";
import DesignPanel from "@/components/bingoo/DesignPanel";
import ProfileTypeSelector from "@/components/bingoo/ProfileTypeSelector";
import { ProfileSelectorDropdown } from "@/components/bingoo/WorkspaceSelectors";
import PortfolioPanel from "@/components/bingoo/PortfolioPanel";
import BusinessToolsPanel from "@/components/bingoo/BusinessToolsPanel";
import OwnerWalletPanel from "@/components/bingoo/OwnerWalletPanel";
import DeleteProfileModal from "@/components/bingoo/DeleteProfileModal";
import PhoneAlertsSection from "@/components/bingoo/PhoneAlertsSection";
import {
  PhoneIcon as BIPhone, WhatsAppIcon as BIWhatsApp, EmailIcon as BIEmail, WebsiteIcon as BIWebsite,
  InstagramIcon as BIInstagram, LinkedInIcon as BILinkedIn, FacebookIcon as BIFacebook,
  TikTokIcon as BITikTok, YouTubeIcon as BIYouTube, PayPalIcon as BIPayPal,
  CashAppIcon as BICashApp, ZelleIcon as BIZelle, WaveIcon as BIWave, OrangeMoneyIcon as BIOrangeMoney,
  LocationIcon as BILocation, TwitterXIcon as BITwitterX, SnapchatIcon as BISnapchat,
  PinterestIcon as BIPinterest, DiscordIcon as BIDiscord, TwitchIcon as BITwitch,
  ThreadsIcon as BIThreads, VenmoIcon as BIVenmo, SpotifyIcon as BISpotify,
  ShopIcon as BIShop, PortfolioIcon as BIPortfolio, CalendarIcon as BICalendar,
} from "@/components/bingoo/BrandIcons";
import { usePlan } from "@/hooks/usePlan";
import { PLAN_LABELS, PLAN_COLORS, canAccess, resolveActivePlan, normalizePlan } from "@/lib/planPermissions";
import { getProfileEditorTabs } from "@/lib/profileEditorTabs";
import { isProtectedTestAccount, getOverridePlan } from "@/lib/testAccounts";
import { toast } from "sonner";
import { t, getLang } from "@/lib/i18n";

// Resolve a brand icon from a custom_link by _catalog_id or URL domain
function getLinkIcon(link, size = 14) {
  const id  = link._catalog_id || "";
  const url = (link.url || "").toLowerCase();
  const match = (domains) => domains.some(d => url.includes(d));

  const iconMap = {
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
    payment_link:     BIPayPal,
    cashapp_link:     BICashApp,
    zelle_link:       BIZelle,
    wave_link:        BIWave,
    orangemoney_link: BIOrangeMoney,
    twitter_url:      BITwitterX,
    snapchat_url:     BISnapchat,
    pinterest_url:    BIPinterest,
    discord_url:      BIDiscord,
    twitch_url:       BITwitch,
    threads_url:      BIThreads,
    venmo_url:        BIVenmo,
    music_link:       BISpotify,
    shop_link:        BIShop,
    portfolio_link:   BIPortfolio,
    booking:          BICalendar,
  };

  let Icon = iconMap[id];

  // Fallback: infer from URL domain
  if (!Icon) {
    if (match(["instagram.com"]))  Icon = BIInstagram;
    else if (match(["linkedin.com"]))  Icon = BILinkedIn;
    else if (match(["facebook.com", "fb.com"])) Icon = BIFacebook;
    else if (match(["tiktok.com"]))  Icon = BITikTok;
    else if (match(["youtube.com", "youtu.be"])) Icon = BIYouTube;
    else if (match(["x.com", "twitter.com"])) Icon = BITwitterX;
    else if (match(["snapchat.com"])) Icon = BISnapchat;
    else if (match(["pinterest.com"])) Icon = BIPinterest;
    else if (match(["discord.gg", "discord.com"])) Icon = BIDiscord;
    else if (match(["twitch.tv"])) Icon = BITwitch;
    else if (match(["threads.net"])) Icon = BIThreads;
    else if (match(["paypal.com", "paypal.me"])) Icon = BIPayPal;
    else if (match(["cash.app", "cash.me"])) Icon = BICashApp;
    else if (match(["venmo.com"])) Icon = BIVenmo;
    else if (match(["zellepay.com", "zelle"])) Icon = BIZelle;
    else if (match(["wave.com"])) Icon = BIWave;
    else if (match(["spotify.com", "open.spotify"])) Icon = BISpotify;
    else if (match(["calendly.com", "cal.com"])) Icon = BICalendar;
    else Icon = BIWebsite;
  }

  return <Icon size={size} />;
}

// Only these fields are sent to the backend — no system fields (id, created_date, etc.)
const EDITABLE_FIELDS = [
  "display_name", "job_title", "company_name", "company_logo", "location", "phone",
  "whatsapp_number", "email", "website", "bio", "cover_color", "cover_photo",
  "profile_photo", "avatar_shape", "avatar_position", "avatar_placement", "cover_position",
  "instagram_url", "linkedin_url", "facebook_url", "tiktok_url",
  "youtube_url", "payment_link", "zelle_link", "cashapp_link", "wave_link",
  "orangemoney_link", "booking_enabled", "lead_capture_enabled", "whatsapp_booking_message", "custom_links", "hidden_links",
  "layout", "bg_style", "button_style", "username", "is_active", "show_location", "language",
  "qr_color", "qr_label", "qr_watermark", "theme_background_color",
  "bg_watermark_image", "bg_watermark_opacity", "profile_category", "profile_type",
];

function buildPayload(liveForm) {
  const payload = {};
  for (const key of EDITABLE_FIELDS) {
    if (liveForm[key] !== undefined) payload[key] = liveForm[key];
  }
  return payload;
}

// Only send fields the user actually changed. This prevents legacy values in
// unrelated sections (for example an old website without https://) from making
// a basic Info save fail validation.
function buildChangedPayload(liveForm, persistedProfile) {
  const payload = {};
  for (const key of EDITABLE_FIELDS) {
    if (liveForm[key] === undefined) continue;
    if (JSON.stringify(liveForm[key]) !== JSON.stringify(persistedProfile?.[key])) {
      payload[key] = liveForm[key];
    }
  }
  return payload;
}

const COVER_COLORS = [
  "#2563eb","#0b2149","#13284f","#7c3aed",
  "#db2777","#059669","#d97706","#dc2626",
  "#0891b2","#1e293b","#374151","#f97316"
];

const Toggle = ({ value, onChange }) => (
  <button type="button" onClick={() => onChange(!value)}
    className={`w-11 h-6 rounded-full relative transition-colors flex-shrink-0 ${value ? "bg-orange-500" : "bg-slate-300"}`}>
    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${value ? "left-5" : "left-0.5"}`} />
  </button>
);

// ── Compact layout preview for the inline phone shells ───────────────────
function WorkspaceLayoutPreview({ liveForm }) {
  const color = liveForm?.cover_color || "#2563eb";
  const isDark = liveForm?.bg_style === "night" || isLayoutDark(liveForm?.layout);
  const layoutType = liveForm?.layout || "classic";

  const content = (
    <ProfileContentSections
      profile={liveForm}
      color={color}
      isDark={isDark}
      isDemo={false}
      deviceCodeParam={null}
      track={() => {}}
    />
  );

  const lp = { profile: liveForm, color, isDark, mobile: true, contentSections: content };

  let layoutEl;
  if (layoutType === "ny_championship") layoutEl = <NewYorkChampionshipLayout profile={liveForm}>{content}</NewYorkChampionshipLayout>;
  else if (layoutType === "lions_teranga") layoutEl = <LionsOfTerangaLayout profile={liveForm}>{content}</LionsOfTerangaLayout>;
  else switch (layoutType) {
    case "image_hero": case "image": case "video_bg": case "parallax": case "realtor_luxury": layoutEl = <ImageHeroLayout {...lp} />; break;
    case "magazine": layoutEl = <MagazineLayout {...lp} />; break;
    case "aurora": case "animated_gradient": layoutEl = <AuroraLayout {...lp} color={color} />; break;
    case "glassmorphic": case "glass_card": case "glass": case "frosted": case "glass_3d": layoutEl = <GlassLayout {...lp} />; break;
    case "modern_saas": case "split": case "corporate": case "modern_law": layoutEl = <ModernSaasLayout {...lp} />; break;
    case "executive": case "executive_corp": layoutEl = <ExecutiveLayout {...lp} />; break;
    case "luxury_gold": layoutEl = <LuxuryGoldLayout profile={liveForm} mobile={true} contentSections={content} />; break;
    case "dark": case "dark_premium": case "darkpremium": case "luxury": case "minimal_dark": case "cyberpunk": case "premium_salon": case "monochrome": layoutEl = <DarkPremiumLayout {...lp} />; break;
    case "neon": case "neon_tech": layoutEl = <NeonLayout {...lp} />; break;
    case "retro": case "paper": layoutEl = <RetroLayout {...lp} />; break;
    case "floating": layoutEl = <FloatingLayout {...lp} />; break;
    case "bold": case "color_gradient": case "color": case "color_hero": case "sunset": case "ocean": case "forest": case "wave": case "bubbly": layoutEl = <ColorLayout {...lp} />; break;
    case "pastel": case "gradient": case "portrait": layoutEl = <PortraitLayout {...lp} />; break;
    case "minimal": case "minimal_business": layoutEl = <MinimalLayout {...lp} />; break;
    case "card": case "card_compact": layoutEl = <CardLayout {...lp} />; break;
    default: layoutEl = <ClassicLayout {...lp} />;
  }

  return layoutEl;
}

// ── Save status line ──────────────────────────────────────────────────────
function SaveStatus({ status, time, error, lang }) {
  if (!status) return null;
  if (status === "pending") return <p className="text-xs text-slate-400 mt-1">{t("saving", lang)}</p>;
  if (status === "success") return <p className="text-xs text-emerald-600 mt-1">{t("saved_at", lang)} {time}</p>;
  if (status === "error") return <p className="text-xs text-red-500 mt-1">{t("save_failed", lang)}: {error}</p>;
  return null;
}

// ── SaveBtn ───────────────────────────────────────────────────────────────
function SaveBtn({ onSave, isPending, label }) {
  return (
    <Button type="button" onClick={onSave} disabled={isPending}
      className="rounded-xl font-bold text-white px-8" style={{ background: "#f97316" }}>
      {isPending ? <><Save className="w-4 h-4 mr-1.5 animate-pulse" />{label}…</> : <><Save className="w-4 h-4 mr-1.5" />{label}</>}
    </Button>
  );
}

// ── INFO PANEL ────────────────────────────────────────────────────────────
function InfoPanel({ liveForm, setVal, set, onSave, isPending, saveStatus, saveTime, saveError, isDark, profile, userPlan, lang }) {
  const headText    = isDark ? "text-white" : "text-slate-900";
  const isBusinessIdentity = ["business", "lawfirm", "salon", "corporate"].includes(liveForm.profile_type) || liveForm.profile_category === "business";
  const mutedText   = isDark ? "text-white/40" : "text-slate-400";
  const panelBg     = isDark ? "bg-[#13162a]" : "bg-white";
  const panelBorder = isDark ? "border-white/8" : "border-slate-200";
  const inputCls    = `border-slate-200 ${isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/30" : ""}`;

  return (
    <div className="space-y-[18px] max-w-[520px]">
      <div className={`rounded-[14px] border ${panelBorder} ${panelBg} overflow-hidden`}>
        <div className="px-5 py-4 border-b" style={{ borderColor: isDark ? "rgba(255,255,255,.08)" : "#E5EAF2" }}>
          <p className={`text-[15px] font-black ${headText}`}>Basic Information</p>
          <p className={`text-[11px] mt-0.5 ${mutedText}`}>Your identity details. Contact methods are managed in Links.</p>
        </div>

        <div className="px-5 pb-5 pt-5">
          <div className="flex items-end gap-4 mb-5">
            <div className="relative flex-shrink-0">
              {(() => {
                const shapeR = { circle: "50%", rounded: "20%", squircle: "28%", card: "12px" }[liveForm.avatar_shape] || "50%";
                return liveForm.profile_photo
                  ? <img src={liveForm.profile_photo} style={{ width: 64, height: 64, borderRadius: shapeR, objectFit: "cover", objectPosition: liveForm.avatar_position || "center top", border: "4px solid white", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }} alt="" />
                  : <div style={{ width: 64, height: 64, borderRadius: shapeR, border: "4px solid white", boxShadow: "0 4px 16px rgba(0,0,0,0.15)", background: liveForm.cover_color || "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 22 }}>{liveForm.display_name?.charAt(0) || "?"}</div>;
              })()}
              <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer shadow-md">
                <Plus className="w-3.5 h-3.5 text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={async e => {
                  const file = e.target.files[0]; if (!file) return;
                  const { file_url } = await base44.integrations.Core.UploadFile({ file });
                  setVal("profile_photo", file_url);
                }} />
              </label>
            </div>
            <div className="pb-1">
              {(() => {
                const ep = userPlan || "free";
                const colors = PLAN_COLORS[ep] || PLAN_COLORS.free;
                return (
                  <span className="text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide"
                    style={{ background: colors.bg, color: colors.text }}>
                    {PLAN_LABELS[ep] || "Free"}
                  </span>
                );
              })()}
            </div>
          </div>

          {/* Business-only identity */}
          {isBusinessIdentity && <div className="mb-4">
            <Label className={`text-xs font-semibold ${mutedText} block mb-2`}>Brand / Company Logo</Label>
            <div className="flex items-center gap-3">
              {liveForm.company_logo ? (
                <div className="relative flex-shrink-0">
                  <img src={liveForm.company_logo} alt="Logo" style={{ width: 56, height: 56, borderRadius: 10, objectFit: "contain", border: isDark ? "2px solid rgba(255,255,255,0.12)" : "2px solid #e2e8f0", background: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc" }} />
                  <button type="button" onClick={() => setVal("company_logo", "")}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow">×</button>
                </div>
              ) : (
                <div style={{ width: 56, height: 56, borderRadius: 10, background: isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9", border: isDark ? "2px dashed rgba(255,255,255,0.15)" : "2px dashed #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                  🏢
                </div>
              )}
              <div>
                <label className={`cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${isDark ? "border-white/15 text-white/60 hover:bg-white/8" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                  <Plus className="w-3.5 h-3.5" />
                  {liveForm.company_logo ? "Change Logo" : "Upload Logo"}
                  <input type="file" accept="image/*" className="hidden" onChange={async e => {
                    const file = e.target.files[0]; if (!file) return;
                    const { file_url } = await base44.integrations.Core.UploadFile({ file });
                    setVal("company_logo", file_url);
                  }} />
                </label>
                <p className={`text-xs mt-1 ${mutedText}`}>PNG, SVG or JPG · shown on your public profile</p>
              </div>
            </div>
          </div>}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className={`text-xs font-semibold ${mutedText}`}>{t("display_name", lang)} *</Label>
              <Input className={`mt-1 ${inputCls}`} value={liveForm.display_name || ""} onChange={set("display_name")} placeholder="Your Name" />
            </div>
            <div>
              <Label className={`text-xs font-semibold ${mutedText}`}>{t("job_title", lang)}</Label>
              <Input className={`mt-1 ${inputCls}`} value={liveForm.job_title || ""} onChange={set("job_title")} placeholder="CEO / Consultant" />
            </div>
            {isBusinessIdentity && <div className="sm:col-span-2">
              <Label className={`text-xs font-semibold ${mutedText}`}>{t("company", lang)}</Label>
              <Input className={`mt-1 ${inputCls}`} value={liveForm.company_name || ""} onChange={set("company_name")} placeholder="Company Name" />
            </div>}
            <div className="sm:col-span-2">
              <Label className={`text-xs font-semibold ${mutedText}`}>{t("bio", lang)}</Label>
              <Textarea className={`mt-1 ${inputCls}`} rows={4} value={liveForm.bio || ""} onChange={set("bio")} placeholder="Short bio or description..." />
            </div>
          </div>

        </div>
      </div>
      <div className="flex items-center gap-4">
        <SaveBtn onSave={onSave} isPending={isPending} label={t("save_info", lang)} />
        <SaveStatus status={saveStatus} time={saveTime} error={saveError} lang={lang} />
      </div>
    </div>
  );
}

// ── LINKS PANEL — wraps LinkStore sheet ──────────────────────────────────────
function LinksPanel({ liveForm, setVal, set, onSave, isPending, saveStatus, saveTime, saveError, isDark, lang }) {
  const [storeOpen, setStoreOpen] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState(null);
  const headText  = isDark ? "text-white"    : "text-slate-900";
  const mutedText = isDark ? "text-white/40" : "text-slate-400";
  const panelBg   = isDark ? "bg-[#13162a]"  : "bg-white";
  const panelBorder = isDark ? "border-white/8" : "border-slate-200";

  const hiddenLinks = new Set(liveForm.hidden_links || []);
  const links = liveForm.custom_links || [];

  // Toggle visibility of a profile-field link (phone, email, instagram_url, etc.)
  const toggleFieldLink = (key) => {
    const current = new Set(liveForm.hidden_links || []);
    if (current.has(key)) current.delete(key); else current.add(key);
    setVal("hidden_links", [...current]);
  };

  const toggleLink = (idx) => setVal("custom_links", links.map((l, i) => i === idx ? { ...l, enabled: !l.enabled } : l));
  const removeLink = (idx) => setVal("custom_links", links.filter((_, i) => i !== idx));

  // All field-type links that have a value
  const FIELD_LINKS = [
    { key: "phone",           label: "Phone",        Icon: BIPhone,        category: "Contact" },
    { key: "whatsapp_number", label: "WhatsApp",      Icon: BIWhatsApp,     category: "Contact" },
    { key: "email",           label: "Email",         Icon: BIEmail,        category: "Contact" },
    { key: "website",         label: "Website",       Icon: BIWebsite,      category: "Business" },
    { key: "location",        label: "Location",      Icon: BILocation,     category: "Business" },
    { key: "instagram_url",   label: "Instagram",     Icon: BIInstagram,    category: "Social" },
    { key: "linkedin_url",    label: "LinkedIn",      Icon: BILinkedIn,     category: "Social" },
    { key: "facebook_url",    label: "Facebook",      Icon: BIFacebook,     category: "Social" },
    { key: "tiktok_url",      label: "TikTok",        Icon: BITikTok,       category: "Social" },
    { key: "youtube_url",     label: "YouTube",       Icon: BIYouTube,      category: "Social" },
    { key: "payment_link",    label: "PayPal",        Icon: BIPayPal,       category: "Payment" },
    { key: "cashapp_link",    label: "Cash App",      Icon: BICashApp,      category: "Payment" },
    { key: "zelle_link",      label: "Zelle",         Icon: BIZelle,        category: "Payment" },
    { key: "wave_link",       label: "Wave",          Icon: BIWave,         category: "Payment" },
    { key: "orangemoney_link",label: "Orange Money",  Icon: BIOrangeMoney,  category: "Payment" },
  ].filter(r => liveForm[r.key]);

  const totalCount = FIELD_LINKS.length + links.length;

  return (
    <div className="space-y-[18px] pb-4 max-w-[520px]">
      {/* Figma Make links toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className={`text-[16px] font-extrabold ${headText}`}>Links</h2>
          <p className={`text-[12px] mt-0.5 ${mutedText}`}>Manage what appears on your public profile.</p>
        </div>
        <button type="button" onClick={() => setStoreOpen(true)}
          className="flex items-center gap-1.5 px-[18px] py-[9px] rounded-lg text-[13px] font-bold text-white flex-shrink-0"
          style={{ background: "#f97316", boxShadow: "0 4px 12px rgba(249,115,22,0.25)" }}>
          <Plus className="w-[14px] h-[14px]" /> Add Link
        </button>
      </div>

      {totalCount === 0 ? (
        <div className={`text-center px-5 py-9 rounded-[14px] border border-dashed ${isDark ? "bg-[#13162a] border-white/10" : "bg-white border-[#E5EAF2]"}`}>
          <div className="text-[30px] mb-2">🔗</div>
          <div className={`text-[14px] font-bold mb-1 ${headText}`}>No links yet</div>
          <div className={`text-[12px] ${mutedText}`}>Add social media, contact info, payments, and more.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {FIELD_LINKS.map(r => {
            const isHidden = hiddenLinks.has(r.key);
            return (
              <div key={r.key} className={`flex items-center gap-[10px] px-[14px] py-[11px] rounded-[11px] border transition-opacity ${panelBg} ${panelBorder} ${isHidden ? "opacity-55" : ""}`}>
                <GripVertical className="w-[15px] h-[15px] text-slate-300 flex-shrink-0" />
                <div className={`w-[34px] h-[34px] rounded-[9px] flex items-center justify-center flex-shrink-0 ${isDark ? "bg-white/8" : "bg-[#F7F9FC]"}`}>
                  <r.Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-bold ${headText} truncate`}>{r.label}</p>
                </div>
                <button type="button" onClick={() => { setEditingLinkId(r.key); setStoreOpen(true); }}
                  className={`px-[11px] py-[5px] rounded-[7px] border text-[11px] font-semibold ${isDark ? "bg-white/5 border-white/10 text-white/70" : "bg-[#F7F9FC] border-[#E5EAF2] text-[#0F172A]"}`}>
                  Edit
                </button>
                <Toggle value={!isHidden} onChange={() => toggleFieldLink(r.key)} />
              </div>
            );
          })}

          {links.map((link, idx) => (
            <div key={link.id || String(idx)} className={`flex items-center gap-[10px] px-[14px] py-[11px] rounded-[11px] border transition-opacity ${panelBg} ${panelBorder} ${!link.enabled ? "opacity-55" : ""}`}>
              <GripVertical className="w-[15px] h-[15px] text-slate-300 flex-shrink-0" />
              <div className="w-[34px] h-[34px] rounded-[9px] overflow-hidden flex items-center justify-center flex-shrink-0">
                {getLinkIcon(link, 18)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[13px] font-bold ${headText} truncate`}>{link.label}</p>
              </div>
              <button type="button" onClick={() => { setEditingLinkId(link._catalog_id || null); setStoreOpen(true); }}
                className={`px-[11px] py-[5px] rounded-[7px] border text-[11px] font-semibold ${isDark ? "bg-white/5 border-white/10 text-white/70" : "bg-[#F7F9FC] border-[#E5EAF2] text-[#0F172A]"}`}>
                Edit
              </button>
              <Toggle value={!!link.enabled} onChange={() => toggleLink(idx)} />
            </div>
          ))}
        </div>
      )}

      <div className={`rounded-[14px] border ${panelBorder} ${panelBg} px-[14px] py-[13px] flex items-center gap-3`}>
        <div className="flex-1 min-w-0">
          <p className={`text-[13px] font-bold ${headText}`}>Lead Capture</p>
          <p className={`text-[11px] mt-0.5 ${mutedText}`}>Show the contact form on this public profile.</p>
        </div>
        <Toggle value={liveForm.lead_capture_enabled !== false} onChange={(v) => setVal("lead_capture_enabled", v)} />
      </div>

      <div className="pt-1 flex items-center gap-4" style={{ paddingBottom: "calc(80px + env(safe-area-inset-bottom))" }}>
        <SaveBtn onSave={onSave} isPending={isPending} label="Save Links" />
        <SaveStatus status={saveStatus} time={saveTime} error={saveError} lang={lang} />
      </div>

      {/* ── Link Store overlay — Figma Make desktop modal dimensions ── */}
      {storeOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-6">
          <div className="absolute inset-0 bg-black/50" onClick={() => setStoreOpen(false)} />
          <div className={`relative w-full md:w-[640px] md:max-w-[calc(100vw-48px)] md:rounded-[20px] rounded-t-[20px] flex flex-col shadow-2xl overflow-hidden ${isDark ? "bg-[#0e1223]" : "bg-white"}`}
            style={{ height: "min(760px, 88dvh)", maxHeight: "88dvh", minHeight: "0" }}>
            <LinkStore
              liveForm={liveForm}
              setVal={setVal}
              set={set}
              onSave={onSave}
              isPending={isPending}
              isDark={isDark}
              lang={lang}
              initialEditingId={editingLinkId}
              onClose={() => { setStoreOpen(false); setEditingLinkId(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// DesignPanel is now imported from its own file (components/bingoo/DesignPanel.jsx)

// ── SHARE PANEL with QR Customization ────────────────────────────────────
const QR_LABELS = ["Scan Me", "Find Owner", "Return Me", "Contact Owner", "Help Me Get Home"];
const QR_COLORS = ["#1e293b","#0b2149","#f97316","#7c3aed","#059669","#dc2626","#0891b2","#000000"];

function SharePanel({ profileUrl, profileQrUrl, isDark, copiedUrl, onCopy, lang, profile, effectivePlan, liveForm, setVal, onSave, isPending, saveStatus, saveTime, saveError }) {
  const headText    = isDark ? "text-white" : "text-slate-900";
  const mutedText   = isDark ? "text-white/40" : "text-slate-400";
  const panelBg     = isDark ? "bg-[#13162a]" : "bg-white";
  const panelBorder = isDark ? "border-white/8" : "border-slate-200";

  // QR settings — loaded from persisted profile values
  const [qrColor, setQrColorLocal]   = useState(liveForm?.qr_color || profile?.qr_color || "#1e293b");
  const [qrLabel, setQrLabelLocal]   = useState(liveForm?.qr_label || profile?.qr_label || "Scan Me");
  const [customLabel, setCustomLabel] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [logoWatermark, setLogoWatermark] = useState(!!(liveForm?.qr_watermark ?? profile?.qr_watermark));
  const [previewDataUrl, setPreviewDataUrl] = useState(null);

  // Sync to liveForm when values change
  const setQrColor = (v) => { setQrColorLocal(v); setVal("qr_color", v); };
  const setQrLabel = (v) => { setQrLabelLocal(v); setVal("qr_label", v); };
  const setWatermark = (v) => { setLogoWatermark(v); setVal("qr_watermark", v); };

  const isPro = effectivePlan && effectivePlan !== "free";
  const hasLogo = !!profile?.company_logo;

  const displayLabel = customLabel.trim() || qrLabel;
  const bgColor = isDark ? "1e293b" : "f8fafc";
  const fgColor = qrColor.replace("#", "");

  const qrPreviewUrl = profileQrUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(profileQrUrl)}&color=${fgColor}&bgcolor=${bgColor}`
    : null;

  // Compose the exact QR image that will be downloaded (QR + optional logo watermark + label
  // + "Powered by Bingoo Connect" footer) onto a canvas, so the preview matches the download
  // byte-for-byte. Recomputes whenever any input changes — toggling the watermark updates the
  // preview immediately.
  useEffect(() => {
    if (!profileQrUrl) { setPreviewDataUrl(null); return; }
    let cancelled = false;
    const fg = qrColor.replace("#", "");
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(profileQrUrl)}&color=${fg}&bgcolor=ffffff`;
    const canvas = document.createElement("canvas");
    canvas.width = 400; canvas.height = 500;
    const ctx = canvas.getContext("2d");
    const useLogo = logoWatermark && isPro && hasLogo;

    const drawLabelAndFooter = () => {
      ctx.fillStyle = qrColor; ctx.font = "bold 22px system-ui,sans-serif";
      ctx.textAlign = "center"; ctx.fillText(displayLabel, 200, 455);
      ctx.fillStyle = "#0b2149"; ctx.fillRect(0, 468, 400, 32);
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 11px system-ui,sans-serif";
      ctx.fillText("Powered by Bingoo Connect", 200, 489);
    };

    const qrImg = new Image(); qrImg.crossOrigin = "anonymous";
    qrImg.onload = () => {
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, 400, 500);
      ctx.drawImage(qrImg, 0, 30, 400, 400);
      if (!useLogo) { drawLabelAndFooter(); if (!cancelled) setPreviewDataUrl(canvas.toDataURL("image/png")); return; }
      const logoImg = new Image(); logoImg.crossOrigin = "anonymous";
      logoImg.onload = () => {
        const ls = 72, lx = (400 - ls) / 2, ly = 30 + (400 - ls) / 2;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.roundRect(lx - 6, ly - 6, ls + 12, ls + 12, 12); ctx.fill();
        ctx.drawImage(logoImg, lx, ly, ls, ls);
        drawLabelAndFooter();
        if (!cancelled) setPreviewDataUrl(canvas.toDataURL("image/png"));
      };
      logoImg.onerror = () => { drawLabelAndFooter(); if (!cancelled) setPreviewDataUrl(canvas.toDataURL("image/png")); };
      logoImg.src = profile.company_logo;
    };
    qrImg.onerror = () => { if (!cancelled) setPreviewDataUrl(null); };
    qrImg.src = qrSrc;
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileQrUrl, qrColor, displayLabel, logoWatermark, isPro, hasLogo, profile?.company_logo]);

  const handleDownloadQR = () => {
    if (!previewDataUrl || downloading) return;
    setDownloading(true);
    const a = document.createElement("a");
    a.href = previewDataUrl;
    a.download = "bingoo-qr.png";
    a.click();
    setTimeout(() => setDownloading(false), 500);
  };

  return (
    <div className="space-y-4">
      {/* Profile URL */}
      <div className={`rounded-2xl border ${panelBorder} ${panelBg} p-5`}>
        <p className={`font-bold text-sm ${headText} mb-3`}>{t("profile_link", lang)}</p>
        <div className="flex gap-2">
          <input readOnly value={profileUrl || ""}
            className={`flex-1 px-3 py-2 rounded-xl border text-xs font-mono ${isDark ? "bg-white/5 border-white/10 text-white/70" : "bg-slate-50 border-slate-200 text-slate-600"}`} />
          <button type="button" onClick={onCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white"
            style={{ background: copiedUrl ? "#059669" : "#0b2149" }}>
            {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedUrl ? t("copied", lang) : t("copy_link", lang)}
          </button>
          {profileUrl && (
            <a href={profileUrl} target="_blank" rel="noopener noreferrer"
              className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all ${isDark ? "border-white/10 bg-white/6 text-blue-400" : "bg-blue-50 border-blue-200 text-blue-600"}`}>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* QR Code with customization */}
      <div className={`rounded-2xl border ${panelBorder} ${panelBg} p-5 space-y-4`}>
        <p className={`font-bold text-sm ${headText}`}>{t("qr_code", lang)}</p>

        {qrPreviewUrl ? (
          <>
            {/* Live QR preview — composed on canvas, matches the downloaded file exactly (QR + logo watermark + label + footer) */}
            <div className="flex justify-center">
              <div className={`p-4 rounded-2xl text-center ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
                {previewDataUrl ? (
                  <img src={previewDataUrl} alt="QR Code preview" className="rounded-xl mx-auto" style={{ width: 200, height: "auto" }} />
                ) : (
                  <div className="w-[200px] h-[250px] flex items-center justify-center">
                    <span className={`text-xs ${mutedText}`}>Generating preview…</span>
                  </div>
                )}
                <p className={`text-xs mt-2 ${mutedText}`}>Preview matches the downloaded QR exactly.</p>
              </div>
            </div>

            {/* QR Color */}
            <div>
              <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${mutedText}`}>QR Color</p>
              <div className="flex gap-2 flex-wrap">
                {QR_COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setQrColor(c)}
                    className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center flex-shrink-0"
                    style={{ background: c, borderColor: qrColor === c ? "#f97316" : "transparent", transform: qrColor === c ? "scale(1.2)" : "scale(1)" }}>
                    {qrColor === c && <Check className="w-3 h-3 text-white" />}
                  </button>
                ))}
                <div className="w-7 h-7 rounded-full border-2 border-slate-300 overflow-hidden flex-shrink-0">
                  <input type="color" value={qrColor} onChange={e => setQrColor(e.target.value)} className="w-9 h-9 -m-1 cursor-pointer" />
                </div>
              </div>
            </div>

            {/* Label */}
            <div>
              <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${mutedText}`}>Label</p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {QR_LABELS.map(l => (
                  <button key={l} type="button" onClick={() => { setQrLabel(l); setCustomLabel(""); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      qrLabel === l && !customLabel
                        ? "text-white border-orange-400" : isDark ? "border-white/10 text-white/50" : "border-slate-200 text-slate-500"
                    }`}
                    style={qrLabel === l && !customLabel ? { background: "#f97316" } : {}}>
                    {l}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Custom label…"
                value={customLabel}
                onChange={e => setCustomLabel(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl text-sm border outline-none ${isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/30" : "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400"}`}
              />
              <p className={`text-xs mt-1.5 ${mutedText}`}>"Powered by Bingoo Connect" always appears on downloaded QR code.</p>
            </div>

            {/* Logo Watermark — Pro feature */}
            <div className={`rounded-xl border p-3 ${isDark ? "border-white/8 bg-white/4" : "border-slate-100 bg-slate-50"}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className={`text-xs font-bold ${headText}`}>Logo Watermark</p>
                    <span className="text-[11px] font-black px-1.5 py-0.5 rounded-full text-white" style={{ background: "#f97316" }}>Professional</span>
                  </div>
                  <p className={`text-xs mt-0.5 ${mutedText}`}>
                    {!isPro ? "Upgrade to Professional to embed your logo in the center of the QR code."
                      : !hasLogo ? "Upload a company logo in the Info tab first."
                      : "Your business logo will appear centered on the QR code."}
                  </p>
                </div>
                {isPro && hasLogo ? (
                  <Toggle value={logoWatermark} onChange={setWatermark} />
                ) : (
                  <Lock className={`w-4 h-4 flex-shrink-0 ${isDark ? "text-white/25" : "text-slate-300"}`} />
                )}
              </div>
              {isPro && hasLogo && logoWatermark && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={profile.company_logo} alt="Logo preview" className="w-8 h-8 rounded-lg object-contain border border-slate-200 bg-white" />
                  <p className={`text-xs ${mutedText}`}>This logo will be embedded in the downloaded QR code.</p>
                </div>
              )}
            </div>

            {/* Download + Save */}
            <div className="flex gap-2">
              <Button type="button" onClick={handleDownloadQR} disabled={downloading}
                className="flex-1 rounded-xl font-bold gap-2 text-white" style={{ background: "#0b2149" }}>
                <Download className="w-4 h-4" /> {downloading ? "Generating…" : t("download_qr", lang)}
              </Button>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <SaveBtn onSave={onSave} isPending={isPending} label="Save QR Settings" />
              <SaveStatus status={saveStatus} time={saveTime} error={saveError} lang={lang} />
            </div>
          </>
        ) : (
          <p className={`text-sm text-center py-4 ${mutedText}`}>Set a username to generate a QR code.</p>
        )}
      </div>

      <OwnerWalletPanel profile={profile} isDark={isDark} panelBorder={panelBorder} panelBg={panelBg} headText={headText} mutedText={mutedText} />
    </div>
  );
}

// ── LOST MODE PANEL ───────────────────────────────────────────────────────
function LostModePanel({ profileId, user, isDark, effectivePlan }) {
  const [trialLoading, setTrialLoading] = useState(false);
  const isPaid = effectivePlan && effectivePlan !== "free";

  if (!isPaid) {
    // Locked gate for Free accounts
    const startTrial = async () => {
      if (trialLoading) return;
      if (window.self !== window.top) { alert("Open bingooconnect.com to subscribe."); return; }
      setTrialLoading(true);
      try {
        const resp = await base44.functions.invoke("createSubscriptionSession", {
          plan: "professional", trial_days: 14,
          success_url: `${window.location.origin}/bingoo`,
          cancel_url: `${window.location.origin}/bingoo`,
        });
        if (resp?.data?.url) window.location.href = resp.data.url;
      } catch(e) { console.error(e); } finally { setTrialLoading(false); }
    };
    return (
      <div className={`rounded-2xl border-2 p-8 flex flex-col items-center text-center gap-4 ${isDark ? "border-amber-400/20 bg-amber-400/5" : "border-amber-200 bg-amber-50/60"}`}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.3)" }}>
          <Lock className="w-7 h-7 text-amber-500" />
        </div>
        <div>
          <p className={`font-black text-base ${isDark ? "text-white" : "text-slate-900"}`}>Lost Mode — Professional Feature</p>
          <p className={`text-sm mt-2 leading-relaxed max-w-xs ${isDark ? "text-white/50" : "text-slate-500"}`}>
            Enable Lost Mode on your NFC devices so finders can contact you and help recover your items.
          </p>
        </div>
        <button onClick={startTrial} disabled={trialLoading}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black text-white transition-all hover:opacity-90 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #f97316, #FDBA21)" }}>
          <Star className="w-4 h-4" />
          {trialLoading ? "Loading…" : "Try Professional free for 14 days"}
        </button>
        <p className={`text-xs ${isDark ? "text-white/30" : "text-slate-400"}`}>$4.99/mo after 14 days · cancel anytime before trial ends</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-sm text-amber-800">Lost Mode</p>
          <p className="text-xs text-amber-700 mt-0.5">Enable Lost Mode on your NFC device so finders can contact you.</p>
        </div>
      </div>
      <LostDeviceManager profileId={profileId} userId={user?.id} isDark={isDark} tr={(k) => k} onSaved={() => {}} />
    </div>
  );
}

// ── SETTINGS PANEL ────────────────────────────────────────────────────────
function SettingsPanel({ liveForm, setVal, set, onSave, isPending, saveStatus, saveTime, saveError, isDark, lang, profile, user, onDeleted }) {
  const headText    = isDark ? "text-white" : "text-slate-900";
  const mutedText   = isDark ? "text-white/40" : "text-slate-400";
  const panelBg     = isDark ? "bg-[#13162a]" : "bg-white";
  const panelBorder = isDark ? "border-white/8" : "border-slate-200";
  const inputCls    = `border-slate-200 ${isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/30" : ""}`;
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <div className="space-y-4">
      <div className={`rounded-2xl border ${panelBorder} ${panelBg} p-5 space-y-3`}>
        <p className={`font-bold text-sm ${headText}`}>{t("profile_url", lang)}</p>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-3 py-2 rounded-xl ${isDark ? "bg-white/8 text-white/40" : "bg-slate-100 text-slate-500"}`}>/p/</span>
          <Input className={inputCls}
            value={liveForm.username || ""}
            onChange={e => setVal("username", e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
            placeholder="yourusername" />
        </div>
      </div>

      <div className={`rounded-2xl border ${panelBorder} ${panelBg} p-5 space-y-4`}>
        <p className={`font-bold text-sm ${headText}`}>{t("visibility", lang)}</p>
        {[
          { key: "is_active",     label: t("profile_is_live", lang), desc: "Publicly accessible at your profile URL" },
          { key: "show_location", label: t("show_location", lang),   desc: "Display your city/address on the profile" },
        ].map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold ${headText}`}>{label}</p>
              <p className={`text-xs ${mutedText}`}>{desc}</p>
            </div>
            <Toggle value={!!liveForm[key]} onChange={(v) => setVal(key, v)} />
          </div>
        ))}
      </div>

      <div className={`rounded-2xl border ${panelBorder} ${panelBg} p-5 space-y-3`}>
        <p className={`font-bold text-sm ${headText}`}>{t("language_region", lang)}</p>
        <div className="flex gap-2">
          {[{ v: "en", label: "English" }, { v: "fr", label: "Français" }].map(o => {
            const sel = (liveForm.language || "en") === o.v;
            return (
              <button type="button" key={o.v}
                onClick={() => setVal("language", o.v)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border-2 transition-all flex items-center justify-center gap-1.5 ${sel ? "border-orange-400 bg-orange-50 text-orange-600" : "border-slate-200 text-slate-500"}`}>
                {sel && <Check className="w-3 h-3" />}
                {o.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Phone Alerts — account/device-level push notifications (not profile-specific) */}
      <div>
        <p className={`text-xs ${mutedText} mb-2 px-1`}>Account-level · applies to your device, not this profile specifically.</p>
        <PhoneAlertsSection user={user} />
      </div>

      <div className={`rounded-2xl border border-red-200 ${isDark ? "bg-red-900/10" : "bg-red-50"} p-5 space-y-3`}>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-red-500" />
          <p className="font-bold text-sm text-red-600">Danger Zone</p>
        </div>
        <p className={`text-xs ${isDark ? "text-red-300" : "text-red-500"}`}>Disabling your profile hides it from public access instantly.</p>
        <div className="flex flex-col gap-2">
          <button type="button" onClick={() => setVal("is_active", false)}
            className="text-xs font-bold text-red-600 border border-red-300 px-4 py-2 rounded-xl hover:bg-red-100 transition-all">
            Deactivate Profile
          </button>
          <button type="button" onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-white px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 transition-all">
            <Trash2 className="w-3.5 h-3.5" /> Delete Profile Permanently
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <SaveBtn onSave={onSave} isPending={isPending} label={t("save_settings", lang)} />
        <SaveStatus status={saveStatus} time={saveTime} error={saveError} lang={lang} />
      </div>

      {showDeleteModal && (
        <DeleteProfileModal profile={profile} isDark={isDark}
          onClose={() => setShowDeleteModal(false)}
          onDeleted={onDeleted} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────
export default function ProfileWorkspace({
  profileId,
  initialTab,
  onTabChange,
  user,
  onBack,
  isDark,
  isLawFirm,
  isSalon,
  lang: langProp,
  profiles = [],
  onSelectProfile,
  onDirtyChange,
}) {
  const qc = useQueryClient();
  const { plan: userPlan, subscription, isLoading: planIsLoading, isFetching: planIsFetching } = usePlan();
  // Business Tools entitlement must come from the user's OWN runtime Subscription
  // record or a protected test-account override only — never from profile.plan,
  // never from getUserFeatures' "has-profile → Professional" elevation, and never
  // from another user's subscription (admin RLS may surface others' records).
  // Free / loading / unknown / email-mismatched → 'free' (closed): no paid forms leak.
  const ownSub = subscription && subscription.customer_email === user?.email ? subscription : null;
  const businessGatingPlan = ownSub
    ? resolveActivePlan(ownSub)
    : (isProtectedTestAccount(user?.email) ? normalizePlan(getOverridePlan(user?.email) || 'free') : 'free');

  const lang = langProp || getLang();

  const INNER_TABS = getProfileEditorTabs(lang);

  const validInitialTab = INNER_TABS.some((tab) => tab.id === initialTab) ? initialTab : "info";
  const [innerTab, setInnerTab] = useState(validInitialTab);
  const selectInnerTab = useCallback((tabId) => {
    if (!INNER_TABS.some((tab) => tab.id === tabId)) return;
    setInnerTab(tabId);
    onTabChange?.(tabId);
  }, [INNER_TABS, onTabChange]);
  useEffect(() => {
    const next = INNER_TABS.some((tab) => tab.id === initialTab) ? initialTab : "info";
    if (next !== innerTab) setInnerTab(next);
  }, [initialTab]);
  useEffect(() => {
    if (!INNER_TABS.some((tab) => tab.id === innerTab)) selectInnerTab("info");
  }, [innerTab, userPlan]);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  // Track which tab triggered the current save (for post-save routing)
  const saveTabRef = useRef("info");
  const [liveForm, setLiveForm] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // null | "pending" | "success" | "error"
  const [saveTime, setSaveTime] = useState("");
  const [saveError, setSaveError] = useState("");

  const { data: profile, isLoading, refetch: refetchProfile } = useQuery({
    queryKey: ["profile-ws", profileId],
    queryFn: () => base44.functions.invoke("getMyProfiles", { profile_id: profileId }).then((res) => res.data?.profile),
    enabled: !!profileId,
    staleTime: 60000,        // Don't background-refetch while user is editing
    refetchOnWindowFocus: false,
  });

  // Seed liveForm only when the profile ID changes (not on every re-render)
  useEffect(() => {
    if (profile && profile.id === profileId) {
      setLiveForm({ ...profile });
      setSaveStatus(null);
    }
  }, [profile?.id, profileId]);

  // Refresh subscription data when entering the Business tab to ensure the
  // gating plan is current — prevents stale React Query cache from leaking
  // paid forms (e.g. cached 'lawfirm' value showing Business Hours for a
  // user whose subscription was since downgraded).
  useEffect(() => {
    if (innerTab === "business") {
      qc.invalidateQueries({ queryKey: ["my-subscription"] });
    }
  }, [innerTab, qc]);

  const profileUrl    = publicProfileUrl(profile?.username);
  const profileQrUrl  = publicProfileQrUrl(profile?.username);

  // Stable setters — won't cause child remounts
  const set    = useCallback((k) => (e) => setLiveForm(f => ({ ...f, [k]: e.target.value })), []);
  const setVal = useCallback((k, v) => setLiveForm(f => ({ ...f, [k]: v })), []);
  const designKeys = ["layout", "cover_color", "cover_photo", "profile_photo", "avatar_shape", "avatar_position", "avatar_placement", "bg_style", "button_style", "theme_background_color"];
  const designHasChanges = designKeys.some((key) => JSON.stringify(liveForm?.[key]) !== JSON.stringify(profile?.[key]));
  const hasUnsavedChanges = useMemo(() => {
    if (!profile || !liveForm) return false;
    return JSON.stringify(buildPayload(liveForm)) !== JSON.stringify(buildPayload(profile));
  }, [profile, liveForm]);

  useEffect(() => {
    onDirtyChange?.(hasUnsavedChanges);
  }, [hasUnsavedChanges, onDirtyChange]);

  useEffect(() => () => onDirtyChange?.(false), [onDirtyChange]);

  const resetDesign = useCallback(() => {
    setLiveForm((current) => {
      const next = { ...current };
      for (const key of designKeys) next[key] = profile?.[key];
      return next;
    });
  }, [profile]);

  const copyUrl = useCallback(() => {
    if (!profileUrl) return;
    navigator.clipboard.writeText(profileUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  }, [profileUrl]);

  const downloadQR = useCallback(async () => {
    if (!profileQrUrl) return;
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(profileQrUrl)}&color=1e293b&bgcolor=ffffff`;
    const img = new Image(); img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 400; canvas.height = 460;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, 400, 460);
      ctx.drawImage(img, 0, 0, 400, 400);
      ctx.fillStyle = "#0b2149"; ctx.fillRect(0, 400, 400, 60);
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 16px system-ui,sans-serif";
      ctx.textAlign = "center"; ctx.fillText("bingooconnect.com", 200, 433);
      ctx.fillStyle = "#f97316"; ctx.font = "bold 13px system-ui,sans-serif";
      ctx.fillText("Scan to connect", 200, 452);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `bingoo-qr-${profile?.username}.png`;
      a.click();
    };
    img.src = qrSrc;
  }, [profileQrUrl, profile?.username]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!profileId || !liveForm) throw new Error("No profile loaded");
      const payload = buildChangedPayload(liveForm, profile);
      if (Object.keys(payload).length === 0) return profile;
      // 1. Send only changed fields through the ownership-aware backend gate.
      const updateResponse = await base44.functions.invoke("updateProfileGated", { profile_id: profileId, data: payload });
      // 2. Refetch through the same ProfileAccess ownership path to verify persistence.
      const freshResponse = await base44.functions.invoke("getMyProfiles", { profile_id: profileId });
      const fresh = freshResponse.data?.profile || updateResponse.data?.profile;
      if (!fresh) throw new Error("Profile could not be reloaded after saving.");
      // 3. Verify key scalar fields persisted — skip arrays (custom_links, etc.)
      //    which Base44 may reorder or normalize.
      const SCALAR_KEYS = ["display_name","username","job_title","bio","email","phone",
        "cover_color","layout","bg_style","button_style","avatar_shape","avatar_position","avatar_placement",
        "language","is_active","show_location","lead_capture_enabled","booking_enabled","profile_category","profile_type"]; 
      const mismatch = SCALAR_KEYS.find(k => {
        if (payload[k] === undefined) return false;
        return JSON.stringify(payload[k]) !== JSON.stringify(fresh[k]);
      });
      if (mismatch) {
        throw new Error(`Save verification failed: field "${mismatch}" did not persist.`);
      }
      return fresh;
    },
    onMutate: () => {
      setSaveStatus("pending");
      setSaveError("");
      // Dismiss any previous save toast before showing a new one
      toast.dismiss("bingoo-save");
    },
    onSuccess: (fresh) => {
      // Update editor state and query cache with verified server data.
      setLiveForm({ ...fresh });
      qc.setQueryData(["profile-ws", profileId], fresh);
      qc.invalidateQueries({ queryKey: ["my-profile"] });

      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setSaveStatus("success");
      setSaveTime(now);

      if (saveTabRef.current === "info") {
        // Info tab → redirect only after confirmed server persistence
        toast.success(lang === "fr" ? "Profil enregistré !" : "Profile saved!", {
          id: "bingoo-save", duration: 2500,
        });
        setTimeout(() => onBack(), 900);
      } else {
        // All other tabs → stay on page, show inline status, no redirect
        setTimeout(() => setSaveStatus(null), 4000);
      }
    },
    onError: (err) => {
      const backend = err?.response?.data;
      const validation = Array.isArray(backend?.errors) && backend.errors.length
        ? backend.errors.map((item) => `${item.field}: ${item.error}`).join(", ")
        : null;
      const msg = validation || backend?.error || err?.message || "Unknown error";
      setSaveStatus("error");
      setSaveError(msg);
      toast.error(msg, { id: "bingoo-save", duration: 5000 });
    },
  });

  const handleSave = useCallback((tab) => {
    if (saveMutation.isPending) return;
    saveTabRef.current = tab || innerTab;
    saveMutation.mutate();
  }, [saveMutation, innerTab]);

  // Close preview on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && mobilePreviewOpen) {
        setMobilePreviewOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobilePreviewOpen]);

  const headText  = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/40" : "text-slate-400";

  if (isLoading || !liveForm) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Each panel gets its own onSave so the tab id is captured correctly
  const makeSaveProps = (tab) => ({
    onSave: () => handleSave(tab),
    isPending: saveMutation.isPending,
    saveStatus: saveTabRef.current === tab ? saveStatus : null,
    saveTime,
    saveError,
    isDark,
    lang,
  });

  return (
    <div className="flex flex-col min-h-0 relative" style={{ background: isDark ? "#0a0c14" : "#F7F9FC" }}>
      {/* ── Figma Make top bar ── */}
      <div className={`flex items-center gap-3 px-[18px] py-3 border-b flex-shrink-0 z-30 ${isDark ? "bg-[#13162a] border-white/10" : "bg-white border-[#E5EAF2]"}`}>
        <button type="button" onClick={onBack} aria-label="Back to profiles"
          className={`w-[34px] h-[34px] rounded-lg border flex items-center justify-center flex-shrink-0 transition-colors ${isDark ? "bg-white/5 border-white/10 text-white/60" : "bg-[#F7F9FC] border-[#E5EAF2] text-[#0F172A]"}`}>
          <ChevronLeft className="w-[15px] h-[15px]" />
        </button>

        <div className="flex-1 min-w-0">
          <ProfileSelectorDropdown
            profiles={profiles}
            selectedProfile={profiles.find((item) => item.id === profileId) || profile}
            onSelectProfile={onSelectProfile}
            isDark={isDark}
          />
        </div>

        {profileUrl && (
          <a href={profileUrl} target="_blank" rel="noopener noreferrer" aria-label="Preview profile"
            className={`w-[34px] h-[34px] rounded-lg border flex items-center justify-center flex-shrink-0 transition-colors ${isDark ? "bg-white/5 border-white/10 text-white/60" : "bg-[#F7F9FC] border-[#E5EAF2] text-[#64748B]"}`}>
            <Eye className="w-[14px] h-[14px]" />
          </a>
        )}

        <button type="button" onClick={() => handleSave(innerTab)} disabled={saveMutation.isPending || !hasUnsavedChanges}
          className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-[13px] font-bold text-white flex-shrink-0 transition-opacity disabled:opacity-50"
          style={{ background: "#f97316", boxShadow: "0 4px 14px rgba(249,115,22,0.30)" }}>
          {saveMutation.isPending && <Save className="w-[13px] h-[13px] animate-pulse" />}
          Save
        </button>
      </div>

      {/* ── Mobile: horizontal scrollable pill tabs (ScrollableTabBand pattern) ── */}
      <div className="md:hidden w-full min-w-0 overflow-x-auto scrollbar-hide pb-1" style={{ position: "relative", zIndex: 30, WebkitOverflowScrolling: "touch" }}>
        <div className="flex w-max min-w-full gap-2 px-1 whitespace-nowrap">
          {INNER_TABS.map(tab => (
            <button type="button" key={tab.id} onClick={() => selectInnerTab(tab.id)} aria-label={tab.label}
              className={`flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-full text-xs font-bold transition-all flex-shrink-0 ${
                innerTab === tab.id ? "text-white shadow-sm" : (isDark ? "bg-white/8 text-white/50" : "bg-slate-100 text-slate-500")
              }`}
              style={innerTab === tab.id ? { background: "#0b2149" } : {}}>
              <tab.icon className="w-3.5 h-3.5 flex-shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main layout: exact Figma 3-column architecture ── */}
      <div className="flex flex-1 min-h-0 max-w-full overflow-hidden">
        {/* Desktop vertical nav — Figma Make reference: compact 82px icon rail */}
        <div className={`hidden md:flex flex-col gap-0.5 w-[82px] flex-shrink-0 px-1.5 py-2.5 border-r ${isDark ? "bg-[#13162a] border-white/10" : "bg-white border-slate-200"}`}>
          {INNER_TABS.map(tab => (
            <button type="button" key={tab.id} onClick={() => selectInnerTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 px-1 py-2.5 rounded-[10px] text-[9px] font-semibold transition-all text-center w-full min-h-[58px] ${
                innerTab === tab.id
                  ? (isDark ? "bg-blue-500/15 text-blue-300" : "bg-blue-50 text-blue-500")
                  : (isDark ? "text-white/45 hover:bg-white/5 hover:text-white" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600")
              }`}>
              <tab.icon className="w-[18px] h-[18px] flex-shrink-0" />
              <span className="leading-none">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Editing panel */}
        <div className="flex flex-1 min-w-0 min-h-0 max-w-full bg-[#F7F9FC] dark:bg-[#0a0c14]">
          <div className="flex-1 min-w-0 min-h-0 pb-safe overflow-y-auto px-7 py-6">
            {innerTab === "info" && (
              <InfoPanel {...makeSaveProps("info")} liveForm={liveForm} setVal={setVal} set={set} profile={profile} userPlan={userPlan} />
            )}
            {innerTab === "profiletype" && (
              <div className="space-y-5">
                <div className={`rounded-2xl border p-5 ${isDark ? "bg-[#13162a] border-white/10" : "bg-white border-slate-200"}`}>
                  <ProfileTypeSelector
                    profile={liveForm}
                    plan={userPlan || "free"}
                    isDark={isDark}
                    onChange={(category) => {
                      setVal("profile_category", category.id);
                      setVal("profile_type", category.profileType);
                    }}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <SaveBtn onSave={() => handleSave("profiletype")} isPending={saveMutation.isPending} label="Save Profile Type" />
                  <SaveStatus status={saveTabRef.current === "profiletype" ? saveStatus : null} time={saveTime} error={saveError} lang={lang} />
                </div>
              </div>
            )}
            {innerTab === "links" && (
              <LinksPanel {...makeSaveProps("links")} liveForm={liveForm} setVal={setVal} set={set} />
            )}
            {innerTab === "design" && (
              <DesignPanel {...makeSaveProps("design")} liveForm={liveForm} setVal={setVal} userPlan={userPlan} profile={profile} user={user} lang={lang}
                onLayoutChange={() => handleSave("design")}
                onPreview={() => setMobilePreviewOpen(true)}
                onReset={resetDesign}
                hasChanges={designHasChanges}
              />
            )}
            {innerTab === "media" && (
              <PortfolioPanel profileId={profileId} user={user} />
            )}
            {innerTab === "business" && (
              (planIsLoading || planIsFetching) ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <BusinessToolsPanel profileId={profileId} isDark={isDark} userPlan={businessGatingPlan} profile={profile} onSaved={() => {}} />
              )
            )}
            {innerTab === "share" && (
              <SharePanel
                profileUrl={profileUrl} profileQrUrl={profileQrUrl}
                isDark={isDark} copiedUrl={copiedUrl}
                onCopy={copyUrl} lang={lang}
                profile={profile}
                effectivePlan={userPlan || "free"}
                liveForm={liveForm}
                setVal={setVal}
                {...makeSaveProps("share")}
              />
            )}
            {innerTab === "lostmode" && (
              <LostModePanel profileId={profileId} user={user} isDark={isDark} effectivePlan={userPlan || "free"} />
            )}
            {innerTab === "settings" && (
              <SettingsPanel {...makeSaveProps("settings")} liveForm={liveForm} setVal={setVal} set={set}
                profile={profile} user={user} onDeleted={onBack} />
            )}
          </div>

          {/* Mobile preview FAB + overlay — mobile only */}
          <div className="xl:hidden" style={{ pointerEvents: "none" }}>
            {/* FAB — pointer-events re-enabled on the button itself */}
            <button
              type="button"
              onClick={() => setMobilePreviewOpen(true)}
              className="fixed z-30 flex items-center gap-2 px-4 py-3 rounded-full shadow-xl text-white text-sm font-bold"
              style={{ background: "#0b2149", boxShadow: "0 8px 28px rgba(11,33,73,0.5)", bottom: "calc(80px + env(safe-area-inset-bottom))", right: 16, pointerEvents: "auto" }}
            >
              <Eye className="w-4 h-4" /> Preview
            </button>

            {/* Full-screen overlay */}
            {mobilePreviewOpen && (
              <div className="fixed inset-0 z-50 flex flex-col safe-top safe-bottom" style={{ background: isDark ? "#0a0c14" : "#f1f5f9" }}>
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-4 flex-shrink-0" style={{ background: isDark ? "#13162a" : "#fff", borderBottom: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0", paddingTop: "calc(1rem + env(safe-area-inset-top))" }}>
                  <div className="flex items-center gap-2">
                    <p className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"} mr-auto`}>Live Preview</p>
                    {profileUrl && (
                      <a href={profileUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${isDark ? "border-white/10 text-white/70 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                        <ExternalLink className="w-3.5 h-3.5" /> Open live
                      </a>
                    )}
                    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMobilePreviewOpen(false); }}
                      className={`p-2 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isDark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-600"}`}
                      title="Close preview (ESC)">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {/* Preview content — scrollable */}
                <div className="flex-1 overflow-y-auto pb-safe">
                  <div style={{ maxWidth: 480, margin: "0 auto", padding: "16px" }}>
                    {/* Phone shell */}
                    <div style={{ background: "#0f172a", borderRadius: 32, padding: 10, boxShadow: "0 20px 40px rgba(0,0,0,0.35), inset 0 0 0 1.5px rgba(255,255,255,0.07)", margin: "0 auto", maxWidth: 340 }}>
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
                        <div style={{ width: 64, height: 14, background: "#0f172a", borderRadius: "0 0 12px 12px", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                          <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#334155" }} />
                          <div style={{ width: 22, height: 3, borderRadius: 999, background: "#334155" }} />
                        </div>
                      </div>
                      <div style={{ borderRadius: 22, overflowY: "auto", overflowX: "hidden", background: "#f1f5f9", maxHeight: "70vh", position: "relative" }}
                        onClickCapture={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                        <div style={{ width: 375, transform: "scale(0.747)", transformOrigin: "top left", minHeight: Math.round(520 / 0.747), pointerEvents: "none", userSelect: "none" }}>
                          <WorkspaceLayoutPreview liveForm={{ ...(profile || {}), ...liveForm }} />
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
                        <div style={{ width: 60, height: 3, borderRadius: 999, background: "#334155" }} />
                      </div>
                    </div>
                    <p className={`text-[11px] text-center mt-3 ${isDark ? "text-white/30" : "text-slate-400"}`}>Updates as you type</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live preview — desktop only, inline phone frame */}
          <div className={`hidden xl:block flex-shrink-0 border-l overflow-y-auto ${isDark ? "bg-[#0f1220] border-white/10" : "bg-[#F7F9FC] border-[#E5EAF2]"}`} style={{ width: 250, padding: "18px 14px" }}>
            <div style={{ position: "sticky", top: 18 }}>
              <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${mutedText}`}>Live Preview</p>
              {/* Phone shell */}
              <div style={{ background: "#0f172a", borderRadius: 32, padding: "10px 12px", boxShadow: "0 20px 40px rgba(0,0,0,0.35), inset 0 0 0 1.5px rgba(255,255,255,0.07)", width: "fit-content" }}>
                {/* Notch */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
                  <div style={{ width: 64, height: 14, background: "#0f172a", borderRadius: "0 0 12px 12px", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#334155" }} />
                    <div style={{ width: 22, height: 3, borderRadius: 999, background: "#334155" }} />
                  </div>
                </div>
                {/* Screen — exactly 216px wide, 520px tall */}
                <div style={{ borderRadius: 22, width: 216, height: 520, overflowY: "auto", overflowX: "hidden", background: "#f1f5f9", scrollbarWidth: "none", msOverflowStyle: "none" }}
                  onClickCapture={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                  <div style={{ width: 375, transform: "scale(0.576)", transformOrigin: "top left", minHeight: Math.round(520 / 0.576), pointerEvents: "none", userSelect: "none" }}>
                    <WorkspaceLayoutPreview liveForm={{ ...(profile || {}), ...liveForm }} />
                  </div>
                </div>
                {/* Home bar */}
                <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
                  <div style={{ width: 60, height: 3, borderRadius: 999, background: "#334155" }} />
                </div>
              </div>
              <p className={`text-xs text-center mt-2 ${mutedText}`}>Updates as you type</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
