/**
 * Jobs API Service
 * 
 * @fileoverview API service for job management
 */

import apiClient from './apiClient';

// Use Lambda API Gateway URL in production, local server in development
const JOBS_API_URL = import.meta.env.VITE_JOBS_API_URL || 'http://localhost:3003';

console.log('Jobs API URL:', JOBS_API_URL);

/**
 * Jobs API Service
 */
class JobsAPI {
  /**
   * Create a new job posting
   * @param {Object} jobData - Job data
   * @returns {Promise<Object>} Created job details
   */
  async createJob(jobData) {
    try {
      console.log('🔵 Creating job with URL:', JOBS_API_URL);
      console.log('🔵 Job data:', jobData);
      
      const response = await fetch(`${JOBS_API_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData)
      });

      console.log('🔵 Response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('🔴 Server error:', error);
        throw new Error(error.message || 'Failed to create job');
      }

      const result = await response.json();
      console.log('✅ Job created successfully:', result);
      return result;
    } catch (error) {
      console.error('🔴 Error creating job:', error);
      console.error('🔴 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Get job details by ID
   * @param {string} jobId - Job ID
   * @returns {Promise<Object>} Job details
   */
  async getJob(jobId) {
    try {
      const response = await fetch(`${JOBS_API_URL}/jobs/${jobId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch job');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching job:', error);
      throw error;
    }
  }

  /**
   * Get jobs posted by a contractor
   * @param {string} contractorId - Contractor ID
   * @returns {Promise<Object>} Jobs list
   */
  async getContractorJobs(contractorId) {
    try {
      const response = await fetch(`${JOBS_API_URL}/jobs?contractorId=${contractorId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch contractor jobs');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching contractor jobs:', error);
      throw error;
    }
  }

  /**
   * Search for jobs
   * @param {Object} params - Search parameters
   * @returns {Promise<Object>} Search results
   */
  async searchJobs(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${JOBS_API_URL}/jobs/search?${queryString}`);
      
      if (!response.ok) {
        throw new Error('Failed to search jobs');
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching jobs:', error);
      throw error;
    }
  }

  /**
   * Update job status
   * @param {string} jobId - Job ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated job
   */
  async updateJobStatus(jobId, status) {
    try {
      const response = await fetch(`${JOBS_API_URL}/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update job status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating job status:', error);
      throw error;
    }
  }
}

// Create singleton instance
const jobsAPI = new JobsAPI();

export default jobsAPI;
export { JobsAPI };
