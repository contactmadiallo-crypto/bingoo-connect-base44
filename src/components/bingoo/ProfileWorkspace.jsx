import React, { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft, Eye, QrCode, Copy, Check, Download, Info, Link2,
  Palette, Share2, Settings, ExternalLink, Plus, Trash2, GripVertical,
  Save, Shield, AlertTriangle, Globe, Mail, Phone, Instagram, Linkedin,
  Facebook, Youtube, Smartphone, CreditCard, AlertOctagon, Lock, Star, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import LivePreviewPanel from "@/components/bingoo/LivePreviewPanel";
import { ProfileHeaderPreview } from "@/components/bingoo/SectionPreview";
import LostDeviceManager from "@/components/bingoo/LostDeviceManager";
import LinkStore from "@/components/bingoo/LinkStore";
import DesignPanel from "@/components/bingoo/DesignPanel";
import {
  PhoneIcon as BIPhone, WhatsAppIcon as BIWhatsApp, EmailIcon as BIEmail, WebsiteIcon as BIWebsite,
  InstagramIcon as BIInstagram, LinkedInIcon as BILinkedIn, FacebookIcon as BIFacebook,
  TikTokIcon as BITikTok, YouTubeIcon as BIYouTube, PayPalIcon as BIPayPal,
  CashAppIcon as BICashApp, ZelleIcon as BIZelle, WaveIcon as BIWave, OrangeMoneyIcon as BIOrangeMoney,
  LocationIcon as BILocation,
} from "@/components/bingoo/BrandIcons";
import { usePlan } from "@/hooks/usePlan";
import { getEffectiveProfilePlan, PLAN_LABELS, PLAN_COLORS, canAccess } from "@/lib/planPermissions";
import { toast } from "sonner";
import { t, getLang } from "@/lib/i18n";

// Only these fields are sent to the backend — no system fields (id, created_date, etc.)
const EDITABLE_FIELDS = [
  "display_name", "job_title", "company_name", "company_logo", "location", "phone",
  "whatsapp_number", "email", "website", "bio", "cover_color", "cover_photo",
  "profile_photo", "avatar_shape", "avatar_position", "cover_position",
  "instagram_url", "linkedin_url", "facebook_url", "tiktok_url",
  "youtube_url", "payment_link", "zelle_link", "cashapp_link", "wave_link",
  "orangemoney_link", "booking_enabled", "whatsapp_booking_message", "custom_links",
  "layout", "bg_style", "button_style", "username", "is_active", "show_location", "language",
  "qr_color", "qr_label", "qr_watermark",
];

function buildPayload(liveForm) {
  const payload = {};
  for (const key of EDITABLE_FIELDS) {
    if (liveForm[key] !== undefined) {
      payload[key] = liveForm[key];
    }
  }
  return payload;
}

const COVER_COLORS = [
  "#2563eb","#0B2E6B","#1a4a9e","#7c3aed",
  "#db2777","#059669","#d97706","#dc2626",
  "#0891b2","#1e293b","#374151","#FF7A00"
];

const Toggle = ({ value, onChange }) => (
  <button type="button" onClick={() => onChange(!value)}
    className={`w-11 h-6 rounded-full relative transition-colors flex-shrink-0 ${value ? "bg-orange-500" : "bg-slate-300"}`}>
    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${value ? "left-5" : "left-0.5"}`} />
  </button>
);

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
      className="rounded-xl font-bold text-white px-8" style={{ background: "#FF7A00" }}>
      {isPending ? <><Save className="w-4 h-4 mr-1.5 animate-pulse" />{label}…</> : <><Save className="w-4 h-4 mr-1.5" />{label}</>}
    </Button>
  );
}

// ── INFO PANEL ────────────────────────────────────────────────────────────
function InfoPanel({ liveForm, setVal, set, onSave, isPending, saveStatus, saveTime, saveError, isDark, profile, userPlan, lang }) {
  const headText    = isDark ? "text-white" : "text-slate-900";
  const mutedText   = isDark ? "text-white/40" : "text-slate-400";
  const panelBg     = isDark ? "bg-[#13162a]" : "bg-white";
  const panelBorder = isDark ? "border-white/8" : "border-slate-200";
  const inputCls    = `border-slate-200 ${isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/30" : ""}`;

  return (
    <div className="space-y-5">
      <div className={`rounded-2xl border ${panelBorder} ${panelBg} overflow-hidden`}>
        {/* Cover */}
        <div className="relative cursor-pointer group overflow-hidden" style={{ height: "140px" }}>
          {liveForm.cover_photo
            ? <img src={liveForm.cover_photo} alt="" className="absolute inset-0 w-full h-full" style={{ objectFit: "cover", objectPosition: liveForm.cover_position || "center" }} />
            : <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${liveForm.cover_color || "#2563eb"} 0%, ${(liveForm.cover_color || "#2563eb")}cc 100%)` }} />
          }
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-2">
            <label className="cursor-pointer opacity-0 group-hover:opacity-100 transition-all bg-white/90 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg">
              {t("change_cover", lang)}
              <input type="file" accept="image/*" className="hidden" onChange={async e => {
                const file = e.target.files[0]; if (!file) return;
                const { file_url } = await base44.integrations.Core.UploadFile({ file });
                setVal("cover_photo", file_url);
              }} />
            </label>
            {liveForm.cover_photo && (
              <button type="button" onClick={() => setVal("cover_photo", "")}
                className="opacity-0 group-hover:opacity-100 transition-all bg-red-500/90 text-white text-xs font-bold px-2 py-1.5 rounded-lg">
                Remove
              </button>
            )}
          </div>
          {/* Cover position controls */}
          {liveForm.cover_photo && (
            <div className="absolute bottom-2 left-2 flex gap-1" onClick={e => e.stopPropagation()}>
              {[["center","●"],["top","↑"],["bottom","↓"],["left center","←"],["right center","→"]].map(([pos, icon]) => (
                <button key={pos} type="button" onClick={() => setVal("cover_position", pos)}
                  title={pos}
                  className={`w-6 h-6 rounded-full text-[10px] font-black transition-all flex items-center justify-center ${(liveForm.cover_position||"center")===pos ? "bg-orange-500 text-white" : "bg-black/40 text-white/70 hover:bg-black/60"}`}>
                  {icon}
                </button>
              ))}
            </div>
          )}
          <div className="absolute top-3 right-3 flex gap-1.5 flex-wrap">
            {COVER_COLORS.map(c => (
              <button type="button" key={c} onClick={() => setVal("cover_color", c)}
                className={`w-4 h-4 rounded-full border-2 transition-transform hover:scale-125 ${liveForm.cover_color === c ? "border-white scale-125" : "border-white/40"}`}
                style={{ background: c }} />
            ))}
          </div>
        </div>

        <div className="px-5 pb-5 pt-2">
          <div className="flex items-end gap-4 -mt-9 mb-5">
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
                const ep = getEffectiveProfilePlan(userPlan, profile);
                const colors = PLAN_COLORS[ep] || PLAN_COLORS.free;
                return (
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide"
                    style={{ background: colors.bg, color: colors.text }}>
                    {PLAN_LABELS[ep] || "Free"}
                  </span>
                );
              })()}
            </div>
          </div>

          {/* Avatar shape selector */}
          <div className="mb-4">
            <Label className={`text-xs font-semibold ${mutedText} block mb-2`}>Photo Shape</Label>
            <div className="flex gap-2 flex-wrap">
              {[
                { v: "circle",   label: "Circle",  r: "50%" },
                { v: "rounded",  label: "Rounded", r: "20%" },
                { v: "squircle", label: "iOS Icon", r: "28%" },
                { v: "card",     label: "Card",    r: "12px" },
              ].map(({ v, label, r }) => {
                const sel = (liveForm.avatar_shape || "circle") === v;
                const photoSrc = liveForm.profile_photo;
                return (
                  <button key={v} type="button" onClick={() => setVal("avatar_shape", v)}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${sel ? "border-orange-400" : isDark ? "border-white/10" : "border-slate-200"}`}
                    style={{ minWidth: 64 }}>
                    <div style={{ width: 40, height: 40, borderRadius: r, overflow: "hidden", border: sel ? "2px solid #FF7A00" : "2px solid #e2e8f0", background: liveForm.cover_color || "#2563eb", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {photoSrc
                        ? <img src={photoSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
                        : <span style={{ color: "#fff", fontWeight: 900, fontSize: 16 }}>{liveForm.display_name?.charAt(0) || "?"}</span>
                      }
                    </div>
                    <span className={`text-[10px] font-bold ${sel ? "text-orange-500" : mutedText}`}>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Avatar position (focal point) */}
          {liveForm.profile_photo && (
            <div className="mb-4">
              <Label className={`text-xs font-semibold ${mutedText} block mb-2`}>Photo Focal Point</Label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { v: "center top", label: "Top" },
                  { v: "center", label: "Center" },
                  { v: "center bottom", label: "Bottom" },
                  { v: "left center", label: "Left" },
                  { v: "right center", label: "Right" },
                ].map(({ v, label }) => {
                  const sel = (liveForm.avatar_position || "center top") === v;
                  return (
                    <button key={v} type="button" onClick={() => setVal("avatar_position", v)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${sel ? "border-orange-400 bg-orange-50 text-orange-600" : isDark ? "border-white/10 text-white/50" : "border-slate-200 text-slate-500"}`}>
                      {sel && "✓ "}{label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Business / Brand Logo upload — shown for all plans (salon, law firm, corporate, business, pro) */}
          <div className="mb-4">
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
                <p className={`text-[10px] mt-1 ${mutedText}`}>PNG, SVG or JPG · shown on your public profile</p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className={`text-xs font-semibold ${mutedText}`}>{t("display_name", lang)} *</Label>
              <Input className={`mt-1 ${inputCls}`} value={liveForm.display_name || ""} onChange={set("display_name")} placeholder="Your Name" />
            </div>
            <div>
              <Label className={`text-xs font-semibold ${mutedText}`}>{t("job_title", lang)}</Label>
              <Input className={`mt-1 ${inputCls}`} value={liveForm.job_title || ""} onChange={set("job_title")} placeholder="CEO / Consultant" />
            </div>
            <div>
              <Label className={`text-xs font-semibold ${mutedText}`}>{t("company", lang)}</Label>
              <Input className={`mt-1 ${inputCls}`} value={liveForm.company_name || ""} onChange={set("company_name")} placeholder="Company Name" />
            </div>
            <div>
              <Label className={`text-xs font-semibold ${mutedText}`}>{t("location", lang)}</Label>
              <Input className={`mt-1 ${inputCls}`} value={liveForm.location || ""} onChange={set("location")} placeholder="City, State" />
            </div>
            <div>
              <Label className={`text-xs font-semibold ${mutedText}`}>{t("phone", lang)}</Label>
              <Input className={`mt-1 ${inputCls}`} value={liveForm.phone || ""} onChange={set("phone")} placeholder="+1 555 000 0000" />
            </div>
            <div>
              <Label className={`text-xs font-semibold ${mutedText}`}>{t("whatsapp", lang)}</Label>
              <Input className={`mt-1 ${inputCls}`} value={liveForm.whatsapp_number || ""} onChange={set("whatsapp_number")} placeholder="+1 555 000 0000" />
            </div>
            <div>
              <Label className={`text-xs font-semibold ${mutedText}`}>{t("email", lang)}</Label>
              <Input type="email" className={`mt-1 ${inputCls}`} value={liveForm.email || ""} onChange={set("email")} placeholder="you@example.com" />
            </div>
            <div>
              <Label className={`text-xs font-semibold ${mutedText}`}>{t("website", lang)}</Label>
              <Input className={`mt-1 ${inputCls}`} value={liveForm.website || ""} onChange={set("website")} placeholder="https://yoursite.com" />
            </div>
            <div className="sm:col-span-2">
              <Label className={`text-xs font-semibold ${mutedText}`}>{t("bio", lang)}</Label>
              <Textarea className={`mt-1 ${inputCls}`} rows={3} value={liveForm.bio || ""} onChange={set("bio")} placeholder="Short bio or description..." />
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
  const headText  = isDark ? "text-white"    : "text-slate-900";
  const mutedText = isDark ? "text-white/40" : "text-slate-400";
  const panelBg   = isDark ? "bg-[#13162a]"  : "bg-white";
  const panelBorder = isDark ? "border-white/8" : "border-slate-200";

  const links = liveForm.custom_links || [];
  const toggleLink = (idx) => setVal("custom_links", links.map((l, i) => i === idx ? { ...l, enabled: !l.enabled } : l));
  const removeLink = (idx) => setVal("custom_links", links.filter((_, i) => i !== idx));

  // Count filled-in fields
  const filledFields = [
    liveForm.phone, liveForm.whatsapp_number, liveForm.email, liveForm.website,
    liveForm.instagram_url, liveForm.linkedin_url, liveForm.facebook_url,
    liveForm.tiktok_url, liveForm.youtube_url, liveForm.payment_link,
    liveForm.cashapp_link, liveForm.zelle_link, liveForm.wave_link, liveForm.orangemoney_link,
  ].filter(Boolean).length + links.length;

  return (
    <div className="space-y-3 pb-4">
      {/* Open Link Store button */}
      <button type="button" onClick={() => setStoreOpen(true)}
        className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl border-2 border-dashed transition-all font-bold text-sm"
        style={{ borderColor: "#FF7A00", color: "#FF7A00", background: isDark ? "rgba(255,122,0,0.05)" : "rgba(255,122,0,0.03)" }}>
        <Plus className="w-5 h-5" />
        Add Links from Link Store
        {filledFields > 0 && <span className="ml-auto text-xs font-black px-2 py-0.5 rounded-full text-white" style={{ background: "#FF7A00" }}>{filledFields}</span>}
      </button>

      {/* Summary of active links */}
      <div className={`rounded-2xl border ${panelBorder} ${panelBg} overflow-hidden`}>
        <div className="px-4 py-3 border-b" style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9" }}>
          <p className={`text-xs font-black uppercase tracking-widest ${mutedText}`}>Active Links</p>
        </div>
        {filledFields === 0 ? (
          <p className={`px-4 py-6 text-center text-sm ${mutedText}`}>No links added yet. Tap "Add Links" above.</p>
        ) : (
          <div className="divide-y" style={{ borderColor: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc" }}>
            {[
              { key: "phone",           label: "Phone",       Icon: BIPhone },
              { key: "whatsapp_number", label: "WhatsApp",    Icon: BIWhatsApp },
              { key: "email",           label: "Email",       Icon: BIEmail },
              { key: "website",         label: "Website",     Icon: BIWebsite },
              { key: "location",        label: "Location",    Icon: BILocation },
              { key: "instagram_url",   label: "Instagram",   Icon: BIInstagram },
              { key: "linkedin_url",    label: "LinkedIn",    Icon: BILinkedIn },
              { key: "facebook_url",    label: "Facebook",    Icon: BIFacebook },
              { key: "tiktok_url",      label: "TikTok",      Icon: BITikTok },
              { key: "youtube_url",     label: "YouTube",     Icon: BIYouTube },
              { key: "payment_link",    label: "PayPal",      Icon: BIPayPal },
              { key: "cashapp_link",    label: "Cash App",    Icon: BICashApp },
              { key: "zelle_link",      label: "Zelle",       Icon: BIZelle },
              { key: "wave_link",       label: "Wave",        Icon: BIWave },
              { key: "orangemoney_link",label: "Orange Money",Icon: BIOrangeMoney },
            ].filter(r => liveForm[r.key]).map(r => (
              <div key={r.key} className="flex items-center gap-3 px-3 py-2.5">
                <r.Icon size={14} />
                <p className={`text-xs font-bold ${headText} w-20 flex-shrink-0`}>{r.label}</p>
                <p className={`text-xs truncate flex-1 ${mutedText}`}>{liveForm[r.key]}</p>
                <button type="button" onClick={() => setVal(r.key, "")} className="text-red-400 hover:text-red-600 p-1 flex-shrink-0">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            {links.map((link, idx) => (
              <div key={link.id || String(idx)} className={`flex items-center gap-3 px-4 py-2.5 ${!link.enabled ? "opacity-50" : ""}`}>
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${link.enabled ? "bg-emerald-400" : "bg-slate-300"}`} />
                <p className={`text-xs font-bold ${headText} w-24 flex-shrink-0 truncate`}>{link.label}</p>
                <p className={`text-xs truncate flex-1 ${mutedText}`}>{link.url}</p>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Toggle value={!!link.enabled} onChange={() => toggleLink(idx)} />
                  <button type="button" onClick={() => removeLink(idx)} className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-2 flex items-center gap-4">
        <SaveBtn onSave={onSave} isPending={isPending} label={t("save_links", lang)} />
        <SaveStatus status={saveStatus} time={saveTime} error={saveError} lang={lang} />
      </div>

      {/* ── Link Store overlay (bottom-sheet on mobile, modal-style on desktop) ── */}
      {storeOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setStoreOpen(false)} />
          <div className={`relative w-full md:max-w-lg md:mx-4 md:rounded-3xl rounded-t-3xl flex flex-col shadow-2xl ${isDark ? "bg-[#0e1223]" : "bg-white"}`}
            style={{ maxHeight: "90vh", height: "90vh" }}>
            <LinkStore
              liveForm={liveForm}
              setVal={setVal}
              set={set}
              onSave={onSave}
              isPending={isPending}
              isDark={isDark}
              lang={lang}
              onClose={() => setStoreOpen(false)}
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
const QR_COLORS = ["#1e293b","#0B2E6B","#FF7A00","#7c3aed","#059669","#dc2626","#0891b2","#000000"];

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

  const handleDownloadQR = async () => {
    if (!profileQrUrl || downloading) return;
    setDownloading(true);
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(profileQrUrl)}&color=${fgColor}&bgcolor=ffffff`;
    const qrImg = new Image(); qrImg.crossOrigin = "anonymous";

    qrImg.onload = async () => {
      const canvas = document.createElement("canvas");
      canvas.width = 400; canvas.height = 500;
      const ctx = canvas.getContext("2d");
      // White bg
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, 400, 500);
      // QR
      ctx.drawImage(qrImg, 0, 30, 400, 400);

      // Logo watermark — centered over the QR code (professional plan only)
      const drawFinish = () => {
        // Label
        ctx.fillStyle = qrColor; ctx.font = "bold 22px system-ui,sans-serif";
        ctx.textAlign = "center"; ctx.fillText(displayLabel, 200, 455);
        // Powered by footer
        ctx.fillStyle = "#0B2E6B"; ctx.fillRect(0, 468, 400, 32);
        ctx.fillStyle = "#ffffff"; ctx.font = "bold 11px system-ui,sans-serif";
        ctx.fillText("Powered by Bingoo Connect", 200, 489);
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = `bingoo-qr.png`;
        a.click();
        setDownloading(false);
      };

      if (logoWatermark && isPro && hasLogo) {
        const logoImg = new Image(); logoImg.crossOrigin = "anonymous";
        logoImg.onload = () => {
          // White rounded square behind logo
          const logoSize = 72;
          const lx = (400 - logoSize) / 2;
          const ly = 30 + (400 - logoSize) / 2;
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.roundRect(lx - 6, ly - 6, logoSize + 12, logoSize + 12, 12);
          ctx.fill();
          ctx.drawImage(logoImg, lx, ly, logoSize, logoSize);
          drawFinish();
        };
        logoImg.onerror = drawFinish;
        logoImg.src = profile.company_logo;
      } else {
        drawFinish();
      }
    };
    qrImg.onerror = () => setDownloading(false);
    qrImg.src = qrSrc;
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
            style={{ background: copiedUrl ? "#059669" : "#0B2E6B" }}>
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
            {/* Live QR preview */}
            <div className="flex justify-center">
              <div className={`p-4 rounded-2xl text-center ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
                <img key={qrPreviewUrl} src={qrPreviewUrl} alt="QR Code" className="w-40 h-40 rounded-xl mx-auto" />
                <p className="mt-2 text-xs font-bold" style={{ color: qrColor }}>{displayLabel}</p>
                <p className="text-[9px] mt-1 font-bold text-white px-3 py-1 rounded-full inline-block" style={{ background: "#0B2E6B" }}>
                  Powered by Bingoo Connect
                </p>
              </div>
            </div>

            {/* QR Color */}
            <div>
              <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${mutedText}`}>QR Color</p>
              <div className="flex gap-2 flex-wrap">
                {QR_COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setQrColor(c)}
                    className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center flex-shrink-0"
                    style={{ background: c, borderColor: qrColor === c ? "#FF7A00" : "transparent", transform: qrColor === c ? "scale(1.2)" : "scale(1)" }}>
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
                    style={qrLabel === l && !customLabel ? { background: "#FF7A00" } : {}}>
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
              <p className={`text-[10px] mt-1.5 ${mutedText}`}>"Powered by Bingoo Connect" always appears on downloaded QR code.</p>
            </div>

            {/* Logo Watermark — Pro feature */}
            <div className={`rounded-xl border p-3 ${isDark ? "border-white/8 bg-white/4" : "border-slate-100 bg-slate-50"}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className={`text-xs font-bold ${headText}`}>Logo Watermark</p>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full text-white" style={{ background: "#FF7A00" }}>PRO</span>
                  </div>
                  <p className={`text-[10px] mt-0.5 ${mutedText}`}>
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
                  <p className={`text-[10px] ${mutedText}`}>This logo will be embedded in the downloaded QR code.</p>
                </div>
              )}
            </div>

            {/* Download + Save */}
            <div className="flex gap-2">
              <Button type="button" onClick={handleDownloadQR} disabled={downloading}
                className="flex-1 rounded-xl font-bold gap-2 text-white" style={{ background: "#0B2E6B" }}>
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
          style={{ background: "linear-gradient(135deg, #FF7A00, #FDBA21)" }}>
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
function SettingsPanel({ liveForm, setVal, set, onSave, isPending, saveStatus, saveTime, saveError, isDark, lang }) {
  const headText    = isDark ? "text-white" : "text-slate-900";
  const mutedText   = isDark ? "text-white/40" : "text-slate-400";
  const panelBg     = isDark ? "bg-[#13162a]" : "bg-white";
  const panelBorder = isDark ? "border-white/8" : "border-slate-200";
  const inputCls    = `border-slate-200 ${isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/30" : ""}`;

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

      <div className={`rounded-2xl border border-red-200 ${isDark ? "bg-red-900/10" : "bg-red-50"} p-5 space-y-3`}>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-red-500" />
          <p className="font-bold text-sm text-red-600">Danger Zone</p>
        </div>
        <p className={`text-xs ${isDark ? "text-red-300" : "text-red-500"}`}>Disabling your profile hides it from public access instantly.</p>
        <button type="button" onClick={() => setVal("is_active", false)}
          className="text-xs font-bold text-red-600 border border-red-300 px-4 py-2 rounded-xl hover:bg-red-100 transition-all">
          Deactivate Profile
        </button>
      </div>

      <div className="flex items-center gap-4">
        <SaveBtn onSave={onSave} isPending={isPending} label={t("save_settings", lang)} />
        <SaveStatus status={saveStatus} time={saveTime} error={saveError} lang={lang} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────
export default function ProfileWorkspace({ profileId, user, onBack, isDark, isLawFirm, isSalon, lang: langProp }) {
  const qc = useQueryClient();
  const { plan: userPlan } = usePlan();

  const lang = langProp || getLang();

  const INNER_TABS = [
    { id: "info",      label: t("info", lang),      icon: Info },
    { id: "links",     label: t("links", lang),     icon: Link2 },
    { id: "design",    label: t("design", lang),    icon: Palette },
    { id: "share",     label: t("share", lang),     icon: Share2 },
    { id: "lostmode",  label: t("lost_mode", lang), icon: AlertOctagon },
    { id: "settings",  label: t("settings", lang),  icon: Settings },
  ];

  const [innerTab, setInnerTab] = useState("info");
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
    queryFn: () => base44.entities.Profile.get(profileId),
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

  const profileUrl    = profile ? `${window.location.origin}/p/${profile.username}` : null;
  const profileQrUrl  = profileUrl ? `${profileUrl}?source=qr` : null;

  // Stable setters — won't cause child remounts
  const set    = useCallback((k) => (e) => setLiveForm(f => ({ ...f, [k]: e.target.value })), []);
  const setVal = useCallback((k, v) => setLiveForm(f => ({ ...f, [k]: v })), []);

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
      ctx.fillStyle = "#0B2E6B"; ctx.fillRect(0, 400, 400, 60);
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 16px system-ui,sans-serif";
      ctx.textAlign = "center"; ctx.fillText("bingooconnect.com", 200, 433);
      ctx.fillStyle = "#FF7A00"; ctx.font = "bold 13px system-ui,sans-serif";
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
      const payload = buildPayload(liveForm);
      // 1. Send the update
      await base44.entities.Profile.update(profileId, payload);
      // 2. Refetch from server to verify persistence
      const fresh = await base44.entities.Profile.get(profileId);
      // 3. Verify every submitted field matches the server value
      const mismatch = Object.keys(payload).find(k => {
        const submitted = JSON.stringify(payload[k]);
        const server    = JSON.stringify(fresh[k]);
        return submitted !== server;
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
      // Update query cache with verified server data
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
      const msg = err?.message || "Unknown error";
      setSaveStatus("error");
      setSaveError(msg);
      toast.error(msg, { id: "bingoo-save", duration: 4000 });
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
    <div className="flex flex-col h-full relative">
      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <button type="button" onClick={onBack}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all flex-shrink-0 ${isDark ? "border-white/10 text-white/50 hover:bg-white/8 hover:text-white" : "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}>
          <ChevronLeft className="w-4 h-4" /> {t("back_profiles", lang)}
        </button>

        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {(() => {
            const shapeR = { circle: "50%", rounded: "20%", squircle: "28%", card: "10px" }[profile.avatar_shape] || "50%";
            return profile.profile_photo
              ? <img src={profile.profile_photo} style={{ width: 36, height: 36, borderRadius: shapeR, objectFit: "cover", objectPosition: profile.avatar_position || "center top", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }} alt="" />
              : <div style={{ width: 36, height: 36, borderRadius: shapeR, background: profile.cover_color || "#2563eb", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>{profile.display_name?.charAt(0)}</div>;
          })()}
          <div className="min-w-0">
            <p className={`font-bold text-sm truncate ${headText}`}>{profile.display_name}</p>
            <p className={`text-[11px] ${mutedText} truncate`}>/p/{profile.username}</p>
          </div>
          {(() => {
            const ep = getEffectiveProfilePlan(userPlan, profile);
            const colors = PLAN_COLORS[ep] || PLAN_COLORS.free;
            return (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex-shrink-0"
                style={{ background: colors.bg, color: colors.text }}>
                {PLAN_LABELS[ep] || "Free"}
              </span>
            );
          })()}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <a href={profileUrl} target="_blank" rel="noopener noreferrer"
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-all ${isDark ? "border-white/10 text-white/60 hover:bg-white/8" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            <Eye className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{t("preview", lang)}</span>
          </a>
          <button type="button" onClick={copyUrl}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-all ${isDark ? "border-white/10 text-white/60 hover:bg-white/8" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            {copiedUrl ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedUrl ? t("copied", lang) : t("copy_link", lang)}</span>
          </button>
          <button type="button" onClick={() => setInnerTab("share")}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl text-white hover:opacity-90 transition-all"
            style={{ background: "#FF7A00" }}>
            <QrCode className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{t("share", lang)}</span>
          </button>
        </div>
      </div>

      {/* ── Mobile: horizontal scrollable pill tabs ── */}
      <div className="md:hidden flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
        {INNER_TABS.map(tab => (
          <button type="button" key={tab.id} onClick={() => setInnerTab(tab.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
              innerTab === tab.id ? "text-white shadow-sm" : (isDark ? "bg-white/8 text-white/50" : "bg-slate-100 text-slate-500")
            }`}
            style={innerTab === tab.id ? { background: "#0B2E6B" } : {}}>
            <tab.icon className="w-3.5 h-3.5 flex-shrink-0" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Main layout ── */}
      <div className="flex gap-4 flex-1 min-h-0 max-w-full overflow-hidden">
        {/* Desktop vertical nav */}
        <div className="hidden md:flex flex-col gap-1 w-36 flex-shrink-0">
          {INNER_TABS.map(tab => (
            <button type="button" key={tab.id} onClick={() => setInnerTab(tab.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left w-full ${
                innerTab === tab.id
                  ? (isDark ? "bg-white/10 text-white" : "bg-blue-50 text-blue-700")
                  : (isDark ? "text-white/50 hover:bg-white/5 hover:text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800")
              }`}
              style={innerTab === tab.id ? { borderLeft: "3px solid #FF7A00", borderRadius: "0 12px 12px 0" } : {}}>
              <tab.icon className="w-4 h-4 flex-shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Editing panel */}
        <div className="flex gap-4 flex-1 min-w-0 max-w-full overflow-hidden">
          <div className="flex-1 min-w-0 overflow-y-auto max-h-[calc(100vh-240px)]">
            {innerTab === "info" && (
              <InfoPanel {...makeSaveProps("info")} liveForm={liveForm} setVal={setVal} set={set} profile={profile} userPlan={userPlan} />
            )}
            {innerTab === "links" && (
              <LinksPanel {...makeSaveProps("links")} liveForm={liveForm} setVal={setVal} set={set} />
            )}
            {innerTab === "design" && (
              <DesignPanel {...makeSaveProps("design")} liveForm={liveForm} setVal={setVal} userPlan={userPlan} profile={profile} user={user} lang={lang} />
            )}
            {innerTab === "share" && (
              <SharePanel
                profileUrl={profileUrl} profileQrUrl={profileQrUrl}
                isDark={isDark} copiedUrl={copiedUrl}
                onCopy={copyUrl} lang={lang}
                profile={profile}
                effectivePlan={getEffectiveProfilePlan(userPlan, profile)}
                liveForm={liveForm}
                setVal={setVal}
                {...makeSaveProps("share")}
              />
            )}
            {innerTab === "lostmode" && (
              <LostModePanel profileId={profileId} user={user} isDark={isDark} effectivePlan={getEffectiveProfilePlan(userPlan, profile)} />
            )}
            {innerTab === "settings" && (
              <SettingsPanel {...makeSaveProps("settings")} liveForm={liveForm} setVal={setVal} set={set} />
            )}
          </div>

          {/* Mobile preview FAB + overlay — mobile only */}
          <div className="xl:hidden">
            {/* FAB */}
            <button
              type="button"
              onClick={() => setMobilePreviewOpen(true)}
              className="fixed bottom-6 right-4 z-40 flex items-center gap-2 px-4 py-3 rounded-full shadow-xl text-white text-sm font-bold"
              style={{ background: "#0B2E6B", boxShadow: "0 8px 28px rgba(11,46,107,0.5)" }}
            >
              <Eye className="w-4 h-4" /> Preview
            </button>

            {/* Full-screen overlay */}
            {mobilePreviewOpen && (
              <div className="fixed inset-0 z-50 flex flex-col safe-top safe-bottom" style={{ background: isDark ? "#0a0c14" : "#f1f5f9" }}>
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-4 flex-shrink-0" style={{ background: isDark ? "#13162a" : "#fff", borderBottom: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0", paddingTop: "calc(1rem + env(safe-area-inset-top))" }}>
                  <p className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>Live Preview</p>
                  <button type="button" onClick={() => setMobilePreviewOpen(false)}
                    className={`p-2 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isDark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-600"}`}
                    title="Close preview (ESC)">
                    <X className="w-5 h-5" />
                  </button>
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
                      <div style={{ borderRadius: 22, overflowY: "auto", overflowX: "hidden", background: "#f1f5f9", maxHeight: "70vh" }}>
                        <ProfileHeaderPreview profile={{ ...(profile || {}), ...liveForm }} />
                        {(liveForm.custom_links || []).filter(l => l.enabled !== false && l.label && l.url).slice(0, 5).map((link, i) => (
                          <div key={link.id || i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", marginBottom: 4, borderRadius: 10, background: "#fff", border: "1px solid #e2e8f0", margin: "4px 12px" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "#374151", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{link.label}</span>
                            <span style={{ fontSize: 10, color: "#94a3b8" }}>›</span>
                          </div>
                        ))}
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
          <div className="hidden xl:block w-64 flex-shrink-0 max-w-64">
            <div style={{ position: "sticky", top: 0 }}>
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${mutedText}`}>Live Preview</p>
              {/* Phone shell */}
              <div style={{ background: "#0f172a", borderRadius: 32, padding: 10, boxShadow: "0 20px 40px rgba(0,0,0,0.35), inset 0 0 0 1.5px rgba(255,255,255,0.07)" }}>
                {/* Notch */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
                  <div style={{ width: 64, height: 14, background: "#0f172a", borderRadius: "0 0 12px 12px", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#334155" }} />
                    <div style={{ width: 22, height: 3, borderRadius: 999, background: "#334155" }} />
                  </div>
                </div>
                {/* Screen — scales a 375px-wide preview into ~216px (fixed size for Safari) */}
                <div style={{ borderRadius: 22, height: 520, overflowY: "auto", overflowX: "hidden", background: "#f1f5f9", scrollbarWidth: "none", msOverflowStyle: "none", display: "flex", alignItems: "flex-start" }}>
                  <div style={{ width: 375, transform: "scale(0.576)", transformOrigin: "top left", minHeight: Math.round(520 / 0.576), transformBox: "border-box", WebkitTransformBox: "border-box", WebkitTransformOrigin: "top left" }}>
                    <ProfileHeaderPreview profile={{ ...(profile || {}), ...liveForm }} />
                    {/* Links preview strip */}
                    {(liveForm.custom_links?.filter(l => l.enabled && l.label && l.url).length > 0 ||
                      liveForm.instagram_url || liveForm.facebook_url || liveForm.tiktok_url ||
                      liveForm.linkedin_url || liveForm.youtube_url) && (
                      <div style={{ padding: "8px 14px 4px" }}>
                        <p style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#94a3b8", marginBottom: 6 }}>Links</p>
                        {liveForm.custom_links?.filter(l => l.enabled && l.label && l.url).slice(0, 4).map(link => (
                          <div key={link.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", marginBottom: 5, borderRadius: 10, background: "#fff", border: "1px solid #e2e8f0" }}>
                            <span style={{ fontSize: 9, fontWeight: 700, color: "#374151", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{link.label}</span>
                            <span style={{ fontSize: 9, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 80 }}>{link.url?.replace(/^https?:\/\//, "")}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* Home bar */}
                <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
                  <div style={{ width: 60, height: 3, borderRadius: 999, background: "#334155" }} />
                </div>
              </div>
              <p className={`text-[10px] text-center mt-2 ${mutedText}`}>Updates as you type</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}