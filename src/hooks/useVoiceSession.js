/**
 * Voice Session Hook
 * 
 * @fileoverview React hook for managing voice conversation sessions
 */

import { useState, useCallback, useEffect } from 'react';
import { 
  getConversationContext, 
  clearConversationContext 
} from '../services/voice-assistant/client';
import { useAuth } from '../contexts/AuthContext';

/**
 * @typedef {import('../types/voice.js').ConversationContext} ConversationContext
 */

/**
 * Hook for voice session management
 * @returns {Object} Voice session state and functions
 */
export function useVoiceSession() {
  const { authState } = useAuth();
  const [sessionId, setSessionId] = useState(null);
  const [context, setContext] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Start new session
   */
  const startSession = useCallback(() => {
    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    setContext({
      sessionId: newSessionId,
      languageCode: authState.user?.languageCode || 'hi',
      state: 'idle',
      currentIntent: null,
      contextData: {},
      conversationHistory: [],
      turnCount: 0,
      startedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString()
    });
    setError(null);
    return newSessionId;
  }, [authState.user]);

  /**
   * End current session
   */
  const endSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      setIsLoading(true);
      await clearConversationContext(sessionId, authState.accessToken);
      setSessionId(null);
      setContext(null);
      setError(null);
    } catch (err) {
      console.error('Failed to end session:', err);
      setError(err.message || 'Failed to end session');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, authState.accessToken]);

  /**
   * Load session context
   */
  const loadContext = useCallback(async () => {
    if (!sessionId) return;

    try {
      setIsLoading(true);
      const sessionContext = await getConversationContext(
        sessionId,
        authState.accessToken
      );
      setContext(sessionContext);
      setError(null);
    } catch (err) {
      console.error('Failed to load context:', err);
      setError(err.message || 'Failed to load context');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, authState.accessToken]);

  /**
   * Update context after command
   * @param {Object} commandResult - Command result
   */
  const updateContext = useCallback((commandResult) => {
    if (!context) return;

    setContext(prev => ({
      ...prev,
      currentIntent: commandResult.intent?.type || null,
      conversationHistory: [
        ...prev.conversationHistory,
        commandResult.commandId
      ],
      turnCount: prev.turnCount + 1,
      lastActivityAt: new Date().toISOString(),
      contextData: {
        ...prev.contextData,
        lastIntent: commandResult.intent,
        lastResponse: commandResult.response
      }
    }));
  }, [context]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-start session if user is authenticated and no session exists
  useEffect(() => {
    if (authState.isAuthenticated && !sessionId) {
      startSession();
    }
  }, [authState.isAuthenticated, sessionId, startSession]);

  return {
    sessionId,
    context,
    isLoading,
    error,
    startSession,
    endSession,
    loadContext,
    updateContext,
    clearError
  };
}
