/**
 * Biometric Setup Component
 * 
 * @fileoverview Passkey/biometric authentication configuration
 * Uses WebAuthn API for biometric authentication
 */

import { useState, useEffect } from 'react';
import './BiometricSetup.css';

/**
 * Check if WebAuthn is supported
 * @returns {boolean}
 */
function isWebAuthnSupported() {
  return window.PublicKeyCredential !== undefined &&
         navigator.credentials !== undefined;
}

/**
 * Check if platform authenticator is available (biometric)
 * @returns {Promise<boolean>}
 */
async function isPlatformAuthenticatorAvailable() {
  if (!isWebAuthnSupported()) return false;
  
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

/**
 * Biometric Setup Component
 * @param {Object} props
 * @param {string} props.userId - User ID for passkey registration
 * @param {() => Promise<void>} props.onSetup - Callback when biometric is set up
 * @param {() => void} props.onSkip - Callback to skip biometric setup
 * @param {boolean} [props.isLoading] - Loading state
 * @param {string} [props.error] - Error message
 * @param {string} [props.className] - Additional CSS classes
 */
export default function BiometricSetup({
  userId,
  onSetup,
  onSkip,
  isLoading = false,
  error = '',
  className = ''
}) {
  const [isSupported, setIsSupported] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  /**
   * Check biometric support
   */
  const checkBiometricSupport = async () => {
    setChecking(true);
    
    const supported = isWebAuthnSupported();
    setIsSupported(supported);
    
    if (supported) {
      const available = await isPlatformAuthenticatorAvailable();
      setIsAvailable(available);
    }
    
    setChecking(false);
  };

  /**
   * Handle biometric setup
   */
  const handleSetup = async () => {
    if (!isSupported || !isAvailable || isLoading) return;

    try {
      // In production, this would call the WebAuthn registration API
      // For now, we'll simulate the setup
      console.log('[MOCK] Setting up biometric authentication for user:', userId);
      
      // Mock WebAuthn registration
      // const publicKeyCredentialCreationOptions = {
      //   challenge: new Uint8Array(32), // Server-generated challenge
      //   rp: {
      //     name: "Shramik-Setu",
      //     id: window.location.hostname
      //   },
      //   user: {
      //     id: new TextEncoder().encode(userId),
      //     name: userId,
      //     displayName: "User"
      //   },
      //   pubKeyCredParams: [
      //     { alg: -7, type: "public-key" },  // ES256
      //     { alg: -257, type: "public-key" } // RS256
      //   ],
      //   authenticatorSelection: {
      //     authenticatorAttachment: "platform",
      //     userVerification: "required"
      //   },
      //   timeout: 60000,
      //   attestation: "none"
      // };
      
      // const credential = await navigator.credentials.create({
      //   publicKey: publicKeyCredentialCreationOptions
      // });
      
      // Send credential to server for storage
      await onSetup();
    } catch (err) {
      console.error('Biometric setup failed:', err);
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

  if (checking) {
    return (
      <div className={`biometric-setup ${className}`}>
        <div className="biometric-setup__loading">
          <div className="biometric-setup__spinner" aria-label="Checking biometric support..."></div>
          <p>Checking device capabilities...</p>
        </div>
      </div>
    );
  }

  if (!isSupported || !isAvailable) {
    return (
      <div className={`biometric-setup ${className}`}>
        <div className="biometric-setup__icon biometric-setup__icon--unavailable" aria-hidden="true">
          <svg viewBox="0 0 64 64" fill="currentColor">
            <path d="M32 4C16.536 4 4 16.536 4 32s12.536 28 28 28 28-12.536 28-28S47.464 4 32 4zm0 8c11.046 0 20 8.954 20 20s-8.954 20-20 20-20-8.954-20-20 8.954-20 20-20zm-4 12v16h8V24h-8z"/>
          </svg>
        </div>
        
        <h2 className="biometric-setup__title">Biometric Not Available</h2>
        
        <p className="biometric-setup__description">
          Your device doesn't support biometric authentication or it's not set up.
          You can still use Shramik-Setu with OTP authentication.
        </p>

        <button
          type="button"
          onClick={handleSkip}
          className="biometric-setup__submit"
        >
          Continue without Biometric
        </button>
      </div>
    );
  }

  return (
    <div className={`biometric-setup ${className}`}>
      <div className="biometric-setup__icon" aria-hidden="true">
        <svg viewBox="0 0 64 64" fill="currentColor">
          <path d="M32 4C16.536 4 4 16.536 4 32s12.536 28 28 28 28-12.536 28-28S47.464 4 32 4zm0 8c11.046 0 20 8.954 20 20s-8.954 20-20 20-20-8.954-20-20 8.954-20 20-20zm-8 16c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm16 0c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-8 12c-4.418 0-8 3.582-8 8h16c0-4.418-3.582-8-8-8z"/>
        </svg>
      </div>
      
      <h2 className="biometric-setup__title">Set Up Biometric Login</h2>
      
      <p className="biometric-setup__description">
        Use your fingerprint or face recognition for quick and secure login
      </p>

      <div className="biometric-setup__benefits">
        <div className="biometric-setup__benefit">
          <svg className="biometric-setup__benefit-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Faster login</span>
        </div>
        
        <div className="biometric-setup__benefit">
          <svg className="biometric-setup__benefit-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span>More secure</span>
        </div>
        
        <div className="biometric-setup__benefit">
          <svg className="biometric-setup__benefit-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          <span>No OTP needed</span>
        </div>
      </div>

      {error && (
        <div className="biometric-setup__error" role="alert">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleSetup}
        disabled={isLoading}
        className="biometric-setup__submit"
      >
        {isLoading ? 'Setting up...' : 'Enable Biometric Login'}
      </button>

      <button
        type="button"
        onClick={handleSkip}
        disabled={isLoading}
        className="biometric-setup__skip"
      >
        Skip for now
      </button>

      <p className="biometric-setup__note">
        You can enable this later in settings
      </p>
    </div>
  );
}
