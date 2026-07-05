import React from "react";
import { MobileSelect } from "@/components/ui/mobile-select";
import { Globe } from "lucide-react";

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
];

export default function LanguageSwitcher({ language, onLanguageChange, compact = false }) {
  return (
    <MobileSelect
      value={language}
      onValueChange={onLanguageChange}
      options={languages.map(lang => ({ value: lang.code, label: lang.flag + ' ' + lang.name }))}
      placeholder="Language"
      ariaLabel="Select language"
      className={compact ? "w-[120px]" : "w-[160px]"}
    />
  );
}