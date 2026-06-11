import { CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { useBingooTheme } from "@/hooks/useBingooTheme";

const CHECKS = [
  { key: "photo",      label: "Profile Photo",       check: (p, d) => !!p?.profile_photo },
  { key: "bio",        label: "Bio",                  check: (p, d) => !!p?.bio },
  { key: "phone",      label: "Phone Number",         check: (p, d) => !!p?.phone },
  { key: "services",   label: "Services Added",       check: (p, d) => d?.hasServices },
  { key: "team",       label: "Team Members",         check: (p, d) => d?.hasTeam },
  { key: "nfc",        label: "NFC Device Activated", check: (p, d) => d?.hasNfc },
];

export default function ProfileCompletionWidget({ profile, extraData = {}, onEdit }) {
  const { isDark } = useBingooTheme();

  if (!profile) return null;

  const results = CHECKS.map(c => ({ ...c, done: c.check(profile, extraData) }));
  const done = results.filter(r => r.done).length;
  const pct = Math.round((done / results.length) * 100);

  const cardBg = isDark ? "rgba(255,255,255,0.05)" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/40" : "text-slate-400";

  const barColor = pct >= 80 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="rounded-2xl p-4" style={{ background: cardBg, border: `1px solid ${border}`, boxShadow: isDark ? "0 1px 0 rgba(255,255,255,0.04)" : "0 1px 3px rgba(0,0,0,0.06)" }}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className={`font-bold text-sm ${headText}`}>Profile Completion</p>
          <p className={`text-xs mt-0.5 ${mutedText}`}>{done} of {results.length} complete</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black" style={{ color: barColor }}>{pct}%</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className={`h-2 rounded-full mb-4 overflow-hidden ${isDark ? "bg-white/8" : "bg-slate-100"}`}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: barColor }} />
      </div>

      {/* Checklist */}
      <div className="space-y-1.5">
        {results.map(r => (
          <div key={r.key} className="flex items-center gap-2.5">
            {r.done
              ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              : <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            }
            <span className={`text-xs font-medium ${r.done ? (isDark ? "text-white/50 line-through" : "text-slate-400 line-through") : (isDark ? "text-white/75" : "text-slate-700")}`}>
              {r.label}
            </span>
          </div>
        ))}
      </div>

      {pct < 100 && (
        <button
          onClick={onEdit}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all"
          style={{ background: barColor, color: "#fff" }}
        >
          Complete My Profile <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}