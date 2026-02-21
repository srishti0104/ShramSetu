/**
 * Language Selector Component
 * 
 * @fileoverview Multi-language selection component for onboarding
 * Supports Hindi + 9 regional languages
 */

import { useState } from 'react';
import './LanguageSelector.css';

/**
 * @typedef {import('../../types/common.js').LanguageCode} LanguageCode
 */

const LANGUAGES = [
  { code: 'hi', name: 'हिंदी', nativeName: 'Hindi' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'mr', name: 'मराठी', nativeName: 'Marathi' },
  { code: 'gu', name: 'ગુજરાતી', nativeName: 'Gujarati' },
  { code: 'ta', name: 'தமிழ்', nativeName: 'Tamil' },
  { code: 'te', name: 'తెలుగు', nativeName: 'Telugu' },
  { code: 'kn', name: 'ಕನ್ನಡ', nativeName: 'Kannada' },
  { code: 'ml', name: 'മലയാളം', nativeName: 'Malayalam' },
  { code: 'bn', name: 'বাংলা', nativeName: 'Bengali' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', nativeName: 'Punjabi' }
];

/**
 * Language Selector Component
 * @param {Object} props
 * @param {LanguageCode} [props.selectedLanguage] - Currently selected language
 * @param {(language: LanguageCode) => void} props.onLanguageSelect - Callback when language is selected
 * @param {string} [props.className] - Additional CSS classes
 */
export default function LanguageSelector({ selectedLanguage, onLanguageSelect, className = '' }) {
  const [selected, setSelected] = useState(selectedLanguage || 'hi');

  const handleSelect = (languageCode) => {
    setSelected(languageCode);
    onLanguageSelect(languageCode);
  };

  return (
    <div className={`language-selector ${className}`}>
      <h2 className="language-selector__title">
        Select Your Language / अपनी भाषा चुनें
      </h2>
      
      <div className="language-selector__grid" role="radiogroup" aria-label="Language selection">
        {LANGUAGES.map((language) => (
          <button
            key={language.code}
            type="button"
            role="radio"
            aria-checked={selected === language.code}
            className={`language-selector__option ${
              selected === language.code ? 'language-selector__option--selected' : ''
            }`}
            onClick={() => handleSelect(language.code)}
          >
            <span className="language-selector__native-name">{language.name}</span>
            <span className="language-selector__english-name">{language.nativeName}</span>
            {selected === language.code && (
              <span className="language-selector__checkmark" aria-hidden="true">✓</span>
            )}
          </button>
        ))}
      </div>

      <p className="language-selector__hint">
        You can change this later in settings
      </p>
    </div>
  );
}
