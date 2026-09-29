import ProfileLayoutCardPreview from "@/components/bingoo/ProfileLayoutCardPreview";

/**
 * Compatibility wrapper.
 * The previous preview duplicated the public layout system.
 * Any future import now delegates to the canonical compact renderer.
 */
export default function ProfilePreview({ profile }) {
  return (
    <div style={{ width: "100%", maxWidth: 420, margin: "0 auto", padding: 12 }}>
      <ProfileLayoutCardPreview profile={profile} height={220} />
    </div>
  );
}
