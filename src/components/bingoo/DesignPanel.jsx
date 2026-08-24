import React, { useState } from "react";
import { Check, Upload, Palette, User, Eye, RotateCcw, Save, Image as ImageIcon, MousePointer2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
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
  { v: "pill",     label: "iOS Filled",  radius: 14 },
  { v: "rounded",  label: "iOS Light",   radius: 14 },
  { v: "outlined", label: "iOS Outline", radius: 14 },
  { v: "flat",     label: "iOS Ghost",   radius: 14 },
  { v: "sharp",    label: "Text",        radius: 10 },
];

const LINK_DISPLAY_STYLES = [
  { v: "list", label: "List", glyph: "☰", desc: "Full-width iOS rows" },
  { v: "icons", label: "Icons", glyph: "▦", desc: "Compact icon grid" },
];
const LINK_ROW_STYLES = [
  { v: "ios", label: "iOS" }, { v: "pill", label: "Pill" }, { v: "outline", label: "Outline" },
];
const LINK_ICON_SHAPES = [
  { v: "rounded", label: "Rounded" }, { v: "square", label: "Square" }, { v: "circle", label: "Circle" },
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
  { id: "theme", label: "Theme", icon: Palette },
  { id: "media", label: "Profile", icon: ImageIcon },
  { id: "buttons", label: "Buttons", icon: MousePointer2 },
];

const FONT_STYLES = [
  { v: "modern", label: "Modern", family: "'Plus Jakarta Sans', 'Inter', sans-serif" },
  { v: "clean", label: "Clean", family: "'Inter', sans-serif" },
  { v: "classic", label: "Classic", family: "Georgia, serif" },
];

const BRAND = { navy: "#0b2149", orange: "#f97316", canvas: "#F7F9FC", border: "#E5EAF2" };

export default function DesignPanel({ liveForm, setVal, onSave, isPending, saveStatus, saveTime, saveError, isDark, userPlan, profile, user, lang, onLayoutChange, onPreview, onReset, hasChanges }) {
  const [section, setSection] = useState("theme");
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  const headText  = isDark ? "text-white"    : "text-slate-900";
  const mutedText = isDark ? "text-white/40" : "text-slate-400";
  const bg        = isDark ? "bg-[#13162a]"  : "bg-white";
  const border    = isDark ? "border-white/8" : "border-slate-200";
  const rowCls    = `rounded-[14px] border ${border} ${bg} p-[18px] space-y-3`;

  const handleSave = async () => {
    try {
      await onSave();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
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
    <div className="space-y-[18px] max-w-[560px]">
      <div className={`rounded-[14px] border ${border} ${bg} px-[18px] py-[14px] flex items-center gap-3 sticky top-0 z-20 shadow-sm`}>
        <div className="flex-1 min-w-0">
          <p className={`text-[16px] font-extrabold ${headText}`}>Design</p>
          <p className={`text-[12px] mt-0.5 ${mutedText}`}>Style the same profile your visitors see at /p/{profile?.username || "your-handle"}.</p>
        </div>
        <button type="button" onClick={onPreview}
          className={`xl:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold ${isDark ? "border-white/10 text-white/70" : "border-slate-200 text-slate-600"}`}>
          <Eye className="w-3.5 h-3.5" /> Preview
        </button>
        <button type="button" onClick={onReset} disabled={!hasChanges || isPending}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold disabled:opacity-40 ${isDark ? "border-white/10 text-white/70" : "border-slate-200 text-slate-600"}`}>
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
        <button type="button" onClick={handleSave} disabled={!hasChanges || isPending}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white disabled:opacity-50"
          style={{ background: "#f97316" }}>
          <Save className={`w-3.5 h-3.5 ${isPending ? "animate-pulse" : ""}`} /> {isPending ? "Saving…" : "Save"}
        </button>
      </div>

      {/* ── Horizontal section tabs (mobile + desktop) ── */}
      <div className={`flex gap-1 p-1 rounded-[12px] ${isDark ? "bg-white/5" : "bg-[#F7F9FC] border border-[#E5EAF2]"}`}>
        {SECTIONS.map(s => (
          <button key={s.id} type="button" onClick={() => setSection(s.id)} aria-label={`${s.label} section`}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none ${
              section === s.id
                ? "text-white shadow-sm"
                : isDark ? "text-white/40 hover:text-white/70" : "text-slate-500 hover:text-slate-700"
            }`}
            style={section === s.id ? { background: "#0b2149" } : {}}>
            <s.icon className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{s.label}</span>
          </button>
        ))}
      </div>

      {/* ── THEME section: accent color + bg style ── */}
      {section === "theme" && (
        <div className="space-y-4">
          <div className={rowCls}>
            <div>
              <p className={`text-xs font-black ${headText}`}>Profile color</p>
              <p className={`text-[11px] mt-0.5 ${mutedText}`}>Used for your cover, accents and public-profile actions.</p>
            </div>
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
            <div>
              <p className={`text-xs font-black ${headText}`}>Typography</p>
              <p className={`text-[11px] mt-0.5 ${mutedText}`}>Choose the type style used by the public profile.</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {FONT_STYLES.map(o => {
                const active = sel(o.v, liveForm.font_style || "modern");
                return (
                  <button type="button" key={o.v} onClick={() => setVal("font_style", o.v)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${active ? "border-orange-400 bg-orange-50" : `border-slate-200 ${isDark ? "border-white/10" : ""}`}`}
                    style={{ fontFamily: o.family, ...(active && isDark ? { borderColor: "#f97316", background: "rgba(249,115,22,0.08)" } : {}) }}>
                    <span className={`block text-lg font-bold ${active ? "text-orange-600" : headText}`}>Aa</span>
                    <span className={`block text-[11px] mt-1 ${mutedText}`}>{o.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={rowCls}>
            <div>
              <p className={`text-xs font-black ${headText}`}>Background</p>
              <p className={`text-[11px] mt-0.5 ${mutedText}`}>Choose the atmosphere behind your public profile.</p>
            </div>
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

      {/* ── PHOTOS section: cover + avatar presentation ── */}
      {section === "media" && (
        <div className="space-y-4">
          {/* Cover Photo */}
          <div className={rowCls}>
            <div>
              <p className={`text-xs font-black ${headText}`}>Cover photo</p>
              <p className={`text-[11px] mt-0.5 ${mutedText}`}>Optional image displayed at the top of your public profile.</p>
            </div>
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

        </div>
      )}

      {/* ── BUTTONS section ── */}
      {section === "buttons" && (
        <div className="space-y-4">
          <div className={rowCls}>
            <div>
              <p className={`text-xs font-black ${headText}`}>Link display style</p>
              <p className={`text-[11px] mt-0.5 ${mutedText}`}>Figma architecture for how links appear on the public profile.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {LINK_DISPLAY_STYLES.map(o => {
                const active = sel(o.v, liveForm.link_display_style || "icons");
                return <button type="button" key={o.v} onClick={() => setVal("link_display_style", o.v)}
                  className={`min-h-[112px] rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${active ? "border-blue-500 bg-blue-50" : isDark ? "border-white/10" : "border-slate-200"}`}>
                  <span className={`text-3xl ${active ? "text-blue-500" : mutedText}`}>{o.glyph}</span>
                  <span className={`text-xs font-black ${active ? "text-blue-600" : headText}`}>{o.label}</span>
                  <span className={`text-[10px] ${mutedText}`}>{o.desc}</span>
                </button>;
              })}
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <p className={`text-[10px] font-black uppercase tracking-wider mb-2 ${mutedText}`}>Icon shape</p>
                <div className="flex rounded-xl overflow-hidden border border-slate-200">
                  {LINK_ICON_SHAPES.map(o => <button type="button" key={o.v} onClick={() => setVal("link_icon_shape", o.v)} className={`flex-1 px-2 py-2 text-[10px] font-bold ${sel(o.v, liveForm.link_icon_shape || "rounded") ? "bg-blue-50 text-blue-600" : headText}`}>{o.label}</button>)}
                </div>
              </div>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-wider mb-2 ${mutedText}`}>Row style</p>
                <div className="flex rounded-xl overflow-hidden border border-slate-200">
                  {LINK_ROW_STYLES.map(o => <button type="button" key={o.v} onClick={() => setVal("link_row_style", o.v)} className={`flex-1 px-2 py-2 text-[10px] font-bold ${sel(o.v, liveForm.link_row_style || "ios") ? "bg-blue-50 text-blue-600" : headText}`}>{o.label}</button>)}
                </div>
              </div>
            </div>
          </div>

          <div className={rowCls}>
            <div>
              <p className={`text-xs font-black ${headText}`}>Save contact style</p>
              <p className={`text-[11px] mt-0.5 ${mutedText}`}>Use the iOS-style action treatment from the Figma design.</p>
            </div>
            <div className="mb-4">
              <p className={`text-[11px] font-bold mb-2 ${mutedText}`}>Button color</p>
              <div className="flex items-center gap-3">
                <input type="color" value={liveForm.button_color || liveForm.cover_color || "#0b2149"}
                  onChange={e => setVal("button_color", e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0" />
                <button type="button" onClick={() => setVal("button_color", liveForm.cover_color || "#0b2149")}
                  className={`px-3 py-2 rounded-lg border text-xs font-bold ${isDark ? "border-white/10 text-white/60" : "border-slate-200 text-slate-600"}`}>Use profile color</button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {BTN_STYLES.map(o => {
                const active = sel(o.v, liveForm.button_style || "pill");
                return (
                  <button type="button" key={o.v} onClick={() => setVal("button_style", o.v)}
                    className={`flex items-center gap-3 p-3 border-2 transition-all text-left ${active ? "border-orange-400 bg-orange-50" : `border-slate-200 ${isDark ? "border-white/10" : ""}`}`}
                    style={{ borderRadius: 12, ...(active && isDark ? { background: "rgba(249,115,22,0.08)", borderColor: "#f97316" } : {}) }}>
                    <span className="flex-1 px-4 py-2 text-center text-xs font-bold"
                      style={{ borderRadius: o.radius, background: o.v === "outlined" ? "transparent" : (liveForm.button_color || liveForm.cover_color || "#0b2149"), color: o.v === "outlined" ? (liveForm.button_color || liveForm.cover_color || "#0b2149") : "#fff", border: o.v === "outlined" ? `2px solid ${liveForm.button_color || liveForm.cover_color || "#0b2149"}` : "2px solid transparent" }}>
                      {o.label}
                    </span>
                    {active && <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Save bar — mobile safe area ── */}
      <div className="flex items-center gap-4 pt-4 pb-safe" style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}>
        <button type="button" onClick={handleSave} disabled={isPending} aria-label="Save design changes"
          className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black text-white transition-all hover:opacity-90 disabled:opacity-60 flex-shrink-0 focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:outline-none"
          style={{ background: "linear-gradient(135deg, #f97316, #FDBA21)" }}>
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