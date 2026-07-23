// Capture-only mirror of the real AnalyticsPanel with fictional demo events,
// shown under a fictional Professional-plan capture context. No DB calls.
// Reuses the same recharts-based layout and event taxonomy as production.
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Activity } from "lucide-react";
import { demoAnalytics } from "@/lib/playstoreCaptureData";

const isDark = true;
const headText = "text-white";
const mutedText = "text-white/40";
const cardBg = "rgba(255,255,255,0.05)";
const cardBorder = "rgba(255,255,255,0.08)";
const rowBorder = "rgba(255,255,255,0.06)";

const EVENT_LABELS = {
  profile_view: "Profile Views", nfc_tap: "NFC Taps", qr_scan: "QR Scans",
  whatsapp_click: "WhatsApp", phone_click: "Phone Calls", email_click: "Email",
  instagram_click: "Instagram", facebook_click: "Facebook", tiktok_click: "TikTok",
  linkedin_click: "LinkedIn", youtube_click: "YouTube", website_click: "Website",
  location_click: "Location", payment_click: "Payment", save_contact_click: "Save Contact",
  lead_submitted: "Leads", appointment_booked: "Bookings",
  prospect_popup_shown: "Request Info", request_info_click: "Request Info",
};
const EVENT_ICONS = {
  profile_view: "👁️", nfc_tap: "📲", qr_scan: "🔲", whatsapp_click: "💬", phone_click: "📞",
  email_click: "📧", instagram_click: "📸", facebook_click: "👍", tiktok_click: "🎵",
  linkedin_click: "💼", youtube_click: "▶️", website_click: "🌐", location_click: "📍",
  payment_click: "💳", save_contact_click: "💾", lead_submitted: "⭐", appointment_booked: "📅",
  prospect_popup_shown: "🙋", request_info_click: "🙋",
};

const PERIODS = [
  { label: "Today", days: 0 }, { label: "7 Days", days: 7 },
  { label: "30 Days", days: 30 }, { label: "All Time", days: null },
];

export default function CaptureAnalytics() {
  const [period, setPeriod] = useState(7);
  const events = demoAnalytics;
  const eventDate = (e) => e.created_at || e.created_date;

  const filtered = events.filter(e => {
    const d = eventDate(e);
    if (!d) return false;
    if (period === null) return true;
    if (period === 0) return new Date(d).toDateString() === new Date().toDateString();
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - period);
    return new Date(d) >= cutoff;
  });

  const counts = {};
  filtered.forEach(e => { counts[e.event_type] = (counts[e.event_type] || 0) + 1; });

  const stats = [
    { key: "profile_view", label: "Profile Views", color: "bg-blue-500/20 text-blue-300", icon: "👁️" },
    { key: "nfc_tap", label: "NFC Taps", color: "bg-violet-500/20 text-violet-300", icon: "📲" },
    { key: "qr_scan", label: "QR Scans", color: "bg-cyan-500/20 text-cyan-300", icon: "🔲" },
    { key: "whatsapp_click", label: "WhatsApp", color: "bg-green-500/20 text-green-300", icon: "💬" },
    { key: "phone_click", label: "Phone Clicks", color: "bg-purple-500/20 text-purple-300", icon: "📞" },
    { key: "email_click", label: "Email Clicks", color: "bg-orange-500/20 text-orange-300", icon: "📧" },
    { key: "save_contact_click", label: "Saves", color: "bg-white/10 text-white/60", icon: "💾" },
    { key: "website_click", label: "Website", color: "bg-indigo-500/20 text-indigo-300", icon: "🌐" },
    { key: "lead_submitted", label: "Leads", color: "bg-amber-500/20 text-amber-300", icon: "⭐" },
    { key: "appointment_booked", label: "Bookings", color: "bg-teal-500/20 text-teal-300", icon: "📅" },
    { key: "prospect_popup_shown", label: "Request Info", color: "bg-pink-500/20 text-pink-300", icon: "🙋" },
  ];

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d.toISOString().split("T")[0];
  });
  const chartData = last7.map(date => ({
    date: date.slice(5),
    views: events.filter(e => { const d = eventDate(e); return d?.startsWith(date) && e.event_type === "profile_view"; }).length,
    clicks: events.filter(e => { const d = eventDate(e); return d?.startsWith(date) && e.event_type !== "profile_view"; }).length,
  }));

  return (
    <div className="space-y-6">
      {/* Plan context — analytics is a Professional feature */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full text-white" style={{ background: "#f97316" }}>Professional</span>
        <span className={`text-xs font-semibold ${mutedText}`}>Analytics</span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border text-green-400 bg-green-500/10 border-green-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live
        </span>
      </div>

      <div className="flex gap-2 flex-wrap">
        {PERIODS.map(p => (
          <button key={p.label} type="button"
            className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold transition-all ${period === p.days ? "bg-blue-600 text-white shadow-md" : "bg-white/8 text-white/50"}`}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-2xl p-4 sm:p-5 text-white">
        <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-3">📡 NFC Taps &amp; QR Scans</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "NFC Taps", value: filtered.filter(e => e.event_type === "nfc_tap").length, icon: "📲" },
            { label: "QR Scans", value: filtered.filter(e => e.event_type === "qr_scan").length, icon: "🔲" },
            { label: "WhatsApp", value: filtered.filter(e => e.event_type === "whatsapp_click").length, icon: "💬" },
            { label: "Total Interactions", value: filtered.length, icon: "⚡" },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-xl p-3">
              <p className="text-lg mb-0.5">{s.icon}</p>
              <p className="text-2xl font-black">{s.value}</p>
              <p className="text-xs opacity-70 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

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

      <div className="rounded-2xl p-4 sm:p-5" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
        <h3 className={`font-bold mb-4 text-sm ${headText}`}>Last 7 Days Activity</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData}>
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }} />
            <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }} allowDecimals={false} />
            <Tooltip contentStyle={{ background: "#1e2538", border: `1px solid ${cardBorder}`, borderRadius: 8, color: "#fff" }} />
            <Bar dataKey="views" fill="#2563eb" radius={[4, 4, 0, 0]} name="Profile Views" />
            <Bar dataKey="clicks" fill="#60a5fa" radius={[4, 4, 0, 0]} name="Link Clicks" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl p-4 sm:p-5" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
        <h3 className={`font-bold mb-3 text-sm flex items-center gap-2 ${headText}`}>
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Recent Activity
          <span className={`text-xs font-normal ${mutedText}`}>(most recent first · {filtered.length} total)</span>
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
          {[...filtered].sort((a, b) => new Date(eventDate(b)) - new Date(eventDate(a))).slice(0, 12).map(e => (
            <div key={e.id} className="flex items-center justify-between text-sm py-2" style={{ borderBottom: `1px solid ${rowBorder}` }}>
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex-shrink-0">{EVENT_ICONS[e.event_type] || "⚡"}</span>
                <span className="font-semibold truncate text-white/70">{EVENT_LABELS[e.event_type] || e.event_type?.replace(/_/g, " ")}</span>
                {e.visitor_device && <span className={`text-xs flex-shrink-0 ${mutedText}`}>· {e.visitor_device}</span>}
              </div>
              <span className={`text-xs flex-shrink-0 ${mutedText}`}>{eventDate(e) ? new Date(eventDate(e)).toLocaleString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}