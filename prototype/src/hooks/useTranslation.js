import { useLanguage } from '../contexts/LanguageContext';

/**
 * Custom hook for accessing translation functionality
 * This is a convenience hook that provides the same functionality as useLanguage
 * but with a more familiar API for developers used to react-i18next
 * 
 * @returns {Object} Translation hook result
 * @returns {function} t - Translation function
 * @returns {string} language - Current language code
 * @returns {function} setLanguage - Function to change language
 * @returns {boolean} isLoading - Loading state during language changes
 * @returns {string[]} supportedLanguages - Array of supported language codes
 * @returns {function} isLanguageSupported - Function to check if language is supported
 */
export function useTranslation() {
  const context = useLanguage();
  
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  
  const { 
    t, 
    language, 
    setLanguage, 
    isLoading, 
    supportedLanguages, 
    isLanguageSupported 
  } = context;
  
  return {
    t,
    language,
    setLanguage,
    isLoading,
    supportedLanguages,
    isLanguageSupported
  };
}

/**
 * Hook for accessing only the translation function
 * Useful when you only need the translation function and not other language state
 * 
 * @returns {function} Translation function
 */
export function useT() {
  const { t } = useTranslation();
  return t;
}

/**
 * Hook for accessing language switching functionality
 * Useful for language switcher components
 * 
 * @returns {Object} Language switching result
 * @returns {string} language - Current language code
 * @returns {function} setLanguage - Function to change language
 * @returns {boolean} isLoading - Loading state during language changes
 * @returns {string[]} supportedLanguages - Array of supported language codes
 */
export function useLanguageSwitcher() {
  const { 
    language, 
    setLanguage, 
    isLoading, 
    supportedLanguages 
  } = useTranslation();
  
  return {
    language,
    setLanguage,
    isLoading,
    supportedLanguages
  };
}

export default useTranslation;