/**
 * Authentication Context
 * 
 * @fileoverview Global authentication state management using React Context
 */

import { createContext, useContext, useState, useEffect } from 'react';

/**
 * @typedef {import('../types/user.js').User} User
 * @typedef {import('../types/common.js').LanguageCode} LanguageCode
 */

/**
 * @typedef {Object} AuthState
 * @property {User | null} user - Current user
 * @property {string | null} accessToken - JWT access token
 * @property {string | null} refreshToken - JWT refresh token
 * @property {boolean} isAuthenticated - Whether user is authenticated
 * @property {boolean} isLoading - Whether auth state is loading
 * @property {string | null} error - Auth error message
 */

/**
 * @typedef {Object} AuthContextValue
 * @property {AuthState} authState - Current auth state
 * @property {(phoneNumber: string) => Promise<void>} sendOTP - Send OTP to phone number
 * @property {(phoneNumber: string, otp: string) => Promise<void>} verifyOTP - Verify OTP
 * @property {(userData: Object) => Promise<void>} register - Register new user
 * @property {(phoneNumber: string) => Promise<void>} login - Login user
 * @property {() => Promise<void>} logout - Logout user
 * @property {() => Promise<void>} refreshAccessToken - Refresh access token
 * @property {(eshramNumber: string) => Promise<Object>} validateEshram - Validate E-Shram credentials
 */

const AuthContext = createContext(/** @type {AuthContextValue | undefined} */ (undefined));

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'shramik_setu_access_token',
  REFRESH_TOKEN: 'shramik_setu_refresh_token',
  USER: 'shramik_setu_user'
};

/**
 * Authentication Provider Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  // Load auth state from localStorage on mount
  useEffect(() => {
    loadAuthState();
  }, []);

  /**
   * Load authentication state from localStorage
   */
  const loadAuthState = () => {
    try {
      const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);
      
      if (accessToken && refreshToken && userStr) {
        const user = JSON.parse(userStr);
        setAuthState({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Failed to load auth state:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  /**
   * Save authentication state to localStorage
   * @param {User} user
   * @param {string} accessToken
   * @param {string} refreshToken
   */
  const saveAuthState = (user, accessToken, refreshToken) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    
    setAuthState({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
      isLoading: false,
      error: null
    });
  };

  /**
   * Clear authentication state
   */
  const clearAuthState = () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    
    setAuthState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  };

  /**
   * Send OTP to phone number
   * @param {string} phoneNumber
   */
  const sendOTP = async (phoneNumber) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // MOCK: Call send-otp Lambda function
      console.log('[MOCK] Sending OTP to:', phoneNumber);
      
      // In production:
      // const response = await fetch('/api/v1/auth/send-otp', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ phoneNumber })
      // });
      // const data = await response.json();
      // if (!data.success) throw new Error(data.message);
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
      throw error;
    }
  };

  /**
   * Verify OTP
   * @param {string} phoneNumber
   * @param {string} otp
   */
  const verifyOTP = async (phoneNumber, otp) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // MOCK: Call verify-otp Lambda function
      console.log('[MOCK] Verifying OTP:', phoneNumber, otp);
      
      // In production:
      // const response = await fetch('/api/v1/auth/verify-otp', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ phoneNumber, otp })
      // });
      // const data = await response.json();
      // if (!data.success) throw new Error(data.message);
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
      throw error;
    }
  };

  /**
   * Register new user
   * @param {Object} userData
   */
  const register = async (userData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // MOCK: Call register Lambda function
      console.log('[MOCK] Registering user:', userData);
      
      // In production:
      // const response = await fetch('/api/v1/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(userData)
      // });
      // const data = await response.json();
      // if (!data.success) throw new Error(data.message);
      
      // Auto-login after registration
      await login(userData.phoneNumber);
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
      throw error;
    }
  };

  /**
   * Login user
   * @param {string} phoneNumber
   */
  const login = async (phoneNumber) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // MOCK: Call login Lambda function
      console.log('[MOCK] Logging in user:', phoneNumber);
      
      // Mock response
      const mockUser = {
        userId: 'mock-user-id',
        phoneNumber,
        role: 'worker',
        languageCode: 'hi',
        isActive: true,
        isVerified: true
      };
      
      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      };
      
      // In production:
      // const response = await fetch('/api/v1/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ phoneNumber })
      // });
      // const data = await response.json();
      // if (!data.success) throw new Error(data.message);
      // saveAuthState(data.data.user, data.data.tokens.accessToken, data.data.tokens.refreshToken);
      
      saveAuthState(mockUser, mockTokens.accessToken, mockTokens.refreshToken);
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
      throw error;
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      // In production, call logout endpoint to invalidate tokens
      clearAuthState();
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear state anyway
      clearAuthState();
    }
  };

  /**
   * Refresh access token
   */
  const refreshAccessToken = async () => {
    try {
      if (!authState.refreshToken) {
        throw new Error('No refresh token available');
      }
      
      // MOCK: Call refresh-token Lambda function
      console.log('[MOCK] Refreshing access token');
      
      // In production:
      // const response = await fetch('/api/v1/auth/refresh-token', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ refreshToken: authState.refreshToken })
      // });
      // const data = await response.json();
      // if (!data.success) throw new Error(data.message);
      // saveAuthState(authState.user, data.data.tokens.accessToken, data.data.tokens.refreshToken);
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearAuthState();
      throw error;
    }
  };

  /**
   * Validate E-Shram credentials
   * @param {string} eshramNumber
   * @returns {Promise<Object>}
   */
  const validateEshram = async (eshramNumber) => {
    try {
      // MOCK: Call validate-eshram Lambda function
      console.log('[MOCK] Validating E-Shram:', eshramNumber);
      
      // In production:
      // const response = await fetch('/api/v1/auth/validate-eshram', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${authState.accessToken}`
      //   },
      //   body: JSON.stringify({ eshramNumber })
      // });
      // const data = await response.json();
      // if (!data.success) throw new Error(data.message);
      // return data.data.workerInfo;
      
      return {
        eshramNumber,
        name: 'Mock Worker',
        verified: true
      };
    } catch (error) {
      console.error('E-Shram validation failed:', error);
      throw error;
    }
  };

  const value = {
    authState,
    sendOTP,
    verifyOTP,
    register,
    login,
    logout,
    refreshAccessToken,
    validateEshram
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use authentication context
 * @returns {AuthContextValue}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
