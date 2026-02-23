/**
 * TOTPDisplay Component
 * Displays TOTP code with countdown timer and auto-refresh
 */

import { useState, useEffect, useRef } from 'react';
import './TOTPDisplay.css';

const TOTPDisplay = ({ sessionId, contractorId, onError }) => {
  const [totp, setTotp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const countdownRef = useRef(null);

  // Generate new TOTP
  const generateTOTP = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/v1/attendance/generate-totp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          contractorId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate TOTP');
      }

      const data = await response.json();
      setTotp(data.totp);
      setCountdown(data.totp.expiresIn);
      setLoading(false);

    } catch (err) {
      setError(err.message);
      setLoading(false);
      if (onError) {
        onError(err);
      }
    }
  };

  // Initialize TOTP generation
  useEffect(() => {
    generateTOTP();

    // Auto-refresh every 30 seconds
    intervalRef.current = setInterval(() => {
      generateTOTP();
    }, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [sessionId, contractorId]);

  // Countdown timer
  useEffect(() => {
    if (totp && countdown > 0) {
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            return 30; // Reset for next code
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
        }
      };
    }
  }, [totp, countdown]);

  // Format code with spaces for readability
  const formatCode = (code) => {
    if (!code) return '';
    return code.match(/.{1,3}/g).join(' ');
  };

  // Calculate progress percentage
  const progressPercentage = (countdown / 30) * 100;

  // Determine urgency class
  const getUrgencyClass = () => {
    if (countdown <= 5) return 'urgent';
    if (countdown <= 10) return 'warning';
    return 'normal';
  };

  if (loading && !totp) {
    return (
      <div className="totp-display loading">
        <div className="loading-spinner"></div>
        <p>कोड बना रहे हैं... / Generating code...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="totp-display error">
        <div className="error-icon">⚠️</div>
        <p className="error-text">{error}</p>
        <button onClick={generateTOTP} className="btn-retry">
          पुनः प्रयास करें / Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`totp-display ${getUrgencyClass()}`}>
      <div className="totp-header">
        <h3>उपस्थिति कोड / Attendance Code</h3>
        <p className="totp-instruction">
          कर्मचारियों को यह कोड दिखाएं / Show this code to workers
        </p>
      </div>

      <div className="totp-code-container">
        <div className="totp-code" aria-live="polite" aria-atomic="true">
          {formatCode(totp?.code)}
        </div>
        
        <div className="totp-countdown">
          <div className="countdown-circle">
            <svg viewBox="0 0 100 100" className="countdown-svg">
              <circle
                cx="50"
                cy="50"
                r="45"
                className="countdown-bg"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                className="countdown-progress"
                style={{
                  strokeDasharray: `${2 * Math.PI * 45}`,
                  strokeDashoffset: `${2 * Math.PI * 45 * (1 - progressPercentage / 100)}`
                }}
              />
            </svg>
            <div className="countdown-text">
              <span className="countdown-number">{countdown}</span>
              <span className="countdown-label">सेकंड / sec</span>
            </div>
          </div>
        </div>
      </div>

      <div className="totp-info">
        <div className="info-item">
          <span className="info-label">सत्र / Session:</span>
          <span className="info-value">{sessionId}</span>
        </div>
        <div className="info-item">
          <span className="info-label">वैध / Valid until:</span>
          <span className="info-value">
            {totp?.validUntil ? new Date(totp.validUntil).toLocaleTimeString('hi-IN') : '-'}
          </span>
        </div>
      </div>

      <div className="totp-actions">
        <button
          onClick={generateTOTP}
          className="btn-refresh"
          aria-label="Refresh code"
        >
          🔄 नया कोड / Refresh
        </button>
      </div>

      {countdown <= 5 && (
        <div className="totp-alert" role="alert">
          ⏰ कोड जल्द ही समाप्त हो रहा है! / Code expiring soon!
        </div>
      )}
    </div>
  );
};

export default TOTPDisplay;

