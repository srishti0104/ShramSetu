/**
 * Worker Dashboard Component
 * 
 * @fileoverview Modern, clean dashboard interface for Worker users with personalized greeting and job feed focus
 */

import { useState, useEffect } from 'react';
import './WorkerDashboard.css';
import { useTranslation } from '../../hooks/useTranslation';
import { useUserProfile } from '../../contexts/UserProfileContext';
import LanguageSwitcher from '../LanguageSwitcher';

// Import feature components
import VoiceRecorder from '../voice/VoiceRecorder';
import TOTPInput from '../attendance/TOTPInput';
import AttendanceLog from '../attendance/AttendanceLog';
import EKhataLedger from '../ledger/EKhataLedger';
import PayslipAuditor from '../payslip/PayslipAuditor';
import GrievanceForm from '../grievance/GrievanceForm';
import RatingForm from '../ratings/RatingForm';
import OfflineSync from '../sync/OfflineSync';
import AIAssistant from '../ai/AIAssistant';
import JobFeed from '../feeds/JobFeed';
import JobSearch from '../jobs/JobSearch';
import FloatingAIButton from '../ai/FloatingAIButton';

/**
 * Worker Dashboard Component
 * @param {Object} props
 * @param {Function} props.onRestartOnboarding - Callback to restart onboarding
 */
export default function WorkerDashboard({ onRestartOnboarding }) {
  const [activeSection, setActiveSection] = useState('home');
  const [sessionId, setSessionId] = useState(null);
  const { t, language } = useTranslation();
  const { userProfile, getDisplayName, isLoading: profileLoading } = useUserProfile();

  console.log(`WorkerDashboard rendering with language: ${language}`);

  /**
   * Handle navigation to different sections
   */
  const handleNavigate = (sectionId) => {
    setActiveSection(sectionId);
  };

  /**
   * Render active section content
   */
  const renderContent = () => {
    switch (activeSection) {
      case 'voice':
        return <VoiceRecorder />;
      
      case 'attendance':
        return (
          <TOTPInput
            sessionId={sessionId || 'demo_session'}
            workerId="worker_demo_456"
            onSuccess={(attendance) => {
              console.log('Attendance marked:', attendance);
              setActiveSection('attendance-log');
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
        return <AIAssistant onTabChange={handleNavigate} />;

      case 'jobs':
        return <JobSearch />;

      case 'profile':
        return <WorkerProfile userProfile={userProfile} />;

      case 'settings':
        return <WorkerSettings />;

      case 'help':
        return <WorkerHelp />;
      
      case 'home':
      default:
        return <JobFeed />;
    }
  };

  if (profileLoading) {
    return (
      <div className="worker-dashboard worker-dashboard--loading">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>{t('common:messages.loading', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  // Navigation items for worker
  const navigationItems = [
    { id: 'home', label: t('nav:home', 'Home'), icon: '🏠' },
    { id: 'attendance', label: t('dashboard:attendance', 'Attendance'), icon: '✅' },
    { id: 'ledger', label: t('dashboard:ledger', 'E-Khata'), icon: '💰' },
    { id: 'payslip', label: t('dashboard:payslip', 'Payslip'), icon: '📄' },
    { id: 'grievance', label: t('dashboard:grievance', 'Grievance'), icon: '🛡️' },
    { id: 'rating', label: t('dashboard:rating', 'Rating'), icon: '⭐' },
    { id: 'sync', label: t('dashboard:sync', 'Sync'), icon: '📱' },
    { id: 'ai-assistant', label: t('common:labels.ai', 'AI Assistant'), icon: '/images/chatbot-avatar.png', isImage: true },
    { id: 'profile', label: t('nav:profile', 'Profile'), icon: '👤' },
    { id: 'settings', label: t('nav:settings', 'Settings'), icon: '⚙️' },
    { id: 'help', label: t('nav:help', 'Help & Support'), icon: '❓' }
  ];

  return (
    <div className="worker-dashboard">
      {/* Floating AI Assistant Button - Available on all pages */}
      <FloatingAIButton onTabChange={handleNavigate} currentPage={activeSection} />
      
      {/* Left Sidebar Navigation */}
      <aside className="worker-dashboard__sidebar">
        <div className="worker-dashboard__sidebar-header">
          <h2 className="worker-dashboard__sidebar-title">ShramSetu</h2>
        </div>
        <nav className="worker-dashboard__sidebar-nav">
          <ul className="worker-dashboard__nav-list">
            {navigationItems.map(item => (
              <li key={item.id} className="worker-dashboard__nav-item">
                <button
                  className={`worker-dashboard__nav-link ${
                    activeSection === item.id ? 'worker-dashboard__nav-link--active' : ''
                  }`}
                  onClick={() => handleNavigate(item.id)}
                >
                  <span className="worker-dashboard__nav-icon">
                    {item.isImage ? (
                      <img 
                        src={item.icon} 
                        alt={item.label}
                        style={{width: '24px', height: '24px', objectFit: 'cover', borderRadius: '50%'}}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '🤖';
                        }}
                      />
                    ) : (
                      item.icon
                    )}
                  </span>
                  <span className="worker-dashboard__nav-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="worker-dashboard__main-wrapper">
        {/* Top Header */}
        <header className="worker-dashboard__header">
          <div className="worker-dashboard__header-content">
            <div className="worker-dashboard__title-section">
              <h1 className="worker-dashboard__greeting">
                {t('dashboard:hello', 'Hello')}, {getDisplayName()}! 👋
              </h1>
              <p className="worker-dashboard__tagline">
                {t('dashboard:workerSubtitle', 'Find your next opportunity')}
              </p>
            </div>
            <div className="worker-dashboard__header-actions">
              <LanguageSwitcher 
                variant="dropdown" 
                className="worker-dashboard__language-switcher" 
              />
              <button
                className="worker-dashboard__restart-btn"
                onClick={onRestartOnboarding}
                title={t('common:buttons.restart', 'Restart Onboarding')}
              >
                🔄 {t('common:buttons.restart', 'Restart')}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="worker-dashboard__content">
          {renderContent()}
        </main>

        {/* Footer */}
        <footer className="worker-dashboard__footer">
          <p>© 2024 ShramSetu | {t('dashboard:workerPortal', 'Worker Portal')}</p>
        </footer>
      </div>
    </div>
  );
}

/**
 * Worker Profile Component
 */
function WorkerProfile({ userProfile }) {
  const { t } = useTranslation();
  
  return (
    <div className="worker-profile">
      <div className="worker-profile__header">
        <h2>{t('profile:title', 'My Profile')}</h2>
      </div>
      
      <div className="worker-profile__content">
        <div className="profile-card">
          <div className="profile-card__avatar">
            {userProfile?.name?.charAt(0) || 'U'}
          </div>
          <div className="profile-card__info">
            <h3>{userProfile?.name || 'User'}</h3>
            <p>{userProfile?.phoneNumber || 'Phone not provided'}</p>
            <p>{userProfile?.location?.city || 'Location not set'}</p>
          </div>
        </div>
        
        {userProfile?.skills && userProfile.skills.length > 0 && (
          <div className="profile-skills">
            <h4>{t('profile:skills', 'Skills')}</h4>
            <div className="skills-list">
              {userProfile.skills.map((skill, index) => (
                <span key={index} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Worker Settings Component
 */
function WorkerSettings() {
  const { t } = useTranslation();
  
  return (
    <div className="worker-settings">
      <h2>{t('settings:title', 'Settings')}</h2>
      <p>{t('settings:comingSoon', 'Settings panel coming soon...')}</p>
    </div>
  );
}

/**
 * Worker Help Component
 */
function WorkerHelp() {
  const { t } = useTranslation();
  
  return (
    <div className="worker-help">
      <h2>{t('help:title', 'Help & Support')}</h2>
      <p>{t('help:comingSoon', 'Help section coming soon...')}</p>
    </div>
  );
}
