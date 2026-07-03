import { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Bell, X, CalendarDays, Star, Smartphone, AlertTriangle, CheckCircle, CreditCard, ShieldAlert, RefreshCw } from "lucide-react";
import { FIREBASE_NOTIFICATIONS_ENABLED } from "@/lib/featureFlags";
import { useFirestoreNotifications } from "@/hooks/useFirestoreNotifications";
// Note: firebase.js uses dynamic imports internally — no static firebase/* imports here.

const EVENT_ICONS = {
  new_lead: Star,
  new_appointment: CalendarDays,
  appointment_confirmed: CheckCircle,
  appointment_cancelled: AlertTriangle,
  appointment_rescheduled: CalendarDays,
  nfc_activated: Smartphone,
  lost_device_reported: AlertTriangle,
  new_review: Star,
  new_contact: Star,
  subscription_created: CreditCard,
  subscription_updated: CreditCard,
  subscription_canceled: CreditCard,
  payment_failed: AlertTriangle,
  security_alert: ShieldAlert,
};

const EVENT_COLORS = {
  new_lead: { dark: "bg-amber-500/20 text-amber-400", light: "bg-amber-100 text-amber-600" },
  new_appointment: { dark: "bg-green-500/20 text-green-400", light: "bg-green-100 text-green-600" },
  appointment_confirmed: { dark: "bg-green-500/20 text-green-400", light: "bg-green-100 text-green-600" },
  appointment_cancelled: { dark: "bg-red-500/20 text-red-400", light: "bg-red-100 text-red-600" },
  appointment_rescheduled: { dark: "bg-blue-500/20 text-blue-400", light: "bg-blue-100 text-blue-600" },
  nfc_activated: { dark: "bg-purple-500/20 text-purple-400", light: "bg-purple-100 text-purple-600" },
  lost_device_reported: { dark: "bg-red-500/20 text-red-400", light: "bg-red-100 text-red-600" },
  subscription_created: { dark: "bg-blue-500/20 text-blue-400", light: "bg-blue-100 text-blue-600" },
  subscription_updated: { dark: "bg-blue-500/20 text-blue-400", light: "bg-blue-100 text-blue-600" },
  subscription_canceled: { dark: "bg-slate-500/20 text-slate-400", light: "bg-slate-100 text-slate-600" },
  payment_failed: { dark: "bg-red-500/20 text-red-400", light: "bg-red-100 text-red-600" },
  security_alert: { dark: "bg-red-500/20 text-red-400", light: "bg-red-100 text-red-600" },
};

export default function NotificationCenter({ userId, isDark }) {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();

  // ── Base44 source (always fetched; is the default and fallback) ──
  const { data: base44Notifications = [], isLoading, isError } = useQuery({
    queryKey: ["bingoo-notifications", userId],
    queryFn: () => base44.entities.BingooNotification.filter({ user_id: userId }, "-created_date", 50),
    enabled: !!userId,
    refetchInterval: 30000,
    staleTime: 0,
  });

  // Base44 real-time subscription (always active)
  useEffect(() => {
    if (!userId) return;
    const unsub = base44.entities.BingooNotification.subscribe((event) => {
      if (event.data?.user_id === userId) {
        qc.invalidateQueries({ queryKey: ["bingoo-notifications", userId] });
      }
    });
    return () => unsub();
  }, [userId]);

  // ── Firestore shadow source (POC — only used when flag is true) ──
  // Hook always runs (React rules) but returns empty array when flag is false or Firebase not configured.
  const { notifications: firestoreNotifications, error: firestoreError } = useFirestoreNotifications(
    FIREBASE_NOTIFICATIONS_ENABLED ? userId : null
  );

  // ── Active source selection ──
  // If flag is true AND Firestore returned data without error, use Firestore.
  // Otherwise always fall back to Base44.
  const notifications =
    FIREBASE_NOTIFICATIONS_ENABLED && !firestoreError && firestoreNotifications.length > 0
      ? firestoreNotifications
      : base44Notifications;

  const markReadMutation = useMutation({
    // markRead always writes to Base44 regardless of read source.
    // Firestore mark-read is out of scope for this POC.
    mutationFn: (id) => base44.entities.BingooNotification.update(id, { is_read: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bingoo-notifications", userId] }),
  });

  const markAllRead = async () => {
    const unread = base44Notifications.filter(n => !n.is_read);
    await Promise.all(unread.map(n => base44.entities.BingooNotification.update(n.id, { is_read: true })));
    qc.invalidateQueries({ queryKey: ["bingoo-notifications", userId] });
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleClick = (n) => {
    if (!n.is_read) markReadMutation.mutate(n.id);
    setOpen(false);
    if (n.action_url) {
      // In-app navigation preserves session/state and supports deep links like
      // /bingoo?view=leads&profileId=...&leadId=... or /billing?subscriptionId=...
      navigate(n.action_url);
    }
  };

  const panelBg = isDark ? "#0f1628" : "#ffffff";
  const panelBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/40" : "text-slate-400";

  if (!userId) return null;

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
              <div className="flex items-center gap-2">
                <h3 className={`font-black text-sm ${headText}`}>Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className={`text-xs font-semibold ${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-500"}`}>
                    Mark all read
                  </button>
                )}
                <button onClick={handleClose} className={`p-1 rounded-lg ${isDark ? "hover:bg-white/10 text-white/40" : "hover:bg-slate-100 text-slate-400"}`}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div className="max-h-96 overflow-y-auto">
              {isLoading && notifications.length === 0 ? (
                <div className={`text-center py-10 ${mutedText}`}>
                  <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin opacity-40" />
                  <p className="text-sm font-medium">Loading…</p>
                </div>
              ) : isError && notifications.length === 0 ? (
                <div className={`text-center py-10 ${mutedText}`}>
                  <AlertTriangle className="w-7 h-7 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">Couldn't load notifications</p>
                  <button onClick={() => qc.invalidateQueries({ queryKey: ["bingoo-notifications", userId] })}
                    className={`text-xs mt-1 font-semibold underline ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                    Retry
                  </button>
                </div>
              ) : notifications.length === 0 ? (
                <div className={`text-center py-10 ${mutedText}`}>
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">No notifications yet</p>
                  <p className="text-xs mt-0.5">New leads and bookings will appear here</p>
                </div>
              ) : (
                notifications.map(n => {
                  const isUnread = !n.is_read;
                  const Icon = EVENT_ICONS[n.event_type] || Bell;
                  const colorCls = (EVENT_COLORS[n.event_type] || EVENT_COLORS.new_lead)[isDark ? "dark" : "light"];
                  return (
                    <button
                      key={n.id}
                      onClick={() => handleClick(n)}
                      className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors border-b ${isDark ? "border-white/5 hover:bg-white/5" : "border-slate-50 hover:bg-slate-50"}`}
                      style={isUnread ? { background: isDark ? "rgba(59,130,246,0.06)" : "rgba(59,130,246,0.04)" } : {}}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${colorCls}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold leading-snug ${headText}`}>{n.title}</p>
                        {n.message && <p className={`text-xs mt-0.5 truncate ${mutedText}`}>{n.message}</p>}
                        <p className={`text-[10px] mt-1 ${mutedText}`}>
                          {n.created_date ? new Date(n.created_date).toLocaleString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                        </p>
                      </div>
                      {isUnread && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>

            {notifications.length > 0 && (
              <div className={`px-4 py-2 text-center border-t ${isDark ? "border-white/8" : "border-slate-100"}`}>
                <p className={`text-xs ${mutedText}`}>{notifications.length} total notification{notifications.length !== 1 ? "s" : ""}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}