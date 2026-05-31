import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, MousePointer, Eye } from "lucide-react";

export default function AnalyticsPanel({ profileId }) {
  const { data: events = [] } = useQuery({
    queryKey: ["tap-events", profileId],
    queryFn: () => base44.entities.TapEvent.filter({ profile_id: profileId }),
    enabled: !!profileId,
    refetchInterval: 30000,
  });

  const taps = events.filter(e => e.event_type === "tap").length;
  const linkClicks = events.filter(e => e.event_type === "link_click").length;
  const whatsappClicks = events.filter(e => e.event_type === "whatsapp_click").length;
  const emailClicks = events.filter(e => e.event_type === "email_click").length;

  // Group taps by day (last 7 days)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const byDay = last7.map(date => ({
    date: date.slice(5),
    taps: events.filter(e => e.tapped_at?.startsWith(date) && e.event_type === "tap").length,
    clicks: events.filter(e => e.tapped_at?.startsWith(date) && e.event_type !== "tap").length,
  }));

  const stats = [
    { label: "Total Taps", value: taps, icon: Eye, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Link Clicks", value: linkClicks, icon: MousePointer, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "WhatsApp", value: whatsappClicks, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
    { label: "Email", value: emailClicks, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border p-6">
        <h3 className="font-bold text-slate-800 mb-4">Last 7 Days</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={byDay}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="taps" fill="#6366f1" radius={[4, 4, 0, 0]} name="Taps" />
            <Bar dataKey="clicks" fill="#a78bfa" radius={[4, 4, 0, 0]} name="Clicks" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}