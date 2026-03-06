/**
 * Contractor Profile Component
 * Displays detailed contractor information
 */

import { useState } from 'react';
import './ContractorProfile.css';

const ContractorProfile = ({ contractor, onClose, onContact }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!contractor) return null;

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">☆</span>);
    }
    
    return <div className="rating-stars">{stars}</div>;
  };

  const renderOverview = () => (
    <div className="contractor-overview">
      <div className="overview-stats">
        <div className="stat-item">
          <span className="stat-number">{contractor.projectsCompleted}</span>
          <span className="stat-label">Projects Completed</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{contractor.teamSize}</span>
          <span className="stat-label">Team Size</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{contractor.experience}</span>
          <span className="stat-label">Experience</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{contractor.trustScore}</span>
          <span className="stat-label">Trust Score</span>
        </div>
      </div>

      <div className="overview-details">
        <div className="detail-section">
          <h4>Specializations</h4>
          <div className="tags">
            {contractor.specializations.map((spec, index) => (
              <span key={index} className="tag">{spec}</span>
            ))}
          </div>
        </div>

        <div className="detail-section">
          <h4>Working Areas</h4>
          <div className="tags">
            {contractor.workingAreas.map((area, index) => (
              <span key={index} className="tag location-tag">{area}</span>
            ))}
          </div>
        </div>

        <div className="detail-section">
          <h4>Languages</h4>
          <div className="tags">
            {contractor.languages.map((lang, index) => (
              <span key={index} className="tag language-tag">{lang}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDetails = () => (
    <div className="contractor-details">
      <div className="details-grid">
        <div className="detail-item">
          <span className="detail-label">Company Type:</span>
          <span className="detail-value">{contractor.companyType}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Established:</span>
          <span className="detail-value">{contractor.establishedYear}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Payment Terms:</span>
          <span className="detail-value">{contractor.paymentTerms}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Response Time:</span>
          <span className="detail-value">{contractor.responseTime}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Active Jobs:</span>
          <span className="detail-value">{contractor.activeJobs}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Safety Record:</span>
          <span className="detail-value">{contractor.safetyRecord}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Min Project Value:</span>
          <span className="detail-value">₹{contractor.minimumProjectValue.toLocaleString()}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Max Project Value:</span>
          <span className="detail-value">₹{contractor.maximumProjectValue.toLocaleString()}</span>
        </div>
      </div>

      <div className="verification-badges">
        <h4>Verifications</h4>
        <div className="badges">
          {contractor.verified && <span className="badge verified">✓ Profile Verified</span>}
          {contractor.bankVerified && <span className="badge verified">✓ Bank Verified</span>}
          {contractor.gstRegistered && <span className="badge verified">✓ GST Registered</span>}
          {contractor.panVerified && <span className="badge verified">✓ PAN Verified</span>}
          {contractor.insuranceCovered && <span className="badge verified">✓ Insurance Covered</span>}
          {contractor.equipmentOwned && <span className="badge verified">✓ Equipment Owned</span>}
        </div>
      </div>

      <div className="certifications">
        <h4>Certifications</h4>
        <div className="tags">
          {contractor.certifications.map((cert, index) => (
            <span key={index} className="tag cert-tag">{cert}</span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReviews = () => (
    <div className="contractor-reviews">
      <div className="reviews-summary">
        <div className="rating-overview">
          {renderStars(contractor.rating)}
          <span className="rating-text">{contractor.rating}/5.0</span>
          <span className="rating-count">({contractor.totalRatings} reviews)</span>
        </div>
      </div>
      
      <div className="reviews-placeholder">
        <p>Reviews and testimonials from {contractor.clientTestimonials} clients would be displayed here.</p>
        <p>Work photos: {contractor.workPhotos} available</p>
      </div>
    </div>
  );

  return (
    <div className="contractor-profile-modal">
      <div className="contractor-profile">
        <div className="profile-header">
          <button className="close-btn" onClick={onClose}>×</button>
          
          <div className="contractor-info">
            <div className="contractor-avatar">
              {contractor.name.split(' ').map(n => n[0]).join('')}
            </div>
            
            <div className="contractor-basic">
              <h2>{contractor.name}</h2>
              <p className="company">{contractor.company}</p>
              <p className="location">📍 {contractor.location}</p>
              <p className="last-active">Last active: {contractor.lastActive}</p>
              
              <div className="rating-info">
                {renderStars(contractor.rating)}
                <span className="rating-text">{contractor.rating}/5.0</span>
                <span className="rating-count">({contractor.totalRatings} reviews)</span>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <button className="contact-btn" onClick={() => onContact(contractor)}>
              📞 Contact
            </button>
            <button className="message-btn">
              💬 Message
            </button>
          </div>
        </div>

        <div className="profile-tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button 
            className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews
          </button>
        </div>

        <div className="profile-content">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'details' && renderDetails()}
          {activeTab === 'reviews' && renderReviews()}
        </div>

        <div className="profile-description">
          <h4>About</h4>
          <p>{contractor.description}</p>
        </div>
      </div>
    </div>
  );
};

export default ContractorProfile;