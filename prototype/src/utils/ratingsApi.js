/**
 * Ratings API Utility
 * Handles all rating-related API calls
 */

const RATINGS_API_BASE = import.meta.env.VITE_RATINGS_API_URL || '/api/v1/ratings';

/**
 * Submit a rating
 * @param {Object} ratingData - Rating data
 * @param {string} ratingData.jobId - Job ID
 * @param {string} ratingData.raterId - Rater user ID
 * @param {string} ratingData.rateeId - Ratee user ID
 * @param {string} ratingData.raterType - 'worker' or 'employer'
 * @param {number} ratingData.score - Overall score (1-5)
 * @param {Object} ratingData.feedback - Feedback object
 * @returns {Promise<Object>} API response
 */
export async function submitRating(ratingData) {
  try {
    const response = await fetch(`${RATINGS_API_BASE}/ratings/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(ratingData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting rating:', error);
    throw error;
  }
}

/**
 * Get user trust profile
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Trust profile data
 */
export async function getUserTrustProfile(userId) {
  try {
    const response = await fetch(`${RATINGS_API_BASE}/ratings/profile/${userId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching trust profile:', error);
    throw error;
  }
}

/**
 * Get ratings for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of ratings to fetch
 * @param {string} options.lastKey - Last evaluation key for pagination
 * @returns {Promise<Object>} Ratings data
 */
export async function getUserRatings(userId, options = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (options.limit) queryParams.append('limit', options.limit);
    if (options.lastKey) queryParams.append('lastKey', options.lastKey);

    const url = `${RATINGS_API_BASE}/ratings/user/${userId}/ratings${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user ratings:', error);
    throw error;
  }
}

/**
 * Get ratings statistics for evaluation
 * @param {string} userId - User ID
 * @param {string} userType - 'worker' or 'employer'
 * @returns {Promise<Object>} Rating statistics
 */
export async function getRatingStatistics(userId, userType) {
  try {
    const response = await fetch(`${RATINGS_API_BASE}/ratings/statistics/${userId}?type=${userType}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching rating statistics:', error);
    throw error;
  }
}