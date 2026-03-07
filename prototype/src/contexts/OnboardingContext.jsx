/**
 * Onboarding Context
 * 
 * @fileoverview Manages onboarding flow state and progress
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { saveRole, clearRole } from '../utils/roleManager';
import authService from '../services/aws/authService';

const OnboardingContext = createContext(null);

const STORAGE_KEY = 'onboarding_progress';
const EXPIRY_HOURS = 24;

/**
 * Initial onboarding state
 */
const initialState = {
  currentStep: 1,
  totalSteps: 10, // Updated: removed OTP screen
  
  // Step 1: Language
  language: null,
  
  // Step 2: Role
  role: null, // 'worker' | 'employer'
  
  // Step 3: Auth Method Selection (NEW)
  authMethod: null, // 'login' | 'signup'
  
  // Step 4-6: Authentication
  phoneNumber: null,
  eShramCard: null,
  otpVerified: false,
  password: null, // Temporary storage for signup flow
  userId: null,
  accessToken: null,
  isAuthenticated: false,
  authError: null,
  
  // Step 7: Location
  location: {
    latitude: null,
    longitude: null,
    city: null,
    state: null,
    pincode: null,
    address: null
  },
  
  // Step 8: Occupation (workers only)
  skills: [],
  customSkills: {}, // Map of custom skill IDs to names
  
  // Step 9: Personal Details
  profile: {
    name: null,
    age: null,
    gender: null,
    photo: null
  },
  
  // Step 10-11: Tutorial
  benefitsViewed: false,
  termsAccepted: false,
  
  // Metadata
  startedAt: null,
  completedAt: null,
  lastSavedAt: null
};

/**
 * Onboarding Provider Component
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {Function} props.onComplete - Callback when onboarding is completed
 */
export function OnboardingProvider({ children, onComplete }) {
  const [state, setState] = useState(() => {
    // Try to load saved progress
    const saved = loadProgress();
    return saved || { ...initialState, startedAt: Date.now() };
  });

  // Save progress whenever state changes
  useEffect(() => {
    saveProgress(state);
  }, [state]);

  /**
   * Update onboarding state
   */
  const updateState = (updates) => {
    setState(prev => ({
      ...prev,
      ...updates,
      lastSavedAt: Date.now()
    }));
  };

  /**
   * Go to next step
   */
  const nextStep = () => {
    setState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, prev.totalSteps),
      lastSavedAt: Date.now()
    }));
  };

  /**
   * Go to previous step
   */
  const previousStep = () => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1),
      lastSavedAt: Date.now()
    }));
  };

  /**
   * Go to specific step
   */
  const goToStep = (step) => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(1, Math.min(step, prev.totalSteps)),
      lastSavedAt: Date.now()
    }));
  };

  /**
   * Complete onboarding
   */
  const completeOnboarding = () => {
    // Save language preference to localStorage if selected during onboarding
    if (state.language) {
      try {
        localStorage.setItem('app_language', state.language);
        console.log(`Language preference saved during onboarding completion: ${state.language}`);
      } catch (error) {
        console.error('Failed to save language preference during onboarding:', error);
      }
    }
    
    // Save role to localStorage
    if (state.role) {
      saveRole(state.role);
    }
    
    setState(prev => ({
      ...prev,
      completedAt: Date.now(),
      lastSavedAt: Date.now()
    }));
    clearProgress();
    
    // Call the onComplete callback if provided
    if (onComplete) {
      onComplete();
    }
  };

  /**
   * Reset onboarding
   */
  const resetOnboarding = () => {
    // Clear role from localStorage
    clearRole();
    
    setState({ ...initialState, startedAt: Date.now() });
    clearProgress();
  };

  /**
   * Set authentication method
   */
  const setAuthMethod = (method) => {
    updateState({ authMethod: method });
  };

  /**
   * Set password (temporary storage for signup flow)
   */
  const setPassword = (password) => {
    updateState({ password });
  };

  /**
   * Clear password from state
   */
  const clearPassword = () => {
    updateState({ password: null });
  };

  /**
   * Handle login (for existing users)
   */
  const handleLogin = async (phoneNumber, password) => {
    try {
      const result = await authService.login(phoneNumber, password);
      
      updateState({
        userId: result.user.userId,
        accessToken: result.token,
        isAuthenticated: true,
        phoneNumber: result.user.phoneNumber,
        authError: null
      });
      
      return result;
    } catch (error) {
      updateState({
        authError: error.message,
        isAuthenticated: false
      });
      throw error;
    }
  };

  /**
   * Handle registration (for new users after completing onboarding)
   */
  const handleRegistration = async () => {
    try {
      // Prepare registration data
      const registrationData = {
        phoneNumber: state.phoneNumber,
        password: state.password,
        role: state.role,
        language: state.language,
        location: state.location,
        skills: state.skills,
        profile: state.profile
      };
      
      const result = await authService.register(registrationData);
      
      updateState({
        userId: result.user.userId,
        accessToken: result.token,
        isAuthenticated: true,
        authError: null
      });
      
      // Clear password from state after successful registration
      clearPassword();
      
      return result;
    } catch (error) {
      updateState({
        authError: error.message,
        isAuthenticated: false
      });
      throw error;
    }
  };

  const value = {
    state,
    updateState,
    nextStep,
    previousStep,
    goToStep,
    completeOnboarding,
    resetOnboarding,
    setAuthMethod,
    setPassword,
    clearPassword,
    handleLogin,
    handleRegistration
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

/**
 * Hook to use onboarding context
 */
export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}

/**
 * Save progress to localStorage
 */
function saveProgress(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...state,
      lastSavedAt: Date.now()
    }));
  } catch (error) {
    console.error('Failed to save onboarding progress:', error);
  }
}

/**
 * Load progress from localStorage
 */
function loadProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    const state = JSON.parse(saved);
    
    // Check if saved within expiry period
    const expiryTime = EXPIRY_HOURS * 60 * 60 * 1000;
    if (Date.now() - state.lastSavedAt > expiryTime) {
      clearProgress();
      return null;
    }

    return state;
  } catch (error) {
    console.error('Failed to load onboarding progress:', error);
    return null;
  }
}

/**
 * Clear progress from localStorage
 */
function clearProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear onboarding progress:', error);
  }
}
