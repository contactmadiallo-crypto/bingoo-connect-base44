import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Activity, Users, BarChart3, UserPlus, Lock, ChevronRight, CalendarDays } from "lucide-react";
import ConnectionsPanel from "@/components/bingoo/ConnectionsPanel";
import AnalyticsPanel from "@/components/bingoo/AnalyticsPanel";
import LeadsPanel from "@/components/bingoo/LeadsPanel";

const TABS = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "connections", label: "Connections", icon: Users },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "leads", label: "Leads", icon: UserPlus },
  { id: "appointments", label: "Appointments", icon: CalendarDays },
];

export default function ActivityHub({
  profileId,
  profileIds = [],
  user,
  isDark = false,
  canAnalytics = true,
  canLeads = true,
  canAppointments = true,
  initialTab = "overview",
  onTabChange,
  highlightLeadId,
  highlightAppointmentId,
}) {
  const allowedInitialTab = (initialTab === "leads" && !canLeads) || (initialTab === "appointments" && !canAppointments) ? "overview" : (initialTab || "overview");
  const [tab, setTab] = useState(allowedInitialTab);
  const visibleTabs = TABS.filter((item) => (item.id !== "leads" || canLeads) && (item.id !== "appointments" || canAppointments));

  const choose = (next) => {
    setTab(next);
    onTabChange?.(next);
  };

  const { data: connections = [] } = useQuery({
    queryKey: ["activity-hub-connections", profileId],
    queryFn: () => profileId
      ? base44.entities.SavedConnection.filter({ profile_id: profileId }, "-created_date")
      : [],
    enabled: !!profileId,
  });

  const { data: analytics = [] } = useQuery({
    queryKey: ["activity-hub-analytics", profileId],
    queryFn: () => base44.functions.invoke("getMyAnalytics", { profile_id: profileId }).then(r => r.data?.events || []),
    enabled: !!profileId && canAnalytics,
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["activity-hub-leads", profileId],
    queryFn: () => base44.functions.invoke("getMyLeads", { profile_id: profileId }).then(r => r.data?.leads || []),
    enabled: !!profileId && canLeads,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["activity-hub-appointments", user?.id],
    queryFn: () => user?.id ? base44.entities.Appointment.filter({ owner_user_id: user.id }, "-date", 200) : [],
    enabled: !!user?.id && canAppointments,
  });

  const totalInteractions = analytics.length;
  const totalConnections = connections.length;
  const totalLeads = leads.length;

  const head = isDark ? "text-white" : "text-slate-900";
  const sub = isDark ? "text-white/45" : "text-slate-500";
  const card = isDark ? "bg-white/[0.045] border-white/10" : "bg-white border-slate-200";

  return (
    <div className="space-y-4">
      <div className="px-1">
        <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${head}`}>Activity</h1>
        <p className={`text-sm mt-1 ${sub}`}>Connections, engagement, analytics and leads in one place.</p>
      </div>

      <div className={`grid gap-1 p-1 rounded-2xl border ${card}`} style={{ gridTemplateColumns: `repeat(${visibleTabs.length}, minmax(0, 1fr))` }}>
        {visibleTabs.map((item) => {
          const blocked = (item.id === "analytics" && !canAnalytics) || (item.id === "leads" && !canLeads);
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => !blocked && choose(item.id)}
              disabled={blocked}
              className={`min-w-0 min-h-[58px] rounded-xl flex flex-col items-center justify-center gap-1 px-1 transition-all ${active ? "text-white shadow-sm" : sub} ${blocked ? "opacity-45" : ""}`}
              style={active ? { background: "#0b2149" } : {}}
            >
              {blocked ? <Lock className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              <span className="text-[10px] sm:text-xs font-bold truncate w-full text-center">{item.label}</span>
            </button>
          );
        })}
      </div>

      {tab === "overview" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "Connections", value: totalConnections, icon: Users, action: "connections", enabled: true },
              { label: "Interactions", value: canAnalytics ? totalInteractions : "—", icon: BarChart3, action: "analytics", enabled: canAnalytics },
              { label: "Leads", value: canLeads ? totalLeads : "—", icon: UserPlus, action: "leads", enabled: canLeads },
              ...(canAppointments ? [{ label: "Appointments", value: appointments.length, icon: CalendarDays, action: "appointments", enabled: true }] : []),
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  type="button"
                  key={item.label}
                  disabled={!item.enabled}
                  onClick={() => item.enabled && choose(item.action)}
                  className={`rounded-2xl border p-3 text-left transition-all active:scale-[0.98] ${card} ${!item.enabled ? "opacity-50" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? "bg-white/8" : "bg-slate-100"}`}>
                      {item.enabled ? <Icon className="w-4 h-4 text-orange-500" /> : <Lock className="w-4 h-4 text-slate-400" />}
                    </span>
                    {item.enabled && <ChevronRight className={`w-4 h-4 ${sub}`} />}
                  </div>
                  <p className={`text-2xl font-black mt-3 ${head}`}>{item.value}</p>
                  <p className={`text-[11px] font-semibold mt-0.5 ${sub}`}>{item.label}</p>
                </button>
              );
            })}
          </div>

          <div className={`rounded-2xl border p-4 ${card}`}>
            <p className={`font-black text-sm ${head}`}>Your activity center</p>
            <p className={`text-sm mt-1 leading-relaxed ${sub}`}>
              Save people you meet under Connections, monitor profile/NFC engagement under Analytics,
              and manage captured prospects under Leads.
            </p>
          </div>
        </div>
      )}

      {tab === "connections" && <ConnectionsPanel isDark={isDark} profileId={profileId} />}
      {tab === "analytics" && canAnalytics && <AnalyticsPanel profileId={profileId} />}
      {tab === "appointments" && canAppointments && (
        <button type="button" onClick={() => { window.location.href = `/bingoo?view=appointments${highlightAppointmentId ? `&appointmentId=${encodeURIComponent(highlightAppointmentId)}` : ""}`; }} className={`w-full rounded-2xl border p-4 text-left flex items-center justify-between ${card}`}>
          <div><p className={`font-black ${head}`}>Manage appointments</p><p className={`text-sm mt-1 ${sub}`}>Open bookings, confirm, reschedule or complete appointments.</p></div><ChevronRight className={`w-5 h-5 ${sub}`} />
        </button>
      )}
      {tab === "leads" && canLeads && (
        <LeadsPanel
          profileId={profileId}
          profileIds={profileIds}
          user={user}
          highlightId={highlightLeadId}
        />
      )}
    </div>
  );
}
