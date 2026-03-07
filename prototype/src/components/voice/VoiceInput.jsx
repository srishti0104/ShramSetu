/**
 * Voice Input Component
 * Provides voice-to-text functionality for form fields
 */

import { useState, useRef } from 'react';
import transcribeService from '../../services/aws/transcribeService';
import './VoiceInput.css';

const VoiceInput = ({ 
  onTranscription, 
  language = 'hi-IN', 
  placeholder = 'Click mic to speak...',
  disabled = false,
  className = ''
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      setError(null);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });

      // Create MediaRecorder
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
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: 'audio/webm;codecs=opus' 
        });
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
        
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      console.log('🎤 Recording started...');
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Could not access microphone. Please allow microphone access.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log('🛑 Recording stopped');
    }
  };

  const processAudio = async (audioBlob) => {
    try {
      setIsProcessing(true);
      setError(null);

      console.log('🔄 Processing audio...', {
        size: audioBlob.size,
        type: audioBlob.type,
        language
      });

      console.log('🎤 Starting transcription and translation process...');

      const result = await transcribeService.transcribeAudio(
        audioBlob, 
        language, 
        'voice_input_user'
      );

      if (result.success && result.text) {
        console.log('✅ Transcription successful:', result.text);
        if (result.originalText && result.originalText !== result.text) {
          console.log('📝 Original text:', result.originalText);
          console.log('🔄 Translated text:', result.text);
        }
        onTranscription(result.text, result);
      } else {
        throw new Error('No text was transcribed from the audio');
      }
    } catch (err) {
      console.error('❌ Transcription error:', err);
      setError(err.message || 'Failed to process voice input');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClick = () => {
    if (disabled) return;
    
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const getButtonState = () => {
    if (isProcessing) {
      return {
        icon: '⏳',
        text: 'Processing...',
        class: 'voice-input-btn--processing'
      };
    }
    
    if (isRecording) {
      return {
        icon: '🛑',
        text: 'Stop Recording',
        class: 'voice-input-btn--recording'
      };
    }
    
    return {
      icon: '🎤',
      text: 'Speak',
      class: 'voice-input-btn--ready'
    };
  };

  const buttonState = getButtonState();

  return (
    <div className={`voice-input ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isProcessing}
        className={`voice-input-btn ${buttonState.class}`}
        title={placeholder}
        aria-label={buttonState.text}
      >
        <span className="voice-input-icon">{buttonState.icon}</span>
        <span className="voice-input-text">{buttonState.text}</span>
      </button>
      
      {error && (
        <div className="voice-input-error">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error}</span>
        </div>
      )}
      
      {isRecording && (
        <div className="voice-input-recording">
          <div className="recording-indicator">
            <span className="recording-dot"></span>
            <span>Recording... Click stop when done</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;