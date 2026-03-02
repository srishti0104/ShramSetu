/**
 * Employer Dashboard Component
 * 
 * @fileoverview Dashboard interface for Employer users with role-specific features
 */

import { useState, useEffect } from 'react';
import './EmployerDashboard.css';

// Import feature components
import VoiceRecorder from '../voice/VoiceRecorder';
import JobSearch from '../jobs/JobSearch';
import SessionStart from '../attendance/SessionStart';
import TOTPDisplay from '../attendance/TOTPDisplay';
import EKhataLedger from '../ledger/EKhataLedger';
import GrievanceForm from '../grievance/GrievanceForm';
import RatingForm from '../ratings/RatingForm';
import OfflineSync from '../sync/OfflineSync';
import AIAssistant from '../ai/AIAssistant';
import SyncStatus from '../common/SyncStatus';

// Employer-specific navigation tabs
const EMPLOYER_TABS = [
  { id: 'home', label: '🏠 Home', icon: '🏠' },
  { id: 'voice', label: '🎤 Voice', icon: '🎤' },
  { id: 'talent-search', label: '🔍 Talent', icon: '🔍' },
  { id: 'session-start', label: '📋 Session', icon: '📋' },
  { id: 'totp-display', label: '🔢 TOTP', icon: '🔢' },
  { id: 'ledger', label: '💰 E-Khata', icon: '💰' },
  { id: 'grievance', label: '🛡️ Grievance', icon: '🛡️' },
  { id: 'rating', label: '⭐ Rating', icon: '⭐' },
  { id: 'sync', label: '📱 Sync', icon: '📱' },
  { id: 'ai-assistant', label: '🤖 AI', icon: '🤖' }
];

/**
 * Employer Dashboard Component
 * @param {Object} props
 * @param {Function} props.onRestartOnboarding - Callback to restart onboarding
 */
export default function EmployerDashboard({ onRestartOnboarding }) {
  const [activeTab, setActiveTab] = useState('home');
  const [sessionId, setSessionId] = useState(null);

  // Load saved tab from sessionStorage on mount
  useEffect(() => {
    const savedTab = sessionStorage.getItem('active_tab');
    if (savedTab && EMPLOYER_TABS.some(tab => tab.id === savedTab)) {
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
   * Handle session created
   */
  const handleSessionCreated = (session) => {
    setSessionId(session.sessionId);
    setActiveTab('totp-display');
  };

  /**
   * Render active tab content
   */
  const renderContent = () => {
    switch (activeTab) {
      case 'voice':
        return <VoiceRecorder />;
      
      case 'talent-search':
        return <JobSearch userRole="employer" />;
      
      case 'session-start':
        return (
          <SessionStart
            contractorId="employer_demo_123"
            onSessionCreated={handleSessionCreated}
          />
        );
      
      case 'totp-display':
        return sessionId ? (
          <TOTPDisplay
            sessionId={sessionId}
            contractorId="employer_demo_123"
          />
        ) : (
          <div className="employer-dashboard__message">
            <p>No active session. Please create a session first.</p>
            <button onClick={() => setActiveTab('session-start')}>
              Create Session
            </button>
          </div>
        );
      
      case 'ledger':
        return <EKhataLedger userRole="employer" />;
      
      case 'grievance':
        return <GrievanceForm />;
      
      case 'rating':
        return (
          <RatingForm
            jobId="job_demo_789"
            raterId="employer_demo_123"
            rateeId="worker_demo_456"
            raterType="employer"
            rateeName="Demo Worker"
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
        return <EmployerHome onTabChange={handleTabChange} />;
    }
  };

  return (
    <div className="employer-dashboard">
      <header className="employer-dashboard__header">
        <h1>श्रमिक सेतु / Employer Dashboard</h1>
        <p className="employer-dashboard__tagline">Find Talent, Manage Attendance, Track Payments</p>
        <button
          className="employer-dashboard__restart-btn"
          onClick={onRestartOnboarding}
          title="Restart Onboarding"
        >
          🔄 Restart
        </button>
      </header>

      <nav className="employer-dashboard__nav">
        {EMPLOYER_TABS.map(tab => (
          <button
            key={tab.id}
            className={`employer-dashboard__nav-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.id)}
            disabled={tab.id === 'totp-display' && !sessionId}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="employer-dashboard__content">
        {renderContent()}
      </main>

      <SyncStatus />

      <footer className="employer-dashboard__footer">
        <p>© 2024 Shramik-Setu | Employer Portal</p>
      </footer>
    </div>
  );
}

/**
 * Employer Home Screen Component
 */
function EmployerHome({ onTabChange }) {
  return (
    <div className="employer-home">
      <h2>Welcome, Employer!</h2>
      <p>Manage your workforce and track operations</p>

      <div className="employer-home__features">
        <FeatureCard
          icon="🔍"
          title="Find Talent"
          description="Search for skilled workers matching your requirements"
          onClick={() => onTabChange('talent-search')}
        />
        <FeatureCard
          icon="📋"
          title="Create Session"
          description="Start attendance session with TOTP verification"
          onClick={() => onTabChange('session-start')}
        />
        <FeatureCard
          icon="💰"
          title="E-Khata Ledger"
          description="Track payments and worker transactions"
          onClick={() => onTabChange('ledger')}
        />
        <FeatureCard
          icon="🛡️"
          title="View Grievances"
          description="Monitor and respond to worker reports"
          onClick={() => onTabChange('grievance')}
        />
        <FeatureCard
          icon="⭐"
          title="Rate Workers"
          description="Provide feedback on worker performance"
          onClick={() => onTabChange('rating')}
        />
        <FeatureCard
          icon="📱"
          title="Sync Data"
          description="Manage offline data synchronization"
          onClick={() => onTabChange('sync')}
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
