/**
 * Voice Assistant API Client
 * 
 * @fileoverview Client for voice command processing API
 */

/**
 * @typedef {import('../../types/voice.js').VoiceCommand} VoiceCommand
 * @typedef {import('../../types/voice.js').VoiceResponse} VoiceResponse
 * @typedef {import('../../types/common.js').LanguageCode} LanguageCode
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

/**
 * Upload audio file to S3 (MOCK)
 * @param {Blob} audioBlob - Audio blob
 * @returns {Promise<string>} S3 URL
 */
async function uploadAudio(audioBlob) {
  console.log('[MOCK] Uploading audio to S3:', audioBlob.size, 'bytes');
  
  // MOCK: In production, get presigned URL and upload to S3
  // const presignedUrl = await getPresignedUploadUrl();
  // await fetch(presignedUrl, {
  //   method: 'PUT',
  //   body: audioBlob,
  //   headers: { 'Content-Type': audioBlob.type }
  // });
  // return getS3Url();
  
  // Mock S3 URL
  return `https://mock-s3.amazonaws.com/audio/${Date.now()}.webm`;
}

/**
 * Process voice command
 * @param {Blob} audioBlob - Audio blob
 * @param {LanguageCode} languageCode - Language code
 * @param {string} userId - User ID
 * @param {string} [sessionId] - Session ID
 * @param {string} [accessToken] - JWT access token
 * @returns {Promise<Object>} Voice command response
 */
export async function processVoiceCommand(audioBlob, languageCode, userId, sessionId, accessToken) {
  try {
    // Step 1: Upload audio to S3
    const audioUrl = await uploadAudio(audioBlob);
    
    // Step 2: Call voice processing Lambda
    console.log('[MOCK] Processing voice command:', { audioUrl, languageCode, userId });
    
    // MOCK: In production, call actual API
    // const response = await fetch(`${API_BASE_URL}/voice/process-command`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${accessToken}`
    //   },
    //   body: JSON.stringify({
    //     audioUrl,
    //     languageCode,
    //     userId,
    //     sessionId
    //   })
    // });
    
    // if (!response.ok) {
    //   throw new Error('Failed to process voice command');
    // }
    
    // const data = await response.json();
    // return data.data;
    
    // Mock response
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing time
    
    return {
      commandId: `cmd-${Date.now()}`,
      sessionId: sessionId || `session-${Date.now()}`,
      transcription: {
        text: languageCode === 'hi' ? 'मुझे मुंबई में काम चाहिए' : 'I need work in Mumbai',
        confidence: 0.95
      },
      intent: {
        type: 'search_jobs',
        confidence: 0.92,
        slots: {
          location: 'Mumbai'
        }
      },
      response: {
        text: languageCode === 'hi' ? 'मैंने 5 नौकरियां पाईं' : 'I found 5 jobs',
        audioUrl: `https://mock-s3.amazonaws.com/audio/response-${Date.now()}.mp3`,
        audioDuration: 3.5
      },
      actionResult: {
        action: 'search_jobs',
        data: {
          jobs: [
            { jobId: '1', title: 'Construction Worker', location: 'Mumbai' },
            { jobId: '2', title: 'Plumber', location: 'Mumbai' },
            { jobId: '3', title: 'Electrician', location: 'Mumbai' },
            { jobId: '4', title: 'Carpenter', location: 'Mumbai' },
            { jobId: '5', title: 'Painter', location: 'Mumbai' }
          ]
        }
      }
    };
  } catch (error) {
    console.error('Failed to process voice command:', error);
    throw error;
  }
}

/**
 * Get conversation context
 * @param {string} sessionId - Session ID
 * @param {string} accessToken - JWT access token
 * @returns {Promise<Object>} Conversation context
 */
export async function getConversationContext(sessionId, accessToken) {
  try {
    console.log('[MOCK] Getting conversation context:', sessionId);
    
    // MOCK: In production, call actual API
    // const response = await fetch(`${API_BASE_URL}/voice/context/${sessionId}`, {
    //   headers: {
    //     'Authorization': `Bearer ${accessToken}`
    //   }
    // });
    
    // if (!response.ok) {
    //   throw new Error('Failed to get conversation context');
    // }
    
    // const data = await response.json();
    // return data.data;
    
    // Mock context
    return {
      sessionId,
      languageCode: 'hi',
      state: 'idle',
      currentIntent: null,
      contextData: {},
      conversationHistory: [],
      turnCount: 0,
      startedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to get conversation context:', error);
    throw error;
  }
}

/**
 * Clear conversation context
 * @param {string} sessionId - Session ID
 * @param {string} accessToken - JWT access token
 * @returns {Promise<void>}
 */
export async function clearConversationContext(sessionId, accessToken) {
  try {
    console.log('[MOCK] Clearing conversation context:', sessionId);
    
    // MOCK: In production, call actual API
    // await fetch(`${API_BASE_URL}/voice/context/${sessionId}`, {
    //   method: 'DELETE',
    //   headers: {
    //     'Authorization': `Bearer ${accessToken}`
    //   }
    // });
  } catch (error) {
    console.error('Failed to clear conversation context:', error);
    throw error;
  }
}

/**
 * Get supported languages
 * @returns {Promise<Object[]>} Supported languages
 */
export async function getSupportedLanguages() {
  return [
    { code: 'hi', name: 'हिंदी', nativeName: 'Hindi' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'mr', name: 'मराठी', nativeName: 'Marathi' },
    { code: 'gu', name: 'ગુજરાતી', nativeName: 'Gujarati' },
    { code: 'ta', name: 'தமிழ்', nativeName: 'Tamil' },
    { code: 'te', name: 'తెలుగు', nativeName: 'Telugu' },
    { code: 'kn', name: 'ಕನ್ನಡ', nativeName: 'Kannada' },
    { code: 'ml', name: 'മലയാളം', nativeName: 'Malayalam' },
    { code: 'bn', name: 'বাংলা', nativeName: 'Bengali' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ', nativeName: 'Punjabi' }
  ];
}
