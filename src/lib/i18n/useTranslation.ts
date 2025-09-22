"use client";

import { useLanguage } from './LanguageContext';

export function useTranslation() {
  const { language, setLanguage, t, tHtml } = useLanguage();

  return {
    language,
    setLanguage,
    t,
    tHtml,
    // Helper function for pluralization
    tPlural: (key: string, count: number, fallback?: string) => {
      const pluralKey = count === 1 ? `${key}_singular` : `${key}_plural`;
      return t(pluralKey, fallback || t(key, fallback));
    },
    // Helper function for interpolation
    tInterpolate: (key: string, values: Record<string, string | number>, fallback?: string) => {
      let translation = t(key, fallback);
      Object.entries(values).forEach(([placeholder, value]) => {
        translation = translation.replace(`{{${placeholder}}}`, String(value));
      });
      return translation;
    }
  };
}
