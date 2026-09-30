import ResolvedProfileLayout from "@/components/bingoo/ResolvedProfileLayout";
import { resolveProfileAppearance } from "@/lib/profileLayouts";

/**
 * ProfileLayoutCardPreview
 * Uses the same resolved layout renderer as the live/public profile.
 * The card simply crops the top identity area instead of maintaining
 * a second miniature layout implementation that can drift out of sync.
 */
export default function ProfileLayoutCardPreview({ profile, height = 190, compact = false }) {
  const h = compact ? Math.min(height, 160) : height;
  const appearance = resolveProfileAppearance(profile);
  const layout = appearance.canonicalLayout;
  const scale = compact ? 0.66 : 0.78;
  const topOffsets = {
    classic: -8,
    minimal: 0,
    card: 0,
    image_hero: -72,
    glassmorphic: 0,
    dark: 0,
    aurora: -16,
    magazine: -48,
    executive: -14,
    premium_salon: -22,
    modern_law: -8,
    corporate: 0,
    modern_saas: 0,
    ny_championship: 0,
    lions_teranga: 0,
  };
  const top = compact ? (topOffsets[layout] ?? 0) : 0;
  return (
    <div
      style={{
        height: h,
        width: "100%",
        overflow: "hidden",
        borderRadius: 16,
        position: "relative",
        background: "transparent",
      }}
    >
      <div
        style={{
          width: `${100 / scale}%`,
          minHeight: `${100 / scale}%`,
          position: "relative",
          top,
          pointerEvents: "none",
          userSelect: "none",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <ResolvedProfileLayout profile={profile} mobile={true} contentSections={null} />
      </div>
    </div>
  );
}
