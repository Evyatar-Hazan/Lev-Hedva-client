import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en.json';
import heTranslations from './locales/he.json';

// Language detection configuration
const languageDetector = new LanguageDetector();
languageDetector.addDetector({
  name: 'customDetector',
  lookup() {
    // Check localStorage first
    const stored = localStorage.getItem('i18nextLng');
    if (stored) return stored;

    // Check browser language
    const browserLang = navigator.language || navigator.languages[0];
    if (browserLang.startsWith('he')) return 'he';
    if (browserLang.startsWith('en')) return 'en';

    // Default fallback
    return 'he';
  },
});

const resources = {
  en: {
    translation: enTranslations,
  },
  he: {
    translation: heTranslations,
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'he',
    debug: process.env.NODE_ENV === 'development',

    // Language detection
    detection: {
      order: ['localStorage', 'customDetector', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false,
    },

    // RTL support
    react: {
      useSuspense: false,
    },
  });

// Update document direction and language
i18n.on('languageChanged', (lng) => {
  const isRTL = lng === 'he';
  document.documentElement.lang = lng;
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  document.body.style.direction = isRTL ? 'rtl' : 'ltr';
  
  // Store the language preference
  localStorage.setItem('i18nextLng', lng);
});

// Set initial direction
const currentLang = i18n.language || i18n.options.fallbackLng;
const isRTL = currentLang === 'he';
document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
document.body.style.direction = isRTL ? 'rtl' : 'ltr';

export default i18n;