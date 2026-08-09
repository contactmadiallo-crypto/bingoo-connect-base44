import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useProfileWorkspace } from "@/lib/ProfileWorkspaceContext";
import {
  Share2, Smartphone, CalendarDays, Users, Eye,
  Check, QrCode, Zap, Pencil, ArrowRight, Plus,
} from "lucide-react";
import ProfileScoreShortcut from "@/components/bingoo/ProfileScoreShortcut";

function getGreeting(date) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function relativeTime(value) {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function PremiumHomeDashboard({
  profile,
  user,
  isDark,
  leads: activeLeads = [],
  appointments: activeAppointments = [],
  analytics: activeAnalytics = [],
  nfcDevices: activeNfcDevices = [],
  onNavigate,
  profileUrl,
  isLoading,
}) {
  const rootRef = useRef(null);
  const qc = useQueryClient();
  const { profiles = [], selectProfile } = useProfileWorkspace();
  const [copied, setCopied] = useState(false);
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  // Home owns its clean top-of-page composition. Hide the older duplicate page toolbar
  // and page-level profile chip while this Home component is mounted. Other dashboard
  // pages keep their existing context toolbar unchanged.
  useEffect(() => {
    const root = rootRef.current;
    const homeWrapper = root?.parentElement;
    if (!root || !homeWrapper) return undefined;

    const profileChip = root.previousElementSibling;
    const legacyToolbar = homeWrapper.previousElementSibling;
    const previousChipDisplay = profileChip?.style?.display;
    const previousToolbarDisplay = legacyToolbar?.style?.display;

    if (profileChip) profileChip.style.display = "none";
    if (legacyToolbar) legacyToolbar.style.display = "none";

    return () => {
      if (profileChip) profileChip.style.display = previousChipDisplay || "";
      if (legacyToolbar) legacyToolbar.style.display = previousToolbarDisplay || "";
    };
  }, []);

  const ownedProfileIds = useMemo(() => profiles.map((item) => item.id).filter(Boolean), [profiles]);
  const profileById = useMemo(() => Object.fromEntries(profiles.map((item) => [item.id, item])), [profiles]);

  // Account-wide live dashboard data. These queries intentionally aggregate every profile
  // owned by the signed-in account so the dashboard numbers and activity feed are not
  // limited to whichever profile happens to be selected.
  const { data: accountLeads = activeLeads } = useQuery({
    queryKey: ["dashboard-account-leads", ...ownedProfileIds],
    enabled: ownedProfileIds.length > 0,
    queryFn: async () => {
      const groups = await Promise.all(ownedProfileIds.map(async (profileId) => {
        try {
          const response = await base44.functions.invoke("getMyLeads", { profile_id: profileId });
          return response?.data?.leads || [];
        } catch {
          return [];
        }
      }));
      return groups.flat();
    },
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });

  const { data: accountAppointments = activeAppointments } = useQuery({
    queryKey: ["dashboard-account-appointments", ...ownedProfileIds],
    enabled: ownedProfileIds.length > 0,
    queryFn: async () => {
      const groups = await Promise.all(ownedProfileIds.map((profileId) =>
        base44.entities.Appointment.filter({ profile_id: profileId }, "-created_date").catch(() => [])
      ));
      return groups.flat();
    },
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });

  const { data: accountAnalytics = activeAnalytics } = useQuery({
    queryKey: ["dashboard-account-analytics", ...ownedProfileIds],
    enabled: ownedProfileIds.length > 0,
    queryFn: async () => {
      const groups = await Promise.all(ownedProfileIds.map((profileId) =>
        base44.entities.Analytics.filter({ profile_id: profileId }).catch(() => [])
      ));
      return groups.flat();
    },
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });

  const { data: accountNfcDevices = activeNfcDevices } = useQuery({
    queryKey: ["dashboard-account-nfc-devices"],
    queryFn: async () => {
      try {
        const response = await base44.functions.invoke("getMyNfcDevices", {});
        return response?.data?.devices || [];
      } catch {
        return activeNfcDevices;
      }
    },
    staleTime: 20_000,
    refetchOnWindowFocus: true,
  });

  // Keep account-level cards current without refreshing the page.
  useEffect(() => {
    if (ownedProfileIds.length === 0) return undefined;
    const owned = new Set(ownedProfileIds);

    const unsubLeads = base44.entities.Lead.subscribe((event) => {
      if (owned.has(event.data?.profile_id)) qc.invalidateQueries({ queryKey: ["dashboard-account-leads"] });
    });
    const unsubAppointments = base44.entities.Appointment.subscribe((event) => {
      if (owned.has(event.data?.profile_id)) qc.invalidateQueries({ queryKey: ["dashboard-account-appointments"] });
    });
    const unsubAnalytics = base44.entities.Analytics.subscribe((event) => {
      if (owned.has(event.data?.profile_id)) qc.invalidateQueries({ queryKey: ["dashboard-account-analytics"] });
    });

    return () => {
      unsubLeads?.();
      unsubAppointments?.();
      unsubAnalytics?.();
    };
  }, [ownedProfileIds, qc]);

  const totalViews = accountAnalytics.filter((event) => event.event_type === "profile_view").length;
  const totalNfcTaps = accountAnalytics.filter((event) => event.event_type === "nfc_tap").length;

  const activity = useMemo(() => {
    const items = [];
    const profileLabel = (profileId) => profileById[profileId]?.display_name || "Bingoo profile";

    accountLeads.forEach((lead) => {
      items.push({
        id: `lead-${lead.id}`,
        type: "lead",
        title: "New lead received",
        detail: `${lead.name || lead.full_name || lead.email || "New contact"} · ${profileLabel(lead.profile_id)}`,
        at: lead.created_date,
        destination: "leads",
      });
    });

    accountAppointments.forEach((appointment) => {
      items.push({
        id: `appointment-${appointment.id}`,
        type: "appointment",
        title: "New appointment booked",
        detail: `${appointment.customer_name || appointment.name || appointment.service_name || "Booking received"} · ${profileLabel(appointment.profile_id)}`,
        at: appointment.created_date || appointment.date,
        destination: "appointments",
      });
    });

    accountAnalytics
      .filter((event) => event.event_type === "profile_view" || event.event_type === "nfc_tap")
      .forEach((event, index) => {
        items.push({
          id: `analytics-${event.id || index}`,
          type: event.event_type === "nfc_tap" ? "tap" : "view",
          title: event.event_type === "nfc_tap" ? "NFC device tapped" : "Profile viewed",
          detail: `${event.event_type === "nfc_tap" ? "A Bingoo device opened" : "Someone visited"} · ${profileLabel(event.profile_id)}`,
          at: event.created_date || event.timestamp,
          destination: "analytics",
        });
      });

    accountNfcDevices
      .filter((device) => device.status === "active")
      .forEach((device, index) => {
        items.push({
          id: `device-${device.id || index}`,
          type: "device",
          title: "NFC device active",
          detail: `${device.device_name || device.name || device.device_type || "Bingoo device"} · ${profileLabel(device.profile_id)}`,
          at: device.updated_date || device.created_date,
          href: "/my-nfc-devices",
        });
      });

    return items
      .sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0))
      .slice(0, 5);
  }, [accountLeads, accountAppointments, accountAnalytics, accountNfcDevices, profileById]);

  const handleShare = async () => {
    if (!profileUrl) return;
    try {
      await navigator.clipboard?.writeText(profileUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be unavailable in some embedded previews.
    }
  };

  const firstName = user?.full_name?.trim()?.split(/\s+/)?.[0] || "there";
  const greeting = getGreeting(clock);
  const dateLine = clock.toLocaleString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const colors = {
    pageText: isDark ? "text-white" : "text-[#08162f]",
    subText: isDark ? "text-white/55" : "text-slate-500",
    card: isDark ? "bg-white/[0.055] border-white/10" : "bg-white border-slate-200/80",
    soft: isDark ? "bg-white/[0.045]" : "bg-[#f8fafc]",
  };

  const cardShadow = isDark
    ? { boxShadow: "0 1px 0 rgba(255,255,255,.04), 0 12px 32px rgba(0,0,0,.18)" }
    : { boxShadow: "0 2px 6px rgba(15,23,42,.035), 0 16px 38px rgba(15,23,42,.045)" };

  const metrics = [
    { label: "Profile Views", value: totalViews, icon: Eye, color: "#2563eb", bg: "#dbeafe", destination: "analytics" },
    { label: "NFC Taps", value: totalNfcTaps, icon: Smartphone, color: "#16a34a", bg: "#dcfce7", destination: "analytics" },
    { label: "New Leads", value: accountLeads.length, icon: Users, color: "#7c3aed", bg: "#ede9fe", destination: "leads" },
    { label: "Appointments", value: accountAppointments.length, icon: CalendarDays, color: "#f97316", bg: "#ffedd5", destination: "appointments" },
  ];

  const actions = [
    {
      label: copied ? "Copied!" : "Share Profile",
      detail: "Copy the active public profile link",
      icon: copied ? Check : Share2,
      color: copied ? "#16a34a" : "#2563eb",
      bg: copied ? "#dcfce7" : "#dbeafe",
      onClick: handleShare,
    },
    {
      label: "QR Code & Wallet",
      detail: "Open sharing and wallet tools",
      icon: QrCode,
      color: "#16a34a",
      bg: "#dcfce7",
      onClick: () => onNavigate("qrwallet"),
    },
    {
      label: "Activate NFC",
      detail: "Assign and activate a device",
      icon: Zap,
      color: "#f97316",
      bg: "#ffedd5",
      href: "/activate-device",
    },
    {
      label: "Profiles",
      detail: "Create, switch or edit profiles",
      icon: Users,
      color: "#7c3aed",
      bg: "#ede9fe",
      onClick: () => onNavigate("hub"),
    },
  ];

  const activityIcon = (type) => {
    if (type === "lead") return { icon: Users, color: "#16a34a", bg: "#dcfce7" };
    if (type === "appointment") return { icon: CalendarDays, color: "#7c3aed", bg: "#ede9fe" };
    if (type === "tap") return { icon: Smartphone, color: "#16a34a", bg: "#dcfce7" };
    if (type === "device") return { icon: Zap, color: "#f97316", bg: "#ffedd5" };
    return { icon: Eye, color: "#2563eb", bg: "#dbeafe" };
  };

  if (isLoading) {
    return (
      <div ref={rootRef} className="space-y-5 animate-pulse">
        <div className={`h-20 rounded-2xl ${colors.soft}`} />
        <div className={`h-40 rounded-2xl ${colors.soft}`} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className={`h-36 rounded-2xl ${colors.soft}`} />)}
        </div>
        <div className={`h-40 rounded-2xl ${colors.soft}`} />
        <div className={`h-64 rounded-2xl ${colors.soft}`} />
      </div>
    );
  }

  const visibleProfiles = profiles.slice(0, 4);

  return (
    <div ref={rootRef} className="space-y-5 md:space-y-6">
      {/* Clean greeting area; no duplicate account or profile-status title. */}
      <section className="pt-3">
        <p className={`text-xs sm:text-sm font-semibold mb-2 ${colors.subText}`}>{dateLine}</p>
        <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${colors.pageText}`}>
          {greeting}, {firstName} <span aria-hidden="true">👋</span>
        </h1>
        <p className={`mt-1 text-sm sm:text-base ${colors.subText}`}>Here&apos;s what&apos;s happening across your Bingoo Connect account.</p>
      </section>

      {/* Multi-profile selector from the approved dashboard concept. */}
      <section className={`rounded-2xl border p-4 sm:p-5 ${colors.card}`} style={cardShadow}>
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className={`text-sm font-black ${colors.pageText}`}>Active Profile</p>
          <button type="button" onClick={() => onNavigate("hub")} className="text-xs sm:text-sm font-bold text-orange-500 flex items-center gap-1">
            View all profiles <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid lg:grid-cols-[minmax(280px,1.35fr)_minmax(0,2fr)] gap-3">
          <button
            type="button"
            onClick={() => onNavigate("workspace")}
            className={`rounded-xl border p-3 sm:p-4 flex items-center gap-3 text-left transition-colors ${isDark ? "border-white/12 hover:bg-white/5" : "border-slate-200 hover:bg-slate-50"}`}
          >
            {profile.profile_photo ? (
              <img src={profile.profile_photo} alt="" className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-black flex-shrink-0" style={{ background: profile.cover_color || "#0b2149" }}>
                {profile.display_name?.charAt(0) || "B"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 min-w-0">
                <p className={`font-black text-sm sm:text-base truncate ${colors.pageText}`}>{profile.display_name}</p>
                {user?.default_profile_id === profile.id && (
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase text-slate-500 flex-shrink-0">Default</span>
                )}
              </div>
              <p className={`text-xs truncate mt-0.5 ${colors.subText}`}>{profile.job_title || profile.company_name || "Digital Business Profile"}</p>
            </div>
            <Pencil className={`w-4 h-4 flex-shrink-0 ${colors.subText}`} />
          </button>

          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
            {visibleProfiles.filter((item) => item.id !== profile.id).slice(0, 3).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectProfile(item.id)}
                className={`rounded-xl border p-3 flex items-center gap-2.5 text-left transition-all ${isDark ? "border-white/10 hover:bg-white/5" : "border-slate-200 hover:border-orange-200 hover:bg-orange-50/30"}`}
              >
                {item.profile_photo ? (
                  <img src={item.profile_photo} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0" style={{ background: item.cover_color || "#0b2149" }}>
                    {item.display_name?.charAt(0) || "B"}
                  </div>
                )}
                <span className={`text-xs font-bold truncate ${colors.pageText}`}>{item.display_name}</span>
              </button>
            ))}

            <Link
              to="/bingoo?view=workspace&newprofile=1"
              className={`rounded-xl border border-dashed p-3 flex items-center justify-center gap-2 text-xs font-bold transition-colors ${isDark ? "border-white/15 text-white/55 hover:bg-white/5" : "border-slate-300 text-slate-600 hover:border-orange-300 hover:text-orange-600"}`}
            >
              <Plus className="w-4 h-4" /> Add Profile
            </Link>
          </div>
        </div>
      </section>

      {/* Profile score disappears automatically once the selected profile reaches 100/100. */}
      <ProfileScoreShortcut profile={profile} isDark={isDark} onNavigate={onNavigate} />

      {/* Real account-wide numbers; each card goes to its own destination. */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map((metric) => (
          <button
            key={metric.label}
            type="button"
            onClick={() => onNavigate(metric.destination)}
            className={`rounded-2xl border p-4 sm:p-5 text-left transition-all hover:-translate-y-0.5 ${colors.card}`}
            style={cardShadow}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-5" style={{ background: metric.bg }}>
              <metric.icon className="w-5 h-5" style={{ color: metric.color }} />
            </div>
            <p className={`text-xs sm:text-sm font-semibold ${colors.subText}`}>{metric.label}</p>
            <p className={`text-2xl sm:text-3xl font-black mt-1 ${colors.pageText}`}>{metric.value.toLocaleString()}</p>
            <p className={`text-[10px] font-semibold mt-1 ${colors.subText}`}>Across all profiles</p>
          </button>
        ))}
      </section>

      {/* Four core jobs only. */}
      <section className={`rounded-2xl border p-4 sm:p-5 ${colors.card}`} style={cardShadow}>
        <h2 className={`font-black text-base mb-4 ${colors.pageText}`}>Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {actions.map((action) => {
            const body = (
              <div className={`h-full rounded-xl border p-4 flex items-center gap-3 text-left transition-colors ${isDark ? "border-white/10 hover:bg-white/5" : "border-slate-200 hover:bg-slate-50"}`}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: action.bg }}>
                  <action.icon className="w-5 h-5" style={{ color: action.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`font-bold text-sm ${colors.pageText}`}>{action.label}</p>
                  <p className={`text-xs mt-0.5 ${colors.subText}`}>{action.detail}</p>
                </div>
                <ArrowRight className={`w-4 h-4 flex-shrink-0 ${colors.subText}`} />
              </div>
            );

            return action.href ? (
              <Link key={action.label} to={action.href}>{body}</Link>
            ) : (
              <button key={action.label} type="button" onClick={action.onClick}>{body}</button>
            );
          })}
        </div>
      </section>

      {/* Live account activity, newest first. Rows route to the page that owns the event. */}
      <section className={`rounded-2xl border overflow-hidden ${colors.card}`} style={cardShadow}>
        <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
          <div>
            <h2 className={`font-black text-base ${colors.pageText}`}>Recent Activity</h2>
            <p className={`text-xs mt-0.5 ${colors.subText}`}>Live activity across every profile in this account</p>
          </div>
          <button type="button" onClick={() => onNavigate("analytics")} className="text-xs sm:text-sm font-bold text-orange-500 flex items-center gap-1">
            View analytics <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {activity.length === 0 ? (
          <div className={`px-5 pb-6 text-sm ${colors.subText}`}>Your latest profile views, NFC taps, leads, appointments and device activity will appear here.</div>
        ) : (
          <div className={isDark ? "divide-y divide-white/8" : "divide-y divide-slate-100"}>
            {activity.map((item) => {
              const visual = activityIcon(item.type);
              const Icon = visual.icon;
              const row = (
                <div className={`w-full px-4 sm:px-5 py-3.5 flex items-center gap-3 text-left transition-colors ${isDark ? "hover:bg-white/[0.035]" : "hover:bg-slate-50"}`}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: visual.bg }}>
                    <Icon className="w-4 h-4" style={{ color: visual.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`font-bold text-sm truncate ${colors.pageText}`}>{item.title}</p>
                    <p className={`text-xs mt-0.5 truncate ${colors.subText}`}>{item.detail}</p>
                  </div>
                  <span className={`text-xs flex-shrink-0 ${colors.subText}`}>{relativeTime(item.at)}</span>
                  <ArrowRight className={`w-4 h-4 flex-shrink-0 ${colors.subText}`} />
                </div>
              );

              return item.href ? (
                <Link key={item.id} to={item.href}>{row}</Link>
              ) : (
                <button key={item.id} type="button" className="w-full" onClick={() => onNavigate(item.destination || "analytics")}>{row}</button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
