/**
 * Voice Feedback Utility
 * 
 * @fileoverview Provides voice feedback for user actions
 */

import voiceService from '../services/voice/voiceService';

/**
 * Voice feedback messages in multiple languages
 */
const FEEDBACK_MESSAGES = {
  // Success messages
  success: {
    en: 'Success',
    hi: 'सफल'
  },
  saved: {
    en: 'Saved successfully',
    hi: 'सफलतापूर्वक सहेजा गया'
  },
  submitted: {
    en: 'Submitted successfully',
    hi: 'सफलतापूर्वक सबमिट किया गया'
  },
  verified: {
    en: 'Verified successfully',
    hi: 'सफलतापूर्वक सत्यापित'
  },
  selected: {
    en: 'Selected',
    hi: 'चयनित'
  },
  
  // Error messages
  error: {
    en: 'Error occurred',
    hi: 'त्रुटि हुई'
  },
  invalid: {
    en: 'Invalid input',
    hi: 'अमान्य इनपुट'
  },
  failed: {
    en: 'Operation failed',
    hi: 'ऑपरेशन विफल'
  },
  
  // Navigation messages
  next: {
    en: 'Moving to next step',
    hi: 'अगले चरण पर जा रहे हैं'
  },
  back: {
    en: 'Going back',
    hi: 'वापस जा रहे हैं'
  },
  
  // Action messages
  loading: {
    en: 'Loading',
    hi: 'लोड हो रहा है'
  },
  processing: {
    en: 'Processing',
    hi: 'प्रोसेस हो रहा है'
  },
  sending: {
    en: 'Sending',
    hi: 'भेजा जा रहा है'
  },
  
  // Form messages
  required: {
    en: 'This field is required',
    hi: 'यह फ़ील्ड आवश्यक है'
  },
  tooShort: {
    en: 'Input is too short',
    hi: 'इनपुट बहुत छोटा है'
  },
  tooLong: {
    en: 'Input is too long',
    hi: 'इनपुट बहुत लंबा है'
  }
};

/**
 * Voice Feedback Class
 */
class VoiceFeedback {
  constructor() {
    this.enabled = true;
    this.queue = [];
    this.isPlaying = false;
  }

  /**
   * Enable voice feedback
   */
  enable() {
    this.enabled = true;
  }

  /**
   * Disable voice feedback
   */
  disable() {
    this.enabled = false;
  }

  /**
   * Play voice feedback
   * @param {string} messageKey - Message key from FEEDBACK_MESSAGES
   * @param {string} language - Language code
   * @param {Object} options - Additional options
   */
  async play(messageKey, language = 'en', options = {}) {
    if (!this.enabled) return;

    const message = FEEDBACK_MESSAGES[messageKey]?.[language] || messageKey;
    
    if (options.queue && this.isPlaying) {
      this.queue.push({ message, language, options });
      return;
    }

    try {
      this.isPlaying = true;
      await voiceService.speak(message, language, {
        rate: options.rate || 1.2, // Faster for feedback
        ...options
      });
      this.isPlaying = false;

      // Play next in queue
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        this.play(next.message, next.language, next.options);
      }
    } catch (error) {
      console.error('Voice feedback error:', error);
      this.isPlaying = false;
    }
  }

  /**
   * Play success feedback
   * @param {string} language - Language code
   */
  success(language = 'en') {
    return this.play('success', language);
  }

  /**
   * Play error feedback
   * @param {string} language - Language code
   */
  error(language = 'en') {
    return this.play('error', language);
  }

  /**
   * Play saved feedback
   * @param {string} language - Language code
   */
  saved(language = 'en') {
    return this.play('saved', language);
  }

  /**
   * Play submitted feedback
   * @param {string} language - Language code
   */
  submitted(language = 'en') {
    return this.play('submitted', language);
  }

  /**
   * Play verified feedback
   * @param {string} language - Language code
   */
  verified(language = 'en') {
    return this.play('verified', language);
  }

  /**
   * Play selected feedback
   * @param {string} language - Language code
   */
  selected(language = 'en') {
    return this.play('selected', language);
  }

  /**
   * Play navigation feedback
   * @param {string} direction - 'next' or 'back'
   * @param {string} language - Language code
   */
  navigate(direction, language = 'en') {
    return this.play(direction, language);
  }

  /**
   * Play loading feedback
   * @param {string} language - Language code
   */
  loading(language = 'en') {
    return this.play('loading', language);
  }

  /**
   * Play processing feedback
   * @param {string} language - Language code
   */
  processing(language = 'en') {
    return this.play('processing', language);
  }

  /**
   * Play custom message
   * @param {string} message - Custom message
   * @param {string} language - Language code
   */
  custom(message, language = 'en') {
    return this.play(message, language);
  }

  /**
   * Clear feedback queue
   */
  clearQueue() {
    this.queue = [];
  }

  /**
   * Stop current feedback
   */
  stop() {
    voiceService.stop();
    this.isPlaying = false;
    this.clearQueue();
  }
}

// Create singleton instance
const voiceFeedback = new VoiceFeedback();

export default voiceFeedback;
export { FEEDBACK_MESSAGES };
