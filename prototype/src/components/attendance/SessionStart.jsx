/**
 * SessionStart Component
 * Allows contractors to create jobs and work sessions with voice input
 */

import { useState } from 'react';
import jobsAPI from '../../services/api/jobsAPI';
import VoiceFormField from '../voice/VoiceFormField';
import VoiceInput from '../voice/VoiceInput';
import './SessionStart.css';

const SessionStart = ({ contractorId, onSessionCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    city: '',
    state: '',
    wageRate: '',
    wageType: 'daily',
    duration: '',
    skillsRequired: [],
    workersNeeded: 1,
    startDate: '',
    status: 'open'
  });
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const wageTypes = [
    { value: 'daily', label: 'दैनिक / Daily' },
    { value: 'hourly', label: 'प्रति घंटा / Hourly' },
    { value: 'piece_rate', label: 'टुकड़ा दर / Piece Rate' },
    { value: 'contract', label: 'अनुबंध / Contract' }
  ];

  const getCurrentLocation = () => {
    setLoadingLocation(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use reverse geocoding to get address
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          if (data && data.address) {
            setFormData(prev => ({
              ...prev,
              location: data.display_name || '',
              city: data.address.city || data.address.town || data.address.village || '',
              state: data.address.state || ''
            }));
          }
        } catch (err) {
          console.error('Error getting address:', err);
          setError('Could not fetch address from location');
        } finally {
          setLoadingLocation(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        setError('Could not get your location. Please enable location access.');
        setLoadingLocation(false);
      }
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skillsRequired.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare job data
      const jobData = {
        contractorId,
        title: formData.title,
        description: formData.description,
        location: {
          address: formData.location,
          city: formData.city,
          state: formData.state
        },
        city: formData.city, // Add city at root level for GSI
        status: 'open', // Add status at root level for GSI
        wageRate: parseFloat(formData.wageRate),
        wageType: formData.wageType,
        duration: formData.duration,
        skillsRequired: formData.skillsRequired,
        workersNeeded: parseInt(formData.workersNeeded),
        startDate: formData.startDate
      };

      // Create job in DynamoDB
      const response = await jobsAPI.createJob(jobData);

      if (response.success) {
        setSuccess(`नौकरी सफलतापूर्वक बनाई गई! / Job created successfully! Job ID: ${response.job.jobId}`);
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          location: '',
          city: '',
          state: '',
          wageRate: '',
          wageType: 'daily',
          duration: '',
          skillsRequired: [],
          workersNeeded: 1,
          startDate: '',
          status: 'open'
        });

        // Notify parent component
        if (onSessionCreated) {
          onSessionCreated(response.job);
        }
      } else {
        throw new Error(response.message || 'Failed to create job');
      }

    } catch (err) {
      console.error('❌ Error creating job:', err);
      console.error('❌ Error name:', err.name);
      console.error('❌ Error message:', err.message);
      
      let errorMessage = 'नौकरी बनाने में विफल / Failed to create job';
      
      if (err.message.includes('fetch')) {
        errorMessage = '⚠️ सर्वर से कनेक्ट नहीं हो पा रहा / Cannot connect to server. Please make sure the jobs server is running on port 3003.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="session-start">
      <div className="session-start-header">
        <h2>नई नौकरी बनाएं / Create New Job</h2>
        <p className="session-start-subtitle">
          कर्मचारियों के लिए नौकरी पोस्ट करें / Post a job for workers
        </p>
      </div>

      <form onSubmit={handleSubmit} className="session-start-form">
        {/* Job Title */}
        <VoiceFormField
          label="नौकरी का शीर्षक / Job Title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="e.g., Construction Worker, Plumber, Electrician"
          required={true}
          language="hi-IN"
        />

        {/* Job Description */}
        <VoiceFormField
          label="नौकरी का विवरण / Job Description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Describe the job responsibilities and requirements..."
          required={true}
          type="textarea"
          rows={4}
          language="hi-IN"
        />

        {/* Location */}
        <div className="form-group">
          <label htmlFor="location">
            पता / Address <span className="required">*</span>
          </label>
          <div className="worker-input-group">
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              placeholder="Full work site address"
              aria-required="true"
            />
            <button
              type="button"
              onClick={getCurrentLocation}
              className="btn-add-worker"
              disabled={loadingLocation}
              aria-label="Get current location"
            >
              {loadingLocation ? '⏳' : '📍'} {loadingLocation ? 'Getting...' : 'Get Location'}
            </button>
            <div className="voice-input-inline">
              <VoiceInput
                onTranscription={(text) => {
                  setFormData(prev => ({ ...prev, location: text }));
                }}
                language="hi-IN"
                placeholder="Speak address"
              />
            </div>
          </div>
        </div>

        {/* City and State */}
        <div className="form-row">
          <VoiceFormField
            label="शहर / City"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            placeholder="Mumbai"
            required={true}
            language="hi-IN"
            className="form-group"
          />

          <VoiceFormField
            label="राज्य / State"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            placeholder="Maharashtra"
            required={true}
            language="hi-IN"
            className="form-group"
          />
        </div>

        {/* Wage Rate and Type */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="wageRate">
              वेतन दर / Wage Rate (₹) <span className="required">*</span>
            </label>
            <div className="wage-input-group">
              <input
                type="number"
                id="wageRate"
                name="wageRate"
                value={formData.wageRate}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                placeholder="500"
                aria-required="true"
              />
              <div className="voice-input-inline">
                <VoiceInput
                  onTranscription={(text) => {
                    // Extract numbers from voice input
                    const numbers = text.match(/\d+/g);
                    if (numbers && numbers.length > 0) {
                      setFormData(prev => ({ ...prev, wageRate: numbers[0] }));
                    }
                  }}
                  language="hi-IN"
                  placeholder="Speak wage amount"
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="wageType">
              वेतन प्रकार / Wage Type <span className="required">*</span>
            </label>
            <select
              id="wageType"
              name="wageType"
              value={formData.wageType}
              onChange={handleInputChange}
              required
              aria-required="true"
            >
              {wageTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Duration and Workers Needed */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="duration">
              अवधि / Duration <span className="required">*</span>
            </label>
            <input
              type="text"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              placeholder="e.g., 1 week, 2 months, 6 days"
              required
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label htmlFor="workersNeeded">
              आवश्यक कर्मचारी / Workers Needed <span className="required">*</span>
            </label>
            <div className="wage-input-group">
              <input
                type="number"
                id="workersNeeded"
                name="workersNeeded"
                value={formData.workersNeeded}
                onChange={handleInputChange}
                required
                min="1"
                placeholder="5"
                aria-required="true"
              />
              <div className="voice-input-inline">
                <VoiceInput
                  onTranscription={(text) => {
                    // Extract numbers from voice input
                    const numbers = text.match(/\d+/g);
                    if (numbers && numbers.length > 0) {
                      setFormData(prev => ({ ...prev, workersNeeded: numbers[0] }));
                    }
                  }}
                  language="hi-IN"
                  placeholder="Speak number of workers"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Start Date */}
        <div className="form-group">
          <label htmlFor="startDate">
            प्रारंभ तिथि / Start Date <span className="required">*</span>
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            required
            aria-required="true"
          />
        </div>

        {/* Skills Required */}
        <div className="form-group">
          <label htmlFor="skillInput">
            आवश्यक कौशल / Skills Required
          </label>
          <div className="worker-input-group">
            <input
              type="text"
              id="skillInput"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="e.g., Masonry, Plumbing, Electrical"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="btn-add-worker"
              aria-label="Add skill"
            >
              जोड़ें / Add
            </button>
            <div className="voice-input-inline">
              <VoiceInput
                onTranscription={(text) => {
                  setSkillInput(text);
                }}
                language="hi-IN"
                placeholder="Speak skill name"
              />
            </div>
          </div>

          {formData.skillsRequired.length > 0 && (
            <div className="worker-list">
              {formData.skillsRequired.map((skill, index) => (
                <div key={index} className="worker-chip">
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(index)}
                    className="btn-remove-worker"
                    aria-label={`Remove ${skill}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <div className="success-message" role="alert">
            <span className="success-icon">✅</span>
            {success}
          </div>
        )}

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
          {loading ? 'बना रहे हैं... / Creating...' : 'नौकरी बनाएं / Create Job'}
        </button>
      </form>
    </div>
  );
};

export default SessionStart;

