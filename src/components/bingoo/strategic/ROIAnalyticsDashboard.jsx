import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { TrendingUp, Smartphone, Clock, Users, Calendar, DollarSign, Zap } from "lucide-react";

const NAVY = "#0b2149", ORANGE = "#f97316";

export default function ROIAnalyticsDashboard({ profile, isDark }) {
  const { data: analytics = [] } = useQuery({
    queryKey: ["roi-analytics", profile?.id],
    queryFn: () => base44.entities.Analytics.filter({ profile_id: profile.id }, "-created_date", 500),
    enabled: !!profile?.id,
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["roi-leads", profile?.id],
    queryFn: () => base44.entities.Lead.filter({ profile_id: profile.id }, "-created_date", 200),
    enabled: !!profile?.id,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["roi-appts", profile?.id],
    queryFn: () => base44.entities.Appointment.filter({ profile_id: profile.id }, "-created_date", 200),
    enabled: !!profile?.id,
  });

  const { data: devices = [] } = useQuery({
    queryKey: ["roi-devices", profile?.id],
    queryFn: () => base44.entities.NFCDevice.filter({ profile_id: profile.id }, "-created_date", 50),
    enabled: !!profile?.id,
  });

  if (!profile) return null;

  // Compute funnel metrics
  const taps = analytics.filter((a) => a.event_type === "nfc_tap").length;
  const views = analytics.filter((a) => a.event_type === "profile_view").length;
  const contactsSaved = analytics.filter((a) => a.event_type === "save_contact_click").length;
  const leadsCount = leads.length;
  const bookings = appointments.filter((a) => a.status === "confirmed" || a.status === "accepted" || a.status === "completed").length;
  const wonLeads = leads.filter((l) => l.status === "won" || l.status === "retained").length;
  const revenueAttr = wonLeads * 250; // estimated $250 per won lead

  const funnel = [
    { stage: "NFC Taps", count: taps, pct: taps > 0 ? 100 : 0, color: ORANGE },
    { stage: "Profile Views", count: views, pct: taps > 0 ? Math.round((views / taps) * 100) : 0, color: "#fb923c" },
    { stage: "Contacts Saved", count: contactsSaved, pct: taps > 0 ? Math.round((contactsSaved / taps) * 100) : 0, color: "#3b82f6" },
    { stage: "Leads", count: leadsCount, pct: taps > 0 ? Math.round((leadsCount / taps) * 100) : 0, color: "#22C55E" },
    { stage: "Bookings", count: bookings, pct: taps > 0 ? Math.round((bookings / taps) * 100) : 0, color: "#8b5cf6" },
    { stage: "Revenue", count: wonLeads, pct: taps > 0 ? Math.round((wonLeads / taps) * 100) : 0, color: NAVY },
  ];

  // Top performing devices by tap count
  const deviceTaps = devices.map((d) => ({
    ...d,
    tapCount: analytics.filter((a) => a.device_id === d.id && a.event_type === "nfc_tap").length,
    leadCount: leads.filter((l) => l.source === "nfc").length,
  })).sort((a, b) => b.tapCount - a.tapCount).slice(0, 3);

  // Follow-up reminders (leads with follow_up_date in the next 7 days)
  const now = new Date();
  const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const followUps = leads
    .filter((l) => l.follow_up_date && new Date(l.follow_up_date) <= weekLater && l.status !== "won" && l.status !== "lost" && l.status !== "closed")
    .sort((a, b) => new Date(a.follow_up_date) - new Date(b.follow_up_date))
    .slice(0, 4);

  const cardBg = isDark ? "bg-white/5" : "bg-white";
  const cardBorder = isDark ? "border-white/10" : "border-slate-200";
  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/60" : "text-slate-500";
  const innerBg = isDark ? "bg-white/5" : "bg-slate-50";

  const kpis = [
    { label: "Total Taps", value: taps.toLocaleString(), color: ORANGE, icon: Smartphone },
    { label: "Contacts Saved", value: contactsSaved.toLocaleString(), color: "#3b82f6", icon: Users },
    { label: "Leads Generated", value: leadsCount.toLocaleString(), color: "#22C55E", icon: Zap },
    { label: "Bookings", value: bookings.toLocaleString(), color: "#8b5cf6", icon: Calendar },
    { label: "Revenue Attributed", value: `$${revenueAttr.toLocaleString()}`, color: NAVY, icon: DollarSign },
  ];

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className={`rounded-2xl border ${cardBorder} ${cardBg} p-4`}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: `${k.color}15` }}>
              <k.icon className="w-4 h-4" style={{ color: k.color }} />
            </div>
            <p className="text-xl font-black" style={{ color: k.color }}>{k.value}</p>
            <p className={`text-xs ${mutedText}`}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* Conversion Funnel */}
      <div className={`rounded-2xl border ${cardBorder} ${cardBg} p-5`}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-orange-500" />
          <h3 className={`text-sm font-black ${headText}`}>Conversion Funnel</h3>
        </div>
        <div className="space-y-2.5">
          {funnel.map((f) => (
            <div key={f.stage} className="flex items-center gap-3">
              <span className={`text-xs font-bold ${headText} w-24 flex-shrink-0`}>{f.stage}</span>
              <div className={`flex-1 h-7 rounded-lg overflow-hidden ${innerBg}`}>
                <div
                  className="h-full rounded-lg flex items-center px-2 transition-all duration-700"
                  style={{ width: `${Math.max(f.pct, f.count > 0 ? 8 : 0)}%`, background: f.color }}
                >
                  {f.count > 0 && <span className="text-[10px] font-black text-white">{f.count.toLocaleString()}</span>}
                </div>
              </div>
              <span className={`text-xs font-bold ${mutedText} w-10 text-right flex-shrink-0`}>{f.pct}%</span>
            </div>
          ))}
        </div>
        {taps === 0 && (
          <p className={`text-xs ${mutedText} mt-3 text-center`}>No NFC taps yet — activate a device to start tracking conversions.</p>
        )}
      </div>

      {/* Top Devices + Follow-ups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Performing Devices */}
        <div className={`rounded-2xl border ${cardBorder} ${cardBg} p-5`}>
          <h3 className={`text-sm font-black ${headText} mb-3`}>Top Performing Devices</h3>
          {deviceTaps.length === 0 ? (
            <p className={`text-xs ${mutedText}`}>No devices linked yet.</p>
          ) : (
            <div className="space-y-1">
              {deviceTaps.map((d, i) => (
                <div key={d.id} className="flex items-center gap-2 py-2 border-b border-slate-100 last:border-0 dark:border-white/5">
                  <Smartphone className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold ${headText} truncate`}>{d.device_code}</p>
                    <p className={`text-[10px] ${mutedText}`}>{d.device_type}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-black text-orange-500">{d.tapCount} taps</p>
                    <p className="text-[10px] text-emerald-500">{d.leadCount} leads</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Follow-up Reminders */}
        <div className={`rounded-2xl border ${cardBorder} ${cardBg} p-5`}>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-orange-500" />
            <h3 className={`text-sm font-black ${headText}`}>Follow-up Reminders</h3>
          </div>
          {followUps.length === 0 ? (
            <p className={`text-xs ${mutedText}`}>No follow-ups due this week.</p>
          ) : (
            <div className="space-y-1">
              {followUps.map((l) => {
                const due = new Date(l.follow_up_date);
                const isToday = due.toDateString() === now.toDateString();
                const isOverdue = due < now;
                const color = isOverdue ? "#EF4444" : isToday ? "#f97316" : "#3b82f6";
                return (
                  <div key={l.id} className="flex items-center gap-2 py-2 border-b border-slate-100 last:border-0 dark:border-white/5">
                    <Clock className="w-4 h-4 flex-shrink-0" style={{ color }} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold ${headText} truncate`}>{l.name || "Unknown"}</p>
                      <p className={`text-[10px] ${mutedText} truncate`}>{l.status.replace(/_/g, " ")}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: `${color}15`, color }}>
                      {isOverdue ? "OVERDUE" : isToday ? "TODAY" : due.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}