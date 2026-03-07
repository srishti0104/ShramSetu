/**
 * Job Application Service
 * 
 * Handles job application submissions and retrieval
 * Version: 2.0 - Updated mock data with realistic job categories
 */

import notificationService from '../notificationService';

class ApplicationService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_JOB_APPLICATIONS_API_URL || 'https://sxainxmb4h.execute-api.ap-south-1.amazonaws.com/prod';
    this.version = '1.0';
    console.log('🔄 ApplicationService initialized - Version', this.version);
  }

  /**
   * Submit a job application
   * @param {Object} applicationData - Application data
   * @returns {Promise<Object>} Application result
   */
  async submitApplication(applicationData) {
    try {
      console.log('📝 Submitting job application:', applicationData);

      const response = await fetch(`${this.baseUrl}/applications/submit`, {
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
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
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

      const response = await fetch(`${this.baseUrl}/applications/contractor/${contractorId}`, {
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
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
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

      const response = await fetch(`${this.baseUrl}/applications/user/${userId}`, {
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
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
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
    // Try to get stored applications first
    const storedApplications = JSON.parse(localStorage.getItem('mock_applications') || '[]');
    
    // If we have stored applications, use them
    if (storedApplications.length > 0) {
      console.log('📊 Using stored applications:', storedApplications.length);
      const contractorApplications = storedApplications.filter(app => 
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
    
    // Otherwise use fresh mock data
    const mockApplications = this.getMockApplicationsData();
    
    console.log('📊 Generated mock applications:', mockApplications.length);
    console.log('📊 First application:', mockApplications[0]);
    
    // Filter by contractor ID
    const contractorApplications = mockApplications.filter(app => 
      app.contractorId === contractorId || contractorId === 'employer_demo_123'
    );

    console.log('📊 Filtered applications:', contractorApplications.length);

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

    console.log('📊 Applications by status:', {
      pending: applicationsByStatus.pending.length,
      reviewed: applicationsByStatus.reviewed.length,
      accepted: applicationsByStatus.accepted.length,
      rejected: applicationsByStatus.rejected.length
    });

    const result = {
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

    console.log('📊 Returning result with', result.applications.length, 'applications');
    
    return result;
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
   * Get mock applications data with realistic job categories
   */
  getMockApplicationsData() {
    const now = new Date();
    const yesterday = new Date(now - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now - 2 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000);

    return [
      {
        applicationId: 'app_001',
        jobId: 'job_construction_001',
        contractorId: 'employer_demo_123',
        applicantProfile: {
          userId: 'worker_001',
          name: 'राज कुमार सिंह',
          phoneNumber: '+91-9876543210',
          location: 'Jamshedpur, Jharkhand',
          experience: '8 years',
          skills: ['Construction', 'Masonry', 'Concrete Work', 'Brick Laying'],
          rating: 4.9,
          completedJobs: 78
        },
        jobDetails: {
          title: 'Construction Worker',
          location: 'Residential Project, Jamshedpur',
          wage: 500,
          wageType: 'daily'
        },
        status: 'pending',
        appliedAt: now.toISOString(),
        updatedAt: now.toISOString()
      },
      {
        applicationId: 'app_002',
        jobId: 'job_plumber_001',
        contractorId: 'employer_demo_123',
        applicantProfile: {
          userId: 'worker_002',
          name: 'सुनीता देवी',
          phoneNumber: '+91-9876543211',
          location: 'Jamshedpur, Jharkhand',
          experience: '5 years',
          skills: ['Plumbing', 'Pipe Installation', 'Leak Repair', 'Bathroom Fitting'],
          rating: 4.8,
          completedJobs: 45
        },
        jobDetails: {
          title: 'Plumber',
          location: 'Commercial Complex, Jamshedpur',
          wage: 420,
          wageType: 'daily'
        },
        status: 'reviewed',
        appliedAt: yesterday.toISOString(),
        updatedAt: now.toISOString()
      },
      {
        applicationId: 'app_003',
        jobId: 'job_electrician_001',
        contractorId: 'employer_demo_123',
        applicantProfile: {
          userId: 'worker_003',
          name: 'अमित कुमार',
          phoneNumber: '+91-9876543212',
          location: 'Ranchi, Jharkhand',
          experience: '6 years',
          skills: ['Electrical Work', 'Wiring', 'Circuit Installation', 'Maintenance'],
          rating: 4.7,
          completedJobs: 52
        },
        jobDetails: {
          title: 'Electrician',
          location: 'Industrial Area, Ranchi',
          wage: 450,
          wageType: 'daily'
        },
        status: 'accepted',
        appliedAt: twoDaysAgo.toISOString(),
        updatedAt: yesterday.toISOString()
      },
      {
        applicationId: 'app_004',
        jobId: 'job_carpenter_001',
        contractorId: 'employer_demo_123',
        applicantProfile: {
          userId: 'worker_004',
          name: 'रामेश्वर महतो',
          phoneNumber: '+91-9876543213',
          location: 'Bokaro, Jharkhand',
          experience: '10 years',
          skills: ['Carpentry', 'Furniture Making', 'Wood Work', 'Door & Window Installation'],
          rating: 4.9,
          completedJobs: 89
        },
        jobDetails: {
          title: 'Carpenter',
          location: 'Residential Project, Bokaro',
          wage: 480,
          wageType: 'daily'
        },
        status: 'pending',
        appliedAt: now.toISOString(),
        updatedAt: now.toISOString()
      },
      {
        applicationId: 'app_005',
        jobId: 'job_painter_001',
        contractorId: 'employer_demo_123',
        applicantProfile: {
          userId: 'worker_005',
          name: 'प्रिया शर्मा',
          phoneNumber: '+91-9876543214',
          location: 'Jamshedpur, Jharkhand',
          experience: '4 years',
          skills: ['Painting', 'Wall Finishing', 'Spray Painting', 'Color Mixing'],
          rating: 4.6,
          completedJobs: 38
        },
        jobDetails: {
          title: 'Painter',
          location: 'Office Building, Jamshedpur',
          wage: 380,
          wageType: 'daily'
        },
        status: 'rejected',
        appliedAt: threeDaysAgo.toISOString(),
        updatedAt: twoDaysAgo.toISOString()
      },
      {
        applicationId: 'app_006',
        jobId: 'job_welder_001',
        contractorId: 'employer_demo_123',
        applicantProfile: {
          userId: 'worker_006',
          name: 'विकास यादव',
          phoneNumber: '+91-9876543215',
          location: 'Jamshedpur, Jharkhand',
          experience: '7 years',
          skills: ['Welding', 'Metal Fabrication', 'Arc Welding', 'Gas Welding'],
          rating: 4.8,
          completedJobs: 65
        },
        jobDetails: {
          title: 'Welder',
          location: 'Steel Plant, Jamshedpur',
          wage: 550,
          wageType: 'daily'
        },
        status: 'accepted',
        appliedAt: twoDaysAgo.toISOString(),
        updatedAt: yesterday.toISOString()
      },
      {
        applicationId: 'app_007',
        jobId: 'job_mason_001',
        contractorId: 'employer_demo_123',
        applicantProfile: {
          userId: 'worker_007',
          name: 'गीता कुमारी',
          phoneNumber: '+91-9876543216',
          location: 'Dhanbad, Jharkhand',
          experience: '5 years',
          skills: ['Masonry', 'Tile Work', 'Plastering', 'Stone Work'],
          rating: 4.7,
          completedJobs: 42
        },
        jobDetails: {
          title: 'Mason',
          location: 'Housing Project, Dhanbad',
          wage: 420,
          wageType: 'daily'
        },
        status: 'reviewed',
        appliedAt: yesterday.toISOString(),
        updatedAt: now.toISOString()
      },
      {
        applicationId: 'app_008',
        jobId: 'job_helper_001',
        contractorId: 'employer_demo_123',
        applicantProfile: {
          userId: 'worker_008',
          name: 'संजय कुमार',
          phoneNumber: '+91-9876543217',
          location: 'Jamshedpur, Jharkhand',
          experience: '2 years',
          skills: ['General Labor', 'Material Handling', 'Site Cleaning', 'Assistance'],
          rating: 4.5,
          completedJobs: 25
        },
        jobDetails: {
          title: 'Construction Helper',
          location: 'Multiple Sites, Jamshedpur',
          wage: 320,
          wageType: 'daily'
        },
        status: 'pending',
        appliedAt: now.toISOString(),
        updatedAt: now.toISOString()
      }
    ];
  }
}

export default new ApplicationService();