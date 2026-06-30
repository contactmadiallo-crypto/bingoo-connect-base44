import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { X, Phone, MessageCircle, Mail, ChevronRight } from "lucide-react";

const hexRgb = (hex, a = 1) => {
  if (!hex || hex.length < 7) return `rgba(0,0,0,${a})`;
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
};

function InfoChip({ label, isDark }) {
  return (
    <span style={{
      display: "inline-block", padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700,
      background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
      color: isDark ? "rgba(255,255,255,0.75)" : "#374151", marginRight: 6, marginBottom: 6,
    }}>{label}</span>
  );
}

function StylistModal({ member, color, isDark, onClose, onBook }) {
  const bg = isDark ? "#0f172a" : "#ffffff";
  const textPrimary = isDark ? "#fff" : "#0f172a";
  const textSecondary = isDark ? "rgba(255,255,255,0.55)" : "#64748b";

  const specialties = member.practice_areas
    ? member.practice_areas.split(",").map(s => s.trim()).filter(Boolean)
    : [];
  const languages = member.languages
    ? member.languages.split(",").map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 480,
          background: bg, borderRadius: "24px 24px 0 0",
          maxHeight: "90vh", overflowY: "auto",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}>

        {/* Header */}
        <div style={{ position: "relative", background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.7)})`, padding: "32px 24px 48px" }}>
          <button onClick={onClose} style={{
            position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.2)",
            border: "none", borderRadius: "50%", width: 34, height: 34,
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}>
            <X size={18} color="#fff" />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {member.photo ? (
              <img src={member.photo} alt={member.name}
                style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(255,255,255,0.4)", flexShrink: 0 }} />
            ) : (
              <div style={{
                width: 72, height: 72, borderRadius: "50%", flexShrink: 0,
                background: "rgba(255,255,255,0.2)", border: "3px solid rgba(255,255,255,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28, fontWeight: 900, color: "#fff",
              }}>
                {member.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
            <div>
              <p style={{ margin: 0, fontWeight: 900, fontSize: 18, color: "#fff" }}>{member.name}</p>
              {member.role && <p style={{ margin: "4px 0 0", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>{member.role}</p>}
              {member.experience && <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(255,255,255,0.65)" }}>✦ {member.experience}</p>}
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "24px", marginTop: -20, background: bg, borderRadius: "20px 20px 0 0", position: "relative" }}>

          {/* Bio */}
          {member.bio && (
            <p style={{ margin: "0 0 20px", fontSize: 13.5, lineHeight: 1.7, color: textSecondary }}>{member.bio}</p>
          )}

          {/* Specialties */}
          {specialties.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8" }}>Specialties</p>
              <div>{specialties.map(s => <InfoChip key={s} label={s} isDark={isDark} />)}</div>
            </div>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8" }}>Languages</p>
              <div>{languages.map(l => <InfoChip key={l} label={l} isDark={isDark} />)}</div>
            </div>
          )}

          {/* Education / Awards */}
          {(member.education || member.awards) && (
            <div style={{ marginBottom: 20, padding: "14px 16px", borderRadius: 14,
              background: isDark ? "rgba(255,255,255,0.05)" : hexRgb(color, 0.04),
              border: isDark ? "1px solid rgba(255,255,255,0.08)" : `1px solid ${hexRgb(color, 0.1)}` }}>
              {member.education && (
                <p style={{ margin: "0 0 6px", fontSize: 13, color: textPrimary }}>
                  <span style={{ fontWeight: 700 }}>🎓 </span>{member.education}
                </p>
              )}
              {member.awards && (
                <p style={{ margin: 0, fontSize: 13, color: textPrimary }}>
                  <span style={{ fontWeight: 700 }}>🏆 </span>{member.awards}
                </p>
              )}
            </div>
          )}

          {/* Availability / Consultation fee */}
          {(member.availability || member.consultation_fee) && (
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              {member.availability && (
                <div style={{ flex: 1, padding: "12px 14px", borderRadius: 12,
                  background: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc",
                  border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0" }}>
                  <p style={{ margin: "0 0 2px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8" }}>Availability</p>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: textPrimary }}>{member.availability}</p>
                </div>
              )}
              {member.consultation_fee && (
                <div style={{ flex: 1, padding: "12px 14px", borderRadius: 12,
                  background: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc",
                  border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0" }}>
                  <p style={{ margin: "0 0 2px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8" }}>Rate / Fee</p>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: color }}>{member.consultation_fee}</p>
                </div>
              )}
            </div>
          )}

          {/* Book with this stylist */}
          {onBook && (
            <button onClick={onBook} style={{
              width: "100%", marginBottom: 12, padding: "13px", borderRadius: 14, border: "none", cursor: "pointer",
              background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.8)})`,
              color: "#fff", fontWeight: 900, fontSize: 14,
              boxShadow: `0 6px 20px ${hexRgb(color, 0.35)}`,
            }}>
              📅 Book Appointment with {member.name?.split(" ")[0]}
            </button>
          )}

          {/* Contact buttons */}
          {(member.phone || member.whatsapp || member.email) && (
            <div style={{ display: "flex", gap: 10 }}>
              {member.phone && (
                <a href={`tel:${member.phone}`} style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "12px", borderRadius: 14, textDecoration: "none",
                  background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.8)})`,
                  color: "#fff", fontWeight: 700, fontSize: 13,
                  boxShadow: `0 4px 14px ${hexRgb(color, 0.3)}`,
                }}>
                  <Phone size={15} /> Call
                </a>
              )}
              {member.whatsapp && (
                <a href={`https://wa.me/${member.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noreferrer" style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "12px", borderRadius: 14, textDecoration: "none",
                  background: "linear-gradient(135deg, #25d366, #128c7e)",
                  color: "#fff", fontWeight: 700, fontSize: 13,
                  boxShadow: "0 4px 14px rgba(37,211,102,0.3)",
                }}>
                  <MessageCircle size={15} /> WhatsApp
                </a>
              )}
              {member.email && (
                <a href={`mailto:${member.email}`} style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "12px", borderRadius: 14, textDecoration: "none",
                  background: isDark ? "rgba(255,255,255,0.1)" : "#f1f5f9",
                  color: isDark ? "#fff" : "#374151", fontWeight: 700, fontSize: 13,
                  border: isDark ? "1px solid rgba(255,255,255,0.15)" : "1px solid #e2e8f0",
                }}>
                  <Mail size={15} /> Email
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SalonTeamSection({ profileId, color = "#0B2E6B", isDark, canBook, onBookWithStylist }) {
  const [selected, setSelected] = useState(null);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["public-salon-team", profileId],
    queryFn: () => base44.entities.TeamMember.filter({ profile_id: profileId, status: "active" }, "order", 50),
    enabled: !!profileId,
  });

  if (isLoading || !members.length) return null;

  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 18 }}>👥</span>
          <span style={{ fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#94a3b8" }}>Our Team</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {members.map(member => {
            const specialties = member.practice_areas
              ? member.practice_areas.split(",").map(s => s.trim()).filter(Boolean).slice(0, 3)
              : [];
            return (
              <button
                key={member.id}
                onClick={() => setSelected(member)}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 16px", borderRadius: 18, width: "100%", textAlign: "left",
                  background: isDark ? "rgba(255,255,255,0.06)" : hexRgb(color, 0.04),
                  border: isDark ? "1px solid rgba(255,255,255,0.1)" : `1px solid ${hexRgb(color, 0.12)}`,
                  cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.01)"; e.currentTarget.style.boxShadow = `0 4px 20px ${hexRgb(color, 0.15)}`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                {member.photo ? (
                  <img src={member.photo} alt={member.name}
                    style={{ width: 54, height: 54, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `2px solid ${hexRgb(color, 0.3)}` }} />
                ) : (
                  <div style={{
                    width: 54, height: 54, borderRadius: "50%", flexShrink: 0,
                    background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.7)})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, fontWeight: 900, color: "#fff",
                  }}>
                    {member.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: isDark ? "#fff" : "#0f172a" }}>{member.name}</p>
                  {member.role && (
                    <p style={{ margin: "2px 0 4px", fontSize: 12, fontWeight: 600, color: color }}>{member.role}</p>
                  )}
                  {specialties.length > 0 && (
                    <p style={{ margin: 0, fontSize: 11, color: isDark ? "rgba(255,255,255,0.4)" : "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {specialties.join(" · ")}
                    </p>
                  )}
                </div>
                <ChevronRight size={16} color={isDark ? "rgba(255,255,255,0.3)" : "#cbd5e1"} style={{ flexShrink: 0 }} />
              </button>
            );
          })}
        </div>
      </div>

      {selected && (
        <StylistModal
          member={selected}
          color={color}
          isDark={isDark}
          onClose={() => setSelected(null)}
          onBook={canBook && onBookWithStylist ? () => { onBookWithStylist(selected.name); setSelected(null); } : undefined}
        />
      )}
    </>
  );
}