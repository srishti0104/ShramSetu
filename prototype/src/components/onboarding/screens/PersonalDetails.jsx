/**
 * Personal Details Screen
 * 
 * @fileoverview Screen for collecting user's personal information
 */

import { useState } from 'react';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import ProgressIndicator from '../shared/ProgressIndicator';
import VoiceInteraction from '../shared/VoiceInteraction';
import BackButton from '../shared/BackButton';
import './PersonalDetails.css';

/**
 * Personal Details Screen Component
 */
export default function PersonalDetails() {
  const { state, updateState, nextStep, previousStep } = useOnboarding();
  const [formData, setFormData] = useState({
    name: state.profile.name || '',
    age: state.profile.age || '',
    gender: state.profile.gender || '',
    photo: state.profile.photo || null
  });
  const [errors, setErrors] = useState({});

  const isHindi = state.language === 'hi';

  /**
   * Narration text for this screen
   */
  const narrationText = isHindi
    ? 'अपनी प्रोफ़ाइल पूरी करें।'
    : 'Complete your profile.';

  /**
   * Validate form
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = isHindi 
        ? 'कृपया अपना नाम दर्ज करें' 
        : 'Please enter your name';
    }

    if (!formData.age || formData.age < 18 || formData.age > 70) {
      newErrors.age = isHindi 
        ? 'आयु 18-70 के बीच होनी चाहिए' 
        : 'Age must be between 18-70';
    }

    if (!formData.gender) {
      newErrors.gender = isHindi 
        ? 'कृपया लिंग चुनें' 
        : 'Please select gender';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle input change
   */
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  /**
   * Handle photo upload
   */
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('photo', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Handle submit
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    updateState({ profile: formData });
    nextStep();
  };

  return (
    <div className="personal-details">
      <VoiceInteraction
        narrationText={narrationText}
        language={state.language || 'en'}
        showMicrophone={false}
      />
      <BackButton onClick={previousStep} />
      
      <ProgressIndicator 
        step={state.currentStep} 
        total={state.totalSteps} 
      />

      <div className="personal-details__content">
        <h1 className="personal-details__title">
          {isHindi ? 'अपनी प्रोफ़ाइल पूरी करें' : 'Complete Your Profile'}
        </h1>

        <form onSubmit={handleSubmit} className="personal-details__form">
          {/* Photo Upload */}
          <div className="photo-upload">
            <div className="photo-upload__preview">
              {formData.photo ? (
                <img src={formData.photo} alt="Profile" />
              ) : (
                <div className="photo-upload__placeholder">
                  📷
                </div>
              )}
            </div>
            <div className="photo-upload__actions">
              <label htmlFor="photo-upload" className="photo-upload__button">
                {isHindi ? 'फोटो अपलोड करें' : 'Upload Photo'}
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                />
              </label>
              <p className="photo-upload__note">
                {isHindi ? '(वैकल्पिक)' : '(Optional)'}
              </p>
            </div>
          </div>

          {/* Name */}
          <div className="form-field">
            <label htmlFor="name">
              {isHindi ? 'पूरा नाम' : 'Full Name'} *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder={isHindi ? 'अपना नाम दर्ज करें' : 'Enter your name'}
              className={errors.name ? 'form-field__input--error' : ''}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <p id="name-error" className="form-field__error" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          {/* Age */}
          <div className="form-field">
            <label htmlFor="age">
              {isHindi ? 'आयु' : 'Age'} *
            </label>
            <select
              id="age"
              value={formData.age}
              onChange={(e) => handleChange('age', parseInt(e.target.value))}
              className={errors.age ? 'form-field__input--error' : ''}
              aria-invalid={!!errors.age}
              aria-describedby={errors.age ? 'age-error' : undefined}
            >
              <option value="">
                {isHindi ? 'आयु चुनें' : 'Select Age'}
              </option>
              {Array.from({ length: 53 }, (_, i) => i + 18).map(age => (
                <option key={age} value={age}>{age}</option>
              ))}
            </select>
            {errors.age && (
              <p id="age-error" className="form-field__error" role="alert">
                {errors.age}
              </p>
            )}
          </div>

          {/* Gender */}
          <div className="form-field">
            <label>
              {isHindi ? 'लिंग' : 'Gender'} *
            </label>
            <div className="gender-selector">
              <label className="gender-option">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={(e) => handleChange('gender', e.target.value)}
                />
                <span>{isHindi ? 'पुरुष' : 'Male'}</span>
              </label>
              <label className="gender-option">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={(e) => handleChange('gender', e.target.value)}
                />
                <span>{isHindi ? 'महिला' : 'Female'}</span>
              </label>
              <label className="gender-option">
                <input
                  type="radio"
                  name="gender"
                  value="other"
                  checked={formData.gender === 'other'}
                  onChange={(e) => handleChange('gender', e.target.value)}
                />
                <span>{isHindi ? 'अन्य' : 'Other'}</span>
              </label>
            </div>
            {errors.gender && (
              <p className="form-field__error" role="alert">
                {errors.gender}
              </p>
            )}
          </div>

          <p className="personal-details__required-note">
            * {isHindi ? 'आवश्यक फ़ील्ड' : 'Required fields'}
          </p>

          <button type="submit" className="personal-details__button">
            {isHindi ? 'प्रोफ़ाइल पूरी करें' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
