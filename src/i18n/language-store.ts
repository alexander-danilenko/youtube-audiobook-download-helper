import { create } from 'zustand';
import { Language } from './translations';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

const defaultLanguage: Language = (() => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('app-language');
    if (stored === 'en' || stored === 'uk') {
      return stored;
    }
    // Try to detect from browser
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'uk') {
      return 'uk';
    }
  }
  return 'en';
})();

export const useLanguageStore = create<LanguageState>((set) => ({
  language: defaultLanguage,
  setLanguage: (language: Language) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('app-language', language);
    }
    set({ language });
  },
}));
