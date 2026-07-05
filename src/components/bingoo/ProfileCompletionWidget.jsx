import { CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { useBingooTheme } from "@/hooks/useBingooTheme";

// Core checks required for all plans
const CORE_CHECKS = [
  { key: "photo", label: "Profile Photo", tab: "profile", check: (p) => !!p?.profile_photo },
  { key: "bio",   label: "Bio",           tab: "profile", check: (p) => !!p?.bio },
  { key: "phone", label: "Phone Number",  tab: "profile", check: (p) => !!p?.phone },
];

// Plan-specific checks — only shown for relevant plans
const PLAN_CHECKS = [
  { key: "services", label: "Services Added",  tab: "services", plans: ["salon", "restaurant", "business", "corporate"], check: (_, d) => d?.hasServices },
  { key: "team",     label: "Team Members",    tab: "team",     plans: ["lawfirm", "corporate", "business"],              check: (_, d) => d?.hasTeam },
];

// NFC is a bonus/optional item — shown but never blocks 100%
const NFC_BONUS = { key: "nfc", label: "NFC Device Activated", tab: "nfc", check: (_, d) => d?.hasNfc };

function getChecks(plan) {
  const planKey = (plan || "free").toLowerCase();
  const planSpecific = PLAN_CHECKS.filter(c => c.plans.includes(planKey));
  return [...CORE_CHECKS, ...planSpecific];
}

export default function ProfileCompletionWidget({ profile, extraData = {}, onNavigate }) {
  const { isDark } = useBingooTheme();

  if (!profile) return null;

  const checks = getChecks(profile.plan);
  const results = checks.map(c => ({ ...c, done: c.check(profile, extraData) }));
  const nfcBonus = { ...NFC_BONUS, done: NFC_BONUS.check(profile, extraData) };

  const done = results.filter(r => r.done).length;

  // Auto-hide when all required (non-bonus) fields are complete
  if (done === results.length) return null;
  const pct = Math.round((done / results.length) * 100);

  // Find the first incomplete item to smart-navigate to
  const firstMissing = results.find(r => !r.done);

  const cardBg = isDark ? "rgba(255,255,255,0.05)" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/40" : "text-slate-400";
  const barColor = pct >= 80 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";

  const handleComplete = () => {
    if (!firstMissing || !onNavigate) return;
    // NFC device is a page navigation, others are dashboard tabs
    if (firstMissing.tab === "nfc") {
      window.location.href = "/my-nfc-devices";
    } else {
      onNavigate(firstMissing.tab);
    }
  };

  const handleItemClick = (item) => {
    if (item.done || !onNavigate) return;
    if (item.tab === "nfc") {
      window.location.href = "/my-nfc-devices";
    } else {
      onNavigate(item.tab);
    }
  };

  return (
    <div className="rounded-2xl p-4" style={{ background: cardBg, border: `1px solid ${border}`, boxShadow: isDark ? "0 1px 0 rgba(255,255,255,0.04)" : "0 1px 3px rgba(0,0,0,0.06)" }}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className={`font-bold text-sm ${headText}`}>Profile Completion</p>
          <p className={`text-xs mt-0.5 ${mutedText}`}>{done} of {results.length} complete</p>
        </div>
        <span className="text-2xl font-black" style={{ color: barColor }}>{pct}%</span>
      </div>

      {/* Progress bar */}
      <div className={`h-2 rounded-full mb-4 overflow-hidden ${isDark ? "bg-white/8" : "bg-slate-100"}`}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: barColor }} />
      </div>

      {/* Checklist — incomplete items are clickable */}
      <div className="space-y-1.5">
        {results.map(r => (
          <button
            key={r.key}
            onClick={() => handleItemClick(r)}
            disabled={r.done}
            className={`w-full flex items-center gap-2.5 text-left transition-all rounded-lg px-1 py-0.5 ${
              !r.done
                ? isDark ? "hover:bg-white/8 cursor-pointer" : "hover:bg-black/5 cursor-pointer"
                : "cursor-default"
            }`}
          >
            {r.done
              ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              : <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            }
            <span className={`text-xs font-medium flex-1 ${r.done
              ? (isDark ? "text-white/50 line-through" : "text-slate-400 line-through")
              : (isDark ? "text-white/75" : "text-slate-700")}`}>
              {r.label}
            </span>
            {!r.done && <ArrowRight className="w-3 h-3 opacity-30 flex-shrink-0" />}
          </button>
        ))}
        {/* NFC bonus item — always shown but never counts toward 100% */}
        <button
          onClick={() => handleItemClick(nfcBonus)}
          disabled={nfcBonus.done}
          className={`w-full flex items-center gap-2.5 text-left transition-all rounded-lg px-1 py-0.5 ${
            !nfcBonus.done
              ? isDark ? "hover:bg-white/8 cursor-pointer" : "hover:bg-black/5 cursor-pointer"
              : "cursor-default"
          }`}
        >
          {nfcBonus.done
            ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            : <AlertCircle className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          }
          <span className={`text-xs font-medium flex-1 ${nfcBonus.done
            ? (isDark ? "text-white/50 line-through" : "text-slate-400 line-through")
            : (isDark ? "text-white/75" : "text-slate-700")}`}>
            {nfcBonus.label}
          </span>
          {!nfcBonus.done && (
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-50 text-blue-500"}`}>
              Bonus
            </span>
          )}
        </button>
      </div>

      {pct < 100 && firstMissing && (
        <button
          onClick={handleComplete}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-90"
          style={{ background: barColor, color: "#fff" }}
        >
          Fix: {firstMissing.label} <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}