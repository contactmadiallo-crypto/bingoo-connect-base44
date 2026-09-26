import { Check, Lock, UserRound, Sparkles, Camera, Aperture, Building2 } from "lucide-react";
import { useI18n } from "@/lib/I18nContext";
import { t } from "@/lib/i18n";

const TYPES = [
  { id: "personal", profileType: "personal", labelKey: "profile_type_personal", icon: UserRound, minPlan: "free" },
  { id: "content_creator", profileType: "professional", labelKey: "profile_type_creator", icon: Sparkles, minPlan: "professional" },
  { id: "photographer", profileType: "professional", labelKey: "profile_type_photographer", icon: Camera, minPlan: "professional" },
  { id: "model", profileType: "professional", labelKey: "profile_type_model", icon: Aperture, minPlan: "professional" },
  { id: "business", profileType: "business", labelKey: "profile_type_business", icon: Building2, minPlan: "business" },
];

const RANK = { free: 0, professional: 1, pro: 1, salon: 2, restaurant: 2, lawfirm: 2, business: 2, corporate: 2, enterprise: 3 };

function normalizedPlan(plan) {
  const value = String(plan || "free").toLowerCase();
  return value === "pro" ? "professional" : value;
}

export default function ProfileTypeSelector({ profile, plan = "free", isDark = false, onChange }) {
  const { language } = useI18n();
  const current = profile?.profile_category || (profile?.profile_type === "business" ? "business" : "personal");
  const rank = RANK[normalizedPlan(plan)] ?? 0;

  return (
    <div>
      <div className="mb-4">
        <h2 className={`text-base font-black ${isDark ? "text-white" : "text-slate-900"}`}>{t("profile_type_title",language)}</h2>
      </div>
      <div className="grid gap-2.5">
        {TYPES.map((item) => {
          const Icon = item.icon;
          const locked = rank < (RANK[item.minPlan] ?? 0);
          const selected = current === item.id;
          return (
            <button
              key={item.id}
              type="button"
              disabled={locked}
              onClick={() => !locked && onChange?.(item)}
              className={`w-full text-left rounded-2xl border p-4 transition-all ${selected ? "border-orange-400 ring-1 ring-orange-400/30" : isDark ? "border-white/10 hover:border-white/20" : "border-slate-200 hover:border-slate-300"} ${locked ? "opacity-55 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${selected ? "bg-orange-500 text-white" : isDark ? "bg-white/8 text-white/60" : "bg-slate-100 text-slate-600"}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>{t(item.labelKey,language)}</p>
                    {selected && <Check className="w-4 h-4 text-orange-500" />}
                    {locked && <Lock className={`w-3.5 h-3.5 ml-auto ${isDark ? "text-white/35" : "text-slate-400"}`} />}
                  </div>
                  {locked && <p className="text-[11px] mt-1.5 font-bold text-orange-500">{t("profile_type_requires",language)} {t(item.minPlan === "business" ? "profile_type_business_plan" : "profile_type_professional_plan",language)}</p>}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
