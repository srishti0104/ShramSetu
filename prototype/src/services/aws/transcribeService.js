/**
 * Amazon Transcribe Service
 * 
 * Handles speech-to-text conversion for voice commands
 * Supports Hindi and English
 * Uses Lambda proxy API for better security
 */

class TranscribeService {
  constructor() {
    this.apiUrl = import.meta.env.VITE_TRANSCRIBE_API_URL;
    
    if (!this.apiUrl) {
      console.warn('⚠️ VITE_TRANSCRIBE_API_URL not configured. Transcribe service will not work.');
    }
  }

  /**
   * Transcribe audio to text using Lambda proxy
   * @param {Blob} audioBlob - Audio blob from recording
   * @param {string} language - Language code ('hi-IN' for Hindi, 'en-IN' for English)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Transcription result
   */
  async transcribeAudio(audioBlob, language = 'hi-IN', userId = 'anonymous') {
    try {
      console.log('🎤 Starting transcription via Lambda proxy...');
      console.log('📊 Audio blob size:', audioBlob.size, 'bytes');
      console.log('📊 Audio blob type:', audioBlob.type);
      console.log('🌐 Language:', language);

      if (!this.apiUrl) {
        throw new Error('Transcribe API URL not configured. Please set VITE_TRANSCRIBE_API_URL in .env');
      }

      // Convert audio blob to base64 for API transmission
      const base64Audio = await this.blobToBase64(audioBlob);
      
      // Determine audio format
      let audioFormat = 'webm';
      if (audioBlob.type.includes('mp4')) {
        audioFormat = 'mp4';
      } else if (audioBlob.type.includes('wav')) {
        audioFormat = 'wav';
      } else if (audioBlob.type.includes('mp3')) {
        audioFormat = 'mp3';
      }

      console.log('🎵 Audio format:', audioFormat);
      console.log('📤 Sending to Lambda proxy:', this.apiUrl);

      // Call Lambda proxy API
      const response = await fetch(`${this.apiUrl}/transcribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio: base64Audio,
          audioFormat: audioFormat,
          languageCode: language,
          userId: userId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      console.log('✅ Transcription complete:', result.text);

      return {
        success: true,
        text: result.text || '',
        confidence: result.confidence || 0,
        language: result.language || language,
        jobName: result.jobName,
        warning: result.warning
      };
    } catch (error) {
      console.error('❌ Transcription error:', error);
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message
      });
      
      // Provide more specific error messages
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Network error. Please check your internet connection.');
      } else if (error.message.includes('API URL not configured')) {
        throw new Error('Transcribe service not configured. Please contact support.');
      }
      
      throw new Error(`Failed to transcribe audio: ${error.message}`);
    }
  }

  /**
   * Convert Blob to Base64
   * @param {Blob} blob - Audio blob
   * @returns {Promise<string>} Base64 encoded string
   */
  async blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Remove data URL prefix (e.g., "data:audio/webm;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Transcribe with automatic language detection
   * @param {Blob} audioBlob - Audio blob
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Transcription result
   */
  async transcribeWithAutoDetect(audioBlob, userId = 'anonymous') {
    try {
      // Try Hindi first (most common for Shram Setu users)
      return await this.transcribeAudio(audioBlob, 'hi-IN', userId);
    } catch (error) {
      console.log('Hindi transcription failed, trying English...');
      // Fallback to English
      return await this.transcribeAudio(audioBlob, 'en-IN', userId);
    }
  }

  /**
   * Get supported languages
   * @returns {Array} List of supported language codes
   */
  getSupportedLanguages() {
    return [
      { code: 'hi-IN', name: 'Hindi', nativeName: 'हिंदी' },
      { code: 'en-IN', name: 'English (India)', nativeName: 'English' },
      { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்' },
      { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు' },
      { code: 'mr-IN', name: 'Marathi', nativeName: 'मराठी' },
      { code: 'bn-IN', name: 'Bengali', nativeName: 'বাংলা' }
    ];
  }
}

export default new TranscribeService();
