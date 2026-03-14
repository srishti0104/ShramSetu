/**
 * AWS Polly Service
 * 
 * @fileoverview Service for Amazon Polly text-to-speech integration
 */

import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';
import awsConfig from '../../config/aws-config';

/**
 * Voice ID mappings for different languages
 */
const POLLY_VOICE_MAP = {
  hi: { voiceId: 'Aditi', engine: 'standard', languageCode: 'hi-IN' },
  en: { voiceId: 'Kajal', engine: 'neural', languageCode: 'en-IN' },
  'hi-IN': { voiceId: 'Aditi', engine: 'standard', languageCode: 'hi-IN' },
  'en-IN': { voiceId: 'Kajal', engine: 'neural', languageCode: 'en-IN' },
  'en-US': { voiceId: 'Joanna', engine: 'neural', languageCode: 'en-US' }
};

/**
 * AWS Polly Service Class
 */
class PollyService {
  constructor() {
    this.client = null;
    this.audioCache = new Map();
    this.currentAudio = null;
    this.isPlaying = false;
  }

  /**
   * Initialize Polly client
   * @param {Object} config - AWS configuration
   */
  initialize(config = {}) {
    const region = config.region || awsConfig.region;
    const credentials = config.credentials || awsConfig.credentials;
    
    // Force credentials check
    if (!credentials) {
      console.error('❌ AWS credentials not available for Polly');
      throw new Error('AWS credentials are required for Polly service');
    }
    
    console.log('🔑 Initializing Polly with credentials:', {
      region,
      hasAccessKey: !!credentials.accessKeyId,
      hasSecretKey: !!credentials.secretAccessKey,
      accessKeyPrefix: credentials.accessKeyId ? credentials.accessKeyId.substring(0, 8) + '...' : 'missing'
    });
    
    this.client = new PollyClient({
      region,
      credentials
    });
    
    console.log('✅ Polly client initialized successfully');
  }

  /**
   * Get voice configuration for language
   * @param {string} language - Language code
   * @returns {Object} Voice configuration
   */
  getVoiceConfig(language) {
    return POLLY_VOICE_MAP[language] || POLLY_VOICE_MAP['en'];
  }

  /**
   * Synthesize speech using AWS Polly
   * @param {string} text - Text to speak
   * @param {string} language - Language code
   * @param {Object} options - Additional options
   * @returns {Promise<void>}
   */
  async speak(text, language = 'en', options = {}) {
    if (!this.client) {
      this.initialize();
    }

    try {
      // Stop any currently playing audio
      this.stop();

      // Check cache first
      const cacheKey = `${language}:${text}`;
      let audioBlob = this.audioCache.get(cacheKey);

      if (!audioBlob) {
        // Get voice configuration
        const voiceConfig = this.getVoiceConfig(language);

        // Prepare Polly parameters
        const params = {
          Text: text,
          OutputFormat: 'mp3',
          VoiceId: voiceConfig.voiceId,
          LanguageCode: voiceConfig.languageCode,
          Engine: voiceConfig.engine
        };

        // Call Polly
        const command = new SynthesizeSpeechCommand(params);
        const response = await this.client.send(command);

        // Convert audio stream to blob
        const audioStream = response.AudioStream;
        const chunks = [];
        for await (const chunk of audioStream) {
          chunks.push(chunk);
        }
        audioBlob = new Blob(chunks, { type: 'audio/mp3' });

        // Cache the audio (limit cache size)
        if (this.audioCache.size > 50) {
          const firstKey = this.audioCache.keys().next().value;
          this.audioCache.delete(firstKey);
        }
        this.audioCache.set(cacheKey, audioBlob);
      }

      // Play the audio
      await this.playAudio(audioBlob, options);
    } catch (error) {
      console.error('Polly speech error:', error);
      if (options.onError) {
        options.onError(error);
      }
      throw error;
    }
  }

  /**
   * Play audio blob
   * @param {Blob} audioBlob - Audio blob to play
   * @param {Object} options - Playback options
   * @returns {Promise<void>}
   */
  async playAudio(audioBlob, options = {}) {
    return new Promise((resolve, reject) => {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      // Set audio properties
      audio.volume = options.volume || 1;
      audio.playbackRate = options.rate || 1;

      // Event handlers
      audio.onplay = () => {
        this.isPlaying = true;
        if (options.onStart) options.onStart();
      };

      audio.onended = () => {
        this.isPlaying = false;
        this.currentAudio = null;
        URL.revokeObjectURL(audioUrl);
        if (options.onEnd) options.onEnd();
        resolve();
      };

      audio.onerror = (error) => {
        this.isPlaying = false;
        this.currentAudio = null;
        URL.revokeObjectURL(audioUrl);
        console.error('Audio playback error:', error);
        if (options.onError) options.onError(error);
        reject(error);
      };

      // Store and play
      this.currentAudio = audio;
      audio.play().catch(reject);
    });
  }

  /**
   * Stop current audio playback
   */
  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.isPlaying = false;
  }

  /**
   * Pause current audio playback
   */
  pause() {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
      this.isPlaying = false;
    }
  }

  /**
   * Resume paused audio playback
   */
  resume() {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play();
      this.isPlaying = true;
    }
  }

  /**
   * Clear audio cache
   */
  clearCache() {
    this.audioCache.clear();
  }

  /**
   * Check if Polly is available
   * @returns {boolean}
   */
  isAvailable() {
    return this.client !== null;
  }

  /**
   * Get cache size
   * @returns {number}
   */
  getCacheSize() {
    return this.audioCache.size;
  }
}

// Create singleton instance
const pollyService = new PollyService();

export default pollyService;
