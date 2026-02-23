/**
 * Voice Button Component
 * 
 * @fileoverview Push-to-talk button interface for voice commands
 */

import { useState } from 'react';
import './VoiceButton.css';

/**
 * Voice Button Component
 * @param {Object} props
 * @param {() => void} props.onPress - Callback when button is pressed
 * @param {() => void} props.onRelease - Callback when button is released
 * @param {boolean} [props.isActive] - Whether button is active (recording)
 * @param {boolean} [props.isDisabled] - Whether button is disabled
 * @param {string} [props.size] - Button size ('small', 'medium', 'large')
 * @param {string} [props.className] - Additional CSS classes
 */
export default function VoiceButton({
  onPress,
  onRelease,
  isActive = false,
  isDisabled = false,
  size = 'large',
  className = ''
}) {
  const [isPressed, setIsPressed] = useState(false);

  /**
   * Handle mouse/touch down
   */
  const handleDown = () => {
    if (isDisabled) return;
    setIsPressed(true);
    onPress();
  };

  /**
   * Handle mouse/touch up
   */
  const handleUp = () => {
    if (isDisabled) return;
    setIsPressed(false);
    onRelease();
  };

  /**
   * Handle key down (Space or Enter)
   * @param {React.KeyboardEvent} e
   */
  const handleKeyDown = (e) => {
    if (isDisabled) return;
    if ((e.key === ' ' || e.key === 'Enter') && !isPressed) {
      e.preventDefault();
      handleDown();
    }
  };

  /**
   * Handle key up
   * @param {React.KeyboardEvent} e
   */
  const handleKeyUp = (e) => {
    if (isDisabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleUp();
    }
  };

  return (
    <button
      type="button"
      onMouseDown={handleDown}
      onMouseUp={handleUp}
      onMouseLeave={handleUp}
      onTouchStart={handleDown}
      onTouchEnd={handleUp}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      disabled={isDisabled}
      className={`voice-button voice-button--${size} ${
        isActive || isPressed ? 'voice-button--active' : ''
      } ${className}`}
      aria-label="Push to talk"
      aria-pressed={isActive || isPressed}
    >
      <div className="voice-button__icon">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        </svg>
      </div>
      
      <span className="voice-button__text">
        {isActive || isPressed ? 'Release to send' : 'Hold to speak'}
      </span>
      
      {(isActive || isPressed) && (
        <div className="voice-button__pulse" aria-hidden="true" />
      )}
    </button>
  );
}

