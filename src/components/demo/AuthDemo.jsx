/**
 * Auth Demo Component
 * 
 * Demo component to test AWS Lambda authentication
 */

import { useState } from 'react';
import './AuthDemo.css';
import authService from '../../services/aws/authService';

export default function AuthDemo() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOTP] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('worker');
  const [step, setStep] = useState('phone'); // phone, otp, register, login, success
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);

  const handleSendOTP = async () => {
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const formattedPhone = authService.formatPhoneNumber(phoneNumber);
      
      if (!authService.isValidPhoneNumber(formattedPhone)) {
        throw new Error('Please enter a valid 10-digit phone number');
      }

      const result = await authService.sendOTP(formattedPhone);
      setMessage(`OTP sent successfully! Valid for ${result.expiresIn / 60} minutes.`);
      setStep('otp');
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const formattedPhone = authService.formatPhoneNumber(phoneNumber);
      
      if (!authService.isValidOTP(otp)) {
        throw new Error('Please enter a valid 6-digit OTP');
      }

      const result = await authService.verifyOTP(formattedPhone, otp);
      setMessage('OTP verified successfully!');
      
      // Check if user exists by trying to login
      try {
        const loginResult = await authService.login(formattedPhone);
        setUserData(loginResult.user);
        setStep('success');
        setMessage('Login successful!');
      } catch (loginErr) {
        // User doesn't exist, go to registration
        setStep('register');
        setMessage('Please complete your registration');
      }
    } catch (err) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const formattedPhone = authService.formatPhoneNumber(phoneNumber);
      
      if (!name.trim()) {
        throw new Error('Please enter your name');
      }

      const registrationData = {
        phoneNumber: formattedPhone,
        name: name.trim(),
        role
      };

      const result = await authService.register(registrationData);
      
      // Auto-login after registration
      const loginResult = await authService.login(formattedPhone);
      setUserData(loginResult.user);
      setStep('success');
      setMessage('Registration successful!');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUserData(null);
    setPhoneNumber('');
    setOTP('');
    setName('');
    setRole('worker');
    setStep('phone');
    setMessage('');
    setError('');
  };

  const handleReset = () => {
    setPhoneNumber('');
    setOTP('');
    setName('');
    setRole('worker');
    setStep('phone');
    setMessage('');
    setError('');
  };

  return (
    <div className="auth-demo">
      <div className="auth-demo__header">
        <h2>🔐 Authentication Demo</h2>
        <p>Test AWS Lambda authentication with OTP</p>
      </div>

      <div className="auth-demo__card">
        {/* Messages */}
        {message && (
          <div className="auth-demo__message auth-demo__message--success">
            ✓ {message}
          </div>
        )}

        {error && (
          <div className="auth-demo__message auth-demo__message--error">
            ⚠ {error}
          </div>
        )}

        {/* Step 1: Phone Number */}
        {step === 'phone' && (
          <div className="auth-demo__step">
            <h3>Enter Phone Number</h3>
            <input
              type="tel"
              placeholder="10-digit mobile number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              maxLength={10}
              className="auth-demo__input"
            />
            <button
              onClick={handleSendOTP}
              disabled={isLoading || phoneNumber.length !== 10}
              className="auth-demo__button"
            >
              {isLoading ? 'Sending...' : 'Send OTP'}
            </button>
          </div>
        )}

        {/* Step 2: OTP Verification */}
        {step === 'otp' && (
          <div className="auth-demo__step">
            <h3>Enter OTP</h3>
            <p className="auth-demo__info">
              OTP sent to +91{phoneNumber}
            </p>
            <input
              type="text"
              placeholder="6-digit OTP"
              value={otp}
              onChange={(e) => setOTP(e.target.value)}
              maxLength={6}
              className="auth-demo__input"
            />
            <button
              onClick={handleVerifyOTP}
              disabled={isLoading || otp.length !== 6}
              className="auth-demo__button"
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              onClick={handleReset}
              className="auth-demo__button auth-demo__button--secondary"
            >
              Change Number
            </button>
          </div>
        )}

        {/* Step 3: Registration */}
        {step === 'register' && (
          <div className="auth-demo__step">
            <h3>Complete Registration</h3>
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="auth-demo__input"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="auth-demo__select"
            >
              <option value="worker">Worker</option>
              <option value="employer">Employer</option>
            </select>
            <button
              onClick={handleRegister}
              disabled={isLoading || !name.trim()}
              className="auth-demo__button"
            >
              {isLoading ? 'Registering...' : 'Complete Registration'}
            </button>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 'success' && userData && (
          <div className="auth-demo__step">
            <h3>✓ Authentication Successful!</h3>
            <div className="auth-demo__user-info">
              <div className="auth-demo__user-field">
                <strong>Name:</strong> {userData.name}
              </div>
              <div className="auth-demo__user-field">
                <strong>Phone:</strong> {userData.phoneNumber}
              </div>
              <div className="auth-demo__user-field">
                <strong>Role:</strong> {userData.role}
              </div>
              <div className="auth-demo__user-field">
                <strong>User ID:</strong> {userData.userId}
              </div>
              <div className="auth-demo__user-field">
                <strong>Token:</strong> {authService.getToken()?.substring(0, 20)}...
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="auth-demo__button auth-demo__button--danger"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="auth-demo__info-box">
        <h4>📋 How it works:</h4>
        <ol>
          <li>Enter your 10-digit mobile number</li>
          <li>Receive OTP via SMS (AWS SNS)</li>
          <li>Verify OTP (stored in DynamoDB)</li>
          <li>Register (if new user) or Login (if existing)</li>
          <li>Get JWT token for authenticated requests</li>
        </ol>
        <p><strong>Note:</strong> SMS sending requires AWS SNS to be configured with SMS permissions.</p>
      </div>
    </div>
  );
}
