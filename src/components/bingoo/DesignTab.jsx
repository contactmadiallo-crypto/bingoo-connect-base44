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

  const selectedLayoutId = pendingChanges.layout || currentLayout;
  const [filter, setFilter] = useState("all");
  const visibleLayouts = useMemo(() => layouts.filter((layout) => {
    if (filter === "free") return !layout.pro;
    if (filter === "premium") return layout.pro && !["ny_championship", "lions_teranga"].includes(layout.id);
    if (filter === "edition") return ["ny_championship", "lions_teranga"].includes(layout.id);
    return true;
  }), [filter]);
  const selectedMeta = layouts.find(l => l.id === selectedLayoutId) || layouts[0];
  return (
    <div className="space-y-[18px] pb-24 max-w-[980px]">
      <div className="flex items-start justify-between gap-4 flex-wrap"><div><div className="flex items-center gap-2"><LayoutGrid className="w-[18px] h-[18px] text-orange-500" /><h2 className={`text-[17px] font-extrabold ${headText}`}>Profile Layouts</h2></div><p className={`text-[12px] mt-1 ${subText}`}>Choose the structure of your public profile. Design colors, links and buttons stay in Design.</p></div><a href={profileUrl} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] border text-[12px] font-bold ${isDark ? "border-white/10 text-white/70 bg-white/5" : "border-[#E5EAF2] text-slate-700 bg-white"}`}>View public profile <ExternalLink className="w-3.5 h-3.5" /></a></div>
      <div className={`rounded-[14px] border p-4 flex items-center gap-4 ${cardBase}`}><div className="w-[74px] h-[94px] rounded-[10px] overflow-hidden flex-shrink-0 border border-black/5"><LayoutMiniPreview layoutId={selectedLayoutId} isSelected previewHeight={94} /></div><div className="flex-1 min-w-0"><div className="flex items-center gap-2 flex-wrap"><p className={`text-[14px] font-black ${headText}`}>{selectedMeta?.name}</p><span className="text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full bg-orange-50 text-orange-600">Selected</span></div><p className={`text-[11px] mt-1 ${subText}`}>{selectedMeta?.desc}</p><p className={`text-[10px] mt-2 ${subText}`}>This same renderer is used on /p/{profile.username}.</p></div></div>
      <div className={`inline-flex p-1 rounded-[11px] border ${isDark ? "border-white/10 bg-white/5" : "border-[#E5EAF2] bg-[#F7F9FC]"}`}>{[["all","All"],["free","Standard"],["premium","Premium"],["edition","Editions"]].map(([id,label]) => <button key={id} type="button" onClick={() => setFilter(id)} className={`px-3.5 py-2 rounded-[8px] text-[11px] font-bold transition-all ${filter === id ? (isDark ? "bg-white/10 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm") : subText}`}>{label}</button>)}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[14px]">{visibleLayouts.map((layout) => { const active=selectedLayoutId===layout.id; const locked=layout.pro&&!isPro; return <button key={layout.id} type="button" disabled={locked} onClick={() => !locked && selectLayout(layout.id)} className={`relative text-left rounded-[15px] overflow-hidden border transition-all ${active ? "ring-2 ring-orange-500 border-orange-400" : (isDark ? "border-white/10 bg-white/5 hover:border-white/20" : "border-[#E5EAF2] bg-white hover:border-slate-300")} ${locked ? "opacity-80" : ""}`}><div className="relative"><LayoutMiniPreview layoutId={layout.id} isSelected={active} previewHeight={250} />{active&&<span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500 text-white text-[10px] font-black shadow"><Check className="w-3 h-3" /> Selected</span>}{locked&&<div className="absolute inset-0 bg-slate-950/35 backdrop-blur-[1px] flex items-center justify-center"><span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-amber-700 text-[10px] font-black shadow"><Crown className="w-3 h-3" /> Professional</span></div>}</div><div className="px-3.5 py-3"><div className="flex items-center justify-between gap-2"><p className={`text-[13px] font-black ${headText}`}>{layout.name}</p>{layout.pro&&<Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}</div><p className={`text-[10px] mt-1 ${subText}`}>{layout.desc}</p></div></button>; })}</div>
      {hasChanges && <div className={`sticky bottom-4 z-20 rounded-[14px] px-4 py-3 flex items-center justify-between gap-4 shadow-xl border ${isDark ? "bg-[#171a2d] border-white/10" : "bg-white border-[#E5EAF2]"}`}><div className="min-w-0"><p className={`text-[12px] font-black ${headText}`}>Apply {selectedMeta?.name}</p><p className={`text-[10px] mt-0.5 ${subText}`}>Updates the real public profile layout.</p></div><button type="button" onClick={handleSave} disabled={saving === "saving"} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] bg-orange-500 text-white text-[12px] font-black shadow-lg disabled:opacity-50">{saving === "saving" ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}{saving === "saving" ? "Applying…" : "Apply Layout"}</button></div>}
    </div>
  );
}