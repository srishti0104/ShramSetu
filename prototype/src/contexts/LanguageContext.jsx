import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeI18n, loadTranslations } from '../utils/i18n';
import { loadFonts } from '../utils/fontLoader';
import { persistLanguage, loadSavedLanguage } from '../utils/languageManager';
import { getSupportedLanguages, isLanguageSupported } from '../constants/languages';

/**
 * Language Context for managing app-wide language state
 * @typedef {Object} LanguageContextValue
 * @property {string} language - Current language code
 * @property {function} setLanguage - Function to change language
 * @property {function} t - Translation function
 * @property {boolean} isLoading - Loading state during language changes
 */

const LanguageContext = createContext(null);

/**
 * LanguageProvider component that provides language context to the app
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} [props.defaultLanguage='en'] - Default language code
 */
export function LanguageProvider({ children, defaultLanguage = 'en' }) {
  const [language, setLanguageState] = useState(defaultLanguage);
  const [isLoading, setIsLoading] = useState(true);
  const [i18nInstance, setI18nInstance] = useState(null);

  // Initialize i18n on mount
  useEffect(() => {
    async function initialize() {
      try {
        setIsLoading(true);
        
        // Load saved language preference
        const savedLanguage = loadSavedLanguage();
        const initialLanguage = isLanguageSupported(savedLanguage) ? savedLanguage : defaultLanguage;
        
        console.log(`Initializing LanguageContext with language: ${initialLanguage}`);
        
        // Initialize i18n instance
        const i18n = await initializeI18n(initialLanguage);
        setI18nInstance(i18n);
        
        // Load translation file for initial language
        await loadTranslations(initialLanguage);
        
        // Load fonts for initial language
        await loadFonts(initialLanguage);
        
        // Update state
        setLanguageState(initialLanguage);
        
        console.log(`Language system initialized with: ${initialLanguage}`);
      } catch (error) {
        console.error('Failed to initialize language system:', error);
        // Fallback to default language
        setLanguageState(defaultLanguage);
      } finally {
        setIsLoading(false);
      }
    }

    initialize();
  }, [defaultLanguage]);

  /**
   * Change the current language
   * @param {string} newLanguage - New language code
   * @returns {Promise<boolean>} Success status
   */
  const setLanguage = async (newLanguage) => {
    if (!isLanguageSupported(newLanguage)) {
      console.error(`Unsupported language: ${newLanguage}`);
      return false;
    }

    if (newLanguage === language) {
      return true; // Already using this language
    }

    try {
      setIsLoading(true);
      
      // Load translation file for new language
      const loadSuccess = await loadTranslations(newLanguage);
      if (!loadSuccess) {
        throw new Error(`Failed to load translations for ${newLanguage}`);
      }

      // Change language in i18n instance
      if (i18nInstance) {
        await i18nInstance.changeLanguage(newLanguage);
      }

      // Load fonts for new language
      await loadFonts(newLanguage);

      // Persist language preference
      persistLanguage(newLanguage);

      // Update state
      setLanguageState(newLanguage);

      console.log(`Language changed to: ${newLanguage}`);
      return true;
    } catch (error) {
      console.error(`Failed to change language to ${newLanguage}:`, error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Translation function
   * @param {string} key - Translation key (supports namespace:key format)
   * @param {Object} [params] - Parameters for interpolation
   * @returns {string} Translated string
   */
  const t = (key, params = {}) => {
    if (!i18nInstance) {
      console.warn('i18n instance not initialized, returning key:', key);
      return key;
    }

    try {
      return i18nInstance.t(key, params);
    } catch (error) {
      console.error(`Translation error for key "${key}":`, error);
      return key;
    }
  };

  const contextValue = {
    language,
    setLanguage,
    t,
    isLoading,
    supportedLanguages: getSupportedLanguages(),
    isLanguageSupported
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to access language context
 * @returns {LanguageContextValue} Language context value
 * @throws {Error} If used outside LanguageProvider
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
}

/**
 * Hook to access translation function (alias for useLanguage)
 * @returns {Object} Object containing translation function and language info
 */
export function useTranslation() {
  const { t, language, setLanguage, isLoading } = useLanguage();
  
  return {
    t,
    language,
    setLanguage,
    isLoading
  };
}

export default LanguageContext;