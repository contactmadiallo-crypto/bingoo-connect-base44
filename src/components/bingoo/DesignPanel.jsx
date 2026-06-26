import React, { useState } from "react";
import { Check, Upload, Sparkles, Palette, Layout, Star, CreditCard, User } from "lucide-react";
import { base44 } from "@/api/base44Client";
import LayoutPicker from "@/components/bingoo/LayoutPicker";
import { getEffectiveProfilePlan } from "@/lib/planPermissions";

const COVER_COLORS = [
  "#2563eb","#0B2E6B","#1a4a9e","#7c3aed",
  "#db2777","#059669","#d97706","#dc2626",
  "#0891b2","#1e293b","#374151","#FF7A00"
];

const BG_STYLES = [
  { v: "clean",    label: "Clean",    desc: "Simple & neutral" },
  { v: "gradient", label: "Gradient", desc: "Color wash" },
  { v: "mesh",     label: "Mesh",     desc: "Dual-tone blend" },
  { v: "night",    label: "Night",    desc: "Dark atmosphere" },
  { v: "blur",     label: "Blur",     desc: "Frosted glass" },
  { v: "animated", label: "Animated", desc: "Motion background" },
];

const BTN_STYLES = [
  { v: "pill",     label: "Pill",     radius: 999 },
  { v: "rounded",  label: "Rounded",  radius: 12 },
  { v: "sharp",    label: "Sharp",    radius: 6 },
  { v: "outlined", label: "Outlined", radius: 12 },
  { v: "flat",     label: "Flat",     radius: 8 },
];

const SECTIONS = [
  { id: "theme",    label: "Theme",        icon: Sparkles },
  { id: "general",  label: "General",      icon: Palette },
  { id: "layout",   label: "Layout",       icon: Layout },
];

export default function DesignPanel({ liveForm, setVal, onSave, isPending, saveStatus, saveTime, saveError, isDark, userPlan, profile, user, lang }) {
  const [section, setSection] = useState("theme");
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  const headText  = isDark ? "text-white"    : "text-slate-900";
  const mutedText = isDark ? "text-white/40" : "text-slate-400";
  const bg        = isDark ? "bg-[#13162a]"  : "bg-white";
  const border    = isDark ? "border-white/8" : "border-slate-200";
  const rowCls    = `rounded-2xl border ${border} ${bg} p-4 space-y-3`;

  const handleSave = () => {
    onSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setVal("cover_photo", file_url);
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setVal("profile_photo", file_url);
    } finally {
      setUploading(false);
    }
  };

  const sel = (v, current) => v === current;

  return (
    <div className="space-y-4">
      {/* ── Horizontal section tabs (mobile + desktop) ── */}
      <div className={`flex gap-1 p-1 rounded-2xl ${isDark ? "bg-white/5" : "bg-slate-100"}`}>
        {SECTIONS.map(s => (
          <button key={s.id} type="button" onClick={() => setSection(s.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs font-bold transition-all ${
              section === s.id
                ? "text-white shadow-sm"
                : isDark ? "text-white/40 hover:text-white/70" : "text-slate-500 hover:text-slate-700"
            }`}
            style={section === s.id ? { background: "#0B2E6B" } : {}}>
            <s.icon className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{s.label}</span>
          </button>
        ))}
      </div>

      {/* ── THEME section: accent color + bg style ── */}
      {section === "theme" && (
        <div className="space-y-4">
          <div className={rowCls}>
            <p className={`text-xs font-black uppercase tracking-widest ${mutedText}`}>Accent Color</p>
            <div className="flex gap-2 flex-wrap">
              {COVER_COLORS.map(c => (
                <button type="button" key={c} onClick={() => setVal("cover_color", c)}
                  className="relative w-9 h-9 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center"
                  style={{
                    background: c,
                    borderColor: sel(c, liveForm.cover_color) ? "#fff" : "transparent",
                    transform: sel(c, liveForm.cover_color) ? "scale(1.15)" : "scale(1)",
                    boxShadow: sel(c, liveForm.cover_color) ? `0 0 0 2px ${c}` : "none",
                  }}>
                  {sel(c, liveForm.cover_color) && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
                </button>
              ))}
              <div className="w-9 h-9 rounded-full border-2 border-slate-300 flex items-center justify-center overflow-hidden">
                <input type="color" value={liveForm.cover_color || "#2563eb"} onChange={e => setVal("cover_color", e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0 outline-none" title="Custom" />
              </div>
            </div>
          </div>

          <div className={rowCls}>
            <p className={`text-xs font-black uppercase tracking-widest ${mutedText}`}>Background Style</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {BG_STYLES.map(o => {
                const active = sel(o.v, liveForm.bg_style || "clean");
                return (
                  <button type="button" key={o.v} onClick={() => setVal("bg_style", o.v)}
                    className={`flex items-start gap-2 p-3 rounded-xl border-2 text-left transition-all ${
                      active ? "border-orange-400 bg-orange-50" : `border-slate-100 ${isDark ? "hover:border-white/20" : "hover:border-slate-300"}`
                    }`}
                    style={active && isDark ? { borderColor: "#FF7A00", background: "rgba(255,122,0,0.08)" } : {}}>
                    <div className="flex-1">
                      <p className={`text-xs font-bold ${active ? "text-orange-600" : headText}`}>{o.label}</p>
                      <p className={`text-[10px] ${mutedText}`}>{o.desc}</p>
                    </div>
                    {active && <Check className="w-3.5 h-3.5 text-orange-500 flex-shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── GENERAL section: cover photo, avatar, button style ── */}
      {section === "general" && (
        <div className="space-y-4">
          {/* Cover Photo */}
          <div className={rowCls}>
            <p className={`text-xs font-black uppercase tracking-widest ${mutedText}`}>Cover Photo</p>
            {liveForm.cover_photo && (
              <div className="w-full h-24 rounded-xl overflow-hidden mb-2">
                <img src={liveForm.cover_photo} alt="Cover" className="w-full h-full object-cover" />
              </div>
            )}
            <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer w-full transition-all text-sm font-semibold ${isDark ? "border-white/10 text-white/60 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              <Upload className="w-4 h-4 flex-shrink-0" />
              {uploading ? "Uploading…" : liveForm.cover_photo ? "Change Cover" : "Upload Cover Photo"}
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploading} />
            </label>
            {liveForm.cover_photo && (
              <button type="button" onClick={() => setVal("cover_photo", "")} className="text-xs text-red-400 hover:text-red-600 mt-1">Remove cover photo</button>
            )}
          </div>

          {/* Avatar */}
          <div className={rowCls}>
            <p className={`text-xs font-black uppercase tracking-widest ${mutedText}`}>Profile Photo</p>
            {liveForm.profile_photo && (
              <img src={liveForm.profile_photo} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover object-top border-2 border-white shadow mb-2" />
            )}
            <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer w-full transition-all text-sm font-semibold ${isDark ? "border-white/10 text-white/60 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              <User className="w-4 h-4 flex-shrink-0" />
              {uploading ? "Uploading…" : liveForm.profile_photo ? "Change Photo" : "Upload Profile Photo"}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
            </label>
          </div>

          {/* Button Style */}
          <div className={rowCls}>
            <p className={`text-xs font-black uppercase tracking-widest ${mutedText}`}>Link Button Style</p>
            <div className="flex gap-2 flex-wrap">
              {BTN_STYLES.map(o => {
                const active = sel(o.v, liveForm.button_style || "pill");
                return (
                  <button type="button" key={o.v} onClick={() => setVal("button_style", o.v)}
                    className={`flex items-center gap-1 px-4 py-2 text-xs font-bold border-2 transition-all ${
                      active ? "border-orange-400 bg-orange-50 text-orange-600" : `border-slate-200 ${isDark ? "border-white/10 text-white/50" : "text-slate-500"} hover:border-slate-300`
                    }`}
                    style={{ borderRadius: o.radius, ...(active && isDark ? { background: "rgba(255,122,0,0.1)", borderColor: "#FF7A00", color: "#FF7A00" } : {}) }}>
                    {active && <Check className="w-3 h-3" />}{o.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── LAYOUT section: layout picker ── */}
      {section === "layout" && (
        <div className={rowCls}>
          <p className={`text-xs font-black uppercase tracking-widest mb-3 ${mutedText}`}>Profile Layout</p>
          <LayoutPicker
            value={liveForm.layout || "classic"}
            onChange={v => setVal("layout", v)}
            color={liveForm.cover_color}
            plan={getEffectiveProfilePlan(userPlan, profile)}
            isAdmin={user?.role === "admin"}
          />
        </div>
      )}

      {/* ── Save bar ── */}
      <div className="flex items-center gap-4 pt-2">
        <button type="button" onClick={handleSave} disabled={isPending}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black text-white transition-all hover:opacity-90 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #FF7A00, #FDBA21)" }}>
          {isPending ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</> : "Apply & Save"}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <Check className="w-3.5 h-3.5" /> Saved!
          </span>
        )}
      </div>
    </div>
  );
}