/**
 * Disclaimer & Terms Screen
 * 
 * @fileoverview Presents terms of service and disclaimer in simple language
 */

import { useState, useEffect } from 'react';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import ProgressIndicator from '../shared/ProgressIndicator';
import VoiceInteraction from '../shared/VoiceInteraction';
import BackButton from '../shared/BackButton';
import './DisclaimerScreen.css';

/**
 * Key points data
 */
const KEY_POINTS = [
  {
    icon: '🔒',
    titleEn: 'Your data is secure',
    titleHi: 'आपका डेटा सुरक्षित है',
    descriptionEn: 'We protect your personal information with encryption',
    descriptionHi: 'हम एन्क्रिप्शन के साथ आपकी व्यक्तिगत जानकारी की रक्षा करते हैं'
  },
  {
    icon: '✓',
    titleEn: 'Fair usage',
    titleHi: 'उचित उपयोग',
    descriptionEn: 'Use the platform honestly and respectfully',
    descriptionHi: 'प्लेटफ़ॉर्म का ईमानदारी और सम्मान से उपयोग करें'
  },
  {
    icon: '👤',
    titleEn: 'Your rights',
    titleHi: 'आपके अधिकार',
    descriptionEn: 'You can delete your data anytime from settings',
    descriptionHi: 'आप सेटिंग्स से किसी भी समय अपना डेटा हटा सकते हैं'
  },
  {
    icon: '🆘',
    titleEn: 'Support available',
    titleHi: 'सहायता उपलब्ध',
    descriptionEn: 'Contact us for help or report issues',
    descriptionHi: 'सहायता के लिए हमसे संपर्क करें या समस्याओं की रिपोर्ट करें'
  }
];

/**
 * Disclaimer Screen Component
 */
export default function DisclaimerScreen() {
  const { state, updateState, previousStep, completeOnboarding, handleRegistration } = useOnboarding();
  const [hasAccepted, setHasAccepted] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const isHindi = state.language === 'hi';

  /**
   * Narration text for this screen
   */
  const narrationText = isHindi
    ? 'नियम और शर्तें पढ़ें।'
    : 'Read terms and conditions.';

  /**
   * Handle scroll to track if user has read content
   */
  const handleScroll = (e) => {
    const element = e.target;
    const scrolledToBottom = 
      element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    
    if (scrolledToBottom && !hasScrolled) {
      setHasScrolled(true);
    }
  };

  /**
   * Handle accept and continue
   */
  const handleAcceptAndContinue = async () => {
    if (!hasAccepted) return;
    
    updateState({ termsAccepted: true });
    
    // If signup flow, register the user
    if (state.authMethod === 'signup') {
      setIsRegistering(true);
      setError('');
      
      try {
        console.log('[REGISTRATION] Starting registration with data:', {
          phoneNumber: state.phoneNumber,
          role: state.role,
          language: state.language,
          hasLocation: !!state.location,
          hasSkills: state.skills?.length > 0,
          hasProfile: !!state.profile
        });
        
        await handleRegistration();
        console.log('[REGISTRATION] Success, completing onboarding...');
        completeOnboarding();
      } catch (err) {
        console.error('[REGISTRATION] Error:', err);
        console.error('[REGISTRATION] Error details:', {
          message: err.message,
          stack: err.stack
        });
        setError(err.message || (isHindi 
          ? 'पंजीकरण विफल। कृपया पुनः प्रयास करें।'
          : 'Registration failed. Please try again.'));
        setIsRegistering(false);
      }
    } else {
      // Login flow - already authenticated, just complete
      console.log('[LOGIN] Completing onboarding...');
      completeOnboarding();
    }
  };

  /**
   * Open full terms (mock)
   */
  const openFullTerms = () => {
    console.log('[MOCK] Opening full terms and conditions');
    // TODO: Open modal or navigate to full terms page
  };

  /**
   * Open privacy policy (mock)
   */
  const openPrivacyPolicy = () => {
    console.log('[MOCK] Opening privacy policy');
    // TODO: Open modal or navigate to privacy policy page
  };

  return (
    <div className="disclaimer-screen">
      <VoiceInteraction
        narrationText={narrationText}
        language={state.language || 'en'}
        showMicrophone={false}
      />
      <ProgressIndicator step={state.currentStep} total={state.totalSteps} />
      <BackButton onClick={previousStep} />

      <div className="disclaimer-screen__content">
        <h1 className="disclaimer-screen__title">
          {isHindi ? 'महत्वपूर्ण जानकारी' : 'Important Information'}
        </h1>

        {/* Scrollable Content */}
        <div 
          className="disclaimer-screen__scroll"
          onScroll={handleScroll}
        >
          <div className="disclaimer-screen__section-title">
            📋 {isHindi ? 'नियम और शर्तें' : 'Terms & Conditions'}
          </div>

          {/* Key Points */}
          {KEY_POINTS.map((point, index) => (
            <div key={index} className="key-point">
              <div className="key-point__icon">{point.icon}</div>
              <div className="key-point__content">
                <h3 className="key-point__title">
                  {isHindi ? point.titleHi : point.titleEn}
                </h3>
                <p className="key-point__description">
                  {isHindi ? point.descriptionHi : point.descriptionEn}
                </p>
              </div>
            </div>
          ))}

          {/* Additional Information */}
          <div className="disclaimer-screen__additional">
            <h3 className="disclaimer-screen__additional-title">
              {isHindi ? 'अतिरिक्त जानकारी' : 'Additional Information'}
            </h3>
            <p className="disclaimer-screen__additional-text">
              {isHindi 
                ? 'यह प्लेटफ़ॉर्म भारतीय श्रम कानूनों और DPDPA 2023 का अनुपालन करता है। आपकी जानकारी सुरक्षित रूप से संग्रहीत की जाती है और केवल आपकी सहमति से साझा की जाती है।'
                : 'This platform complies with Indian labor laws and DPDPA 2023. Your information is stored securely and shared only with your consent.'
              }
            </p>
          </div>

          {/* Document Links */}
          <div className="disclaimer-screen__links">
            <button
              className="disclaimer-screen__link"
              onClick={openFullTerms}
            >
              {isHindi ? 'पूर्ण नियम देखें' : 'View Full Terms'}
            </button>
            <button
              className="disclaimer-screen__link"
              onClick={openPrivacyPolicy}
            >
              {isHindi ? 'गोपनीयता नीति' : 'Privacy Policy'}
            </button>
          </div>
        </div>

        {/* Acceptance Checkbox */}
        <div className="disclaimer-screen__acceptance">
          <label className="disclaimer-screen__checkbox-label">
            <input
              type="checkbox"
              className="disclaimer-screen__checkbox"
              checked={hasAccepted}
              onChange={(e) => setHasAccepted(e.target.checked)}
              id="terms-acceptance"
            />
            <span className="disclaimer-screen__checkbox-custom" />
            <span className="disclaimer-screen__checkbox-text">
              {isHindi 
                ? 'मैं नियमों और शर्तों से सहमत हूं'
                : 'I agree to the terms and conditions'
              }
            </span>
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <p className="disclaimer-screen__error" role="alert">
            {error}
          </p>
        )}

        {/* Accept Button */}
        <button
          className="disclaimer-screen__accept"
          onClick={handleAcceptAndContinue}
          disabled={!hasAccepted || isRegistering}
        >
          {isRegistering ? (
            <>
              <span className="spinner" aria-hidden="true"></span>
              {isHindi ? 'पंजीकरण हो रहा है...' : 'Registering...'}
            </>
          ) : (
            isHindi ? 'स्वीकार करें और जारी रखें' : 'Accept & Continue'
          )}
        </button>
      </div>
    </div>
  );
}
