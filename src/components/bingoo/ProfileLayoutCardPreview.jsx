import ResolvedProfileLayout from "@/components/bingoo/ResolvedProfileLayout";

/**
 * ProfileLayoutCardPreview
 * Uses the same resolved layout renderer as the live/public profile.
 * The card simply crops the top identity area instead of maintaining
 * a second miniature layout implementation that can drift out of sync.
 */
export default function ProfileLayoutCardPreview({ profile, height = 190, compact = false }) {
  const h = compact ? Math.min(height, 150) : height;
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
          width: "100%",
          minHeight: "100%",
          pointerEvents: "none",
          userSelect: "none",
          transformOrigin: "top center",
        }}
      >
        <ResolvedProfileLayout profile={profile} mobile={true} contentSections={null} />
      </div>
    </div>
  );
}
