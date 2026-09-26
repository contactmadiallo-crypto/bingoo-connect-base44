import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AttorneyProfileSection from "@/components/bingoo/AttorneyProfileSection";
import { useI18n } from "@/lib/I18nContext";
import { t } from "@/lib/i18n";

export default function AttorneysSectionPublic({ profileId, color = "#0b2149" }) {
  const { language } = useI18n();
  const { data: attorneys = [], isLoading } = useQuery({
    queryKey: ["public-attorneys", profileId],
    queryFn: () => base44.entities.TeamMember.filter({ profile_id: profileId, status: "active" }, "order"),
    enabled: !!profileId,
  });

  if (isLoading || attorneys.length === 0) return null;

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 18 }}>⚖️</span>
        <span style={{ fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#94a3b8" }}>{t("attorney_public_title",language)}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {attorneys.map(attorney => (
          <AttorneyProfileSection key={attorney.id} member={attorney} coverColor={color} />
        ))}
      </div>
    </div>
  );
}