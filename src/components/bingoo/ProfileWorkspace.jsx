import { PUBLIC_APP_ORIGIN, publicProfileUrl } from '@/lib/publicProfileUrl';
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft, Eye, ExternalLink, Plus,
  Save, AlertTriangle, Lock, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { resolveProfileAppearance } from "@/lib/profileLayouts";
import ResolvedProfileLayout from "@/components/bingoo/ResolvedProfileLayout";
import ProfileContentSections from "@/components/bingoo/ProfileContentSections";
import LostDeviceManager from "@/components/bingoo/LostDeviceManager";
import LinkStore from "@/components/bingoo/LinkStore";
import DesignPanel from "@/components/bingoo/DesignPanel";
import DesignTab from "@/components/bingoo/DesignTab";
import ProfileTypeSelector from "@/components/bingoo/ProfileTypeSelector";
import { ProfileSelectorDropdown } from "@/components/bingoo/WorkspaceSelectors";
import PortfolioPanel from "@/components/bingoo/PortfolioPanel";
import BusinessToolsPanel from "@/components/bingoo/BusinessToolsPanel";
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
import { PLAN_LABELS, PLAN_COLORS, resolveActivePlan, normalizePlan } from "@/lib/planPermissions";
import { getProfileEditorTabs } from "@/lib/profileEditorTabs";
import { isProtectedTestAccount, getOverridePlan } from "@/lib/testAccounts";
import { toast } from "sonner";
import { t, getLang } from "@/lib/i18n";
import { openExternalUrl } from "@/lib/nativePlatform";

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
  "profile_photo", "avatar_shape",
  "instagram_url", "linkedin_url", "facebook_url", "tiktok_url",
  "youtube_url", "payment_link", "zelle_link", "cashapp_link", "wave_link",
  "orangemoney_link", "booking_enabled", "lead_capture_enabled", "whatsapp_booking_message", "custom_links", "hidden_links",
  "layout", "bg_style", "button_style", "button_color", "font_style", "link_display_style", "link_row_style", "link_icon_shape", "username", "is_active", "show_location", "language",
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

const Toggle = ({ value, onChange }) => (
  <button type="button" onClick={() => onChange(!value)}
    className={`w-11 h-6 rounded-full relative transition-colors flex-shrink-0 ${value ? "bg-orange-500" : "bg-slate-300"}`}>
    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${value ? "left-5" : "left-0.5"}`} />
  </button>
);

// ── Compact layout preview for the inline phone shells ───────────────────
function WorkspaceLayoutPreview({ liveForm }) {
  const appearance = resolveProfileAppearance(liveForm);
  const content = (
    <ProfileContentSections
      profile={liveForm}
      color={appearance.accent}
      isDark={appearance.dark}
      isDemo={false}
      deviceCodeParam={null}
      track={() => {}}
    />
  );
  return <ResolvedProfileLayout profile={liveForm} mobile={true} contentSections={content} />;
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
function InfoPanel({ liveForm, setVal, set, onSave, isPending, saveStatus, saveTime, saveError, isDark, userPlan, lang }) {
  const headText    = isDark ? "text-white" : "text-slate-900";
  const isBusinessIdentity = ["business", "lawfirm", "salon", "corporate"].includes(liveForm.profile_type) || liveForm.profile_category === "business";
  const mutedText   = isDark ? "text-white/40" : "text-slate-400";
  const panelBg     = isDark ? "bg-[#13162a]" : "bg-white";
  const panelBorder = isDark ? "border-white/8" : "border-slate-200";
  const inputCls    = `border-slate-200 ${isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/30" : ""}`;

  return (
    <div className="space-y-3 sm:space-y-[18px] pb-3 sm:pb-4 max-w-[560px]">
      {/* Figma Profile page toolbar */}
      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3">
        <div className="min-w-0">
          <h2 className={`text-[16px] font-extrabold ${headText}`}>{t("studio_profile", lang)}</h2>
        </div>
        <button type="button" onClick={onSave} disabled={isPending}
          className="inline-flex items-center gap-1.5 px-[18px] py-[9px] rounded-[10px] text-[13px] font-bold text-white disabled:opacity-50 flex-shrink-0"
          style={{ background: "#f97316", boxShadow: "0 4px 12px rgba(249,115,22,0.24)" }}>
          <Save className={`w-[14px] h-[14px] ${isPending ? "animate-pulse" : ""}`} />
          {isPending ? t("saving", lang) : t("studio_save_profile", lang)}
        </button>
      </div>

      {/* Profile identity / photo card */}
      <div className={`rounded-[14px] border ${panelBorder} ${panelBg} p-3.5 sm:p-[18px]`}>
        <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
          <div>
            <p className={`text-[13px] font-black ${headText}`}>{t("studio_profile_photo", lang)}</p>
          </div>
          {(() => {
            const ep = userPlan || "free";
            const colors = PLAN_COLORS[ep] || PLAN_COLORS.free;
            return <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide" style={{ background: colors.bg, color: colors.text }}>{PLAN_LABELS[ep] || "Free"}</span>;
          })()}
        </div>
          <div className="flex items-center gap-3 mb-3 sm:mb-5 relative z-10">
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

          </div>

          {/* Business-only identity */}
          {isBusinessIdentity && <div className="mb-3 sm:mb-5 rounded-xl border border-slate-200/80 p-3 sm:p-4">
            <p className={`text-xs font-black mb-3 ${headText}`}>{t("studio_business_identity", lang)}</p>
            <Label className={`text-xs font-semibold ${mutedText} block mb-2`}>{t("studio_brand_logo", lang)}</Label>
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
                  {liveForm.company_logo ? t("studio_change_logo", lang) : t("studio_upload_logo", lang)}
                  <input type="file" accept="image/*" className="hidden" onChange={async e => {
                    const file = e.target.files[0]; if (!file) return;
                    const { file_url } = await base44.integrations.Core.UploadFile({ file });
                    setVal("company_logo", file_url);
                  }} />
                </label>

              </div>
            </div>
          </div>}

          <div className="mb-3">
            <p className={`text-xs font-black ${headText}`}>{t("studio_basic_info", lang)}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label className={`text-xs font-semibold ${mutedText}`}>{t("display_name", lang)} *</Label>
              <Input className={`mt-1 ${inputCls}`} value={liveForm.display_name || ""} onChange={set("display_name")} placeholder={t("studio_name_placeholder", lang)} />
            </div>
            <div>
              <Label className={`text-xs font-semibold ${mutedText}`}>{t("job_title", lang)}</Label>
              <Input className={`mt-1 ${inputCls}`} value={liveForm.job_title || ""} onChange={set("job_title")} placeholder={t("studio_job_placeholder", lang)} />
            </div>
            {isBusinessIdentity && <div className="sm:col-span-2">
              <Label className={`text-xs font-semibold ${mutedText}`}>{t("company", lang)}</Label>
              <Input className={`mt-1 ${inputCls}`} value={liveForm.company_name || ""} onChange={set("company_name")} placeholder={t("studio_company_placeholder", lang)} />
            </div>}
            <div className="sm:col-span-2">
              <Label className={`text-xs font-semibold ${mutedText}`}>{t("bio", lang)}</Label>
              <Textarea className={`mt-1 ${inputCls}`} rows={4} value={liveForm.bio || ""} onChange={set("bio")} placeholder={t("studio_bio_placeholder", lang)} />
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
  // All field-type links that have a value
  const FIELD_LINKS = [
    { key: "phone",           label: t("workspace_phone", lang),        Icon: BIPhone,        category: t("workspace_category_contact", lang) },
    { key: "whatsapp_number", label: "WhatsApp",      Icon: BIWhatsApp,     category: t("workspace_category_contact", lang) },
    { key: "email",           label: t("workspace_email", lang),         Icon: BIEmail,        category: t("workspace_category_contact", lang) },
    { key: "website",         label: t("workspace_website", lang),       Icon: BIWebsite,      category: t("workspace_category_business", lang) },
    { key: "location",        label: t("workspace_location", lang),      Icon: BILocation,     category: t("workspace_category_business", lang) },
    { key: "instagram_url",   label: "Instagram",     Icon: BIInstagram,    category: t("workspace_category_social", lang) },
    { key: "linkedin_url",    label: "LinkedIn",      Icon: BILinkedIn,     category: t("workspace_category_social", lang) },
    { key: "facebook_url",    label: "Facebook",      Icon: BIFacebook,     category: t("workspace_category_social", lang) },
    { key: "tiktok_url",      label: "TikTok",        Icon: BITikTok,       category: t("workspace_category_social", lang) },
    { key: "youtube_url",     label: "YouTube",       Icon: BIYouTube,      category: t("workspace_category_social", lang) },
    { key: "payment_link",    label: "PayPal",        Icon: BIPayPal,       category: t("workspace_category_payment", lang) },
    { key: "cashapp_link",    label: "Cash App",      Icon: BICashApp,      category: t("workspace_category_payment", lang) },
    { key: "zelle_link",      label: "Zelle",         Icon: BIZelle,        category: t("workspace_category_payment", lang) },
    { key: "wave_link",       label: "Wave",          Icon: BIWave,         category: t("workspace_category_payment", lang) },
    { key: "orangemoney_link",label: "Orange Money",  Icon: BIOrangeMoney,  category: t("workspace_category_payment", lang) },
  ].filter(r => liveForm[r.key]);

  const totalCount = FIELD_LINKS.length + links.length;

  return (
    <div className="space-y-[18px] pb-4 max-w-[520px]">
      {/* Figma Make links toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h2 className={`text-[16px] font-extrabold ${headText}`}>{t("links", lang)}</h2>
          <p className={`text-[12px] mt-0.5 ${mutedText}`}>{t("studio_links_copy", lang)}</p>
        </div>
        <button type="button" onClick={() => setStoreOpen(true)}
          className="flex items-center justify-center gap-1.5 w-full sm:w-auto max-w-full px-[16px] py-[10px] rounded-xl text-[13px] font-bold text-white flex-shrink-0"
          style={{ background: "#f97316", boxShadow: "0 4px 12px rgba(249,115,22,0.25)" }}>
          <Plus className="w-[14px] h-[14px]" /> {t("studio_add_link", lang)}
        </button>
      </div>

      {totalCount === 0 ? (
        <div className={`text-center px-5 py-9 rounded-[14px] border border-dashed ${isDark ? "bg-[#13162a] border-white/10" : "bg-white border-[#E5EAF2]"}`}>
          <div className="text-[30px] mb-2">🔗</div>
          <div className={`text-[14px] font-bold mb-1 ${headText}`}>{t("studio_no_links", lang)}</div>
          <div className={`text-[12px] ${mutedText}`}>{t("studio_no_links_copy", lang)}</div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {FIELD_LINKS.map(r => {
            const isHidden = hiddenLinks.has(r.key);
            return (
              <div key={r.key} className={`flex items-center gap-[10px] px-[14px] py-[11px] rounded-[11px] border transition-opacity ${panelBg} ${panelBorder} ${isHidden ? "opacity-55" : ""}`}>
                <div className={`w-[34px] h-[34px] rounded-[9px] flex items-center justify-center flex-shrink-0 ${isDark ? "bg-white/8" : "bg-[#F7F9FC]"}`}>
                  <r.Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-bold ${headText} truncate`}>{r.label}</p>
                </div>
                <button type="button" onClick={() => { setEditingLinkId(r.key); setStoreOpen(true); }}
                  aria-label={`Edit ${r.label}`} className={`min-w-[44px] min-h-[44px] px-2 sm:px-[11px] py-[5px] rounded-[9px] border text-[11px] font-semibold ${isDark ? "bg-white/5 border-white/10 text-white/70" : "bg-[#F7F9FC] border-[#E5EAF2] text-[#0F172A]"}`}>
                  <span className="hidden xs:inline">{t("edit", lang)}</span><span className="xs:hidden">•••</span>
                </button>
                <Toggle value={!isHidden} onChange={() => toggleFieldLink(r.key)} />
              </div>
            );
          })}

          {links.map((link, idx) => (
            <div key={link.id || String(idx)} className={`flex items-center gap-[10px] px-[14px] py-[11px] rounded-[11px] border transition-opacity ${panelBg} ${panelBorder} ${!link.enabled ? "opacity-55" : ""}`}>
              <div className="w-[34px] h-[34px] rounded-[9px] overflow-hidden flex items-center justify-center flex-shrink-0">
                {getLinkIcon(link, 18)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[13px] font-bold ${headText} truncate`}>{link.label}</p>
              </div>
              <button type="button" onClick={() => { setEditingLinkId(link._catalog_id || null); setStoreOpen(true); }}
                aria-label={`Edit ${link.label || "link"}`} className={`min-w-[44px] min-h-[44px] px-2 sm:px-[11px] py-[5px] rounded-[9px] border text-[11px] font-semibold ${isDark ? "bg-white/5 border-white/10 text-white/70" : "bg-[#F7F9FC] border-[#E5EAF2] text-[#0F172A]"}`}>
                <span className="hidden xs:inline">{t("edit", lang)}</span><span className="xs:hidden">•••</span>
              </button>
              <Toggle value={!!link.enabled} onChange={() => toggleLink(idx)} />
            </div>
          ))}
        </div>
      )}

      <div className={`rounded-[14px] border ${panelBorder} ${panelBg} px-[14px] py-[13px] flex items-center gap-3`}>
        <div className="flex-1 min-w-0">
          <p className={`text-[13px] font-bold ${headText}`}>{t("studio_lead_capture", lang)}</p>
          <p className={`text-[11px] mt-0.5 ${mutedText}`}>{t("studio_lead_capture_copy", lang)}</p>
        </div>
        <Toggle value={liveForm.lead_capture_enabled !== false} onChange={(v) => setVal("lead_capture_enabled", v)} />
      </div>

      <div className="pt-1 flex items-center gap-4" style={{ paddingBottom: "calc(80px + env(safe-area-inset-bottom))" }}>
        <SaveBtn onSave={onSave} isPending={isPending} label={t("save_links", lang)} />
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

// ── LOST MODE PANEL ───────────────────────────────────────────────────────
function LostModePanel({ profileId, user, isDark, effectivePlan, lang }) {
  const [trialLoading, setTrialLoading] = useState(false);
  const isPaid = effectivePlan && effectivePlan !== "free";

  if (!isPaid) {
    // Locked gate for Free accounts
    const startTrial = async () => {
      if (trialLoading) return;
      if (window.self !== window.top) { alert(lang === "fr" ? "Ouvrez bingooconnect.com pour vous abonner." : "Open bingooconnect.com to subscribe."); return; }
      setTrialLoading(true);
      try {
        const resp = await base44.functions.invoke("createSubscriptionSession", {
          plan: "professional", trial_days: 14,
          success_url: `${PUBLIC_APP_ORIGIN}/bingoo`,
          cancel_url: `${PUBLIC_APP_ORIGIN}/bingoo`,
        });
        if (resp?.data?.url) await openExternalUrl(resp.data.url);
      } catch(e) { console.error(e); } finally { setTrialLoading(false); }
    };
    return (
      <div className={`rounded-2xl border-2 p-8 flex flex-col items-center text-center gap-4 ${isDark ? "border-amber-400/20 bg-amber-400/5" : "border-amber-200 bg-amber-50/60"}`}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.3)" }}>
          <Lock className="w-7 h-7 text-amber-500" />
        </div>
        <div>
          <p className={`font-black text-base ${isDark ? "text-white" : "text-slate-900"}`}>{t("studio_lost_pro", lang)}</p>
          <p className={`text-sm mt-2 leading-relaxed max-w-xs ${isDark ? "text-white/50" : "text-slate-500"}`}>
            {t("studio_lost_pro_copy", lang)}
          </p>
        </div>
        <button onClick={startTrial} disabled={trialLoading}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black text-white transition-all hover:opacity-90 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #f97316, #FDBA21)" }}>
          <Star className="w-4 h-4" />
          {trialLoading ? t("profiles_loading", lang) : t("studio_try_pro", lang)}
        </button>
        <p className={`text-xs ${isDark ? "text-white/30" : "text-slate-400"}`}>{t("studio_trial_terms", lang)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-sm text-amber-800">{t("lost_mode", lang)}</p>
          <p className="text-xs text-amber-700 mt-0.5">{t("studio_lost_mode_copy", lang)}</p>
        </div>
      </div>
      <LostDeviceManager profileId={profileId} userId={user?.id} isDark={isDark} tr={(k) => k} onSaved={() => {}} />
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
    setMobileGroupOpen(true);
    onTabChange?.(tabId);
  }, [INNER_TABS, onTabChange]);
  const selectMobileGroup = useCallback((group) => {
    const target = group.tabs.includes(innerTab) ? innerTab : group.tabs.find((tabId) => INNER_TABS.some((tab) => tab.id === tabId));
    if (!target) return;
    setInnerTab(target);
    setMobileGroupOpen(true);
    onTabChange?.(target);
  }, [INNER_TABS, innerTab, onTabChange]);
  useEffect(() => {
    const next = INNER_TABS.some((tab) => tab.id === initialTab) ? initialTab : "info";
    if (next !== innerTab) setInnerTab(next);
  }, [initialTab]);
  useEffect(() => {
    if (!INNER_TABS.some((tab) => tab.id === innerTab)) selectInnerTab("info");
  }, [innerTab, userPlan]);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [mobileGroupOpen, setMobileGroupOpen] = useState(false);
  const MOBILE_GROUPS = [
    { id: "profile", label: lang === "fr" ? "Profil" : "Profile", subtitle: lang === "fr" ? "Identité et type de profil" : "Identity and profile type", tabs: ["info", "profiletype"] },
    { id: "content", label: lang === "fr" ? "Contenu" : "Content", subtitle: lang === "fr" ? "Liens et médias" : "Links and media", tabs: ["links", "media"] },
    { id: "appearance", label: lang === "fr" ? "Apparence" : "Appearance", subtitle: lang === "fr" ? "Design et mise en page" : "Design and layouts", tabs: ["design", "layouts"] },
    { id: "more", label: lang === "fr" ? "Plus" : "More", subtitle: lang === "fr" ? "Outils et options avancées" : "Tools and advanced options", tabs: ["business", "lostmode"] },
  ];
  const activeMobileGroup = MOBILE_GROUPS.find((group) => group.tabs.includes(innerTab)) || MOBILE_GROUPS[0];
  // Track which tab triggered the current save (for post-save routing)
  const saveTabRef = useRef("info");
  const [liveForm, setLiveForm] = useState(null);
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

  // Stable setters — won't cause child remounts
  const set    = useCallback((k) => (e) => setLiveForm(f => ({ ...f, [k]: e.target.value })), []);
  const setVal = useCallback((k, v) => setLiveForm(f => ({ ...f, [k]: v })), []);
  const designKeys = ["layout", "cover_color", "cover_photo", "profile_photo", "avatar_shape", "bg_style", "button_style", "button_color", "font_style", "theme_background_color"];
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
        "cover_color","layout","bg_style","button_style","avatar_shape",
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
    <div className="block md:flex md:flex-col min-h-0 relative overflow-x-hidden" style={{ background: isDark ? "#080b12" : "#F5F7FB", touchAction: "pan-y" }}>
      {/* Premium SaaS editor command bar */}
      <div className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3 border-b flex-shrink-0 z-30 md:sticky md:top-0 ${isDark ? "bg-[#0d111c]/95 border-white/10" : "bg-white/95 border-slate-200/80"} backdrop-blur-xl`}>
        <button type="button" onClick={onBack} aria-label={t("workspace_back_profiles", lang)}
          className={`w-[44px] h-[44px] sm:w-[36px] sm:h-[36px] rounded-xl border flex items-center justify-center flex-shrink-0 transition-all ${isDark ? "bg-white/5 border-white/10 text-white/70 hover:bg-white/10" : "bg-white border-slate-200 text-slate-700 shadow-sm hover:bg-slate-50"}`}>
          <ChevronLeft className="w-[15px] h-[15px]" />
        </button>

        <div className="flex-1 min-w-0 flex items-center gap-3">
          <div className="hidden lg:block min-w-0"><p className={`text-[10px] font-black uppercase tracking-[0.16em] ${isDark ? "text-white/35" : "text-slate-400"}`}>{lang === "fr" ? "Éditeur de profil" : "Profile editor"}</p><p className={`text-sm font-extrabold truncate ${isDark ? "text-white" : "text-slate-900"}`}>{liveForm?.display_name || profile?.display_name || (lang === "fr" ? "Profil" : "Profile")}</p></div>
          <div className="min-w-0 flex-1 lg:max-w-[300px]"><ProfileSelectorDropdown
            profiles={profiles}
            selectedProfile={profiles.find((item) => item.id === profileId) || profile}
            onSelectProfile={onSelectProfile}
            isDark={isDark}
          /></div>
        </div>

        {profileUrl && (
          <button type="button" onClick={() => setMobilePreviewOpen(true)} aria-label={t("workspace_preview_public", lang)}
            className={`h-[44px] sm:h-[34px] px-2.5 sm:px-3 rounded-lg border flex items-center justify-center gap-1.5 flex-shrink-0 transition-colors ${isDark ? "bg-white/5 border-white/10 text-white/60" : "bg-[#F7F9FC] border-[#E5EAF2] text-[#64748B]"}`}>
            <Eye className="w-[14px] h-[14px]" />
            <span className="hidden sm:inline text-[11px] font-bold">{t("studio_public_profile", lang)}</span>
          </button>
        )}

        <button type="button" onClick={() => handleSave(innerTab)} disabled={saveMutation.isPending || !hasUnsavedChanges}
          className="flex items-center justify-center gap-1.5 w-[44px] min-h-[44px] sm:w-auto sm:min-h-[38px] px-0 sm:px-5 py-2 rounded-xl text-[13px] font-extrabold text-white flex-shrink-0 transition-all disabled:opacity-40 active:scale-[0.98]"
          style={{ background: "#f97316", boxShadow: "0 4px 14px rgba(249,115,22,0.30)" }}>
          {saveMutation.isPending && <Save className="w-[13px] h-[13px] animate-pulse" />}
          <span className="hidden sm:inline">{t("save", lang)}</span>
          <Save className="sm:hidden w-4 h-4" />
        </button>
      </div>

      {/* Native mobile editor navigation: four task groups, never a squeezed desktop rail. */}
      <div className="md:hidden border-b border-slate-200/70 bg-white/95 dark:bg-[#0d111c]/95 backdrop-blur-xl" style={{ position: "relative", zIndex: 20 }}>
        {!mobileGroupOpen ? (
          <div className="px-3.5 py-4">
            <div className="mb-3 px-0.5"><p className={`text-[10px] font-black uppercase tracking-[0.16em] ${mutedText}`}>{lang === "fr" ? "Modifier le profil" : "Edit profile"}</p><h2 className={`mt-1 text-xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>{lang === "fr" ? "Que voulez-vous modifier ?" : "What do you want to edit?"}</h2></div>
            <div className="grid grid-cols-2 gap-2.5">
              {MOBILE_GROUPS.map((group) => {
                const firstTab = INNER_TABS.find((tab) => group.tabs.includes(tab.id));
                const Icon = firstTab?.icon;
                return <button type="button" key={group.id} onClick={() => selectMobileGroup(group)} className={`min-h-[112px] rounded-2xl border p-3.5 text-left active:scale-[0.98] transition-all ${isDark ? "bg-white/[0.04] border-white/10" : "bg-white border-slate-200 shadow-sm"}`}>
                  <span className={`w-9 h-9 rounded-xl inline-flex items-center justify-center ${isDark ? "bg-blue-500/15 text-blue-300" : "bg-[#0b2149] text-white"}`}>{Icon && <Icon className="w-[18px] h-[18px]" />}</span>
                  <span className={`block mt-3 text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>{group.label}</span>
                  <span className={`block mt-0.5 text-[11px] leading-4 ${mutedText}`}>{group.subtitle}</span>
                </button>;
              })}
            </div>
          </div>
        ) : (
          <div className="px-3 py-2.5">
            <div className="flex items-center gap-2 mb-2">
              <button type="button" onClick={() => setMobileGroupOpen(false)} className={`w-10 h-10 rounded-xl border flex items-center justify-center ${isDark ? "border-white/10 text-white/70" : "border-slate-200 bg-white text-slate-700"}`} aria-label={lang === "fr" ? "Retour aux sections" : "Back to editor sections"}><ChevronLeft className="w-4 h-4" /></button>
              <div className="min-w-0"><p className={`text-[10px] font-black uppercase tracking-[0.14em] ${mutedText}`}>{lang === "fr" ? "Modifier" : "Edit"}</p><p className={`text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>{activeMobileGroup.label}</p></div>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
              {INNER_TABS.filter((tab) => activeMobileGroup.tabs.includes(tab.id)).map((tab) => <button type="button" key={tab.id} onClick={() => selectInnerTab(tab.id)} className={`min-h-[40px] px-3.5 rounded-xl border flex items-center gap-1.5 text-xs font-extrabold whitespace-nowrap ${innerTab === tab.id ? "text-white border-transparent" : (isDark ? "border-white/10 text-white/55" : "border-slate-200 bg-white text-slate-600")}`} style={innerTab === tab.id ? { background: "linear-gradient(135deg,#0b2149,#173b73)" } : {}}><tab.icon className="w-3.5 h-3.5" />{tab.label}</button>)}
            </div>
          </div>
        )}
      </div>

      {/* Premium responsive SaaS editor architecture */}
      <div className="block md:flex md:flex-1 md:min-h-0 max-w-full overflow-visible md:overflow-hidden">
        {/* Desktop workspace navigation */}
        <div className={`hidden md:flex flex-col gap-1 w-[96px] flex-shrink-0 px-2 py-3 border-r ${isDark ? "bg-[#0d111c] border-white/10" : "bg-white border-slate-200/80"}`}> 
          {INNER_TABS.map(tab => (
            <button type="button" key={tab.id} onClick={() => selectInnerTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1.5 px-1.5 py-2.5 rounded-xl text-[10px] font-bold transition-all text-center w-full min-h-[62px] border ${
                innerTab === tab.id
                  ? (isDark ? "bg-blue-500/15 border-blue-400/20 text-blue-300" : "bg-[#0b2149] border-[#0b2149] text-white shadow-sm")
                  : (isDark ? "border-transparent text-white/45 hover:bg-white/5 hover:text-white" : "border-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-700")
              }`}>
              <tab.icon className="w-[19px] h-[19px] flex-shrink-0" />
              <span className="leading-none">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Editing panel */}
        <div className="block md:flex md:flex-1 min-w-0 md:min-h-0 max-w-full bg-[#F5F7FB] dark:bg-[#080b12]">
          <div className={`min-w-0 pb-safe overflow-visible md:flex-1 md:min-h-0 md:overflow-y-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 ${mobileGroupOpen ? "block" : "hidden md:block"}`} style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y", overscrollBehaviorY: "auto" }}>
            <div className="w-full max-w-[920px] mx-auto">
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
            {innerTab === "layouts" && (
              <DesignTab profile={{ ...(profile || {}), ...(liveForm || {}) }} user={user} onSaved={async (savedUpdate) => {
                if (savedUpdate) setLiveForm((current) => ({ ...(current || {}), ...savedUpdate }));
                const refreshed = await refetchProfile();
                if (refreshed?.data) setLiveForm({ ...refreshed.data });
              }} />
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
            {innerTab === "lostmode" && (
              <LostModePanel profileId={profileId} user={user} isDark={isDark} effectivePlan={userPlan || "free"} lang={lang} />
            )}
            </div>
          </div>

          {/* Mobile preview FAB + overlay — mobile only */}
          <div className="xl:hidden" style={{ pointerEvents: "none" }}>
            {/* FAB — pointer-events re-enabled on the button itself */}
            <button
              type="button"
              onClick={() => setMobilePreviewOpen(true)}
              className="fixed z-30 flex items-center justify-center w-12 h-12 sm:w-auto sm:h-auto sm:px-4 sm:py-3 rounded-2xl shadow-xl text-white text-sm font-bold border border-white/10"
              style={{ background: "linear-gradient(135deg,#0b2149,#173b73)", boxShadow: "0 10px 30px rgba(11,33,73,0.35)", bottom: "calc(80px + env(safe-area-inset-bottom))", right: 16, pointerEvents: "auto" }}
            >
              <Eye className="w-4 h-4" /> <span className="hidden sm:inline">{t("preview", lang)}</span>
            </button>

            {/* Full-screen overlay */}
            {mobilePreviewOpen && (
              <div
                className="fixed inset-0 z-[100] flex flex-col"
                style={{
                  background: isDark ? "#0a0c14" : "#f1f5f9",
                  height: "100dvh",
                  pointerEvents: "auto",
                  touchAction: "none"
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center gap-2 px-3 py-3 flex-shrink-0" style={{ background: isDark ? "#13162a" : "#fff", borderBottom: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0", paddingTop: "calc(.75rem + env(safe-area-inset-top))" }}>
                  <button type="button" onClick={() => setMobilePreviewOpen(false)}
                    className={`h-10 px-3 rounded-xl flex items-center gap-1.5 flex-shrink-0 text-sm font-bold transition-colors ${isDark ? "bg-white/10 text-white" : "bg-slate-100 text-slate-700"}`}
                    aria-label={t("workspace_back_editor", lang)}>
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <p className={`font-black text-sm flex-1 text-center ${isDark ? "text-white" : "text-slate-900"}`}>{t("studio_live_preview", lang)}</p>
                  {profileUrl ? (
                    <a href={profileUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                      className={`h-10 w-10 flex items-center justify-center rounded-xl border transition-all ${isDark ? "border-white/10 text-white/70" : "border-slate-200 text-slate-600"}`}
                      aria-label={t("workspace_open_public", lang)}>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : <span className="w-10" />}
                </div>
                {/* Preview content — compact phone shell; the screen itself scrolls like a real app */}
                <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden px-3 py-3" style={{ paddingBottom: "calc(.75rem + env(safe-area-inset-bottom))" }}>
                  <div className="w-full h-full flex items-center justify-center min-h-0">
                    <div style={{
                      width: "min(292px, calc(100vw - 56px))",
                      height: "min(500px, calc(100dvh - 190px))",
                      background: "#0f172a",
                      borderRadius: 32,
                      padding: 9,
                      boxShadow: "0 18px 42px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(255,255,255,0.08)",
                      display: "flex",
                      flexDirection: "column",
                      minHeight: 0
                    }}>
                      <div style={{ display: "flex", justifyContent: "center", height: 15, flexShrink: 0 }}>
                        <div style={{ width: 54, height: 10, borderRadius: 999, background: "#26364f", marginTop: 1 }} />
                      </div>

                      <div
                        className="preview-phone-scroll"
                        style={{
                          borderRadius: 22,
                          overflowY: "scroll",
                          overflowX: "hidden",
                          WebkitOverflowScrolling: "touch",
                          overscrollBehavior: "contain",
                          touchAction: "pan-y",
                          scrollbarWidth: "none",
                          msOverflowStyle: "none",
                          background: "#f1f5f9",
                          flex: 1,
                          minHeight: 0,
                          position: "relative",
                          pointerEvents: "auto"
                        }}
                        onTouchMove={(e) => e.stopPropagation()}
                        onWheel={(e) => e.stopPropagation()}
                      >
                        <div style={{
                          width: 375,
                          zoom: 0.73,
                          minHeight: "100%",
                          pointerEvents: "none",
                          userSelect: "none",
                          paddingBottom: 80
                        }}>
                          <WorkspaceLayoutPreview liveForm={{ ...(profile || {}), ...liveForm }} />
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 18, flexShrink: 0 }}>
                        <div style={{ width: 54, height: 3, borderRadius: 999, background: "#334155" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live preview — desktop only, inline phone frame */}
          <div className={`hidden xl:block flex-shrink-0 border-l overflow-y-auto ${isDark ? "bg-[#0f1220] border-white/10" : "bg-[#F7F9FC] border-[#E5EAF2]"}`} style={{ width: 276, padding: "20px 18px" }}>
            <div style={{ position: "sticky", top: 18 }}>
              <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${mutedText}`}>{t("studio_live_preview", lang)}</p>
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
              <p className={`text-xs text-center mt-2 ${mutedText}`}>{t("studio_updates_typing", lang)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}