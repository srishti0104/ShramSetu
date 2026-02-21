/**
 * Back Button Component
 * 
 * @fileoverview Navigation button to go back to previous step
 */

import './BackButton.css';

/**
 * Back Button Component
 * @param {Object} props
 * @param {() => void} props.onClick - Callback when button is clicked
 * @param {boolean} [props.disabled] - Whether button is disabled
 * @param {string} [props.className] - Additional CSS classes
 */
export default function BackButton({ onClick, disabled = false, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`back-button ${className}`}
      aria-label="Go back"
    >
      <svg 
        viewBox="0 0 24 24" 
        fill="currentColor"
        className="back-button__icon"
      >
        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
      </svg>
      <span className="back-button__text">Back</span>
    </button>
  );
}
