/**
 * Job Applications Service
 * 
 * Handles job application submissions to DynamoDB
 */

class JobApplicationsService {
  constructor() {
    this.apiUrl = import.meta.env.VITE_JOB_APPLICATIONS_API_URL || 'https://your-api-gateway-url.execute-api.ap-south-1.amazonaws.com/prod';
  }

  /**
   * Submit job application
   * @param {Object} applicationData - Application data
   * @returns {Promise<Object>} Response with success status
   */
  async submitApplication(applicationData) {
    try {
      console.log('📝 Submitting job application:', applicationData);

      const response = await fetch(`${this.apiUrl}/applications/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(applicationData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: Failed to submit application`);
      }

      console.log('✅ Application submitted successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error submitting application:', error);
      throw error;
    }
  }

  /**
   * Get applications for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} List of applications
   */
  async getUserApplications(userId) {
    try {
      const response = await fetch(`${this.apiUrl}/applications/user/${userId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch applications');
      }

      return result.applications || [];
    } catch (error) {
      console.error('Error fetching user applications:', error);
      throw error;
    }
  }

  /**
   * Get applications for a contractor/employer
   * @param {string} contractorId - Contractor ID
   * @returns {Promise<Array>} List of applications
   */
  async getContractorApplications(contractorId) {
    try {
      const response = await fetch(`${this.apiUrl}/applications/contractor/${contractorId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch applications');
      }

      return result.applications || [];
    } catch (error) {
      console.error('Error fetching contractor applications:', error);
      throw error;
    }
  }

  /**
   * Update application status
   * @param {string} applicationId - Application ID
   * @param {string} status - New status (pending, reviewed, accepted, rejected)
   * @param {string} contractorId - Contractor ID (for authorization)
   * @returns {Promise<Object>} Response with success status
   */
  async updateApplicationStatus(applicationId, status, contractorId) {
    try {
      const response = await fetch(`${this.apiUrl}/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          status,
          contractorId,
          updatedAt: new Date().toISOString()
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update application status');
      }

      return result;
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  }
}

export default new JobApplicationsService();