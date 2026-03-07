/**
 * Voice Interaction Component
 * 
 * @fileoverview Combined voice narration (speaker) and voice input (microphone) for onboarding
 */

import { useState, useEffect } from 'react';
import voiceService from '../../../services/voice/voiceService';
import './VoiceInteraction.css';

/**
 * Voice Interaction Component
 * @param {Object} props
 * @param {string} props.narrationText - Text to narrate when speaker is clicked
 * @param {string} [props.language] - Language code (default: 'en')
 * @param {(transcript: string) => void} [props.onVoiceInput] - Callback when voice input is received
 * @param {string} [props.voiceInputPrompt] - Prompt text for voice input
 * @param {boolean} [props.showMicrophone] - Whether to show microphone button (default: true)
 * @param {boolean} [props.showSpeaker] - Whether to show speaker button (default: true)
 * @param {string} [props.className] - Additional CSS classes
 */
export default function VoiceInteraction({ 
  narrationText,
  language = 'en',
  onVoiceInput,
  voiceInputPrompt = 'Listening...',
  showMicrophone = true,
  showSpeaker = true,
  className = ''
}) {
  const [isNarrating, setIsNarrating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);

  // Auto-narrate on mount if narrationText is provided
  useEffect(() => {
    if (narrationText && showSpeaker) {
      // Auto-play narration after a short delay
      const timer = setTimeout(() => {
        handleNarrate();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [narrationText]);

  /**
   * Handle speaker button click - narrate text
   */
  const handleNarrate = async () => {
    if (!narrationText) return;

    if (isNarrating) {
      // Stop narration
      voiceService.stop();
      setIsNarrating(false);
    } else {
      // Start narration
      try {
        setIsNarrating(true);
        setError(null);
        await voiceService.speak(narrationText, language, {
          onEnd: () => setIsNarrating(false),
          onError: (err) => {
            setIsNarrating(false);
            setError('Failed to play audio');
            console.error('Narration error:', err);
          }
        });
      } catch (err) {
        setIsNarrating(false);
        setError('Failed to play audio');
        console.error('Narration error:', err);
      }
    }
  };

  /**
   * Handle microphone button click - start voice recognition
   */
  const handleVoiceInput = async () => {
    if (!voiceService.isRecognitionSupported()) {
      setError('Voice input not supported in this browser');
      return;
    }

    if (isListening) {
      // Stop listening
      voiceService.stopRecognition();
      setIsListening(false);
    } else {
      // Stop narration if playing
      if (isNarrating) {
        voiceService.stop();
        setIsNarrating(false);
      }
      
      // Start listening
      try {
        setIsListening(true);
        setError(null);
        setTranscript('');

        const result = await voiceService.recognize(language, {
          onStart: () => {
            console.log('Voice recognition started');
          },
          onResult: ({ transcript, confidence }) => {
            console.log('Voice recognition result:', transcript, 'Confidence:', confidence);
            setTranscript(transcript);
          },
          onError: (err) => {
            setIsListening(false);
            setError('Failed to recognize speech');
            console.error('Recognition error:', err);
          },
          onEnd: () => {
            setIsListening(false);
          }
        });

        // Call callback with transcript
        if (onVoiceInput && result) {
          onVoiceInput(result);
        }
      } catch (err) {
        setIsListening(false);
        setError('Failed to recognize speech');
        console.error('Recognition error:', err);
      }
    }
  };

  return (
    <div className={`voice-interaction ${className}`}>
      <div className="voice-interaction__buttons">
        {/* Speaker Button - Narrate text */}
        {showSpeaker && (
          <button
            type="button"
            onClick={handleNarrate}
            className={`voice-interaction__button voice-interaction__button--speaker ${
              isNarrating ? 'voice-interaction__button--active' : ''
            }`}
            aria-label={isNarrating ? 'Stop narration' : 'Play narration'}
            title={isNarrating ? 'Stop narration' : 'Play narration'}
            disabled={!narrationText}
          >
            <svg 
              viewBox="0 0 24 24" 
              fill="currentColor"
              className="voice-interaction__icon"
            >
              {isNarrating ? (
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              ) : (
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              )}
            </svg>
            {isNarrating && (
              <span className="voice-interaction__pulse" aria-hidden="true" />
            )}
          </button>
        )}

        {/* Microphone Button - Voice input */}
        {showMicrophone && (
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`voice-interaction__button voice-interaction__button--microphone ${
              isListening ? 'voice-interaction__button--active' : ''
            }`}
            aria-label={isListening ? 'Stop listening' : 'Start voice input'}
            title={isListening ? 'Stop listening' : 'Start voice input'}
          >
            <svg 
              viewBox="0 0 24 24" 
              fill="currentColor"
              className="voice-interaction__icon"
            >
              {isListening ? (
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z M17.91 11c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
              ) : (
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z M17.91 11c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
              )}
            </svg>
            {isListening && (
              <span className="voice-interaction__pulse" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {/* Status display */}
      {(isListening || transcript || error) && (
        <div className="voice-interaction__status">
          {isListening && (
            <p className="voice-interaction__status-text voice-interaction__status-text--listening">
              🎤 {voiceInputPrompt}
            </p>
          )}
          {transcript && !isListening && (
            <p className="voice-interaction__status-text voice-interaction__status-text--transcript">
              📝 {transcript}
            </p>
          )}
          {error && (
            <p className="voice-interaction__status-text voice-interaction__status-text--error">
              ⚠️ {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
