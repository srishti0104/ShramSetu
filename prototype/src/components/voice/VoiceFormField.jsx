/**
 * Voice Form Field Component
 * Combines text input with voice input functionality
 */

import { useState } from 'react';
import VoiceInput from './VoiceInput';
import './VoiceFormField.css';

const VoiceFormField = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
  disabled = false,
  language = 'hi-IN',
  rows = null,
  className = '',
  ...props
}) => {
  const [showVoiceSuccess, setShowVoiceSuccess] = useState(false);

  const handleVoiceTranscription = (text, result) => {
    // Create a synthetic event to match the expected onChange signature
    const syntheticEvent = {
      target: {
        name: name,
        value: text
      }
    };
    
    onChange(syntheticEvent);
    
    // Show success feedback
    setShowVoiceSuccess(true);
    setTimeout(() => setShowVoiceSuccess(false), 2000);
  };

  const isTextarea = type === 'textarea' || rows !== null;

  return (
    <div className={`voice-form-field ${className}`}>
      <label htmlFor={name} className="voice-form-field__label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      
      <div className="voice-form-field__input-group">
        <div className="voice-form-field__input-wrapper">
          {isTextarea ? (
            <textarea
              id={name}
              name={name}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              required={required}
              disabled={disabled}
              rows={rows || 4}
              className={`voice-form-field__textarea ${showVoiceSuccess ? 'voice-success' : ''}`}
              {...props}
            />
          ) : (
            <input
              type={type}
              id={name}
              name={name}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              required={required}
              disabled={disabled}
              className={`voice-form-field__input ${showVoiceSuccess ? 'voice-success' : ''}`}
              {...props}
            />
          )}
          
          {showVoiceSuccess && (
            <div className="voice-success-indicator">
              <span className="success-icon">✅</span>
              <span className="success-text">Voice input added!</span>
            </div>
          )}
        </div>
        
        <div className="voice-form-field__voice-wrapper">
          <VoiceInput
            onTranscription={handleVoiceTranscription}
            language={language}
            placeholder={`Speak ${label.toLowerCase()}`}
            disabled={disabled}
            className="voice-form-field__voice-input"
          />
        </div>
      </div>
    </div>
  );
};

export default VoiceFormField;