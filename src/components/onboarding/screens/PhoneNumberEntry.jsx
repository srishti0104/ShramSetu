/**
 * Phone Number Entry Screen
 * 
 * @fileoverview Screen for entering and validating phone number
 */

import { useState, useEffect } from 'react';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import { useVoiceRecognition } from '../../../hooks/useVoiceNarration';
import ProgressIndicator from '../shared/ProgressIndicator';
import VoiceAssistButton from '../shared/VoiceAssistButton';
import BackButton from '../shared/BackButton';
import './PhoneNumberEntry.css';

/**
 * Phone Number Entry Screen Component
 */
export default function PhoneNumberEntry() {
  const { state, updateState, nextStep, previousStep } = useOnboarding();
  const [phoneNumber, setPhoneNumber] = useState(state.phoneNumber?.replace('+91', '') || '');
  const [isValid, setIsValid] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);

  const isHindi = state.language === 'hi';

  // Voice recognition for phone number input
  const {
    startListening,
    stopListening,
    isListening,
    transcript,
    isSupported
  } = useVoiceRecognition(isHindi ? 'hi-IN' : 'en-IN', {
    onResult: ({ transcript: text }) => {
      // Extract digits from voice input
      const digits = text.replace(/\D/g, '');
      if (digits.length > 0) {
        setPhoneNumber(digits.slice(0, 10));
      }
    },
    onError: (err) => {
      console.error('Voice recognition error:', err);
      setError(isHindi 
        ? 'आवाज़ पहचान विफल। कृपया पुनः प्रयास करें।'
        : 'Voice recognition failed. Please try again.');
    }
  });

  // Validate phone number whenever it changes
  useEffect(() => {
    const valid = validatePhone(phoneNumber);
    setIsValid(valid);
  }, [phoneNumber]);

  /**
   * Validate phone number
   */
  const validatePhone = (number) => {
    // Indian phone number: 10 digits, starts with 6-9
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(number);
  };

  /**
   * Handle phone number change
   */
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(value);
    setError('');
    
    const valid = validatePhone(value);
    setIsValid(valid);
  };

  /**
   * Handle send OTP
   */
  const handleSendOTP = async () => {
    if (!isValid) return;

    setIsSending(true);
    setError('');

    try {
      // MOCK: Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('[MOCK] Sending OTP to:', `+91${phoneNumber}`);
      
      // Update state and move to OTP verification
      updateState({ phoneNumber: `+91${phoneNumber}` });
      nextStep();
    } catch (err) {
      setError(isHindi 
        ? 'OTP भेजने में विफल। कृपया पुनः प्रयास करें।' 
        : 'Failed to send OTP. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Handle voice input
   */
  const handleVoiceInput = () => {
    if (!isSupported) {
      setError(isHindi 
        ? 'आवाज़ इनपुट समर्थित नहीं है'
        : 'Voice input not supported');
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      setError('');
      startListening();
    }
  };

  /**
   * Handle voice assist
   */
  const handleVoiceAssist = () => {
    setIsVoicePlaying(!isVoicePlaying);
    console.log('[MOCK] Voice narration: Enter your 10-digit mobile number');
  };

  return (
    <div className="phone-number-entry">
      <VoiceAssistButton 
        onClick={handleVoiceAssist}
        isPlaying={isVoicePlaying}
      />
      <BackButton onClick={previousStep} />
      
      <ProgressIndicator 
        step={state.currentStep} 
        total={state.totalSteps} 
      />

      <div className="phone-number-entry__content">
        <h1 className="phone-number-entry__title">
          {isHindi ? 'मोबाइल नंबर दर्ज करें' : 'Enter Mobile Number'}
        </h1>
        <p className="phone-number-entry__subtitle">
          {isHindi 
            ? 'हम आपको एक OTP भेजेंगे' 
            : "We'll send you an OTP"}
        </p>

        <div className="phone-number-entry__form">
          <div className="phone-input-container">
            <span className="phone-input-container__prefix">+91</span>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="9876543210"
              className={`phone-input ${isValid ? 'phone-input--valid' : ''} ${error ? 'phone-input--error' : ''}`}
              autoFocus
              aria-label="Mobile number"
              aria-invalid={!!error}
              aria-describedby={error ? 'phone-error' : undefined}
            />
            {isValid && (
              <span className="phone-input-container__check" aria-hidden="true">
                ✓
              </span>
            )}
          </div>

          {error && (
            <p id="phone-error" className="phone-number-entry__error" role="alert">
              {error}
            </p>
          )}

          <p className="phone-number-entry__help">
            {isHindi 
              ? '10 अंकों का मोबाइल नंबर दर्ज करें' 
              : 'Enter 10-digit mobile number'}
          </p>

          <button
            type="button"
            onClick={handleSendOTP}
            disabled={!isValid || isSending}
            className="phone-number-entry__button"
          >
            {isSending ? (
              <>
                <span className="spinner" aria-hidden="true"></span>
                {isHindi ? 'भेजा जा रहा है...' : 'Sending...'}
              </>
            ) : (
              isHindi ? 'OTP भेजें' : 'Send OTP'
            )}
          </button>

          <button
            type="button"
            onClick={handleVoiceInput}
            className={`phone-number-entry__voice-button ${isListening ? 'phone-number-entry__voice-button--listening' : ''}`}
            aria-label="Use voice input"
            disabled={!isSupported}
          >
            {isListening ? (
              <>
                <span className="pulse-dot" aria-hidden="true"></span>
                {isHindi ? 'सुन रहे हैं...' : 'Listening...'}
              </>
            ) : (
              <>
                🎤 {isHindi ? 'आवाज़ से दर्ज करें' : 'Voice Input'}
              </>
            )}
          </button>

          {isListening && (
            <p className="phone-number-entry__voice-hint">
              {isHindi 
                ? 'अपना 10 अंकों का मोबाइल नंबर बोलें'
                : 'Speak your 10-digit mobile number'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
