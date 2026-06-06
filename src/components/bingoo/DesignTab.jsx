import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { layouts } from "./LayoutPicker";
import { Link } from "react-router-dom";
import { Eye, Check, Lock, Upload, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBingooTheme } from "@/hooks/useBingooTheme";

export default function DesignTab({ profile, user }) {
  const { isDark } = useBingooTheme();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(null);

  const isAdmin = user?.role === 'admin';
  const isPro = isAdmin || profile?.plan === "pro" || profile?.plan === "business";
  const currentLayout = profile?.layout || "classic";
  const color = profile?.cover_color || "#2563eb";
  const profileUrl = profile ? `${window.location.origin}/p/${profile.username}` : null;

  const headText = isDark ? "text-white" : "text-slate-900";
  const subText = isDark ? "text-white/50" : "text-slate-500";
  const cardBase = isDark
    ? "bg-white/5 border border-white/10 hover:border-white/20"
    : "bg-white border border-slate-200 hover:border-slate-300";

  const selectLayout = async (layoutId) => {
    if (!profile) return;
    setSaving(layoutId);
    await base44.entities.Profile.update(profile.id, { layout: layoutId });
    queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    setSaving(null);
  };

  const updateProfile = async (data) => {
    if (!profile) return;
    setSaving("updating");
    await base44.entities.Profile.update(profile.id, data);
    queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    setSaving(null);
  };

  const handleCoverPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving("cover");
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await updateProfile({ cover_photo: file_url });
    } catch (err) {
      console.error("Upload failed:", err);
      setSaving(null);
    }
  };

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className={`text-lg font-semibold ${subText}`}>Create a profile first to customize its design.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className={`text-2xl font-black ${headText}`}>Profile Design</h2>
        <p className={`text-sm mt-1 ${subText}`}>
          Choose a layout for <span className="font-bold">/p/{profile.username}</span>. Changes apply instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {layouts.map((layout) => {
          const locked = false;
          const isActive = currentLayout === layout.id;
          const isSaving = saving === layout.id;

          return (
            <div
              key={layout.id}
              className={`relative rounded-2xl overflow-hidden transition-all duration-200 ${cardBase} ${
                isActive
                  ? isDark
                    ? "ring-2 ring-blue-400 ring-offset-2 ring-offset-transparent"
                    : "ring-2 ring-blue-600 ring-offset-2"
                  : ""
              } ${locked ? "opacity-70" : ""}`}
            >
              {/* Preview thumbnail */}
              <div
                className="w-full aspect-[4/3] p-3 cursor-pointer"
                style={{ background: isDark ? "#0f1628" : "#f1f5f9" }}
                onClick={() => !locked && selectLayout(layout.id)}
              >
                <div className="w-full h-full">
                  {layout.preview(color)}
                </div>
              </div>

              {locked && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-amber-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow">
                  <Lock className="w-3 h-3" /> PRO
                </div>
              )}

              {isActive && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-blue-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow">
                  <Check className="w-3 h-3" /> Active
                </div>
              )}

              <div className={`p-4 border-t ${isDark ? "border-white/10" : "border-slate-100"}`}>
                <div className="mb-3">
                  <p className={`font-black text-base ${headText}`}>{layout.name}</p>
                  <p className={`text-xs mt-0.5 ${subText}`}>{layout.desc}</p>
                </div>
                <div className="flex gap-2">
                  {locked ? (
                    <Link to="/pricing" className="flex-1">
                      <Button size="sm" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold gap-1.5 text-xs">
                        <Lock className="w-3.5 h-3.5" /> Upgrade to Unlock
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        onClick={() => selectLayout(layout.id)}
                        disabled={isActive || !!saving}
                        className={`flex-1 font-bold text-xs gap-1.5 border-0 ${
                          isActive
                            ? isDark
                              ? "!bg-blue-500/20 !text-blue-300 !border !border-blue-500/40"
                              : "!bg-blue-50 !text-blue-600 !border !border-blue-200"
                            : "!bg-blue-600 hover:!bg-blue-700 !text-white"
                        }`}
                        variant="default"
                      >
                        {isSaving ? (
                          <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Applying
                          </span>
                        ) : isActive ? (
                          <><Check className="w-3.5 h-3.5" /> Current</>
                        ) : (
                          "Apply Layout"
                        )}
                      </Button>
                      {profileUrl && (
                        <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="ghost" className={`px-3 gap-1.5 text-xs font-semibold ${isDark ? "border border-white/15 text-white/60 hover:bg-white/10 hover:text-white" : "border border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </a>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Design Customization */}
      <div className="space-y-6">
        <div>
          <h3 className={`text-lg font-black mb-4 flex items-center gap-2 ${headText}`}>
            <Palette className="w-5 h-5" /> Design Options
          </h3>
        </div>

        {/* Cover Photo */}
        <div>
          <label className={`block text-sm font-bold mb-3 ${headText}`}>Cover Photo</label>
          <div className={`rounded-xl p-4 text-center cursor-pointer transition-all ${cardBase} hover:shadow-md`}>
            <label className="cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-5 h-5" />
                <div>
                  <p className={`font-semibold text-sm ${headText}`}>Upload Cover Image</p>
                  <p className={`text-xs mt-1 ${subText}`}>PNG, JPG up to 5MB</p>
                </div>
              </div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleCoverPhotoUpload} 
                disabled={saving === "cover"}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <label className={`block text-sm font-bold mb-3 ${headText}`}>Primary Color</label>
          <div className="flex gap-3 flex-wrap">
            {["#2563eb", "#dc2626", "#16a34a", "#9333ea", "#ea580c", "#0891b2", "#db2777", "#64748b"].map((c) => (
              <button
                key={c}
                onClick={() => updateProfile({ cover_color: c })}
                className={`w-12 h-12 rounded-xl border-2 transition-all ${
                  color === c 
                    ? `border-slate-900 shadow-lg shadow-[${c}]/40` 
                    : "border-slate-200 hover:border-slate-400"
                }`}
                style={{ background: c }}
                title={c}
              />
            ))}
            <div className="w-12 h-12 rounded-xl border-2 border-slate-300 flex items-center justify-center">
              <input
                type="color"
                value={color}
                onChange={(e) => updateProfile({ cover_color: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer"
                title="Custom color"
              />
            </div>
          </div>
        </div>

        {/* Background Style */}
        <div>
          <label className={`block text-sm font-bold mb-3 ${headText}`}>Background Style</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {["clean", "gradient", "mesh", "night", "blur", "animated"].map((style) => (
              <button
                key={style}
                onClick={() => updateProfile({ bg_style: style })}
                className={`p-3 rounded-lg font-semibold text-sm transition-all ${
                  profile.bg_style === style
                    ? isDark
                      ? "bg-blue-500/30 border-2 border-blue-400 text-blue-300"
                      : "bg-blue-100 border-2 border-blue-600 text-blue-700"
                    : isDark
                    ? "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                    : "bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Button Style */}
        <div>
          <label className={`block text-sm font-bold mb-3 ${headText}`}>Button Style</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {["pill", "rounded", "sharp", "outlined", "flat"].map((style) => (
              <button
                key={style}
                onClick={() => updateProfile({ button_style: style })}
                className={`p-3 rounded-lg font-semibold text-sm transition-all ${
                  profile.button_style === style
                    ? isDark
                      ? "bg-blue-500/30 border-2 border-blue-400 text-blue-300"
                      : "bg-blue-100 border-2 border-blue-600 text-blue-700"
                    : isDark
                    ? "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                    : "bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>


    </div>
  );
}