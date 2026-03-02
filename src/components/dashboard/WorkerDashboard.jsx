/**
 * Worker Dashboard Component
 * 
 * @fileoverview Dashboard interface for Worker users with role-specific features
 */

import { useState, useEffect } from 'react';
import './WorkerDashboard.css';

// Import feature components
import VoiceRecorder from '../voice/VoiceRecorder';
import JobSearch from '../jobs/JobSearch';
import TOTPInput from '../attendance/TOTPInput';
import AttendanceLog from '../attendance/AttendanceLog';
import EKhataLedger from '../ledger/EKhataLedger';
import PayslipAuditor from '../payslip/PayslipAuditor';
import GrievanceForm from '../grievance/GrievanceForm';
import RatingForm from '../ratings/RatingForm';
import OfflineSync from '../sync/OfflineSync';
import AIAssistant from '../ai/AIAssistant';
import SyncStatus from '../common/SyncStatus';

// Worker-specific navigation tabs
const WORKER_TABS = [
  { id: 'home', label: '🏠 Home', icon: '🏠' },
  { id: 'voice', label: '🎤 Voice', icon: '🎤' },
  { id: 'jobs', label: '📍 Jobs', icon: '📍' },
  { id: 'attendance', label: '✅ Attendance', icon: '✅' },
  { id: 'attendance-log', label: '📊 Log', icon: '📊' },
  { id: 'ledger', label: '💰 E-Khata', icon: '💰' },
  { id: 'payslip', label: '📄 Payslip', icon: '📄' },
  { id: 'grievance', label: '🛡️ Grievance', icon: '🛡️' },
  { id: 'rating', label: '⭐ Rating', icon: '⭐' },
  { id: 'sync', label: '📱 Sync', icon: '📱' },
  { id: 'ai-assistant', label: '🤖 AI', icon: '🤖' }
];

/**
 * Worker Dashboard Component
 * @param {Object} props
 * @param {Function} props.onRestartOnboarding - Callback to restart onboarding
 */
export default function WorkerDashboard({ onRestartOnboarding }) {
  const [activeTab, setActiveTab] = useState('home');
  const [sessionId, setSessionId] = useState(null);

  // Load saved tab from sessionStorage on mount
  useEffect(() => {
    const savedTab = sessionStorage.getItem('active_tab');
    if (savedTab && WORKER_TABS.some(tab => tab.id === savedTab)) {
      setActiveTab(savedTab);
    }
  }, []);

  // Save active tab to sessionStorage when it changes
  useEffect(() => {
    sessionStorage.setItem('active_tab', activeTab);
  }, [activeTab]);

  /**
   * Handle tab change
   */
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  /**
   * Render active tab content
   */
  const renderContent = () => {
    switch (activeTab) {
      case 'voice':
        return <VoiceRecorder />;
      
      case 'jobs':
        return <JobSearch userRole="worker" />;
      
      case 'attendance':
        return (
          <TOTPInput
            sessionId={sessionId || 'demo_session'}
            workerId="worker_demo_456"
            onSuccess={(attendance) => {
              console.log('Attendance marked:', attendance);
              setActiveTab('attendance-log');
            }}
          />
        );
      
      case 'attendance-log':
        return (
          <AttendanceLog
            sessionId={sessionId}
            workerId="worker_demo_456"
          />
        );
      
      case 'ledger':
        return <EKhataLedger userRole="worker" />;
      
      case 'payslip':
        return <PayslipAuditor />;
      
      case 'grievance':
        return <GrievanceForm />;
      
      case 'rating':
        return (
          <RatingForm
            jobId="job_demo_789"
            raterId="worker_demo_456"
            rateeId="employer_demo_123"
            raterType="worker"
            rateeName="Demo Employer"
            onSuccess={(data) => {
              console.log('Rating submitted:', data);
              alert('Rating submitted successfully!');
            }}
          />
        );
      
      case 'sync':
        return <OfflineSync />;
      
      case 'ai-assistant':
        return <AIAssistant />;
      
      case 'home':
      default:
        return <WorkerHome onTabChange={handleTabChange} />;
    }
  };

  return (
    <div className="worker-dashboard">
      <header className="worker-dashboard__header">
        <h1>श्रमिक सेतु / Worker Dashboard</h1>
        <p className="worker-dashboard__tagline">Find Jobs, Track Wages, Mark Attendance</p>
        <button
          className="worker-dashboard__restart-btn"
          onClick={onRestartOnboarding}
          title="Restart Onboarding"
        >
          🔄 Restart
        </button>
      </header>

      <nav className="worker-dashboard__nav">
        {WORKER_TABS.map(tab => (
          <button
            key={tab.id}
            className={`worker-dashboard__nav-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="worker-dashboard__content">
        {renderContent()}
      </main>

      <SyncStatus />

      <footer className="worker-dashboard__footer">
        <p>© 2024 Shramik-Setu | Worker Portal</p>
      </footer>
    </div>
  );
}

/**
 * Worker Home Screen Component
 */
function WorkerHome({ onTabChange }) {
  return (
    <div className="worker-home">
      <h2>Welcome, Worker!</h2>
      <p>Access your work tools and track your employment</p>

      <div className="worker-home__features">
        <FeatureCard
          icon="📍"
          title="Find Jobs"
          description="Search for jobs matching your skills and location"
          onClick={() => onTabChange('jobs')}
        />
        <FeatureCard
          icon="✅"
          title="Mark Attendance"
          description="Record your daily attendance with TOTP"
          onClick={() => onTabChange('attendance')}
        />
        <FeatureCard
          icon="💰"
          title="E-Khata Ledger"
          description="Track your wages and payment history"
          onClick={() => onTabChange('ledger')}
        />
        <FeatureCard
          icon="📄"
          title="Payslip Auditor"
          description="Verify your payslips for compliance"
          onClick={() => onTabChange('payslip')}
        />
        <FeatureCard
          icon="🛡️"
          title="Report Issues"
          description="Submit safety and workplace grievances"
          onClick={() => onTabChange('grievance')}
        />
        <FeatureCard
          icon="⭐"
          title="Rate Employers"
          description="Share your experience with employers"
          onClick={() => onTabChange('rating')}
        />
      </div>
    </div>
  );
}

/**
 * Feature Card Component
 */
function FeatureCard({ icon, title, description, onClick }) {
  return (
    <div className="feature-card" onClick={onClick}>
      <div className="feature-card__icon">{icon}</div>
      <h3 className="feature-card__title">{title}</h3>
      <p className="feature-card__description">{description}</p>
      <div className="feature-card__action">Try Now →</div>
    </div>
  );
}
