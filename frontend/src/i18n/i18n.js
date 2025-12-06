import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    resources: {
      en: {
        translation: {}
      },
      te: {
        translation: {}
      },
      hi: {
        translation: {}
      }
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    react: {
      useSuspense: false
    }
  });

// Load translations dynamically
const loadTranslations = async (language) => {
  try {
    const response = await fetch(`/locales/${language}/translation.json`);
    const translations = await response.json();
    i18n.addResourceBundle(language, 'translation', translations, true, true);
  } catch (error) {
    console.error(`Failed to load ${language} translations:`, error);
  }
};

// Load all translations on init
['en', 'te', 'hi'].forEach(lang => {
  loadTranslations(lang);
});

export default i18n;
