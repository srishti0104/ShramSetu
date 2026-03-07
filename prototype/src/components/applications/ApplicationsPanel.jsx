/**
 * Applications Panel Component
 * 
 * @fileoverview Displays job applications for employers with management capabilities
 */

import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import applicationService from '../../services/aws/applicationService';
import './ApplicationsPanel.css';

/**
 * Applications Panel Component
 */
export default function ApplicationsPanel() {
  const { t } = useTranslation();
  const [applications, setApplications] = useState([]);
  const [applicationsByStatus, setApplicationsByStatus] = useState({});
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);

  // Load applications on mount
  useEffect(() => {
    loadApplications();
  }, []);

  /**
   * Load applications for the employer
   */
  const loadApplications = async () => {
    try {
      setLoading(true);
      const contractorId = 'employer_demo_123'; // In real app, get from user context
      const result = await applicationService.getContractorApplications(contractorId);
      
      if (result.success) {
        setApplications(result.applications);
        setApplicationsByStatus(result.applicationsByStatus);
        setSummary(result.summary);
      }
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get applications for current tab
   */
  const getFilteredApplications = () => {
    if (activeTab === 'all') {
      return applications;
    }
    return applicationsByStatus[activeTab] || [];
  };

  /**
   * Handle application status update
   */
  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      // Update local state immediately for better UX
      const updatedApplications = applications.map(app => 
        app.applicationId === applicationId 
          ? { ...app, status: newStatus, updatedAt: new Date().toISOString() }
          : app
      );
      setApplications(updatedApplications);
      
      // In real app, call API to update status
      console.log(`Updated application ${applicationId} to ${newStatus}`);
      
      // Reload to refresh counts
      setTimeout(loadApplications, 500);
      
    } catch (error) {
      console.error('Failed to update application status:', error);
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Get status badge class
   */
  const getStatusBadgeClass = (status) => {
    const baseClass = 'application-card__status-badge';
    switch (status) {
      case 'pending': return `${baseClass} ${baseClass}--pending`;
      case 'reviewed': return `${baseClass} ${baseClass}--reviewed`;
      case 'accepted': return `${baseClass} ${baseClass}--accepted`;
      case 'rejected': return `${baseClass} ${baseClass}--rejected`;
      default: return baseClass;
    }
  };

  if (loading) {
    return (
      <div className="applications-panel">
        <div className="applications-panel__loading">
          <div className="loading-spinner"></div>
          <p>{t('common:messages.loading', 'Loading applications...')}</p>
        </div>
      </div>
    );
  }

  const filteredApplications = getFilteredApplications();

  return (
    <div className="applications-panel">
      <div className="applications-panel__header">
        <h2>{t('applications:title', 'Job Applications')}</h2>
        <p className="applications-panel__subtitle">
          {t('applications:subtitle', 'Manage applications from workers')}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="applications-panel__summary">
        <div className="summary-card">
          <div className="summary-card__icon">📋</div>
          <div className="summary-card__content">
            <h3>{summary.total || 0}</h3>
            <p>Total Applications</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card__icon">⏳</div>
          <div className="summary-card__content">
            <h3>{summary.pending || 0}</h3>
            <p>Pending Review</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card__icon">✅</div>
          <div className="summary-card__content">
            <h3>{summary.accepted || 0}</h3>
            <p>Accepted</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card__icon">❌</div>
          <div className="summary-card__content">
            <h3>{summary.rejected || 0}</h3>
            <p>Rejected</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="applications-panel__tabs">
        <button
          className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All ({summary.total || 0})
        </button>
        <button
          className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending ({summary.pending || 0})
        </button>
        <button
          className={`tab-button ${activeTab === 'reviewed' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviewed')}
        >
          Reviewed ({summary.reviewed || 0})
        </button>
        <button
          className={`tab-button ${activeTab === 'accepted' ? 'active' : ''}`}
          onClick={() => setActiveTab('accepted')}
        >
          Accepted ({summary.accepted || 0})
        </button>
        <button
          className={`tab-button ${activeTab === 'rejected' ? 'active' : ''}`}
          onClick={() => setActiveTab('rejected')}
        >
          Rejected ({summary.rejected || 0})
        </button>
      </div>

      {/* Applications List */}
      <div className="applications-panel__list">
        {filteredApplications.length === 0 ? (
          <div className="applications-panel__empty">
            <div className="empty-state">
              <div className="empty-state__icon">📭</div>
              <h3>No Applications Found</h3>
              <p>
                {activeTab === 'all' 
                  ? 'No applications have been submitted yet.'
                  : `No ${activeTab} applications found.`
                }
              </p>
            </div>
          </div>
        ) : (
          filteredApplications.map(application => (
            <ApplicationCard
              key={application.applicationId}
              application={application}
              onStatusUpdate={handleStatusUpdate}
              onViewDetails={setSelectedApplication}
              formatDate={formatDate}
              getStatusBadgeClass={getStatusBadgeClass}
            />
          ))
        )}
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onStatusUpdate={handleStatusUpdate}
          formatDate={formatDate}
          getStatusBadgeClass={getStatusBadgeClass}
        />
      )}
    </div>
  );
}

/**
 * Application Card Component
 */
function ApplicationCard({ 
  application, 
  onStatusUpdate, 
  onViewDetails, 
  formatDate, 
  getStatusBadgeClass 
}) {
  const { applicantProfile, jobDetails, status, appliedAt } = application;

  return (
    <div className="application-card">
      <div className="application-card__header">
        <div className="application-card__applicant">
          <div className="applicant-avatar">
            {applicantProfile.name.charAt(0)}
          </div>
          <div className="applicant-info">
            <h3 className="applicant-name">{applicantProfile.name}</h3>
            <p className="applicant-location">📍 {applicantProfile.location}</p>
            <p className="applicant-experience">🕒 {applicantProfile.experience}</p>
          </div>
        </div>
        <div className={getStatusBadgeClass(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>

      <div className="application-card__job">
        <h4 className="job-title">{jobDetails.title}</h4>
        <p className="job-location">📍 {jobDetails.location}</p>
        <p className="job-wage">💰 ₹{jobDetails.wage}/{jobDetails.wageType}</p>
      </div>

      <div className="application-card__stats">
        <div className="stat">
          <span className="stat-icon">⭐</span>
          <span>{applicantProfile.rating} rating</span>
        </div>
        <div className="stat">
          <span className="stat-icon">💼</span>
          <span>{applicantProfile.completedJobs} jobs</span>
        </div>
        <div className="stat">
          <span className="stat-icon">📅</span>
          <span>{formatDate(appliedAt)}</span>
        </div>
      </div>

      <div className="application-card__skills">
        {applicantProfile.skills.slice(0, 3).map((skill, index) => (
          <span key={index} className="skill-tag">
            {skill}
          </span>
        ))}
        {applicantProfile.skills.length > 3 && (
          <span className="skill-tag skill-tag--more">
            +{applicantProfile.skills.length - 3} more
          </span>
        )}
      </div>

      <div className="application-card__actions">
        <button
          className="action-btn action-btn--view"
          onClick={() => onViewDetails(application)}
        >
          View Details
        </button>
        {status === 'pending' && (
          <>
            <button
              className="action-btn action-btn--accept"
              onClick={() => onStatusUpdate(application.applicationId, 'accepted')}
            >
              Accept
            </button>
            <button
              className="action-btn action-btn--reject"
              onClick={() => onStatusUpdate(application.applicationId, 'rejected')}
            >
              Reject
            </button>
          </>
        )}
        {status === 'reviewed' && (
          <>
            <button
              className="action-btn action-btn--accept"
              onClick={() => onStatusUpdate(application.applicationId, 'accepted')}
            >
              Accept
            </button>
            <button
              className="action-btn action-btn--reject"
              onClick={() => onStatusUpdate(application.applicationId, 'rejected')}
            >
              Reject
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Application Detail Modal Component
 */
function ApplicationDetailModal({ 
  application, 
  onClose, 
  onStatusUpdate, 
  formatDate, 
  getStatusBadgeClass 
}) {
  const { applicantProfile, jobDetails, status, appliedAt } = application;

  return (
    <div className="application-modal" onClick={onClose}>
      <div className="application-modal__content" onClick={(e) => e.stopPropagation()}>
        <button className="application-modal__close" onClick={onClose}>
          ×
        </button>

        <div className="application-modal__header">
          <div className="applicant-profile">
            <div className="applicant-avatar applicant-avatar--large">
              {applicantProfile.name.charAt(0)}
            </div>
            <div className="applicant-details">
              <h2>{applicantProfile.name}</h2>
              <p className="phone">📞 {applicantProfile.phoneNumber}</p>
              <p className="location">📍 {applicantProfile.location}</p>
              <div className={getStatusBadgeClass(status)}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </div>
            </div>
          </div>
        </div>

        <div className="application-modal__section">
          <h3>Job Applied For</h3>
          <div className="job-info">
            <h4>{jobDetails.title}</h4>
            <p>📍 {jobDetails.location}</p>
            <p>💰 ₹{jobDetails.wage}/{jobDetails.wageType}</p>
          </div>
        </div>

        <div className="application-modal__section">
          <h3>Worker Profile</h3>
          <div className="worker-stats">
            <div className="stat-item">
              <span className="stat-label">Experience</span>
              <span className="stat-value">{applicantProfile.experience}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Rating</span>
              <span className="stat-value">⭐ {applicantProfile.rating}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Completed Jobs</span>
              <span className="stat-value">{applicantProfile.completedJobs}</span>
            </div>
          </div>
        </div>

        <div className="application-modal__section">
          <h3>Skills</h3>
          <div className="skills-list">
            {applicantProfile.skills.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="application-modal__section">
          <h3>Application Details</h3>
          <p><strong>Applied:</strong> {formatDate(appliedAt)}</p>
          <p><strong>Application ID:</strong> {application.applicationId}</p>
        </div>

        {(status === 'pending' || status === 'reviewed') && (
          <div className="application-modal__actions">
            <button
              className="action-btn action-btn--accept action-btn--large"
              onClick={() => {
                onStatusUpdate(application.applicationId, 'accepted');
                onClose();
              }}
            >
              Accept Application
            </button>
            <button
              className="action-btn action-btn--reject action-btn--large"
              onClick={() => {
                onStatusUpdate(application.applicationId, 'rejected');
                onClose();
              }}
            >
              Reject Application
            </button>
          </div>
        )}
      </div>
    </div>
  );
}