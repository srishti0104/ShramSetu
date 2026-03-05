/**
 * RatingForm Component
 * Allows users to submit ratings with category-specific feedback
 */

import { useState } from 'react';
import { submitRating } from '../../utils/ratingsApi';
import './RatingForm.css';

const RatingForm = ({ jobId, raterId, rateeId, raterType, rateeName, onSuccess, onCancel }) => {
  const [overallScore, setOverallScore] = useState(0);
  const [categoryScores, setCategoryScores] = useState({});
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Rating categories based on rater type
  const categories = raterType === 'worker' ? {
    payment_timeliness: 'भुगतान समय / Payment Timeliness',
    work_conditions: 'कार्य स्थितियाँ / Work Conditions',
    communication: 'संवाद / Communication',
    fairness: 'निष्पक्षता / Fairness',
    respect: 'सम्मान / Respect'
  } : {
    punctuality: 'समयनिष्ठा / Punctuality',
    quality: 'गुणवत्ता / Quality',
    professionalism: 'व्यावसायिकता / Professionalism',
    communication: 'संवाद / Communication',
    reliability: 'विश्वसनीयता / Reliability'
  };

  // Predefined tags
  const availableTags = raterType === 'worker' ? [
    'समय पर भुगतान / Timely Payment',
    'अच्छा व्यवहार / Good Behavior',
    'स्पष्ट निर्देश / Clear Instructions',
    'सुरक्षित वातावरण / Safe Environment',
    'निष्पक्ष / Fair'
  ] : [
    'समय पर / On Time',
    'कुशल / Skilled',
    'मेहनती / Hardworking',
    'विश्वसनीय / Reliable',
    'पेशेवर / Professional'
  ];

  const handleOverallScoreChange = (score) => {
    setOverallScore(score);
    // Auto-fill category scores if not set
    if (Object.keys(categoryScores).length === 0) {
      const autoScores = {};
      Object.keys(categories).forEach(cat => {
        autoScores[cat] = score;
      });
      setCategoryScores(autoScores);
    }
  };

  const handleCategoryScoreChange = (category, score) => {
    setCategoryScores(prev => ({
      ...prev,
      [category]: score
    }));
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (overallScore === 0) {
      setError('कृपया रेटिंग चुनें / Please select a rating');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const ratingData = {
        jobId,
        raterId,
        rateeId,
        raterType,
        score: overallScore,
        feedback: {
          categories: categoryScores,
          comment,
          tags: selectedTags
        }
      };

      const result = await submitRating(ratingData);
      
      if (onSuccess) {
        onSuccess(result);
      }

    } catch (err) {
      setError(err.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (score, onChange, category = null) => {
    return (
      <div className="star-rating" role="radiogroup" aria-label={category || 'Overall rating'}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            className={`star ${star <= score ? 'filled' : ''}`}
            onClick={() => onChange(star)}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            aria-checked={star === score}
            role="radio"
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="rating-form">
      <div className="rating-form-header">
        <h2>रेटिंग दें / Submit Rating</h2>
        <p className="rating-form-subtitle">
          {rateeName} को रेट करें / Rate {rateeName}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Overall Rating */}
        <div className="form-section">
          <label className="section-label">
            समग्र रेटिंग / Overall Rating <span className="required">*</span>
          </label>
          {renderStars(overallScore, handleOverallScoreChange)}
          {overallScore > 0 && (
            <p className="rating-description">
              {overallScore === 5 && '🌟 उत्कृष्ट / Excellent'}
              {overallScore === 4 && '😊 बहुत अच्छा / Very Good'}
              {overallScore === 3 && '👍 अच्छा / Good'}
              {overallScore === 2 && '😐 ठीक / Fair'}
              {overallScore === 1 && '😞 खराब / Poor'}
            </p>
          )}
        </div>

        {/* Category Ratings */}
        <div className="form-section">
          <label className="section-label">
            विस्तृत रेटिंग / Detailed Ratings
          </label>
          <div className="category-ratings">
            {Object.entries(categories).map(([key, label]) => (
              <div key={key} className="category-item">
                <span className="category-label">{label}</span>
                {renderStars(
                  categoryScores[key] || 0,
                  (score) => handleCategoryScoreChange(key, score),
                  label
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="form-section">
          <label className="section-label">
            टैग / Tags
          </label>
          <div className="tags-container">
            {availableTags.map(tag => (
              <button
                key={tag}
                type="button"
                className={`tag-button ${selectedTags.includes(tag) ? 'selected' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="form-section">
          <label htmlFor="comment" className="section-label">
            टिप्पणी / Comment (वैकल्पिक / Optional)
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="अपना अनुभव साझा करें / Share your experience..."
            rows="4"
            maxLength="500"
          />
          <span className="char-count">{comment.length}/500</span>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message" role="alert">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="form-actions">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn-cancel"
              disabled={loading}
            >
              रद्द करें / Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn-submit"
            disabled={loading || overallScore === 0}
          >
            {loading ? 'जमा हो रहा है... / Submitting...' : 'रेटिंग जमा करें / Submit Rating'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RatingForm;

