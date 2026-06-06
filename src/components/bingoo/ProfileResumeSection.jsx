import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";

const hexRgb = (hex, alpha = 1) => {
  if (!hex || hex.length < 7) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

function Section({ title, children, color }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em",
        color: color, borderBottom: `2px solid ${hexRgb(color, 0.15)}`,
        paddingBottom: 6, marginBottom: 10,
      }}>{title}</div>
      {children}
    </div>
  );
}

export default function ProfileResumeSection({ profileId, color, isDark, showDivider }) {
  const { data: attachedResume, isLoading: loading } = useQuery({
    queryKey: ["attached-resume", profileId],
    queryFn: async () => {
      const res = await base44.functions.invoke("getAttachedResume", { profileId });
      return res.data?.resume || null;
    },
    enabled: !!profileId,
  });

  if (loading || !attachedResume) return null;

  const r = attachedResume;
  const Divider = () => <div style={{ height: 1, background: "rgba(0,0,0,0.05)", margin: "28px 0" }} />;
  const c = color || "#0B2E6B";
  const textColor = isDark ? "rgba(255,255,255,0.85)" : "#1e293b";
  const mutedColor = isDark ? "rgba(255,255,255,0.5)" : "#64748b";
  const cardBg = isDark ? "rgba(255,255,255,0.06)" : "#fff";
  const cardBorder = isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0";

  const skills = r.skills
    ? r.skills.split(/[,;|\n]+/).map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <>
    {showDivider && <Divider />}
    {showDivider && (
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 18 }}>📄</span>
        <span style={{ fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#94a3b8" }}>Experience & Resume</span>
      </div>
    )}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      style={{
        borderRadius: 20,
        border: `1px solid ${cardBorder}`,
        background: cardBg,
        overflow: "hidden",
        boxShadow: isDark ? "none" : "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${c}, ${hexRgb(c, 0.75)})`,
        padding: "20px 22px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>
              📄 Resume / Experience
            </p>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#fff" }}>{r.display_name}</h3>
            {(r.job_title || r.company_name) && (
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>
                {r.job_title}{r.company_name ? ` · ${r.company_name}` : ""}
              </p>
            )}
          </div>
          <a
            href={`/resume/${r.id}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 999,
              background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "#fff", fontSize: 12, fontWeight: 800,
              textDecoration: "none", whiteSpace: "nowrap",
            }}
          >
            Full Resume ↗
          </a>
        </div>

        {/* Contact info */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 12 }}>
          {r.email && (
            <a href={`mailto:${r.email}`} style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              📧 {r.email}
            </a>
          )}
          {r.phone && (
            <a href={`tel:${r.phone}`} style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              📞 {r.phone}
            </a>
          )}
          {r.location && (
            <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
              📍 {r.location}
            </span>
          )}
          {r.linkedin_url && (
            <a href={r.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              🔗 LinkedIn
            </a>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "20px 22px" }}>
        {r.bio && (
          <Section title="Summary" color={c}>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.75, color: mutedColor, fontWeight: 500 }}>{r.bio}</p>
          </Section>
        )}

        {skills.length > 0 && (
          <Section title="Skills" color={c}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {skills.map(skill => (
                <span key={skill} style={{
                  padding: "4px 12px", borderRadius: 999,
                  background: hexRgb(c, 0.1), border: `1px solid ${hexRgb(c, 0.2)}`,
                  color: c, fontSize: 12, fontWeight: 700,
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </Section>
        )}

        {r.experience && (
          <Section title="Experience" color={c}>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.75, color: mutedColor, whiteSpace: "pre-line", fontWeight: 500 }}>{r.experience}</p>
          </Section>
        )}

        {r.education && (
          <Section title="Education" color={c}>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.75, color: mutedColor, whiteSpace: "pre-line", fontWeight: 500 }}>{r.education}</p>
          </Section>
        )}
      </div>
    </motion.div>
    </>
  );
}