
"use client";

import React, { createContext, useState, useContext, ReactNode, useCallback, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
// Removed AI translation imports


// type Translations = { [key: string]: string };

import englishTranslations from './translations.en';
import hindiTranslations from './translations.hi';

interface LanguageContextType {
  language: string;
  languageCode: string;
  setLanguage: (language: string, code: string) => void;
  t: (key: string) => string;
  loading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation loading overlay removed (no longer needed)

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState('English');
  const [languageCode, setLanguageCode] = useState('en');
  const { toast } = useToast();

  // Only two languages: English and Hindi
  const setLanguage = (langName: string, langCode: string) => {
    if (langCode === languageCode) return;
    setLanguageState(langName);
    setLanguageCode(langCode);
  };

  // Use static translations
  const t = useCallback((key: string): string => {
    if (languageCode === 'hi') {
      return hindiTranslations[key] || englishTranslations[key] || key;
    }
    return englishTranslations[key] || key;
  }, [languageCode]);

  const value = { language, languageCode, setLanguage, t, loading: false };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
