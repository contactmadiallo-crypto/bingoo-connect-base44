import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Calendar, Tag, ChevronRight } from "lucide-react";

const hexRgb = (hex, alpha = 1) => {
  if (!hex || hex.length < 7) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const FONT_BODY = "'Inter', system-ui, sans-serif";

/**
 * BusinessProfileExtras — Additional sections rendered on business public profiles
 * to make them wider/richer than personal profiles:
 * 1. Company logo + intro banner
 * 2. Featured offer card
 * 3. Gallery grid (portfolio items)
 * 4. Prominent booking CTA
 *
 * Rendered for plans: business, corporate, salon, lawfirm
 */
export default function BusinessProfileExtras({ profile, color, isDark, track }) {
  const isBusiness = ["business", "corporate", "salon", "restaurant", "lawfirm"].includes(profile.plan);

  const hasLogo = !!profile.company_logo;
  const hasOffer = !!profile.whatsapp_booking_message;
  const canBook = profile.booking_enabled !== false;

  // Fetch portfolio items for gallery (hook must run before any early return)
  const { data: portfolioItems = [] } = useQuery({
    queryKey: ["public-portfolio-business", profile.id],
    queryFn: async () => {
      try {
        const res = await base44.functions.invoke("getPublicPortfolioItems", { profile_id: profile.id });
        return res?.data?.items || [];
      } catch { return []; }
    },
    enabled: isBusiness && !!profile.id,
    staleTime: 30_000,
  });

  if (!isBusiness) return null;

  const galleryItems = portfolioItems.filter(p => p.image_url).slice(0, 6);

  return (
    <>
      {/* ── Company logo + intro banner ── */}
      {(hasLogo || profile.company_name) && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{
            display: "flex", alignItems: "center", gap: 14, padding: "16px",
            borderRadius: 18, marginBottom: 20,
            background: isDark ? "rgba(255,255,255,0.06)" : hexRgb(color, 0.04),
            border: isDark ? "1px solid rgba(255,255,255,0.1)" : `1px solid ${hexRgb(color, 0.12)}`,
          }}>
          {hasLogo && (
            <img src={profile.company_logo} alt={profile.company_name || ""}
              style={{ width: 52, height: 52, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            {profile.company_name && (
              <p style={{ margin: 0, fontWeight: 800, fontSize: 15, fontFamily: FONT_BODY, color: isDark ? "#fff" : "#1e293b" }}>
                {profile.company_name}
              </p>
            )}
            {profile.job_title && (
              <p style={{ margin: "2px 0 0", fontSize: 12, color: isDark ? "rgba(255,255,255,0.45)" : "#64748b", fontFamily: FONT_BODY }}>
                {profile.job_title}
              </p>
            )}
          </div>
          {canBook && (
            <a href="#booking" onClick={() => track?.("appointment_booked")}
              style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 12,
                background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.8)})`, color: "#fff",
                fontWeight: 800, fontSize: 12, textDecoration: "none", fontFamily: FONT_BODY,
                boxShadow: `0 4px 16px ${hexRgb(color, 0.3)}` }}>
              <Calendar size={14} /> Book
            </a>
          )}
        </motion.div>
      )}

      {/* ── Featured offer ── */}
      {hasOffer && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{
            display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
            borderRadius: 16, marginBottom: 20,
            background: isDark ? "rgba(249,115,22,0.12)" : "#fff7ed",
            border: isDark ? "1px solid rgba(249,115,22,0.25)" : "1px solid #fed7aa",
          }}>
          <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(249,115,22,0.18)" }}>
            <Tag size={18} color="#f97316" />
          </div>
          <p style={{ margin: 0, flex: 1, fontSize: 13, fontWeight: 600, fontFamily: FONT_BODY,
            color: isDark ? "rgba(255,255,255,0.85)" : "#9a3412" }}>
            {profile.whatsapp_booking_message}
          </p>
        </motion.div>
      )}

      {/* ── Gallery grid ── */}
      {galleryItems.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase",
            color: isDark ? "rgba(255,255,255,0.4)" : "#94a3b8", margin: "0 0 10px", fontFamily: FONT_BODY }}>
            Gallery
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {galleryItems.map((item, i) => (
              <div key={item.id || i} style={{ position: "relative", aspectRatio: "1", borderRadius: 10, overflow: "hidden" }}>
                <img src={item.image_url} alt={item.title || ""} loading="lazy"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Prominent Google Review CTA (all business profiles, not just salons) ── */}
      {profile.google_review_url && (
        <a href={profile.google_review_url} target="_blank" rel="noreferrer"
          onClick={() => track?.("request_info_click")}
          style={{ display: "block", marginBottom: 20, textDecoration: "none" }}>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            whileHover={{ scale: 1.01 }}
            style={{
              display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 16, cursor: "pointer",
              background: isDark ? "rgba(251,191,36,0.1)" : "#fffbeb",
              border: isDark ? "1px solid rgba(251,191,36,0.25)" : "1px solid #fde68a",
            }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>⭐</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: isDark ? "#fbbf24" : "#92400e", fontFamily: FONT_BODY }}>
                Leave us a Google Review
              </p>
              <p style={{ margin: 0, fontSize: 11, color: isDark ? "rgba(251,191,36,0.6)" : "#b45309", fontFamily: FONT_BODY }}>
                Your review helps us grow! 🙏
              </p>
            </div>
            <ChevronRight size={18} color={isDark ? "rgba(251,191,36,0.5)" : "#b45309"} />
          </motion.div>
        </a>
      )}
    </>
  );
}