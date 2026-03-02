/**
 * Employer Dashboard Component
 * 
 * @fileoverview Modern, clean dashboard interface for Employer users with personalized greeting and worker feed focus
 */

import { useState, useEffect } from 'react';
import './EmployerDashboard.css';
import { useTranslation } from '../../hooks/useTranslation';
import { useUserProfile } from '../../contexts/UserProfileContext';
import LanguageSwitcher from '../LanguageSwitcher';

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
import WorkerFeed from '../feeds/WorkerFeed';

/**
 * Employer Dashboard Component
 * @param {Object} props
 * @param {Function} props.onRestartOnboarding - Callback to restart onboarding
 */
export default function EmployerDashboard({ onRestartOnboarding }) {
  const [activeSection, setActiveSection] = useState('home');
  const [sessionId, setSessionId] = useState(null);
  const { t, language } = useTranslation();
  const { userProfile, getDisplayName, isLoading: profileLoading } = useUserProfile();

  console.log(`EmployerDashboard rendering with language: ${language}`);

  /**
   * Handle navigation to different sections
   */
  const handleNavigate = (sectionId) => {
    setActiveSection(sectionId);
  };

  /**
   * Handle session created
   */
  const handleSessionCreated = (session) => {
    setSessionId(session.sessionId);
    setActiveSection('totp-display');
  };

  /**
   * Render active section content
   */
  const renderContent = () => {
    switch (activeSection) {
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
            <p>{t('common:messages.noData')}</p>
            <button onClick={() => setActiveSection('session-start')}>
              {t('dashboard:sessionStart')}
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
              alert(t('rating:submitRating'));
            }}
          />
        );
      
      case 'sync':
        return <OfflineSync />;
      
      case 'ai-assistant':
        return <AIAssistant />;

      case 'profile':
        return <EmployerProfile userProfile={userProfile} />;

      case 'settings':
        return <EmployerSettings />;

      case 'help':
        return <EmployerHelp />;
      
      case 'home':
      default:
        return <WorkerFeed />;
    }
  };

  if (profileLoading) {
    return (
      <div className="employer-dashboard employer-dashboard--loading">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>{t('common:messages.loading', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  // Navigation items for employer
  const navigationItems = [
    { id: 'home', label: t('nav:home', 'Home'), icon: '🏠' },
    { id: 'voice', label: t('common:labels.voice', 'Voice Assistant'), icon: '🎤' },
    { id: 'talent-search', label: t('dashboard:talentSearch', 'Talent Search'), icon: '🔍' },
    { id: 'session-start', label: t('dashboard:sessionStart', 'Start Session'), icon: '📋' },
    { id: 'ledger', label: t('dashboard:ledger', 'E-Khata'), icon: '💰' },
    { id: 'grievance', label: t('dashboard:grievance', 'Grievance'), icon: '🛡️' },
    { id: 'rating', label: t('dashboard:rating', 'Rating'), icon: '⭐' },
    { id: 'sync', label: t('dashboard:sync', 'Sync'), icon: '📱' },
    { id: 'ai-assistant', label: t('common:labels.ai', 'AI Assistant'), icon: '🤖' },
    { id: 'profile', label: t('nav:profile', 'Profile'), icon: '👤' },
    { id: 'settings', label: t('nav:settings', 'Settings'), icon: '⚙️' },
    { id: 'help', label: t('nav:help', 'Help & Support'), icon: '❓' }
  ];

  return (
    <div className="employer-dashboard">
      {/* Left Sidebar Navigation */}
      <aside className="employer-dashboard__sidebar">
        <div className="employer-dashboard__sidebar-header">
          <h2 className="employer-dashboard__sidebar-title">ShramSetu</h2>
        </div>
        <nav className="employer-dashboard__sidebar-nav">
          <ul className="employer-dashboard__nav-list">
            {navigationItems.map(item => (
              <li key={item.id} className="employer-dashboard__nav-item">
                <button
                  className={`employer-dashboard__nav-link ${
                    activeSection === item.id ? 'employer-dashboard__nav-link--active' : ''
                  }`}
                  onClick={() => handleNavigate(item.id)}
                >
                  <span className="employer-dashboard__nav-icon">{item.icon}</span>
                  <span className="employer-dashboard__nav-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="employer-dashboard__main-wrapper">
        {/* Top Header */}
        <header className="employer-dashboard__header">
          <div className="employer-dashboard__header-content">
            <div className="employer-dashboard__title-section">
              <h1 className="employer-dashboard__greeting">
                {t('dashboard:hello', 'Hello')}, {getDisplayName()}! 👋
              </h1>
              <p className="employer-dashboard__tagline">
                {t('dashboard:employerSubtitle', 'Find the right talent for your needs')}
              </p>
            </div>
            <div className="employer-dashboard__header-actions">
              <LanguageSwitcher 
                variant="dropdown" 
                className="employer-dashboard__language-switcher" 
              />
              <button
                className="employer-dashboard__restart-btn"
                onClick={onRestartOnboarding}
                title={t('common:buttons.restart', 'Restart Onboarding')}
              >
                🔄 {t('common:buttons.restart', 'Restart')}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="employer-dashboard__content">
          {renderContent()}
        </main>

        {/* Footer */}
        <footer className="employer-dashboard__footer">
          <p>© 2024 ShramSetu | {t('dashboard:employerPortal', 'Employer Portal')}</p>
        </footer>
      </div>
    </div>
  );
}

/**
 * Employer Profile Component
 */
function EmployerProfile({ userProfile }) {
  const { t } = useTranslation();
  
  return (
    <div className="employer-profile">
      <div className="employer-profile__header">
        <h2>{t('profile:title', 'My Profile')}</h2>
      </div>
      
      <div className="employer-profile__content">
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
        
        <div className="employer-stats">
          <h4>{t('profile:businessInfo', 'Business Information')}</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">{t('profile:activeJobs', 'Active Jobs')}</span>
              <span className="stat-value">5</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{t('profile:totalHires', 'Total Hires')}</span>
              <span className="stat-value">23</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{t('profile:rating', 'Rating')}</span>
              <span className="stat-value">4.8 ⭐</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Employer Settings Component
 */
function EmployerSettings() {
  const { t } = useTranslation();
  
  return (
    <div className="employer-settings">
      <h2>{t('settings:title', 'Settings')}</h2>
      <p>{t('settings:comingSoon', 'Settings panel coming soon...')}</p>
    </div>
  );
}

/**
 * Employer Help Component
 */
function EmployerHelp() {
  const { t } = useTranslation();
  
  return (
    <div className="employer-help">
      <h2>{t('help:title', 'Help & Support')}</h2>
      <p>{t('help:comingSoon', 'Help section coming soon...')}</p>
    </div>
  );
}