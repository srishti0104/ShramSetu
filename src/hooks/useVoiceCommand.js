/**
 * Voice Command Hook
 * 
 * @fileoverview React hook for voice command processing
 */

import { useState, useCallback } from 'react';
import { processVoiceCommand } from '../services/voice-assistant/client';
import { useAuth } from '../contexts/AuthContext';

/**
 * @typedef {import('../types/common.js').LanguageCode} LanguageCode
 */

/**
 * Hook for voice command processing
 * @param {LanguageCode} languageCode - Language code
 * @param {string} [sessionId] - Session ID
 * @returns {Object} Voice command state and functions
 */
export function useVoiceCommand(languageCode, sessionId) {
  const { authState } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  /**
   * Process voice command
   * @param {Blob} audioBlob - Audio blob
   * @returns {Promise<Object>} Command result
   */
  const processCommand = useCallback(async (audioBlob) => {
    if (!authState.user) {
      throw new Error('User not authenticated');
    }

    try {
      setIsProcessing(true);
      setError(null);

      const commandResult = await processVoiceCommand(
        audioBlob,
        languageCode,
        authState.user.userId,
        sessionId,
        authState.accessToken
      );

      setResult(commandResult);
      return commandResult;
    } catch (err) {
      setError(err.message || 'Failed to process voice command');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [languageCode, sessionId, authState.user, authState.accessToken]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clear result
   */
  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  return {
    isProcessing,
    error,
    result,
    processCommand,
    clearError,
    clearResult
  };
}
