/**
 * ProfileLayoutShell — thin outer wrapper.
 * Provides the page background color/gradient and animation entry.
 * Does NOT apply structural overlays — that's the renderer's job.
 */

import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

const hexRgb = (hex, alpha = 1) => {
  if (!hex || hex.length < 7) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

// Map layout IDs to outer page background
function getShellBg(layout, color, isDark) {
  // Dark-family layouts
  if (["dark", "dark_premium", "darkpremium", "neon", "neon_tech", "cyberpunk", "luxury", "luxury_gold", "aurora", "minimal_dark", "executive_corp", "video_bg", "parallax", "forest"].includes(layout)) {
    return "#080a18";
  }
  // Glassmorphic / frosted — colored gradient behind
  if (["glassmorphic", "glass", "frosted", "glass_3d"].includes(layout)) {
    return `linear-gradient(145deg, ${color} 0%, ${hexRgb(color, 0.55)} 45%, #e0e7ff 100%)`;
  }
  // Sunset/ocean/gradient/bold — vivid gradient
  if (["sunset"].includes(layout)) return "linear-gradient(160deg, #ff6b35, #f7931e, #ffcd3c, #c0392b)";
  if (["ocean"].includes(layout)) return "linear-gradient(160deg, #0077b6, #00b4d8, #90e0ef)";
  if (["gradient", "bold", "wave"].includes(layout)) return `linear-gradient(160deg, ${color} 0%, ${hexRgb(color, 0.4)} 40%, #f8fafc 100%)`;
  if (["bubbly", "animated_gradient"].includes(layout)) return `linear-gradient(135deg, ${hexRgb(color, 0.15)}, #fff0f6, ${hexRgb(color, 0.08)})`;
  if (["pastel"].includes(layout)) return "linear-gradient(135deg, #fdf2f8, #eff6ff)";
  if (["retro", "monochrome"].includes(layout)) return "#fafafa";
  if (["paper"].includes(layout)) return "#f5f0e8";
  if (["premium_salon"].includes(layout)) return "linear-gradient(160deg, #1a0a14, #2d1020)";
  if (["modern_law", "realtor_luxury", "corporate", "card", "card_compact", "split"].includes(layout)) return "#f1f5f9";
  if (["minimal", "minimal_business", "modern_saas"].includes(layout)) return isDark ? "#0f172a" : "#f8fafc";
  // Default: very light page bg
  if (isDark) return "linear-gradient(160deg, #080a18, #0d1022)";
  return "#f8fafc";
}

export default function ProfileLayoutShell({ profile, color, isDark, children }) {
  const mobile = useIsMobile();
  const layout = profile?.layout || "classic";
  const hasCustomBg = !!profile?.theme_background_color;
  // Only apply shell bg when no custom bg is set (custom bg is on the outer PublicProfile wrapper)
  const pageBg = hasCustomBg ? "transparent" : getShellBg(layout, color, isDark);

  return (
    <div style={{ minHeight: "100vh", background: pageBg }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: "100%",
          maxWidth: mobile ? "100%" : 480,
          margin: "0 auto",
          // CRITICAL: no overflow:hidden here — avatar must escape the cover
          position: "relative",
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}