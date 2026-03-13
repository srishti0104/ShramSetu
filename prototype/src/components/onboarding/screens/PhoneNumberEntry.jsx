/**
 * Phone Number Entry Screen
 * 
 * @fileoverview Screen for entering and validating phone number
 */

import { useState, useEffect } from 'react';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import authService from '../../../services/aws/authService';
import ProgressIndicator from '../shared/ProgressIndicator';
import VoiceInteraction from '../shared/VoiceInteraction';
import BackButton from '../shared/BackButton';
import './PhoneNumberEntry.css';

/**
 * Phone Number Entry Screen Component
 */
export default function PhoneNumberEntry() {
  const { state, updateState, nextStep, previousStep } = useOnboarding();
  const [phoneNumber, setPhoneNumber] = useState(state.phoneNumber?.replace('+91', '') || '');
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isHindi = state.language === 'hi';

  /**
   * Narration text for this screen
   */
  const narrationText = isHindi
    ? 'अपना 10 अंकों का मोबाइल नंबर दर्ज करें।'
    : 'Enter your 10-digit mobile number.';

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
   * Handle continue (send OTP to verify phone number)
   */
  const handleContinue = async () => {
    if (!isValid || isLoading) return;

    const formattedPhone = `+91${phoneNumber}`;

    try {
      setError('');
      setIsLoading(true);
      
      // Send OTP - this will check if phone is already registered
      await authService.sendOTP(formattedPhone);
      
      // If successful, proceed to OTP verification
      updateState({ 
        phoneNumber: formattedPhone,
        otpVerified: false // Need to verify OTP
      });
      nextStep();
    } catch (err) {
      console.error('Error sending OTP:', err);
      
      // Handle specific errors
      if (err.message.includes('already registered')) {
        setError(isHindi 
          ? 'यह नंबर पहले से पंजीकृत है। कृपया लॉगिन करें।' 
          : 'This phone number is already registered. Please login instead.');
      } else if (err.message.includes('Too many')) {
        setError(err.message);
      } else {
        setError(isHindi 
          ? 'OTP भेजने में विफल। कृपया पुनः प्रयास करें।' 
          : 'Failed to send OTP. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle voice input - recognize phone number
   */
  const handleVoiceInputPhone = (transcript) => {
    console.log('Voice input received:', transcript);
    
    // Extract digits from voice input
    const digits = transcript.replace(/\D/g, '');
    if (digits.length > 0) {
      setPhoneNumber(digits.slice(0, 10));
      setError('');
    }
  };

  return (
    <div className="phone-number-entry">
      <VoiceInteraction
        narrationText={narrationText}
        language={state.language || 'en'}
        onVoiceInput={handleVoiceInputPhone}
        voiceInputPrompt={isHindi ? 'नंबर बोलें...' : 'Speak number...'}
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
            ? 'अपना 10 अंकों का मोबाइल नंबर दर्ज करें' 
            : 'Enter your 10-digit mobile number'}
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
            onClick={handleContinue}
            disabled={!isValid || isLoading}
            className="phone-number-entry__button"
          >
            {isLoading ? (
              <>
                <span className="spinner" aria-hidden="true"></span>
                {isHindi ? 'OTP भेजा जा रहा है...' : 'Sending OTP...'}
              </>
            ) : (
              isHindi ? 'जारी रखें' : 'Continue'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
