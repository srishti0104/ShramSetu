/**
 * SessionStart Component
 * Allows contractors to create work sessions for attendance tracking
 */

import { useState } from 'react';
import './SessionStart.css';

const SessionStart = ({ contractorId, onSessionCreated }) => {
  const [formData, setFormData] = useState({
    jobId: '',
    location: '',
    shiftType: 'full_day',
    expectedWorkers: []
  });
  const [workerInput, setWorkerInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const shiftTypes = [
    { value: 'morning', label: 'सुबह की पाली / Morning Shift', time: '6 AM - 12 PM' },
    { value: 'afternoon', label: 'दोपहर की पाली / Afternoon Shift', time: '12 PM - 6 PM' },
    { value: 'evening', label: 'शाम की पाली / Evening Shift', time: '6 PM - 12 AM' },
    { value: 'night', label: 'रात की पाली / Night Shift', time: '12 AM - 6 AM' },
    { value: 'full_day', label: 'पूरे दिन / Full Day', time: '8 AM - 6 PM' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddWorker = () => {
    if (workerInput.trim()) {
      setFormData(prev => ({
        ...prev,
        expectedWorkers: [...prev.expectedWorkers, workerInput.trim()]
      }));
      setWorkerInput('');
    }
  };

  const handleRemoveWorker = (index) => {
    setFormData(prev => ({
      ...prev,
      expectedWorkers: prev.expectedWorkers.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // MOCK: API call to create session
      const response = await fetch('/api/v1/attendance/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contractorId,
          ...formData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const data = await response.json();
      
      // Reset form
      setFormData({
        jobId: '',
        location: '',
        shiftType: 'full_day',
        expectedWorkers: []
      });

      // Notify parent component
      if (onSessionCreated) {
        onSessionCreated(data.session);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="session-start">
      <div className="session-start-header">
        <h2>नया सत्र शुरू करें / Start New Session</h2>
        <p className="session-start-subtitle">
          उपस्थिति ट्रैकिंग के लिए कार्य सत्र बनाएं
        </p>
      </div>

      <form onSubmit={handleSubmit} className="session-start-form">
        {/* Job ID */}
        <div className="form-group">
          <label htmlFor="jobId">
            नौकरी आईडी / Job ID <span className="required">*</span>
          </label>
          <input
            type="text"
            id="jobId"
            name="jobId"
            value={formData.jobId}
            onChange={handleInputChange}
            required
            placeholder="job_123456"
            aria-required="true"
          />
        </div>

        {/* Location */}
        <div className="form-group">
          <label htmlFor="location">
            स्थान / Location <span className="required">*</span>
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
            placeholder="मुंबई, महाराष्ट्र / Mumbai, Maharashtra"
            aria-required="true"
          />
        </div>

        {/* Shift Type */}
        <div className="form-group">
          <label htmlFor="shiftType">
            पाली का प्रकार / Shift Type <span className="required">*</span>
          </label>
          <select
            id="shiftType"
            name="shiftType"
            value={formData.shiftType}
            onChange={handleInputChange}
            required
            aria-required="true"
          >
            {shiftTypes.map(shift => (
              <option key={shift.value} value={shift.value}>
                {shift.label} ({shift.time})
              </option>
            ))}
          </select>
        </div>

        {/* Expected Workers */}
        <div className="form-group">
          <label htmlFor="workerInput">
            अपेक्षित कर्मचारी / Expected Workers
          </label>
          <div className="worker-input-group">
            <input
              type="text"
              id="workerInput"
              value={workerInput}
              onChange={(e) => setWorkerInput(e.target.value)}
              placeholder="कर्मचारी आईडी दर्ज करें / Enter worker ID"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddWorker();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddWorker}
              className="btn-add-worker"
              aria-label="Add worker"
            >
              जोड़ें / Add
            </button>
          </div>

          {formData.expectedWorkers.length > 0 && (
            <div className="worker-list">
              {formData.expectedWorkers.map((workerId, index) => (
                <div key={index} className="worker-chip">
                  <span>{workerId}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveWorker(index)}
                    className="btn-remove-worker"
                    aria-label={`Remove ${workerId}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message" role="alert">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="btn-submit"
          disabled={loading}
        >
          {loading ? 'बना रहे हैं... / Creating...' : 'सत्र शुरू करें / Start Session'}
        </button>
      </form>
    </div>
  );
};

export default SessionStart;

