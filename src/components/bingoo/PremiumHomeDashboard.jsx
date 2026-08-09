import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Share2, Smartphone, CalendarDays, Users, Eye,
  Check, QrCode, Zap, Pencil, ExternalLink, ArrowRight,
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
  leads = [],
  appointments = [],
  analytics = [],
  nfcDevices = [],
  onNavigate,
  profileUrl,
  isLoading,
}) {
  const [copied, setCopied] = useState(false);
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const totalViews = analytics.filter((event) => event.event_type === "profile_view").length;
  const totalNfcTaps = analytics.filter((event) => event.event_type === "nfc_tap").length;

  const activity = useMemo(() => {
    const items = [];

    leads.forEach((lead) => {
      items.push({
        id: `lead-${lead.id}`,
        type: "lead",
        title: "New lead received",
        detail: lead.name || lead.full_name || lead.email || "A visitor shared their details",
        at: lead.created_date,
      });
    });

    appointments.forEach((appointment) => {
      items.push({
        id: `appointment-${appointment.id}`,
        type: "appointment",
        title: "New appointment booked",
        detail: appointment.customer_name || appointment.name || appointment.service_name || "Booking received",
        at: appointment.created_date || appointment.date,
      });
    });

    analytics
      .filter((event) => event.event_type === "profile_view" || event.event_type === "nfc_tap")
      .slice(-8)
      .forEach((event, index) => {
        items.push({
          id: `analytics-${event.id || index}`,
          type: event.event_type === "nfc_tap" ? "tap" : "view",
          title: event.event_type === "nfc_tap" ? "Profile opened from NFC" : "Profile viewed",
          detail: event.event_type === "nfc_tap" ? "Someone tapped one of your Bingoo devices" : "Someone visited your public profile",
          at: event.created_date || event.timestamp,
        });
      });

    nfcDevices
      .filter((device) => device.status === "active")
      .slice(-3)
      .forEach((device, index) => {
        items.push({
          id: `device-${device.id || index}`,
          type: "device",
          title: "NFC device active",
          detail: device.device_name || device.name || device.device_type || "Bingoo device",
          at: device.updated_date || device.created_date,
        });
      });

    return items
      .sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0))
      .slice(0, 4);
  }, [leads, appointments, analytics, nfcDevices]);

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
    { label: "Profile Views", value: totalViews, icon: Eye, color: "#2563eb", bg: "#dbeafe" },
    { label: "NFC Taps", value: totalNfcTaps, icon: Smartphone, color: "#16a34a", bg: "#dcfce7" },
    { label: "New Leads", value: leads.length, icon: Users, color: "#7c3aed", bg: "#ede9fe" },
    { label: "Appointments", value: appointments.length, icon: CalendarDays, color: "#f97316", bg: "#ffedd5" },
  ];

  const actions = [
    {
      label: copied ? "Copied!" : "Share Profile",
      detail: "Share your profile instantly",
      icon: copied ? Check : Share2,
      color: copied ? "#16a34a" : "#2563eb",
      bg: copied ? "#dcfce7" : "#dbeafe",
      onClick: handleShare,
    },
    {
      label: "QR Code",
      detail: "Show QR code to connect",
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
      label: "Add / Edit Profile",
      detail: "Create or update your profile",
      icon: Users,
      color: "#7c3aed",
      bg: "#ede9fe",
      onClick: () => onNavigate("workspace"),
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
      <div className="space-y-5 animate-pulse">
        <div className={`h-20 rounded-2xl ${colors.soft}`} />
        <div className={`h-32 rounded-2xl ${colors.soft}`} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className={`h-36 rounded-2xl ${colors.soft}`} />)}
        </div>
        <div className={`h-40 rounded-2xl ${colors.soft}`} />
        <div className={`h-64 rounded-2xl ${colors.soft}`} />
      </div>
    );
  }

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Greeting — derives from the visitor's actual browser time. */}
      <section className="pt-2">
        <p className={`text-xs sm:text-sm font-semibold mb-2 ${colors.subText}`}>{dateLine}</p>
        <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${colors.pageText}`}>
          {greeting}, {firstName} <span aria-hidden="true">👋</span>
        </h1>
        <p className={`mt-1 text-sm sm:text-base ${colors.subText}`}>Here&apos;s what&apos;s happening with your business today.</p>
      </section>

      {/* Active profile — the existing top dashboard selector remains the profile switcher. */}
      <section className={`rounded-2xl border p-4 sm:p-5 ${colors.card}`} style={cardShadow}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {profile.profile_photo ? (
              <img src={profile.profile_photo} alt="" className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover flex-shrink-0" />
            ) : (
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-white font-black text-xl flex-shrink-0"
                style={{ background: profile.cover_color || "#0b2149" }}
              >
                {profile.display_name?.charAt(0) || "B"}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className={`font-black text-lg truncate ${colors.pageText}`}>{profile.display_name}</h2>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wide">Active Profile</span>
              </div>
              <p className={`text-sm mt-0.5 truncate ${colors.subText}`}>{profile.job_title || profile.company_name || "Digital Business Profile"}</p>
              {profile.username && (
                <p className="text-xs font-semibold text-orange-500 mt-1 truncate">bingooconnect.com/p/{profile.username}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:flex-shrink-0">
            {profileUrl && (
              <a
                href={profileUrl}
                target="_blank"
                rel="noreferrer"
                className={`flex-1 sm:flex-none min-h-[42px] px-4 rounded-xl border flex items-center justify-center gap-2 text-sm font-bold transition-colors ${isDark ? "border-white/15 text-white hover:bg-white/5" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}
              >
                <Eye className="w-4 h-4" /> View Profile
              </a>
            )}
            <button
              type="button"
              onClick={() => onNavigate("workspace")}
              className="flex-1 sm:flex-none min-h-[42px] px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center gap-2 text-sm font-black transition-colors"
            >
              <Pencil className="w-4 h-4" /> Edit Profile
            </button>
          </div>
        </div>
      </section>

      {/* Profile quality remains useful only until it is complete; the component hides itself at 100/100. */}
      <ProfileScoreShortcut profile={profile} isDark={isDark} onNavigate={onNavigate} />

      {/* Four core numbers only. */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map((metric) => (
          <button
            key={metric.label}
            type="button"
            onClick={() => {
              if (metric.label === "New Leads") onNavigate("leads");
              else if (metric.label === "Appointments") onNavigate("appointments");
              else onNavigate("analytics");
            }}
            className={`rounded-2xl border p-4 sm:p-5 text-left transition-all hover:-translate-y-0.5 ${colors.card}`}
            style={cardShadow}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-5" style={{ background: metric.bg }}>
              <metric.icon className="w-5 h-5" style={{ color: metric.color }} />
            </div>
            <p className={`text-xs sm:text-sm font-semibold ${colors.subText}`}>{metric.label}</p>
            <p className={`text-2xl sm:text-3xl font-black mt-1 ${colors.pageText}`}>{metric.value.toLocaleString()}</p>
          </button>
        ))}
      </section>

      {/* Quick actions — only the four core jobs. */}
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

      {/* Recent activity — capped at four items to keep Home calm and spacious. */}
      <section className={`rounded-2xl border overflow-hidden ${colors.card}`} style={cardShadow}>
        <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
          <h2 className={`font-black text-base ${colors.pageText}`}>Recent Activity</h2>
          <button type="button" onClick={() => onNavigate("analytics")} className="text-xs sm:text-sm font-bold text-orange-500 flex items-center gap-1">
            View all activity <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {activity.length === 0 ? (
          <div className={`px-5 pb-6 text-sm ${colors.subText}`}>Your latest profile activity will appear here.</div>
        ) : (
          <div className={isDark ? "divide-y divide-white/8" : "divide-y divide-slate-100"}>
            {activity.map((item) => {
              const visual = activityIcon(item.type);
              const Icon = visual.icon;
              return (
                <div key={item.id} className="px-4 sm:px-5 py-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: visual.bg }}>
                    <Icon className="w-4 h-4" style={{ color: visual.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`font-bold text-sm truncate ${colors.pageText}`}>{item.title}</p>
                    <p className={`text-xs mt-0.5 truncate ${colors.subText}`}>{item.detail}</p>
                  </div>
                  <span className={`text-xs flex-shrink-0 ${colors.subText}`}>{relativeTime(item.at)}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
