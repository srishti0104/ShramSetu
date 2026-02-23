import { useState, useEffect } from 'react'
import './App.css'

// Import onboarding flow
import OnboardingFlow from './components/onboarding/OnboardingFlow'

// Import the components we actually created
import SessionStart from './components/attendance/SessionStart'
import TOTPDisplay from './components/attendance/TOTPDisplay'
import TOTPInput from './components/attendance/TOTPInput'
import AttendanceLog from './components/attendance/AttendanceLog'
import RatingForm from './components/ratings/RatingForm'
import VoiceRecorder from './components/voice/VoiceRecorder'
import JobSearch from './components/jobs/JobSearch'
import EKhataLedger from './components/ledger/EKhataLedger'
import PayslipAuditor from './components/payslip/PayslipAuditor'
import GrievanceForm from './components/grievance/GrievanceForm'
import OfflineSync from './components/sync/OfflineSync'
import PollyDemo from './components/demo/PollyDemo'
import AuthDemo from './components/demo/AuthDemo'
import AWSCredentialsCheck from './components/demo/AWSCredentialsCheck'
import SyncStatus from './components/common/SyncStatus'
import AIAssistant from './components/ai/AIAssistant'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [sessionId, setSessionId] = useState(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isOnboarded, setIsOnboarded] = useState(false)

  // Check if user has completed onboarding
  useEffect(() => {
    const onboardingComplete = localStorage.getItem('onboarding_complete')
    if (onboardingComplete === 'true') {
      setIsOnboarded(true)
    }
  }, [])

  const handleSessionCreated = (session) => {
    setSessionId(session.sessionId)
    setActiveTab('totp-display')
  }

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarding_complete', 'true')
    setIsOnboarded(true)
    setShowOnboarding(false)
  }

  const handleStartOnboarding = () => {
    // Clear previous onboarding data
    localStorage.removeItem('onboarding_complete')
    localStorage.removeItem('onboarding_progress')
    setShowOnboarding(true)
  }

  // Show onboarding flow if user hasn't completed it or explicitly requested
  if (showOnboarding || !isOnboarded) {
    return (
      <div className="app">
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>श्रम सेतु / Shram-Setu</h1>
        <p className="tagline">Voice-First Platform for Blue-Collar Workers</p>
        <button 
          className="restart-onboarding-btn"
          onClick={handleStartOnboarding}
          title="Restart Onboarding"
        >
          🔄 Restart Onboarding
        </button>
      </header>

      <nav className="app-nav">
        <button 
          className={activeTab === 'home' ? 'active' : ''} 
          onClick={() => setActiveTab('home')}
        >
          🏠 Home
        </button>
        <button 
          className={activeTab === 'polly-demo' ? 'active' : ''} 
          onClick={() => setActiveTab('polly-demo')}
        >
          🎤 AWS Polly Demo
        </button>
        <button 
          className={activeTab === 'auth-demo' ? 'active' : ''} 
          onClick={() => setActiveTab('auth-demo')}
        >
          🔐 Auth Demo
        </button>
        <button 
          className={activeTab === 'voice' ? 'active' : ''} 
          onClick={() => setActiveTab('voice')}
        >
          🎙️ Voice Interface
        </button>
        <button 
          className={activeTab === 'jobs' ? 'active' : ''} 
          onClick={() => setActiveTab('jobs')}
        >
          📍 Job Search
        </button>
        <button 
          className={activeTab === 'ledger' ? 'active' : ''} 
          onClick={() => setActiveTab('ledger')}
        >
          💰 E-Khata
        </button>
        <button 
          className={activeTab === 'payslip' ? 'active' : ''} 
          onClick={() => setActiveTab('payslip')}
        >
          📄 Payslip
        </button>
        <button 
          className={activeTab === 'grievance' ? 'active' : ''} 
          onClick={() => setActiveTab('grievance')}
        >
          🛡️ Grievance
        </button>
        <button 
          className={activeTab === 'sync' ? 'active' : ''} 
          onClick={() => setActiveTab('sync')}
        >
          📱 Sync
        </button>
        <button 
          className={activeTab === 'ai-assistant' ? 'active' : ''} 
          onClick={() => setActiveTab('ai-assistant')}
        >
          🤖 AI Assistant
        </button>
        <button 
          className={activeTab === 'session-start' ? 'active' : ''} 
          onClick={() => setActiveTab('session-start')}
        >
          📋 Create Session
        </button>
        <button 
          className={activeTab === 'totp-display' ? 'active' : ''} 
          onClick={() => setActiveTab('totp-display')}
          disabled={!sessionId}
        >
          🔢 TOTP Display
        </button>
        <button 
          className={activeTab === 'totp-input' ? 'active' : ''} 
          onClick={() => setActiveTab('totp-input')}
          disabled={!sessionId}
        >
          ✅ Mark Attendance
        </button>
        <button 
          className={activeTab === 'attendance-log' ? 'active' : ''} 
          onClick={() => setActiveTab('attendance-log')}
        >
          📊 Attendance Log
        </button>
        <button 
          className={activeTab === 'rating' ? 'active' : ''} 
          onClick={() => setActiveTab('rating')}
        >
          ⭐ Submit Rating
        </button>
      </nav>

      <main className="app-content">
        {activeTab === 'polly-demo' && (
          <PollyDemo />
        )}

        {activeTab === 'auth-demo' && (
          <AuthDemo />
        )}

        {activeTab === 'voice' && (
          <VoiceRecorder />
        )}

        {activeTab === 'jobs' && (
          <JobSearch />
        )}

        {activeTab === 'ledger' && (
          <EKhataLedger />
        )}

        {activeTab === 'payslip' && (
          <PayslipAuditor />
        )}

        {activeTab === 'grievance' && (
          <GrievanceForm />
        )}

        {activeTab === 'sync' && (
          <OfflineSync />
        )}

        {activeTab === 'ai-assistant' && (
          <AIAssistant />
        )}

        {activeTab === 'home' && (
          <div className="home-section">
            <h2>Welcome to Shram-Setu</h2>
            <p>A voice-first Progressive Web Application empowering India's blue-collar workforce.</p>
            
            <div className="features-grid">
              <div className="feature-card clickable" onClick={() => setActiveTab('voice')}>
                <div className="feature-icon">🎤</div>
                <h3>Voice-First Interface</h3>
                <p>Multi-language voice commands (Hindi + regional languages)</p>
                <div className="try-now">Try Now →</div>
              </div>
              
              <div className="feature-card clickable" onClick={() => setActiveTab('jobs')}>
                <div className="feature-icon">📍</div>
                <h3>Job Marketplace</h3>
                <p>Geospatial job matching within city boundaries</p>
                <div className="try-now">Try Now →</div>
              </div>
              
              <div className="feature-card clickable" onClick={() => setActiveTab('ledger')}>
                <div className="feature-icon">💰</div>
                <h3>E-Khata Ledger</h3>
                <p>Digital wage tracking with compliance checking</p>
                <div className="try-now">Try Now →</div>
              </div>
              
              <div className="feature-card clickable" onClick={() => setActiveTab('session-start')}>
                <div className="feature-icon">🔢</div>
                <h3>TOTP Attendance</h3>
                <p>Secure attendance verification with cryptographic audit trails</p>
                <div className="try-now">Try Now →</div>
              </div>
              
              <div className="feature-card clickable" onClick={() => setActiveTab('payslip')}>
                <div className="feature-icon">📄</div>
                <h3>Payslip Auditor</h3>
                <p>OCR-powered payslip processing with Minimum Wage Act validation</p>
                <div className="try-now">Try Now →</div>
              </div>
              
              <div className="feature-card clickable" onClick={() => setActiveTab('grievance')}>
                <div className="feature-icon">🛡️</div>
                <h3>Suraksha Grievance</h3>
                <p>Voice-based safety reporting with AI-powered triage</p>
                <div className="try-now">Try Now →</div>
              </div>
              
              <div className="feature-card clickable" onClick={() => setActiveTab('rating')}>
                <div className="feature-icon">⭐</div>
                <h3>Trust Tier System</h3>
                <p>Dual rating system with tier-based prioritization</p>
                <div className="try-now">Try Now →</div>
              </div>
              
              <div className="feature-card clickable" onClick={() => setActiveTab('sync')}>
                <div className="feature-icon">📱</div>
                <h3>Offline-First</h3>
                <p>Works without internet with automatic sync</p>
                <div className="try-now">Try Now →</div>
              </div>
            </div>

            <div className="demo-notice">
              <h3>📌 All Features Now Available!</h3>
              <p>Click any feature card above or use the navigation to explore:</p>
              <ul>
                <li><strong>Voice Interface</strong> - Multi-language voice commands with mock AI</li>
                <li><strong>Job Marketplace</strong> - Search and apply for jobs with filters</li>
                <li><strong>E-Khata Ledger</strong> - View wage history and transaction details</li>
                <li><strong>Payslip Auditor</strong> - Upload payslips for OCR and compliance check</li>
                <li><strong>Suraksha Grievance</strong> - Report workplace safety issues</li>
                <li><strong>Offline Sync</strong> - Manage offline data and synchronization</li>
                <li><strong>TOTP Attendance</strong> - Complete attendance verification system</li>
                <li><strong>Trust Tier System</strong> - Rate workers or contractors</li>
              </ul>
              <p className="note">⚠️ Note: All features work locally with mock data. Ready to connect to AWS when you are!</p>
            </div>
          </div>
        )}

        {activeTab === 'session-start' && (
          <SessionStart 
            contractorId="contractor_demo_123"
            onSessionCreated={handleSessionCreated}
          />
        )}

        {activeTab === 'totp-display' && sessionId && (
          <TOTPDisplay 
            sessionId={sessionId}
            contractorId="contractor_demo_123"
          />
        )}

        {activeTab === 'totp-input' && sessionId && (
          <TOTPInput 
            sessionId={sessionId}
            workerId="worker_demo_456"
            onSuccess={(attendance) => {
              console.log('Attendance marked:', attendance)
              setActiveTab('attendance-log')
            }}
          />
        )}

        {activeTab === 'attendance-log' && (
          <AttendanceLog 
            sessionId={sessionId}
            workerId="worker_demo_456"
          />
        )}

        {activeTab === 'rating' && (
          <RatingForm 
            jobId="job_demo_789"
            raterId="worker_demo_456"
            rateeId="contractor_demo_123"
            raterType="worker"
            rateeName="Demo Contractor"
            onSuccess={(data) => {
              console.log('Rating submitted:', data)
              alert('Rating submitted successfully!')
            }}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>© 2024 Shram-Setu | Empowering India's Blue-Collar Workforce</p>
        <p className="tech-stack">Built with React + Vite | AWS Lambda | DynamoDB | PostgreSQL</p>
      </footer>

      {/* AWS Credentials Diagnostic */}
      <AWSCredentialsCheck />
      
      {/* Delta Sync Status */}
      <SyncStatus />
    </div>
  )
}

export default App

