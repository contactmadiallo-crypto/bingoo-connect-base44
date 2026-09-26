import { MobileSelect } from "@/components/ui/mobile-select";
import { useI18n } from "@/lib/I18nContext";
import { t } from "@/lib/i18n";

export default function LanguageSwitcher({ language, onLanguageChange, compact = false }) {
  const global = useI18n();
  const activeLanguage = language || global.language;
  const changeLanguage = onLanguageChange || global.setLanguage;
  const languages = Object.entries(global.languages).map(([code, meta]) => ({
    value: code,
    label: `${meta.flag} ${meta.nativeName}`,
  }));

  return (
    <MobileSelect
      value={activeLanguage}
      onValueChange={changeLanguage}
      options={languages}
      placeholder={t("language_placeholder", activeLanguage)}
      ariaLabel={t("language_select", activeLanguage)}
      className={compact ? "w-[140px]" : "w-[180px]"}
    />
  );
}
