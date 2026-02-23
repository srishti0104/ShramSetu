/**
 * useVoiceNarration Hook
 * 
 * @fileoverview React hook for voice narration functionality
 */

import { useEffect, useCallback, useState } from 'react';
import voiceService from '../services/voice/voiceService';

/**
 * Hook for voice narration
 * @param {string} text - Text to narrate
 * @param {string} language - Language code
 * @param {Object} options - Narration options
 * @returns {Object} Voice narration controls
 */
export function useVoiceNarration(text, language = 'en', options = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Start narration
   */
  const speak = useCallback(async () => {
    if (!text) return;

    try {
      setError(null);
      setIsPlaying(true);
      
      await voiceService.speak(text, language, {
        ...options,
        onEnd: () => {
          setIsPlaying(false);
          if (options.onEnd) options.onEnd();
        },
        onError: (err) => {
          setError(err);
          setIsPlaying(false);
          if (options.onError) options.onError(err);
        }
      });
    } catch (err) {
      setError(err);
      setIsPlaying(false);
    }
  }, [text, language, options]);

  /**
   * Stop narration
   */
  const stop = useCallback(() => {
    voiceService.stop();
    setIsPlaying(false);
  }, []);

  /**
   * Toggle play/pause
   */
  const toggle = useCallback(() => {
    if (isPlaying) {
      voiceService.pause();
      setIsPlaying(false);
    } else if (voiceService.synthesis.paused) {
      voiceService.resume();
      setIsPlaying(true);
    } else {
      speak();
    }
  }, [isPlaying, speak]);

  /**
   * Auto-narrate on mount if enabled
   */
  useEffect(() => {
    if (options.autoPlay && text) {
      speak();
    }

    // Cleanup on unmount
    return () => {
      voiceService.stop();
    };
  }, [text, options.autoPlay, speak]);

  return {
    speak,
    stop,
    toggle,
    isPlaying,
    error,
    isSupported: voiceService.isSynthesisSupported()
  };
}

/**
 * Hook for voice recognition
 * @param {string} language - Language code
 * @param {Object} options - Recognition options
 * @returns {Object} Voice recognition controls
 */
export function useVoiceRecognition(language = 'en', options = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);

  /**
   * Start listening
   */
  const startListening = useCallback(async () => {
    try {
      setError(null);
      setIsListening(true);
      setTranscript('');

      const result = await voiceService.recognize(language, {
        ...options,
        onStart: () => {
          setIsListening(true);
          if (options.onStart) options.onStart();
        },
        onResult: ({ transcript: text, confidence }) => {
          setTranscript(text);
          if (options.onResult) options.onResult({ transcript: text, confidence });
        },
        onEnd: () => {
          setIsListening(false);
          if (options.onEnd) options.onEnd();
        },
        onError: (err) => {
          setError(err);
          setIsListening(false);
          if (options.onError) options.onError(err);
        }
      });

      setTranscript(result);
      setIsListening(false);
    } catch (err) {
      setError(err);
      setIsListening(false);
    }
  }, [language, options]);

  /**
   * Stop listening
   */
  const stopListening = useCallback(() => {
    voiceService.stopRecognition();
    setIsListening(false);
  }, []);

  /**
   * Clear transcript
   */
  const clearTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    startListening,
    stopListening,
    clearTranscript,
    isListening,
    transcript,
    error,
    isSupported: voiceService.isRecognitionSupported()
  };
}

export default useVoiceNarration;
