import React from "react";
import { ShieldCheck, ArrowRight } from "lucide-react";

const CHECKLIST = [
  { key: "profile_photo", weight: 15 },
  { key: "display_name", weight: 10 },
  { key: "job_title", weight: 10 },
  { key: "company_name", weight: 10 },
  { key: "bio", weight: 15 },
  { key: "phone", weight: 5 },
  { key: "email", weight: 5 },
  { key: "website", weight: 5 },
  { key: "social_links", weight: 10, check: (p) =>
    ["facebook_url","instagram_url","tiktok_url","linkedin_url","youtube_url"].filter(k => p[k]).length >= 3 },
  { key: "custom_links", weight: 5, check: (p) =>
    (p.custom_links || []).filter(l => l.enabled).length >= 1 },
  { key: "layout", weight: 10, check: (p) => p.layout && p.layout !== "classic" },
];

function computeScore(profile) {
  return CHECKLIST.filter(item =>
    item.check ? item.check(profile) : profile[item.key]
  ).reduce((sum, item) => sum + item.weight, 0);
}

/**
 * Compact profile-score shortcut for the dashboard.
 * Auto-hides once the profile reaches 100/100.
 * Updates in real time as the profile prop changes.
 */
export default function ProfileScoreShortcut({ profile, isDark, onNavigate }) {
  if (!profile) return null;
  const score = computeScore(profile);

  // Hide when profile is fully complete
  if (score >= 100) return null;

  const scoreColor = score >= 80 ? "#10b981" : score >= 50 ? "#f97316" : "#ef4444";
  const head  = isDark ? "text-white" : "text-slate-900";
  const muted = isDark ? "text-white/40" : "text-slate-400";
  const track = isDark ? "rgba(255,255,255,0.10)" : "#f1f5f9";

  return (
    <button
      onClick={() => onNavigate("quality")}
      className="w-full rounded-2xl p-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
      style={{
        background: isDark ? "rgba(255,255,255,0.05)" : "#fff",
        boxShadow: isDark
          ? "0 1px 0 rgba(255,255,255,0.05), 0 8px 24px rgba(0,0,0,0.25)"
          : "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05)",
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${scoreColor}18` }}>
          <ShieldCheck className="w-5 h-5" style={{ color: scoreColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className={`font-bold text-sm ${head}`}>Profile Score</p>
            <span className="text-sm font-black" style={{ color: scoreColor }}>
              {score}<span className="text-xs">/100</span>
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: track }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${score}%`, background: scoreColor }} />
          </div>
          <p className={`text-[11px] font-semibold mt-1.5 ${muted}`}>Tap to improve your profile</p>
        </div>
        <ArrowRight className={`w-4 h-4 flex-shrink-0 ${muted}`} />
      </div>
    </button>
  );
}