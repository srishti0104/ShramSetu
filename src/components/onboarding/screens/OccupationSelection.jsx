/**
 * Occupation Selection Screen
 * 
 * @fileoverview Allows workers to select their skills/occupations for job matching
 */

import { useState, useEffect } from 'react';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import ProgressIndicator from '../shared/ProgressIndicator';
import VoiceAssistButton from '../shared/VoiceAssistButton';
import BackButton from '../shared/BackButton';
import './OccupationSelection.css';

/**
 * Common occupations with icons
 */
const OCCUPATIONS = [
  { id: 'mason', nameEn: 'Mason', nameHi: 'राजमिस्त्री', icon: '🧱' },
  { id: 'painter', nameEn: 'Painter', nameHi: 'पेंटर', icon: '🎨' },
  { id: 'plumber', nameEn: 'Plumber', nameHi: 'प्लंबर', icon: '🔧' },
  { id: 'electrician', nameEn: 'Electrician', nameHi: 'इलेक्ट्रीशियन', icon: '⚡' },
  { id: 'carpenter', nameEn: 'Carpenter', nameHi: 'बढ़ई', icon: '🪚' },
  { id: 'construction', nameEn: 'Construction Labor', nameHi: 'निर्माण मजदूर', icon: '🏗️' },
  { id: 'driver', nameEn: 'Driver', nameHi: 'ड्राइवर', icon: '🚜' },
  { id: 'cleaner', nameEn: 'Cleaner', nameHi: 'सफाई कर्मचारी', icon: '🧹' },
  { id: 'welder', nameEn: 'Welder', nameHi: 'वेल्डर', icon: '🔨' },
  { id: 'domestic', nameEn: 'Domestic Worker', nameHi: 'घरेलू कामगार', icon: '🏠' },
  { id: 'gardener', nameEn: 'Gardener', nameHi: 'माली', icon: '🌱' },
  { id: 'security', nameEn: 'Security Guard', nameHi: 'सुरक्षा गार्ड', icon: '🛡️' }
];

/**
 * Occupation Selection Screen Component
 */
export default function OccupationSelection() {
  const { state, updateState, nextStep, previousStep } = useOnboarding();
  const [selectedSkills, setSelectedSkills] = useState(state.skills || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customSkill, setCustomSkill] = useState('');
  const [filteredOccupations, setFilteredOccupations] = useState(OCCUPATIONS);

  const isHindi = state.language === 'hi';

  /**
   * Filter occupations based on search query
   */
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredOccupations(OCCUPATIONS);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = OCCUPATIONS.filter(occ => 
        occ.nameEn.toLowerCase().includes(query) ||
        occ.nameHi.includes(query)
      );
      setFilteredOccupations(filtered);
    }
  }, [searchQuery]);

  /**
   * Toggle skill selection
   */
  const handleToggleSkill = (skillId) => {
    setSelectedSkills(prev => {
      if (prev.includes(skillId)) {
        return prev.filter(id => id !== skillId);
      } else {
        return [...prev, skillId];
      }
    });
  };

  /**
   * Add custom skill
   */
  const handleAddCustomSkill = () => {
    if (customSkill.trim()) {
      const customId = `custom_${Date.now()}`;
      setSelectedSkills(prev => [...prev, customId]);
      // Store custom skill name for later use
      updateState({ 
        customSkills: { 
          ...state.customSkills, 
          [customId]: customSkill.trim() 
        } 
      });
      setCustomSkill('');
      setShowCustomInput(false);
    }
  };

  /**
   * Handle continue
   */
  const handleContinue = () => {
    updateState({ skills: selectedSkills });
    nextStep();
  };

  /**
   * Handle voice search (mock)
   */
  const handleVoiceSearch = () => {
    console.log('[MOCK] Voice search activated');
    // TODO: Integrate with voice recognition service
  };

  /**
   * Voice narration on mount
   */
  useEffect(() => {
    console.log('[MOCK] Voice narration: Select your skills');
  }, []);

  return (
    <div className="occupation-selection">
      <VoiceAssistButton />
      <ProgressIndicator step={7} total={10} />
      <BackButton onClick={previousStep} />

      <div className="occupation-selection__content">
        <h1 className="occupation-selection__title">
          {isHindi ? 'अपने कौशल चुनें' : 'Select Your Skills'}
        </h1>
        <p className="occupation-selection__subtitle">
          {isHindi ? 'सभी लागू विकल्प चुनें' : 'Choose all that apply'}
        </p>

        {/* Search Bar */}
        <div className="occupation-selection__search">
          <input
            type="text"
            className="occupation-selection__search-input"
            placeholder={isHindi ? 'कौशल खोजें...' : 'Search skills...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label={isHindi ? 'कौशल खोजें' : 'Search skills'}
          />
          <button
            className="occupation-selection__voice-search"
            onClick={handleVoiceSearch}
            aria-label={isHindi ? 'आवाज से खोजें' : 'Voice search'}
          >
            🎤
          </button>
        </div>

        {/* Occupation Grid */}
        <div className="occupation-selection__grid">
          {filteredOccupations.map(occupation => {
            const isSelected = selectedSkills.includes(occupation.id);
            return (
              <button
                key={occupation.id}
                className={`occupation-card ${isSelected ? 'occupation-card--selected' : ''}`}
                onClick={() => handleToggleSkill(occupation.id)}
                aria-pressed={isSelected}
              >
                <span className="occupation-card__icon">{occupation.icon}</span>
                <span className="occupation-card__name">
                  {isHindi ? occupation.nameHi : occupation.nameEn}
                </span>
                {isSelected && (
                  <span className="occupation-card__check" aria-hidden="true">✓</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Add Custom Skill */}
        {!showCustomInput ? (
          <button
            className="occupation-selection__add-custom"
            onClick={() => setShowCustomInput(true)}
          >
            + {isHindi ? 'कस्टम कौशल जोड़ें' : 'Add Custom Skill'}
          </button>
        ) : (
          <div className="occupation-selection__custom-input">
            <input
              type="text"
              className="occupation-selection__custom-field"
              placeholder={isHindi ? 'कौशल का नाम दर्ज करें' : 'Enter skill name'}
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              autoFocus
            />
            <div className="occupation-selection__custom-actions">
              <button
                className="occupation-selection__custom-add"
                onClick={handleAddCustomSkill}
                disabled={!customSkill.trim()}
              >
                {isHindi ? 'जोड़ें' : 'Add'}
              </button>
              <button
                className="occupation-selection__custom-cancel"
                onClick={() => {
                  setShowCustomInput(false);
                  setCustomSkill('');
                }}
              >
                {isHindi ? 'रद्द करें' : 'Cancel'}
              </button>
            </div>
          </div>
        )}

        {/* Selected Count */}
        <div className="occupation-selection__count">
          {isHindi ? 'चयनित' : 'Selected'}: {selectedSkills.length}
        </div>

        {/* Continue Button */}
        <button
          className="occupation-selection__continue"
          onClick={handleContinue}
          disabled={selectedSkills.length === 0}
        >
          {isHindi ? 'जारी रखें' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
