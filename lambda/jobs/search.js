/**
 * Lambda function for job search with geospatial filtering
 * 
 * @fileoverview City-bounded job search using Amazon Location Service
 * Implements matching algorithm: proximity 40%, skills 30%, trust 20%, wage 10%
 */

import crypto from 'crypto';

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude 1
 * @param {number} lon1 - Longitude 1
 * @param {number} lat2 - Latitude 2
 * @param {number} lon2 - Longitude 2
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get city boundaries (MOCK - in production, use Amazon Location Service)
 * @param {string} city - City name
 * @returns {Object} City boundaries
 */
function getCityBoundaries(city) {
  // MOCK: City boundaries for major Indian cities
  const boundaries = {
    'mumbai': {
      center: { lat: 19.0760, lon: 72.8777 },
      radius: 50 // km
    },
    'delhi': {
      center: { lat: 28.7041, lon: 77.1025 },
      radius: 50
    },
    'bangalore': {
      center: { lat: 12.9716, lon: 77.5946 },
      radius: 40
    },
    'pune': {
      center: { lat: 18.5204, lon: 73.8567 },
      radius: 35
    },
    'chennai': {
      center: { lat: 13.0827, lon: 80.2707 },
      radius: 40
    }
  };
  
  return boundaries[city.toLowerCase()] || boundaries['mumbai'];
}

/**
 * Search jobs in DynamoDB with geospatial filtering (MOCK)
 * @param {Object} searchCriteria - Search criteria
 * @returns {Promise<Object[]>}
 */
async function searchJobsInDB(searchCriteria) {
  console.log('[MOCK DynamoDB] Searching jobs:', searchCriteria);
  
  // MOCK: In production, query DynamoDB with GSI
  // const params = {
  //   TableName: 'shramik-setu-jobs',
  //   IndexName: 'city-status-index',
  //   KeyConditionExpression: 'city = :city AND #status = :status',
  //   FilterExpression: 'contains(skills, :skill)',
  //   ExpressionAttributeNames: {
  //     '#status': 'status'
  //   },
  //   ExpressionAttributeValues: {
  //     ':city': searchCriteria.city,
  //     ':status': 'active',
  //     ':skill': searchCriteria.skills?.[0]
  //   }
  // };
  // const result = await dynamodb.query(params).promise();
  // return result.Items;
  
  // Mock jobs data
  const mockJobs = [
    {
      jobId: 'job-1',
      title: 'Construction Worker',
      description: 'Need experienced construction workers for residential project',
      contractorId: 'contractor-1',
      contractorName: 'ABC Builders',
      city: searchCriteria.city || 'Mumbai',
      location: {
        address: 'Andheri East, Mumbai',
        coordinates: { lat: 19.1136, lon: 72.8697 }
      },
      skills: ['construction', 'masonry'],
      wageOffered: 600,
      wageType: 'daily',
      workersNeeded: 5,
      startDate: new Date(Date.now() + 86400000).toISOString(),
      duration: '3 months',
      status: 'active',
      contractorRating: 4.5,
      contractorTier: 'gold',
      createdAt: new Date().toISOString()
    },
    {
      jobId: 'job-2',
      title: 'Plumber',
      description: 'Plumbing work for commercial building',
      contractorId: 'contractor-2',
      contractorName: 'XYZ Contractors',
      city: searchCriteria.city || 'Mumbai',
      location: {
        address: 'Bandra West, Mumbai',
        coordinates: { lat: 19.0596, lon: 72.8295 }
      },
      skills: ['plumbing'],
      wageOffered: 700,
      wageType: 'daily',
      workersNeeded: 2,
      startDate: new Date(Date.now() + 172800000).toISOString(),
      duration: '1 month',
      status: 'active',
      contractorRating: 4.2,
      contractorTier: 'silver',
      createdAt: new Date().toISOString()
    },
    {
      jobId: 'job-3',
      title: 'Electrician',
      description: 'Electrical installation work',
      contractorId: 'contractor-3',
      contractorName: 'Power Solutions',
      city: searchCriteria.city || 'Mumbai',
      location: {
        address: 'Powai, Mumbai',
        coordinates: { lat: 19.1176, lon: 72.9060 }
      },
      skills: ['electrical'],
      wageOffered: 750,
      wageType: 'daily',
      workersNeeded: 3,
      startDate: new Date(Date.now() + 259200000).toISOString(),
      duration: '2 months',
      status: 'active',
      contractorRating: 4.8,
      contractorTier: 'platinum',
      createdAt: new Date().toISOString()
    },
    {
      jobId: 'job-4',
      title: 'Carpenter',
      description: 'Furniture making and installation',
      contractorId: 'contractor-4',
      contractorName: 'Wood Works',
      city: searchCriteria.city || 'Mumbai',
      location: {
        address: 'Goregaon East, Mumbai',
        coordinates: { lat: 19.1663, lon: 72.8526 }
      },
      skills: ['carpentry'],
      wageOffered: 650,
      wageType: 'daily',
      workersNeeded: 4,
      startDate: new Date(Date.now() + 345600000).toISOString(),
      duration: '1.5 months',
      status: 'active',
      contractorRating: 4.3,
      contractorTier: 'silver',
      createdAt: new Date().toISOString()
    },
    {
      jobId: 'job-5',
      title: 'Painter',
      description: 'Interior and exterior painting',
      contractorId: 'contractor-5',
      contractorName: 'Color Masters',
      city: searchCriteria.city || 'Mumbai',
      location: {
        address: 'Malad West, Mumbai',
        coordinates: { lat: 19.1864, lon: 72.8493 }
      },
      skills: ['painting'],
      wageOffered: 550,
      wageType: 'daily',
      workersNeeded: 6,
      startDate: new Date(Date.now() + 432000000).toISOString(),
      duration: '2 weeks',
      status: 'active',
      contractorRating: 4.0,
      contractorTier: 'bronze',
      createdAt: new Date().toISOString()
    }
  ];
  
  return mockJobs;
}

/**
 * Get worker profile from DynamoDB (MOCK)
 * @param {string} workerId - Worker ID
 * @returns {Promise<Object>}
 */
async function getWorkerProfile(workerId) {
  console.log('[MOCK DynamoDB] Getting worker profile:', workerId);
  
  // Mock worker profile
  return {
    userId: workerId,
    skills: ['construction', 'masonry', 'plumbing'],
    trustTier: 'silver',
    overallRating: 4.3,
    totalJobsCompleted: 25
  };
}

/**
 * Calculate job match score
 * Algorithm: proximity 40%, skills 30%, trust 20%, wage 10%
 * @param {Object} job - Job object
 * @param {Object} worker - Worker profile
 * @param {Object} workerLocation - Worker location
 * @returns {number} Match score (0-100)
 */
function calculateMatchScore(job, worker, workerLocation) {
  let score = 0;
  
  // Proximity score (40%)
  const distance = calculateDistance(
    workerLocation.lat,
    workerLocation.lon,
    job.location.coordinates.lat,
    job.location.coordinates.lon
  );
  const proximityScore = Math.max(0, 100 - (distance * 2)); // Decrease by 2 points per km
  score += (proximityScore * 0.4);
  
  // Skills match score (30%)
  const workerSkills = worker.skills || [];
  const jobSkills = job.skills || [];
  const matchingSkills = workerSkills.filter(skill => 
    jobSkills.some(js => js.toLowerCase().includes(skill.toLowerCase()))
  );
  const skillsScore = (matchingSkills.length / Math.max(jobSkills.length, 1)) * 100;
  score += (skillsScore * 0.3);
  
  // Trust tier score (20%)
  const tierScores = { platinum: 100, gold: 80, silver: 60, bronze: 40, unrated: 20 };
  const workerTierScore = tierScores[worker.trustTier] || 20;
  const contractorTierScore = tierScores[job.contractorTier] || 20;
  const trustScore = (workerTierScore + contractorTierScore) / 2;
  score += (trustScore * 0.2);
  
  // Wage score (10%)
  const wageScore = Math.min(100, (job.wageOffered / 10)); // Normalize wage
  score += (wageScore * 0.1);
  
  return Math.round(score);
}

/**
 * Calculate travel time using Amazon Location Service (MOCK)
 * @param {Object} from - Origin coordinates
 * @param {Object} to - Destination coordinates
 * @returns {Promise<number>} Travel time in minutes
 */
async function calculateTravelTime(from, to) {
  console.log('[MOCK Location Service] Calculating travel time');
  
  // MOCK: In production, use Amazon Location Service
  // const location = new AWS.Location();
  // const params = {
  //   CalculatorName: 'ShramikSetuRouteCalculator',
  //   DeparturePosition: [from.lon, from.lat],
  //   DestinationPosition: [to.lon, to.lat],
  //   TravelMode: 'Walking'
  // };
  // const result = await location.calculateRoute(params).promise();
  // return result.Summary.DurationSeconds / 60;
  
  // Mock calculation: ~3 km/hour walking speed
  const distance = calculateDistance(from.lat, from.lon, to.lat, to.lon);
  return Math.round((distance / 3) * 60); // minutes
}

/**
 * Lambda handler for job search
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} API Gateway response
 */
export async function handler(event) {
  const requestId = event.requestContext?.requestId || crypto.randomUUID();
  
  try {
    // Parse query parameters
    const params = event.queryStringParameters || {};
    const {
      city,
      latitude,
      longitude,
      skills,
      minWage,
      maxDistance,
      sortBy = 'match_score',
      limit = 50
    } = params;
    
    // Validate required parameters
    if (!city || !latitude || !longitude) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'INVALID_INPUT',
          message: 'City, latitude, and longitude are required',
          category: 'validation',
          severity: 'error',
          requestId,
          timestamp: new Date().toISOString()
        })
      };
    }
    
    const workerLocation = {
      lat: parseFloat(latitude),
      lon: parseFloat(longitude)
    };
    
    // Get city boundaries
    const cityBounds = getCityBoundaries(city);
    
    // Check if worker is within city boundaries
    const distanceFromCenter = calculateDistance(
      workerLocation.lat,
      workerLocation.lon,
      cityBounds.center.lat,
      cityBounds.center.lon
    );
    
    if (distanceFromCenter > cityBounds.radius) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'OUTSIDE_CITY_BOUNDS',
          message: `Location is outside ${city} city boundaries`,
          category: 'validation',
          severity: 'warning',
          requestId,
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Get worker profile from context (passed by authorizer)
    const workerId = event.requestContext?.authorizer?.userId;
    const worker = await getWorkerProfile(workerId);
    
    // Search jobs in database
    const searchCriteria = {
      city,
      skills: skills ? skills.split(',') : undefined,
      minWage: minWage ? parseFloat(minWage) : undefined,
      status: 'active'
    };
    
    let jobs = await searchJobsInDB(searchCriteria);
    
    // Filter by distance if specified
    if (maxDistance) {
      const maxDist = parseFloat(maxDistance);
      jobs = jobs.filter(job => {
        const dist = calculateDistance(
          workerLocation.lat,
          workerLocation.lon,
          job.location.coordinates.lat,
          job.location.coordinates.lon
        );
        return dist <= maxDist;
      });
    }
    
    // Calculate match scores and travel times
    const jobsWithScores = await Promise.all(
      jobs.map(async (job) => {
        const matchScore = calculateMatchScore(job, worker, workerLocation);
        const distance = calculateDistance(
          workerLocation.lat,
          workerLocation.lon,
          job.location.coordinates.lat,
          job.location.coordinates.lon
        );
        const travelTime = await calculateTravelTime(workerLocation, job.location.coordinates);
        
        return {
          ...job,
          matchScore,
          distance: Math.round(distance * 10) / 10, // Round to 1 decimal
          travelTime
        };
      })
    );
    
    // Sort jobs
    jobsWithScores.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return a.distance - b.distance;
        case 'wage':
          return b.wageOffered - a.wageOffered;
        case 'rating':
          return b.contractorRating - a.contractorRating;
        case 'match_score':
        default:
          return b.matchScore - a.matchScore;
      }
    });
    
    // Limit results
    const limitedJobs = jobsWithScores.slice(0, parseInt(limit));
    
    // Log audit trail
    console.log(`[AUDIT] Job search: ${workerId} in ${city} - ${limitedJobs.length} results at ${new Date().toISOString()}`);
    
    // Return success response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Jobs retrieved successfully',
        data: {
          jobs: limitedJobs,
          total: limitedJobs.length,
          searchCriteria: {
            city,
            location: workerLocation,
            skills: searchCriteria.skills,
            sortBy
          }
        },
        requestId,
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('[ERROR] Failed to search jobs:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Failed to search jobs. Please try again.',
        category: 'server_error',
        severity: 'critical',
        requestId,
        timestamp: new Date().toISOString()
      })
    };
  }
}
