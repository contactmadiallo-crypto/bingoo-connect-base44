import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getLang, setLang as persistLang, t as translate, SUPPORTED_LANGUAGES } from '@/lib/i18n';

const I18nContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => getLang());

  const setLanguage = (next) => {
    const normalized = SUPPORTED_LANGUAGES[next] ? next : 'en';
    persistLang(normalized);
    setLanguageState(normalized);
  };

  useEffect(() => {
    const meta = SUPPORTED_LANGUAGES[language] || SUPPORTED_LANGUAGES.en;
    document.documentElement.lang = language;
    document.documentElement.dir = meta.dir || 'ltr';
  }, [language]);

  useEffect(() => {
    const sync = (event) => {
      if (event.key === 'bingoo_lang' && event.newValue && SUPPORTED_LANGUAGES[event.newValue]) {
        setLanguageState(event.newValue);
      }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const value = useMemo(() => ({
    language,
    setLanguage,
    languages: SUPPORTED_LANGUAGES,
    t: (key, vars) => {
      let value = translate(key, language);
      if (vars && typeof value === 'string') {
        for (const [name, replacement] of Object.entries(vars)) {
          value = value.replaceAll(`{{${name}}}`, String(replacement));
        }
      }
      return value;
    },
  }), [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside LanguageProvider');
  return ctx;
}
