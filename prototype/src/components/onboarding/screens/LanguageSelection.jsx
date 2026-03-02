/**
 * Language Selection Screen
 * 
 * @fileoverview First screen in onboarding - allows user to select preferred language
 */

import { useState } from 'react';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import ProgressIndicator from '../shared/ProgressIndicator';
import VoiceAssistButton from '../shared/VoiceAssistButton';
import './LanguageSelection.css';

/**
 * Available languages
 */
const LANGUAGES = [
  { code: 'hi', name: 'हिंदी', nativeName: 'Hindi', flag: '🇮🇳' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'mr', name: 'मराठी', nativeName: 'Marathi', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી', nativeName: 'Gujarati', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', nativeName: 'Tamil', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', nativeName: 'Telugu', flag: '🇮🇳' },
  { code: 'kn', name: 'ಕನ್ನಡ', nativeName: 'Kannada', flag: '🇮🇳' },
  { code: 'ml', name: 'മലയാളം', nativeName: 'Malayalam', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', nativeName: 'Bengali', flag: '🇮🇳' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', nativeName: 'Punjabi', flag: '🇮🇳' }
];

/**
 * Language Selection Screen Component
 */
export default function LanguageSelection() {
  const { state, updateState, nextStep } = useOnboarding();
  const { setLanguage } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(state.language);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);

  /**
   * Handle language selection
   */
  const handleLanguageSelect = async (languageCode) => {
    console.log(`Language selection started: ${languageCode}`);
    setSelectedLanguage(languageCode);
    
    try {
      // Update the main app's language context immediately
      console.log(`Changing app language to: ${languageCode}`);
      const success = await setLanguage(languageCode);
      
      if (success) {
        console.log(`Language successfully changed to: ${languageCode}`);
        // Update onboarding state
        updateState({ language: languageCode });
        
        // Move to next step after brief delay
        setTimeout(() => {
          console.log(`Moving to next step after language selection: ${languageCode}`);
          nextStep();
        }, 300);
      } else {
        console.error(`Failed to change language to: ${languageCode}`);
      }
    } catch (error) {
      console.error('Error changing language during onboarding:', error);
    }
  };

  /**
   * Handle voice assist
   */
  const handleVoiceAssist = () => {
    setIsVoicePlaying(!isVoicePlaying);
    // TODO: Implement voice narration
    console.log('[MOCK] Voice narration: Choose your preferred language');
  };

  return (
    <div className="language-selection">
      <VoiceAssistButton 
        onClick={handleVoiceAssist}
        isPlaying={isVoicePlaying}
      />
      
      <ProgressIndicator 
        step={state.currentStep} 
        total={state.totalSteps} 
      />

      <div className="language-selection__content">
        <h1 className="language-selection__title">
          Choose Your Language
          <br />
          <span className="language-selection__subtitle">अपनी भाषा चुनें</span>
        </h1>

        <div className="language-selection__grid">
          {LANGUAGES.map((language) => (
            <LanguageCard
              key={language.code}
              language={language}
              selected={selectedLanguage === language.code}
              onSelect={handleLanguageSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Language Card Component
 */
function LanguageCard({ language, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(language.code)}
      className={`language-card ${selected ? 'language-card--selected' : ''}`}
      aria-label={`Select ${language.nativeName}`}
      aria-pressed={selected}
    >
      <span className="language-card__flag" aria-hidden="true">
        {language.flag}
      </span>
      <span className="language-card__name">
        {language.name}
      </span>
      <span className="language-card__native">
        {language.nativeName}
      </span>
      {selected && (
        <span className="language-card__checkmark" aria-hidden="true">
          ✓
        </span>
      )}
    </button>
  );
}
