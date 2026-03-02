/**
 * Dashboard Navigation Component
 * 
 * @fileoverview Clean, collapsible navigation for dashboard secondary features
 */

import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import './DashboardNavigation.css';

/**
 * Dashboard Navigation Component
 */
export default function DashboardNavigation({ userRole, onNavigate, activeSection }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // Navigation items based on user role
  const getNavigationItems = () => {
    const commonItems = [
      { id: 'profile', label: t('nav:profile', 'Profile'), icon: '👤' },
      { id: 'settings', label: t('nav:settings', 'Settings'), icon: '⚙️' },
      { id: 'help', label: t('nav:help', 'Help & Support'), icon: '❓' }
    ];

    if (userRole === 'worker') {
      return [
        { id: 'voice', label: t('common:labels.voice', 'Voice Assistant'), icon: '🎤' },
        { id: 'attendance', label: t('dashboard:attendance', 'Attendance'), icon: '✅' },
        { id: 'ledger', label: t('dashboard:ledger', 'E-Khata'), icon: '💰' },
        { id: 'payslip', label: t('dashboard:payslip', 'Payslip'), icon: '📄' },
        { id: 'grievance', label: t('dashboard:grievance', 'Grievance'), icon: '🛡️' },
        { id: 'rating', label: t('dashboard:rating', 'Rating'), icon: '⭐' },
        { id: 'sync', label: t('dashboard:sync', 'Sync'), icon: '📱' },
        { id: 'ai-assistant', label: t('common:labels.ai', 'AI Assistant'), icon: '🤖' },
        ...commonItems
      ];
    } else {
      return [
        { id: 'voice', label: t('common:labels.voice', 'Voice Assistant'), icon: '🎤' },
        { id: 'session-start', label: t('dashboard:sessionStart', 'Start Session'), icon: '📋' },
        { id: 'ledger', label: t('dashboard:ledger', 'E-Khata'), icon: '💰' },
        { id: 'grievance', label: t('dashboard:grievance', 'Grievance'), icon: '🛡️' },
        { id: 'rating', label: t('dashboard:rating', 'Rating'), icon: '⭐' },
        { id: 'sync', label: t('dashboard:sync', 'Sync'), icon: '📱' },
        { id: 'ai-assistant', label: t('common:labels.ai', 'AI Assistant'), icon: '🤖' },
        ...commonItems
      ];
    }
  };

  const navigationItems = getNavigationItems();

  const handleItemClick = (itemId) => {
    onNavigate(itemId);
    setIsOpen(false); // Close menu on mobile after selection
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="dashboard-nav__mobile-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('nav:toggleMenu', 'Toggle navigation menu')}
      >
        <span className="dashboard-nav__hamburger">
          <span></span>
          <span></span>
          <span></span>
        </span>
        <span className="dashboard-nav__menu-text">
          {t('nav:menu', 'Menu')}
        </span>
      </button>

      {/* Navigation Menu */}
      <nav className={`dashboard-nav ${isOpen ? 'dashboard-nav--open' : ''}`}>
        <div className="dashboard-nav__header">
          <h3 className="dashboard-nav__title">
            {t('nav:quickAccess', 'Quick Access')}
          </h3>
          <button 
            className="dashboard-nav__close"
            onClick={() => setIsOpen(false)}
            aria-label={t('common:buttons.close', 'Close')}
          >
            ×
          </button>
        </div>

        <div className="dashboard-nav__content">
          <ul className="dashboard-nav__list">
            {navigationItems.map(item => (
              <li key={item.id} className="dashboard-nav__item">
                <button
                  className={`dashboard-nav__link ${
                    activeSection === item.id ? 'dashboard-nav__link--active' : ''
                  }`}
                  onClick={() => handleItemClick(item.id)}
                >
                  <span className="dashboard-nav__icon">{item.icon}</span>
                  <span className="dashboard-nav__label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="dashboard-nav__overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}