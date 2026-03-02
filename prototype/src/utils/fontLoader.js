import { getLanguageConfig } from '../constants/languages';

/**
 * Cache for loaded fonts to avoid duplicate loading
 */
const loadedFonts = new Set();

/**
 * Google Fonts base URL for loading fonts
 */
const GOOGLE_FONTS_BASE_URL = 'https://fonts.googleapis.com/css2';

/**
 * Font configurations for different languages
 * Maps language codes to Google Fonts family names
 */
const FONT_CONFIGS = {
  hi: 'Noto+Sans+Devanagari:wght@300;400;500;600;700',
  mr: 'Noto+Sans+Devanagari:wght@300;400;500;600;700',
  pa: 'Noto+Sans+Gurmukhi:wght@300;400;500;600;700',
  gu: 'Noto+Sans+Gujarati:wght@300;400;500;600;700',
  ta: 'Noto+Sans+Tamil:wght@300;400;500;600;700',
  te: 'Noto+Sans+Telugu:wght@300;400;500;600;700',
  kn: 'Noto+Sans+Kannada:wght@300;400;500;600;700',
  ml: 'Noto+Sans+Malayalam:wght@300;400;500;600;700',
  bn: 'Noto+Sans+Bengali:wght@300;400;500;600;700',
  en: 'Inter:wght@300;400;500;600;700' // Default font for English
};

/**
 * Load fonts for a specific language
 * @param {string} languageCode - Language code
 * @returns {Promise<boolean>} Success status
 */
export async function loadFonts(languageCode) {
  try {
    const languageConfig = getLanguageConfig(languageCode);
    if (!languageConfig) {
      console.warn(`No language config found for: ${languageCode}`);
      return false;
    }

    // Check if font already loaded
    if (loadedFonts.has(languageCode)) {
      console.log(`Font already loaded for language: ${languageCode}`);
      applyFontToDocument(languageConfig.font);
      return true;
    }

    // Get font configuration
    const fontFamily = FONT_CONFIGS[languageCode];
    if (!fontFamily) {
      console.warn(`No font configuration found for language: ${languageCode}`);
      // Apply fallback font
      applyFontToDocument(languageConfig.font);
      return true;
    }

    // Load font from Google Fonts
    const fontUrl = `${GOOGLE_FONTS_BASE_URL}?family=${fontFamily}&display=swap`;
    const success = await loadFontFromUrl(fontUrl);

    if (success) {
      // Mark as loaded
      loadedFonts.add(languageCode);
      
      // Apply font to document
      applyFontToDocument(languageConfig.font);
      
      console.log(`Font loaded successfully for language: ${languageCode}`);
      return true;
    } else {
      throw new Error(`Failed to load font from URL: ${fontUrl}`);
    }
  } catch (error) {
    console.error(`Font loading failed for language ${languageCode}:`, error);
    
    // Apply fallback font
    const languageConfig = getLanguageConfig(languageCode);
    if (languageConfig) {
      applyFontToDocument(languageConfig.font);
    }
    
    return false;
  }
}

/**
 * Load font from a URL by creating a link element
 * @param {string} fontUrl - Font URL to load
 * @returns {Promise<boolean>} Success status
 */
function loadFontFromUrl(fontUrl) {
  return new Promise((resolve) => {
    // Check if font link already exists
    const existingLink = document.querySelector(`link[href="${fontUrl}"]`);
    if (existingLink) {
      resolve(true);
      return;
    }

    // Create link element for font
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fontUrl;
    link.crossOrigin = 'anonymous';

    // Handle load success
    link.onload = () => {
      console.log(`Font loaded from URL: ${fontUrl}`);
      resolve(true);
    };

    // Handle load error
    link.onerror = (error) => {
      console.error(`Failed to load font from URL: ${fontUrl}`, error);
      resolve(false);
    };

    // Add to document head
    document.head.appendChild(link);

    // Timeout fallback
    setTimeout(() => {
      console.warn(`Font loading timeout for URL: ${fontUrl}`);
      resolve(false);
    }, 5000);
  });
}

/**
 * Apply font to document root
 * @param {string} fontFamily - Font family to apply
 */
function applyFontToDocument(fontFamily) {
  try {
    // Apply to document root
    document.documentElement.style.setProperty('--primary-font', fontFamily);
    document.body.style.fontFamily = fontFamily;
    
    console.log(`Applied font to document: ${fontFamily}`);
  } catch (error) {
    console.error('Failed to apply font to document:', error);
  }
}

/**
 * Preload fonts for multiple languages
 * @param {string[]} languageCodes - Array of language codes
 * @returns {Promise<boolean[]>} Array of success statuses
 */
export async function preloadFonts(languageCodes) {
  console.log(`Preloading fonts for languages: ${languageCodes.join(', ')}`);
  
  const promises = languageCodes.map(code => loadFonts(code));
  const results = await Promise.all(promises);
  
  const successCount = results.filter(Boolean).length;
  console.log(`Preloaded ${successCount}/${languageCodes.length} fonts successfully`);
  
  return results;
}

/**
 * Get list of loaded fonts
 * @returns {string[]} Array of loaded language codes
 */
export function getLoadedFonts() {
  return Array.from(loadedFonts);
}

/**
 * Clear font cache (useful for testing)
 */
export function clearFontCache() {
  loadedFonts.clear();
  console.log('Font cache cleared');
}

/**
 * Check if font is loaded for a language
 * @param {string} languageCode - Language code to check
 * @returns {boolean} True if font is loaded
 */
export function isFontLoaded(languageCode) {
  return loadedFonts.has(languageCode);
}