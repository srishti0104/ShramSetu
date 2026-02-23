/**
 * Progress Indicator Component
 * 
 * @fileoverview Shows current step progress in onboarding flow
 */

import './ProgressIndicator.css';

/**
 * Progress Indicator Component
 * @param {Object} props
 * @param {number} props.step - Current step number
 * @param {number} props.total - Total number of steps
 * @param {string} [props.className] - Additional CSS classes
 */
export default function ProgressIndicator({ step, total, className = '' }) {
  const percentage = (step / total) * 100;

  return (
    <div className={`progress-indicator ${className}`}>
      <div className="progress-indicator__bar">
        <div 
          className="progress-indicator__fill"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label={`Step ${step} of ${total}`}
        />
      </div>
      <div className="progress-indicator__text">
        {step} / {total}
      </div>
    </div>
  );
}
