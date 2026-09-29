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
      <div className={`rounded-2xl border p-3 ${isDark ? "bg-white/[0.03] border-white/10" : "bg-slate-50 border-slate-200"}`}>
        <label className={`block text-[10px] font-black uppercase tracking-[0.12em] mb-1.5 ${isDark ? "text-white/35" : "text-slate-400"}`}>
          {language === "fr" ? "Profession / activité" : "Profession / activity"}
        </label>
        <select
          value={current}
          onChange={(event) => {
            const item = PROFILE_PROFESSIONS.find((entry) => entry.id === event.target.value);
            if (!item) return;
            const locked = rank < (RANK[item.minPlan] ?? 0);
            if (!locked) onChange?.(item);
          }}
          className={`w-full min-h-[48px] rounded-xl border px-3 text-sm font-extrabold outline-none ${isDark ? "bg-[#111629] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"}`}
        >
          {PROFILE_PROFESSIONS.map((item) => {
            const locked = rank < (RANK[item.minPlan] ?? 0);
            const label = language === "fr" ? item.fr : item.en;
            return <option key={item.id} value={item.id} disabled={locked}>{label}{locked ? " · 🔒" : ""}</option>;
          })}
        </select>
        <p className={`text-[10px] mt-2 ${isDark ? "text-white/35" : "text-slate-400"}`}>
          {language === "fr" ? "Sélection compacte : le choix est appliqué au profil public après enregistrement." : "Compact selector: your choice is applied to the public profile after saving."}
        </p>
      </div>

      {current === "business" && (
        <div className={`mt-3 rounded-2xl border p-3 ${isDark ? "bg-white/[0.03] border-white/10" : "bg-white border-slate-200"}`}>
          <label className={`block text-[11px] font-black mb-1.5 ${isDark ? "text-white/60" : "text-slate-600"}`}>
            {language === "fr" ? "Libellé personnalisé Entreprise / Marque" : "Custom Business / Brand label"}
          </label>
          <input
            value={profile?.custom_profile_category || ""}
            onChange={(event) => onCustomLabelChange?.(event.target.value.slice(0, 48))}
            placeholder={language === "fr" ? "Ex. Agence événementielle, Studio, Cabinet…" : "e.g. Event Agency, Studio, Firm…"}
            className={`w-full h-10 rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-orange-400/30 ${isDark ? "bg-[#111629] border-white/10 text-white placeholder:text-white/30" : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400"}`}
          />
          <p className={`text-[10px] mt-1.5 ${isDark ? "text-white/35" : "text-slate-400"}`}>
            {language === "fr" ? "Ce texte remplacera « Entreprise / Marque » sur le profil public." : "This replaces “Business / Brand” on the public profile."}
          </p>
        </div>
      )}
    </div>
  );
}
