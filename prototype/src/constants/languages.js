/**
 * Language configuration for all supported languages
 * @typedef {Object} LanguageConfig
 * @property {string} code - ISO 639-1 language code
 * @property {string} name - Native name of the language
 * @property {string} nativeName - English name of the language
 * @property {string} flag - Emoji flag representation
 * @property {string} font - Font family for the language
 * @property {'ltr'|'rtl'} direction - Text direction
 */

/**
 * Configuration for all supported languages
 * @type {Record<string, LanguageConfig>}
 */
export const LANGUAGE_CONFIGS = {
  hi: {
    code: 'hi',
    name: 'हिंदी',
    nativeName: 'Hindi',
    flag: '🇮🇳',
    font: 'Noto Sans Devanagari, sans-serif',
    direction: 'ltr'
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    font: 'Inter, system-ui, sans-serif',
    direction: 'ltr'
  },
  mr: {
    code: 'mr',
    name: 'मराठी',
    nativeName: 'Marathi',
    flag: '🇮🇳',
    font: 'Noto Sans Devanagari, sans-serif',
    direction: 'ltr'
  },
  gu: {
    code: 'gu',
    name: 'ગુજરાતી',
    nativeName: 'Gujarati',
    flag: '🇮🇳',
    font: 'Noto Sans Gujarati, sans-serif',
    direction: 'ltr'
  },
  ta: {
    code: 'ta',
    name: 'தமிழ்',
    nativeName: 'Tamil',
    flag: '🇮🇳',
    font: 'Noto Sans Tamil, sans-serif',
    direction: 'ltr'
  },
  te: {
    code: 'te',
    name: 'తెలుగు',
    nativeName: 'Telugu',
    flag: '🇮🇳',
    font: 'Noto Sans Telugu, sans-serif',
    direction: 'ltr'
  },
  kn: {
    code: 'kn',
    name: 'ಕನ್ನಡ',
    nativeName: 'Kannada',
    flag: '🇮🇳',
    font: 'Noto Sans Kannada, sans-serif',
    direction: 'ltr'
  },
  ml: {
    code: 'ml',
    name: 'മലയാളം',
    nativeName: 'Malayalam',
    flag: '🇮🇳',
    font: 'Noto Sans Malayalam, sans-serif',
    direction: 'ltr'
  },
  bn: {
    code: 'bn',
    name: 'বাংলা',
    nativeName: 'Bengali',
    flag: '🇮🇳',
    font: 'Noto Sans Bengali, sans-serif',
    direction: 'ltr'
  },
  pa: {
    code: 'pa',
    name: 'ਪੰਜਾਬੀ',
    nativeName: 'Punjabi',
    flag: '🇮🇳',
    font: 'Noto Sans Gurmukhi, sans-serif',
    direction: 'ltr'
  }
};

/**
 * Get array of all supported language codes
 * @returns {string[]} Array of language codes
 */
export function getSupportedLanguages() {
  return Object.keys(LANGUAGE_CONFIGS);
}

/**
 * Check if a language code is supported
 * @param {string} code - Language code to check
 * @returns {boolean} True if supported
 */
export function isLanguageSupported(code) {
  return code in LANGUAGE_CONFIGS;
}

/**
 * Get language configuration by code
 * @param {string} code - Language code
 * @returns {LanguageConfig|null} Language configuration or null if not found
 */
export function getLanguageConfig(code) {
  return LANGUAGE_CONFIGS[code] || null;
}
