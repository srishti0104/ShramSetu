/**
 * Voice Recorder Component
 * 
 * @fileoverview Audio recording using Web Audio API with mock transcription
 * Records audio and simulates voice command processing for demo
 */

import { useState, useRef, useEffect } from 'react';
import './VoiceRecorder.css';

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
    transcription: 'नमस्ते, मैं श्रमिक सेतु का उपयोग करना चाहता हूं',
    translation: 'Hello, I want to use Shramik Setu',
    response: 'Welcome to Shramik Setu! I can help you with: finding jobs, marking attendance, checking payments, or filing complaints. What would you like to do?',
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
   * Process audio with mock transcription and response
   * @param {Blob} audioBlob
   */
  const processAudio = async (audioBlob) => {
    setIsProcessing(true);
    setTranscription('');
    setTranslation('');
    setResponse('');
    
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock: Pick a random response based on duration
      const responseKeys = Object.keys(MOCK_RESPONSES);
      const randomKey = duration > 3 
        ? responseKeys[Math.floor(Math.random() * (responseKeys.length - 1))]
        : 'default';
      
      const mockData = MOCK_RESPONSES[randomKey];
      
      // Simulate streaming transcription
      setTranscription(mockData.transcription);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTranslation(mockData.translation);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setResponse(mockData.response);
      
      // Add to conversation history
      setConversationHistory(prev => [...prev, {
        timestamp: new Date(),
        transcription: mockData.transcription,
        translation: mockData.translation,
        response: mockData.response,
        action: mockData.action
      }]);
      
      // Simulate text-to-speech (in real app, would use Amazon Polly)
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(mockData.response);
        utterance.lang = selectedLanguage === 'hi' ? 'hi-IN' : 'en-IN';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }
      
    } catch (err) {
      console.error('Failed to process audio:', err);
      setError('Failed to process voice command. Please try again.');
    } finally {
      setIsProcessing(false);
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
        <p>💡 <strong>Demo Mode:</strong> This is a mock voice interface. In production, it will use Amazon Transcribe, Lex, and Polly for real voice processing.</p>
        <p>Try saying: "मुझे काम चाहिए" (I need work) or "मेरी उपस्थिति दर्ज करें" (Mark my attendance)</p>
      </div>
    </div>
  );
}
