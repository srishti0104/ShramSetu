import { isLanguageSupported } from '../constants/languages';

/**
 * Key used for storing language preference in localStorage
 */
const LANGUAGE_STORAGE_KEY = 'app_language';

/**
 * Persist language preference to localStorage and update OnboardingContext if available
 * @param {string} languageCode - Language code to persist
 * @returns {boolean} Success status
 */
export function persistLanguage(languageCode) {
  try {
    // Validate language code
    if (!isLanguageSupported(languageCode)) {
      console.error(`Cannot persist unsupported language: ${languageCode}`);
      return false;
    }

    // Save to localStorage
    localStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
    
    // Update OnboardingContext if it exists
    // This is a global check to see if onboarding context is available
    if (typeof window !== 'undefined' && window.onboardingContext) {
      try {
        window.onboardingContext.updateState({ language: languageCode });
        console.log(`Updated OnboardingContext with language: ${languageCode}`);
      } catch (error) {
        console.warn('Failed to update OnboardingContext:', error);
      }
    }

    console.log(`Language preference persisted: ${languageCode}`);
    return true;
  } catch (error) {
    console.error('Failed to persist language preference:', error);
    return false;
  }
}

/**
 * Load saved language preference from localStorage
 * @returns {string} Saved language code or 'en' as default
 */
export function loadSavedLanguage() {
  try {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    
    if (savedLanguage && isLanguageSupported(savedLanguage)) {
      console.log(`Loaded saved language: ${savedLanguage}`);
      return savedLanguage;
    }
    
    console.log('No valid saved language found, defaulting to English');
    return 'en';
  } catch (error) {
    console.error('Failed to load saved language:', error);
    return 'en';
  }
}

/**
 * Clear saved language preference
 * @returns {boolean} Success status
 */
export function clearLanguagePreference() {
  try {
    localStorage.removeItem(LANGUAGE_STORAGE_KEY);
    console.log('Language preference cleared');
    return true;
  } catch (error) {
    console.error('Failed to clear language preference:', error);
    return false;
  }
}

/**
 * Check if localStorage is available
 * @returns {boolean} True if localStorage is available
 */
export function isStorageAvailable() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    console.warn('localStorage is not available:', error);
    return false;
  }
}

/**
 * Get language preference with fallback for environments without localStorage
 * @param {string} [fallback='en'] - Fallback language if storage unavailable
 * @returns {string} Language code
 */
export function getLanguagePreference(fallback = 'en') {
  if (!isStorageAvailable()) {
    console.warn('Storage unavailable, using fallback language:', fallback);
    return fallback;
  }
  
  return loadSavedLanguage();
}

/**
 * Set language preference with fallback for environments without localStorage
 * @param {string} languageCode - Language code to set
 * @returns {boolean} Success status
 */
export function setLanguagePreference(languageCode) {
  if (!isStorageAvailable()) {
    console.warn('Storage unavailable, cannot persist language preference');
    return false;
  }
  
  return persistLanguage(languageCode);
}