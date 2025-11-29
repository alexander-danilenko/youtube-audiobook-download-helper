import enTranslations from './locales/en.json';
import ukTranslations from './locales/uk.json';

// Export type for translation keys based on English structure
export type TranslationKey = keyof typeof enTranslations;

// Export translations object
export const translations = {
  en: enTranslations,
  uk: ukTranslations,
} as const;

export type Language = keyof typeof translations;

