/**
 * Voice Input Component
 * 
 * @fileoverview Text input with voice recognition capability
 */

import { useState } from 'react';
import { useVoiceRecognition } from '../../hooks/useVoiceNarration';
import './VoiceInput.css';

/**
 * Voice Input Component
 * @param {Object} props
 * @param {string} props.value - Input value
 * @param {(value: string) => void} props.onChange - Change handler
 * @param {string} [props.language] - Language code
 * @param {string} [props.placeholder] - Placeholder text
 * @param {string} [props.type] - Input type
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.disabled] - Whether input is disabled
 * @param {Object} [props.inputProps] - Additional input props
 */
export default function VoiceInput({
  value,
  onChange,
  language = 'en',
  placeholder = '',
  type = 'text',
  className = '',
  disabled = false,
  ...inputProps
}) {
  const [showTranscript, setShowTranscript] = useState(false);
  
  const {
    startListening,
    stopListening,
    isListening,
    transcript,
    error,
    isSupported
  } = useVoiceRecognition(language, {
    onResult: ({ transcript: text }) => {
      onChange(text);
      setShowTranscript(true);
      setTimeout(() => setShowTranscript(false), 2000);
    },
    onError: (err) => {
      console.error('Voice recognition error:', err);
    }
  });

  const handleVoiceClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className={`voice-input ${className}`}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="voice-input__field"
        {...inputProps}
      />
      
      {isSupported && (
        <button
          type="button"
          onClick={handleVoiceClick}
          disabled={disabled}
          className={`voice-input__button ${isListening ? 'voice-input__button--listening' : ''}`}
          aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
        >
          <svg 
            viewBox="0 0 24 24" 
            fill="currentColor"
            className="voice-input__icon"
          >
            {isListening ? (
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z M17.91 11c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
            ) : (
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z M17.91 11c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
            )}
          </svg>
        </button>
      )}

      {isListening && (
        <div className="voice-input__listening-indicator">
          <span className="voice-input__pulse" />
          <span className="voice-input__listening-text">Listening...</span>
        </div>
      )}

      {showTranscript && transcript && (
        <div className="voice-input__transcript">
          Recognized: {transcript}
        </div>
      )}

      {error && (
        <div className="voice-input__error">
          Voice input error. Please try again.
        </div>
      )}
    </div>
  );
}
