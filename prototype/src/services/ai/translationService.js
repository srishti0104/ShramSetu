/**
 * Translation Service using Google Gemini AI
 * 
 * Translates text from any language to English
 * Used for voice input to ensure consistent English job postings
 */

class TranslationService {
  constructor() {
    this.geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    
    console.log('🌐 Translation Service initialized');
    console.log('🔑 Gemini API available:', !!this.geminiApiKey);
  }

  /**
   * Translate text to English using Google Gemini
   * @param {string} text - Text to translate
   * @param {string} sourceLanguage - Source language (optional, auto-detect if not provided)
   * @returns {Promise<Object>} Translation result
   */
  async translateToEnglish(text, sourceLanguage = 'auto') {
    if (!text || !text.trim()) {
      return {
        success: true,
        originalText: text,
        translatedText: text,
        sourceLanguage: 'unknown',
        targetLanguage: 'en'
      };
    }

    // If text is already in English, return as-is
    if (this.isEnglish(text)) {
      console.log('📝 Text appears to be English, no translation needed');
      return {
        success: true,
        originalText: text,
        translatedText: text,
        sourceLanguage: 'en',
        targetLanguage: 'en',
        confidence: 1.0
      };
    }

    try {
      console.log('🌐 Translating text to English:', text);
      
      if (!this.geminiApiKey) {
        throw new Error('Gemini API key not configured');
      }

      const prompt = `Translate the following text to English. If it's already in English, return it as-is. Only return the translated text, nothing else:

"${text}"`;

      const response = await fetch(`${this.apiUrl}?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 200,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Translation API failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
        throw new Error('Invalid response from translation API');
      }

      const translatedText = result.candidates[0].content.parts[0].text.trim();
      
      console.log('✅ Translation successful:');
      console.log('📝 Original:', text);
      console.log('🔄 Translated:', translatedText);

      return {
        success: true,
        originalText: text,
        translatedText: translatedText,
        sourceLanguage: sourceLanguage,
        targetLanguage: 'en',
        confidence: 0.9
      };

    } catch (error) {
      console.error('❌ Translation error:', error);
      
      // Fallback: return original text if translation fails
      return {
        success: false,
        originalText: text,
        translatedText: text, // Fallback to original
        sourceLanguage: sourceLanguage,
        targetLanguage: 'en',
        error: error.message,
        confidence: 0.0
      };
    }
  }

  /**
   * Simple heuristic to check if text is likely English
   * @param {string} text - Text to check
   * @returns {boolean} True if text appears to be English
   */
  isEnglish(text) {
    if (!text) return true;
    
    // Check for common English words
    const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const words = text.toLowerCase().split(/\s+/);
    const englishWordCount = words.filter(word => englishWords.includes(word)).length;
    
    // Check for non-Latin scripts (Hindi, Tamil, etc.)
    const hasNonLatinScript = /[\u0900-\u097F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F]/.test(text);
    
    // If has non-Latin script, definitely not English
    if (hasNonLatinScript) {
      return false;
    }
    
    // If more than 20% are common English words, likely English
    return englishWordCount / words.length > 0.2;
  }

  /**
   * Check if translation service is available
   */
  isAvailable() {
    return !!this.geminiApiKey;
  }
}

export default new TranslationService();