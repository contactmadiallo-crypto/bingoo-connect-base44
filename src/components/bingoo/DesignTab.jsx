import { publicProfileUrl } from '@/lib/publicProfileUrl';
import { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { layouts } from "./LayoutPicker";
import LayoutMiniPreview from "./LayoutMiniPreview";
import { Check, CheckCircle, Crown, ExternalLink, LayoutGrid, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useBingooTheme } from "@/hooks/useBingooTheme";
import { usePlan } from "@/hooks/usePlan";

const PREMIUM_THEME_IDS = new Set([
  "glass_3d", "luxury_gold", "executive_corp", "neon_tech",
  "modern_law", "premium_salon", "realtor_luxury",
  "animated_gradient", "video_bg", "parallax"
]);

function LayoutCard({ layout, isActive, saving, isDark, headText, subText, cardBase, profileUrl, onSelect, isPremiumTheme }) {
  return (
    <div className={`relative rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer ${cardBase} ${
      isActive
        ? isDark ? "ring-2 ring-orange-400 ring-offset-2 ring-offset-transparent" : "ring-2 ring-orange-500 ring-offset-2"
        : ""
    }`} onClick={() => onSelect(layout.id)}>
      {isPremiumTheme && !isActive && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-amber-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow">
          <Sparkles className="w-2.5 h-2.5" /> Professional
        </div>
      )}
      {isActive && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 text-white text-xs font-black px-2.5 py-1 rounded-full shadow" style={{ background: "#f97316" }}>
          <Check className="w-3 h-3" /> Active
        </div>
      )}
      {/* Real layout preview — same component as public profile */}
      <LayoutMiniPreview layoutId={layout.id} isSelected={isActive} previewHeight={220} />
      <div className={`p-3 border-t ${isDark ? "border-white/10" : "border-slate-100"}`}>
        <p className={`font-black text-sm ${headText}`}>{layout.name}</p>
        <p className={`text-[11px] mt-0.5 ${subText}`}>{layout.desc}</p>
      </div>
    </div>
  );
}

export default function DesignTab({ profile, user, onSaved }) {
  const { isDark } = useBingooTheme();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(null);

  const [pendingChanges, setPendingChanges] = useState({});

  const isAdmin = user?.role === 'admin';
  // isPro: derived from subscription plan (usePlan), NOT profile.plan — prevents free users
  // with legacy profile.plan values from unlocking premium layouts.
  const { plan: subPlan } = usePlan();
  const isPro = isAdmin || (subPlan && subPlan !== 'free');
  const currentLayout = profile?.layout || "classic";
  const color = pendingChanges.cover_color ?? profile?.cover_color ?? "#2563eb";
  const profileUrl = publicProfileUrl(profile?.username);

  const headText = isDark ? "text-white" : "text-slate-900";
  const subText = isDark ? "text-white/50" : "text-slate-500";
  const cardBase = isDark
    ? "bg-white/5 border border-white/10 hover:border-white/20"
    : "bg-white border border-slate-200 hover:border-slate-300";
  const hasChanges = Object.keys(pendingChanges).length > 0;

  const selectLayout = (layoutId) => {
    setPendingChanges(prev => ({ ...prev, layout: layoutId }));
  };

  const updateProfile = (data) => {
    setPendingChanges(prev => ({ ...prev, ...data }));
  };

  const handleSave = async () => {
    if (!profile || !hasChanges) return;
    setSaving("saving");

    try {
      // Build the update payload — keep layout and profile_layout in sync
      // ny_championship and lions_teranga use profile_layout; everything else uses layout
      const PROFILE_LAYOUT_IDS = new Set(["ny_championship", "lions_teranga"]);
      const update = { ...pendingChanges };
      if (update.layout) {
        if (PROFILE_LAYOUT_IDS.has(update.layout)) {
          update.profile_layout = update.layout;
        } else {
          // Reset profile_layout back to "default" when switching away from championship layouts
          if (PROFILE_LAYOUT_IDS.has(profile.profile_layout)) {
            update.profile_layout = "default";
          }
        }
      }

      await base44.entities.Profile.update(profile.id, update);
      // Invalidate all possible query key forms used across the app
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      queryClient.invalidateQueries({ queryKey: ["public-profile", profile.username] });
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      setPendingChanges({});
      setSaving(null);
      toast.success("Design saved!");
      onSaved?.();
    } catch (err) {
      console.error("Save failed:", err);
      setSaving(null);
      toast.error("Failed to save design. Your changes are preserved — try again.");
    }
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

  // Merged profile reflects pending changes for live preview
  const previewProfile = { ...profile, ...pendingChanges };

  return (
    <div className="space-y-8">
      {/* HIDDEN: LivePreviewPanel moved to backlog as Preview V2 — blocking editor on desktop */}
      {/* 
      <LivePreviewPanel
        profile={profile}
        pendingProfile={previewProfile}
        hasChanges={hasChanges}
        isDark={isDark}
        previewMode="design"
      />
      */}

      <div>
        <h2 className={`text-2xl font-black ${headText}`}>Profile Design</h2>
        <p className={`text-sm mt-1 ${subText}`}>
          Choose a layout for <span className="font-bold">/p/{profile.username}</span>. Changes preview instantly on the right →
        </p>
      </div>

      {/* ── Standard Layouts ── */}
      <div>
        <h3 className={`text-base font-black mb-4 ${headText}`}>Standard Layouts</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {layouts.filter(l => !PREMIUM_THEME_IDS.has(l.id) && l.id !== "ny_championship" && l.id !== "lions_teranga").map((layout) => (
            <LayoutCard key={layout.id} layout={layout} isActive={(pendingChanges.layout || currentLayout) === layout.id} saving={saving} isDark={isDark} headText={headText} subText={subText} cardBase={cardBase} profileUrl={profileUrl} onSelect={selectLayout} />
          ))}
        </div>
      </div>

      {/* ── Premium Themes ── */}
      <div>
        <div className={`flex items-center gap-3 mb-4 pb-3 border-b ${isDark ? "border-white/10" : "border-slate-200"}`}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className={`text-base font-black ${headText}`}>Premium Themes</h3>
          </div>
          <span className={`text-xs font-black px-2 py-0.5 rounded-full ${isDark ? "text-amber-300 bg-amber-500/20" : "text-amber-600 bg-amber-100"}`}>NEW</span>
          <p className={`text-xs ml-auto ${subText}`}>Exclusive animated & luxury designs</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {layouts.filter(l => PREMIUM_THEME_IDS.has(l.id)).map((layout) => (
            <LayoutCard key={layout.id} layout={layout} isActive={(pendingChanges.layout || currentLayout) === layout.id} saving={saving} isDark={isDark} headText={headText} subText={subText} cardBase={cardBase} profileUrl={profileUrl} onSelect={selectLayout} isPremiumTheme />
          ))}
        </div>
      </div>

      {/* ── Championship Layouts ── */}
      <div>
        <h3 className={`text-base font-black mb-4 ${headText}`}>🏆 Championship Edition</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {layouts.filter(l => l.id === "ny_championship" || l.id === "lions_teranga").map((layout) => (
            <LayoutCard key={layout.id} layout={layout} isActive={(pendingChanges.layout || currentLayout) === layout.id} saving={saving} isDark={isDark} headText={headText} subText={subText} cardBase={cardBase} profileUrl={profileUrl} onSelect={selectLayout} />
          ))}
        </div>
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
                    ? isDark ? "border-white shadow-lg" : "border-slate-900 shadow-lg"
                    : isDark ? "border-white/20 hover:border-white/50" : "border-slate-200 hover:border-slate-400"
                }`}
                style={{ background: c }}
                title={c}
              />
            ))}
            <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center ${isDark ? "border-white/20" : "border-slate-300"}`}>
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
                  previewProfile.bg_style === style
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
                  previewProfile.button_style === style
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

      {/* Sticky Save Bar */}
      {hasChanges && (
        <div className={`sticky bottom-4 z-20 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-2xl ${isDark ? "bg-slate-800 border border-white/15" : "bg-slate-900 border border-slate-700"}`}>
          <p className="text-white text-sm font-semibold">You have unsaved design changes</p>
          <Button
            onClick={handleSave}
            disabled={saving === "saving"}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold gap-2 flex-shrink-0"
          >
            {saving === "saving" ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> Saving…</>
            ) : (
              <><CheckCircle className="w-4 h-4" /> Save Changes</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}