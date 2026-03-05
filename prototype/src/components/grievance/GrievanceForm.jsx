/**
 * Grievance Form Component
 * 
 * @fileoverview Voice-first grievance reporting with AWS Transcribe and admin management
 */

import { useState, useRef, useEffect } from 'react';
import './GrievanceForm.css';
import { submitGrievance, getGrievances, deleteGrievance as deleteGrievanceAPI } from '../../utils/grievanceApi';
import transcribeService from '../../services/aws/transcribeService';

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
    preferredLanguage: 'hi-IN'
  });
  
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [submittedGrievance, setSubmittedGrievance] = useState(null);
  const [grievanceHistory, setGrievanceHistory] = useState([]);
  const [recordingError, setRecordingError] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminGrievances, setAdminGrievances] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [transcriptionResult, setTranscriptionResult] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Check for media recorder support
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setRecordingError('Your browser does not support audio recording');
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const startRecording = async () => {
    try {
      setRecordingError(null);
      setTranscriptionResult('');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        
        // Start transcription process
        await transcribeAudio(audioBlob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
    } catch (err) {
      console.error('Failed to start recording:', err);
      setRecordingError('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob) => {
    try {
      setIsTranscribing(true);
      setRecordingError(null);
      
      console.log('🎤 Starting AWS Transcribe...');
      
      // Use the transcribe service
      const result = await transcribeService.transcribeAudio(
        audioBlob, 
        formData.preferredLanguage, 
        `USER_${Date.now()}`
      );
      
      if (result.success && result.text) {
        const transcribedText = result.text;
        setTranscriptionResult(transcribedText);
        
        // Add transcribed text to description
        setFormData(prev => ({
          ...prev,
          description: prev.description + (prev.description ? ' ' : '') + transcribedText
        }));
        
        console.log('✅ Transcription successful:', transcribedText);
      } else {
        throw new Error('No transcription received from AWS Transcribe');
      }
      
    } catch (error) {
      console.error('❌ AWS Transcribe error:', error);
      setRecordingError(`AWS Transcribe failed: ${error.message}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  const clearDescription = () => {
    setFormData(prev => ({ ...prev, description: '' }));
    setTranscriptionResult('');
    setRecordedAudio(null);
  };

  const loadAdminGrievances = async () => {
    try {
      setAdminLoading(true);
      const result = await getGrievances({ limit: 10 });
      setAdminGrievances(result.grievances || []);
    } catch (err) {
      console.error('Error loading grievances:', err);
    } finally {
      setAdminLoading(false);
    }
  };

  const deleteGrievance = async (grievanceId, submittedAt) => {
    if (!confirm('Are you sure you want to delete this grievance?')) {
      return;
    }
    
    try {
      await deleteGrievanceAPI(grievanceId, submittedAt);
      // Remove from local state after successful deletion
      setAdminGrievances(prev => 
        prev.filter(g => g.grievanceId !== grievanceId)
      );
    } catch (err) {
      console.error('Error deleting grievance:', err);
      alert('Failed to delete grievance: ' + err.message);
    }
  };

  useEffect(() => {
    if (showAdmin) {
      loadAdminGrievances();
    }
  }, [showAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category || !formData.severity || !formData.description) {
      alert('कृपया सभी आवश्यक फ़ील्ड भरें / Please fill in all required fields');
      return;
    }

    setIsProcessing(true);

    try {
      // Submit grievance to production DynamoDB
      const grievanceData = {
        ...formData,
        workerId: formData.isAnonymous ? undefined : `USER_${Date.now()}`,
        hasAudio: false, // We're using text-based input now
        source: 'voice_to_text_web'
      };

      const result = await submitGrievance(grievanceData);
      
      if (result.success) {
        const submittedData = {
          ...result.grievance,
          category: formData.category,
          severity: formData.severity,
          description: formData.description,
          location: formData.location,
          contractorName: formData.contractorName,
          isAnonymous: formData.isAnonymous,
          contactNumber: formData.contactNumber
        };
        
        setSubmittedGrievance(submittedData);
        setGrievanceHistory([submittedData, ...grievanceHistory]);

        // Reset form
        setFormData({
          category: '',
          severity: '',
          description: '',
          location: '',
          contractorName: '',
          isAnonymous: false,
          contactNumber: '',
          preferredLanguage: 'hi-IN'
        });
      }
      
    } catch (error) {
      console.error('Submission error:', error);
      alert(`शिकायत जमा करने में विफल / Failed to submit grievance: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setSubmittedGrievance(null);
    setRecordingError(null);
    setTranscriptionResult('');
    setRecordedAudio(null);
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
        <h2>🛡️ शिकायत दर्ज करें / Submit Grievance</h2>
        <div className="header-controls">
          <button 
            onClick={() => setShowAdmin(!showAdmin)}
            className="admin-toggle-btn"
          >
            🔧 {showAdmin ? 'Hide Admin' : 'Admin Panel'}
          </button>
        </div>
      </div>

      <div className="grievance-layout">
        {/* Main Voice Input Section - Takes 70% space */}
        <div className="voice-main-section">
          {!submittedGrievance ? (
            <>
              {/* Large Voice Input Area */}
              <div className="voice-input-area">
                <h3>🎤 आवाज़ से बताएं / Speak Your Grievance</h3>
                
                {/* Language Selection */}
                <div className="language-selector">
                  <label htmlFor="preferredLanguage">भाषा चुनें / Select Language:</label>
                  <select
                    id="preferredLanguage"
                    name="preferredLanguage"
                    value={formData.preferredLanguage}
                    onChange={handleInputChange}
                    className="language-select"
                  >
                    <option value="hi-IN">🇮🇳 हिंदी / Hindi</option>
                    <option value="en-US">🇺🇸 English</option>
                    <option value="bn-IN">🇧🇩 বাংলা / Bengali</option>
                    <option value="te-IN">🇮🇳 తెలుగు / Telugu</option>
                    <option value="ta-IN">🇮🇳 தமிழ் / Tamil</option>
                    <option value="mr-IN">🇮🇳 मराठी / Marathi</option>
                    <option value="gu-IN">🇮🇳 ગુજરાતી / Gujarati</option>
                    <option value="kn-IN">🇮🇳 ಕನ್ನಡ / Kannada</option>
                    <option value="ml-IN">🇮🇳 മലയാളം / Malayalam</option>
                    <option value="pa-IN">🇮🇳 ਪੰਜਾਬੀ / Punjabi</option>
                  </select>
                </div>

                {/* Voice Controls */}
                <div className="voice-controls-large">
                  {!recordingError ? (
                    <>
                      {!isRecording ? (
                        <button
                          type="button"
                          onClick={startRecording}
                          className="voice-btn-large"
                          disabled={isProcessing || isTranscribing}
                        >
                          <span className="voice-icon-large">🎤</span>
                          <span className="voice-text">
                            बोलना शुरू करें<br/>
                            <small>Start Speaking</small>
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="voice-btn-large voice-btn-listening"
                        >
                          <span className="voice-icon-large">⏹️</span>
                          <span className="voice-text">
                            रुकें<br/>
                            <small>Stop Recording</small>
                          </span>
                        </button>
                      )}
                      
                      {formData.description && (
                        <button
                          type="button"
                          onClick={clearDescription}
                          className="clear-btn-large"
                        >
                          🗑️ साफ़ करें / Clear
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="voice-unsupported-large">
                      <p>⚠️ आपका ब्राउज़र वॉइस इनपुट का समर्थन नहीं करता</p>
                      <p>Your browser doesn't support voice input</p>
                    </div>
                  )}
                </div>

                {recordingError && (
                  <div className="voice-error-large">
                    <span className="error-icon">⚠️</span>
                    {recordingError}
                  </div>
                )}
                
                {isRecording && (
                  <div className="listening-indicator-large">
                    <div className="listening-animation-large">🎤</div>
                    <p>रिकॉर्ड हो रहा है... / Recording...</p>
                  </div>
                )}

                {isTranscribing && (
                  <div className="transcribing-indicator-large">
                    <div className="transcribing-animation-large">🔄</div>
                    <p>AWS Transcribe से टेक्स्ट में बदला जा रहा है... / Converting to text with AWS Transcribe...</p>
                  </div>
                )}

                {transcriptionResult && (
                  <div className="transcription-result-large">
                    <h4>🎯 नवीनतम ट्रांसक्रिप्शन / Latest Transcription:</h4>
                    <p>"{transcriptionResult}"</p>
                  </div>
                )}

                {/* Large Text Display Area */}
                <div className="text-display-area">
                  <label>आपकी शिकायत / Your Grievance:</label>
                  <textarea
                    value={formData.description}
                    onChange={handleInputChange}
                    name="description"
                    rows="8"
                    placeholder="यहाँ आपकी आवाज़ से टेक्स्ट दिखेगा... / Your speech will appear here..."
                    className="description-textarea-large"
                  />
                </div>
              </div>

              {/* Quick Form Section */}
              <form onSubmit={handleSubmit} className="quick-form">
                <div className="form-row">
                  <div className="form-field">
                    <label>श्रेणी / Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-field">
                    <label>गंभीरता / Severity *</label>
                    <select
                      name="severity"
                      value={formData.severity}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Severity</option>
                      {SEVERITY_LEVELS.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label>स्थान / Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Work site location"
                    />
                  </div>
                  
                  <div className="form-field">
                    <label>संपर्क / Contact</label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      placeholder="Phone number"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || isRecording || isTranscribing || !formData.description || !formData.category || !formData.severity}
                  className="submit-btn-large"
                >
                  {isProcessing ? 'जमा हो रहा है... / Submitting...' : 'शिकायत जमा करें / Submit Grievance'}
                </button>
              </form>
            </>
          ) : (
            <div className="success-display-large">
              <div className="success-icon-large">✅</div>
              <h3>शिकायत सफलतापूर्वक जमा हुई!</h3>
              <h4>Grievance Submitted Successfully!</h4>
              
              <div className="tracking-info-large">
                <p><strong>Tracking Number:</strong> {submittedGrievance.trackingNumber}</p>
                <p><strong>Priority:</strong> {submittedGrievance.priority}</p>
                <p><strong>Response Time:</strong> {submittedGrievance.expectedResponseTime}</p>
              </div>

              <button
                onClick={resetForm}
                className="new-grievance-btn"
              >
                नई शिकायत / New Grievance
              </button>
            </div>
          )}
        </div>

        {/* Admin Panel - Takes 30% space when visible */}
        {showAdmin && (
          <div className="admin-panel">
            <div className="admin-header">
              <h4>🔧 Admin Panel</h4>
              <button onClick={loadAdminGrievances} className="refresh-btn-small">
                🔄 Refresh
              </button>
            </div>

            {adminLoading ? (
              <div className="admin-loading">Loading...</div>
            ) : (
              <div className="admin-grievances">
                {adminGrievances.map((grievance) => (
                  <div key={grievance.grievanceId} className="admin-grievance-card">
                    <div className="admin-card-header">
                      <span className="grievance-id-small">{grievance.grievanceId.split('_')[1]}</span>
                      <button
                        onClick={() => deleteGrievance(grievance.grievanceId, grievance.submittedAt)}
                        className="delete-btn-small"
                        title="Delete Grievance"
                      >
                        🗑️
                      </button>
                    </div>
                    
                    <div className="admin-card-content">
                      <p className="description-preview">
                        {grievance.description.substring(0, 100)}...
                      </p>
                      <div className="admin-card-meta">
                        <span className={`priority-badge-small priority-${grievance.priority.toLowerCase()}`}>
                          {grievance.priority}
                        </span>
                        <span className="category-small">{grievance.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

