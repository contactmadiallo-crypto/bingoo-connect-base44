// Color identity per tab
const TAB_COLORS = {
  overview:      { color: "#3b82f6", bg: "rgba(59,130,246,0.12)"  },
  profile:       { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)"  },
  design:        { color: "#f97316", bg: "rgba(249,115,22,0.12)"  },
  services:      { color: "#10b981", bg: "rgba(16,185,129,0.12)"  },
  legal_services:{ color: "#6366f1", bg: "rgba(99,102,241,0.12)"  },
  team:          { color: "#0d9488", bg: "rgba(13,148,136,0.12)"  },
  offices:       { color: "#ef4444", bg: "rgba(239,68,68,0.12)"   },
  analytics:     { color: "#d97706", bg: "rgba(217,119,6,0.12)"   },
  connections:   { color: "#e11d48", bg: "rgba(225,29,72,0.12)"   },
  appointments:  { color: "#10b981", bg: "rgba(16,185,129,0.12)"  },
  calendar:      { color: "#06b6d4", bg: "rgba(6,182,212,0.12)"   },
  leads:         { color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
  portfolio:     { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)"  },
  resumes:       { color: "#6366f1", bg: "rgba(99,102,241,0.12)"  },
  lost_mode:     { color: "#ef4444", bg: "rgba(239,68,68,0.12)"   },
  hours:         { color: "#0891b2", bg: "rgba(8,145,178,0.12)"   },
  crm:           { color: "#6366f1", bg: "rgba(99,102,241,0.12)"  },
  attendance:    { color: "#10b981", bg: "rgba(16,185,129,0.12)"  },
  // appt_settings merged into appointments sub-tab
};

export default function DashboardNav({ tabs, activeTab, setTab, leads, appointments, isDark }) {
  return (
    <div className="flex gap-1.5 mb-4 sm:mb-5 overflow-x-auto scrollbar-none pb-0.5">
      {tabs.map(t => {
        const isActive = activeTab === t.id;
        const theme = TAB_COLORS[t.id] || TAB_COLORS.overview;
        const Icon = t.icon;

        const leadBadge = t.id === "leads" && leads.length > 0 ? leads.length : null;
        const apptBadge = t.id === "appointments" ? appointments.filter(a => a.status === "pending").length : 0;
        const badgeCount = leadBadge || (apptBadge > 0 ? apptBadge : null);

        return (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all duration-200"
            style={{
              background: isActive
                ? theme.bg
                : isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
              border: `1px solid ${isActive
                ? theme.color + "40"
                : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"}`,
              color: isActive ? theme.color : isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.40)",
              boxShadow: isActive ? `0 2px 8px ${theme.color}20` : "none",
            }}
          >
            <Icon style={{ color: isActive ? theme.color : isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.30)", width: 13, height: 13, flexShrink: 0 }} />
            {t.label}
            {badgeCount && (
              <span className="min-w-[16px] h-4 rounded-full text-white text-[9px] font-black flex items-center justify-center px-1"
                style={{ background: t.id === "leads" ? "#f59e0b" : "#10b981" }}>
                {badgeCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}