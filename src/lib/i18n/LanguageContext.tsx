"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Import translation files statically
import enTranslations from './translations/en.json';
import trTranslations from './translations/tr.json';

export type Language = 'en' | 'tr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  tHtml: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

// Translation data
const translations = { 
  en: enTranslations,
  tr: trTranslations,
};

// Helper function to get nested object value by dot notation
const getNestedValue = (obj: Record<string, unknown>, path: string): string | undefined => {
  const keys = path.split('.');
  let current: unknown = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && current !== null && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  
  return typeof current === 'string' ? current : undefined;
};

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('en');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('seengroup-language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'tr')) {
      setLanguageState(savedLanguage);
    } else {
      // Detect browser language
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('tr')) {
        setLanguageState('tr');
      } else {
        setLanguageState('en');
      }
    }
  }, []);

  // Save language to localStorage when it changes
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('seengroup-language', lang);
    
    // Update HTML lang attribute
    document.documentElement.lang = lang;
  };

  // Translation function for plain text
  const t = (key: string, fallback?: string): string => {
    try {
      const translation = getNestedValue(translations[language], key);
      return translation || fallback || key;
    } catch (error) {
      console.warn(`Translation not found for key: ${key} in language: ${language}`, error);
      return fallback || key;
    }
  };

  // Translation function for HTML content
  const tHtml = (key: string, fallback?: string): string => {
    try {
      const translation = getNestedValue(translations[language], key);
      return translation || fallback || key;
    } catch (error) {
      console.warn(`Translation not found for key: ${key} in language: ${language}`, error);
      return fallback || key;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tHtml }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
