/**
 * Get Contractor Jobs Lambda Function
 * Returns mock jobs for a contractor
 */

exports.handler = async (event) => {
  console.log('Get Contractor Jobs Event:', JSON.stringify(event, null, 2));

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { contractorId } = event.queryStringParameters || {};

    if (!contractorId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'contractorId is required'
        })
      };
    }

    // Return mock jobs data
    const mockJobs = [
      {
        jobId: 'job-001',
        title: 'Construction Worker Needed',
        description: 'Need experienced construction workers for residential project in Andheri',
        contractorId: contractorId,
        category: 'Construction',
        location: 'Andheri East, Mumbai',
        city: 'Mumbai',
        state: 'Maharashtra',
        workersNeeded: 5,
        wageOffered: 600,
        wageType: 'daily',
        duration: '3 months',
        startDate: new Date(Date.now() + 86400000).toISOString(),
        status: 'active',
        postedAt: Date.now() - 86400000,
        skills: ['construction', 'masonry'],
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        jobId: 'job-002',
        title: 'Plumber Required',
        description: 'Plumbing work for commercial building renovation',
        contractorId: contractorId,
        category: 'Plumbing',
        location: 'Bandra West, Mumbai',
        city: 'Mumbai',
        state: 'Maharashtra',
        workersNeeded: 2,
        wageOffered: 700,
        wageType: 'daily',
        duration: '1 month',
        startDate: new Date(Date.now() + 172800000).toISOString(),
        status: 'active',
        postedAt: Date.now() - 172800000,
        skills: ['plumbing'],
        createdAt: new Date(Date.now() - 172800000).toISOString()
      },
      {
        jobId: 'job-003',
        title: 'Electrician Needed',
        description: 'Electrical installation work for new office building',
        contractorId: contractorId,
        category: 'Electrical',
        location: 'Powai, Mumbai',
        city: 'Mumbai',
        state: 'Maharashtra',
        workersNeeded: 3,
        wageOffered: 750,
        wageType: 'daily',
        duration: '2 months',
        startDate: new Date(Date.now() + 259200000).toISOString(),
        status: 'active',
        postedAt: Date.now() - 259200000,
        skills: ['electrical'],
        createdAt: new Date(Date.now() - 259200000).toISOString()
      },
      {
        jobId: 'job-004',
        title: 'Carpenter Required',
        description: 'Furniture making and installation for residential project',
        contractorId: contractorId,
        category: 'Carpentry',
        location: 'Goregaon East, Mumbai',
        city: 'Mumbai',
        state: 'Maharashtra',
        workersNeeded: 4,
        wageOffered: 650,
        wageType: 'daily',
        duration: '1.5 months',
        startDate: new Date(Date.now() + 345600000).toISOString(),
        status: 'active',
        postedAt: Date.now() - 345600000,
        skills: ['carpentry'],
        createdAt: new Date(Date.now() - 345600000).toISOString()
      },
      {
        jobId: 'job-005',
        title: 'Painter Needed',
        description: 'Interior and exterior painting for residential complex',
        contractorId: contractorId,
        category: 'Painting',
        location: 'Malad West, Mumbai',
        city: 'Mumbai',
        state: 'Maharashtra',
        workersNeeded: 6,
        wageOffered: 550,
        wageType: 'daily',
        duration: '2 weeks',
        startDate: new Date(Date.now() + 432000000).toISOString(),
        status: 'active',
        postedAt: Date.now() - 432000000,
        skills: ['painting'],
        createdAt: new Date(Date.now() - 432000000).toISOString()
      }
    ];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        jobs: mockJobs,
        count: mockJobs.length
      })
    };

  } catch (error) {
    console.error('Error fetching contractor jobs:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to fetch contractor jobs',
        message: error.message
      })
    };
  }
};
