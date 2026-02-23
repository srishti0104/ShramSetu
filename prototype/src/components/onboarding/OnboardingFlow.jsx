/**
 * Onboarding Flow Container
 * 
 * @fileoverview Main container that manages the onboarding flow and screen routing
 */

import { OnboardingProvider, useOnboarding } from '../../contexts/OnboardingContext';
import LanguageSelection from './screens/LanguageSelection';
import RoleSelection from './screens/RoleSelection';
import AuthMethodSelection from './screens/AuthMethodSelection';
import PhoneNumberEntry from './screens/PhoneNumberEntry';
import OTPVerification from './screens/OTPVerification';
import LocationFetch from './screens/LocationFetch';
import OccupationSelection from './screens/OccupationSelection';
import PersonalDetails from './screens/PersonalDetails';
import BenefitsScreen from './screens/BenefitsScreen';
import DisclaimerScreen from './screens/DisclaimerScreen';
import './OnboardingFlow.css';

/**
 * Onboarding Flow Component
 * 
 * @param {Object} props
 * @param {Function} props.onComplete - Callback when onboarding is completed
 */
export default function OnboardingFlow({ onComplete }) {
  return (
    <OnboardingProvider onComplete={onComplete}>
      <OnboardingFlowContent />
    </OnboardingProvider>
  );
}

/**
 * Onboarding Flow Content (with context access)
 */
function OnboardingFlowContent() {
  const { state } = useOnboarding();

  /**
   * Render current screen based on step
   */
  const renderScreen = () => {
    switch (state.currentStep) {
      case 1:
        return <LanguageSelection />;
      case 2:
        return <RoleSelection />;
      case 3:
        return <AuthMethodSelection />;
      case 4:
        return <PhoneNumberEntry />;
      case 5:
        return <OTPVerification />;
      case 6:
        return <LocationFetch />;
      case 7:
        // Workers see occupation selection, employers skip to personal details
        return state.role === 'worker' 
          ? <OccupationSelection />
          : <PersonalDetails />;
      case 8:
        return <PersonalDetails />;
      case 9:
        return <BenefitsScreen />;
      case 10:
        return <DisclaimerScreen />;
      default:
        return <LanguageSelection />;
    }
  };

  return (
    <div className="onboarding-flow">
      {renderScreen()}
    </div>
  );
}
