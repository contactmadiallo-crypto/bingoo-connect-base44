import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Infinity as InfinityIcon, QrCode, Users, Clock, TrendingUp, Zap } from "lucide-react";

const NAVY = "#0b2149", ORANGE = "#f97316";

export default function EventModePanel({ profile, isDark }) {
  const [eventActive, setEventActive] = useState(false);
  const [eventName, setEventName] = useState("");
  const [eventStarted, setEventStarted] = useState(null);

  // Load event state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`event_mode_${profile?.id}`);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setEventActive(data.active);
        setEventName(data.name || "");
        setEventStarted(data.startedAt ? new Date(data.startedAt) : null);
      } catch {}
    }
  }, [profile?.id]);

  const toggleEvent = () => {
    const newState = {
      active: !eventActive,
      name: !eventActive ? eventName : "",
      startedAt: !eventActive ? new Date().toISOString() : null,
    };
    localStorage.setItem(`event_mode_${profile?.id}`, JSON.stringify(newState));
    setEventActive(newState.active);
    setEventName(newState.name);
    setEventStarted(newState.startedAt ? new Date(newState.startedAt) : null);
  };

  // Fetch analytics since event started
  const { data: analytics = [] } = useQuery({
    queryKey: ["event-analytics", profile?.id, eventStarted?.getTime()],
    queryFn: () => base44.entities.Analytics.filter({ profile_id: profile.id }, "-created_date", 500),
    enabled: !!profile?.id,
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["event-leads", profile?.id],
    queryFn: () => base44.entities.Lead.filter({ profile_id: profile.id, source: "nfc" }, "-created_date", 50),
    enabled: !!profile?.id,
  });

  if (!profile) return null;

  // Filter analytics to event period
  const eventAnalytics = eventStarted
    ? analytics.filter((a) => new Date(a.created_at) >= eventStarted)
    : [];
  const eventTaps = eventAnalytics.filter((a) => a.event_type === "nfc_tap").length;
  const eventSaves = eventAnalytics.filter((a) => a.event_type === "save_contact_click").length;
  const eventFollowUps = leads.filter((l) => eventStarted && new Date(l.created_date) >= eventStarted).length;

  const recentConnections = leads
    .filter((l) => eventStarted && new Date(l.created_date) >= eventStarted)
    .slice(0, 5)
    .map((l) => ({
      name: l.name || "Anonymous",
      company: l.event_name || l.where_first_met || "—",
      time: getTimeAgo(new Date(l.created_date)),
    }));

  const profileUrl = `${window.location.origin}/p/${profile.username}`;

  const cardBg = isDark ? "bg-white/5" : "bg-white";
  const cardBorder = isDark ? "border-white/10" : "border-slate-200";
  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/60" : "text-slate-500";
  const innerBg = isDark ? "bg-white/5" : "bg-slate-50";

  return (
    <div className="space-y-4">
      {/* Event Mode Header */}
      <div className={`rounded-2xl border ${cardBorder} ${cardBg} overflow-hidden`}>
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ background: eventActive ? `linear-gradient(135deg, ${ORANGE}, #fb923c)` : `linear-gradient(135deg, ${NAVY}, #071A3D)` }}
        >
          <div className="flex items-center gap-2">
            {eventActive ? (
              <InfinityIcon className="w-5 h-5 text-white" />
            ) : (
              <Zap className="w-5 h-5 text-orange-400" />
            )}
            <div>
              <p className="text-sm font-black text-white">{eventActive ? "Event Mode Active" : "Event Mode"}</p>
              <p className="text-[10px] text-white/60">{eventActive ? "Quick connect QR enabled" : "Activate for conference networking"}</p>
            </div>
          </div>
          {eventActive && eventName && (
            <span className="text-[10px] font-black px-3 py-1 rounded-full" style={{ background: "rgba(11,33,73,0.3)", color: "#fff" }}>
              {eventName.toUpperCase()}
            </span>
          )}
        </div>

        <div className="p-5">
          {!eventActive ? (
            <>
              <p className={`text-xs ${mutedText} mb-3`}>Enter your event name and activate to show a quick-connect QR code and track connections made at the event.</p>
              <input
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. TechConf 2026, Networking Mixer..."
                className={`w-full px-4 py-3 rounded-xl border ${cardBorder} ${innerBg} ${headText} text-sm outline-none focus:ring-2 focus:ring-orange-500/30 mb-3`}
              />
              <button
                onClick={toggleEvent}
                disabled={!eventName.trim()}
                className="w-full py-3 rounded-xl text-sm font-black text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${ORANGE}, #fb923c)` }}
              >
                <Zap className="w-4 h-4" /> Activate Event Mode
              </button>
            </>
          ) : (
            <>
              {/* Quick Connect QR */}
              <div className={`rounded-xl p-5 ${innerBg} text-center mb-4`}>
                <p className={`text-[10px] font-bold ${mutedText} mb-3`}>QUICK CONNECT — SHOW THIS QR</p>
                <div className="w-32 h-32 mx-auto rounded-2xl p-3" style={{ background: NAVY }}>
                  <QrCodeDisplay url={profileUrl} />
                </div>
                <p className={`text-[10px] ${mutedText} mt-3`}>{profileUrl}</p>
              </div>

              {/* Event Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: "Taps", value: eventTaps, color: ORANGE, icon: Zap },
                  { label: "Saved", value: eventSaves, color: "#22C55E", icon: Users },
                  { label: "Follow-ups", value: eventFollowUps, color: "#3b82f6", icon: TrendingUp },
                ].map((s) => (
                  <div key={s.label} className={`rounded-xl p-3 text-center ${innerBg}`}>
                    <s.icon className="w-4 h-4 mx-auto mb-1" style={{ color: s.color }} />
                    <p className="text-lg font-black" style={{ color: s.color }}>{s.value}</p>
                    <p className={`text-[10px] ${mutedText}`}>{s.label}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={toggleEvent}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all"
                style={{ background: "#ef4444" }}
              >
                End Event Mode
              </button>
            </>
          )}
        </div>
      </div>

      {/* Recent Connections */}
      {eventActive && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border ${cardBorder} ${cardBg} p-5`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-orange-500" />
              <h3 className={`text-sm font-black ${headText}`}>Recent Connections</h3>
            </div>
            {recentConnections.length === 0 ? (
              <div className={`rounded-xl p-6 text-center ${innerBg}`}>
                <p className={`text-xs ${mutedText}`}>No connections yet — keep tapping! 🔗</p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentConnections.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 py-2 border-b border-slate-100 last:border-0 dark:border-white/5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-[10px] flex-shrink-0"
                      style={{ background: `${["#3b82f6", "#ec4899", "#22C55E", "#f97316", "#8b5cf6"][i % 5]}15`, color: ["#3b82f6", "#ec4899", "#22C55E", "#f97316", "#8b5cf6"][i % 5] }}
                    >
                      {c.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold ${headText} truncate`}>{c.name}</p>
                      <p className={`text-[10px] ${mutedText} truncate`}>{c.company}</p>
                    </div>
                    <span className={`text-[10px] ${mutedText} flex-shrink-0`}>{c.time}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

// Simple QR code placeholder — renders a CSS grid pattern
// In production, the real QR is generated by the QrWalletCenter component
function QrCodeDisplay({ url }) {
  // Generate a deterministic pattern from the URL
  const hash = url.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const cells = Array.from({ length: 25 }, (_, i) => {
    return (hash * (i + 1) * 7) % 3 > 0;
  });
  return (
    <div className="w-full h-full grid grid-cols-5 gap-px p-1">
      {cells.map((on, i) => (
        <div key={i} className={`rounded-[1px] ${on ? "bg-white" : "bg-transparent"}`} />
      ))}
    </div>
  );
}

function getTimeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}