/**
 * OTP Verification Screen
 * 
 * @fileoverview Screen for entering and verifying 6-digit OTP
 */

import { useState, useRef, useEffect } from 'react';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import ProgressIndicator from '../shared/ProgressIndicator';
import VoiceAssistButton from '../shared/VoiceAssistButton';
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
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const inputRefs = useRef([]);

  const isHindi = state.language === 'hi';

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
      // MOCK: Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('[MOCK] Verifying OTP:', otpValue);
      
      // Mock success
      updateState({ 
        otpVerified: true,
        userId: 'user-' + Date.now(),
        accessToken: 'mock-token-' + Date.now()
      });
      nextStep();
    } catch (err) {
      setError(isHindi 
        ? 'गलत OTP। कृपया पुनः प्रयास करें।' 
        : 'Invalid OTP. Please try again.');
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
      // MOCK: Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('[MOCK] Resending OTP to:', state.phoneNumber);
      
      setTimeLeft(RESEND_TIMEOUT);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(isHindi 
        ? 'OTP पुनः भेजने में विफल' 
        : 'Failed to resend OTP');
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
   * Handle voice assist
   */
  const handleVoiceAssist = () => {
    setIsVoicePlaying(!isVoicePlaying);
    console.log('[MOCK] Voice narration: Enter the 6-digit OTP sent to your phone');
  };

  return (
    <div className="otp-verification">
      <VoiceAssistButton 
        onClick={handleVoiceAssist}
        isPlaying={isVoicePlaying}
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
