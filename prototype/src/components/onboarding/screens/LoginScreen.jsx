/**
 * Login Screen
 * 
 * @fileoverview Screen for existing users to login with phone and password
 */

import { useState, useEffect } from 'react';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import authService from '../../../services/aws/authService';
import ProgressIndicator from '../shared/ProgressIndicator';
import VoiceInteraction from '../shared/VoiceInteraction';
import BackButton from '../shared/BackButton';
import './LoginScreen.css';

/**
 * Login Screen Component
 */
export default function LoginScreen() {
  const { state, previousStep, completeOnboarding } = useOnboarding();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(5);

  const isHindi = state.language === 'hi';

  const narrationText = isHindi
    ? 'लॉगिन करें। अपना फ़ोन नंबर और पासवर्ड दर्ज करें।'
    : 'Login. Enter your phone number and password.';

  // Update attempts left when phone number changes
  useEffect(() => {
    if (phoneNumber.length === 10) {
      const formattedPhone = authService.formatPhoneNumber(phoneNumber);
      const remaining = authService.getRemainingLoginAttempts(formattedPhone);
      setAttemptsLeft(remaining);
    }
  }, [phoneNumber]);

  /**
   * Handle phone number change
   */
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(value);
    setError('');
  };

  /**
   * Handle password change
   */
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setError('');
  };

  /**
   * Handle login
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!authService.isValidPhoneNumber(phoneNumber)) {
      setError(isHindi 
        ? 'कृपया वैध 10 अंकों का मोबाइल नंबर दर्ज करें'
        : 'Please enter a valid 10-digit mobile number');
      return;
    }

    if (!password) {
      setError(isHindi 
        ? 'कृपया पासवर्ड दर्ज करें'
        : 'Please enter your password');
      return;
    }

    setIsLoggingIn(true);
    setError('');

    try {
      const result = await authService.login(phoneNumber, password);
      
      console.log('[LOGIN] Success:', result);
      
      // Complete onboarding and navigate to main app
      completeOnboarding();
    } catch (err) {
      console.error('[LOGIN] Error:', err);
      
      // Update attempts left
      const formattedPhone = authService.formatPhoneNumber(phoneNumber);
      const remaining = authService.getRemainingLoginAttempts(formattedPhone);
      setAttemptsLeft(remaining);
      
      // Show error message
      if (err.message.includes('locked')) {
        setError(err.message);
      } else {
        setError(isHindi 
          ? `गलत फ़ोन नंबर या पासवर्ड। ${remaining} प्रयास शेष।`
          : `Incorrect phone number or password. ${remaining} attempts remaining.`);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const isValid = authService.isValidPhoneNumber(phoneNumber) && password.length > 0;

  return (
    <div className="login-screen">
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

      <div className="login-screen__content">
        <h1 className="login-screen__title">
          {isHindi ? 'लॉगिन करें' : 'Login'}
        </h1>
        <p className="login-screen__subtitle">
          {isHindi 
            ? 'अपने खाते में प्रवेश करें' 
            : 'Sign in to your account'}
        </p>

        <form className="login-screen__form" onSubmit={handleLogin}>
          <div className="login-screen__field">
            <label htmlFor="phone" className="login-screen__label">
              {isHindi ? 'मोबाइल नंबर' : 'Mobile Number'}
            </label>
            <div className="phone-input-container">
              <span className="phone-input-container__prefix">+91</span>
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="9876543210"
                className="phone-input"
                autoFocus
                aria-label="Mobile number"
              />
            </div>
          </div>

          <div className="login-screen__field">
            <label htmlFor="password" className="login-screen__label">
              {isHindi ? 'पासवर्ड' : 'Password'}
            </label>
            <div className="password-input-container">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                placeholder={isHindi ? 'अपना पासवर्ड दर्ज करें' : 'Enter your password'}
                className="password-input"
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

          {error && (
            <p className="login-screen__error" role="alert">
              {error}
            </p>
          )}

          {attemptsLeft < 5 && attemptsLeft > 0 && !error.includes('locked') && (
            <p className="login-screen__warning">
              {isHindi 
                ? `${attemptsLeft} प्रयास शेष`
                : `${attemptsLeft} attempts remaining`}
            </p>
          )}

          <button
            type="submit"
            disabled={!isValid || isLoggingIn}
            className="login-screen__button"
          >
            {isLoggingIn ? (
              <>
                <span className="spinner" aria-hidden="true"></span>
                {isHindi ? 'लॉगिन हो रहा है...' : 'Logging in...'}
              </>
            ) : (
              isHindi ? 'लॉगिन करें' : 'Login'
            )}
          </button>

          <button
            type="button"
            className="login-screen__forgot-password"
            onClick={() => console.log('[TODO] Forgot password flow')}
          >
            {isHindi ? 'पासवर्ड भूल गए?' : 'Forgot Password?'}
          </button>
        </form>
      </div>
    </div>
  );
}
