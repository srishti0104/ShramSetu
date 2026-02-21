/**
 * Lambda Function: Get Trust Profile
 * Retrieves complete trust profile for a user
 * 
 * @param {Object} event - API Gateway event
 * @param {string} event.pathParameters.userId - User ID
 * @returns {Object} Trust profile with ratings history
 */

// MOCK: In production, uncomment AWS SDK imports
// const { DynamoDBClient, GetItemCommand, QueryCommand } = require('@aws-sdk/client-dynamodb');
// const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

// MOCK: Initialize clients
// const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION });

/**
 * Generate mock trust profile
 */
function generateMockProfile(userId) {
  const tiers = ['bronze', 'silver', 'gold', 'platinum'];
  const tier = tiers[Math.floor(Math.random() * tiers.length)];
  const totalRatings = Math.floor(Math.random() * 80) + 20;
  const averageRating = 3 + Math.random() * 2; // 3.0-5.0

  return {
    userId,
    userType: 'worker',
    tier,
    averageRating: parseFloat(averageRating.toFixed(2)),
    totalRatings,
    categoryAverages: {
      punctuality: parseFloat((3.5 + Math.random() * 1.5).toFixed(2)),
      quality: parseFloat((3.5 + Math.random() * 1.5).toFixed(2)),
      professionalism: parseFloat((3.5 + Math.random() * 1.5).toFixed(2)),
      communication: parseFloat((3.5 + Math.random() * 1.5).toFixed(2)),
      reliability: parseFloat((3.5 + Math.random() * 1.5).toFixed(2))
    },
    distribution: {
      1: Math.floor(totalRatings * 0.02),
      2: Math.floor(totalRatings * 0.05),
      3: Math.floor(totalRatings * 0.15),
      4: Math.floor(totalRatings * 0.38),
      5: Math.floor(totalRatings * 0.40)
    },
    badges: [
      {
        id: 'reliable',
        name: 'विश्वसनीय / Reliable',
        icon: '⏰',
        earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'quality_expert',
        name: 'गुणवत्ता विशेषज्ञ / Quality Expert',
        icon: '⭐',
        earnedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    trend: 'improving',
    recentAverage: parseFloat((averageRating + 0.2).toFixed(2)),
    lastUpdated: new Date().toISOString(),
    nextTier: tier === 'platinum' ? null : tiers[tiers.indexOf(tier) + 1],
    progressToNextTier: Math.floor(Math.random() * 100),
    stats: {
      jobsCompleted: totalRatings + Math.floor(Math.random() * 20),
      responseRate: parseFloat((85 + Math.random() * 15).toFixed(1)),
      completionRate: parseFloat((90 + Math.random() * 10).toFixed(1)),
      repeatClients: Math.floor(totalRatings * 0.3)
    }
  };
}

/**
 * Generate mock recent ratings
 */
function generateMockRatings(userId, count = 10) {
  const ratings = [];
  
  for (let i = 0; i < count; i++) {
    ratings.push({
      ratingId: `rating_${Date.now()}_${i}`,
      jobId: `job_${Math.floor(Math.random() * 10000)}`,
      raterId: `user_${Math.floor(Math.random() * 1000)}`,
      rateeId: userId,
      raterType: Math.random() > 0.5 ? 'contractor' : 'worker',
      score: Math.floor(Math.random() * 2) + 4, // 4-5 for demo
      feedback: {
        categories: {
          punctuality: Math.floor(Math.random() * 2) + 4,
          quality: Math.floor(Math.random() * 2) + 4,
          communication: Math.floor(Math.random() * 2) + 4
        },
        comment: 'Great work! Very professional and reliable.',
        tags: ['professional', 'reliable', 'skilled']
      },
      timestamp: new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000).toISOString(),
      verified: true
    });
  }
  
  return ratings;
}

exports.handler = async (event) => {
  try {
    const userId = event.pathParameters?.userId;
    const includeRatings = event.queryStringParameters?.includeRatings === 'true';
    const limit = parseInt(event.queryStringParameters?.limit || '10');

    if (!userId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Missing userId parameter'
        })
      };
    }

    // MOCK: Fetch trust profile from DynamoDB
    // In production, uncomment this:
    /*
    const profileParams = {
      TableName: process.env.TRUST_PROFILES_TABLE,
      Key: marshall({ userId })
    };
    const profileResult = await dynamodb.send(new GetItemCommand(profileParams));
    
    if (!profileResult.Item) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Trust profile not found' })
      };
    }
    
    const trustProfile = unmarshall(profileResult.Item).trustProfile;
    */

    // MOCK: Generate mock profile
    const trustProfile = generateMockProfile(userId);
    console.log('MOCK: Retrieved trust profile from DynamoDB');

    let recentRatings = [];
    if (includeRatings) {
      // MOCK: Fetch recent ratings from DynamoDB
      // In production, uncomment this:
      /*
      const ratingsParams = {
        TableName: process.env.RATINGS_TABLE,
        IndexName: 'RateeIdIndex',
        KeyConditionExpression: 'rateeId = :userId',
        ExpressionAttributeValues: marshall({
          ':userId': userId
        }),
        Limit: limit,
        ScanIndexForward: false // Most recent first
      };
      const ratingsResult = await dynamodb.send(new QueryCommand(ratingsParams));
      recentRatings = ratingsResult.Items.map(item => unmarshall(item));
      */

      // MOCK: Generate mock ratings
      recentRatings = generateMockRatings(userId, limit);
      console.log(`MOCK: Retrieved ${recentRatings.length} recent ratings`);
    }

    // Calculate tier benefits
    const tierBenefits = getTierBenefits(trustProfile.tier);

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        profile: {
          ...trustProfile,
          tierBenefits
        },
        recentRatings: includeRatings ? recentRatings : undefined
      })
    };

  } catch (error) {
    console.error('Error fetching trust profile:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to fetch trust profile',
        message: error.message
      })
    };
  }
};

/**
 * Get benefits for each tier
 */
function getTierBenefits(tier) {
  const benefits = {
    bronze: [
      'Basic profile visibility',
      'Standard job applications',
      'Community support access'
    ],
    silver: [
      'Enhanced profile visibility',
      'Priority in job matching (20% boost)',
      'Verified badge',
      'Monthly performance reports'
    ],
    gold: [
      'Premium profile visibility',
      'Priority in job matching (40% boost)',
      'Gold verified badge',
      'Weekly performance reports',
      'Featured in top searches',
      'Access to premium jobs'
    ],
    platinum: [
      'Maximum profile visibility',
      'Highest priority in job matching (60% boost)',
      'Platinum verified badge',
      'Daily performance reports',
      'Featured in all searches',
      'Exclusive access to premium jobs',
      'Dedicated support',
      'Early access to new features'
    ]
  };

  return benefits[tier] || benefits.bronze;
}

// Export for testing
exports.getTierBenefits = getTierBenefits;
