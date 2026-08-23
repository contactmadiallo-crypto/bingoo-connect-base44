import { Check, Lock, UserRound, Sparkles, Camera, Aperture, Building2 } from "lucide-react";

const TYPES = [
  { id: "personal", profileType: "personal", label: "Personal", description: "A clean personal profile with simple contact actions.", icon: UserRound, minPlan: "free" },
  { id: "content_creator", profileType: "professional", label: "Content Creator", description: "Creator profile with a Book a Collab lead action.", icon: Sparkles, minPlan: "professional" },
  { id: "photographer", profileType: "professional", label: "Photographer / Filmmaker", description: "Portfolio-led profile with a Book a Session lead action.", icon: Camera, minPlan: "professional" },
  { id: "model", profileType: "professional", label: "Model", description: "Model profile with a Collab / Shooting lead action.", icon: Aperture, minPlan: "professional" },
  { id: "business", profileType: "business", label: "Business / Brand", description: "Business identity with brand details and business features.", icon: Building2, minPlan: "business" },
];

const RANK = { free: 0, professional: 1, pro: 1, salon: 2, restaurant: 2, lawfirm: 2, business: 2, corporate: 2, enterprise: 3 };

function normalizedPlan(plan) {
  const value = String(plan || "free").toLowerCase();
  return value === "pro" ? "professional" : value;
}

export default function ProfileTypeSelector({ profile, plan = "free", isDark = false, onChange }) {
  const current = profile?.profile_category || (profile?.profile_type === "business" ? "business" : "personal");
  const rank = RANK[normalizedPlan(plan)] ?? 0;

  return (
    <div>
      <div className="mb-4">
        <h2 className={`text-base font-black ${isDark ? "text-white" : "text-slate-900"}`}>Profile Type</h2>
        <p className={`text-xs mt-1 ${isDark ? "text-white/45" : "text-slate-500"}`}>
          Choose how this profile works. Your selection controls the matching public-profile action while keeping Info and Contact clean.
        </p>
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
                    <p className={`text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>{item.label}</p>
                    {selected && <Check className="w-4 h-4 text-orange-500" />}
                    {locked && <Lock className={`w-3.5 h-3.5 ml-auto ${isDark ? "text-white/35" : "text-slate-400"}`} />}
                  </div>
                  <p className={`text-xs mt-1 leading-relaxed ${isDark ? "text-white/45" : "text-slate-500"}`}>{item.description}</p>
                  {locked && <p className="text-[11px] mt-1.5 font-bold text-orange-500">Requires {item.minPlan === "business" ? "Business" : "Professional"}</p>}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
