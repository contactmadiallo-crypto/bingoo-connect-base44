import { useState } from "react";
import AppointmentsPanel from "@/components/bingoo/AppointmentsPanel";
import CalendarView from "@/components/bingoo/CalendarView";
import AppointmentSettings from "@/components/bingoo/AppointmentSettings";
import { CalendarDays, Calendar, Settings } from "lucide-react";
import { useI18n } from "@/lib/I18nContext";
import { t } from "@/lib/i18n";

const SUB_TABS = [
  { id: "list",     labelKey: "appt_title", icon: CalendarDays },
  { id: "calendar", labelKey: "appt_calendar", icon: Calendar     },
  { id: "settings", labelKey: "appt_booking_setup", icon: Settings    },
];

export default function AppointmentsTabMerged({ profileId, userId, isDark, highlightId, onSaved }) {
  const { language } = useI18n();
  // A deep-linked appointment should always land on the list view, even if the user
  // previously had the calendar/settings sub-tab open.
  const [sub, setSub] = useState(highlightId ? "list" : "list");

  const headText = isDark ? "text-white" : "text-slate-900";

  return (
    <div className="space-y-4">
      {/* Sub-tab bar */}
      <div className="flex gap-1.5">
        {SUB_TABS.map(tabItem => {
          const isActive = sub === tabItem.id;
          const Icon = tabItem.icon;
          return (
            <button
              key={tabItem.id}
              onClick={() => setSub(tabItem.id)}
              aria-label={t(tabItem.labelKey,language)}
              className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
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
              {t(tabItem.labelKey,language)}
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