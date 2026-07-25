import React, { useState } from "react";
import { Check, Upload, Sparkles, Palette, Layout, User, Eye, RotateCcw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import LayoutPicker from "@/components/bingoo/LayoutPicker";
import { AvatarRenderer, getAvatarRadius } from "@/components/bingoo/ProfileLayoutRenderer";


const COVER_COLORS = [
  "#2563eb","#0b2149","#13284f","#7c3aed",
  "#db2777","#059669","#d97706","#dc2626",
  "#0891b2","#1e293b","#374151","#f97316"
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

export default function DesignPanel({
  liveForm,
  setVal,
  onSave,
  isPending,
  saveStatus,
  saveTime,
  saveError,
  isDark,
  userPlan,
  profile,
  user,
  lang,
  onLayoutChange,
  onPreview,
  onReset,
  hasChanges,
}) {
  const [section, setSection] = useState("theme");
  const [uploading, setUploading] = useState(false);

  const headText  = isDark ? "text-white"    : "text-slate-900";
  const mutedText = isDark ? "text-white/40" : "text-slate-400";
  const bg        = isDark ? "bg-[#13162a]"  : "bg-white";
  const border    = isDark ? "border-white/8" : "border-slate-200";
  const rowCls    = `rounded-2xl border ${border} ${bg} p-4 space-y-3`;

  const handleSave = async () => {
    try {
      await onSave();
    } catch (err) {
      toast.error("Failed to save. Please try again.");
    }
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
      <div className={`rounded-3xl border ${border} ${bg} p-5 sm:p-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black tracking-[0.18em] uppercase text-orange-500">Profile Design Studio</span>
              <span className={`w-2 h-2 rounded-full ${hasChanges ? "bg-amber-400" : "bg-emerald-500"}`} />
              <span className={`text-[10px] font-bold ${mutedText}`}>{hasChanges ? "Unsaved changes" : "All changes saved"}</span>
            </div>
            <h2 className={`text-xl sm:text-2xl font-black ${headText}`}>Shape your public profile</h2>
            <p className={`text-xs sm:text-sm mt-1 ${mutedText}`}>Choose a layout, tune the visual system, and preview every change before publishing.</p>
          </div>
          <button type="button" onClick={onPreview}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-black transition-all ${isDark ? "border-white/10 text-white/70 hover:bg-white/5" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
            <Eye className="w-4 h-4" /> Preview
          </button>
        </div>
      </div>

      {/* ── Horizontal section tabs (mobile + desktop) ── */
      <div className={`flex gap-1 p-1 rounded-2xl ${isDark ? "bg-white/5" : "bg-slate-100"}`}>
        <button type="button" onClick={() => setSection("theme")} aria-label="Theme section"
          className={"flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs font-bold " + (section === "theme" ? "text-white shadow-sm" : mutedText)}
          style={section === "theme" ? { background: "#0b2149" } : {}}><Sparkles className="w-3.5 h-3.5" />Theme</button>
        <button type="button" onClick={() => setSection("general")} aria-label="General section"
          className={"flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs font-bold " + (section === "general" ? "text-white shadow-sm" : mutedText)}
          style={section === "general" ? { background: "#0b2149" } : {}}><Palette className="w-3.5 h-3.5" />General</button>
        <button type="button" onClick={() => setSection("layout")} aria-label="Layout section"
          className={"flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs font-bold " + (section === "layout" ? "text-white shadow-sm" : mutedText)}
          style={section === "layout" ? { background: "#0b2149" } : {}}><Layout className="w-3.5 h-3.5" />Layout</button>
      </div>

      {/* ── THEME section: accent color + bg style ── */}
      {section === "theme" && (
        <div className="space-y-4">
          <div className={rowCls}>
            <p className={`text-xs font-black uppercase tracking-widest ${mutedText}`}>Accent Color</p>
            <div className="flex gap-2 flex-wrap">
              {COVER_COLORS.map(c => (
                <button type="button" key={c} onClick={() => setVal("cover_color", c)} aria-label={c + ' color'}
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
                    style={active && isDark ? { borderColor: "#f97316", background: "rgba(249,115,22,0.08)" } : {}}>
                    <div className="flex-1">
                      <p className={`text-xs font-bold ${active ? "text-orange-600" : headText}`}>{o.label}</p>
                      <p className={`text-xs ${mutedText}`}>{o.desc}</p>
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
                    <p className="text-xs text-white/40">Using accent color</p>
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
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-black shadow">
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
                <p className={`text-xs mt-1.5 ${mutedText}`}>Square or portrait image recommended. Shape matches your "Avatar Shape" selection.</p>
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
                    style={active && isDark ? { borderColor: "#f97316", background: "rgba(249,115,22,0.1)", color: "#f97316" } : {}}>
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
            <p className={`text-xs mb-2 ${mutedText}`}>Where to crop when zooming in</p>
            <div className="flex gap-2 flex-wrap">
              {AVATAR_FOCAL.map(o => {
                const active = sel(o.v, liveForm.avatar_position || "center top");
                return (
                  <button type="button" key={o.v} onClick={() => setVal("avatar_position", o.v)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border-2 text-xs font-bold transition-all ${active ? "border-orange-400 bg-orange-50 text-orange-600" : `border-slate-200 ${isDark ? "border-white/10 text-white/50" : "text-slate-500"}`}`}
                    style={active && isDark ? { borderColor: "#f97316", background: "rgba(249,115,22,0.1)", color: "#f97316" } : {}}>
                    {active && <Check className="w-3 h-3" />}{o.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Avatar Placement */}
          <div className={rowCls}>
            <p className={`text-xs font-black uppercase tracking-widest ${mutedText}`}>Profile Photo Placement</p>
            <p className={`text-xs mb-2 ${mutedText}`}>How avatar overlaps the cover</p>
            <div className="grid grid-cols-1 gap-2">
              {AVATAR_PLACEMENTS.map(o => {
                const active = sel(o.v, liveForm.avatar_placement || "center_overlap");
                return (
                  <button type="button" key={o.v} onClick={() => setVal("avatar_placement", o.v)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-left transition-all ${active ? "border-orange-400 bg-orange-50" : `border-slate-200 ${isDark ? "border-white/10 hover:border-white/20" : "hover:border-slate-300"}`}`}
                    style={active && isDark ? { borderColor: "#f97316", background: "rgba(249,115,22,0.08)" } : {}}>
                    <div className="flex-1">
                      <p className={`text-xs font-bold ${active ? "text-orange-600" : headText}`}>{o.label}</p>
                      <p className={`text-xs ${mutedText}`}>{o.desc}</p>
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
                    style={{ borderRadius: o.radius, ...(active && isDark ? { background: "rgba(249,115,22,0.1)", borderColor: "#f97316", color: "#f97316" } : {}) }}>
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
            plan={userPlan || "free"}
            isAdmin={user?.role === "admin"}
            profile={liveForm}
          />
        </div>
      )}

      {/* ── Save bar — mobile safe area ── */}
      <div className={`sticky bottom-0 z-20 flex items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl border ${border} ${bg}`}
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))", boxShadow: "0 -10px 30px rgba(15,23,42,0.08)" }}>
        <button type="button" onClick={onReset} disabled={!hasChanges || isPending}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-black border transition-all disabled:opacity-40 ${isDark ? "border-white/10 text-white/60 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
        <div className="flex items-center gap-3">
          {saveStatus === "success" && (
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-600">
              <Check className="w-3.5 h-3.5" /> Saved {saveTime}
            </span>
          )}
          {saveStatus === "error" && <span className="hidden sm:block text-xs font-bold text-red-500">{saveError || "Save failed"}</span>}
          <button type="button" onClick={handleSave} disabled={isPending} aria-label="Save design changes"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black text-white transition-all hover:opacity-90 disabled:opacity-60 flex-shrink-0 focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:outline-none"
            style={{ background: "linear-gradient(135deg, #f97316, #FDBA21)" }}>
            {isPending ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</> : "Apply & Save"}
          </button>
        </div>
      </div>
    </div>
  );
}