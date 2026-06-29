import React, { useState } from "react";
import { Check, Upload, Sparkles, Palette, Layout, User } from "lucide-react";
import { base44 } from "@/api/base44Client";
import LayoutPicker from "@/components/bingoo/LayoutPicker";
import { getEffectiveProfilePlan } from "@/lib/planPermissions";
import { AvatarRenderer, getAvatarRadius } from "@/components/bingoo/ProfileLayoutRenderer";


const COVER_COLORS = [
  "#2563eb","#0B2E6B","#1a4a9e","#7c3aed",
  "#db2777","#059669","#d97706","#dc2626",
  "#0891b2","#1e293b","#374151","#FF7A00"
];

const BG_COLORS = [
  // Whites & near-whites
  "#ffffff","#f8fafc","#f1f5f9","#faf7f2",
  // Pastels – cool
  "#e0f2fe","#dbeafe","#ede9fe","#f3e8ff",
  // Pastels – warm
  "#fce7f3","#fff1f2","#fff7ed","#fefce8",
  // Pastels – nature
  "#f0fdf4","#d1fae5","#f0fdfa","#ecfeff",
  // Warm neutrals
  "#faf5eb","#f5f0eb","#e8e4e0","#d4c5b0",
  // Mids
  "#94a3b8","#64748b","#475569","#374151",
  // Deep blues
  "#0f172a","#1e293b","#0B2E6B","#172554",
  // Rich darks
  "#0f0f0f","#0a0a0a","#1a1a2e","#1a0533",
  // Accent darks
  "#0d1b2a","#0d2137","#0f2b1e","#1f0a2e",
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

const AVATAR_SHAPES = [
  { v: "circle",   label: "Circle",   icon: "●" },
  { v: "rounded",  label: "Rounded",  icon: "▣" },
  { v: "squircle", label: "iOS Icon", icon: "⬟" },
  { v: "card",     label: "Card",     icon: "▬" },
];

const AVATAR_PLACEMENTS = [
  { v: "center_overlap", label: "Center Overlap", desc: "Avatar overlaps cover center" },
  { v: "lower_center",   label: "Lower Center",   desc: "Avatar sits lower" },
  { v: "right_overlap",  label: "Right Overlap",  desc: "Avatar floats right" },
  { v: "left_overlap",   label: "Left Overlap",   desc: "Avatar floats left" },
  { v: "floating_card",  label: "Floating Card",  desc: "Avatar inside content" },
];

const AVATAR_FOCAL = [
  { v: "center top",    label: "Face (top)" },
  { v: "center",        label: "Center" },
  { v: "center bottom", label: "Bottom" },
  { v: "left center",   label: "Left" },
  { v: "right center",  label: "Right" },
];

const SECTIONS = [
  { id: "theme",    label: "Theme",        icon: Sparkles },
  { id: "general",  label: "General",      icon: Palette },
  { id: "layout",   label: "Layout",       icon: Layout },
];

export default function DesignPanel({ liveForm, setVal, onSave, isPending, saveStatus, saveTime, saveError, isDark, userPlan, profile, user, lang, onLayoutChange }) {
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

  const handleBgImageUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setVal("bg_watermark_image", file_url);
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
            <p className={`text-xs font-black uppercase tracking-widest ${mutedText}`}>Background Color</p>
            <div className="flex gap-2 flex-wrap">
              {BG_COLORS.map(c => (
                <button type="button" key={c} onClick={() => setVal("theme_background_color", c)}
                  className="relative w-9 h-9 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center"
                  style={{
                    background: c,
                    borderColor: sel(c, liveForm.theme_background_color) ? "#FF7A00" : (c === "#ffffff" || c === "#f8fafc" ? "#e2e8f0" : "transparent"),
                    transform: sel(c, liveForm.theme_background_color) ? "scale(1.15)" : "scale(1)",
                    boxShadow: sel(c, liveForm.theme_background_color) ? `0 0 0 2px #FF7A00` : "none",
                  }}>
                  {sel(c, liveForm.theme_background_color) && <Check className="w-3.5 h-3.5" style={{ color: c === "#ffffff" || c === "#f8fafc" || c === "#f1f5f9" ? "#374151" : "white" }} />}
                </button>
              ))}
              <div className="w-9 h-9 rounded-full border-2 border-slate-300 flex items-center justify-center overflow-hidden">
                <input type="color" value={liveForm.theme_background_color || "#ffffff"} onChange={e => setVal("theme_background_color", e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0 outline-none" title="Custom background color" />
              </div>
              {liveForm.theme_background_color && (
                <button type="button" onClick={() => setVal("theme_background_color", "")}
                  className="px-2 py-1 rounded-full text-[10px] font-bold text-slate-500 border border-slate-200 hover:bg-slate-100">
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Background Watermark Image */}
          <div className={rowCls}>
            <p className={`text-xs font-black uppercase tracking-widest ${mutedText}`}>Background Image</p>
            <p className={`text-[10px] mb-2 ${mutedText}`}>Subtle watermark behind your profile content</p>
            {liveForm.bg_watermark_image && (
              <div className="relative w-full rounded-xl overflow-hidden mb-2" style={{ height: 80 }}>
                <img src={liveForm.bg_watermark_image} alt="BG" className="w-full h-full" style={{ objectFit: "cover", opacity: 0.5 }} />
                <button type="button" onClick={() => setVal("bg_watermark_image", "")}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-black shadow">×</button>
              </div>
            )}
            <label className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all text-sm font-semibold ${isDark ? "border-white/10 text-white/60 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              <Upload className="w-4 h-4 flex-shrink-0" />
              {uploading ? "Uploading…" : liveForm.bg_watermark_image ? "Change Image" : "Upload Background Image"}
              <input type="file" accept="image/*" className="hidden" onChange={handleBgImageUpload} disabled={uploading} />
            </label>
            {liveForm.bg_watermark_image && (
              <div className="mt-2 space-y-1">
                <p className={`text-[10px] font-bold ${mutedText}`}>Opacity</p>
                <input type="range" min="5" max="40" step="1"
                  value={liveForm.bg_watermark_opacity ?? 15}
                  onChange={e => setVal("bg_watermark_opacity", Number(e.target.value))}
                  className="w-full accent-orange-400" />
                <div className="flex justify-between text-[9px] text-slate-400">
                  <span>Subtle</span><span>{liveForm.bg_watermark_opacity ?? 15}%</span><span>Visible</span>
                </div>
              </div>
            )}
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
            {/* Large cover preview */}
            <div className={`w-full rounded-2xl overflow-hidden relative ${liveForm.cover_photo ? "" : (isDark ? "bg-white/5 border border-white/10" : "bg-slate-100 border border-slate-200")}`}
              style={{ height: 160 }}>
              {liveForm.cover_photo
                ? <img src={liveForm.cover_photo} alt="Cover" className="w-full h-full" style={{ objectFit: "cover", objectPosition: "center" }} />
                : <div className="w-full h-full flex flex-col items-center justify-center gap-2" style={{ background: `linear-gradient(135deg, ${liveForm.cover_color || "#2563eb"} 0%, ${liveForm.cover_color || "#2563eb"}99 100%)` }}>
                    <p className="text-xs font-bold text-white/60">No cover photo</p>
                    <p className="text-[10px] text-white/40">Using accent color</p>
                  </div>
              }
            </div>
            <div className="flex items-center gap-2 mt-2">
              <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all text-sm font-semibold ${isDark ? "border-white/10 text-white/60 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                <Upload className="w-4 h-4 flex-shrink-0" />
                {uploading ? "Uploading…" : liveForm.cover_photo ? "Change Cover" : "Upload Cover"}
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploading} />
              </label>
              {liveForm.cover_photo && (
                <button type="button" onClick={() => setVal("cover_photo", "")}
                  className="px-3 py-2.5 rounded-xl border text-xs font-bold text-red-400 border-red-200 hover:bg-red-50 transition-all">
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Avatar */}
          <div className={rowCls}>
            <p className={`text-xs font-black uppercase tracking-widest ${mutedText}`}>Profile Photo</p>
            <div className="flex items-center gap-4">
              {/* Large circular avatar preview */}
              <div className="flex-shrink-0 relative">
                {(() => {
                  const r = getAvatarRadius(liveForm.avatar_shape);
                  return (
                    <div style={{ borderRadius: `calc(${r} + 4px)`, border: "4px solid #fff", boxShadow: "0 4px 16px rgba(0,0,0,0.18)" }}>
                      <AvatarRenderer profile={{ ...liveForm, cover_color: liveForm.cover_color || "#2563eb" }} size={72} />
                    </div>
                  );
                })()}
                {liveForm.profile_photo && (
                  <button type="button" onClick={() => setVal("profile_photo", "")}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-black shadow">
                    ×
                  </button>
                )}
              </div>
              <div className="flex-1">
                <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer w-full transition-all text-sm font-semibold ${isDark ? "border-white/10 text-white/60 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                  <User className="w-4 h-4 flex-shrink-0" />
                  {uploading ? "Uploading…" : liveForm.profile_photo ? "Change Photo" : "Upload Photo"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
                </label>
                <p className={`text-[10px] mt-1.5 ${mutedText}`}>Square or portrait image recommended. Shape matches your "Avatar Shape" selection.</p>
              </div>
            </div>
          </div>

          {/* Avatar Shape */}
          <div className={rowCls}>
            <p className={`text-xs font-black uppercase tracking-widest ${mutedText}`}>Avatar Shape</p>
            <div className="flex gap-2 flex-wrap">
              {AVATAR_SHAPES.map(o => {
                const active = sel(o.v, liveForm.avatar_shape || "circle");
                return (
                  <button type="button" key={o.v} onClick={() => setVal("avatar_shape", o.v)}
                    className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${active ? "border-orange-400 bg-orange-50 text-orange-600" : `border-slate-200 ${isDark ? "border-white/10 text-white/60" : "text-slate-500"} hover:border-slate-300`}`}
                    style={active && isDark ? { borderColor: "#FF7A00", background: "rgba(255,122,0,0.1)", color: "#FF7A00" } : {}}>
                    <span className="text-lg leading-none">{o.icon}</span>
                    <span>{o.label}</span>
                    {active && <Check className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Avatar Focal Point */}
          <div className={rowCls}>
            <p className={`text-xs font-black uppercase tracking-widest ${mutedText}`}>Photo Focal Point</p>
            <p className={`text-[10px] mb-2 ${mutedText}`}>Where to crop when zooming in</p>
            <div className="flex gap-2 flex-wrap">
              {AVATAR_FOCAL.map(o => {
                const active = sel(o.v, liveForm.avatar_position || "center top");
                return (
                  <button type="button" key={o.v} onClick={() => setVal("avatar_position", o.v)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border-2 text-xs font-bold transition-all ${active ? "border-orange-400 bg-orange-50 text-orange-600" : `border-slate-200 ${isDark ? "border-white/10 text-white/50" : "text-slate-500"}`}`}
                    style={active && isDark ? { borderColor: "#FF7A00", background: "rgba(255,122,0,0.1)", color: "#FF7A00" } : {}}>
                    {active && <Check className="w-3 h-3" />}{o.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Avatar Placement */}
          <div className={rowCls}>
            <p className={`text-xs font-black uppercase tracking-widest ${mutedText}`}>Profile Photo Placement</p>
            <p className={`text-[10px] mb-2 ${mutedText}`}>How avatar overlaps the cover</p>
            <div className="grid grid-cols-1 gap-2">
              {AVATAR_PLACEMENTS.map(o => {
                const active = sel(o.v, liveForm.avatar_placement || "center_overlap");
                return (
                  <button type="button" key={o.v} onClick={() => setVal("avatar_placement", o.v)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-left transition-all ${active ? "border-orange-400 bg-orange-50" : `border-slate-200 ${isDark ? "border-white/10 hover:border-white/20" : "hover:border-slate-300"}`}`}
                    style={active && isDark ? { borderColor: "#FF7A00", background: "rgba(255,122,0,0.08)" } : {}}>
                    <div className="flex-1">
                      <p className={`text-xs font-bold ${active ? "text-orange-600" : headText}`}>{o.label}</p>
                      <p className={`text-[10px] ${mutedText}`}>{o.desc}</p>
                    </div>
                    {active && <Check className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
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
            onChange={v => {
              setVal("layout", v);
              // Auto-save layout selection after short debounce
              setTimeout(() => onLayoutChange?.(v), 100);
            }}
            color={liveForm.cover_color}
            plan={getEffectiveProfilePlan(userPlan, profile)}
            isAdmin={user?.role === "admin"}
            profile={liveForm}
          />
        </div>
      )}

      {/* ── Save bar — mobile safe area ── */}
      <div className="flex items-center gap-4 pt-4 pb-safe" style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}>
        <button type="button" onClick={handleSave} disabled={isPending}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black text-white transition-all hover:opacity-90 disabled:opacity-60 flex-shrink-0"
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