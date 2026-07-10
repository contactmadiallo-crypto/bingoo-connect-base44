import { useState } from "react";
import { Sparkles, TrendingUp, Shield, Zap, Headphones } from "lucide-react";
import AIProfileEnhancer from "./AIProfileEnhancer";
import ROIAnalyticsDashboard from "./ROIAnalyticsDashboard";
import VerifiedBadgesPanel from "./VerifiedBadgesPanel";
import EventModePanel from "./EventModePanel";
import ConciergePanel from "./ConciergePanel";

const TABS = [
  { id: "ai", label: "AI Enhancer", icon: Sparkles },
  { id: "roi", label: "ROI Analytics", icon: TrendingUp },
  { id: "verified", label: "Verified", icon: Shield },
  { id: "event", label: "Event Mode", icon: Zap },
  { id: "concierge", label: "Concierge", icon: Headphones },
];

export default function StrategicHub({ profile, isDark, user, onProfileUpdate }) {
  const [activeTab, setActiveTab] = useState("ai");

  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/60" : "text-slate-500";

  const handleApplySuggestions = async (updates) => {
    if (!profile || !onProfileUpdate) return;
    await onProfileUpdate(updates);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`rounded-2xl p-5 ${isDark ? "bg-white/5" : "bg-white"} border ${isDark ? "border-white/10" : "border-slate-200"}`}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0b2149, #f97316)" }}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className={`text-base font-black ${headText}`}>Strategic Tools</h2>
            <p className={`text-xs ${mutedText}`}>AI-powered growth, verification, and business intelligence</p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className={`flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide`}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                isActive
                  ? "text-white shadow-md"
                  : isDark
                  ? "text-white/60 bg-white/5 hover:bg-white/10"
                  : "text-slate-500 bg-slate-100 hover:bg-slate-200"
              }`}
              style={isActive ? { background: "#0b2149" } : {}}
            >
              <tab.icon className="w-3.5 h-3.5" style={{ color: isActive ? "#f97316" : undefined }} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active panel */}
      <div>
        {activeTab === "ai" && (
          <AIProfileEnhancer
            profile={profile}
            isDark={isDark}
            onApply={handleApplySuggestions}
          />
        )}
        {activeTab === "roi" && (
          <ROIAnalyticsDashboard profile={profile} isDark={isDark} />
        )}
        {activeTab === "verified" && (
          <VerifiedBadgesPanel profile={profile} isDark={isDark} user={user} />
        )}
        {activeTab === "event" && (
          <EventModePanel profile={profile} isDark={isDark} />
        )}
        {activeTab === "concierge" && (
          <ConciergePanel profile={profile} isDark={isDark} user={user} />
        )}
      </div>
    </div>
  );
}