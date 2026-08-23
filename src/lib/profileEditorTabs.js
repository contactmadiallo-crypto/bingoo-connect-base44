import { Info, Layers3, Link2, Palette, Share2, Settings } from "lucide-react";
import { t } from "@/lib/i18n";

export function getProfileEditorTabs(lang) {
  return [
    { id: "info", label: t("info", lang), icon: Info },
    { id: "profiletype", label: "Profile Type", icon: Layers3 },
    { id: "links", label: t("links", lang), icon: Link2 },
    { id: "design", label: t("design", lang), icon: Palette },
    { id: "share", label: t("share", lang), icon: Share2 },
    { id: "settings", label: t("settings", lang), icon: Settings },
  ];
}

export const REMOVED_PROFILE_EDITOR_TABS = ["media", "business", "lostmode"];
