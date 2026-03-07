/**
 * Password Creation Screen
 * 
 * @fileoverview Screen for creating a password after OTP verification
 */

import { useState, useEffect } from 'react';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import authService from '../../../services/aws/authService';
import ProgressIndicator from '../shared/ProgressIndicator';
import VoiceInteraction from '../shared/VoiceInteraction';
import BackButton from '../shared/BackButton';
import './PasswordCreation.css';

/**
 * Password Creation Screen Component
 */
export default function PasswordCreation() {
  const { state, updateState, nextStep, previousStep } = useOnboarding();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [error, setError] = useState('');

  const isHindi = state.language === 'hi';

  /**
   * Narration text for this screen
   */
  const narrationText = isHindi
    ? 'मजबूत पासवर्ड बनाएं। कम से कम 8 अक्षर।'
    : 'Create strong password. At least 8 characters.';

  // Validate password strength whenever password changes
  useEffect(() => {
    if (password) {
      const validation = authService.validatePasswordStrength(password);
      setPasswordStrength(validation);
    } else {
      setPasswordStrength(null);
    }
  }, [password]);

  /**
   * Handle password change
   */
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setError('');
  };

  /**
   * Handle confirm password change
   */
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setError('');
  };

  /**
   * Handle continue
   */
  const handleContinue = () => {
    // Validate password
    if (!authService.isValidPassword(password)) {
      setError(isHindi 
        ? 'पासवर्ड कम से कम 8 अक्षर का होना चाहिए और इसमें अक्षर और संख्याएं होनी चाहिए'
        : 'Password must be at least 8 characters and contain letters and numbers');
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError(isHindi 
        ? 'पासवर्ड मेल नहीं खाते। कृपया पुनः प्रयास करें।'
        : 'Passwords do not match. Please try again.');
      return;
    }

    // Store password temporarily in context
    updateState({ password });
    nextStep();
  };

  const isValid = authService.isValidPassword(password) && password === confirmPassword;

  return (
    <div className="password-creation">
      <VoiceInteraction
        narrationText={narrationText}
        language={state.language || 'en'}
        showMicrophone={false}
      />
      <BackButton onClick={previousStep} />
      
      <ProgressIndicator 
        step={state.currentStep} 
        total={state.totalSteps} 
      />

      <div className="password-creation__content">
        <h1 className="password-creation__title">
          {isHindi ? 'पासवर्ड बनाएं' : 'Create Password'}
        </h1>
        <p className="password-creation__subtitle">
          {isHindi 
            ? 'अपने खाते को सुरक्षित रखने के लिए एक मजबूत पासवर्ड चुनें' 
            : 'Choose a strong password to secure your account'}
        </p>

        <div className="password-creation__form">
          <div className="password-creation__field">
            <label htmlFor="password" className="password-creation__label">
              {isHindi ? 'पासवर्ड' : 'Password'}
            </label>
            <div className="password-input-container">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                placeholder={isHindi ? 'पासवर्ड दर्ज करें' : 'Enter password'}
                className="password-input"
                autoFocus
                aria-label="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {passwordStrength && (
            <div className="password-strength">
              <div className="password-strength__bar">
                <div 
                  className={`password-strength__fill password-strength__fill--${passwordStrength.strength}`}
                  style={{ 
                    width: passwordStrength.strength === 'weak' ? '33%' : 
                           passwordStrength.strength === 'medium' ? '66%' : '100%' 
                  }}
                />
              </div>
              <p className="password-strength__label">
                {isHindi 
                  ? `पासवर्ड शक्ति: ${
                      passwordStrength.strength === 'weak' ? 'कमजोर' :
                      passwordStrength.strength === 'medium' ? 'मध्यम' : 'मजबूत'
                    }`
                  : `Password strength: ${passwordStrength.strength}`}
              </p>
            </div>
          )}

          <div className="password-creation__field">
            <label htmlFor="confirmPassword" className="password-creation__label">
              {isHindi ? 'पासवर्ड की पुष्टि करें' : 'Confirm Password'}
            </label>
            <div className="password-input-container">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder={isHindi ? 'पासवर्ड फिर से दर्ज करें' : 'Re-enter password'}
                className="password-input"
                aria-label="Confirm password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div className="password-requirements">
            <p className="password-requirements__title">
              {isHindi ? 'पासवर्ड आवश्यकताएं:' : 'Password requirements:'}
            </p>
            <ul className="password-requirements__list">
              <li className={passwordStrength?.requirements.minLength ? 'password-requirements__item--met' : ''}>
                {isHindi ? '✓ कम से कम 8 अक्षर' : '✓ At least 8 characters'}
              </li>
              <li className={passwordStrength?.requirements.hasLetters ? 'password-requirements__item--met' : ''}>
                {isHindi ? '✓ अक्षर शामिल हैं' : '✓ Contains letters'}
              </li>
              <li className={passwordStrength?.requirements.hasNumbers ? 'password-requirements__item--met' : ''}>
                {isHindi ? '✓ संख्याएं शामिल हैं' : '✓ Contains numbers'}
              </li>
            </ul>
          </div>

          {error && (
            <p className="password-creation__error" role="alert">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleContinue}
            disabled={!isValid}
            className="password-creation__button"
          >
            {isHindi ? 'जारी रखें' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
