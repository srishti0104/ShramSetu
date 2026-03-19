/**
 * Posted Jobs Component
 * Shows all jobs posted by the employer
 */

import { useState, useEffect } from 'react';
import jobsAPI from '../../services/api/jobsAPI';
import './PostedJobs.css';

export default function PostedJobs({ contractorId = 'employer_demo_123' }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, [contractorId]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await jobsAPI.getContractorJobs(contractorId);
      
      if (response.success) {
        setJobs(response.jobs || []);
      } else {
        throw new Error('Failed to fetch jobs');
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      await jobsAPI.updateJobStatus(jobId, newStatus);
      // Refresh jobs list
      fetchJobs();
    } catch (err) {
      console.error('Error updating job status:', err);
      alert('Failed to update job status');
    }
  };

  if (loading) {
    return (
      <div className="posted-jobs">
        <div className="posted-jobs__header">
          <h2>📋 मेरी नौकरियां / My Posted Jobs</h2>
        </div>
        <div className="posted-jobs__loading">
          <div className="loading-spinner"></div>
          <p>लोड हो रहा है... / Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="posted-jobs">
        <div className="posted-jobs__header">
          <h2>📋 मेरी नौकरियां / My Posted Jobs</h2>
        </div>
        <div className="posted-jobs__error">
          <p>⚠️ {error}</p>
          <button onClick={fetchJobs} className="btn-retry">
            पुनः प्रयास करें / Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="posted-jobs">
      <div className="posted-jobs__header">
        <h2>📋 मेरी नौकरियां / My Posted Jobs</h2>
        <button onClick={fetchJobs} className="btn-refresh">
          <span className="btn-refresh__icon">🔄</span>
          <span className="btn-refresh__text">
            <span className="btn-refresh__hindi">ताज़ा करें</span>
            <span className="btn-refresh__divider">/</span>
            <span className="btn-refresh__english">Refresh</span>
          </span>
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="posted-jobs__empty">
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <h3>कोई नौकरी पोस्ट नहीं की गई / No Jobs Posted Yet</h3>
            <p>अपनी पहली नौकरी पोस्ट करें और कर्मचारी खोजना शुरू करें!</p>
            <p>Post your first job and start finding workers!</p>
          </div>
        </div>
      ) : (
        <div className="posted-jobs__list">
          <div className="jobs-stats">
            <div className="stat-card">
              <span className="stat-label">कुल नौकरियां / Total Jobs</span>
              <span className="stat-value">{jobs.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">खुली नौकरियां / Open Jobs</span>
              <span className="stat-value">
                {jobs.filter(j => j.status === 'open').length}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">भरी गई / Filled</span>
              <span className="stat-value">
                {jobs.filter(j => j.status === 'filled').length}
              </span>
            </div>
          </div>

          <div className="jobs-grid">
            {jobs.map(job => (
              <JobCard 
                key={job.jobId} 
                job={job} 
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function JobCard({ job, onStatusChange }) {
  const getStatusBadge = (status) => {
    const badges = {
      open: { label: 'खुला / Open', class: 'status-open', icon: '🟢' },
      filled: { label: 'भरा गया / Filled', class: 'status-filled', icon: '✅' },
      cancelled: { label: 'रद्द / Cancelled', class: 'status-cancelled', icon: '❌' }
    };
    return badges[status] || badges.open;
  };

  const statusBadge = getStatusBadge(job.status);
  const postedDate = new Date(job.postedAt).toLocaleDateString('en-IN');

  // Extract location - handle different formats
  const getLocation = () => {
    if (job.location) {
      if (typeof job.location === 'string') {
        return job.location;
      }
      if (job.location.city && job.location.state) {
        return `${job.location.city}, ${job.location.state}`;
      }
      if (job.location.city) {
        return job.location.city;
      }
    }
    return 'Location not specified';
  };

  // Extract wage - handle different formats
  const getWage = () => {
    if (job.wageRate && job.wageType) {
      return `₹${job.wageRate} / ${job.wageType}`;
    }
    if (job.wage && job.wageType) {
      return `₹${job.wage} / ${job.wageType}`;
    }
    if (job.wageRate) {
      return `₹${job.wageRate}`;
    }
    if (job.wage) {
      return `₹${job.wage}`;
    }
    return 'Wage not specified';
  };

  return (
    <div className="job-card">
      <div className="job-card__header">
        <h3 className="job-card__title">{job.title || 'Untitled Job'}</h3>
        <span className={`job-card__status ${statusBadge.class}`}>
          {statusBadge.icon} {statusBadge.label}
        </span>
      </div>

      <div className="job-card__body">
        {job.description && (
          <p className="job-card__description">{job.description}</p>
        )}

        <div className="job-card__details">
          <div className="detail-item">
            <span className="detail-icon">📍</span>
            <span className="detail-text">{getLocation()}</span>
          </div>

          <div className="detail-item">
            <span className="detail-icon">💰</span>
            <span className="detail-text">{getWage()}</span>
          </div>

          {job.duration && (
            <div className="detail-item">
              <span className="detail-icon">⏱️</span>
              <span className="detail-text">{job.duration}</span>
            </div>
          )}

          {job.workersNeeded && (
            <div className="detail-item">
              <span className="detail-icon">👥</span>
              <span className="detail-text">
                {job.workersNeeded} {job.workersNeeded === 1 ? 'worker' : 'workers'} needed
              </span>
            </div>
          )}

          <div className="detail-item">
            <span className="detail-icon">📅</span>
            <span className="detail-text">Posted: {postedDate}</span>
          </div>
        </div>

        {job.skillsRequired && job.skillsRequired.length > 0 && (
          <div className="job-card__skills">
            <span className="skills-label">Skills:</span>
            <div className="skills-list">
              {job.skillsRequired.map((skill, index) => (
                <span key={index} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {job.metadata && (
          <div className="job-card__metadata">
            <span>👁️ {job.metadata.views || 0} views</span>
            <span>📝 {job.metadata.applicationsCount || 0} applications</span>
          </div>
        )}
      </div>

      <div className="job-card__actions">
        {job.status === 'open' && (
          <>
            <button 
              className="btn-action btn-filled"
              onClick={() => onStatusChange(job.jobId, 'filled')}
            >
              ✅ Mark as Filled
            </button>
            <button 
              className="btn-action btn-cancel"
              onClick={() => onStatusChange(job.jobId, 'cancelled')}
            >
              ❌ Cancel Job
            </button>
          </>
        )}
        {job.status === 'filled' && (
          <button 
            className="btn-action btn-reopen"
            onClick={() => onStatusChange(job.jobId, 'open')}
          >
            🔄 Reopen Job
          </button>
        )}
        {job.status === 'cancelled' && (
          <button 
            className="btn-action btn-reopen"
            onClick={() => onStatusChange(job.jobId, 'open')}
          >
            🔄 Reopen Job
          </button>
        )}
      </div>
    </div>
  );
}
