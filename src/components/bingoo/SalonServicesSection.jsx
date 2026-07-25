import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const hexRgb = (hex, a = 1) => {
  if (!hex || hex.length < 7) return `rgba(0,0,0,${a})`;
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
};

// Called from parent with onBookService(service) to open booking with pre-filled service
export default function SalonServicesSection({ profileId, color = "#0b2149", isDark, onBookService, mode = "salon" }) {
  const businessMode = mode === "business";
  const { data: allServices = [], isLoading } = useQuery({
    queryKey: ["public-salon-services", profileId],
    queryFn: () => base44.entities.SalonService.filter({ profile_id: profileId }, "order", 100),
    enabled: !!profileId,
  });

  const services = (allServices || []).filter(s => s.is_active !== false);

  if (isLoading) return <div style={{ marginBottom: 28, padding: "16px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>Loading services…</div>;
  if (!services.length) return null;

  const categories = [...new Set(services.map(s => s.category || "Services"))];

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 18 }}>{businessMode ? "📦" : "✂️"}</span>
        <span style={{ fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#94a3b8" }}>{businessMode ? "Services & Products" : "Salon Services"}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {categories.map(cat => (
          <div key={cat}>
            {categories.length > 1 && (
              <p style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: hexRgb(color, 0.7), marginBottom: 10 }}>{cat}</p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {services.filter(s => (s.category || "Services") === cat).map(service => (
                <div key={service.id} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 16px", borderRadius: 18,
                  background: isDark ? "rgba(255,255,255,0.06)" : hexRgb(color, 0.04),
                  border: isDark ? "1px solid rgba(255,255,255,0.1)" : `1px solid ${hexRgb(color, 0.12)}`,
                }}>
                  {service.image_url && (
                    <img src={service.image_url} alt={service.name}
                      style={{ width: 52, height: 52, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: isDark ? "#fff" : "#0f172a" }}>{service.name}</p>
                    {service.description && (
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: isDark ? "rgba(255,255,255,0.45)" : "#64748b", lineHeight: 1.5 }}>{service.description}</p>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 5 }}>
                      {service.price_label && (
                        <span style={{ fontSize: 13, fontWeight: 800, color: color }}>{service.price_label}</span>
                      )}
                      {service.duration_minutes && (
                        <span style={{ fontSize: 11, color: isDark ? "rgba(255,255,255,0.35)" : "#94a3b8" }}>⏱ {service.duration_minutes} min</span>
                      )}
                    </div>
                  </div>

                  {/* Book this service button */}
                  {onBookService && (
                    <button
                      onClick={() => onBookService(service)}
                      style={{
                        flexShrink: 0, padding: "7px 14px", borderRadius: 99, border: "none",
                        background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.8)})`,
                        color: "#fff", fontWeight: 800, fontSize: 12, cursor: "pointer",
                        boxShadow: `0 3px 12px ${hexRgb(color, 0.3)}`,
                        whiteSpace: "nowrap",
                      }}>
                      Book
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}