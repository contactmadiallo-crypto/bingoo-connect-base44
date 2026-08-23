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

function getLinkIcon(link, size = 14) {
  const id  = link._catalog_id || "";
  const url = (link.url || "").toLowerCase();
  const match = (domains) => domains.some(d => url.includes(d));

  const iconMap = {
    phone: BIPhone, whatsapp_number: BIWhatsApp, email: BIEmail, website: BIWebsite,
    location: BILocation, instagram_url: BIInstagram, linkedin_url: BILinkedIn,
    facebook_url: BIFacebook, tiktok_url: BITikTok, youtube_url: BIYouTube,
    payment_link: BIPayPal, cashapp_link: BICashApp, zelle_link: BIZelle,
    wave_link: BIWave, orangemoney_link: BIOrangeMoney, twitter_url: BITwitterX,
    snapchat_url: BISnapchat, pinterest_url: BIPinterest, discord_url: BIDiscord,
    twitch_url: BITwitch, threads_url: BIThreads, venmo_url: BIVenmo,
    music_link: BISpotify, shop_link: BIShop, portfolio_link: BIPortfolio, booking: BICalendar,
  };

  let Icon = iconMap[id];
  if (!Icon) {
    if (match(["instagram.com"])) Icon = BIInstagram;
    else if (match(["linkedin.com"])) Icon = BILinkedIn;
    else if (match(["facebook.com", "fb.com"])) Icon = BIFacebook;
    else if (match(["tiktok.com"])) Icon = BITikTok;
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

const EDITABLE_FIELDS = [
  "display_name", "job_title", "company_name", "company_logo", "location", "phone",
  "whatsapp_number", "email", "website", "bio", "cover_color", "cover_photo",
  "profile_photo", "avatar_shape", "avatar_position", "avatar_placement", "cover_position",
  "instagram_url", "linkedin_url", "facebook_url", "tiktok_url",
  "youtube_url", "payment_link", "zelle_link", "cashapp_link", "wave_link",
  "orangemoney_link", "booking_enabled", "whatsapp_booking_message", "custom_links", "hidden_links",
  "layout", "bg_style", "button_style", "username", "is_active", "show_location", "language",
  "qr_color", "qr_label", "qr_watermark", "theme_background_color",
  "bg_watermark_image", "bg_watermark_opacity", "profile_category", "profile_type",
];

function buildPayload(liveForm) {
  const payload = {};
  for (const key of EDITABLE_FIELDS) if (liveForm[key] !== undefined) payload[key] = liveForm[key];
  return payload;
}

const COVER_COLORS = ["#2563eb","#0b2149","#13284f","#7c3aed","#db2777","#059669","#d97706","#dc2626","#0891b2","#1e293b","#374151","#f97316"];

const Toggle = ({ value, onChange }) => (
  <button type="button" onClick={() => onChange(!value)} className={`w-11 h-6 rounded-full relative transition-colors flex-shrink-0 ${value ? "bg-orange-500" : "bg-slate-300"}`}>
    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${value ? "left-5" : "left-0.5"}`} />
  </button>
);

function WorkspaceLayoutPreview({ liveForm }) {
  const color = liveForm?.cover_color || "#2563eb";
  const isDark = liveForm?.bg_style === "night" || isLayoutDark(liveForm?.layout);
  const layoutType = liveForm?.layout || "classic";
  const content = <ProfileContentSections profile={liveForm} color={color} isDark={isDark} isDemo={false} deviceCodeParam={null} track={() => {}} />;
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

function SaveStatus({ status, time, error, lang }) {
  if (!status) return null;
  if (status === "pending") return <p className="text-xs text-slate-400 mt-1">{t("saving", lang)}</p>;
  if (status === "success") return <p className="text-xs text-emerald-600 mt-1">{t("saved_at", lang)} {time}</p>;
  if (status === "error") return <p className="text-xs text-red-500 mt-1">{t("save_failed", lang)}: {error}</p>;
  return null;
}

function SaveBtn({ onSave, isPending, label }) {
  return <Button type="button" onClick={onSave} disabled={isPending} className="rounded-xl font-bold text-white px-8" style={{ background: "#f97316" }}>
    {isPending ? <><Save className="w-4 h-4 mr-1.5 animate-pulse" />{label}…</> : <><Save className="w-4 h-4 mr-1.5" />{label}</>}
  </Button>;
}

function InfoPanel({ liveForm, setVal, set, onSave, isPending, saveStatus, saveTime, saveError, isDark, profile, userPlan, lang }) {
  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/40" : "text-slate-400";
  const panelBg = isDark ? "bg-[#13162a]" : "bg-white";
  const panelBorder = isDark ? "border-white/8" : "border-slate-200";
  const inputCls = `border-slate-200 ${isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/30" : ""}`;
  return <div className="space-y-5">
    <div className={`rounded-2xl border ${panelBorder} ${panelBg} overflow-hidden`}>
      <div className="relative cursor-pointer group overflow-hidden" style={{ height: "140px" }}>
        {liveForm.cover_photo ? <img src={liveForm.cover_photo} alt="" className="absolute inset-0 w-full h-full" style={{ objectFit: "cover", objectPosition: liveForm.cover_position || "center" }} /> : <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${liveForm.cover_color || "#2563eb"} 0%, ${(liveForm.cover_color || "#2563eb")}cc 100%)` }} />}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-2">
          <label className="cursor-pointer opacity-0 group-hover:opacity-100 transition-all bg-white/90 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg">{t("change_cover", lang)}<input type="file" accept="image/*" className="hidden" onChange={async e => { const file = e.target.files[0]; if (!file) return; const { file_url } = await base44.integrations.Core.UploadFile({ file }); setVal("cover_photo", file_url); }} /></label>
          {liveForm.cover_photo && <button type="button" onClick={() => setVal("cover_photo", "")} className="opacity-0 group-hover:opacity-100 transition-all bg-red-500/90 text-white text-xs font-bold px-2 py-1.5 rounded-lg">Remove</button>}
        </div>
        {liveForm.cover_photo && <div className="absolute bottom-2 right-2 flex gap-1" onClick={e => e.stopPropagation()}>{[["center","●"],["top","↑"],["bottom","↓"],["left center","←"],["right center","→"]].map(([pos, icon]) => <button key={pos} type="button" onClick={() => setVal("cover_position", pos)} title={pos} className={`w-6 h-6 rounded-full text-xs font-black transition-all flex items-center justify-center ${(liveForm.cover_position||"center")===pos ? "bg-orange-500 text-white" : "bg-black/40 text-white/70 hover:bg-black/60"}`}>{icon}</button>)}</div>}
        <div className="absolute top-3 right-3 flex gap-1.5 flex-wrap">{COVER_COLORS.map(c => <button type="button" key={c} onClick={() => setVal("cover_color", c)} className={`w-4 h-4 rounded-full border-2 transition-transform hover:scale-125 ${liveForm.cover_color === c ? "border-white scale-125" : "border-white/40"}`} style={{ background: c }} />)}</div>
      </div>
      <div className="px-5 pb-5 pt-2">
        <div className="flex items-end gap-4 -mt-9 mb-5">
          <div className="relative flex-shrink-0">
            {(() => { const shapeR = { circle: "50%", rounded: "20%", squircle: "28%", card: "12px" }[liveForm.avatar_shape] || "50%"; return liveForm.profile_photo ? <img src={liveForm.profile_photo} style={{ width: 64, height: 64, borderRadius: shapeR, objectFit: "cover", objectPosition: liveForm.avatar_position || "center top", border: "4px solid white", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }} alt="" /> : <div style={{ width: 64, height: 64, borderRadius: shapeR, border: "4px solid white", boxShadow: "0 4px 16px rgba(0,0,0,0.15)", background: liveForm.cover_color || "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 22 }}>{liveForm.display_name?.charAt(0) || "?"}</div>; })()}
            <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer shadow-md"><Plus className="w-3.5 h-3.5 text-white" /><input type="file" accept="image/*" className="hidden" onChange={async e => { const file = e.target.files[0]; if (!file) return; const { file_url } = await base44.integrations.Core.UploadFile({ file }); setVal("profile_photo", file_url); }} /></label>
          </div>
          <div className="pb-1">{(() => { const ep = userPlan || "free"; const colors = PLAN_COLORS[ep] || PLAN_COLORS.free; return <span className="text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide" style={{ background: colors.bg, color: colors.text }}>{PLAN_LABELS[ep] || "Free"}</span>; })()}</div>
        </div>
        <div className="mb-4"><Label className={`text-xs font-semibold ${mutedText} block mb-2`}>Photo Shape</Label><div className="flex gap-2 flex-wrap">{[{ v: "circle", label: "Circle", r: "50%" },{ v: "rounded", label: "Rounded", r: "20%" },{ v: "squircle", label: "iOS Icon", r: "28%" },{ v: "card", label: "Card", r: "12px" }].map(({ v, label, r }) => { const sel = (liveForm.avatar_shape || "circle") === v; return <button key={v} type="button" onClick={() => setVal("avatar_shape", v)} className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${sel ? "border-orange-400" : isDark ? "border-white/10" : "border-slate-200"}`} style={{ minWidth: 64 }}><div style={{ width: 40, height: 40, borderRadius: r, overflow: "hidden", border: sel ? "2px solid #f97316" : "2px solid #e2e8f0", background: liveForm.cover_color || "#2563eb", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{liveForm.profile_photo ? <img src={liveForm.profile_photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} /> : <span style={{ color: "#fff", fontWeight: 900, fontSize: 16 }}>{liveForm.display_name?.charAt(0) || "?"}</span>}</div><span className={`text-xs font-bold ${sel ? "text-orange-500" : mutedText}`}>{label}</span></button>; })}</div></div>
        {liveForm.profile_photo && <div className="mb-4"><Label className={`text-xs font-semibold ${mutedText} block mb-2`}>Photo Focal Point</Label><div className="flex gap-2 flex-wrap">{[{ v: "center top", label: "Top" },{ v: "center", label: "Center" },{ v: "center bottom", label: "Bottom" },{ v: "left center", label: "Left" },{ v: "right center", label: "Right" }].map(({ v, label }) => { const sel = (liveForm.avatar_position || "center top") === v; return <button key={v} type="button" onClick={() => setVal("avatar_position", v)} className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${sel ? "border-orange-400 bg-orange-50 text-orange-600" : isDark ? "border-white/10 text-white/50" : "border-slate-200 text-slate-500"}`}>{sel && "✓ "}{label}</button>; })}</div></div>}
        <div className="mb-4"><Label className={`text-xs font-semibold ${mutedText} block mb-2`}>Brand / Company Logo</Label><div className="flex items-center gap-3">{liveForm.company_logo ? <div className="relative flex-shrink-0"><img src={liveForm.company_logo} alt="Logo" style={{ width: 56, height: 56, borderRadius: 10, objectFit: "contain", border: isDark ? "2px solid rgba(255,255,255,0.12)" : "2px solid #e2e8f0", background: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc" }} /><button type="button" onClick={() => setVal("company_logo", "")} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow">×</button></div> : <div style={{ width: 56, height: 56, borderRadius: 10, background: isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9", border: isDark ? "2px dashed rgba(255,255,255,0.15)" : "2px dashed #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🏢</div>}<div><label className={`cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${isDark ? "border-white/15 text-white/60 hover:bg-white/8" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}><Plus className="w-3.5 h-3.5" />{liveForm.company_logo ? "Change Logo" : "Upload Logo"}<input type="file" accept="image/*" className="hidden" onChange={async e => { const file = e.target.files[0]; if (!file) return; const { file_url } = await base44.integrations.Core.UploadFile({ file }); setVal("company_logo", file_url); }} /></label><p className={`text-xs mt-1 ${mutedText}`}>PNG, SVG or JPG · shown on your public profile</p></div></div></div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label className={`text-xs font-semibold ${mutedText}`}>{t("display_name", lang)} *</Label><Input className={`mt-1 ${inputCls}`} value={liveForm.display_name || ""} onChange={set("display_name")} placeholder="Your Name" /></div>
          <div><Label className={`text-xs font-semibold ${mutedText}`}>{t("job_title", lang)}</Label><Input className={`mt-1 ${inputCls}`} value={liveForm.job_title || ""} onChange={set("job_title")} placeholder="CEO / Consultant" /></div>
          <div><Label className={`text-xs font-semibold ${mutedText}`}>{t("company", lang)}</Label><Input className={`mt-1 ${inputCls}`} value={liveForm.company_name || ""} onChange={set("company_name")} placeholder="Company Name" /></div>
          <div><Label className={`text-xs font-semibold ${mutedText}`}>{t("location", lang)}</Label><Input className={`mt-1 ${inputCls}`} value={liveForm.location || ""} onChange={set("location")} placeholder="City, State" /></div>
          <div><Label className={`text-xs font-semibold ${mutedText}`}>{t("phone", lang)}</Label><Input className={`mt-1 ${inputCls}`} value={liveForm.phone || ""} onChange={set("phone")} placeholder="+1 555 000 0000" /></div>
          <div><Label className={`text-xs font-semibold ${mutedText}`}>{t("whatsapp", lang)}</Label><Input className={`mt-1 ${inputCls}`} value={liveForm.whatsapp_number || ""} onChange={set("whatsapp_number")} placeholder="+1 555 000 0000" /></div>
          <div><Label className={`text-xs font-semibold ${mutedText}`}>{t("email", lang)}</Label><Input type="email" className={`mt-1 ${inputCls}`} value={liveForm.email || ""} onChange={set("email")} placeholder="you@example.com" /></div>
          <div><Label className={`text-xs font-semibold ${mutedText}`}>{t("website", lang)}</Label><Input className={`mt-1 ${inputCls}`} value={liveForm.website || ""} onChange={set("website")} placeholder="https://yoursite.com" /></div>
          <div className="sm:col-span-2"><Label className={`text-xs font-semibold ${mutedText}`}>{t("bio", lang)}</Label><Textarea className={`mt-1 ${inputCls}`} rows={3} value={liveForm.bio || ""} onChange={set("bio")} placeholder="Short bio or description..." /></div>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-4"><SaveBtn onSave={onSave} isPending={isPending} label={t("save_info", lang)} /><SaveStatus status={saveStatus} time={saveTime} error={saveError} lang={lang} /></div>
  </div>;
}

function LinksPanel({ liveForm, setVal, set, onSave, isPending, saveStatus, saveTime, saveError, isDark, lang }) {
  const [storeOpen, setStoreOpen] = useState(false);
  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/40" : "text-slate-400";
  const panelBg = isDark ? "bg-[#13162a]" : "bg-white";
  const panelBorder = isDark ? "border-white/8" : "border-slate-200";
  const hiddenLinks = new Set(liveForm.hidden_links || []);
  const links = liveForm.custom_links || [];
  const toggleFieldLink = (key) => { const current = new Set(liveForm.hidden_links || []); if (current.has(key)) current.delete(key); else current.add(key); setVal("hidden_links", [...current]); };
  const toggleLink = (idx) => setVal("custom_links", links.map((l, i) => i === idx ? { ...l, enabled: !l.enabled } : l));
  const removeLink = (idx) => setVal("custom_links", links.filter((_, i) => i !== idx));
  const FIELD_LINKS = [
    { key: "phone", label: "Phone", Icon: BIPhone, category: "Contact" }, { key: "whatsapp_number", label: "WhatsApp", Icon: BIWhatsApp, category: "Contact" }, { key: "email", label: "Email", Icon: BIEmail, category: "Contact" }, { key: "website", label: "Website", Icon: BIWebsite, category: "Business" }, { key: "location", label: "Location", Icon: BILocation, category: "Business" }, { key: "instagram_url", label: "Instagram", Icon: BIInstagram, category: "Social" }, { key: "linkedin_url", label: "LinkedIn", Icon: BILinkedIn, category: "Social" }, { key: "facebook_url", label: "Facebook", Icon: BIFacebook, category: "Social" }, { key: "tiktok_url", label: "TikTok", Icon: BITikTok, category: "Social" }, { key: "youtube_url", label: "YouTube", Icon: BIYouTube, category: "Social" }, { key: "payment_link", label: "PayPal", Icon: BIPayPal, category: "Payment" }, { key: "cashapp_link", label: "Cash App", Icon: BICashApp, category: "Payment" }, { key: "zelle_link", label: "Zelle", Icon: BIZelle, category: "Payment" }, { key: "wave_link", label: "Wave", Icon: BIWave, category: "Payment" }, { key: "orangemoney_link", label: "Orange Money", Icon: BIOrangeMoney, category: "Payment" },
  ].filter(r => liveForm[r.key]);
  const totalCount = FIELD_LINKS.length + links.length;
  return <div className="space-y-3 pb-4">
    <button type="button" onClick={() => setStoreOpen(true)} className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl border-2 border-dashed transition-all font-bold text-sm" style={{ borderColor: "#f97316", color: "#f97316", background: isDark ? "rgba(249,115,22,0.05)" : "rgba(249,115,22,0.03)" }}><Plus className="w-5 h-5" />Add Links from Link Store{totalCount > 0 && <span className="ml-auto text-xs font-black px-2 py-0.5 rounded-full text-white" style={{ background: "#f97316" }}>{totalCount}</span>}</button>
    <div className={`rounded-2xl border ${panelBorder} ${panelBg} overflow-hidden`}><div className="px-4 py-3 border-b" style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9" }}><p className={`text-xs font-black uppercase tracking-widest ${mutedText}`}>Active Links</p><p className={`text-xs mt-0.5 ${mutedText}`}>Toggle to show/hide on public profile</p></div>{totalCount === 0 ? <p className={`px-4 py-6 text-center text-sm ${mutedText}`}>No links added yet. Tap "Add Links" above.</p> : <div className="divide-y" style={{ borderColor: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc" }}>
      {FIELD_LINKS.map(r => { const isHidden = hiddenLinks.has(r.key); return <div key={r.key} className={`flex items-center gap-3 px-3 py-2.5 transition-opacity ${isHidden ? "opacity-40" : ""}`}><r.Icon size={14} /><div className="flex-1 min-w-0"><p className={`text-xs font-bold ${headText} truncate`}>{r.label}</p><p className={`text-xs truncate ${mutedText}`}>{liveForm[r.key]}</p></div><span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${isDark ? "bg-white/8 text-white/30" : "bg-slate-100 text-slate-400"}`}>{r.category}</span><Toggle value={!isHidden} onChange={() => toggleFieldLink(r.key)} /><button type="button" onClick={() => setVal(r.key, "")} className="text-red-400 hover:text-red-600 p-1 flex-shrink-0"><Trash2 className="w-3 h-3" /></button></div>; })}
      {links.map((link, idx) => { const catLabel = link.category ? link.category.charAt(0).toUpperCase() + link.category.slice(1) : "Custom"; return <div key={link.id || String(idx)} className={`flex items-center gap-3 px-3 py-2.5 transition-opacity ${!link.enabled ? "opacity-40" : ""}`}><div className="flex-shrink-0">{getLinkIcon(link, 14)}</div><div className="flex-1 min-w-0"><p className={`text-xs font-bold ${headText} truncate`}>{link.label}</p><p className={`text-xs truncate ${mutedText}`}>{link.url}</p></div><span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${isDark ? "bg-white/8 text-white/30" : "bg-slate-100 text-slate-400"}`}>{catLabel}</span><Toggle value={!!link.enabled} onChange={() => toggleLink(idx)} /><button type="button" onClick={() => removeLink(idx)} className="text-red-400 hover:text-red-600 p-1 flex-shrink-0"><Trash2 className="w-3 h-3" /></button></div>; })}
    </div>}</div>
    <div className="pt-2 flex items-center gap-4" style={{ paddingBottom: "calc(80px + env(safe-area-inset-bottom))" }}><SaveBtn onSave={onSave} isPending={isPending} label={t("save_links", lang)} /><SaveStatus status={saveStatus} time={saveTime} error={saveError} lang={lang} /></div>
    {storeOpen && <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center"><div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setStoreOpen(false)} /><div className={`relative w-full md:max-w-lg md:mx-4 md:rounded-3xl rounded-t-3xl flex flex-col shadow-2xl ${isDark ? "bg-[#0e1223]" : "bg-white"}`} style={{ maxHeight: "90vh", height: "90vh" }}><LinkStore liveForm={liveForm} setVal={setVal} set={set} onSave={onSave} isPending={isPending} isDark={isDark} lang={lang} onClose={() => setStoreOpen(false)} /></div></div>}
  </div>;
}

const QR_LABELS = ["Scan Me", "Find Owner", "Return Me", "Contact Owner", "Help Me Get Home"];
const QR_COLORS = ["#1e293b","#0b2149","#f97316","#7c3aed","#059669","#dc2626","#0891b2","#000000"];

function SharePanel({ profileUrl, profileQrUrl, isDark, copiedUrl, onCopy, lang, profile, effectivePlan, liveForm, setVal, onSave, isPending, saveStatus, saveTime, saveError }) {
  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/40" : "text-slate-400";
  const panelBg = isDark ? "bg-[#13162a]" : "bg-white";
  const panelBorder = isDark ? "border-white/8" : "border-slate-200";
  const [qrColor, setQrColorLocal] = useState(liveForm?.qr_color || profile?.qr_color || "#1e293b");
  const [qrLabel, setQrLabelLocal] = useState(liveForm?.qr_label || profile?.qr_label || "Scan Me");
  const [customLabel, setCustomLabel] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [logoWatermark, setLogoWatermark] = useState(!!(liveForm?.qr_watermark ?? profile?.qr_watermark));
  const [previewDataUrl, setPreviewDataUrl] = useState(null);
  const setQrColor = (v) => { setQrColorLocal(v); setVal("qr_color", v); };
  const setQrLabel = (v) => { setQrLabelLocal(v); setVal("qr_label", v); };
  const setWatermark = (v) => { setLogoWatermark(v); setVal("qr_watermark", v); };
  const isPro = effectivePlan && effectivePlan !== "free";
  const hasLogo = !!profile?.company_logo;
  const displayLabel = customLabel.trim() || qrLabel;
  const bgColor = isDark ? "1e293b" : "f8fafc";
  const fgColor = qrColor.replace("#", "");
  const qrPreviewUrl = profileQrUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(profileQrUrl)}&color=${fgColor}&bgcolor=${bgColor}` : null;
  useEffect(() => {
    if (!profileQrUrl) { setPreviewDataUrl(null); return; }
    let cancelled = false;
    const fg = qrColor.replace("#", "");
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(profileQrUrl)}&color=${fg}&bgcolor=ffffff`;
    const canvas = document.createElement("canvas"); canvas.width = 400; canvas.height = 500;
    const ctx = canvas.getContext("2d"); const useLogo = logoWatermark && isPro && hasLogo;
    const drawLabelAndFooter = () => { ctx.fillStyle = qrColor; ctx.font = "bold 22px system-ui,sans-serif"; ctx.textAlign = "center"; ctx.fillText(displayLabel, 200, 455); ctx.fillStyle = "#0b2149"; ctx.fillRect(0, 468, 400, 32); ctx.fillStyle = "#ffffff"; ctx.font = "bold 11px system-ui,sans-serif"; ctx.fillText("Powered by Bingoo Connect", 200, 489); };
    const qrImg = new Image(); qrImg.crossOrigin = "anonymous";
    qrImg.onload = () => { ctx.fillStyle = "#ffffff"; ctx.fillRect(0,0,400,500); ctx.drawImage(qrImg,0,30,400,400); if (!useLogo) { drawLabelAndFooter(); if (!cancelled) setPreviewDataUrl(canvas.toDataURL("image/png")); return; } const logoImg = new Image(); logoImg.crossOrigin = "anonymous"; logoImg.onload = () => { const ls=72,lx=(400-ls)/2,ly=30+(400-ls)/2; ctx.fillStyle="#ffffff"; ctx.beginPath(); ctx.roundRect(lx-6,ly-6,ls+12,ls+12,12); ctx.fill(); ctx.drawImage(logoImg,lx,ly,ls,ls); drawLabelAndFooter(); if (!cancelled) setPreviewDataUrl(canvas.toDataURL("image/png")); }; logoImg.onerror=()=>{ drawLabelAndFooter(); if(!cancelled) setPreviewDataUrl(canvas.toDataURL("image/png")); }; logoImg.src=profile.company_logo; };
    qrImg.onerror = () => { if (!cancelled) setPreviewDataUrl(null); }; qrImg.src = qrSrc;
    return () => { cancelled = true; };
  }, [profileQrUrl, qrColor, displayLabel, logoWatermark, isPro, hasLogo, profile?.company_logo]);
  const handleDownloadQR = () => { if (!previewDataUrl || downloading) return; setDownloading(true); const a=document.createElement("a"); a.href=previewDataUrl; a.download="bingoo-qr.png"; a.click(); setTimeout(()=>setDownloading(false),500); };
  return <div className="space-y-4">
    <div className={`rounded-2xl border ${panelBorder} ${panelBg} p-5`}><p className={`font-bold text-sm ${headText} mb-3`}>{t("profile_link", lang)}</p><div className="flex gap-2"><input readOnly value={profileUrl || ""} className={`flex-1 px-3 py-2 rounded-xl border text-xs font-mono ${isDark ? "bg-white/5 border-white/10 text-white/70" : "bg-slate-50 border-slate-200 text-slate-600"}`} /><button type="button" onClick={onCopy} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white" style={{ background: copiedUrl ? "#059669" : "#0b2149" }}>{copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}{copiedUrl ? t("copied", lang) : t("copy_link", lang)}</button>{profileUrl && <a href={profileUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all ${isDark ? "border-white/10 bg-white/6 text-blue-400" : "bg-blue-50 border-blue-200 text-blue-600"}`}><ExternalLink className="w-3.5 h-3.5" /></a>}</div></div>
    <div className={`rounded-2xl border ${panelBorder} ${panelBg} p-5 space-y-4`}><p className={`font-bold text-sm ${headText}`}>{t("qr_code", lang)}</p>{qrPreviewUrl ? <>
      <div className="flex justify-center"><div className={`p-4 rounded-2xl text-center ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>{previewDataUrl ? <img src={previewDataUrl} alt="QR Code preview" className="rounded-xl mx-auto" style={{ width:200, height:"auto" }} /> : <div className="w-[200px] h-[250px] flex items-center justify-center"><span className={`text-xs ${mutedText}`}>Generating preview…</span></div>}<p className={`text-xs mt-2 ${mutedText}`}>Preview matches the downloaded QR exactly.</p></div></div>
      <div><p className={`text-xs font-bold uppercase tracking-widest mb-2 ${mutedText}`}>QR Color</p><div className="flex gap-2 flex-wrap">{QR_COLORS.map(c => <button key={c} type="button" onClick={() => setQrColor(c)} className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center flex-shrink-0" style={{ background:c, borderColor: qrColor===c ? "#f97316":"transparent", transform:qrColor===c?"scale(1.2)":"scale(1)" }}>{qrColor===c && <Check className="w-3 h-3 text-white" />}</button>)}<div className="w-7 h-7 rounded-full border-2 border-slate-300 overflow-hidden flex-shrink-0"><input type="color" value={qrColor} onChange={e=>setQrColor(e.target.value)} className="w-9 h-9 -m-1 cursor-pointer" /></div></div></div>
      <div><p className={`text-xs font-bold uppercase tracking-widest mb-2 ${mutedText}`}>Label</p><div className="flex flex-wrap gap-1.5 mb-2">{QR_LABELS.map(l => <button key={l} type="button" onClick={()=>{setQrLabel(l);setCustomLabel("");}} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${qrLabel===l&&!customLabel?"text-white border-orange-400":isDark?"border-white/10 text-white/50":"border-slate-200 text-slate-500"}`} style={qrLabel===l&&!customLabel?{background:"#f97316"}:{}}>{l}</button>)}</div><input type="text" placeholder="Custom label…" value={customLabel} onChange={e=>setCustomLabel(e.target.value)} className={`w-full px-3 py-2 rounded-xl text-sm border outline-none ${isDark?"bg-white/5 border-white/10 text-white placeholder:text-white/30":"bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400"}`} /><p className={`text-xs mt-1.5 ${mutedText}`}>&quot;Powered by Bingoo Connect&quot; always appears on downloaded QR code.</p></div>
      <div className={`rounded-xl border p-3 ${isDark?"border-white/8 bg-white/4":"border-slate-100 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><div className="flex-1 min-w-0"><div className="flex items-center gap-1.5"><p className={`text-xs font-bold ${headText}`}>Logo Watermark</p><span className="text-[11px] font-black px-1.5 py-0.5 rounded-full text-white" style={{background:"#f97316"}}>Professional</span></div><p className={`text-xs mt-0.5 ${mutedText}`}>{!isPro?"Upgrade to Professional to embed your logo in the center of the QR code.":!hasLogo?"Upload a company logo in the Info tab first.":"Your business logo will appear centered on the QR code."}</p></div>{isPro&&hasLogo?<Toggle value={logoWatermark} onChange={setWatermark}/>:<Lock className={`w-4 h-4 flex-shrink-0 ${isDark?"text-white/25":"text-slate-300"}`} />}</div>{isPro&&hasLogo&&logoWatermark&&<div className="mt-2 flex items-center gap-2"><img src={profile.company_logo} alt="Logo preview" className="w-8 h-8 rounded-lg object-contain border border-slate-200 bg-white" /><p className={`text-xs ${mutedText}`}>This logo will be embedded in the downloaded QR code.</p></div>}</div>
      <div className="flex gap-2"><Button type="button" onClick={handleDownloadQR} disabled={downloading} className="flex-1 rounded-xl font-bold gap-2 text-white" style={{background:"#0b2149"}}><Download className="w-4 h-4" />{downloading?"Generating…":t("download_qr",lang)}</Button></div><div className="flex items-center gap-3 pt-1"><SaveBtn onSave={onSave} isPending={isPending} label="Save QR Settings"/><SaveStatus status={saveStatus} time={saveTime} error={saveError} lang={lang}/></div>
    </> : <p className={`text-sm text-center py-4 ${mutedText}`}>Set a username to generate a QR code.</p>}</div>
    <OwnerWalletPanel profile={profile} isDark={isDark} panelBorder={panelBorder} panelBg={panelBg} headText={headText} mutedText={mutedText}/>
  </div>;
}

function SettingsPanel({ liveForm, setVal, set, onSave, isPending, saveStatus, saveTime, saveError, isDark, lang, profile, user, onDeleted }) {
  const headText=isDark?"text-white":"text-slate-900", mutedText=isDark?"text-white/40":"text-slate-400", panelBg=isDark?"bg-[#13162a]":"bg-white", panelBorder=isDark?"border-white/8":"border-slate-200", inputCls=`border-slate-200 ${isDark?"bg-white/5 border-white/10 text-white placeholder:text-white/30":""}`;
  const [showDeleteModal,setShowDeleteModal]=useState(false);
  return <div className="space-y-4">
    <div className={`rounded-2xl border ${panelBorder} ${panelBg} p-5 space-y-3`}><p className={`font-bold text-sm ${headText}`}>{t("profile_url",lang)}</p><div className="flex items-center gap-2"><span className={`text-xs px-3 py-2 rounded-xl ${isDark?"bg-white/8 text-white/40":"bg-slate-100 text-slate-500"}`}>/p/</span><Input className={inputCls} value={liveForm.username||""} onChange={e=>setVal("username",e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g,""))} placeholder="yourusername"/></div></div>
    <div className={`rounded-2xl border ${panelBorder} ${panelBg} p-5 space-y-4`}><p className={`font-bold text-sm ${headText}`}>{t("visibility",lang)}</p>{[{key:"is_active",label:t("profile_is_live",lang),desc:"Publicly accessible at your profile URL"},{key:"show_location",label:t("show_location",lang),desc:"Display your city/address on the profile"}].map(({key,label,desc})=><div key={key} className="flex items-center justify-between"><div><p className={`text-sm font-semibold ${headText}`}>{label}</p><p className={`text-xs ${mutedText}`}>{desc}</p></div><Toggle value={!!liveForm[key]} onChange={v=>setVal(key,v)}/></div>)}</div>
    <div className={`rounded-2xl border ${panelBorder} ${panelBg} p-5 space-y-3`}><p className={`font-bold text-sm ${headText}`}>{t("language_region",lang)}</p><div className="flex gap-2">{[{v:"en",label:"English"},{v:"fr",label:"Français"}].map(o=>{const sel=(liveForm.language||"en")===o.v;return <button type="button" key={o.v} onClick={()=>setVal("language",o.v)} className={`flex-1 py-2 text-xs font-bold rounded-xl border-2 transition-all flex items-center justify-center gap-1.5 ${sel?"border-orange-400 bg-orange-50 text-orange-600":"border-slate-200 text-slate-500"}`}>{sel&&<Check className="w-3 h-3"/>}{o.label}</button>;})}</div></div>
    <div><p className={`text-xs ${mutedText} mb-2 px-1`}>Account-level · applies to your device, not this profile specifically.</p><PhoneAlertsSection user={user}/></div>
    <div className={`rounded-2xl border border-red-200 ${isDark?"bg-red-900/10":"bg-red-50"} p-5 space-y-3`}><div className="flex items-center gap-2"><Shield className="w-4 h-4 text-red-500"/><p className="font-bold text-sm text-red-600">Danger Zone</p></div><p className={`text-xs ${isDark?"text-red-300":"text-red-500"}`}>Disabling your profile hides it from public access instantly.</p><div className="flex flex-col gap-2"><button type="button" onClick={()=>setVal("is_active",false)} className="text-xs font-bold text-red-600 border border-red-300 px-4 py-2 rounded-xl hover:bg-red-100 transition-all">Deactivate Profile</button><button type="button" onClick={()=>setShowDeleteModal(true)} className="flex items-center gap-1.5 text-xs font-bold text-white px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 transition-all"><Trash2 className="w-3.5 h-3.5"/>Delete Profile Permanently</button></div></div>
    <div className="flex items-center gap-4"><SaveBtn onSave={onSave} isPending={isPending} label={t("save_settings",lang)}/><SaveStatus status={saveStatus} time={saveTime} error={saveError} lang={lang}/></div>
    {showDeleteModal&&<DeleteProfileModal profile={profile} isDark={isDark} onClose={()=>setShowDeleteModal(false)} onDeleted={onDeleted}/>} 
  </div>;
}

export default function ProfileWorkspace({ profileId, user, onBack, isDark, isLawFirm, isSalon, lang: langProp, profiles = [], onSelectProfile, onDirtyChange }) {
  const qc=useQueryClient();
  const { plan:userPlan }=usePlan();
  const lang=langProp||getLang();
  const INNER_TABS=getProfileEditorTabs(lang);
  const [innerTab,setInnerTab]=useState("info");
  const [mobilePreviewOpen,setMobilePreviewOpen]=useState(false);
  const saveTabRef=useRef("info");
  const [liveForm,setLiveForm]=useState(null);
  const [copiedUrl,setCopiedUrl]=useState(false);
  const [saveStatus,setSaveStatus]=useState(null);
  const [saveTime,setSaveTime]=useState("");
  const [saveError,setSaveError]=useState("");

  const { data:profile,isLoading }=useQuery({queryKey:["profile-ws",profileId],queryFn:()=>base44.functions.invoke("getMyProfiles",{profile_id:profileId}).then(res=>res.data?.profile),enabled:!!profileId,staleTime:60000,refetchOnWindowFocus:false});
  useEffect(()=>{if(profile&&profile.id===profileId){setLiveForm({...profile});setSaveStatus(null);}},[profile?.id,profileId]);
  const profileUrl=publicProfileUrl(profile?.username), profileQrUrl=publicProfileQrUrl(profile?.username);
  const set=useCallback(k=>e=>setLiveForm(f=>({...f,[k]:e.target.value})),[]);
  const setVal=useCallback((k,v)=>setLiveForm(f=>({...f,[k]:v})),[]);
  const designKeys=["layout","cover_color","cover_photo","profile_photo","avatar_shape","avatar_position","avatar_placement","bg_style","button_style","theme_background_color"];
  const designHasChanges=designKeys.some(key=>JSON.stringify(liveForm?.[key])!==JSON.stringify(profile?.[key]));
  const hasUnsavedChanges=useMemo(()=>{if(!profile||!liveForm)return false;return JSON.stringify(buildPayload(liveForm))!==JSON.stringify(buildPayload(profile));},[profile,liveForm]);
  useEffect(()=>{onDirtyChange?.(hasUnsavedChanges);},[hasUnsavedChanges,onDirtyChange]);
  useEffect(()=>()=>onDirtyChange?.(false),[onDirtyChange]);
  const resetDesign=useCallback(()=>{setLiveForm(current=>{const next={...current};for(const key of designKeys)next[key]=profile?.[key];return next;});},[profile]);
  const copyUrl=useCallback(()=>{if(!profileUrl)return;navigator.clipboard.writeText(profileUrl);setCopiedUrl(true);setTimeout(()=>setCopiedUrl(false),2000);},[profileUrl]);

  const saveMutation=useMutation({
    mutationFn:async()=>{if(!profileId||!liveForm)throw new Error("No profile loaded");const payload=buildPayload(liveForm);const updateResponse=await base44.functions.invoke("updateProfileGated",{profile_id:profileId,data:payload});const freshResponse=await base44.functions.invoke("getMyProfiles",{profile_id:profileId});const fresh=freshResponse.data?.profile||updateResponse.data?.profile;if(!fresh)throw new Error("Profile could not be reloaded after saving.");const SCALAR_KEYS=["display_name","username","job_title","bio","email","phone","cover_color","layout","language","is_active","show_location","booking_enabled","profile_category","profile_type"];const mismatch=SCALAR_KEYS.find(k=>payload[k]!==undefined&&JSON.stringify(payload[k])!==JSON.stringify(fresh[k]));if(mismatch)throw new Error(`Save verification failed: field "${mismatch}" did not persist.`);return fresh;},
    onMutate:()=>{setSaveStatus("pending");setSaveError("");toast.dismiss("bingoo-save");},
    onSuccess:fresh=>{setLiveForm({...fresh});qc.setQueryData(["profile-ws",profileId],fresh);qc.invalidateQueries({queryKey:["my-profile"]});qc.invalidateQueries({queryKey:["my-profiles"]});const now=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});setSaveStatus("success");setSaveTime(now);if(saveTabRef.current==="info"){toast.success(lang==="fr"?"Profil enregistré !":"Profile saved!",{id:"bingoo-save",duration:2500});setTimeout(()=>onBack(),900);}else setTimeout(()=>setSaveStatus(null),4000);},
    onError:err=>{const msg=err?.message||"Unknown error";setSaveStatus("error");setSaveError(msg);toast.error(msg,{id:"bingoo-save",duration:4000});}
  });
  const handleSave=useCallback(tab=>{if(saveMutation.isPending)return;saveTabRef.current=tab||innerTab;saveMutation.mutate();},[saveMutation,innerTab]);
  useEffect(()=>{const handleKeyDown=e=>{if(e.key==="Escape"&&mobilePreviewOpen)setMobilePreviewOpen(false);};window.addEventListener("keydown",handleKeyDown);return()=>window.removeEventListener("keydown",handleKeyDown);},[mobilePreviewOpen]);
  const mutedText=isDark?"text-white/40":"text-slate-400";
  if(isLoading||!liveForm)return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"/></div>;
  const makeSaveProps=tab=>({onSave:()=>handleSave(tab),isPending:saveMutation.isPending,saveStatus:saveTabRef.current===tab?saveStatus:null,saveTime,saveError,isDark,lang});

  return <div className="flex flex-col min-h-0 relative">
    <div className="sticky z-30 top-[calc(56px+env(safe-area-inset-top))] md:top-0 -mx-3 sm:-mx-6 px-3 sm:px-6 pt-1 pb-2" style={{background:isDark?"#0a0c14":"#f5f7fb",pointerEvents:"auto"}}>
      <div className="flex items-center gap-3 mb-2 flex-wrap" style={{position:"relative",zIndex:30}}>
        <button type="button" onClick={onBack} aria-label="Back to profiles" className={`flex items-center gap-1.5 text-xs font-semibold min-h-[44px] px-3 py-2 rounded-xl border transition-all flex-shrink-0 ${isDark?"border-white/10 text-white/50 hover:bg-white/8 hover:text-white":"border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}><ChevronLeft className="w-4 h-4"/>{t("back_profiles",lang)}</button>
        <div className="flex items-center gap-2.5 flex-1 min-w-0"><ProfileSelectorDropdown profiles={profiles} selectedProfile={profiles.find(item=>item.id===profileId)||profile} onSelectProfile={onSelectProfile} isDark={isDark}/></div>
        <div className="flex items-center gap-2 flex-shrink-0"><a href={profileUrl} target="_blank" rel="noopener noreferrer" aria-label="Preview profile" className={`flex items-center gap-1.5 text-xs font-bold min-h-[44px] px-3 py-2 rounded-xl border transition-all ${isDark?"border-white/10 text-white/60 hover:bg-white/8":"border-slate-200 text-slate-600 hover:bg-slate-50"}`}><Eye className="w-3.5 h-3.5"/><span className="hidden sm:inline">{t("preview",lang)}</span></a><button type="button" onClick={copyUrl} aria-label={copiedUrl?"Link copied":"Copy profile link"} className={`flex items-center gap-1.5 text-xs font-bold min-h-[44px] px-3 py-2 rounded-xl border transition-all ${isDark?"border-white/10 text-white/60 hover:bg-white/8":"border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{copiedUrl?<Check className="w-3.5 h-3.5 text-green-500"/>:<Copy className="w-3.5 h-3.5"/>}<span className="hidden sm:inline">{copiedUrl?t("copied",lang):t("copy_link",lang)}</span></button><button type="button" onClick={()=>setInnerTab("share")} aria-label="Share profile" className="flex items-center gap-1.5 text-xs font-bold min-h-[44px] px-3 py-2 rounded-xl text-white hover:opacity-90 transition-all" style={{background:"#f97316"}}><QrCode className="w-3.5 h-3.5"/><span className="hidden sm:inline">{t("share",lang)}</span></button></div>
      </div>
      <div className="md:hidden w-full min-w-0 overflow-x-auto scrollbar-hide pb-1" style={{position:"relative",zIndex:30,WebkitOverflowScrolling:"touch"}}><div className="flex w-max min-w-full gap-2 px-1 whitespace-nowrap">{INNER_TABS.map(tab=><button type="button" key={tab.id} onClick={()=>setInnerTab(tab.id)} aria-label={tab.label} className={`flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-full text-xs font-bold transition-all flex-shrink-0 ${innerTab===tab.id?"text-white shadow-sm":isDark?"bg-white/8 text-white/50":"bg-slate-100 text-slate-500"}`} style={innerTab===tab.id?{background:"#0b2149"}:{}}><tab.icon className="w-3.5 h-3.5 flex-shrink-0"/>{tab.label}</button>)}</div></div>
    </div>
    <div className="flex gap-4 flex-1 min-h-0 max-w-full">
      <div className="hidden md:flex flex-col gap-1 w-36 flex-shrink-0">{INNER_TABS.map(tab=><button type="button" key={tab.id} onClick={()=>setInnerTab(tab.id)} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left w-full ${innerTab===tab.id?(isDark?"bg-white/10 text-white":"bg-blue-50 text-blue-700"):(isDark?"text-white/50 hover:bg-white/5 hover:text-white":"text-slate-500 hover:bg-slate-50 hover:text-slate-800")}`} style={innerTab===tab.id?{borderLeft:"3px solid #f97316",borderRadius:"0 12px 12px 0"}:{}}><tab.icon className="w-4 h-4 flex-shrink-0"/>{tab.label}</button>)}</div>
      <div className="flex gap-4 flex-1 min-w-0 min-h-0 max-w-full">
        <div className="flex-1 min-w-0 min-h-0 pb-safe">
          {innerTab==="info"&&<InfoPanel {...makeSaveProps("info")} liveForm={liveForm} setVal={setVal} set={set} profile={profile} userPlan={userPlan}/>} 
          {innerTab==="profiletype"&&<div className="space-y-5"><div className={`rounded-2xl border p-5 ${isDark?"bg-[#13162a] border-white/10":"bg-white border-slate-200"}`}><ProfileTypeSelector profile={liveForm} plan={userPlan||"free"} isDark={isDark} onChange={category=>{setVal("profile_category",category.id);setVal("profile_type",category.profileType);}}/></div><div className="flex items-center gap-4"><SaveBtn onSave={()=>handleSave("profiletype")} isPending={saveMutation.isPending} label={lang==="fr"?"Enregistrer le type":"Save Profile Type"}/><SaveStatus status={saveTabRef.current==="profiletype"?saveStatus:null} time={saveTime} error={saveError} lang={lang}/></div></div>}
          {innerTab==="links"&&<LinksPanel {...makeSaveProps("links")} liveForm={liveForm} setVal={setVal} set={set}/>} 
          {innerTab==="design"&&<DesignPanel {...makeSaveProps("design")} liveForm={liveForm} setVal={setVal} userPlan={userPlan} profile={profile} user={user} lang={lang} onLayoutChange={()=>handleSave("design")} onPreview={()=>setMobilePreviewOpen(true)} onReset={resetDesign} hasChanges={designHasChanges}/>} 
          {innerTab==="share"&&<SharePanel profileUrl={profileUrl} profileQrUrl={profileQrUrl} isDark={isDark} copiedUrl={copiedUrl} onCopy={copyUrl} lang={lang} profile={profile} effectivePlan={userPlan||"free"} liveForm={liveForm} setVal={setVal} {...makeSaveProps("share")}/>} 
          {innerTab==="settings"&&<SettingsPanel {...makeSaveProps("settings")} liveForm={liveForm} setVal={setVal} set={set} profile={profile} user={user} onDeleted={onBack}/>} 
        </div>
        <div className="xl:hidden" style={{pointerEvents:"none"}}><button type="button" onClick={()=>setMobilePreviewOpen(true)} className="fixed z-30 flex items-center gap-2 px-4 py-3 rounded-full shadow-xl text-white text-sm font-bold" style={{background:"#0b2149",boxShadow:"0 8px 28px rgba(11,33,73,0.5)",bottom:"calc(80px + env(safe-area-inset-bottom))",right:16,pointerEvents:"auto"}}><Eye className="w-4 h-4"/>Preview</button>{mobilePreviewOpen&&<div className="fixed inset-0 z-50 flex flex-col safe-top safe-bottom" style={{background:isDark?"#0a0c14":"#f1f5f9"}}><div className="flex items-center justify-between px-4 py-4 flex-shrink-0" style={{background:isDark?"#13162a":"#fff",borderBottom:isDark?"1px solid rgba(255,255,255,0.08)":"1px solid #e2e8f0",paddingTop:"calc(1rem + env(safe-area-inset-top))"}}><div className="flex items-center gap-2"><p className={`font-bold text-sm ${isDark?"text-white":"text-slate-900"} mr-auto`}>Live Preview</p>{profileUrl&&<a href={profileUrl} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${isDark?"border-white/10 text-white/70 hover:bg-white/5":"border-slate-200 text-slate-600 hover:bg-slate-50"}`}><ExternalLink className="w-3.5 h-3.5"/>Open live</a>}<button type="button" onClick={e=>{e.preventDefault();e.stopPropagation();setMobilePreviewOpen(false);}} className={`p-2 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isDark?"bg-white/10 hover:bg-white/20 text-white":"bg-slate-100 hover:bg-slate-200 text-slate-600"}`} title="Close preview (ESC)"><X className="w-5 h-5"/></button></div></div><div className="flex-1 overflow-y-auto pb-safe"><div style={{maxWidth:480,margin:"0 auto",padding:"16px"}}><div style={{background:"#0f172a",borderRadius:32,padding:10,boxShadow:"0 20px 40px rgba(0,0,0,0.35), inset 0 0 0 1.5px rgba(255,255,255,0.07)",margin:"0 auto",maxWidth:340}}><div style={{display:"flex",justifyContent:"center",marginBottom:4}}><div style={{width:64,height:14,background:"#0f172a",borderRadius:"0 0 12px 12px",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}><div style={{width:4,height:4,borderRadius:"50%",background:"#334155"}}/><div style={{width:22,height:3,borderRadius:999,background:"#334155"}}/></div></div><div style={{borderRadius:22,overflowY:"auto",overflowX:"hidden",background:"#f1f5f9",maxHeight:"70vh",position:"relative"}} onClickCapture={e=>{e.preventDefault();e.stopPropagation();}}><div style={{width:375,transform:"scale(0.747)",transformOrigin:"top left",minHeight:Math.round(520/0.747),pointerEvents:"none",userSelect:"none"}}><WorkspaceLayoutPreview liveForm={{...(profile||{}),...liveForm}}/></div></div><div style={{display:"flex",justifyContent:"center",marginTop:8}}><div style={{width:60,height:3,borderRadius:999,background:"#334155"}}/></div></div><p className={`text-[11px] text-center mt-3 ${isDark?"text-white/30":"text-slate-400"}`}>Updates as you type</p></div></div></div>}</div>
        <div className="hidden xl:block flex-shrink-0" style={{width:240}}><div style={{position:"sticky",top:80}}><p className={`text-xs font-bold uppercase tracking-widest mb-2 ${mutedText}`}>Live Preview</p><div style={{background:"#0f172a",borderRadius:32,padding:"10px 12px",boxShadow:"0 20px 40px rgba(0,0,0,0.35), inset 0 0 0 1.5px rgba(255,255,255,0.07)",width:"fit-content"}}><div style={{display:"flex",justifyContent:"center",marginBottom:4}}><div style={{width:64,height:14,background:"#0f172a",borderRadius:"0 0 12px 12px",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}><div style={{width:4,height:4,borderRadius:"50%",background:"#334155"}}/><div style={{width:22,height:3,borderRadius:999,background:"#334155"}}/></div></div><div style={{borderRadius:22,width:216,height:520,overflowY:"auto",overflowX:"hidden",background:"#f1f5f9",scrollbarWidth:"none",msOverflowStyle:"none"}} onClickCapture={e=>{e.preventDefault();e.stopPropagation();}}><div style={{width:375,transform:"scale(0.576)",transformOrigin:"top left",minHeight:Math.round(520/0.576),pointerEvents:"none",userSelect:"none"}}><WorkspaceLayoutPreview liveForm={{...(profile||{}),...liveForm}}/></div></div><div style={{display:"flex",justifyContent:"center",marginTop:8}}><div style={{width:60,height:3,borderRadius:999,background:"#334155"}}/></div></div><p className={`text-xs text-center mt-2 ${mutedText}`}>Updates as you type</p></div></div>
      </div>
    </div>
  </div>;
}
