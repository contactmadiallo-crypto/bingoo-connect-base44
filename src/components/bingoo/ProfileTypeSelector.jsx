import React from "react";
import { Check, Lock, UserRound, Clapperboard, Camera, Sparkles, Building2 } from "lucide-react";
import {
  PROFILE_CATEGORIES,
  canUseProfessionalCategories,
  canUseBusinessCategory,
  resolveProfileCategory,
} from "@/lib/profileCategoryConfig";

const ICONS = {
  personal: UserRound,
  content_creator: Clapperboard,
  photographer: Camera,
  model: Sparkles,
  business: Building2,
};

function isCategoryUnlocked(categoryId, plan) {
  if (categoryId === "personal") return true;
  if (categoryId === "business") return canUseBusinessCategory(plan);
  return canUseProfessionalCategories(plan);
}

export default function ProfileTypeSelector({
  profile,
  plan = "free",
  isDark = false,
  onChange,
}) {
  const selected = resolveProfileCategory(profile);
  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/45" : "text-slate-500";

  return (
    <div className="space-y-4">
      <div>
        <h3 className={`text-sm font-black ${headText}`}>Profile Type</h3>
        <p className={`text-xs mt-1 ${mutedText}`}>
          Choose what this profile represents. Your subscription controls which types are available.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PROFILE_CATEGORIES.map((category) => {
          const unlocked = isCategoryUnlocked(category.id, plan);
          const active = selected === category.id;
          const Icon = ICONS[category.id] || UserRound;

          return (
            <button
              key={category.id}
              type="button"
              disabled={!unlocked}
              onClick={() => unlocked && onChange?.(category)}
              className={`relative text-left rounded-2xl border p-4 transition-all ${
                active
                  ? "border-orange-500 bg-orange-50 ring-2 ring-orange-500/15"
                  : unlocked
                    ? isDark
                      ? "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    : isDark
                      ? "border-white/5 bg-white/[0.02] opacity-45 cursor-not-allowed"
                      : "border-slate-200 bg-slate-50 opacity-55 cursor-not-allowed"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  active
                    ? "bg-orange-100 text-orange-600"
                    : isDark
                      ? "bg-white/8 text-white/60"
                      : "bg-slate-100 text-slate-600"
                }`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-bold ${active ? "text-orange-600" : headText}`}>
                      {category.label}
                    </p>
                    {active ? (
                      <span className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                    ) : !unlocked ? (
                      <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    ) : null}
                  </div>

                  <p className={`text-xs leading-5 mt-1 ${active ? "text-orange-700/70" : mutedText}`}>
                    {category.description}
                  </p>

                  {category.ctaLabel && (
                    <div className={`mt-3 pt-3 border-t text-[11px] font-semibold ${
                      active
                        ? "border-orange-200 text-orange-600"
                        : isDark
                          ? "border-white/8 text-white/35"
                          : "border-slate-100 text-slate-400"
                    }`}>
                      Public action: {category.ctaLabel}
                    </div>
                  )}

                  {!unlocked && (
                    <div className="mt-2 text-[11px] font-bold text-slate-400">
                      {category.id === "business" ? "Business plan required" : "Professional plan required"}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
