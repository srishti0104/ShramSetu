/**
 * Auth Method Selection Screen
 * 
 * @fileoverview Third screen - allows user to choose authentication method
 */

import { useState } from 'react';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import ProgressIndicator from '../shared/ProgressIndicator';
import VoiceAssistButton from '../shared/VoiceAssistButton';
import BackButton from '../shared/BackButton';
import './AuthMethodSelection.css';

/**
 * Auth Method Selection Screen Component
 */
export default function AuthMethodSelection() {
  const { state, updateState, nextStep, previousStep } = useOnboarding();
  const [selectedMethod, setSelectedMethod] = useState(state.authMethod);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);

  const isWorker = state.role === 'worker';
  const isHindi = state.language === 'hi';

  /**
   * Handle auth method selection
   */
  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    
    setTimeout(() => {
      updateState({ authMethod: method });
      nextStep();
    }, 300);
  };

  /**
   * Handle voice assist
   */
  const handleVoiceAssist = () => {
    setIsVoicePlaying(!isVoicePlaying);
    console.log('[MOCK] Voice narration: Choose how to login');
  };

  return (
    <div className="auth-method-selection">
      <VoiceAssistButton 
        onClick={handleVoiceAssist}
        isPlaying={isVoicePlaying}
      />
      <BackButton onClick={previousStep} />
      
      <ProgressIndicator 
        step={state.currentStep} 
        total={state.totalSteps} 
      />

      <div className="auth-method-selection__content">
        <h1 className="auth-method-selection__title">
          {isHindi ? 'लॉगिन कैसे करें?' : 'How to Login?'}
        </h1>
        <p className="auth-method-selection__subtitle">
          {isHindi 
            ? 'अपनी पसंदीदा विधि चुनें' 
            : 'Choose your preferred method'}
        </p>

        <div className="auth-method-selection__cards">
          <AuthMethodCard
            method="phone"
            title={isHindi ? 'फोन नंबर' : 'Phone Number'}
            description={isHindi 
              ? 'मोबाइल नंबर और OTP से लॉगिन करें' 
              : 'Login with mobile number and OTP'}
            icon="📱"
            selected={selectedMethod === 'phone'}
            onSelect={handleMethodSelect}
          />
          
          {isWorker && (
            <AuthMethodCard
              method="eshram"
              title={isHindi ? 'ई-श्रम कार्ड' : 'E-Shram Card'}
              description={isHindi 
                ? 'सत्यापित श्रमिक क्रेडेंशियल्स से लॉगिन करें' 
                : 'Login with verified worker credentials'}
              icon="🆔"
              selected={selectedMethod === 'eshram'}
              onSelect={handleMethodSelect}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Auth Method Card Component
 */
function AuthMethodCard({ method, title, description, icon, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(method)}
      className={`auth-method-card ${selected ? 'auth-method-card--selected' : ''}`}
      aria-label={title}
      aria-pressed={selected}
    >
      <div className="auth-method-card__icon" aria-hidden="true">
        {icon}
      </div>
      <h2 className="auth-method-card__title">{title}</h2>
      <p className="auth-method-card__description">{description}</p>
      {selected && (
        <div className="auth-method-card__checkmark" aria-hidden="true">
          ✓
        </div>
      )}
    </button>
  );
}
