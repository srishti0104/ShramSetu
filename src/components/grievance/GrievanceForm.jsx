/**
 * Grievance Form Component
 * 
 * @fileoverview Voice-based safety reporting with AI-powered triage
 */

import { useState, useRef } from 'react';
import './GrievanceForm.css';

// Grievance categories
const CATEGORIES = [
  { value: 'safety', label: '🛡️ Safety Violation', description: 'Unsafe working conditions, missing safety equipment' },
  { value: 'wage', label: '💰 Wage Dispute', description: 'Payment delays, incorrect wages, deductions' },
  { value: 'harassment', label: '⚠️ Harassment', description: 'Verbal abuse, discrimination, unfair treatment' },
  { value: 'working_conditions', label: '🏗️ Working Conditions', description: 'Poor facilities, excessive hours, no breaks' },
  { value: 'contract', label: '📄 Contract Issues', description: 'Contract violations, false promises' },
  { value: 'other', label: '📝 Other', description: 'Any other workplace issue' }
];

// Severity levels
const SEVERITY_LEVELS = [
  { value: 'low', label: 'Low', color: '#4caf50', description: 'Minor issue, can wait' },
  { value: 'medium', label: 'Medium', color: '#ff9800', description: 'Needs attention soon' },
  { value: 'high', label: 'High', color: '#f44336', description: 'Urgent, needs immediate action' },
  { value: 'critical', label: 'Critical', color: '#d32f2f', description: 'Emergency, safety at risk' }
];

/**
 * Grievance Form Component
 */
export default function GrievanceForm() {
  const [formData, setFormData] = useState({
    category: '',
    severity: '',
    description: '',
    location: '',
    contractorName: '',
    isAnonymous: false,
    contactNumber: '',
    preferredLanguage: 'hi'
  });
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [submittedGrievance, setSubmittedGrievance] = useState(null);
  const [grievanceHistory, setGrievanceHistory] = useState([]);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        
        // Mock: Auto-fill description from voice
        const mockDescriptions = [
          'मुझे सुरक्षा उपकरण नहीं दिए गए हैं। काम करते समय खतरा है।',
          'मेरा वेतन 15 दिन से लंबित है। ठेकेदार जवाब नहीं दे रहा है।',
          'काम की जगह पर गंदगी है और पीने का साफ पानी नहीं है।'
        ];
        const mockDescription = mockDescriptions[Math.floor(Math.random() * mockDescriptions.length)];
        setFormData(prev => ({ ...prev, description: mockDescription }));
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      alert('Failed to access microphone. Please check permissions.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category || !formData.severity || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);

    // Simulate AI processing and triage
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock: AI-powered sentiment analysis and auto-categorization
    const sentiment = Math.random() > 0.5 ? 'negative' : 'very_negative';
    const urgencyScore = formData.severity === 'critical' ? 95 : 
                        formData.severity === 'high' ? 75 :
                        formData.severity === 'medium' ? 50 : 25;
    
    const grievance = {
      id: `GRV${Date.now()}`,
      ...formData,
      submittedAt: new Date().toISOString(),
      status: 'submitted',
      sentiment,
      urgencyScore,
      assignedTo: urgencyScore > 70 ? 'NGO Legal Aid' : 'Support Team',
      estimatedResponse: urgencyScore > 70 ? '24 hours' : '3-5 days',
      trackingNumber: `TRACK${Math.floor(Math.random() * 1000000)}`
    };

    setSubmittedGrievance(grievance);
    setGrievanceHistory([grievance, ...grievanceHistory]);
    setIsProcessing(false);

    // Reset form
    setFormData({
      category: '',
      severity: '',
      description: '',
      location: '',
      contractorName: '',
      isAnonymous: false,
      contactNumber: '',
      preferredLanguage: 'hi'
    });
    setRecordedAudio(null);
  };

  const resetForm = () => {
    setSubmittedGrievance(null);
  };

  const getCategoryIcon = (category) => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat ? cat.label.split(' ')[0] : '📝';
  };

  const getSeverityColor = (severity) => {
    const sev = SEVERITY_LEVELS.find(s => s.value === severity);
    return sev ? sev.color : '#999';
  };

  return (
    <div className="grievance-form">
      <div className="grievance-form__header">
        <h2>🛡️ Suraksha Grievance Module</h2>
        <p>Report workplace safety issues and violations</p>
      </div>

      {!submittedGrievance ? (
        <form onSubmit={handleSubmit} className="grievance-form__form">
          {/* Voice Recording */}
          <div className="grievance-form__voice-section">
            <h3>🎤 Voice Report (Optional)</h3>
            <p>Describe your issue in your own language</p>
            
            {!isRecording ? (
              <button
                type="button"
                onClick={startVoiceRecording}
                className="grievance-form__voice-btn"
              >
                <span className="grievance-form__voice-icon">🎤</span>
                Start Voice Recording
              </button>
            ) : (
              <button
                type="button"
                onClick={stopVoiceRecording}
                className="grievance-form__voice-btn grievance-form__voice-btn--recording"
              >
                <span className="grievance-form__voice-icon">⏹️</span>
                Stop Recording
              </button>
            )}
            
            {recordedAudio && (
              <div className="grievance-form__audio-preview">
                ✓ Voice recording captured ({(recordedAudio.size / 1024).toFixed(2)} KB)
              </div>
            )}
          </div>

          {/* Category Selection */}
          <div className="grievance-form__field">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="grievance-form__select"
            >
              <option value="">Select a category</option>
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label} - {cat.description}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Level */}
          <div className="grievance-form__field">
            <label>Severity Level *</label>
            <div className="grievance-form__severity-grid">
              {SEVERITY_LEVELS.map(level => (
                <label
                  key={level.value}
                  className={`severity-option ${formData.severity === level.value ? 'severity-option--selected' : ''}`}
                  style={{ borderColor: formData.severity === level.value ? level.color : '#e0e0e0' }}
                >
                  <input
                    type="radio"
                    name="severity"
                    value={level.value}
                    checked={formData.severity === level.value}
                    onChange={handleInputChange}
                    required
                  />
                  <div className="severity-option__label" style={{ color: level.color }}>
                    {level.label}
                  </div>
                  <div className="severity-option__description">
                    {level.description}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="grievance-form__field">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows="5"
              placeholder="Describe the issue in detail..."
              className="grievance-form__textarea"
            />
          </div>

          {/* Location */}
          <div className="grievance-form__field">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Work site location"
              className="grievance-form__input"
            />
          </div>

          {/* Contractor Name */}
          <div className="grievance-form__field">
            <label htmlFor="contractorName">Contractor/Employer Name</label>
            <input
              type="text"
              id="contractorName"
              name="contractorName"
              value={formData.contractorName}
              onChange={handleInputChange}
              placeholder="Name of contractor or employer"
              className="grievance-form__input"
            />
          </div>

          {/* Anonymous Checkbox */}
          <div className="grievance-form__field">
            <label className="grievance-form__checkbox-label">
              <input
                type="checkbox"
                name="isAnonymous"
                checked={formData.isAnonymous}
                onChange={handleInputChange}
              />
              <span>Submit anonymously (your identity will be protected)</span>
            </label>
          </div>

          {/* Contact Number (if not anonymous) */}
          {!formData.isAnonymous && (
            <div className="grievance-form__field">
              <label htmlFor="contactNumber">Contact Number</label>
              <input
                type="tel"
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                placeholder="Your phone number for follow-up"
                className="grievance-form__input"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="grievance-form__submit-btn"
          >
            {isProcessing ? 'Processing...' : 'Submit Grievance'}
          </button>
        </form>
      ) : (
        <div className="grievance-form__success">
          <div className="grievance-form__success-icon">✓</div>
          <h3>Grievance Submitted Successfully</h3>
          
          <div className="grievance-form__tracking">
            <div className="grievance-form__tracking-number">
              Tracking Number: <strong>{submittedGrievance.trackingNumber}</strong>
            </div>
            <p>Save this number to track your grievance status</p>
          </div>

          <div className="grievance-form__details">
            <div className="detail-row">
              <span className="detail-label">Grievance ID:</span>
              <span className="detail-value">{submittedGrievance.id}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Category:</span>
              <span className="detail-value">
                {getCategoryIcon(submittedGrievance.category)} {submittedGrievance.category}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Severity:</span>
              <span className="detail-value" style={{ color: getSeverityColor(submittedGrievance.severity) }}>
                {submittedGrievance.severity.toUpperCase()}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Urgency Score:</span>
              <span className="detail-value">{submittedGrievance.urgencyScore}/100</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Assigned To:</span>
              <span className="detail-value">{submittedGrievance.assignedTo}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Expected Response:</span>
              <span className="detail-value">{submittedGrievance.estimatedResponse}</span>
            </div>
          </div>

          <div className="grievance-form__next-steps">
            <h4>What Happens Next?</h4>
            <ul>
              <li>Your grievance has been logged and assigned to {submittedGrievance.assignedTo}</li>
              <li>You will receive updates via SMS/WhatsApp</li>
              <li>Expected response time: {submittedGrievance.estimatedResponse}</li>
              {submittedGrievance.urgencyScore > 70 && (
                <li className="urgent-note">⚠️ High priority - NGO has been notified for immediate action</li>
              )}
            </ul>
          </div>

          <button
            onClick={resetForm}
            className="grievance-form__new-btn"
          >
            Submit Another Grievance
          </button>
        </div>
      )}

      {/* Grievance History */}
      {grievanceHistory.length > 0 && (
        <div className="grievance-form__history">
          <h3>📋 Your Recent Grievances</h3>
          <div className="history-list">
            {grievanceHistory.slice(0, 5).map(grievance => (
              <div key={grievance.id} className="history-item">
                <div className="history-item__icon">
                  {getCategoryIcon(grievance.category)}
                </div>
                <div className="history-item__content">
                  <div className="history-item__id">{grievance.id}</div>
                  <div className="history-item__category">{grievance.category}</div>
                  <div className="history-item__date">
                    {new Date(grievance.submittedAt).toLocaleString()}
                  </div>
                </div>
                <div 
                  className="history-item__severity"
                  style={{ backgroundColor: getSeverityColor(grievance.severity) }}
                >
                  {grievance.severity}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Demo Notice */}
      <div className="grievance-form__demo-notice">
        <p>💡 <strong>Demo Mode:</strong> This is a mock grievance system. In production, it will use Amazon Comprehend for sentiment analysis, auto-escalate to NGOs, and integrate with legal aid organizations.</p>
      </div>
    </div>
  );
}
