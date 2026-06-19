import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Bell, X, CalendarDays, Star, Check } from "lucide-react";

const NOTIF_SEEN_KEY = "bingoo_notif_seen_ids";

function getSeenIds() {
  try { return new Set(JSON.parse(localStorage.getItem(NOTIF_SEEN_KEY) || "[]")); } catch { return new Set(); }
}
function markSeen(ids) {
  const seen = getSeenIds();
  ids.forEach(id => seen.add(id));
  localStorage.setItem(NOTIF_SEEN_KEY, JSON.stringify([...seen].slice(-200)));
}

export default function NotificationCenter({ profileId, isDark }) {
  const [open, setOpen] = useState(false);
  const [seenIds, setSeenIds] = useState(getSeenIds);
  const qc = useQueryClient();

  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments-notif", profileId],
    queryFn: () => base44.entities.Appointment.filter({ profile_id: profileId }, "-created_date", 30),
    enabled: !!profileId,
    refetchInterval: 30000,
  });
  const { data: leads = [] } = useQuery({
    queryKey: ["leads-notif", profileId],
    queryFn: () => base44.entities.Lead.filter({ profile_id: profileId }, "-created_date", 30),
    enabled: !!profileId,
    refetchInterval: 30000,
  });

  // Real-time updates
  useEffect(() => {
    if (!profileId) return;
    const unsubA = base44.entities.Appointment.subscribe(e => {
      if (e.data?.profile_id === profileId) qc.invalidateQueries({ queryKey: ["appointments-notif", profileId] });
    });
    const unsubL = base44.entities.Lead.subscribe(e => {
      if (e.data?.profile_id === profileId) qc.invalidateQueries({ queryKey: ["leads-notif", profileId] });
    });
    return () => { unsubA(); unsubL(); };
  }, [profileId]);

  const now = Date.now();
  const within48h = (d) => d && (now - new Date(d).getTime()) < 48 * 60 * 60 * 1000;

  // Build notification list from recent items
  const notifications = [
    ...appointments.filter(a => within48h(a.created_date)).map(a => ({
      id: `appt-${a.id}`,
      type: "appointment",
      title: `New booking from ${a.visitor_name}`,
      subtitle: `${a.date || ""} ${a.time_slot || ""}${a.service_name ? ` · ${a.service_name}` : ""}`,
      time: a.created_date,
      status: a.status,
    })),
    ...leads.filter(l => within48h(l.created_date)).map(l => ({
      id: `lead-${l.id}`,
      type: "lead",
      title: `New lead from ${l.name || "Anonymous"}`,
      subtitle: l.phone || l.email || "No contact info",
      time: l.created_date,
    })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time));

  const unread = notifications.filter(n => !seenIds.has(n.id));
  const unreadCount = unread.length;

  const handleOpen = () => {
    setOpen(true);
  };

  const handleMarkAllRead = () => {
    const ids = notifications.map(n => n.id);
    markSeen(ids);
    setSeenIds(getSeenIds());
  };

  const handleClose = () => {
    // Mark all as seen when closing
    const ids = notifications.map(n => n.id);
    markSeen(ids);
    setSeenIds(getSeenIds());
    setOpen(false);
  };

  const panelBg = isDark ? "#0f1628" : "#ffffff";
  const panelBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/40" : "text-slate-400";
  const itemBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)";

  return (
    <div className="relative">
      <button
        onClick={open ? handleClose : handleOpen}
        className={`relative p-2 rounded-xl transition-colors ${isDark ? "hover:bg-white/10 text-white/50 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-700"}`}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={handleClose} />
          <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-2xl shadow-2xl overflow-hidden"
            style={{ background: panelBg, border: `1px solid ${panelBorder}` }}>
            {/* Header */}
            <div className={`px-4 py-3 flex items-center justify-between border-b ${isDark ? "border-white/8" : "border-slate-100"}`}>
              <h3 className={`font-black text-sm ${headText}`}>Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className={`text-xs font-semibold ${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-500"}`}>
                    Mark all read
                  </button>
                )}
                <button onClick={handleClose} className={`p-1 rounded-lg ${isDark ? "hover:bg-white/10 text-white/40" : "hover:bg-slate-100 text-slate-400"}`}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className={`text-center py-10 ${mutedText}`}>
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">No notifications yet</p>
                  <p className="text-xs mt-0.5">New bookings and leads will appear here</p>
                </div>
              ) : (
                notifications.map(n => {
                  const isUnread = !seenIds.has(n.id);
                  return (
                    <div key={n.id} className={`px-4 py-3 flex items-start gap-3 transition-colors border-b ${isDark ? "border-white/5 hover:bg-white/4" : "border-slate-50 hover:bg-slate-50"}`}
                      style={isUnread ? { background: isDark ? "rgba(59,130,246,0.06)" : "rgba(59,130,246,0.04)" } : {}}>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${n.type === "appointment" ? (isDark ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-600") : (isDark ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-600")}`}>
                        {n.type === "appointment" ? <CalendarDays className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold leading-snug ${headText}`}>{n.title}</p>
                        <p className={`text-xs mt-0.5 truncate ${mutedText}`}>{n.subtitle}</p>
                        <p className={`text-[10px] mt-1 ${mutedText}`}>{n.time ? new Date(n.time).toLocaleString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}</p>
                      </div>
                      {isUnread && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className={`px-4 py-2 text-center border-t ${isDark ? "border-white/8" : "border-slate-100"}`}>
                <p className={`text-xs ${mutedText}`}>Showing last 48 hours</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}