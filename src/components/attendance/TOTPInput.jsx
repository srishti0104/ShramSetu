/**
 * TOTPInput Component
 * Allows workers to enter TOTP code for attendance marking
 */

import { useState, useRef, useEffect } from 'react';
import './TOTPInput.css';

const TOTPInput = ({ sessionId, workerId, onSuccess, onError }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleInputChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (index === 5 && value) {
      const fullCode = newCode.join('');
      if (fullCode.length === 6) {
        handleSubmit(fullCode);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Only accept 6-digit numbers
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
      
      // Auto-submit
      handleSubmit(pastedData);
    }
  };

  const handleSubmit = async (codeString = null) => {
    const fullCode = codeString || code.join('');

    if (fullCode.length !== 6) {
      setError('कृपया 6 अंकों का कोड दर्ज करें / Please enter 6-digit code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Validate TOTP
      const validateResponse = await fetch('/api/v1/attendance/validate-totp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          code: fullCode,
          workerId
        })
      });

      if (!validateResponse.ok) {
        const errorData = await validateResponse.json();
        throw new Error(errorData.message || 'Invalid code');
      }

      // Step 2: Mark attendance
      const attendanceResponse = await fetch('/api/v1/attendance/mark-attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          workerId,
          code: fullCode,
          location: await getCurrentLocation()
        })
      });

      if (!attendanceResponse.ok) {
        const errorData = await attendanceResponse.json();
        throw new Error(errorData.message || 'Failed to mark attendance');
      }

      const data = await attendanceResponse.json();
      
      setSuccess(true);
      setLoading(false);

      // Notify parent component
      if (onSuccess) {
        onSuccess(data.attendance);
      }

      // Reset after 2 seconds
      setTimeout(() => {
        setCode(['', '', '', '', '', '']);
        setSuccess(false);
        inputRefs.current[0]?.focus();
      }, 2000);

    } catch (err) {
      setError(err.message);
      setLoading(false);
      
      if (onError) {
        onError(err);
      }

      // Clear code on error
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const getCurrentLocation = () => {
    return new Promise((resolve) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            });
          },
          () => {
            resolve(null); // Location optional
          }
        );
      } else {
        resolve(null);
      }
    });
  };

  const handleReset = () => {
    setCode(['', '', '', '', '', '']);
    setError(null);
    setSuccess(false);
    inputRefs.current[0]?.focus();
  };

  if (success) {
    return (
      <div className="totp-input success">
        <div className="success-icon">✓</div>
        <h3>उपस्थिति दर्ज की गई! / Attendance Marked!</h3>
        <p>आपकी उपस्थिति सफलतापूर्वक दर्ज की गई है</p>
        <p>Your attendance has been recorded successfully</p>
      </div>
    );
  }

  return (
    <div className="totp-input">
      <div className="totp-input-header">
        <h3>उपस्थिति कोड दर्ज करें / Enter Attendance Code</h3>
        <p className="totp-input-subtitle">
          ठेकेदार द्वारा दिखाया गया 6 अंकों का कोड दर्ज करें
        </p>
      </div>

      <div className="code-input-container">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength="1"
            value={digit}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            disabled={loading}
            className={`code-digit ${error ? 'error' : ''}`}
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>

      {error && (
        <div className="error-message" role="alert">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="totp-input-actions">
        <button
          onClick={() => handleSubmit()}
          disabled={loading || code.join('').length !== 6}
          className="btn-submit"
        >
          {loading ? 'जांच रहे हैं... / Verifying...' : 'उपस्थिति दर्ज करें / Mark Attendance'}
        </button>

        <button
          onClick={handleReset}
          disabled={loading}
          className="btn-reset"
        >
          रीसेट / Reset
        </button>
      </div>

      <div className="totp-input-info">
        <p>💡 सुझाव / Tip:</p>
        <ul>
          <li>कोड 30 सेकंड में बदल जाता है / Code changes every 30 seconds</li>
          <li>कोड 5 मिनट तक वैध है / Code valid for 5 minutes</li>
          <li>स्थान सत्यापन वैकल्पिक है / Location verification is optional</li>
        </ul>
      </div>
    </div>
  );
};

export default TOTPInput;

