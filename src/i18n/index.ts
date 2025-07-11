
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from './locales/en.json';
import srTranslations from './locales/sr.json';
import ruTranslations from './locales/ru.json';

const resources = {
  en: {
    translation: enTranslations
  },
  sr: {
    translation: srTranslations
  },
  ru: {
    translation: ruTranslations
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: true, // Enable debug to see what's happening
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'querystring', 'navigator', 'htmlTag'],
      lookupQuerystring: 'lng',
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },

    // Ensure immediate language switching
    react: {
      useSuspense: false,
    }
  });

// Add event listener to force re-render when language changes
i18n.on('languageChanged', (lng) => {
  console.log('Language changed to:', lng);
  // Force a small delay to ensure all components re-render
  setTimeout(() => {
    window.dispatchEvent(new Event('languageChanged'));
  }, 50);
});

export default i18n;
