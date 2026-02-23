/**
 * Voice Service
 * 
 * @fileoverview Provides voice synthesis and recognition services
 * Supports Web Speech API with hooks for AWS Polly/Transcribe integration
 */

import pollyService from '../aws/pollyService';

/**
 * Language voice mappings for Web Speech API
 */
const VOICE_LANGUAGE_MAP = {
  hi: 'hi-IN',
  en: 'en-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  bn: 'bn-IN',
  pa: 'pa-IN'
};

/**
 * Voice Service Class
 */
class VoiceService {
  constructor() {
    this.synthesis = window.speechSynthesis;
    this.recognition = null;
    this.currentUtterance = null;
    this.isPlaying = false;
    this.useAWSPolly = false; // Flag for AWS Polly integration
    this.useAWSTranscribe = false; // Flag for AWS Transcribe integration
    
    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
    }
  }

  /**
   * Speak text using voice synthesis
   * @param {string} text - Text to speak
   * @param {string} language - Language code (e.g., 'hi', 'en')
   * @param {Object} options - Additional options
   * @returns {Promise<void>}
   */
  async speak(text, language = 'en', options = {}) {
    // If AWS Polly is enabled, use it instead
    if (this.useAWSPolly) {
      return this.speakWithPolly(text, language, options);
    }

    return new Promise((resolve, reject) => {
      // Stop any ongoing speech
      this.stop();

      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = VOICE_LANGUAGE_MAP[language] || 'en-IN';
      utterance.rate = options.rate || 0.9;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;

      // Get appropriate voice
      const voices = this.synthesis.getVoices();
      const voice = voices.find(v => v.lang === utterance.lang) || voices[0];
      if (voice) {
        utterance.voice = voice;
      }

      // Event handlers
      utterance.onstart = () => {
        this.isPlaying = true;
        if (options.onStart) options.onStart();
      };

      utterance.onend = () => {
        this.isPlaying = false;
        this.currentUtterance = null;
        if (options.onEnd) options.onEnd();
        resolve();
      };

      utterance.onerror = (error) => {
        this.isPlaying = false;
        this.currentUtterance = null;
        console.error('Speech synthesis error:', error);
        if (options.onError) options.onError(error);
        reject(error);
      };

      // Store and speak
      this.currentUtterance = utterance;
      this.synthesis.speak(utterance);
    });
  }

  /**
   * Speak using AWS Polly (placeholder for future integration)
   * @param {string} text - Text to speak
   * @param {string} language - Language code
   * @param {Object} options - Additional options
   * @returns {Promise<void>}
   */
  async speakWithPolly(text, language, options = {}) {
    try {
      await pollyService.speak(text, language, options);
    } catch (error) {
      console.error('AWS Polly error, falling back to Web Speech API:', error);
      // Fallback to Web Speech API
      this.useAWSPolly = false;
      return this.speak(text, language, options);
    }
  }

  /**
   * Stop current speech
   */
  stop() {
    // Stop AWS Polly if enabled
    if (this.useAWSPolly) {
      pollyService.stop();
    }
    
    // Stop Web Speech API
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
    this.isPlaying = false;
    this.currentUtterance = null;
  }

  /**
   * Pause current speech
   */
  pause() {
    // Pause AWS Polly if enabled
    if (this.useAWSPolly) {
      pollyService.pause();
      this.isPlaying = false;
      return;
    }
    
    // Pause Web Speech API
    if (this.synthesis.speaking && !this.synthesis.paused) {
      this.synthesis.pause();
      this.isPlaying = false;
    }
  }

  /**
   * Resume paused speech
   */
  resume() {
    // Resume AWS Polly if enabled
    if (this.useAWSPolly) {
      pollyService.resume();
      this.isPlaying = true;
      return;
    }
    
    // Resume Web Speech API
    if (this.synthesis.paused) {
      this.synthesis.resume();
      this.isPlaying = true;
    }
  }

  /**
   * Toggle play/pause
   */
  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else if (this.synthesis.paused) {
      this.resume();
    }
  }

  /**
   * Start voice recognition
   * @param {string} language - Language code
   * @param {Object} options - Recognition options
   * @returns {Promise<string>}
   */
  async recognize(language = 'en', options = {}) {
    // If AWS Transcribe is enabled, use it instead
    if (this.useAWSTranscribe) {
      return this.recognizeWithTranscribe(language, options);
    }

    if (!this.recognition) {
      throw new Error('Speech recognition not supported in this browser');
    }

    return new Promise((resolve, reject) => {
      this.recognition.lang = VOICE_LANGUAGE_MAP[language] || 'en-IN';
      this.recognition.maxAlternatives = options.maxAlternatives || 1;

      this.recognition.onstart = () => {
        if (options.onStart) options.onStart();
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        
        if (options.onResult) {
          options.onResult({ transcript, confidence });
        }
        
        resolve(transcript);
      };

      this.recognition.onerror = (error) => {
        console.error('Speech recognition error:', error);
        if (options.onError) options.onError(error);
        reject(error);
      };

      this.recognition.onend = () => {
        if (options.onEnd) options.onEnd();
      };

      this.recognition.start();
    });
  }

  /**
   * Recognize using AWS Transcribe (placeholder for future integration)
   * @param {string} language - Language code
   * @param {Object} options - Recognition options
   * @returns {Promise<string>}
   */
  async recognizeWithTranscribe(language, options = {}) {
    console.log('[MOCK] AWS Transcribe recognition:', { language, options });
    // TODO: Integrate with AWS Transcribe
    // const transcribe = new AWS.TranscribeService();
    // Start streaming transcription...
    return Promise.resolve('Mock transcription result');
  }

  /**
   * Stop voice recognition
   */
  stopRecognition() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  /**
   * Check if speech synthesis is supported
   * @returns {boolean}
   */
  isSynthesisSupported() {
    return 'speechSynthesis' in window;
  }

  /**
   * Check if speech recognition is supported
   * @returns {boolean}
   */
  isRecognitionSupported() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  /**
   * Get available voices
   * @returns {Array}
   */
  getVoices() {
    return this.synthesis.getVoices();
  }

  /**
   * Enable AWS Polly for speech synthesis
   */
  enableAWSPolly() {
    this.useAWSPolly = true;
  }

  /**
   * Enable AWS Transcribe for speech recognition
   */
  enableAWSTranscribe() {
    this.useAWSTranscribe = true;
  }

  /**
   * Disable AWS services (use Web Speech API)
   */
  disableAWSServices() {
    this.useAWSPolly = false;
    this.useAWSTranscribe = false;
  }
}

// Create singleton instance
const voiceService = new VoiceService();

export default voiceService;
