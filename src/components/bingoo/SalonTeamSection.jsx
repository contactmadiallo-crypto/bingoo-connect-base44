import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const hexRgb = (hex, a = 1) => {
  if (!hex || hex.length < 7) return `rgba(0,0,0,${a})`;
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
};

export default function SalonTeamSection({ profileId, color = "#0B2E6B", isDark }) {
  const { data: members = [], isLoading } = useQuery({
    queryKey: ["public-salon-team", profileId],
    queryFn: () => base44.entities.TeamMember.filter({ profile_id: profileId, status: "active" }, "order", 50),
    enabled: !!profileId,
  });

  if (isLoading || !members.length) return null;

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 18 }}>👥</span>
        <span style={{ fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#94a3b8" }}>Our Team</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {members.map(member => (
          <div key={member.id} style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "14px 16px", borderRadius: 18,
            background: isDark ? "rgba(255,255,255,0.06)" : hexRgb(color, 0.04),
            border: isDark ? "1px solid rgba(255,255,255,0.1)" : `1px solid ${hexRgb(color, 0.12)}`,
          }}>
            {member.photo ? (
              <img src={member.photo} alt={member.name}
                style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
            ) : (
              <div style={{
                width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
                background: hexRgb(color, 0.15),
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, fontWeight: 800,
                color: isDark ? "#fff" : color,
              }}>
                {member.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: isDark ? "#fff" : "#0f172a" }}>{member.name}</p>
              {member.role && (
                <p style={{ margin: "2px 0 0", fontSize: 12, fontWeight: 600, color: color }}>{member.role}</p>
              )}
              {member.bio && (
                <p style={{ margin: "4px 0 0", fontSize: 12, color: isDark ? "rgba(255,255,255,0.45)" : "#64748b", lineHeight: 1.5 }}>{member.bio}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}