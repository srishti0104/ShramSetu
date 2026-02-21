/**
 * Fallback Prompt Component
 * 
 * @fileoverview Visual fallback UI when voice recognition fails
 */

import './FallbackPrompt.css';

/**
 * Fallback Prompt Component
 * @param {Object} props
 * @param {string} props.reason - Reason for fallback
 * @param {string[]} [props.suggestedActions] - Suggested actions for user
 * @param {() => void} [props.onRetry] - Callback to retry voice command
 * @param {() => void} [props.onUseText] - Callback to switch to text input
 * @param {string} [props.className] - Additional CSS classes
 */
export default function FallbackPrompt({
  reason,
  suggestedActions = [],
  onRetry,
  onUseText,
  className = ''
}) {
  const getFallbackMessage = () => {
    switch (reason) {
      case 'low_confidence':
        return "I couldn't understand that clearly. Please try again.";
      case 'no_audio':
        return "No audio detected. Please check your microphone.";
      case 'network_error':
        return "Network error. Please check your connection.";
      case 'timeout':
        return "Request timed out. Please try again.";
      default:
        return "Something went wrong. Please try again.";
    }
  };

  const getIcon = () => {
    switch (reason) {
      case 'low_confidence':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        );
      case 'no_audio':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>
          </svg>
        );
      case 'network_error':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46C10.21 6.23 11.08 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3 0 1.13-.64 2.11-1.56 2.62l1.45 1.45C23.16 18.16 24 16.68 24 15c0-2.64-2.05-4.78-4.65-4.96zM3 5.27l2.75 2.74C2.56 8.15 0 10.77 0 14c0 3.31 2.69 6 6 6h11.73l2 2L21 20.73 4.27 4 3 5.27zM7.73 10l8 8H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h1.73z"/>
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        );
    }
  };

  return (
    <div className={`fallback-prompt ${className}`}>
      <div className="fallback-prompt__icon" aria-hidden="true">
        {getIcon()}
      </div>

      <h3 className="fallback-prompt__title">Voice Command Failed</h3>

      <p className="fallback-prompt__message">{getFallbackMessage()}</p>

      {suggestedActions.length > 0 && (
        <div className="fallback-prompt__suggestions">
          <p className="fallback-prompt__suggestions-title">Try:</p>
          <ul className="fallback-prompt__suggestions-list">
            {suggestedActions.map((action, index) => (
              <li key={index}>{action}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="fallback-prompt__actions">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="fallback-prompt__button fallback-prompt__button--primary"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            Try Again
          </button>
        )}

        {onUseText && (
          <button
            type="button"
            onClick={onUseText}
            className="fallback-prompt__button fallback-prompt__button--secondary"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
            </svg>
            Use Text Instead
          </button>
        )}
      </div>
    </div>
  );
}
