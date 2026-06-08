import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const EVENT_LABELS = {
  profile_view: "Profile Views",
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

// NFC tap / QR scan event types
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

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["analytics", profileId],
    queryFn: () => base44.entities.Analytics.filter({ profile_id: profileId }),
    enabled: !!profileId,
    refetchInterval: 15000,
  });

  const { data: tapEvents = [] } = useQuery({
    queryKey: ["tap-events", profileId],
    queryFn: () => base44.entities.TapEvent.filter({ profile_id: profileId }),
    enabled: !!profileId,
    refetchInterval: 15000,
  });

  // Real-time updates for NFC taps, QR scans and analytics clicks
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

  const filtered = events.filter(e => {
    if (period === null) return true;
    if (period === 0) return new Date(e.created_at).toDateString() === new Date().toDateString();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - period);
    return new Date(e.created_at) >= cutoff;
  });

  const counts = {};
  filtered.forEach(e => { counts[e.event_type] = (counts[e.event_type] || 0) + 1; });

  const stats = [
    { key: "profile_view", label: "Profile Views", color: "bg-blue-100 text-blue-700", icon: "👁️" },
    { key: "whatsapp_click", label: "WhatsApp", color: "bg-green-100 text-green-700", icon: "💬" },
    { key: "phone_click", label: "Phone Clicks", color: "bg-purple-100 text-purple-700", icon: "📞" },
    { key: "email_click", label: "Email Clicks", color: "bg-orange-100 text-orange-700", icon: "📧" },
    { key: "save_contact_click", label: "Saves", color: "bg-slate-100 text-slate-700", icon: "💾" },
    { key: "website_click", label: "Website", color: "bg-indigo-100 text-indigo-700", icon: "🌐" },
  ];

  const totalTaps = tapEvents.filter(e => e.event_type === "tap").length;
  const filteredTaps = tapEvents.filter(e => {
    if (period === null) return true;
    if (period === 0) return new Date(e.tapped_at).toDateString() === new Date().toDateString();
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - period);
    return new Date(e.tapped_at) >= cutoff;
  });

  // Group by day for chart (last 7 days)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const chartData = last7.map(date => ({
    date: date.slice(5),
    views: events.filter(e => e.created_at?.startsWith(date) && e.event_type === "profile_view").length,
    clicks: events.filter(e => e.created_at?.startsWith(date) && e.event_type !== "profile_view").length,
  }));

  if (isLoading) return <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex gap-2 flex-wrap">
        {PERIODS.map(p => (
          <button
            key={p.label}
            onClick={() => setPeriod(p.days)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${period === p.days ? "bg-blue-600 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            {p.label}
          </button>
        ))}
        <span className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-3 py-2 rounded-xl border border-green-200">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live
        </span>
      </div>

      {/* NFC / QR Tap Stats — highlighted */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-2xl p-5 text-white">
        <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-3">📡 NFC Taps & QR Scans</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "NFC Taps", value: filteredTaps.filter(e => e.event_type === "tap").length, icon: "📲" },
            { label: "Link Clicks", value: filteredTaps.filter(e => e.event_type === "link_click").length, icon: "🔗" },
            { label: "WhatsApp", value: filteredTaps.filter(e => e.event_type === "whatsapp_click").length, icon: "💬" },
            { label: "Total Interactions", value: filteredTaps.length, icon: "⚡" },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-xl p-3">
              <p className="text-lg mb-0.5">{s.icon}</p>
              <p className="text-2xl font-black">{s.value}</p>
              <p className="text-xs opacity-70 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Profile interaction stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.key} className={`rounded-2xl p-4 ${s.color}`}>
            <div className="flex items-center gap-2 mb-1">
              <span>{s.icon}</span>
              <p className="text-xs font-medium opacity-70">{s.label}</p>
            </div>
            <p className="text-3xl font-black">{counts[s.key] || 0}</p>
          </div>
        ))}
      </div>

      {/* Social breakdown */}
      {(counts.instagram_click || counts.facebook_click || counts.tiktok_click || counts.linkedin_click) ? (
        <div className="bg-white rounded-2xl border p-5">
          <h3 className="font-bold text-slate-800 mb-3 text-sm">Social Media Clicks</h3>
          <div className="space-y-2">
            {["instagram_click", "facebook_click", "tiktok_click", "linkedin_click", "youtube_click"].map(key => counts[key] ? (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{EVENT_LABELS[key]}</span>
                <span className="font-bold text-slate-900">{counts[key]}</span>
              </div>
            ) : null)}
          </div>
        </div>
      ) : null}

      {/* Chart */}
      <div className="bg-white rounded-2xl border p-5">
        <h3 className="font-bold text-slate-800 mb-4 text-sm">Last 7 Days Activity</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="views" fill="#2563eb" radius={[4, 4, 0, 0]} name="Profile Views" />
            <Bar dataKey="clicks" fill="#93c5fd" radius={[4, 4, 0, 0]} name="Link Clicks" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent NFC activity feed */}
      {tapEvents.length > 0 && (
        <div className="bg-white rounded-2xl border p-5">
          <h3 className="font-bold text-slate-800 mb-3 text-sm flex items-center gap-2">
            📲 Recent NFC / QR Activity
            <span className="text-xs font-normal text-slate-400">(most recent first)</span>
          </h3>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {tapEvents.slice(0, 20).map(e => (
              <div key={e.id} className="flex items-center justify-between text-sm py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span>{e.event_type === "tap" ? "📲" : e.event_type === "whatsapp_click" ? "💬" : "🔗"}</span>
                  <span className="font-semibold text-slate-700 capitalize">{TAP_EVENT_LABELS[e.event_type] || e.event_type}</span>
                  {e.country && <span className="text-slate-400 text-xs">· {e.country}</span>}
                  {e.device && <span className="text-slate-400 text-xs">· {e.device}</span>}
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0">{e.tapped_at ? new Date(e.tapped_at).toLocaleString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}