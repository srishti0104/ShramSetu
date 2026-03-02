import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

/**
 * Initialize i18n instance with configuration
 * @param {string} defaultLanguage - Default language code (defaults to 'en')
 * @returns {Promise<typeof i18n>} Initialized i18n instance
 */
export async function initializeI18n(defaultLanguage = 'en') {
  // Use the provided defaultLanguage (which should come from LanguageContext)
  console.log(`Initializing i18n with language: ${defaultLanguage}`);

  await i18n
    .use(initReactI18next)
    .init({
      lng: defaultLanguage, // Use the provided language directly
      fallbackLng: 'en',
      supportedLngs: ['hi', 'en', 'mr', 'gu', 'ta', 'te', 'kn', 'ml', 'bn', 'pa'],
      ns: ['common', 'onboarding', 'dashboard', 'jobs', 'attendance', 'ledger', 'payslip', 'grievance', 'rating', 'sync'],
      defaultNS: 'common',
      
      interpolation: {
        escapeValue: false, // React already escapes values
      },

      react: {
        useSuspense: false, // Disable suspense for better control
      },

      // Log missing translations in development
      saveMissing: true,
      missingKeyHandler: (lngs, ns, key) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Missing translation: [${lngs}] ${ns}:${key}`);
        }
      },
    });

  console.log(`i18n initialized with language: ${i18n.language}`);
  return i18n;
}

/**
 * Load translations for a specific language
 * @param {string} languageCode - Language code to load
 * @returns {Promise<boolean>} Success status
 */
export async function loadTranslations(languageCode) {
  try {
    // Check if already loaded
    if (i18n.hasResourceBundle(languageCode, 'common')) {
      return true;
    }

    // Dynamically import translation file
    const translations = await import(`../locales/${languageCode}/translation.json`);
    
    // Add resource bundle for each namespace
    const data = translations.default || translations;
    Object.keys(data).forEach(namespace => {
      i18n.addResourceBundle(languageCode, namespace, data[namespace], true, true);
    });

    return true;
  } catch (error) {
    console.error(`Failed to load translations for ${languageCode}:`, error);
    
    // Fallback to English if not already English
    if (languageCode !== 'en') {
      console.warn(`Falling back to English translations`);
      return loadTranslations('en');
    }
    
    return false;
  }
}

export default i18n;
