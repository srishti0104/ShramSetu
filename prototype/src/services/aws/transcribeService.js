/**
 * Amazon Transcribe Service
 * 
 * Handles speech-to-text conversion for voice commands
 * Uses AWS Transcribe as primary with Web Speech API fallback
 * Automatically translates to English for consistent job postings
 * Supports Hindi and English
 */

import translationService from '../ai/translationService.js';

class TranscribeService {
  constructor() {
    // AWS Transcribe configuration
    this.apiUrl = import.meta.env.VITE_TRANSCRIBE_API_URL;
    this.awsAccessKey = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
    this.awsSecretKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
    this.awsRegion = import.meta.env.VITE_AWS_REGION || 'ap-south-1';
    
    // Web Speech API fallback
    this.webSpeechSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    
    console.log('🔄 Transcribe Service initialized');
    console.log('📍 AWS API URL:', this.apiUrl);
    console.log('🎤 Web Speech API supported:', this.webSpeechSupported);
  }

  /**
   * Transcribe audio to text - uses AWS Transcribe as primary source
   * @param {Blob} audioBlob - Audio blob from recording
   * @param {string} language - Language code ('hi-IN' for Hindi, 'en-IN' for English)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Transcription result
   */
  async transcribeAudio(audioBlob, language = 'hi-IN', userId = 'anonymous') {
    try {
      console.log('🎤 Starting transcription with AWS Transcribe...');
      console.log('📊 Audio blob size:', audioBlob.size, 'bytes');
      console.log('📊 Audio blob type:', audioBlob.type);
      console.log('🌐 Language:', language);

      if (!this.apiUrl) {
        throw new Error('Transcribe API URL not configured');
      }

      // Convert audio blob to base64
      const base64Audio = await this.blobToBase64(audioBlob);
      
      // Determine audio format
      let audioFormat = 'webm';
      if (audioBlob.type.includes('mp4')) audioFormat = 'mp4';
      else if (audioBlob.type.includes('wav')) audioFormat = 'wav';
      else if (audioBlob.type.includes('mp3')) audioFormat = 'mp3';

      console.log('🎵 Audio format:', audioFormat);
      console.log('📤 Sending to AWS Transcribe API:', this.apiUrl);

      // Use simple headers to avoid CORS preflight issues
      const headers = {
        'Content-Type': 'application/json'
      };

      console.log('🔐 Using simple authentication');

      const response = await fetch(`${this.apiUrl}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          audio: base64Audio,
          audioFormat: audioFormat,
          languageCode: language,
          userId: userId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API request failed: ${response.status}`);
      }

      const result = await response.json();
      
      console.log('✅ AWS Transcribe successful:', result.text);
      
      // Translate to English if translation service is available
      let finalText = result.text || '';
      let translationResult = null;
      
      if (finalText && translationService.isAvailable()) {
        console.log('🌐 Translating transcribed text to English...');
        translationResult = await translationService.translateToEnglish(finalText, language);
        
        if (translationResult.success) {
          finalText = translationResult.translatedText;
          console.log('✅ Translation completed:', finalText);
        } else {
          console.log('⚠️ Translation failed, using original text');
        }
      }
      
      return {
        success: true,
        text: finalText,
        originalText: result.text || '',
        confidence: result.confidence || 0,
        language: result.language || language,
        source: 'aws-transcribe',
        translation: translationResult
      };
    } catch (error) {
      console.log('⚠️ AWS Transcribe failed, falling back to Web Speech API:', error.message);
      
      if (this.webSpeechSupported) {
        return await this.transcribeWithWebSpeech(language);
      } else {
        console.error('❌ Transcription error:', error);
        console.error('❌ Error details:', error);
        throw new Error('Network error. Please check your internet connection.');
      }
    }
  }

  /**
   * Transcribe using Web Speech API (fallback)
   */
  async transcribeWithWebSpeech(language) {
    if (!this.webSpeechSupported) {
      throw new Error('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.');
    }

    return new Promise((resolve, reject) => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      // Configure recognition
      recognition.lang = language;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      let hasResult = false;

      recognition.onresult = async (event) => {
        hasResult = true;
        const result = event.results[0][0];
        const text = result.transcript;
        const confidence = result.confidence;

        console.log('✅ Web Speech transcription:', text);
        console.log('📊 Confidence:', (confidence * 100).toFixed(1) + '%');

        // Translate to English if translation service is available
        let finalText = text;
        let translationResult = null;
        
        if (text && translationService.isAvailable()) {
          console.log('🌐 Translating transcribed text to English...');
          translationResult = await translationService.translateToEnglish(text, language);
          
          if (translationResult.success) {
            finalText = translationResult.translatedText;
            console.log('✅ Translation completed:', finalText);
          } else {
            console.log('⚠️ Translation failed, using original text');
          }
        }

        resolve({
          success: true,
          text: finalText,
          originalText: text,
          confidence: confidence,
          language: language,
          source: 'web-speech-api',
          translation: translationResult
        });
      };

      recognition.onerror = (event) => {
        console.error('❌ Web Speech error:', event.error);
        
        let errorMessage = 'Speech recognition failed';
        switch (event.error) {
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access.';
            break;
          case 'no-speech':
            errorMessage = 'No speech detected. Please speak clearly.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not found or not working.';
            break;
          case 'network':
            errorMessage = 'Network error. Please check your internet connection.';
            break;
          case 'service-not-allowed':
            errorMessage = 'Speech recognition service not allowed.';
            break;
        }
        
        reject(new Error(errorMessage));
      };

      recognition.onend = () => {
        if (!hasResult) {
          reject(new Error('No speech detected. Please try speaking again.'));
        }
      };

      // Start recognition
      try {
        recognition.start();
        console.log('🎤 Web Speech recognition started...');
      } catch (error) {
        reject(new Error('Failed to start speech recognition: ' + error.message));
      }
    });
  }

  /**
   * Convert Blob to Base64
   */
  async blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Transcribe with automatic language detection
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
   */
  getSupportedLanguages() {
    return [
      { code: 'hi-IN', name: 'Hindi', nativeName: 'हिंदी' },
      { code: 'en-IN', name: 'English (India)', nativeName: 'English' },
      { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்' },
      { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు' },
      { code: 'mr-IN', name: 'Marathi', nativeName: 'मराठी' },
      { code: 'bn-IN', name: 'Bengali', nativeName: 'বাংলা' },
      { code: 'gu-IN', name: 'Gujarati', nativeName: 'ગુજરાતી' },
      { code: 'pa-IN', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' }
    ];
  }

  /**
   * Check if transcribe service is available
   */
  isAvailable() {
    return this.apiUrl && this.webSpeechSupported; // AWS Transcribe with Web Speech fallback
  }
}

export default new TranscribeService();
