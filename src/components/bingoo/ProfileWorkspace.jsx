import React, { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft, Eye, QrCode, Copy, Check, Download, Info, Link2,
  Palette, Share2, Settings, ExternalLink, Plus, Trash2, GripVertical,
  Save, Shield, AlertTriangle, Globe, Mail, Phone, Instagram, Linkedin,
  Facebook, Youtube, Smartphone, CreditCard, AlertOctagon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import LivePreviewPanel from "@/components/bingoo/LivePreviewPanel";
import LayoutPicker from "@/components/bingoo/LayoutPicker";
import LostDeviceManager from "@/components/bingoo/LostDeviceManager";
import { usePlan } from "@/hooks/usePlan";
import { toast } from "sonner";
import { t, getLang } from "@/lib/i18n";

// Only these fields are sent to the backend — no system fields (id, created_date, etc.)
const EDITABLE_FIELDS = [
  "display_name", "job_title", "company_name", "location", "phone",
  "whatsapp_number", "email", "website", "bio", "cover_color", "cover_photo",
  "profile_photo", "instagram_url", "linkedin_url", "facebook_url", "tiktok_url",
  "youtube_url", "payment_link", "zelle_link", "cashapp_link", "wave_link",
  "orangemoney_link", "booking_enabled", "whatsapp_booking_message", "custom_links",
  "layout", "bg_style", "button_style", "username", "is_active", "show_location", "language",
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
function InfoPanel({ liveForm, setVal, set, onSave, isPending, saveStatus, saveTime, saveError, isDark, profile, lang }) {
  const headText    = isDark ? "text-white" : "text-slate-900";
  const mutedText   = isDark ? "text-white/40" : "text-slate-400";
  const panelBg     = isDark ? "bg-[#13162a]" : "bg-white";
  const panelBorder = isDark ? "border-white/8" : "border-slate-200";
  const inputCls    = `border-slate-200 ${isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/30" : ""}`;

  return (
    <div className="space-y-5">
      <div className={`rounded-2xl border ${panelBorder} ${panelBg} overflow-hidden`}>
        {/* Cover */}
        <div className="h-28 relative cursor-pointer group"
          style={{
            backgroundColor: liveForm.cover_color || "#2563eb",
            backgroundImage: liveForm.cover_photo ? `url(${liveForm.cover_photo})` : undefined,
            backgroundSize: "cover", backgroundPosition: "center"
          }}>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
            <label className="cursor-pointer opacity-0 group-hover:opacity-100 transition-all bg-white/90 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg">
              {t("change_cover", lang)}
              <input type="file" accept="image/*" className="hidden" onChange={async e => {
                const file = e.target.files[0]; if (!file) return;
                const { file_url } = await base44.integrations.Core.UploadFile({ file });
                setVal("cover_photo", file_url);
              }} />
            </label>
          </div>
          <div className="absolute top-3 right-3 flex gap-1.5 flex-wrap">
            {COVER_COLORS.map(c => (
              <button type="button" key={c} onClick={() => setVal("cover_color", c)}
                className={`w-4 h-4 rounded-full border-2 transition-transform hover:scale-125 ${liveForm.cover_color === c ? "border-white scale-125" : "border-white/40"}`}
                style={{ background: c }} />
            ))}
          </div>
        </div>

        <div className="px-5 pb-5 pt-2">
          <div className="flex items-end gap-4 -mt-10 mb-5">
            <div className="relative flex-shrink-0">
              {liveForm.profile_photo
                ? <img src={liveForm.profile_photo} className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg object-cover" alt="" />
                : <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-2xl font-black text-white"
                    style={{ background: liveForm.cover_color || "#2563eb" }}>{liveForm.display_name?.charAt(0) || "?"}</div>
              }
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
              <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide bg-blue-50 text-blue-700">
                {profile?.plan || "Free"}
              </span>
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

// ── LinkRow — stable component defined OUTSIDE panel to prevent remount on each keystroke ──
// Props are passed explicitly so it never closes over stale renders
function LinkRow({ fieldKey, label, placeholder, IconCmp, value, onChange, isDark, panelBg, panelBorder, mutedText }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${panelBorder} ${panelBg}`}>
      {IconCmp && <IconCmp className="w-4 h-4 flex-shrink-0 text-slate-400" />}
      <div className="flex-1 min-w-0">
        <Label className={`text-[10px] font-bold ${mutedText} block mb-0.5`}>{label}</Label>
        <input
          type="text"
          className={`w-full h-7 text-xs bg-transparent border-0 outline-none p-0 ${isDark ? "text-white placeholder:text-white/20" : "text-slate-700 placeholder:text-slate-300"}`}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      </div>
      {/* Indicator dot: filled = has value */}
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${value ? "bg-emerald-400" : "bg-slate-200"}`} />
    </div>
  );
}

// ── LINKS PANEL ───────────────────────────────────────────────────────────
function LinksPanel({ liveForm, setVal, set, onSave, isPending, saveStatus, saveTime, saveError, isDark, lang }) {
  const [newLink, setNewLink] = useState({ label: "", url: "", enabled: true });
  const headText    = isDark ? "text-white" : "text-slate-900";
  const mutedText   = isDark ? "text-white/40" : "text-slate-400";
  const panelBg     = isDark ? "bg-[#13162a]" : "bg-white";
  const panelBorder = isDark ? "border-white/8" : "border-slate-200";
  const inputCls    = `border-slate-200 ${isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/30" : ""}`;

  const links = liveForm.custom_links || [];
  const addLink = () => {
    if (!newLink.label || !newLink.url) return;
    setVal("custom_links", [...links, { ...newLink, id: Date.now().toString() }]);
    setNewLink({ label: "", url: "", enabled: true });
  };
  const toggleLink = (idx) => setVal("custom_links", links.map((l, i) => i === idx ? { ...l, enabled: !l.enabled } : l));
  const removeLink = (idx) => setVal("custom_links", links.filter((_, i) => i !== idx));

  // Shared props object to keep LinkRow calls clean
  const rowProps = { isDark, panelBg, panelBorder, mutedText };

  return (
    <div className="space-y-1">
      <p className={`text-xs font-black uppercase tracking-widest mt-2 mb-2 ${mutedText}`}>Social</p>
      <div className="space-y-2">
        <LinkRow fieldKey="instagram_url"  label="Instagram"  placeholder="https://instagram.com/..."   IconCmp={Instagram} value={liveForm.instagram_url  || ""} onChange={set("instagram_url")}  {...rowProps} />
        <LinkRow fieldKey="linkedin_url"   label="LinkedIn"   placeholder="https://linkedin.com/in/..."  IconCmp={Linkedin}  value={liveForm.linkedin_url   || ""} onChange={set("linkedin_url")}   {...rowProps} />
        <LinkRow fieldKey="facebook_url"   label="Facebook"   placeholder="https://facebook.com/..."    IconCmp={Facebook}  value={liveForm.facebook_url   || ""} onChange={set("facebook_url")}   {...rowProps} />
        <LinkRow fieldKey="tiktok_url"     label="TikTok"     placeholder="https://tiktok.com/@..."     IconCmp={Smartphone} value={liveForm.tiktok_url    || ""} onChange={set("tiktok_url")}     {...rowProps} />
        <LinkRow fieldKey="youtube_url"    label="YouTube"    placeholder="https://youtube.com/@..."    IconCmp={Youtube}   value={liveForm.youtube_url    || ""} onChange={set("youtube_url")}    {...rowProps} />
      </div>

      <p className={`text-xs font-black uppercase tracking-widest mt-5 mb-2 ${mutedText}`}>Contact</p>
      <div className="space-y-2">
        <LinkRow fieldKey="website"         label={t("website", lang)}  placeholder="https://yoursite.com"    IconCmp={Globe}  value={liveForm.website          || ""} onChange={set("website")}          {...rowProps} />
        <LinkRow fieldKey="email"           label={t("email", lang)}    placeholder="you@example.com"         IconCmp={Mail}   value={liveForm.email            || ""} onChange={set("email")}            {...rowProps} />
        <LinkRow fieldKey="phone"           label={t("phone", lang)}    placeholder="+1 555 000 0000"         IconCmp={Phone}  value={liveForm.phone            || ""} onChange={set("phone")}            {...rowProps} />
        <LinkRow fieldKey="whatsapp_number" label={t("whatsapp", lang)} placeholder="+1 555 000 0000"         IconCmp={Phone}  value={liveForm.whatsapp_number  || ""} onChange={set("whatsapp_number")}  {...rowProps} />
      </div>

      <p className={`text-xs font-black uppercase tracking-widest mt-5 mb-2 ${mutedText}`}>Payments</p>
      <div className="space-y-2">
        <LinkRow fieldKey="payment_link"     label="PayPal / Payment Link" placeholder="https://paypal.me/..."           IconCmp={CreditCard} value={liveForm.payment_link     || ""} onChange={set("payment_link")}     {...rowProps} />
        <LinkRow fieldKey="zelle_link"       label="Zelle"                 placeholder="https://enroll.zellepay.com/..."  IconCmp={CreditCard} value={liveForm.zelle_link       || ""} onChange={set("zelle_link")}       {...rowProps} />
        <LinkRow fieldKey="cashapp_link"     label="Cash App"              placeholder="https://cash.app/$..."           IconCmp={CreditCard} value={liveForm.cashapp_link     || ""} onChange={set("cashapp_link")}     {...rowProps} />
        <LinkRow fieldKey="wave_link"        label="Wave"                  placeholder="https://wave.com/..."            IconCmp={CreditCard} value={liveForm.wave_link        || ""} onChange={set("wave_link")}        {...rowProps} />
        <LinkRow fieldKey="orangemoney_link" label="Orange Money"          placeholder="https://..."                     IconCmp={CreditCard} value={liveForm.orangemoney_link || ""} onChange={set("orangemoney_link")} {...rowProps} />
      </div>

      <p className={`text-xs font-black uppercase tracking-widest mt-5 mb-2 ${mutedText}`}>Booking</p>
      <div className={`flex items-center justify-between p-3 rounded-xl border ${panelBorder} ${panelBg}`}>
        <div>
          <p className={`text-sm font-semibold ${headText}`}>Booking / Contact Form</p>
          <p className={`text-xs ${mutedText}`}>Show a contact/booking form on your profile</p>
        </div>
        <Toggle value={!!liveForm.booking_enabled} onChange={(v) => setVal("booking_enabled", v)} />
      </div>
      <div className="mt-2">
        <Label className={`text-xs font-semibold ${mutedText}`}>WhatsApp Booking Message</Label>
        <input
          type="text"
          className={`mt-1 w-full px-3 py-2 rounded-xl text-sm border ${inputCls}`}
          value={liveForm.whatsapp_booking_message || ""}
          onChange={set("whatsapp_booking_message")}
          placeholder="Hi, I'd like to book..."
        />
      </div>

      <p className={`text-xs font-black uppercase tracking-widest mt-5 mb-2 ${mutedText}`}>Custom Links</p>
      <div className={`p-3 rounded-xl border ${panelBorder} ${panelBg} space-y-2`}>
        <div className="flex gap-2">
          <input
            type="text"
            className={`flex-1 px-3 py-2 rounded-xl text-xs border ${inputCls}`}
            placeholder="Label"
            value={newLink.label}
            onChange={e => setNewLink(l => ({ ...l, label: e.target.value }))}
          />
          <input
            type="text"
            className={`flex-1 px-3 py-2 rounded-xl text-xs border ${inputCls}`}
            placeholder="https://..."
            value={newLink.url}
            onChange={e => setNewLink(l => ({ ...l, url: e.target.value }))}
          />
          <button type="button" onClick={addLink} className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-white flex-shrink-0" style={{ background: "#0B2E6B" }}>
            <Plus className="w-3.5 h-3.5" /> {t("add", lang)}
          </button>
        </div>
      </div>
      {links.length > 0 && (
        <div className={`rounded-2xl border ${panelBorder} ${panelBg} overflow-hidden`}>
          <div className="divide-y" style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9" }}>
            {links.map((link, idx) => (
              <div key={link.id || idx} className={`flex items-center gap-3 px-4 py-3 ${!link.enabled ? "opacity-50" : ""}`}>
                <GripVertical className={`w-4 h-4 flex-shrink-0 ${mutedText}`} />
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${headText}`}>{link.label}</p>
                  <p className={`text-xs truncate ${mutedText}`}>{link.url}</p>
                </div>
                <Toggle value={!!link.enabled} onChange={() => toggleLink(idx)} />
                <button type="button" onClick={() => removeLink(idx)} className="text-red-400 hover:text-red-600 p-1 flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="pt-2 flex items-center gap-4">
        <SaveBtn onSave={onSave} isPending={isPending} label={t("save_links", lang)} />
        <SaveStatus status={saveStatus} time={saveTime} error={saveError} lang={lang} />
      </div>
    </div>
  );
}

// ── DESIGN PANEL ──────────────────────────────────────────────────────────
function DesignPanel({ liveForm, setVal, onSave, isPending, saveStatus, saveTime, saveError, isDark, userPlan, profile, user, lang }) {
  const mutedText = isDark ? "text-white/40" : "text-slate-400";
  const headText  = isDark ? "text-white" : "text-slate-900";

  return (
    <div className="space-y-5">
      <div className={`rounded-2xl border ${isDark ? "border-white/8 bg-[#13162a]" : "border-slate-200 bg-white"} p-5 space-y-5`}>
        <div>
          <Label className={`text-xs font-semibold ${mutedText} mb-2 block`}>{t("accent_color", lang)}</Label>
          <div className="flex gap-2 flex-wrap">
            {COVER_COLORS.map(c => (
              <button type="button" key={c} onClick={() => setVal("cover_color", c)}
                className="relative w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center"
                style={{ background: c, borderColor: liveForm.cover_color === c ? "#fff" : "transparent", transform: liveForm.cover_color === c ? "scale(1.15)" : "scale(1)", boxShadow: liveForm.cover_color === c ? "0 0 0 2px #0B2E6B" : "none" }}>
                {liveForm.cover_color === c && <Check className="w-3 h-3 text-white drop-shadow" />}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label className={`text-xs font-semibold ${mutedText} mb-2 block`}>{t("bg_style", lang)}</Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { v: "clean",    label: "Clean White",   desc: "Simple & neutral" },
              { v: "gradient", label: "Soft Gradient",  desc: "Colour wash" },
              { v: "mesh",     label: "Mesh",           desc: "Dual-tone blend" },
              { v: "night",    label: "Night",          desc: "Dark atmosphere" },
            ].map(o => {
              const selected = liveForm.bg_style === o.v;
              return (
                <button type="button" key={o.v} onClick={() => setVal("bg_style", o.v)}
                  className={`flex items-start gap-2 p-3 rounded-xl border-2 text-left transition-all ${selected ? "border-orange-400 bg-orange-50" : `border-slate-100 ${isDark ? "hover:border-white/20" : "hover:border-slate-300"}`}`}>
                  <div className="flex-1">
                    <p className={`text-xs font-bold ${selected ? "text-orange-600" : headText}`}>{o.label}</p>
                    <p className={`text-[11px] ${mutedText}`}>{o.desc}</p>
                  </div>
                  {selected && <Check className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <Label className={`text-xs font-semibold ${mutedText} mb-2 block`}>{t("button_style", lang)}</Label>
          <div className="flex gap-2">
            {[{ v: "pill", label: "Pill" }, { v: "rounded", label: "Rounded" }, { v: "sharp", label: "Sharp" }].map(o => {
              const selected = liveForm.button_style === o.v;
              return (
                <button type="button" key={o.v} onClick={() => setVal("button_style", o.v)}
                  className={`flex-1 py-2 text-xs font-bold border-2 transition-all flex items-center justify-center gap-1 ${selected ? "border-orange-400 bg-orange-50 text-orange-600" : "border-slate-100 text-slate-500 hover:border-slate-300"}`}
                  style={{ borderRadius: o.v === "pill" ? 999 : o.v === "sharp" ? 6 : 12 }}>
                  {selected && <Check className="w-3 h-3" />}{o.label}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <Label className={`text-xs font-semibold ${mutedText} mb-2 block`}>{t("profile_layout", lang)}</Label>
          <LayoutPicker value={liveForm.layout || "classic"} onChange={v => setVal("layout", v)}
            color={liveForm.cover_color} plan={userPlan || profile?.plan || "free"}
            isAdmin={user?.role === "admin"} />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <SaveBtn onSave={onSave} isPending={isPending} label={t("save_design", lang)} />
        <SaveStatus status={saveStatus} time={saveTime} error={saveError} lang={lang} />
      </div>
    </div>
  );
}

// ── SHARE PANEL ───────────────────────────────────────────────────────────
function SharePanel({ profileUrl, profileQrUrl, isDark, copiedUrl, onCopy, onDownloadQR, lang }) {
  const headText    = isDark ? "text-white" : "text-slate-900";
  const mutedText   = isDark ? "text-white/40" : "text-slate-400";
  const panelBg     = isDark ? "bg-[#13162a]" : "bg-white";
  const panelBorder = isDark ? "border-white/8" : "border-slate-200";
  const qrPreviewUrl = profileQrUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(profileQrUrl)}&color=${isDark ? "ffffff" : "1e293b"}&bgcolor=${isDark ? "1e293b" : "f8fafc"}`
    : null;

  return (
    <div className="space-y-4">
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
      <div className={`rounded-2xl border ${panelBorder} ${panelBg} p-5 text-center`}>
        <p className={`font-bold text-sm ${headText} mb-4`}>{t("qr_code", lang)}</p>
        {qrPreviewUrl ? (
          <>
            <div className={`inline-block p-4 rounded-2xl mb-3 ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
              <img src={qrPreviewUrl} alt="QR Code" className="w-36 h-36 rounded-xl mx-auto" />
            </div>
            <p className={`text-xs mb-3 ${mutedText}`}>Scan to open your profile</p>
            <Button type="button" onClick={onDownloadQR} className="rounded-xl font-bold gap-2 text-white" style={{ background: "#0B2E6B" }}>
              <Download className="w-4 h-4" /> {t("download_qr", lang)}
            </Button>
          </>
        ) : (
          <p className={`text-sm ${mutedText}`}>Set a username to generate a QR code.</p>
        )}
      </div>
    </div>
  );
}

// ── LOST MODE PANEL ───────────────────────────────────────────────────────
function LostModePanel({ profileId, user, isDark }) {
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
    <div className="flex flex-col h-full">
      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <button type="button" onClick={onBack}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all flex-shrink-0 ${isDark ? "border-white/10 text-white/50 hover:bg-white/8 hover:text-white" : "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}>
          <ChevronLeft className="w-4 h-4" /> {t("back_profiles", lang)}
        </button>

        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {profile.profile_photo
            ? <img src={profile.profile_photo} className="w-9 h-9 rounded-xl object-cover shadow flex-shrink-0" alt="" />
            : <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-sm flex-shrink-0 shadow"
                style={{ background: profile.cover_color || "#2563eb" }}>{profile.display_name?.charAt(0)}</div>
          }
          <div className="min-w-0">
            <p className={`font-bold text-sm truncate ${headText}`}>{profile.display_name}</p>
            <p className={`text-[11px] ${mutedText} truncate`}>/p/{profile.username}</p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide bg-blue-100 text-blue-700 flex-shrink-0">
            {profile.plan || "free"}
          </span>
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
      <div className="flex gap-4 flex-1 min-h-0">
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
        <div className="flex gap-4 flex-1 min-w-0">
          <div className="flex-1 min-w-0 overflow-y-auto max-h-[calc(100vh-240px)]">
            {innerTab === "info" && (
              <InfoPanel {...makeSaveProps("info")} liveForm={liveForm} setVal={setVal} set={set} profile={profile} />
            )}
            {innerTab === "links" && (
              <LinksPanel {...makeSaveProps("links")} liveForm={liveForm} setVal={setVal} set={set} />
            )}
            {innerTab === "design" && (
              <DesignPanel {...makeSaveProps("design")} liveForm={liveForm} setVal={setVal} userPlan={userPlan} profile={profile} user={user} />
            )}
            {innerTab === "share" && (
              <SharePanel
                profileUrl={profileUrl} profileQrUrl={profileQrUrl}
                isDark={isDark} copiedUrl={copiedUrl}
                onCopy={copyUrl} onDownloadQR={downloadQR} lang={lang}
              />
            )}
            {innerTab === "lostmode" && (
              <LostModePanel profileId={profileId} user={user} isDark={isDark} />
            )}
            {innerTab === "settings" && (
              <SettingsPanel {...makeSaveProps("settings")} liveForm={liveForm} setVal={setVal} set={set} />
            )}
          </div>

          {/* Live preview — desktop only */}
          <div className="hidden xl:block w-72 flex-shrink-0">
            <div className="sticky top-0">
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${mutedText}`}>Live Preview</p>
              <div className="rounded-2xl overflow-hidden shadow-xl" style={{ border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}` }}>
                <LivePreviewPanel
                  key={profileId}
                  profile={profile}
                  pendingProfile={{ ...profile, ...liveForm }}
                  hasChanges={true}
                  isDark={isDark}
                  previewMode="profile"
                  isLawFirm={isLawFirm}
                  compact={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}