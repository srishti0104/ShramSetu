/**
 * Grievance API Utility
 * Handles all grievance-related API calls with voice-to-text support
 */

const GRIEVANCE_API_BASE = import.meta.env.VITE_GRIEVANCE_API_URL || '/api/v1/grievance';

/**
 * Submit a grievance
 * @param {Object} grievanceData - Grievance data
 * @param {string} grievanceData.category - Grievance category
 * @param {string} grievanceData.severity - Severity level
 * @param {string} grievanceData.description - Description text
 * @param {string} grievanceData.workerId - Worker ID (optional)
 * @param {string} grievanceData.location - Location (optional)
 * @param {string} grievanceData.contractorName - Contractor name (optional)
 * @param {boolean} grievanceData.isAnonymous - Anonymous submission
 * @param {string} grievanceData.contactNumber - Contact number (optional)
 * @param {string} grievanceData.source - Source of submission
 * @returns {Promise<Object>} API response
 */
export async function submitGrievance(grievanceData) {
  try {
    const response = await fetch(`${GRIEVANCE_API_BASE}/grievance/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        ...grievanceData,
        hasAudio: false // We're using voice-to-text, not audio files
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting grievance:', error);
    throw error;
  }
}

/**
 * Upload audio file to S3
 * @param {string} uploadUrl - Pre-signed S3 upload URL
 * @param {Blob} audioBlob - Audio blob data
 * @returns {Promise<boolean>} Success status
 */
export async function uploadAudio(uploadUrl, audioBlob) {
  try {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: audioBlob,
      headers: {
        'Content-Type': 'audio/webm',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to upload audio: ${response.status} ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error uploading audio:', error);
    throw error;
  }
}

/**
 * Start audio transcription
 * @param {string} grievanceId - Grievance ID
 * @param {string} submittedAt - Submission timestamp
 * @param {string} languageCode - Language code (e.g., 'hi-IN', 'en-US')
 * @returns {Promise<Object>} Transcription job details
 */
export async function startTranscription(grievanceId, submittedAt, languageCode = 'hi-IN') {
  try {
    const response = await fetch(`${GRIEVANCE_API_BASE}/grievance/process-audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        grievanceId,
        submittedAt,
        action: 'start',
        languageCode
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error starting transcription:', error);
    throw error;
  }
}

/**
 * Check transcription status
 * @param {string} grievanceId - Grievance ID
 * @param {string} submittedAt - Submission timestamp
 * @param {string} jobName - Transcription job name
 * @returns {Promise<Object>} Transcription status and result
 */
export async function checkTranscription(grievanceId, submittedAt, jobName) {
  try {
    const response = await fetch(`${GRIEVANCE_API_BASE}/grievance/process-audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        grievanceId,
        submittedAt,
        action: 'check',
        jobName
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking transcription:', error);
    throw error;
  }
}

/**
 * Get grievances list (for admin dashboard)
 * @param {Object} options - Query options
 * @param {string} options.status - Filter by status
 * @param {string} options.workerId - Filter by worker ID
 * @param {number} options.limit - Number of items to fetch
 * @param {string} options.lastKey - Last evaluation key for pagination
 * @returns {Promise<Object>} Grievances data
 */
export async function getGrievances(options = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (options.status) queryParams.append('status', options.status);
    if (options.workerId) queryParams.append('workerId', options.workerId);
    if (options.limit) queryParams.append('limit', options.limit);
    if (options.lastKey) queryParams.append('lastKey', options.lastKey);

    const url = `${GRIEVANCE_API_BASE}/grievance/list${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
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
    console.error('Error fetching grievances:', error);
    throw error;
  }
}

/**
 * Delete a grievance (admin only)
 * @param {string} grievanceId - Grievance ID
 * @param {string} submittedAt - Submission timestamp
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteGrievance(grievanceId, submittedAt) {
  try {
    const response = await fetch(`${GRIEVANCE_API_BASE}/grievance/${grievanceId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        submittedAt
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting grievance:', error);
    throw error;
  }
}