/**
 * Compatibility passthrough.
 * Structural layout/background rendering belongs exclusively to
 * ResolvedProfileLayout -> CanonicalProfileLayout.
 */
export default function ProfileLayoutShell({ children }) {
  return children ?? null;
}
