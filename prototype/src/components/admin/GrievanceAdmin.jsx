/**
 * Grievance Admin Component
 * Simple admin interface to view submitted grievances
 */

import { useState, useEffect } from 'react';
import { getGrievances } from '../../utils/grievanceApi';
import './GrievanceAdmin.css';

export default function GrievanceAdmin() {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadGrievances();
  }, [filter]);

  const loadGrievances = async () => {
    try {
      setLoading(true);
      const options = {};
      if (filter !== 'all') {
        options.status = filter;
      }
      
      const result = await getGrievances(options);
      setGrievances(result.grievances || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return '#dc3545';
      case 'HIGH': return '#fd7e14';
      case 'MEDIUM': return '#ffc107';
      case 'LOW': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'safety': return '🛡️';
      case 'wage': return '💰';
      case 'harassment': return '⚠️';
      case 'working_conditions': return '🏗️';
      case 'contract': return '📄';
      default: return '📝';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="grievance-admin">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading grievances...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grievance-admin">
        <div className="error">
          <h3>Error Loading Grievances</h3>
          <p>{error}</p>
          <button onClick={loadGrievances} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grievance-admin">
      <div className="admin-header">
        <h2>🛡️ Grievance Administration</h2>
        <p>Monitor and manage worker grievances</p>
      </div>

      <div className="admin-controls">
        <div className="filter-controls">
          <label htmlFor="status-filter">Filter by Status:</label>
          <select
            id="status-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Grievances</option>
            <option value="submitted">Submitted</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <button onClick={loadGrievances} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      <div className="grievances-stats">
        <div className="stat-card">
          <div className="stat-number">{grievances.length}</div>
          <div className="stat-label">Total Grievances</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {grievances.filter(g => g.priority === 'CRITICAL').length}
          </div>
          <div className="stat-label">Critical</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {grievances.filter(g => g.status === 'submitted').length}
          </div>
          <div className="stat-label">Pending</div>
        </div>
      </div>

      {grievances.length === 0 ? (
        <div className="no-grievances">
          <p>No grievances found for the selected filter.</p>
        </div>
      ) : (
        <div className="grievances-list">
          {grievances.map((grievance) => (
            <div key={grievance.grievanceId} className="grievance-card">
              <div className="grievance-header">
                <div className="grievance-id">
                  <span className="category-icon">
                    {getCategoryIcon(grievance.category)}
                  </span>
                  <span className="id-text">{grievance.grievanceId}</span>
                </div>
                <div 
                  className="priority-badge"
                  style={{ backgroundColor: getPriorityColor(grievance.priority) }}
                >
                  {grievance.priority}
                </div>
              </div>

              <div className="grievance-content">
                <div className="grievance-description">
                  <strong>Description:</strong>
                  <p>{grievance.description}</p>
                </div>

                <div className="grievance-details">
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Category:</span>
                      <span className="detail-value">{grievance.category}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Severity:</span>
                      <span className="detail-value">{grievance.severity}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Urgency Score:</span>
                      <span className="detail-value">{grievance.urgencyScore}/100</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Status:</span>
                      <span className="detail-value">{grievance.status}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Assigned To:</span>
                      <span className="detail-value">{grievance.assignedTo}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Response Time:</span>
                      <span className="detail-value">{grievance.expectedResponseTime}</span>
                    </div>
                  </div>
                </div>

                {grievance.location && (
                  <div className="location-info">
                    <strong>Location:</strong> {grievance.location}
                  </div>
                )}

                {grievance.contractorName && (
                  <div className="contractor-info">
                    <strong>Contractor:</strong> {grievance.contractorName}
                  </div>
                )}

                {!grievance.isAnonymous && grievance.contactNumber && (
                  <div className="contact-info">
                    <strong>Contact:</strong> {grievance.contactNumber}
                  </div>
                )}

                <div className="grievance-footer">
                  <div className="submitted-info">
                    <strong>Submitted:</strong> {formatDate(grievance.submittedAt)}
                  </div>
                  <div className="worker-info">
                    <strong>Worker ID:</strong> {grievance.workerId}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}