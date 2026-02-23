/**
 * Voice Assist Button Component
 * 
 * @fileoverview Button to trigger voice narration of screen content
 */

import { useState } from 'react';
import voiceService from '../../../services/voice/voiceService';
import './VoiceAssistButton.css';

/**
 * Voice Assist Button Component
 * @param {Object} props
 * @param {string} [props.text] - Text to narrate
 * @param {string} [props.language] - Language code
 * @param {() => void} [props.onClick] - Callback when button is clicked
 * @param {boolean} [props.isPlaying] - Whether voice is currently playing
 * @param {string} [props.className] - Additional CSS classes
 */
export default function VoiceAssistButton({ 
  text, 
  language = 'en', 
  onClick, 
  isPlaying: externalIsPlaying, 
  className = '' 
}) {
  const [internalIsPlaying, setInternalIsPlaying] = useState(false);
  
  // Use external isPlaying if provided, otherwise use internal state
  const isPlaying = externalIsPlaying !== undefined ? externalIsPlaying : internalIsPlaying;

  const handleClick = async () => {
    if (onClick) {
      onClick();
      return;
    }

    // If text is provided, use voice service
    if (text) {
      if (isPlaying) {
        voiceService.stop();
        setInternalIsPlaying(false);
      } else {
        try {
          setInternalIsPlaying(true);
          await voiceService.speak(text, language, {
            onEnd: () => setInternalIsPlaying(false),
            onError: () => setInternalIsPlaying(false)
          });
        } catch (error) {
          console.error('Voice narration error:', error);
          setInternalIsPlaying(false);
        }
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`voice-assist-button ${isPlaying ? 'voice-assist-button--playing' : ''} ${className}`}
      aria-label="Voice assistance"
      aria-pressed={isPlaying}
    >
      <svg 
        viewBox="0 0 24 24" 
        fill="currentColor"
        className="voice-assist-button__icon"
      >
        {isPlaying ? (
          <>
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </>
        ) : (
          <>
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </>
        )}
      </svg>
      {isPlaying && (
        <span className="voice-assist-button__pulse" aria-hidden="true" />
      )}
    </button>
  );
}
