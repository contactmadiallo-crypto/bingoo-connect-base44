import {
  Check, Lock, UserRound, Sparkles, Camera, Aperture, Building2, BriefcaseBusiness,
  Rocket, House, Scale, HeartPulse, Dumbbell, MessageCircleMore, GraduationCap,
  Palette, Brush, Music2, Scissors, UtensilsCrossed, Code2, TrendingUp, UsersRound,
  CalendarDays, ChefHat
} from "lucide-react";
import { useI18n } from "@/lib/I18nContext";
import { t } from "@/lib/i18n";
import { PROFILE_PROFESSIONS } from "@/lib/profileProfessions";

const ICONS = {
  user: UserRound, sparkles: Sparkles, camera: Camera, aperture: Aperture, building: Building2,
  briefcase: BriefcaseBusiness, rocket: Rocket, home: House, scale: Scale, heart: HeartPulse,
  dumbbell: Dumbbell, message: MessageCircleMore, graduation: GraduationCap, palette: Palette,
  brush: Brush, music: Music2, scissors: Scissors, utensils: UtensilsCrossed, code: Code2,
  trending: TrendingUp, users: UsersRound, calendar: CalendarDays, chef: ChefHat,
};

const RANK = { free: 0, professional: 1, pro: 1, salon: 2, restaurant: 2, lawfirm: 2, business: 2, corporate: 2, enterprise: 3 };

function normalizedPlan(plan) {
  const value = String(plan || "free").toLowerCase();
  return value === "pro" ? "professional" : value;
}

export default function ProfileTypeSelector({ profile, plan = "free", isDark = false, onChange, onCustomLabelChange }) {
  const { language } = useI18n();
  const current = profile?.profile_category || (profile?.profile_type === "business" ? "business" : "personal");
  const rank = RANK[normalizedPlan(plan)] ?? 0;

  return (
    <div>
      <div className="mb-3">
        <h2 className={`text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>{t("profile_type_title",language)}</h2>
        <p className={`text-[11px] mt-1 ${isDark ? "text-white/40" : "text-slate-400"}`}>{language === "fr" ? "Choisissez la profession mise en avant sur votre profil public." : "Choose the profession highlighted on your public profile."}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {PROFILE_PROFESSIONS.map((item) => {
          const Icon = ICONS[item.icon] || UserRound;
          const locked = rank < (RANK[item.minPlan] ?? 0);
          const selected = current === item.id;
          const label = language === "fr" ? item.fr : item.en;
          return (
            <button
              key={item.id}
              type="button"
              disabled={locked}
              onClick={() => !locked && onChange?.(item)}
              className={`w-full text-left rounded-xl border px-3 py-2.5 transition-all ${selected ? "border-orange-400 ring-1 ring-orange-400/25" : isDark ? "border-white/10 hover:border-white/20" : "border-slate-200 hover:border-slate-300"} ${locked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${selected ? "bg-orange-500 text-white" : isDark ? "bg-white/8 text-white/60" : "bg-slate-100 text-slate-600"}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className={`text-xs font-black truncate ${isDark ? "text-white" : "text-slate-900"}`}>{label}</p>
                    {selected && <Check className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />}
                    {locked && <Lock className={`w-3 h-3 ml-auto ${isDark ? "text-white/35" : "text-slate-400"}`} />}
                  </div>
                  {locked && <p className="text-[9px] mt-1 font-bold text-orange-500">{t("profile_type_requires",language)} {t(item.minPlan === "business" ? "profile_type_business_plan" : "profile_type_professional_plan",language)}</p>}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
