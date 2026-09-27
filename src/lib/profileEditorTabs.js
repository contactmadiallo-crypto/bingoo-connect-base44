import { Info, Layers3, Link2, Palette, LayoutGrid } from "lucide-react";
import { t } from "@/lib/i18n";

export function getProfileEditorTabs(lang) {
  return [
    { id: "info", label: t("info", lang), icon: Info },
    { id: "profiletype", label: "Profile Type", icon: Layers3 },
    { id: "links", label: t("links", lang), icon: Link2 },
    { id: "design", label: t("design", lang), icon: Palette },
    { id: "layouts", label: "Layouts", icon: LayoutGrid },
  ];
}

export const REMOVED_PROFILE_EDITOR_TABS = ["media", "business", "lostmode", "share", "settings"];
