import {
  ClassicLayout, MinimalLayout, CardLayout, ImageHeroLayout, GlassLayout,
  DarkPremiumLayout, AuroraLayout, MagazineLayout, ExecutiveLayout,
  ModernSaasLayout, SalonLayout, LawFirmLayout, CorporateLayout,
} from "./ProfileLayoutRenderer";
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

  switch (layout) {
    case "minimal": return <MinimalLayout {...props} />;
    case "card": return <CardLayout {...props} />;
    case "image_hero": return <ImageHeroLayout {...props} />;
    case "glassmorphic": return <GlassLayout {...props} />;
    case "dark": return <DarkPremiumLayout {...props} />;
    case "aurora": return <AuroraLayout {...props} />;
    case "magazine": return <MagazineLayout {...props} />;
    case "executive": return <ExecutiveLayout {...props} />;
    case "premium_salon": return <SalonLayout {...props} />;
    case "modern_law": return <LawFirmLayout {...props} />;
    case "corporate": return <CorporateLayout {...props} />;
    case "modern_saas": return <ModernSaasLayout {...props} />;
    case "ny_championship":
      return <NewYorkChampionshipLayout profile={normalizedProfile}>{contentSections}</NewYorkChampionshipLayout>;
    case "lions_teranga":
      return <LionsOfTerangaLayout profile={normalizedProfile}>{contentSections}</LionsOfTerangaLayout>;
    default: return <ClassicLayout {...props} />;
  }
}
