/**
 * Auth Method Selection Screen
 * 
 * @fileoverview Screen for choosing between login and signup
 */

import { useOnboarding } from '../../../contexts/OnboardingContext';
import ProgressIndicator from '../shared/ProgressIndicator';
import VoiceInteraction from '../shared/VoiceInteraction';
import BackButton from '../shared/BackButton';
import './AuthMethodSelection.css';

/**
 * Auth Method Selection Screen Component
 */
export default function AuthMethodSelection() {
  const { state, updateState, nextStep, previousStep } = useOnboarding();
  const isHindi = state.language === 'hi';

  const narrationText = isHindi
    ? 'लॉगिन करें या नया खाता बनाएं।'
    : 'Login or create new account.';

  /**
   * Handle method selection
   */
  const handleMethodSelect = (method) => {
    updateState({ authMethod: method });
    nextStep();
  };

  /**
   * Handle voice input
   */
  const handleVoiceInput = (transcript) => {
    const lowerTranscript = transcript.toLowerCase();
    
    if (lowerTranscript.includes('login') || lowerTranscript.includes('लॉगिन') || lowerTranscript.includes('log in')) {
      handleMethodSelect('login');
    } else if (lowerTranscript.includes('sign up') || lowerTranscript.includes('signup') || 
               lowerTranscript.includes('साइन अप') || lowerTranscript.includes('register')) {
      handleMethodSelect('signup');
    }
  };

  return (
    <div className="auth-method-selection">
      <VoiceInteraction
        narrationText={narrationText}
        language={state.language || 'en'}
        onVoiceInput={handleVoiceInput}
        voiceInputPrompt={isHindi ? 'सुन रहे हैं...' : 'Listening...'}
      />
      <BackButton onClick={previousStep} />
      
      <ProgressIndicator 
        step={state.currentStep} 
        total={state.totalSteps} 
      />

      <div className="auth-method-selection__content">
        <h1 className="auth-method-selection__title">
          {isHindi ? 'आगे बढ़ें' : 'Continue'}
        </h1>
        <p className="auth-method-selection__subtitle">
          {isHindi 
            ? 'क्या आपके पास पहले से खाता है?' 
            : 'Do you already have an account?'}
        </p>

        <div className="auth-method-selection__options">
          <button
            type="button"
            onClick={() => handleMethodSelect('login')}
            className="auth-method-selection__option auth-method-selection__option--login"
          >
            <div className="auth-method-selection__option-icon">
              🔑
            </div>
            <h2 className="auth-method-selection__option-title">
              {isHindi ? 'लॉगिन करें' : 'Login'}
            </h2>
            <p className="auth-method-selection__option-description">
              {isHindi 
                ? 'मौजूदा खाते के साथ जारी रखें' 
                : 'Continue with existing account'}
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleMethodSelect('signup')}
            className="auth-method-selection__option auth-method-selection__option--signup"
          >
            <div className="auth-method-selection__option-icon">
              ✨
            </div>
            <h2 className="auth-method-selection__option-title">
              {isHindi ? 'साइन अप करें' : 'Sign Up'}
            </h2>
            <p className="auth-method-selection__option-description">
              {isHindi 
                ? 'नया खाता बनाएं' 
                : 'Create a new account'}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
