/**
 * Amazon Transcribe Service
 * 
 * Handles speech-to-text conversion for voice commands
 * Supports Hindi and English
 */

import { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand } from '@aws-sdk/client-transcribe';
import s3Service from './s3Service';

class TranscribeService {
  constructor() {
    this.client = new TranscribeClient({
      region: import.meta.env.VITE_AWS_REGION || 'ap-south-1',
      credentials: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
      }
    });
  }

  /**
   * Transcribe audio to text
   * @param {Blob} audioBlob - Audio blob from recording
   * @param {string} language - Language code ('hi-IN' for Hindi, 'en-IN' for English)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Transcription result
   */
  async transcribeAudio(audioBlob, language = 'hi-IN', userId = 'anonymous') {
    try {
      console.log('🎤 Starting transcription...');

      // Step 1: Upload audio to S3
      const uploadResult = await s3Service.uploadAudio(audioBlob, userId);
      console.log('✅ Audio uploaded to S3:', uploadResult.fileUrl);

      // Step 2: Start transcription job
      const jobName = `transcribe-${Date.now()}`;
      const command = new StartTranscriptionJobCommand({
        TranscriptionJobName: jobName,
        LanguageCode: language,
        MediaFormat: 'webm',
        Media: {
          MediaFileUri: uploadResult.fileUrl
        },
        OutputBucketName: uploadResult.bucket,
        Settings: {
          ShowSpeakerLabels: false,
          MaxSpeakerLabels: 1
        }
      });

      await this.client.send(command);
      console.log('✅ Transcription job started:', jobName);

      // Step 3: Wait for transcription to complete
      const transcription = await this.waitForTranscription(jobName);
      
      console.log('✅ Transcription complete:', transcription.text);

      return {
        success: true,
        text: transcription.text,
        confidence: transcription.confidence,
        language,
        jobName,
        audioUrl: uploadResult.fileUrl
      };
    } catch (error) {
      console.error('❌ Transcription error:', error);
      throw new Error(`Failed to transcribe audio: ${error.message}`);
    }
  }

  /**
   * Wait for transcription job to complete
   * @param {string} jobName - Transcription job name
   * @param {number} maxAttempts - Maximum polling attempts
   * @returns {Promise<Object>} Transcription result
   */
  async waitForTranscription(jobName, maxAttempts = 30) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const command = new GetTranscriptionJobCommand({
        TranscriptionJobName: jobName
      });

      const response = await this.client.send(command);
      const status = response.TranscriptionJob.TranscriptionJobStatus;

      console.log(`📊 Transcription status (${attempt + 1}/${maxAttempts}):`, status);

      if (status === 'COMPLETED') {
        // Fetch transcription result
        const transcriptUri = response.TranscriptionJob.Transcript.TranscriptFileUri;
        const transcriptResponse = await fetch(transcriptUri);
        const transcriptData = await transcriptResponse.json();

        const text = transcriptData.results.transcripts[0].transcript;
        const confidence = this.calculateAverageConfidence(transcriptData.results.items);

        return { text, confidence };
      } else if (status === 'FAILED') {
        throw new Error('Transcription job failed');
      }

      // Wait 2 seconds before next attempt
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    throw new Error('Transcription timeout');
  }

  /**
   * Calculate average confidence score
   * @param {Array} items - Transcription items
   * @returns {number} Average confidence (0-1)
   */
  calculateAverageConfidence(items) {
    if (!items || items.length === 0) return 0;

    const confidenceScores = items
      .filter(item => item.alternatives && item.alternatives[0])
      .map(item => parseFloat(item.alternatives[0].confidence));

    if (confidenceScores.length === 0) return 0;

    const sum = confidenceScores.reduce((a, b) => a + b, 0);
    return sum / confidenceScores.length;
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
