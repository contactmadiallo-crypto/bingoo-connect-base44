import { useState } from "react";
import AppointmentsPanel from "@/components/bingoo/AppointmentsPanel";
import CalendarView from "@/components/bingoo/CalendarView";
import AppointmentSettings from "@/components/bingoo/AppointmentSettings";
import { CalendarDays, Calendar, Settings } from "lucide-react";

const SUB_TABS = [
  { id: "list",     label: "Appointments", icon: CalendarDays },
  { id: "calendar", label: "Calendar",     icon: Calendar     },
  { id: "settings", label: "Booking Setup", icon: Settings    },
];

export default function AppointmentsTabMerged({ profileId, userId, isDark, highlightId, onSaved }) {
  // A deep-linked appointment should always land on the list view, even if the user
  // previously had the calendar/settings sub-tab open.
  const [sub, setSub] = useState(highlightId ? "list" : "list");

  const headText = isDark ? "text-white" : "text-slate-900";

  return (
    <div className="space-y-4">
      {/* Sub-tab bar */}
      <div className="flex gap-1.5">
        {SUB_TABS.map(t => {
          const isActive = sub === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setSub(t.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all"
              style={{
                background: isActive
                  ? isDark ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.1)"
                  : isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                border: `1px solid ${isActive
                  ? "rgba(16,185,129,0.4)"
                  : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"}`,
                color: isActive ? "#10b981" : isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
              }}
            >
              <Icon style={{ width: 13, height: 13 }} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Sub-tab content */}
      {sub === "list"     && <AppointmentsPanel profileId={profileId} userId={userId} highlightId={highlightId} onSaved={onSaved} />}
      {sub === "calendar" && <CalendarView profileId={profileId} />}
      {sub === "settings" && <AppointmentSettings profileId={profileId} onSaved={onSaved} />}
    </div>
  );
}