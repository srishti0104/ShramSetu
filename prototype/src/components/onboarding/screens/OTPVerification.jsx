/**
 * OTP Verification Screen
 * 
 * @fileoverview Screen for entering and verifying 6-digit OTP
 */

import { useState, useRef, useEffect } from 'react';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import authService from '../../../services/aws/authService';
import ProgressIndicator from '../shared/ProgressIndicator';
import VoiceInteraction from '../shared/VoiceInteraction';
import BackButton from '../shared/BackButton';
import './OTPVerification.css';

const OTP_LENGTH = 6;
const RESEND_TIMEOUT = 60; // seconds

/**
 * OTP Verification Screen Component
 */
export default function OTPVerification() {
  const { state, updateState, nextStep, previousStep } = useOnboarding();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(RESEND_TIMEOUT);
  const [canResend, setCanResend] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const inputRefs = useRef([]);

  const isHindi = state.language === 'hi';

  /**
   * Narration text for this screen
   */
  const narrationText = isHindi
    ? '6 अंकों का OTP दर्ज करें।'
    : 'Enter 6-digit OTP.';

  // Update attempts left on mount
  useEffect(() => {
    if (state.phoneNumber) {
      const remaining = authService.getRemainingOTPAttempts(state.phoneNumber);
      setAttemptsLeft(remaining);
    }
  }, [state.phoneNumber]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  /**
   * Handle OTP change
   */
  const handleOTPChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    // Auto-advance to next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (newOtp.every(digit => digit) && index === OTP_LENGTH - 1) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  /**
   * Handle key down
   */
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  /**
   * Handle paste
   */
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    
    if (pastedData.length === OTP_LENGTH) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[OTP_LENGTH - 1]?.focus();
      handleVerifyOTP(pastedData);
    }
  };

  /**
   * Handle verify OTP
   */
  const handleVerifyOTP = async (otpValue) => {
    setIsVerifying(true);
    setError('');

    try {
      // Call real AuthService
      await authService.verifyOTP(state.phoneNumber, otpValue);
      
      console.log('[OTP] Verified successfully');
      
      // Update state and move to password creation
      updateState({ otpVerified: true });
      nextStep();
    } catch (err) {
      console.error('[OTP] Verification error:', err);
      
      // Update attempts left
      const remaining = authService.getRemainingOTPAttempts(state.phoneNumber);
      setAttemptsLeft(remaining);
      
      // Handle specific errors
      if (err.message.includes('locked')) {
        setError(err.message);
      } else if (err.message.includes('expired')) {
        setError(isHindi 
          ? 'OTP समाप्त हो गया है। कृपया नया OTP मांगें।'
          : 'OTP has expired. Please request a new one.');
      } else {
        setError(isHindi 
          ? `गलत OTP। ${remaining} प्रयास शेष।`
          : `Invalid OTP. ${remaining} attempts remaining.`);
      }
      
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  /**
   * Handle resend OTP
   */
  const handleResendOTP = async () => {
    if (!canResend) return;

    try {
      // Call real AuthService
      await authService.sendOTP(state.phoneNumber);
      
      console.log('[OTP] Resent to:', state.phoneNumber);
      
      setTimeLeft(RESEND_TIMEOUT);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setError('');
    } catch (err) {
      console.error('[OTP] Resend error:', err);
      
      if (err.message.includes('Too many')) {
        setError(err.message);
      } else {
        setError(isHindi 
          ? 'OTP पुनः भेजने में विफल' 
          : 'Failed to resend OTP');
      }
    }
  };

  /**
   * Format time
   */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Mask phone number
   */
  const maskPhone = (phone) => {
    if (!phone) return '';
    return phone.slice(0, -4).replace(/\d/g, 'x') + phone.slice(-4);
  };

  /**
   * Handle voice input - recognize OTP digits
   */
  const handleVoiceInputOTP = (transcript) => {
    console.log('Voice input received:', transcript);
    
    // Extract digits from transcript
    const digits = transcript.replace(/\D/g, '').slice(0, OTP_LENGTH);
    
    if (digits.length === OTP_LENGTH) {
      const newOtp = digits.split('');
      setOtp(newOtp);
      inputRefs.current[OTP_LENGTH - 1]?.focus();
      handleVerifyOTP(digits);
    } else if (digits.length > 0) {
      // Partial OTP - fill what we have
      const newOtp = [...otp];
      for (let i = 0; i < Math.min(digits.length, OTP_LENGTH); i++) {
        newOtp[i] = digits[i];
      }
      setOtp(newOtp);
      inputRefs.current[Math.min(digits.length, OTP_LENGTH - 1)]?.focus();
    }
  };

  return (
    <div className="otp-verification">
      <VoiceInteraction
        narrationText={narrationText}
        language={state.language || 'en'}
        onVoiceInput={handleVoiceInputOTP}
        voiceInputPrompt={isHindi ? 'OTP बोलें...' : 'Speak OTP...'}
      />
      <BackButton onClick={previousStep} />
      
      <ProgressIndicator 
        step={state.currentStep} 
        total={state.totalSteps} 
      />

      <div className="otp-verification__content">
        <h1 className="otp-verification__title">
          {isHindi ? 'OTP दर्ज करें' : 'Enter OTP'}
        </h1>
        <p className="otp-verification__subtitle">
          {isHindi ? 'भेजा गया' : 'Sent to'} {maskPhone(state.phoneNumber)}
        </p>

        <div className="otp-verification__form">
          <div className="otp-input-container" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOTPChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`otp-input ${error ? 'otp-input--error' : ''}`}
                autoFocus={index === 0}
                aria-label={`OTP digit ${index + 1}`}
                aria-invalid={!!error}
              />
            ))}
          </div>

          {error && (
            <p className="otp-verification__error" role="alert">
              {error}
            </p>
          )}

          {attemptsLeft < 5 && attemptsLeft > 0 && !error.includes('locked') && (
            <p className="otp-verification__warning">
              {isHindi 
                ? `${attemptsLeft} प्रयास शेष`
                : `${attemptsLeft} attempts remaining`}
            </p>
          )}

          <div className="otp-verification__timer">
            {canResend ? (
              <button
                type="button"
                onClick={handleResendOTP}
                className="otp-verification__resend"
              >
                {isHindi ? 'OTP पुनः भेजें' : 'Resend OTP'}
              </button>
            ) : (
              <p className="otp-verification__countdown">
                {isHindi ? 'पुनः भेजें' : 'Resend in'} {formatTime(timeLeft)}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleVerifyOTP(otp.join(''))}
            disabled={otp.some(d => !d) || isVerifying}
            className="otp-verification__button"
          >
            {isVerifying ? (
              <>
                <span className="spinner" aria-hidden="true"></span>
                {isHindi ? 'सत्यापित किया जा रहा है...' : 'Verifying...'}
              </>
            ) : (
              isHindi ? 'OTP सत्यापित करें' : 'Verify OTP'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
