/**
 * RatingStatistics Component
 * Displays comprehensive rating statistics for employer/employee evaluation
 */

import { useState, useEffect } from 'react';
import { getRatingStatistics } from '../../utils/ratingsApi';
import './RatingStatistics.css';

const RatingStatistics = ({ userId, userType, showDetailed = true }) => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId && userType) {
      fetchStatistics();
    }
  }, [userId, userType]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRatingStatistics(userId, userType);
      setStatistics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier) => {
    const colors = {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      platinum: '#E5E4E2'
    };
    return colors[tier] || '#CD7F32';
  };

  const getTrendIcon = (trend) => {
    const icons = {
      improving: '📈',
      declining: '📉',
      stable: '➡️',
      no_data: '❓'
    };
    return icons[trend] || '➡️';
  };

  const getRiskSeverityColor = (severity) => {
    const colors = {
      low: '#28a745',
      medium: '#ffc107',
      high: '#dc3545'
    };
    return colors[severity] || '#6c757d';
  };

  if (loading) {
    return (
      <div className="rating-statistics loading">
        <div className="loading-spinner"></div>
        <p>Loading rating statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rating-statistics error">
        <p>Error loading statistics: {error}</p>
        <button onClick={fetchStatistics} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="rating-statistics no-data">
        <p>No rating data available</p>
      </div>
    );
  }

  return (
    <div className="rating-statistics">
      {/* Header */}
      <div className="stats-header">
        <h3>Rating Statistics</h3>
        <div className="trust-tier" style={{ color: getTierColor(statistics.trustTier) }}>
          <span className="tier-badge">{statistics.trustTier.toUpperCase()}</span>
          <span className="tier-label">Trust Tier</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="key-metrics">
        <div className="metric">
          <div className="metric-value">{statistics.averageRating.toFixed(1)}</div>
          <div className="metric-label">Average Rating</div>
          <div className="metric-stars">
            {'★'.repeat(Math.floor(statistics.averageRating))}
            {'☆'.repeat(5 - Math.floor(statistics.averageRating))}
          </div>
        </div>
        
        <div className="metric">
          <div className="metric-value">{statistics.totalRatings}</div>
          <div className="metric-label">Total Ratings</div>
        </div>
        
        <div className="metric">
          <div className="metric-value">{statistics.evaluationScore}</div>
          <div className="metric-label">Evaluation Score</div>
          <div className="score-bar">
            <div 
              className="score-fill" 
              style={{ width: `${statistics.evaluationScore}%` }}
            ></div>
          </div>
        </div>
        
        <div className="metric">
          <div className="metric-value">
            {getTrendIcon(statistics.trend)}
          </div>
          <div className="metric-label">Trend</div>
          <div className="trend-text">{statistics.trend.replace('_', ' ')}</div>
        </div>
      </div>

      {showDetailed && (
        <>
          {/* Rating Distribution */}
          <div className="rating-distribution">
            <h4>Rating Distribution</h4>
            <div className="distribution-bars">
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="distribution-row">
                  <span className="rating-label">{rating}★</span>
                  <div className="distribution-bar">
                    <div 
                      className="distribution-fill"
                      style={{ 
                        width: `${(statistics.distribution[rating] / statistics.totalRatings) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="rating-count">{statistics.distribution[rating]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category Averages */}
          {Object.keys(statistics.categoryAverages).length > 0 && (
            <div className="category-averages">
              <h4>Category Performance</h4>
              <div className="category-grid">
                {Object.entries(statistics.categoryAverages).map(([category, average]) => (
                  <div key={category} className="category-item">
                    <div className="category-name">
                      {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    <div className="category-score">{average.toFixed(1)}</div>
                    <div className="category-bar">
                      <div 
                        className="category-fill"
                        style={{ width: `${(average / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Metrics */}
          <div className="performance-metrics">
            <h4>Performance Metrics</h4>
            <div className="metrics-grid">
              <div className="performance-item">
                <div className="performance-label">Consistency</div>
                <div className="performance-value">
                  {statistics.performanceMetrics.consistency.toFixed(0)}%
                </div>
              </div>
              <div className="performance-item">
                <div className="performance-label">Improvement</div>
                <div className="performance-value">
                  {statistics.performanceMetrics.improvement.toFixed(0)}%
                </div>
              </div>
              <div className="performance-item">
                <div className="performance-label">Reliability</div>
                <div className="performance-value">
                  {statistics.performanceMetrics.reliability.toFixed(0)}%
                </div>
              </div>
            </div>
          </div>

          {/* Badges */}
          {statistics.badges.length > 0 && (
            <div className="badges-section">
              <h4>Earned Badges</h4>
              <div className="badges-grid">
                {statistics.badges.map(badge => (
                  <div key={badge.id} className="badge-item">
                    <span className="badge-icon">{badge.icon}</span>
                    <span className="badge-name">{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths */}
          {statistics.strengths.length > 0 && (
            <div className="strengths-section">
              <h4>Strengths</h4>
              <div className="strengths-list">
                {statistics.strengths.map(strength => (
                  <div key={strength} className="strength-item">
                    ✅ {strength.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk Factors */}
          {statistics.riskFactors.length > 0 && (
            <div className="risk-factors-section">
              <h4>Risk Factors</h4>
              <div className="risk-list">
                {statistics.riskFactors.map((risk, index) => (
                  <div key={index} className="risk-item">
                    <span 
                      className="risk-indicator"
                      style={{ backgroundColor: getRiskSeverityColor(risk.severity) }}
                    ></span>
                    <span className="risk-text">
                      {risk.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <span className="risk-severity">({risk.severity})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {statistics.recommendations.length > 0 && (
            <div className="recommendations-section">
              <h4>Recommendations</h4>
              <div className="recommendations-list">
                {statistics.recommendations.map((rec, index) => (
                  <div key={index} className="recommendation-item">
                    <span className="rec-type">{rec.type}:</span>
                    <span className="rec-message">{rec.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="stats-footer">
        <small>Last updated: {new Date(statistics.lastUpdated).toLocaleString()}</small>
      </div>
    </div>
  );
};

export default RatingStatistics;