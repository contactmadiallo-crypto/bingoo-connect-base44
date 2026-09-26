import { publicProfileUrl } from '@/lib/publicProfileUrl';
import { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { layouts } from "./LayoutPicker";
import LayoutMiniPreview from "./LayoutMiniPreview";
import { Check, CheckCircle, ExternalLink, LayoutGrid, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useBingooTheme } from "@/hooks/useBingooTheme";
import { usePlan } from "@/hooks/usePlan";
import { useI18n } from "@/lib/I18nContext";
import { t } from "@/lib/i18n";

const PREMIUM_THEME_IDS = new Set([
  "glass_3d", "luxury_gold", "executive_corp", "neon_tech",
  "modern_law", "premium_salon", "realtor_luxury",
  "animated_gradient", "video_bg", "parallax"
]);

export default function DesignTab({ profile, user, onSaved }) {
  const { language } = useI18n();
  const { isDark } = useBingooTheme();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(null);

  const [pendingChanges, setPendingChanges] = useState({});
  const [layoutFilter, setLayoutFilter] = useState("all");

  const isAdmin = user?.role === 'admin';
  // isPro: derived from subscription plan (usePlan), NOT profile.plan — prevents free users
  // with legacy profile.plan values from unlocking premium layouts.
  const { plan: subPlan } = usePlan();
  const isPro = isAdmin || (subPlan && subPlan !== 'free');
  const currentLayout = profile?.layout || "classic";
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
      toast.success(t("layouts_saved",language));
      onSaved?.();
    } catch (err) {
      console.error("Save failed:", err);
      setSaving(null);
      toast.error(t("layouts_save_failed",language));
    }
  };

  const selectedLayout = pendingChanges.layout || currentLayout;
  const visibleLayouts = useMemo(() => {
    return layouts.filter((layout) => {
      if (layoutFilter === "standard") return !layout.pro;
      if (layoutFilter === "premium") return layout.pro && !["ny_championship", "lions_teranga"].includes(layout.id);
      if (layoutFilter === "editions") return ["ny_championship", "lions_teranga"].includes(layout.id);
      return true;
    });
  }, [layoutFilter]);

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className={`text-lg font-semibold ${subText}`}>{t("layouts_profile_first",language)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-24 max-w-[1040px]">
      {/* Existing Profile Layouts system, presented with the Figma editor hierarchy */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-[18px] h-[18px] text-orange-500" />
            <h2 className={`text-[18px] font-black ${headText}`}>{t("layouts_profile_layouts",language)}</h2>
          </div>
          <p className={`text-[12px] mt-1 ${subText}`}>{t("layouts_intro_prefix",language)} <span className="font-bold">/p/{profile.username}</span>. {t("layouts_intro_suffix",language)}</p>
        </div>
        <a href={profileUrl} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] border text-[11px] font-bold ${isDark ? "border-white/10 bg-white/5 text-white/70" : "border-[#E5EAF2] bg-white text-slate-700"}`}>
          {t("layouts_view_public",language)} <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className={`rounded-[14px] border px-4 py-3.5 flex items-center gap-4 ${cardBase}`}>
        <div className="w-[68px] h-[86px] rounded-[9px] overflow-hidden flex-shrink-0 border border-black/5">
          <LayoutMiniPreview layoutId={selectedLayout} isSelected previewHeight={86} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-[10px] uppercase tracking-[.12em] font-black ${subText}`}>{t("layouts_current",language)}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <p className={`text-[14px] font-black ${headText}`}>{layouts.find(l => l.id === selectedLayout)?.name || t("layouts_classic",language)}</p>
            {pendingChanges.layout && <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-orange-50 text-orange-600">{t("layouts_not_applied",language)}</span>}
          </div>
          <p className={`text-[10px] mt-1 ${subText}`}>{t("layouts_preview_copy",language)}</p>
        </div>
      </div>

      <div className={`inline-flex p-1 rounded-[11px] border max-w-full overflow-x-auto ${isDark ? "border-white/10 bg-white/5" : "border-[#E5EAF2] bg-[#F1F5F9]"}`}>
        {[["all","layouts_all"],["standard","layouts_standard"],["premium","layouts_premium"],["editions","layouts_editions"]].map(([id,labelKey]) => (
          <button type="button" key={id} onClick={() => setLayoutFilter(id)} className={`px-4 py-2 rounded-[8px] text-[11px] font-bold whitespace-nowrap transition-all ${layoutFilter === id ? (isDark ? "bg-white/10 text-white shadow-sm" : "bg-white text-[#0F172A] shadow-sm") : subText}`}>{t(labelKey,language)}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleLayouts.map((layout) => {
          const active = selectedLayout === layout.id;
          const premium = PREMIUM_THEME_IDS.has(layout.id);
          const locked = premium && !isPro;
          return (
            <div key={layout.id} className={`relative rounded-[14px] overflow-hidden border transition-all ${active ? "ring-2 ring-orange-500 border-orange-400" : (isDark ? "bg-white/5 border-white/10 hover:border-white/20" : "bg-white border-[#E5EAF2] hover:border-slate-300")}`}>
              <button type="button" disabled={locked} onClick={() => !locked && selectLayout(layout.id)} className="w-full text-left disabled:cursor-not-allowed">
                <div className="relative">
                  <LayoutMiniPreview layoutId={layout.id} isSelected={active} previewHeight={230} />
                  {active && <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500 text-white text-[10px] font-black shadow"><Check className="w-3 h-3" /> {t("layouts_selected",language)}</span>}
                  {locked && <div className="absolute inset-0 z-10 bg-slate-950/30 backdrop-blur-[1px] flex items-center justify-center"><span className="px-3 py-1.5 rounded-full bg-white text-amber-700 text-[10px] font-black shadow">{t("layouts_professional",language)}</span></div>}
                </div>
                <div className="px-3.5 py-3">
                  <div className="flex items-center justify-between gap-2"><p className={`text-[13px] font-black ${headText}`}>{layout.name}</p>{premium && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}</div>
                  <p className={`text-[10px] mt-1 ${subText}`}>{layout.desc}</p>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {hasChanges && (
        <div className={`sticky bottom-4 z-20 rounded-[14px] px-4 py-3 flex items-center justify-between gap-4 shadow-xl border ${isDark ? "bg-[#171a2d] border-white/10" : "bg-white border-[#E5EAF2]"}`}>
          <div><p className={`text-[12px] font-black ${headText}`}>{t("layouts_apply_title",language)}</p><p className={`text-[10px] mt-0.5 ${subText}`}>{t("layouts_apply_copy",language)}</p></div>
          <Button onClick={handleSave} disabled={saving === "saving"} className="bg-orange-500 hover:bg-orange-600 text-white font-black gap-2 rounded-[10px] px-4">
            {saving === "saving" ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> {t("layouts_applying",language)}</> : <><CheckCircle className="w-4 h-4" /> {t("layouts_apply",language)}</>}
          </Button>
        </div>
      )}
    </div>
  );
}