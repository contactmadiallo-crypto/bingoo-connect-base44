import { User, Palette, Scissors, Users, Scale, MapPin, BarChart3, Link2, Briefcase, Building2 } from "lucide-react";

const MODULES = [
  {
    id: "profile",
    label: "Edit Profile",
    icon: User,
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.10)",
    border: "rgba(139,92,246,0.18)",
  },
  {
    id: "design",
    label: "Design",
    icon: Palette,
    color: "#f97316",
    bg: "rgba(249,115,22,0.10)",
    border: "rgba(249,115,22,0.18)",
  },
  {
    id: "services",
    label: "Services",
    icon: Scissors,
    color: "#10b981",
    bg: "rgba(16,185,129,0.10)",
    border: "rgba(16,185,129,0.18)",
    lawFirmOverride: { label: "Practice Areas", icon: Scale, color: "#6366f1", bg: "rgba(99,102,241,0.10)", border: "rgba(99,102,241,0.18)" },
  },
  {
    id: "team",
    label: "Team Members",
    icon: Users,
    color: "#0d9488",
    bg: "rgba(13,148,136,0.10)",
    border: "rgba(13,148,136,0.18)",
    lawFirmOverride: { label: "Attorneys", icon: Users, color: "#0d9488", bg: "rgba(13,148,136,0.10)", border: "rgba(13,148,136,0.18)" },
    requiresTeam: true,
  },
  {
    id: "offices",
    label: "Locations",
    icon: MapPin,
    color: "#ef4444",
    bg: "rgba(239,68,68,0.10)",
    border: "rgba(239,68,68,0.18)",
    lawFirmOnly: true,
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    color: "#d97706",
    bg: "rgba(217,119,6,0.10)",
    border: "rgba(217,119,6,0.18)",
  },
  {
    id: "connections",
    label: "Connections",
    icon: Link2,
    color: "#e11d48",
    bg: "rgba(225,29,72,0.10)",
    border: "rgba(225,29,72,0.18)",
  },
  {
    id: "portfolio",
    label: "Portfolio",
    icon: Briefcase,
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.10)",
    border: "rgba(139,92,246,0.18)",
    hideForLawFirmSalon: true,
  },
];

export default function QuickAccessGrid({ setTab, isLawFirm, hasTeam, isSalon, isDark, mutedText }) {
  const visible = MODULES.filter(m => {
    if (m.lawFirmOnly && !isLawFirm) return false;
    if (m.requiresTeam && !hasTeam) return false;
    if (m.hideForLawFirmSalon && (isLawFirm || isSalon)) return false;
    return true;
  });

  return (
    <div>
      <p className={`text-xs font-black uppercase tracking-widest mb-3 ${mutedText}`}>Quick Access</p>
      <div className="grid grid-cols-2 gap-3">
        {visible.map(m => {
          const resolved = isLawFirm && m.lawFirmOverride ? { ...m, ...m.lawFirmOverride } : m;
          const Icon = resolved.icon;
          return (
            <button
              key={m.id}
              onClick={() => setTab(m.id)}
              className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.97]"
              style={{
                background: isDark
                  ? resolved.bg.replace("0.10", "0.12")
                  : resolved.bg,
                border: `1px solid ${isDark ? resolved.border.replace("0.18", "0.22") : resolved.border}`,
              }}
            >
              {/* Icon circle */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: resolved.color + "22" }}
              >
                <Icon className="w-4.5 h-4.5" style={{ color: resolved.color, width: 18, height: 18 }} />
              </div>
              {/* Label */}
              <span
                className="text-sm font-bold leading-tight"
                style={{ color: isDark ? resolved.color : resolved.color }}
              >
                {resolved.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}