/**
 * Role Selection Screen
 * 
 * @fileoverview Second screen - allows user to select role (Worker or Employer)
 */

import { useState } from 'react';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import ProgressIndicator from '../shared/ProgressIndicator';
import VoiceInteraction from '../shared/VoiceInteraction';
import BackButton from '../shared/BackButton';
import './RoleSelection.css';

/**
 * Role Selection Screen Component
 */
export default function RoleSelection() {
  const { state, updateState, nextStep, previousStep } = useOnboarding();
  const [selectedRole, setSelectedRole] = useState(state.role);

  /**
   * Narration text for this screen
   */
  const narrationText = state.language === 'hi' 
    ? 'अपनी भूमिका चुनें। श्रमिक या नियोक्ता?'
    : 'Select your role. Worker or Employer?';

  /**
   * Handle role selection
   */
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    
    // Update state and move to next step after brief delay
    setTimeout(() => {
      updateState({ role });
      nextStep();
    }, 300);
  };

  /**
   * Handle voice input - recognize role
   */
  const handleVoiceInput = (transcript) => {
    console.log('Voice input received:', transcript);
    
    const lowerTranscript = transcript.toLowerCase();
    
    // Check for worker keywords
    if (lowerTranscript.includes('worker') || 
        lowerTranscript.includes('श्रमिक') || 
        lowerTranscript.includes('labour') ||
        lowerTranscript.includes('labor')) {
      handleRoleSelect('worker');
    }
    // Check for employer keywords
    else if (lowerTranscript.includes('employer') || 
             lowerTranscript.includes('नियोक्ता') || 
             lowerTranscript.includes('contractor') ||
             lowerTranscript.includes('boss')) {
      handleRoleSelect('employer');
    } else {
      console.log('No role matched for transcript:', transcript);
    }
  };

  /**
   * Handle back button
   */
  const handleBack = () => {
    previousStep();
  };

  return (
    <div className="role-selection">
      <VoiceInteraction
        narrationText={narrationText}
        language={state.language || 'en'}
        onVoiceInput={handleVoiceInput}
        voiceInputPrompt={state.language === 'hi' ? 'सुन रहे हैं...' : 'Listening...'}
      />
      <BackButton onClick={handleBack} />
      
      <ProgressIndicator 
        step={state.currentStep} 
        total={state.totalSteps} 
      />

      <div className="role-selection__content">
        <h1 className="role-selection__title">
          {state.language === 'hi' ? 'अपनी भूमिका चुनें' : 'Select Your Role'}
        </h1>
        <p className="role-selection__subtitle">
          {state.language === 'hi' 
            ? 'आप श्रमिक हैं या नियोक्ता?' 
            : 'Are you a Worker or Employer?'}
        </p>

        <div className="role-selection__cards">
          <RoleCard
            role="worker"
            title={state.language === 'hi' ? 'मैं श्रमिक हूं' : 'I am a Worker'}
            description={state.language === 'hi' 
              ? 'नौकरी खोजें, वेतन ट्रैक करें, उपस्थिति दर्ज करें' 
              : 'Find jobs, track wages, mark attendance'}
            icon="👷"
            selected={selectedRole === 'worker'}
            onSelect={handleRoleSelect}
          />
          
          <RoleCard
            role="employer"
            title={state.language === 'hi' ? 'मैं नियोक्ता हूं' : 'I am an Employer'}
            description={state.language === 'hi' 
              ? 'नौकरी पोस्ट करें, श्रमिकों का प्रबंधन करें, भुगतान ट्रैक करें' 
              : 'Post jobs, manage workers, track payments'}
            icon="💼"
            selected={selectedRole === 'employer'}
            onSelect={handleRoleSelect}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Role Card Component
 */
function RoleCard({ role, title, description, icon, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(role)}
      className={`role-card ${selected ? 'role-card--selected' : ''} role-card--${role}`}
      aria-label={title}
      aria-pressed={selected}
    >
      <div className="role-card__icon" aria-hidden="true">
        {icon}
      </div>
      <h2 className="role-card__title">{title}</h2>
      <p className="role-card__description">{description}</p>
      {selected && (
        <div className="role-card__checkmark" aria-hidden="true">
          ✓
        </div>
      )}
    </button>
  );
}
