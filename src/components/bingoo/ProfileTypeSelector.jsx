import { useEffect, useMemo, useState } from "react";
import {
  Check, Lock, UserRound, Sparkles, Camera, Aperture, Building2, BriefcaseBusiness,
  Rocket, House, Scale, HeartPulse, Dumbbell, MessageCircleMore, GraduationCap,
  Palette, Brush, Music2, Scissors, UtensilsCrossed, Code2, TrendingUp, UsersRound,
  CalendarDays, ChefHat, ChevronsUpDown, Search, X
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
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const current = profile?.profile_category || (profile?.profile_type === "business" ? "business" : "personal");
  const rank = RANK[normalizedPlan(plan)] ?? 0;
  const selectedItem = PROFILE_PROFESSIONS.find((item) => item.id === current) || PROFILE_PROFESSIONS[0];
  const SelectedIcon = ICONS[selectedItem.icon] || UserRound;
  const selectedLabel = language === "fr" ? selectedItem.fr : selectedItem.en;
  const visibleProfessions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PROFILE_PROFESSIONS;
    return PROFILE_PROFESSIONS.filter((item) => [item.en, item.fr, item.id].some((value) => String(value).toLowerCase().includes(q)));
  }, [query]);

  useEffect(() => {
    if (!open || typeof window === "undefined" || window.innerWidth >= 640) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);

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
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-haspopup="listbox"
            aria-expanded={open}
            className={`w-full min-h-[52px] rounded-xl border px-3 flex items-center gap-3 text-left transition-all ${isDark ? "bg-[#111629] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900 shadow-sm"} ${open ? "ring-2 ring-orange-400/30 border-orange-400" : ""}`}
          >
            <span className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center flex-shrink-0">
              <SelectedIcon className="w-[17px] h-[17px]" />
            </span>
            <span className="flex-1 min-w-0">
              <span className={`block text-[10px] uppercase tracking-[0.11em] font-black ${isDark ? "text-white/35" : "text-slate-400"}`}>
                {language === "fr" ? "Sélection actuelle" : "Current selection"}
              </span>
              <span className="block text-sm font-extrabold truncate">{selectedLabel}</span>
            </span>
            <ChevronsUpDown className={`w-4 h-4 flex-shrink-0 ${isDark ? "text-white/40" : "text-slate-400"}`} />
          </button>

          {open && (
            <>
            <button type="button" aria-label={language === "fr" ? "Fermer" : "Close profession picker"} onClick={() => { setOpen(false); setQuery(""); }} className="sm:hidden fixed inset-0 z-[109] bg-slate-950/45 backdrop-blur-[2px]" />
            <div className={`fixed sm:absolute z-[110] sm:z-[80] left-3 right-3 bottom-[calc(76px+env(safe-area-inset-bottom))] sm:left-0 sm:right-0 sm:bottom-auto sm:mt-2 max-h-[min(70dvh,560px)] sm:max-h-none rounded-[24px] sm:rounded-2xl border shadow-2xl overflow-hidden flex flex-col ${isDark ? "bg-[#0f1425] border-white/10" : "bg-white border-slate-200"}`}>
              <div className="sm:hidden flex items-center justify-between px-4 pt-3 pb-1">
                <div>
                  <p className={`text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>{language === "fr" ? "Choisir une profession" : "Choose profession"}</p>
                  <p className={`text-[10px] mt-0.5 ${isDark ? "text-white/40" : "text-slate-400"}`}>{language === "fr" ? "Recherchez ou faites défiler la liste" : "Search or scroll the list"}</p>
                </div>
                <button type="button" onClick={() => { setOpen(false); setQuery(""); }} className={`w-9 h-9 rounded-full flex items-center justify-center ${isDark ? "bg-white/10 text-white" : "bg-slate-100 text-slate-600"}`}><X className="w-4 h-4" /></button>
              </div>
              <div className={`p-2.5 border-b ${isDark ? "border-white/10" : "border-slate-100"}`}>
                <div className={`h-10 rounded-xl border flex items-center gap-2 px-3 ${isDark ? "bg-white/[0.04] border-white/10" : "bg-slate-50 border-slate-200"}`}>
                  <Search className={`w-4 h-4 flex-shrink-0 ${isDark ? "text-white/35" : "text-slate-400"}`} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={language === "fr" ? "Rechercher une profession…" : "Search professions…"}
                    className={`w-full bg-transparent outline-none text-sm ${isDark ? "text-white placeholder:text-white/30" : "text-slate-900 placeholder:text-slate-400"}`}
                  />
                  {query && <button type="button" onClick={() => setQuery("")} aria-label={language === "fr" ? "Effacer" : "Clear search"} className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? "hover:bg-white/10 text-white/45" : "hover:bg-slate-200 text-slate-400"}`}><X className="w-3.5 h-3.5" /></button>}
                </div>
              </div>

              <div role="listbox" className="flex-1 min-h-0 max-h-[300px] sm:max-h-[300px] overflow-y-auto overscroll-contain p-2 pb-3" style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}>
                {visibleProfessions.length ? visibleProfessions.map((item) => {
                  const Icon = ICONS[item.icon] || UserRound;
                  const locked = rank < (RANK[item.minPlan] ?? 0);
                  const selected = current === item.id;
                  const label = language === "fr" ? item.fr : item.en;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      disabled={locked}
                      onClick={() => {
                        if (locked) return;
                        onChange?.(item);
                        setOpen(false);
                        setQuery("");
                      }}
                      className={`w-full min-h-[48px] rounded-xl px-2.5 flex items-center gap-2.5 text-left transition-all ${selected ? (isDark ? "bg-orange-500/15" : "bg-orange-50") : (isDark ? "hover:bg-white/[0.05]" : "hover:bg-slate-50")} ${locked ? "opacity-45 cursor-not-allowed" : ""}`}
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${selected ? "bg-orange-500 text-white" : isDark ? "bg-white/[0.06] text-white/60" : "bg-slate-100 text-slate-600"}`}>
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className={`block text-xs font-extrabold truncate ${isDark ? "text-white" : "text-slate-900"}`}>{label}</span>
                        {locked && <span className="block text-[9px] mt-0.5 font-bold text-orange-500">{t("profile_type_requires",language)} {t(item.minPlan === "business" ? "profile_type_business_plan" : "profile_type_professional_plan",language)}</span>}
                      </span>
                      {selected ? <Check className="w-4 h-4 text-orange-500 flex-shrink-0" /> : locked ? <Lock className={`w-3.5 h-3.5 flex-shrink-0 ${isDark ? "text-white/30" : "text-slate-400"}`} /> : null}
                    </button>
                  );
                }) : (
                  <div className={`px-3 py-8 text-center text-xs ${isDark ? "text-white/40" : "text-slate-400"}`}>
                    {language === "fr" ? "Aucune profession trouvée." : "No profession found."}
                  </div>
                )}
              </div>
            </div>
            </>
          )}
        </div>
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
            {language === "fr" ? "Ce texte remplace « Entreprise / Marque » sur le profil public." : "This replaces “Business / Brand” on the public profile."}
          </p>
        </div>
      )}

    </div>
  );
}
