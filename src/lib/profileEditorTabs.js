import { Info, Star, Link2, Palette, Share2, Settings } from "lucide-react";

/**
 * Clean Edit Profile architecture, aligned to the approved Figma structure.
 * Media, Business and Lost Mode are intentionally excluded from this editor
 * because they live in their own dedicated workspace/pages.
 */
export function getProfileEditorTabs(lang = "en") {
  const labels = lang === "fr"
    ? {
        info: "Infos",
        profileType: "Type de profil",
        links: "Liens",
        design: "Design",
        share: "Partager",
        settings: "Paramètres",
      }
    : {
        info: "Info",
        profileType: "Profile Type",
        links: "Links",
        design: "Design",
        share: "Share",
        settings: "Settings",
      };

  return [
    { id: "info", label: labels.info, icon: Info },
    { id: "profiletype", label: labels.profileType, icon: Star },
    { id: "links", label: labels.links, icon: Link2 },
    { id: "design", label: labels.design, icon: Palette },
    { id: "share", label: labels.share, icon: Share2 },
    { id: "settings", label: labels.settings, icon: Settings },
  ];
}

export const PROFILE_EDITOR_TAB_IDS = [
  "info",
  "profiletype",
  "links",
  "design",
  "share",
  "settings",
];
