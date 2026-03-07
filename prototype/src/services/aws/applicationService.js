/**
 * Job Application Service
 * 
 * Handles job application submissions and retrieval
 */

import notificationService from '../notificationService';

class ApplicationService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://your-api-gateway-url.amazonaws.com/prod';
  }

  /**
   * Submit a job application
   * @param {Object} applicationData - Application data
   * @returns {Promise<Object>} Application result
   */
  async submitApplication(applicationData) {
    try {
      console.log('📝 Submitting job application:', applicationData);

      const response = await fetch(`${this.baseUrl}/job-applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(applicationData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit application');
      }

      console.log('✅ Application submitted successfully:', result);
      
      // Create notification for employer
      notificationService.createJobApplicationNotification({
        applicationId: result.applicationId,
        ...applicationData
      });
      
      return result;

    } catch (error) {
      console.error('❌ Application submission error:', error);
      
      // For demo purposes, return mock success if API is not available
      if (error.message.includes('fetch')) {
        console.log('🔄 API not available, using mock response');
        return this.mockSubmitApplication(applicationData);
      }
      
      throw error;
    }
  }

  /**
   * Get applications for a contractor (employer)
   * @param {string} contractorId - Contractor ID
   * @returns {Promise<Object>} Applications data
   */
  async getContractorApplications(contractorId) {
    try {
      console.log('📋 Fetching applications for contractor:', contractorId);

      const response = await fetch(`${this.baseUrl}/job-applications/contractor/${contractorId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch applications');
      }

      console.log('✅ Applications fetched successfully:', result);
      return result;

    } catch (error) {
      console.error('❌ Error fetching applications:', error);
      
      // For demo purposes, return mock data if API is not available
      if (error.message.includes('fetch')) {
        console.log('🔄 API not available, using mock data');
        return this.mockGetContractorApplications(contractorId);
      }
      
      throw error;
    }
  }

  /**
   * Get applications for a user (worker)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Applications data
   */
  async getUserApplications(userId) {
    try {
      console.log('📋 Fetching applications for user:', userId);

      const response = await fetch(`${this.baseUrl}/job-applications/user/${userId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch applications');
      }

      console.log('✅ User applications fetched successfully:', result);
      return result;

    } catch (error) {
      console.error('❌ Error fetching user applications:', error);
      
      // For demo purposes, return mock data if API is not available
      if (error.message.includes('fetch')) {
        console.log('🔄 API not available, using mock data');
        return this.mockGetUserApplications(userId);
      }
      
      throw error;
    }
  }

  /**
   * Mock application submission for demo
   */
  mockSubmitApplication(applicationData) {
    const applicationId = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    // Store in localStorage for demo persistence
    const existingApplications = JSON.parse(localStorage.getItem('mock_applications') || '[]');
    const newApplication = {
      applicationId,
      ...applicationData,
      status: 'pending',
      appliedAt: timestamp,
      updatedAt: timestamp
    };
    
    existingApplications.push(newApplication);
    localStorage.setItem('mock_applications', JSON.stringify(existingApplications));

    // Create notification for employer
    notificationService.createJobApplicationNotification({
      applicationId,
      ...applicationData
    });

    return {
      success: true,
      message: 'Application submitted successfully (Mock)',
      applicationId,
      status: 'pending',
      appliedAt: timestamp
    };
  }

  /**
   * Mock contractor applications for demo
   */
  mockGetContractorApplications(contractorId) {
    // Get stored applications or use default mock data
    const storedApplications = JSON.parse(localStorage.getItem('mock_applications') || '[]');
    const mockApplications = this.getMockApplicationsData();
    
    // Combine stored and mock applications
    const allApplications = [...storedApplications, ...mockApplications];
    
    // Filter by contractor ID
    const contractorApplications = allApplications.filter(app => 
      app.contractorId === contractorId || contractorId === 'employer_demo_123'
    );

    // Group by status
    const applicationsByStatus = {
      pending: [],
      reviewed: [],
      accepted: [],
      rejected: []
    };

    contractorApplications.forEach(app => {
      const status = app.status || 'pending';
      if (applicationsByStatus[status]) {
        applicationsByStatus[status].push(app);
      }
    });

    return {
      success: true,
      applications: contractorApplications,
      applicationsByStatus,
      count: contractorApplications.length,
      summary: {
        total: contractorApplications.length,
        pending: applicationsByStatus.pending.length,
        reviewed: applicationsByStatus.reviewed.length,
        accepted: applicationsByStatus.accepted.length,
        rejected: applicationsByStatus.rejected.length
      }
    };
  }

  /**
   * Mock user applications for demo
   */
  mockGetUserApplications(userId) {
    const storedApplications = JSON.parse(localStorage.getItem('mock_applications') || '[]');
    const userApplications = storedApplications.filter(app => 
      app.applicantProfile?.userId === userId || 
      app.applicantProfile?.phoneNumber === userId
    );

    return {
      success: true,
      applications: userApplications,
      count: userApplications.length
    };
  }

  /**
   * Get mock applications data focused on Jamshedpur/Jharkhand
   */
  getMockApplicationsData() {
    return [
      {
        applicationId: 'app_001',
        jobId: 'job_steel_001',
        contractorId: 'employer_demo_123',
        applicantProfile: {
          userId: 'worker_001',
          name: 'राज कुमार सिंह',
          phoneNumber: '+91-9876543210',
          location: 'Jamshedpur, Jharkhand',
          experience: '8 years',
          skills: ['Steel Fabrication', 'Welding', 'Heavy Machinery'],
          rating: 4.9,
          completedJobs: 78
        },
        jobDetails: {
          title: 'Steel Worker',
          location: 'Tata Steel Plant, Jamshedpur',
          wage: 500,
          wageType: 'daily'
        },
        status: 'pending',
        appliedAt: '2024-03-07T08:30:00Z',
        updatedAt: '2024-03-07T08:30:00Z'
      },
      {
        applicationId: 'app_002',
        jobId: 'job_electrical_001',
        contractorId: 'employer_demo_123',
        applicantProfile: {
          userId: 'worker_002',
          name: 'सुनीता देवी',
          phoneNumber: '+91-9876543211',
          location: 'Jamshedpur, Jharkhand',
          experience: '5 years',
          skills: ['Industrial Wiring', 'Circuit Installation', 'Maintenance'],
          rating: 4.8,
          completedJobs: 45
        },
        jobDetails: {
          title: 'Electrical Technician',
          location: 'Industrial Area, Jamshedpur',
          wage: 420,
          wageType: 'daily'
        },
        status: 'reviewed',
        appliedAt: '2024-03-06T14:15:00Z',
        updatedAt: '2024-03-07T09:00:00Z'
      },
      {
        applicationId: 'app_003',
        jobId: 'job_construction_001',
        contractorId: 'employer_demo_123',
        applicantProfile: {
          userId: 'worker_003',
          name: 'अमित कुमार',
          phoneNumber: '+91-9876543212',
          location: 'Ranchi, Jharkhand',
          experience: '6 years',
          skills: ['Construction', 'Masonry', 'Concrete Work'],
          rating: 4.7,
          completedJobs: 52
        },
        jobDetails: {
          title: 'Construction Worker',
          location: 'Residential Project, Ranchi',
          wage: 380,
          wageType: 'daily'
        },
        status: 'accepted',
        appliedAt: '2024-03-05T11:45:00Z',
        updatedAt: '2024-03-06T16:30:00Z'
      },
      {
        applicationId: 'app_004',
        jobId: 'job_mining_001',
        contractorId: 'employer_demo_123',
        applicantProfile: {
          userId: 'worker_004',
          name: 'रामेश्वर महतो',
          phoneNumber: '+91-9876543213',
          location: 'Bokaro, Jharkhand',
          experience: '10 years',
          skills: ['Mining Operations', 'Heavy Equipment', 'Safety Management'],
          rating: 4.9,
          completedJobs: 89
        },
        jobDetails: {
          title: 'Mining Technician',
          location: 'Coal Mine, Bokaro',
          wage: 600,
          wageType: 'daily'
        },
        status: 'pending',
        appliedAt: '2024-03-07T07:20:00Z',
        updatedAt: '2024-03-07T07:20:00Z'
      },
      {
        applicationId: 'app_005',
        jobId: 'job_plumber_001',
        contractorId: 'employer_demo_123',
        applicantProfile: {
          userId: 'worker_005',
          name: 'प्रिया शर्मा',
          phoneNumber: '+91-9876543214',
          location: 'Jamshedpur, Jharkhand',
          experience: '4 years',
          skills: ['Pipe Installation', 'Leak Repair', 'Bathroom Fitting'],
          rating: 4.6,
          completedJobs: 38
        },
        jobDetails: {
          title: 'Plumber',
          location: 'Residential Complex, Jamshedpur',
          wage: 320,
          wageType: 'daily'
        },
        status: 'rejected',
        appliedAt: '2024-03-04T16:10:00Z',
        updatedAt: '2024-03-05T10:15:00Z'
      }
    ];
  }
}

export default new ApplicationService();