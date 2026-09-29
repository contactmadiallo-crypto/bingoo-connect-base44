import CanonicalProfileLayout from "./CanonicalProfileLayout";
import NewYorkChampionshipLayout from "./layouts/NewYorkChampionshipLayout";
import LionsOfTerangaLayout from "./layouts/LionsOfTerangaLayout";
import { canonicalLayoutId, resolveProfileAppearance } from "@/lib/profileLayouts";

/**
 * The only layout router used by editor preview, live preview and public profile.
 * Content remains shared; layouts own structure and their visual defaults.
 */
export default function ResolvedProfileLayout({
  profile,
  mobile = true,
  contentSections = null,
}) {
  const appearance = resolveProfileAppearance(profile);
  const layout = canonicalLayoutId(appearance.layout);
  const normalizedProfile = {
    ...profile,
    layout,
    cover_color: profile?.cover_color || appearance.recipe.defaultAccent,
    // Layout owns structural appearance. Legacy Appearance fields may remain in
    // stored records but never reshape a selected layout.
    theme_background_color: null,
    bg_style: "clean",
    avatar_placement: appearance.recipe.avatar,
    font_style: appearance.recipe.typography,
  };
  const props = {
    profile: normalizedProfile,
    color: appearance.accent,
    isDark: appearance.dark,
    mobile,
    contentSections,
  };

  if (layout === "ny_championship") {
    return <NewYorkChampionshipLayout profile={normalizedProfile}>{contentSections}</NewYorkChampionshipLayout>;
  }
  if (layout === "lions_teranga") {
    return <LionsOfTerangaLayout profile={normalizedProfile}>{contentSections}</LionsOfTerangaLayout>;
  }
  return (
    <CanonicalProfileLayout
      profile={normalizedProfile}
      layout={layout}
      accent={props.color}
      mobile={mobile}
      contentSections={contentSections}
    />
  );
}
