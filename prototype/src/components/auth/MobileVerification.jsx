/**
 * Mobile Verification Component
 * 
 * @fileoverview OTP input UI for mobile number verification
 * Handles OTP sending, input, and verification
 */

import { useState, useRef, useEffect } from 'react';
import './MobileVerification.css';

/**
 * Mobile Verification Component
 * @param {Object} props
 * @param {string} props.phoneNumber - Phone number to verify
 * @param {(otp: string) => Promise<void>} props.onVerify - Callback when OTP is verified
 * @param {() => Promise<void>} props.onResendOTP - Callback to resend OTP
 * @param {boolean} [props.isLoading] - Loading state
 * @param {string} [props.error] - Error message
 * @param {string} [props.className] - Additional CSS classes
 */
export default function MobileVerification({
  phoneNumber,
  onVerify,
  onResendOTP,
  isLoading = false,
  error = '',
  className = ''
}) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  /**
   * Handle OTP input change
   * @param {number} index - Input index
   * @param {string} value - Input value
   */
  const handleChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (newOtp.every(digit => digit !== '') && !isLoading) {
      handleVerify(newOtp.join(''));
    }
  };

  /**
   * Handle key down events
   * @param {number} index - Input index
   * @param {React.KeyboardEvent} e - Keyboard event
   */
  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  /**
   * Handle paste event
   * @param {React.ClipboardEvent} e - Clipboard event
   */
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Only process if it's 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
      
      // Auto-submit
      if (!isLoading) {
        handleVerify(pastedData);
      }
    }
  };

  /**
   * Handle OTP verification
   * @param {string} otpValue - OTP value
   */
  const handleVerify = async (otpValue) => {
    try {
      await onVerify(otpValue);
    } catch (err) {
      // Error handled by parent component
      console.error('Verification failed:', err);
    }
  };

  /**
   * Handle resend OTP
   */
  const handleResend = async () => {
    if (!canResend || isLoading) return;
    
    try {
      await onResendOTP();
      setOtp(['', '', '', '', '', '']);
      setTimeLeft(60);
      setCanResend(false);
      inputRefs.current[0]?.focus();
    } catch (err) {
      console.error('Resend failed:', err);
    }
  };

  return (
    <div className={`mobile-verification ${className}`}>
      <h2 className="mobile-verification__title">Verify Mobile Number</h2>
      
      <p className="mobile-verification__description">
        Enter the 6-digit code sent to
        <br />
        <strong>{phoneNumber}</strong>
      </p>

      <div className="mobile-verification__otp-container">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={isLoading}
            className={`mobile-verification__otp-input ${
              error ? 'mobile-verification__otp-input--error' : ''
            }`}
            aria-label={`Digit ${index + 1}`}
            autoFocus={index === 0}
          />
        ))}
      </div>

      {error && (
        <div className="mobile-verification__error" role="alert">
          {error}
        </div>
      )}

      <div className="mobile-verification__resend">
        {!canResend ? (
          <p className="mobile-verification__timer">
            Resend code in <strong>{timeLeft}s</strong>
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={isLoading}
            className="mobile-verification__resend-button"
          >
            Resend OTP
          </button>
        )}
      </div>

      {isLoading && (
        <div className="mobile-verification__loading">
          <div className="mobile-verification__spinner" aria-label="Verifying..."></div>
          <p>Verifying...</p>
        </div>
      )}
    </div>
  );
}

