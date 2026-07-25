import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Bell, X, CalendarDays, Star, Smartphone, AlertTriangle, CheckCircle, CreditCard, ShieldAlert, RefreshCw } from "lucide-react";

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

  const { data: notifications = [], isLoading, isError } = useQuery({
    queryKey: ["bingoo-notifications", userId],
    queryFn: () => base44.entities.BingooNotification.filter({ user_id: userId }, "-created_date", 50),
    enabled: !!userId,
    refetchInterval: 30000,
    staleTime: 0,
  });

  // Base44 is the single notification source.
  useEffect(() => {
    if (!userId) return;
    const unsub = base44.entities.BingooNotification.subscribe((event) => {
      if (event.data?.user_id === userId) {
        qc.invalidateQueries({ queryKey: ["bingoo-notifications", userId] });
        // Subscription lifecycle events change the account's server-resolved entitlement,
        // so refetch the plan/features/subscription queries immediately — the sidebar
        // recomputes (upgrade, renewal, cancellation, failed-payment) without a refresh.
        const et = event.data?.event_type;
        if (et === "subscription_created" || et === "subscription_updated" || et === "subscription_canceled" || et === "payment_failed") {
          qc.invalidateQueries({ queryKey: ["user-features"] });
          qc.invalidateQueries({ queryKey: ["my-subscription"] });
          qc.invalidateQueries({ queryKey: ["auth-me"] });
        }
      }
    });
    return () => unsub();
  }, [userId]);

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.BingooNotification.update(id, { is_read: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bingoo-notifications", userId] }),
  });

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    await Promise.all(unread.map(n => base44.entities.BingooNotification.update(n.id, { is_read: true })));
    qc.invalidateQueries({ queryKey: ["bingoo-notifications", userId] });
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleClick = (n) => {
    if (!n.is_read) markReadMutation.mutate(n.id);
    setOpen(false);
    if (n.action_url) {
      // In-app navigation preserves session/state and supports deep links like
      // /bingoo?view=leads&profileId=...&leadId=... or /billing?subscriptionId=...
      if (/^https?:\/\//i.test(n.action_url)) {
        window.location.assign(n.action_url);
      } else {
        navigate(n.action_url);
      }
    }
  };

  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/40" : "text-slate-400";

  if (!userId) return null;

  return (
    <div className="relative">
      <button
        onClick={open ? handleClose : handleOpen}
        className={`relative h-8 w-8 flex items-center justify-center rounded-full transition-all ${isDark ? "bg-white/8 border border-white/12 text-white/50 hover:bg-white/15 hover:text-white" : "bg-white border border-slate-200 text-slate-400 hover:text-slate-700"}`}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-xs font-black rounded-full flex items-center justify-center shadow-lg shadow-red-500/50 ring-2 ${isDark ? "ring-[#0f1117]" : "ring-white"}`}
            style={{ animation: "bell-pulse 2s ease-in-out infinite" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && createPortal(
        <>
          <div className="fixed inset-0 z-[55]" onClick={handleClose} />
          <div className="fixed top-16 right-3 z-[60] w-[calc(100vw-24px)] max-w-sm rounded-2xl shadow-xl overflow-hidden"
            style={{
              background: isDark ? "rgba(15,22,40,0.42)" : "rgba(255,255,255,0.45)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.55)"}`,
              boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
            }}>
            {/* Header */}
            <div className={`px-4 py-3 flex items-center justify-between border-b ${isDark ? "border-white/10" : "border-white/40"}`}>
              <div className="flex items-center gap-2">
                <h3 className={`font-black text-sm ${headText}`}>Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[11px] font-black px-1.5 py-0.5 rounded-full">
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
                      className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors border-b ${isDark ? "border-white/6 hover:bg-white/8" : "border-white/30 hover:bg-white/55"}`}
                      style={isUnread ? { background: isDark ? "rgba(59,130,246,0.10)" : "rgba(59,130,246,0.08)" } : {}}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${colorCls}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold leading-snug ${headText}`}>{n.title}</p>
                        {n.message && <p className={`text-xs mt-0.5 truncate ${mutedText}`}>{n.message}</p>}
                        <p className={`text-xs mt-1 ${mutedText}`}>
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
        </>, document.body
      )}
    </div>
  );
}