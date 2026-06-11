import {
  TrendingUp, Settings, Palette, Scissors, Users, Scale,
  MapPin, BarChart3, Link2, Briefcase, CalendarDays, Star,
  GitBranch, UserCheck, Clock, FileText, AlertTriangle,
  Calendar, Building2
} from "lucide-react";

// Color identity per module
const MODULE_COLORS = {
  overview:      { color: "#3b82f6", bg: "rgba(59,130,246,0.10)",  border: "rgba(59,130,246,0.18)"  },
  profile:       { color: "#8b5cf6", bg: "rgba(139,92,246,0.10)", border: "rgba(139,92,246,0.18)"  },
  design:        { color: "#f97316", bg: "rgba(249,115,22,0.10)",  border: "rgba(249,115,22,0.18)"  },
  services:      { color: "#10b981", bg: "rgba(16,185,129,0.10)",  border: "rgba(16,185,129,0.18)"  },
  legal_services:{ color: "#6366f1", bg: "rgba(99,102,241,0.10)",  border: "rgba(99,102,241,0.18)"  },
  team:          { color: "#0d9488", bg: "rgba(13,148,136,0.10)",  border: "rgba(13,148,136,0.18)"  },
  offices:       { color: "#ef4444", bg: "rgba(239,68,68,0.10)",   border: "rgba(239,68,68,0.18)"   },
  analytics:     { color: "#d97706", bg: "rgba(217,119,6,0.10)",   border: "rgba(217,119,6,0.18)"   },
  connections:   { color: "#e11d48", bg: "rgba(225,29,72,0.10)",   border: "rgba(225,29,72,0.18)"   },
  appointments:  { color: "#10b981", bg: "rgba(16,185,129,0.10)",  border: "rgba(16,185,129,0.18)"  },
  calendar:      { color: "#06b6d4", bg: "rgba(6,182,212,0.10)",   border: "rgba(6,182,212,0.18)"   },
  leads:         { color: "#f59e0b", bg: "rgba(245,158,11,0.10)",  border: "rgba(245,158,11,0.18)"  },
  portfolio:     { color: "#8b5cf6", bg: "rgba(139,92,246,0.10)",  border: "rgba(139,92,246,0.18)"  },
  resumes:       { color: "#6366f1", bg: "rgba(99,102,241,0.10)",  border: "rgba(99,102,241,0.18)"  },
  lost_mode:     { color: "#ef4444", bg: "rgba(239,68,68,0.10)",   border: "rgba(239,68,68,0.18)"   },
  hours:         { color: "#0891b2", bg: "rgba(8,145,178,0.10)",   border: "rgba(8,145,178,0.18)"   },
  crm:           { color: "#6366f1", bg: "rgba(99,102,241,0.10)",  border: "rgba(99,102,241,0.18)"  },
  attendance:    { color: "#10b981", bg: "rgba(16,185,129,0.10)",  border: "rgba(16,185,129,0.18)"  },
  appt_settings: { color: "#0d9488", bg: "rgba(13,148,136,0.10)",  border: "rgba(13,148,136,0.18)"  },
};

const ICON_MAP = {
  overview: TrendingUp, profile: Settings, design: Palette,
  services: Scissors, legal_services: Scale, team: Users,
  offices: MapPin, analytics: BarChart3, connections: Link2,
  appointments: CalendarDays, calendar: Calendar, leads: Star,
  portfolio: Briefcase, resumes: FileText, lost_mode: AlertTriangle,
  hours: Clock, crm: GitBranch, attendance: UserCheck,
  appt_settings: Settings,
};

export default function DashboardNav({ tabs, activeTab, setTab, leads, appointments, isDark }) {
  return (
    <div className="grid grid-cols-4 gap-2 mb-5">
      {tabs.map(t => {
        const isActive = activeTab === t.id;
        const theme = MODULE_COLORS[t.id] || MODULE_COLORS.overview;
        const Icon = ICON_MAP[t.id] || TrendingUp;

        // Badges
        const leadBadge = t.id === "leads" && leads.length > 0 ? leads.length : null;
        const apptBadge = t.id === "appointments" ? appointments.filter(a => a.status === "pending").length : 0;
        const hasBadge = leadBadge || apptBadge > 0;
        const badgeCount = leadBadge || apptBadge;

        const activeBg = isDark
          ? theme.bg.replace("0.10", "0.22")
          : theme.bg.replace("0.10", "0.18");
        const activeBorder = isDark
          ? theme.border.replace("0.18", "0.40")
          : theme.border.replace("0.18", "0.35");

        return (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="relative flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-2xl transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
            style={{
              background: isActive
                ? activeBg
                : isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
              border: `1px solid ${isActive
                ? activeBorder
                : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"}`,
              boxShadow: isActive
                ? `0 2px 12px ${theme.color}22`
                : "none",
            }}
          >
            {/* Badge */}
            {hasBadge && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 rounded-full text-white text-[9px] font-black flex items-center justify-center px-1"
                style={{ background: t.id === "leads" ? "#f59e0b" : "#10b981" }}>
                {badgeCount}
              </span>
            )}

            {/* Icon circle */}
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                background: isActive ? theme.color + "28" : theme.bg,
              }}
            >
              <Icon style={{ color: theme.color, width: 16, height: 16 }} />
            </div>

            {/* Label */}
            <span
              className="text-[10px] font-bold leading-tight text-center w-full px-0.5 truncate"
              style={{ color: isActive ? theme.color : isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }}
            >
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}