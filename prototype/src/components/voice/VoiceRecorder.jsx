/**
 * Voice Recorder Component
 * 
 * @fileoverview Audio recording using Web Audio API with mock transcription
 * Records audio and simulates voice command processing for demo
 */

import { useState, useRef, useEffect } from 'react';
import './VoiceRecorder.css';
import transcribeService from '../../services/aws/transcribeService';
import authService from '../../services/aws/authService';

// Mock responses for demo
const MOCK_RESPONSES = {
  'job': {
    transcription: 'मुझे निर्माण का काम चाहिए',
    translation: 'I need construction work',
    response: 'I found 5 construction jobs near you. The closest one is at Sector 15, paying ₹600 per day.',
    action: 'job_search'
  },
  'attendance': {
    transcription: 'मेरी उपस्थिति दर्ज करें',
    translation: 'Mark my attendance',
    response: 'Your attendance has been marked for today at 9:30 AM. Session code: 4582',
    action: 'mark_attendance'
  },
  'payment': {
    transcription: 'मेरा वेतन कब मिलेगा',
    translation: 'When will I get my salary',
    response: 'Your pending payment of ₹4,200 for 7 days of work will be processed on Friday.',
    action: 'check_payment'
  },
  'grievance': {
    transcription: 'मुझे शिकायत दर्ज करनी है',
    translation: 'I want to file a complaint',
    response: 'I understand you want to file a complaint. Please describe the issue and I will help you.',
    action: 'file_grievance'
  },
  'default': {
    transcription: 'नमस्ते, मैं श्रम सेतु का उपयोग करना चाहता हूं',
    translation: 'Hello, I want to use Shram Setu',
    response: 'Welcome to Shram Setu! I can help you with: finding jobs, marking attendance, checking payments, or filing complaints. What would you like to do?',
    action: 'welcome'
  }
};

/**
 * Voice Recorder Component
 * @param {Object} props
 * @param {(audioBlob: Blob) => Promise<void>} [props.onRecordingComplete] - Callback when recording is complete
 * @param {number} [props.maxDuration] - Maximum recording duration in seconds
 * @param {string} [props.className] - Additional CSS classes
 */
export default function VoiceRecorder({
  onRecordingComplete,
  maxDuration = 60,
  className = ''
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [translation, setTranslation] = useState('');
  const [response, setResponse] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('hi');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [useRealTranscribe, setUseRealTranscribe] = useState(false);
  const [confidence, setConfidence] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    return () => {
      stopRecording();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  /**
   * Start recording audio
   */
  const startRecording = async () => {
    try {
      setError('');
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // Set up audio analyzer for visualization
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      
      // Start visualizing audio level
      visualizeAudioLevel();
      
      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Process the audio (mock for demo)
        if (audioBlob.size > 0) {
          await processAudio(audioBlob);
          
          // Call callback if provided
          if (onRecordingComplete) {
            await onRecordingComplete(audioBlob);
          }
        }
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1;
          
          // Auto-stop at max duration
          if (newDuration >= maxDuration) {
            stopRecording();
          }
          
          return newDuration;
        });
      }, 1000);
      
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to access microphone. Please check permissions.');
    }
  };

  /**
   * Stop recording audio
   */
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  /**
   * Visualize audio level
   */
  const visualizeAudioLevel = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateLevel = () => {
      if (!isRecording) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate average level
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const normalizedLevel = Math.min(100, (average / 255) * 100);
      
      setAudioLevel(normalizedLevel);
      
      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };
    
    updateLevel();
  };

  /**
   * Process audio with real AWS Transcribe or mock transcription
   * @param {Blob} audioBlob
   */
  const processAudio = async (audioBlob) => {
    setIsProcessing(true);
    setTranscription('');
    setTranslation('');
    setResponse('');
    setConfidence(null);
    
    try {
      if (useRealTranscribe) {
        // Real AWS Transcribe
        console.log('🎤 Using AWS Transcribe...');
        
        try {
          const user = authService.getUser();
          const userId = user?.userId || 'anonymous';
          
          // Map UI language to AWS language code
          const languageMap = {
            'hi': 'hi-IN',
            'en': 'en-IN',
            'mr': 'mr-IN',
            'bn': 'bn-IN',
            'ta': 'ta-IN',
            'te': 'te-IN'
          };
          
          const awsLanguageCode = languageMap[selectedLanguage] || 'hi-IN';
          
          // Transcribe audio
          const result = await transcribeService.transcribeAudio(
            audioBlob,
            awsLanguageCode,
            userId
          );
          
          console.log('✅ Transcription result:', result);
          
          setTranscription(result.text);
          setConfidence(result.confidence);
          
          // Generate mock response based on transcribed text
          const mockResponse = generateResponseFromText(result.text);
          
          await new Promise(resolve => setTimeout(resolve, 500));
          setTranslation(mockResponse.translation);
          
          await new Promise(resolve => setTimeout(resolve, 500));
          setResponse(mockResponse.response);
          
          // Add to conversation history
          setConversationHistory(prev => [...prev, {
            timestamp: new Date(),
            transcription: result.text,
            translation: mockResponse.translation,
            response: mockResponse.response,
            action: mockResponse.action,
            confidence: result.confidence
          }]);
          
        } catch (transcribeError) {
          console.error('AWS Transcribe error:', transcribeError);
          
          // Check if it's an account activation issue
          if (transcribeError.message.includes('subscription') || transcribeError.message.includes('Access Key')) {
            setError('AWS account not fully activated yet. Using mock mode instead. Please wait 24 hours after registration.');
            setUseRealTranscribe(false);
            
            // Fall back to mock mode
            await new Promise(resolve => setTimeout(resolve, 1000));
            const mockData = MOCK_RESPONSES['default'];
            setTranscription(mockData.transcription);
            setTranslation(mockData.translation);
            setResponse(mockData.response);
            
            setConversationHistory(prev => [...prev, {
              timestamp: new Date(),
              transcription: mockData.transcription,
              translation: mockData.translation,
              response: mockData.response,
              action: mockData.action
            }]);
          } else {
            throw transcribeError;
          }
        }
        
      } else {
        // Mock transcription
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const responseKeys = Object.keys(MOCK_RESPONSES);
        const randomKey = duration > 3 
          ? responseKeys[Math.floor(Math.random() * (responseKeys.length - 1))]
          : 'default';
        
        const mockData = MOCK_RESPONSES[randomKey];
        
        setTranscription(mockData.transcription);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setTranslation(mockData.translation);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setResponse(mockData.response);
        
        setConversationHistory(prev => [...prev, {
          timestamp: new Date(),
          transcription: mockData.transcription,
          translation: mockData.translation,
          response: mockData.response,
          action: mockData.action
        }]);
      }
      
      // Text-to-speech
      if ('speechSynthesis' in window && response) {
        const utterance = new SpeechSynthesisUtterance(response);
        utterance.lang = selectedLanguage === 'hi' ? 'hi-IN' : 'en-IN';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }
      
    } catch (err) {
      console.error('Failed to process audio:', err);
      setError(`Failed to process voice command: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Generate response based on transcribed text
   * @param {string} text
   * @returns {Object}
   */
  const generateResponseFromText = (text) => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('job') || lowerText.includes('work') || lowerText.includes('काम') || lowerText.includes('नौकरी')) {
      return {
        translation: 'Looking for work/job',
        response: 'I found 5 construction jobs near you. The closest one is at Sector 15, paying ₹600 per day.',
        action: 'job_search'
      };
    } else if (lowerText.includes('attendance') || lowerText.includes('उपस्थिति') || lowerText.includes('हाजिरी')) {
      return {
        translation: 'Mark attendance',
        response: 'Your attendance has been marked for today. Session code: 4582',
        action: 'mark_attendance'
      };
    } else if (lowerText.includes('payment') || lowerText.includes('salary') || lowerText.includes('वेतन') || lowerText.includes('पैसा')) {
      return {
        translation: 'Check payment/salary',
        response: 'Your pending payment of ₹4,200 for 7 days of work will be processed on Friday.',
        action: 'check_payment'
      };
    } else if (lowerText.includes('complaint') || lowerText.includes('grievance') || lowerText.includes('शिकायत')) {
      return {
        translation: 'File complaint/grievance',
        response: 'I understand you want to file a complaint. Please describe the issue and I will help you.',
        action: 'file_grievance'
      };
    } else {
      return {
        translation: text,
        response: 'I heard you. How can I help you with jobs, attendance, payments, or complaints?',
        action: 'general'
      };
    }
  };

  /**
   * Clear conversation
   */
  const clearConversation = () => {
    setConversationHistory([]);
    setTranscription('');
    setTranslation('');
    setResponse('');
  };

  /**
   * Format duration as MM:SS
   * @param {number} seconds
   * @returns {string}
   */
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`voice-recorder ${className}`}>
      <div className="voice-recorder__header">
        <h2>🎤 Voice Assistant</h2>
        <p>Speak in Hindi or your regional language</p>
        
        <div className="voice-recorder__controls-row">
          <div className="voice-recorder__language">
            <label htmlFor="language-select">Language:</label>
            <select 
              id="language-select"
              value={selectedLanguage} 
              onChange={(e) => setSelectedLanguage(e.target.value)}
              disabled={isRecording || isProcessing}
            >
              <option value="hi">हिंदी (Hindi)</option>
              <option value="en">English</option>
              <option value="mr">मराठी (Marathi)</option>
              <option value="bn">বাংলা (Bengali)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="te">తెలుగు (Telugu)</option>
            </select>
          </div>
          
          <div className="voice-recorder__mode-toggle">
            <label>
              <input
                type="checkbox"
                checked={useRealTranscribe}
                onChange={(e) => setUseRealTranscribe(e.target.checked)}
                disabled={isRecording || isProcessing}
              />
              <span>Use AWS Transcribe</span>
            </label>
          </div>
        </div>
      </div>

      {error && (
        <div className="voice-recorder__error" role="alert">
          {error}
        </div>
      )}
      
      <div className="voice-recorder__visualizer">
        <div 
          className="voice-recorder__level-bar"
          style={{ width: `${audioLevel}%` }}
          aria-hidden="true"
        />
      </div>
      
      {isRecording && (
        <div className="voice-recorder__duration">
          {formatDuration(duration)} / {formatDuration(maxDuration)}
        </div>
      )}
      
      <div className="voice-recorder__controls">
        {!isRecording ? (
          <button
            type="button"
            onClick={startRecording}
            disabled={isProcessing}
            className="voice-recorder__button voice-recorder__button--start"
            aria-label="Start recording"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
            <span>Tap to speak</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="voice-recorder__button voice-recorder__button--stop"
            aria-label="Stop recording"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2"/>
            </svg>
            <span>Tap to stop</span>
          </button>
        )}
      </div>
      
      {isProcessing && (
        <div className="voice-recorder__processing">
          <div className="voice-recorder__spinner" aria-label="Processing..."></div>
          <p>Processing your voice command...</p>
        </div>
      )}

      {/* Current Response */}
      {(transcription || translation || response) && (
        <div className="voice-recorder__response">
          {transcription && (
            <div className="voice-recorder__transcription">
              <strong>You said:</strong>
              <p>{transcription}</p>
              {confidence !== null && (
                <div className="voice-recorder__confidence">
                  <span>Confidence: {(confidence * 100).toFixed(1)}%</span>
                  <div className="voice-recorder__confidence-bar">
                    <div 
                      className="voice-recorder__confidence-fill"
                      style={{ 
                        width: `${confidence * 100}%`,
                        backgroundColor: confidence > 0.8 ? '#4caf50' : confidence > 0.6 ? '#ff9800' : '#f44336'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          
          {translation && (
            <div className="voice-recorder__translation">
              <strong>Translation:</strong>
              <p>{translation}</p>
            </div>
          )}
          
          {response && (
            <div className="voice-recorder__ai-response">
              <strong>🤖 Assistant:</strong>
              <p>{response}</p>
            </div>
          )}
        </div>
      )}

      {/* Conversation History */}
      {conversationHistory.length > 0 && (
        <div className="voice-recorder__history">
          <div className="voice-recorder__history-header">
            <h3>Conversation History</h3>
            <button 
              onClick={clearConversation}
              className="voice-recorder__clear-btn"
              aria-label="Clear conversation"
            >
              Clear
            </button>
          </div>
          
          <div className="voice-recorder__history-list">
            {conversationHistory.map((item, index) => (
              <div key={index} className="voice-recorder__history-item">
                <div className="voice-recorder__history-time">
                  {item.timestamp.toLocaleTimeString()}
                </div>
                <div className="voice-recorder__history-content">
                  <p className="voice-recorder__history-user">
                    👤 {item.transcription}
                  </p>
                  <p className="voice-recorder__history-bot">
                    🤖 {item.response}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="voice-recorder__demo-note">
        {useRealTranscribe ? (
          <>
            <p>✅ <strong>AWS Transcribe Enabled:</strong> Your voice will be transcribed using Amazon Transcribe.</p>
            <p>🎤 Speak clearly in your selected language. Processing may take 10-30 seconds.</p>
          </>
        ) : (
          <>
            <p>💡 <strong>Mock Mode:</strong> Using simulated transcription. Enable "Use AWS Transcribe" to use real speech-to-text.</p>
            <p>Try saying: "मुझे काम चाहिए" (I need work) or "मेरी उपस्थिति दर्ज करें" (Mark my attendance)</p>
          </>
        )}
      </div>
    </div>
  );
}

