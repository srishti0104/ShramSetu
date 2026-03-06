/**
 * Rating Demo Page
 * Demonstrates the rating system functionality
 */

import { useState } from 'react';
import RatingForm from '../components/ratings/RatingForm';
import RatingStatistics from '../components/ratings/RatingStatistics';
import './RatingDemo.css';

const RatingDemo = () => {
  const [activeTab, setActiveTab] = useState('submit');
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastRating, setLastRating] = useState(null);

  // Demo data
  const demoData = {
    jobId: 'job_demo_12345',
    raterId: 'worker_demo_456',
    rateeId: 'employer_demo_123',
    raterType: 'worker',
    rateeName: 'राज कुमार / Raj Kumar'
  };

  const handleRatingSuccess = (result) => {
    setLastRating(result);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setActiveTab('statistics');
    }, 2000);
  };

  const handleRatingCancel = () => {
    console.log('Rating cancelled');
  };

  return (
    <div className="rating-demo">
      <div className="demo-header">
        <h1>Rating System Demo</h1>
        <p>Experience the comprehensive rating system for employers and employees</p>
      </div>

      <div className="demo-tabs">
        <button 
          className={`tab-btn ${activeTab === 'submit' ? 'active' : ''}`}
          onClick={() => setActiveTab('submit')}
        >
          Submit Rating
        </button>
        <button 
          className={`tab-btn ${activeTab === 'statistics' ? 'active' : ''}`}
          onClick={() => setActiveTab('statistics')}
        >
          View Statistics
        </button>
        <button 
          className={`tab-btn ${activeTab === 'evaluation' ? 'active' : ''}`}
          onClick={() => setActiveTab('evaluation')}
        >
          Evaluation Report
        </button>
      </div>

      <div className="demo-content">
        {activeTab === 'submit' && (
          <div className="submit-section">
            <div className="section-header">
              <h2>Submit a Rating</h2>
              <p>Rate your experience working with {demoData.rateeName}</p>
            </div>

            {showSuccess && (
              <div className="success-message">
                <div className="success-icon">✅</div>
                <h3>Rating Submitted Successfully!</h3>
                <p>Your rating has been saved to DynamoDB and will be used for evaluation.</p>
                {lastRating && (
                  <div className="rating-details">
                    <p><strong>Rating ID:</strong> {lastRating.rating?.ratingId}</p>
                    <p><strong>Score:</strong> {lastRating.rating?.score}/5</p>
                    <p><strong>Trust Tier:</strong> {lastRating.trustTier?.current}</p>
                  </div>
                )}
              </div>
            )}

            <div className="rating-form-container">
              <RatingForm
                jobId={demoData.jobId}
                raterId={demoData.raterId}
                rateeId={demoData.rateeId}
                raterType={demoData.raterType}
                rateeName={demoData.rateeName}
                onSuccess={handleRatingSuccess}
                onCancel={handleRatingCancel}
              />
            </div>
          </div>
        )}

        {activeTab === 'statistics' && (
          <div className="statistics-section">
            <div className="section-header">
              <h2>Rating Statistics</h2>
              <p>Comprehensive rating analysis for {demoData.rateeName}</p>
            </div>

            <RatingStatistics
              userId={demoData.rateeId}
              userType="employer"
              showDetailed={true}
            />
          </div>
        )}

        {activeTab === 'evaluation' && (
          <div className="evaluation-section">
            <div className="section-header">
              <h2>Evaluation Report</h2>
              <p>How ratings are used to evaluate employers and employees</p>
            </div>

            <div className="evaluation-content">
              <div className="evaluation-card">
                <h3>🎯 Trust Tier System</h3>
                <div className="tier-explanation">
                  <div className="tier-item">
                    <span className="tier-badge bronze">BRONZE</span>
                    <span className="tier-desc">0-2.9 average, &lt;10 ratings</span>
                  </div>
                  <div className="tier-item">
                    <span className="tier-badge silver">SILVER</span>
                    <span className="tier-desc">3.0-3.9 average, ≥10 ratings</span>
                  </div>
                  <div className="tier-item">
                    <span className="tier-badge gold">GOLD</span>
                    <span className="tier-desc">4.0-4.4 average, ≥25 ratings</span>
                  </div>
                  <div className="tier-item">
                    <span className="tier-badge platinum">PLATINUM</span>
                    <span className="tier-desc">4.5-5.0 average, ≥50 ratings</span>
                  </div>
                </div>
              </div>

              <div className="evaluation-card">
                <h3>📊 Evaluation Metrics</h3>
                <ul className="metrics-list">
                  <li><strong>Overall Rating:</strong> Average of all ratings (60% weight)</li>
                  <li><strong>Volume Score:</strong> Number of completed jobs (20% weight)</li>
                  <li><strong>Consistency:</strong> Rating variance over time (20% weight)</li>
                  <li><strong>Category Performance:</strong> Specific skill ratings</li>
                  <li><strong>Trend Analysis:</strong> Performance improvement over time</li>
                </ul>
              </div>

              <div className="evaluation-card">
                <h3>🏆 Badge System</h3>
                <div className="badges-explanation">
                  <div className="badge-item">⏰ <strong>Reliable:</strong> 20+ ratings, 4.5+ punctuality</div>
                  <div className="badge-item">⭐ <strong>Quality Expert:</strong> 30+ ratings, 4.5+ quality</div>
                  <div className="badge-item">💬 <strong>Great Communicator:</strong> 15+ ratings, 4.5+ communication</div>
                  <div className="badge-item">⚖️ <strong>Fair Employer:</strong> 20+ ratings, 4.5+ fairness</div>
                  <div className="badge-item">💰 <strong>Timely Payer:</strong> 25+ ratings, 4.5+ payment timeliness</div>
                </div>
              </div>

              <div className="evaluation-card">
                <h3>🔍 Risk Assessment</h3>
                <ul className="risk-list">
                  <li><strong>High Risk:</strong> &gt;20% negative ratings (1-2 stars)</li>
                  <li><strong>Medium Risk:</strong> Declining performance trend</li>
                  <li><strong>Medium Risk:</strong> Inconsistent performance (&lt;50% consistency)</li>
                  <li><strong>Low Risk:</strong> Stable or improving performance</li>
                </ul>
              </div>

              <div className="evaluation-card">
                <h3>💡 How Data is Used</h3>
                <div className="usage-explanation">
                  <p><strong>For Employers:</strong></p>
                  <ul>
                    <li>Worker selection and hiring decisions</li>
                    <li>Trust tier-based job matching</li>
                    <li>Performance-based wage recommendations</li>
                    <li>Risk assessment for project assignments</li>
                  </ul>
                  
                  <p><strong>For Employees:</strong></p>
                  <ul>
                    <li>Employer reputation and reliability assessment</li>
                    <li>Payment history and fairness evaluation</li>
                    <li>Work environment quality indicators</li>
                    <li>Career growth and opportunity matching</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="demo-footer">
        <div className="tech-stack">
          <h4>Technology Stack</h4>
          <div className="tech-items">
            <span className="tech-item">React Frontend</span>
            <span className="tech-item">AWS Lambda</span>
            <span className="tech-item">DynamoDB</span>
            <span className="tech-item">EventBridge</span>
            <span className="tech-item">API Gateway</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingDemo;