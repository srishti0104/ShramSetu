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
import NotificationBell from '../notifications/NotificationBell';

// Import feature components
import SessionStart from '../attendance/SessionStart';
import TOTPDisplay from '../attendance/TOTPDisplay';
import GrievanceForm from '../grievance/GrievanceForm';
import RatingForm from '../ratings/RatingForm';
import OfflineSync from '../sync/OfflineSync';
import EmployerAIAssistant from '../ai/EmployerAIAssistant';
import EmployerFloatingAIButton from '../ai/EmployerFloatingAIButton';
import PostedJobs from '../jobs/PostedJobs';
import ApplicationsPanel from '../applications/ApplicationsPanel';

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
      case 'post-job':
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
            <button onClick={() => setActiveSection('post-job')}>
              {t('dashboard:postJob', 'Post a Job')}
            </button>
          </div>
        );
      
      case 'rating':
        return (
          <div className="rating-panel-wrapper">
            <h2 className="section-title">{t('dashboard:rating', 'Rating')}</h2>
            <RatingForm
              jobId="manual_rating"
              raterId="employer_demo_123"
              rateeId="" // Empty - user must enter Employee ID
              raterType="employer"
              rateeName=""
              onSuccess={(result) => {
                console.log('✅ Rating submitted to DynamoDB:', result);
                alert('रेटिंग सफलतापूर्वक जमा की गई! / Rating submitted successfully!');
              }}
            />
          </div>
        );
      
      case 'grievance':
        return <GrievanceForm />;
      
      case 'sync':
        return <OfflineSync />;
      
      case 'ai-assistant':
        return <EmployerAIAssistant />;

      case 'applications':
        return <ApplicationsPanel />;

      case 'profile':
        return <EmployerProfile userProfile={userProfile} />;

      case 'settings':
        return <EmployerSettings />;
      
      case 'home':
      default:
        return <PostedJobs contractorId="employer_demo_123" />;
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
    { id: 'home', label: t('dashboard:postedJobs', 'Posted Jobs'), icon: '📋' },
    { id: 'applications', label: t('dashboard:applications', 'Applications'), icon: '📝' },
    { id: 'post-job', label: t('dashboard:postJob', 'Post a Job'), icon: '➕' },
    { id: 'rating', label: t('dashboard:rating', 'Rating'), icon: '⭐' },
    { id: 'grievance', label: t('dashboard:grievance', 'Grievance'), icon: '🛡️' },
    { id: 'sync', label: t('dashboard:sync', 'Sync'), icon: '📱' },
    { id: 'ai-assistant', label: t('common:labels.ai', 'AI Assistant'), icon: '🤖' },
    { id: 'profile', label: t('nav:profile', 'Profile'), icon: '👤' },
    { id: 'settings', label: t('nav:settings', 'Settings'), icon: '⚙️' }
  ];

  return (
    <div className="employer-dashboard">
      {/* Floating AI Button - Available on all pages EXCEPT ai-assistant page */}
      {activeSection !== 'ai-assistant' && (
        <EmployerFloatingAIButton 
          onTabChange={handleNavigate}
          currentPage={activeSection}
        />
      )}

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
                {t('dashboard:employerSubtitle', 'Manage your jobs and find the right talent')}
              </p>
            </div>
            <div className="employer-dashboard__header-actions">
              <NotificationBell />
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
            {userProfile?.photo ? (
              <img src={userProfile.photo} alt={userProfile.name} />
            ) : (
              <div className="profile-card__avatar-placeholder">
                {userProfile?.name?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <div className="profile-card__info">
            <h3>{userProfile?.name || 'User'}</h3>
            <p className="profile-card__role">
              {userProfile?.role === 'worker' ? t('profile:worker', 'Worker') : t('profile:employer', 'Employer')}
            </p>
          </div>
        </div>
        
        <div className="profile-details">
          <h4>{t('profile:personalInfo', 'Personal Information')}</h4>
          <div className="profile-details__grid">
            <div className="profile-detail-item">
              <span className="profile-detail-label">{t('profile:phone', 'Phone Number')}</span>
              <span className="profile-detail-value">{userProfile?.phoneNumber || 'Not provided'}</span>
            </div>
            
            {userProfile?.age && (
              <div className="profile-detail-item">
                <span className="profile-detail-label">{t('profile:age', 'Age')}</span>
                <span className="profile-detail-value">{userProfile.age}</span>
              </div>
            )}
            
            {userProfile?.gender && (
              <div className="profile-detail-item">
                <span className="profile-detail-label">{t('profile:gender', 'Gender')}</span>
                <span className="profile-detail-value">
                  {userProfile.gender === 'male' ? t('profile:male', 'Male') : 
                   userProfile.gender === 'female' ? t('profile:female', 'Female') : 
                   t('profile:other', 'Other')}
                </span>
              </div>
            )}
            
            {userProfile?.location && (
              <div className="profile-detail-item">
                <span className="profile-detail-label">{t('profile:location', 'Location')}</span>
                <span className="profile-detail-value">
                  {[
                    userProfile.location.city,
                    userProfile.location.state,
                    userProfile.location.pincode
                  ].filter(Boolean).join(', ') || 'Not set'}
                </span>
              </div>
            )}
            
            {userProfile?.location?.address && (
              <div className="profile-detail-item profile-detail-item--full">
                <span className="profile-detail-label">{t('profile:address', 'Address')}</span>
                <span className="profile-detail-value">{userProfile.location.address}</span>
              </div>
            )}
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