import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Phone, Mail, CheckCircle2, Circle, Loader2, Headphones, Sparkles } from "lucide-react";

const NAVY = "#0b2149", ORANGE = "#f97316";

export default function ConciergePanel({ profile, isDark, user }) {
  // Check completion state for onboarding plan
  const { data: teamMembers = [] } = useQuery({
    queryKey: ["concierge-team", profile?.id],
    queryFn: () => base44.entities.TeamMember.filter({ profile_id: profile.id }, "-created_date", 50),
    enabled: !!profile?.id,
  });

  const { data: devices = [] } = useQuery({
    queryKey: ["concierge-devices", profile?.id],
    queryFn: () => base44.entities.NFCDevice.filter({ profile_id: profile.id }, "-created_date", 50),
    enabled: !!profile?.id,
  });

  const { data: designs = [] } = useQuery({
    queryKey: ["concierge-designs", profile?.id],
    queryFn: () => base44.entities.DeviceDesign.filter({ profile_id: profile.id }, "-created_date", 10),
    enabled: !!profile?.id,
  });

  if (!profile) return null;

  // Onboarding plan steps — dynamically computed from real data
  const steps = [
    {
      label: "Profile setup & branding",
      done: !!(profile.display_name && profile.bio && profile.profile_photo),
    },
    {
      label: "Team member accounts",
      done: teamMembers.length > 0,
      active: teamMembers.length === 0 && profile.display_name,
    },
    {
      label: "NFC device order",
      done: devices.length > 0,
      active: devices.length === 0 && profile.display_name,
    },
    {
      label: "Custom card design approval",
      done: designs.some((d) => d.status === "approved" || d.status === "shipped"),
      active: designs.length > 0 && !designs.some((d) => d.status === "approved" || d.status === "shipped"),
    },
    {
      label: "Go-live & training call",
      done: false,
      active: false,
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const overallPct = Math.round((completedCount / steps.length) * 100);

  const cardBg = isDark ? "bg-white/5" : "bg-white";
  const cardBorder = isDark ? "border-white/10" : "border-slate-200";
  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/60" : "text-slate-500";
  const innerBg = isDark ? "bg-white/5" : "bg-slate-50";

  return (
    <div className="space-y-4">
      {/* Dedicated Manager */}
      <div className={`rounded-2xl border ${cardBorder} ${cardBg} p-5 text-center`}>
        <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${NAVY}, #071A3D)` }}>
          <Headphones className="w-7 h-7 text-orange-500" />
        </div>
        <h3 className={`text-base font-black ${headText}`}>Concierge Service</h3>
        <p className={`text-xs ${mutedText} mt-1`}>White-glove onboarding for Business & Corporate plans</p>

        {/* Manager card */}
        <div className={`rounded-xl p-4 mt-4 ${innerBg} text-left`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${NAVY}, #13284f)` }}>
              <span className="font-black text-sm" style={{ color: ORANGE }}>SC</span>
            </div>
            <div className="flex-1">
              <p className={`text-sm font-black ${headText}`}>Sarah Chen</p>
              <p className={`text-[10px] ${mutedText}`}>Your dedicated onboarding manager</p>
            </div>
          </div>
          <div className="flex gap-2">
            <a
              href="tel:+18005551234"
              className="flex-1 py-2 rounded-lg text-[10px] font-bold text-white flex items-center justify-center gap-1"
              style={{ background: "#22C55E" }}
            >
              <Phone className="w-3 h-3" /> Call
            </a>
            <a
              href="mailto:concierge@bingooconnect.com"
              className="flex-1 py-2 rounded-lg text-[10px] font-bold text-white flex items-center justify-center gap-1"
              style={{ background: "#3b82f6" }}
            >
              <Mail className="w-3 h-3" /> Email
            </a>
          </div>
        </div>
      </div>

      {/* Onboarding Plan */}
      <div className={`rounded-2xl border ${cardBorder} ${cardBg} p-5`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <h3 className={`text-sm font-black ${headText}`}>Your Onboarding Plan</h3>
          </div>
          <div className="text-right">
            <p className="text-lg font-black" style={{ color: overallPct === 100 ? "#22C55E" : ORANGE }}>{overallPct}%</p>
            <p className={`text-[10px] ${mutedText}`}>{completedCount}/{steps.length} done</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className={`h-2 rounded-full mb-4 overflow-hidden ${isDark ? "bg-white/10" : "bg-slate-100"}`}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${overallPct}%`, background: overallPct === 100 ? "#22C55E" : ORANGE }} />
        </div>

        {/* Steps */}
        <div className="space-y-1">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${s.active ? "ring-2 ring-orange-500 ring-offset-1" : ""}`}
                style={{ background: s.done ? "#22C55E" : s.active ? ORANGE : isDark ? "#ffffff10" : "#e2e8f0" }}
              >
                {s.done ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                ) : s.active ? (
                  <Loader2 className="w-3 h-3 text-white animate-spin" />
                ) : (
                  <span className={`text-[9px] font-bold ${mutedText}`}>{i + 1}</span>
                )}
              </div>
              <span className={`text-xs font-bold flex-1 ${s.done ? "text-emerald-500" : s.active ? headText : mutedText}`}>
                {s.label}
              </span>
              {s.done && <span className="text-[10px] font-bold text-emerald-500">✓ Done</span>}
              {s.active && <span className="text-[10px] font-bold" style={{ color: ORANGE }}>In progress</span>}
            </div>
          ))}
        </div>

        {overallPct === 100 && (
          <div className={`rounded-xl p-3 mt-4 text-center ${innerBg}`}>
            <p className={`text-xs font-bold ${headText}`}>🎉 Your onboarding is complete!</p>
          </div>
        )}
      </div>
    </div>
  );
}