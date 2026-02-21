/**
 * E-Shram Verification Component
 * 
 * @fileoverview E-Shram card number input and verification for workers
 */

import { useState } from 'react';
import './EShramVerification.css';

/**
 * E-Shram Verification Component
 * @param {Object} props
 * @param {(eshramNumber: string) => Promise<void>} props.onVerify - Callback when E-Shram is verified
 * @param {() => void} props.onSkip - Callback to skip E-Shram verification
 * @param {boolean} [props.isLoading] - Loading state
 * @param {string} [props.error] - Error message
 * @param {boolean} [props.isOptional] - Whether E-Shram verification is optional
 * @param {string} [props.className] - Additional CSS classes
 */
export default function EShramVerification({
  onVerify,
  onSkip,
  isLoading = false,
  error = '',
  isOptional = true,
  className = ''
}) {
  const [eshramNumber, setEshramNumber] = useState('');
  const [touched, setTouched] = useState(false);

  /**
   * Handle input change
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    if (value.length <= 12) {
      setEshramNumber(value);
    }
  };

  /**
   * Handle form submission
   * @param {React.FormEvent} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);

    if (eshramNumber.length !== 12) {
      return;
    }

    try {
      await onVerify(eshramNumber);
    } catch (err) {
      console.error('E-Shram verification failed:', err);
    }
  };

  /**
   * Handle skip
   */
  const handleSkip = () => {
    if (!isLoading) {
      onSkip();
    }
  };

  const isValid = eshramNumber.length === 12;
  const showError = touched && !isValid && eshramNumber.length > 0;

  return (
    <div className={`eshram-verification ${className}`}>
      <h2 className="eshram-verification__title">E-Shram Verification</h2>
      
      <p className="eshram-verification__description">
        Enter your 12-digit E-Shram card number to verify your worker credentials
        {isOptional && ' (Optional)'}
      </p>

      <form onSubmit={handleSubmit} className="eshram-verification__form">
        <div className="eshram-verification__input-group">
          <label htmlFor="eshram-number" className="eshram-verification__label">
            E-Shram Card Number
          </label>
          
          <input
            id="eshram-number"
            type="text"
            inputMode="numeric"
            value={eshramNumber}
            onChange={handleChange}
            onBlur={() => setTouched(true)}
            placeholder="Enter 12-digit number"
            disabled={isLoading}
            className={`eshram-verification__input ${
              showError || error ? 'eshram-verification__input--error' : ''
            } ${isValid ? 'eshram-verification__input--valid' : ''}`}
            aria-invalid={showError || !!error}
            aria-describedby={showError || error ? 'eshram-error' : undefined}
            maxLength={12}
          />
          
          <div className="eshram-verification__input-hint">
            {eshramNumber.length}/12 digits
          </div>
        </div>

        {(showError || error) && (
          <div id="eshram-error" className="eshram-verification__error" role="alert">
            {error || 'E-Shram number must be exactly 12 digits'}
          </div>
        )}

        <div className="eshram-verification__info">
          <svg className="eshram-verification__info-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="eshram-verification__info-text">
            Your E-Shram card number can be found on your E-Shram registration card or SMS
          </p>
        </div>

        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="eshram-verification__submit"
        >
          {isLoading ? 'Verifying...' : 'Verify E-Shram'}
        </button>

        {isOptional && (
          <button
            type="button"
            onClick={handleSkip}
            disabled={isLoading}
            className="eshram-verification__skip"
          >
            Skip for now
          </button>
        )}
      </form>

      <div className="eshram-verification__help">
        <p className="eshram-verification__help-title">Don't have E-Shram card?</p>
        <a
          href="https://eshram.gov.in/register"
          target="_blank"
          rel="noopener noreferrer"
          className="eshram-verification__help-link"
        >
          Register for E-Shram →
        </a>
      </div>
    </div>
  );
}
