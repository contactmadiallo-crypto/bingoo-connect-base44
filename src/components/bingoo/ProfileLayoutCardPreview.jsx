import ResolvedProfileLayout from "@/components/bingoo/ResolvedProfileLayout";

/**
 * ProfileLayoutCardPreview
 * Uses the same resolved layout renderer as the live/public profile.
 * The card simply crops the top identity area instead of maintaining
 * a second miniature layout implementation that can drift out of sync.
 */
export default function ProfileLayoutCardPreview({ profile, height = 190, compact = false }) {
  const h = height;
  // My Profiles must show the entire identity/header composition, not a cropped cover.
  // Scale the real public renderer down from its natural top edge so avatar, profession,
  // display name, job title and company/brand line remain visible together.
  const scale = compact ? 0.62 : 0.78;
  const top = 0;
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
