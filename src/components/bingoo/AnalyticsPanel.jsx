import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useBingooTheme } from "@/hooks/useBingooTheme";
import { Activity } from "lucide-react";

const EVENT_LABELS = {
  profile_view: "Profile Views",
  nfc_tap: "NFC Taps",
  qr_scan: "QR Scans",
  whatsapp_click: "WhatsApp",
  phone_click: "Phone Calls",
  email_click: "Email",
  instagram_click: "Instagram",
  facebook_click: "Facebook",
  tiktok_click: "TikTok",
  linkedin_click: "LinkedIn",
  youtube_click: "YouTube",
  website_click: "Website",
  location_click: "Location",
  payment_click: "Payment",
  save_contact_click: "Save Contact",
};

const TAP_EVENT_LABELS = {
  tap: "NFC Taps",
  link_click: "Link Clicks",
  whatsapp_click: "WhatsApp (NFC)",
  email_click: "Email (NFC)",
  phone_click: "Phone (NFC)",
};

const PERIODS = [
  { label: "Today", days: 0 },
  { label: "7 Days", days: 7 },
  { label: "30 Days", days: 30 },
  { label: "All Time", days: null },
];

export default function AnalyticsPanel({ profileId }) {
  const [period, setPeriod] = useState(7);
  const qc = useQueryClient();
  const { isDark } = useBingooTheme();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["analytics", profileId],
    queryFn: () => base44.entities.Analytics.filter({ profile_id: profileId }, '-created_date', 500),
    enabled: !!profileId,
    refetchInterval: 15000,
  });

  const { data: tapEvents = [] } = useQuery({
    queryKey: ["tap-events", profileId],
    queryFn: () => base44.entities.TapEvent.filter({ profile_id: profileId }, '-created_date', 500),
    enabled: !!profileId,
    refetchInterval: 15000,
  });

  useEffect(() => {
    if (!profileId) return;
    const unsubAnalytics = base44.entities.Analytics.subscribe((event) => {
      if (event.data?.profile_id === profileId) qc.invalidateQueries({ queryKey: ["analytics", profileId] });
    });
    const unsubTaps = base44.entities.TapEvent.subscribe((event) => {
      if (event.data?.profile_id === profileId) qc.invalidateQueries({ queryKey: ["tap-events", profileId] });
    });
    return () => { unsubAnalytics(); unsubTaps(); };
  }, [profileId]);

  // Theme tokens
  const cardBg = isDark ? "rgba(255,255,255,0.05)" : "#ffffff";
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const headText = isDark ? "text-white" : "text-slate-800";
  const mutedText = isDark ? "text-white/40" : "text-slate-400";
  const rowBorder = isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9";
  const rowText = isDark ? "text-white/70" : "text-slate-600";
  const rowTextBold = isDark ? "text-white" : "text-slate-900";

  const eventDate = (e) => e.created_at || e.created_date;
  const filtered = events.filter(e => {
    const d = eventDate(e);
    if (!d) return false;
    if (period === null) return true;
    if (period === 0) return new Date(d).toDateString() === new Date().toDateString();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - period);
    return new Date(d) >= cutoff;
  });

  const counts = {};
  filtered.forEach(e => { counts[e.event_type] = (counts[e.event_type] || 0) + 1; });

  const stats = [
    { key: "profile_view",      label: "Profile Views",  color: isDark ? "bg-blue-500/20 text-blue-300"    : "bg-blue-100 text-blue-700",    icon: "👁️" },
    { key: "nfc_tap",           label: "NFC Taps",       color: isDark ? "bg-violet-500/20 text-violet-300": "bg-violet-100 text-violet-700", icon: "📲" },
    { key: "qr_scan",           label: "QR Scans",       color: isDark ? "bg-cyan-500/20 text-cyan-300"    : "bg-cyan-100 text-cyan-700",    icon: "🔲" },
    { key: "whatsapp_click",    label: "WhatsApp",       color: isDark ? "bg-green-500/20 text-green-300"  : "bg-green-100 text-green-700",  icon: "💬" },
    { key: "phone_click",       label: "Phone Clicks",   color: isDark ? "bg-purple-500/20 text-purple-300": "bg-purple-100 text-purple-700",icon: "📞" },
    { key: "email_click",       label: "Email Clicks",   color: isDark ? "bg-orange-500/20 text-orange-300": "bg-orange-100 text-orange-700",icon: "📧" },
    { key: "save_contact_click",label: "Saves",          color: isDark ? "bg-white/10 text-white/60"       : "bg-slate-100 text-slate-700",  icon: "💾" },
    { key: "website_click",     label: "Website",        color: isDark ? "bg-indigo-500/20 text-indigo-300": "bg-indigo-100 text-indigo-700",icon: "🌐" },
    { key: "lead_submitted",    label: "Leads",          color: isDark ? "bg-amber-500/20 text-amber-300"  : "bg-amber-100 text-amber-700",  icon: "⭐" },
    { key: "appointment_booked",label: "Bookings",       color: isDark ? "bg-teal-500/20 text-teal-300"    : "bg-teal-100 text-teal-700",    icon: "📅" },
  ];

  const filteredTaps = tapEvents.filter(e => {
    const d = e.tapped_at || e.created_date;
    if (!d) return false;
    if (period === null) return true;
    if (period === 0) return new Date(d).toDateString() === new Date().toDateString();
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - period);
    return new Date(d) >= cutoff;
  });

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const chartData = last7.map(date => ({
    date: date.slice(5),
    views: events.filter(e => { const d = eventDate(e); return d?.startsWith(date) && e.event_type === "profile_view"; }).length,
    clicks: events.filter(e => { const d = eventDate(e); return d?.startsWith(date) && e.event_type !== "profile_view"; }).length,
  }));

  const socialKeys = ["instagram_click", "facebook_click", "tiktok_click", "linkedin_click", "youtube_click"];
  const hasSocial = socialKeys.some(k => counts[k]);

  if (isLoading) return <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  if (!profileId) return (
    <div className="text-center py-20">
      <Activity className={`w-12 h-12 mx-auto mb-3 ${isDark ? "text-white/10" : "text-slate-200"}`} />
      <p className={`font-semibold ${isDark ? "text-white/40" : "text-slate-500"}`}>Create a profile first to see analytics.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex gap-2 flex-wrap">
        {PERIODS.map(p => (
          <button key={p.label} onClick={() => setPeriod(p.days)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              period === p.days
                ? "bg-blue-600 text-white shadow-md"
                : isDark ? "bg-white/8 text-white/50 hover:bg-white/12 hover:text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}>
            {p.label}
          </button>
        ))}
        <span className={`ml-auto flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border ${isDark ? "text-green-400 bg-green-500/10 border-green-500/20" : "text-green-600 bg-green-50 border-green-200"}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live
        </span>
      </div>

      {/* NFC/QR block — always dark gradient, readable */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-2xl p-5 text-white">
        <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-3">📡 NFC Taps & QR Scans</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "NFC Taps",          value: filteredTaps.filter(e => e.event_type === "tap").length,           icon: "📲" },
            { label: "Link Clicks",       value: filteredTaps.filter(e => e.event_type === "link_click").length,    icon: "🔗" },
            { label: "WhatsApp",          value: filteredTaps.filter(e => e.event_type === "whatsapp_click").length,icon: "💬" },
            { label: "Total Interactions",value: filteredTaps.length,                                               icon: "⚡" },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-xl p-3">
              <p className="text-lg mb-0.5">{s.icon}</p>
              <p className="text-2xl font-black">{s.value}</p>
              <p className="text-xs opacity-70 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 rounded-2xl" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
          <Activity className={`w-10 h-10 mx-auto mb-2 ${isDark ? "text-white/10" : "text-slate-200"}`} />
          <p className={`font-semibold ${isDark ? "text-white/40" : "text-slate-500"}`}>No analytics data yet.</p>
          <p className={`text-sm mt-1 ${mutedText}`}>Share your profile to start collecting data.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {stats.map(s => (
            <div key={s.key} className={`rounded-2xl p-4 ${s.color}`}>
              <div className="flex items-center gap-2 mb-1">
                <span>{s.icon}</span>
                <p className="text-xs font-medium opacity-80">{s.label}</p>
              </div>
              <p className="text-3xl font-black">{counts[s.key] || 0}</p>
            </div>
          ))}
        </div>
      )}

      {/* Social clicks */}
      {hasSocial && (
        <div className="rounded-2xl p-5" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
          <h3 className={`font-bold mb-3 text-sm ${headText}`}>Social Media Clicks</h3>
          <div className="space-y-2">
            {socialKeys.map(key => counts[key] ? (
              <div key={key} className="flex items-center justify-between">
                <span className={`text-sm ${rowText}`}>{EVENT_LABELS[key]}</span>
                <span className={`font-bold ${rowTextBold}`}>{counts[key]}</span>
              </div>
            ) : null)}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="rounded-2xl p-5" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
        <h3 className={`font-bold mb-4 text-sm ${headText}`}>Last 7 Days Activity</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData}>
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: isDark ? "rgba(255,255,255,0.4)" : "#94a3b8" }} />
            <YAxis tick={{ fontSize: 11, fill: isDark ? "rgba(255,255,255,0.4)" : "#94a3b8" }} allowDecimals={false} />
            <Tooltip contentStyle={{ background: isDark ? "#1e2538" : "#fff", border: `1px solid ${cardBorder}`, borderRadius: 8, color: isDark ? "#fff" : "#1e293b" }} />
            <Bar dataKey="views" fill="#2563eb" radius={[4, 4, 0, 0]} name="Profile Views" />
            <Bar dataKey="clicks" fill={isDark ? "#60a5fa" : "#93c5fd"} radius={[4, 4, 0, 0]} name="Link Clicks" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent NFC activity */}
      {tapEvents.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
          <h3 className={`font-bold mb-3 text-sm flex items-center gap-2 ${headText}`}>
            📲 Recent NFC / QR Activity
            <span className={`text-xs font-normal ${mutedText}`}>(most recent first)</span>
          </h3>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {[...tapEvents].sort((a, b) => new Date(b.tapped_at || b.created_date) - new Date(a.tapped_at || a.created_date)).slice(0, 20).map(e => (
              <div key={e.id} className="flex items-center justify-between text-sm py-2" style={{ borderBottom: `1px solid ${rowBorder}` }}>
                <div className="flex items-center gap-2">
                  <span>{e.event_type === "tap" ? "📲" : e.event_type === "whatsapp_click" ? "💬" : "🔗"}</span>
                  <span className={`font-semibold capitalize ${isDark ? "text-white/70" : "text-slate-700"}`}>{TAP_EVENT_LABELS[e.event_type] || e.event_type}</span>
                  {e.country && <span className={`text-xs ${mutedText}`}>· {e.country}</span>}
                  {e.device && <span className={`text-xs ${mutedText}`}>· {e.device}</span>}
                </div>
                <span className={`text-xs flex-shrink-0 ${mutedText}`}>{e.tapped_at ? new Date(e.tapped_at).toLocaleString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : (e.created_date ? new Date(e.created_date).toLocaleString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "")}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}