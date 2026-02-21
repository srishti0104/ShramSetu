/**
 * Lambda Function: Calculate Trust Tier
 * Calculates trust tier based on rating history and performance metrics
 * Triggered by EventBridge when new rating is submitted
 * 
 * Trust Tiers:
 * - Bronze: 0-2.9 average, < 10 ratings
 * - Silver: 3.0-3.9 average, >= 10 ratings
 * - Gold: 4.0-4.4 average, >= 25 ratings
 * - Platinum: 4.5-5.0 average, >= 50 ratings
 * 
 * @param {Object} event - EventBridge event
 * @returns {Object} Updated trust profile
 */

// MOCK: In production, uncomment AWS SDK imports
// const { DynamoDBClient, QueryCommand, GetItemCommand, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
// const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

// MOCK: Initialize clients
// const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION });

// Trust tier thresholds
const TIER_THRESHOLDS = {
  platinum: { minAverage: 4.5, minRatings: 50 },
  gold: { minAverage: 4.0, minRatings: 25 },
  silver: { minAverage: 3.0, minRatings: 10 },
  bronze: { minAverage: 0, minRatings: 0 }
};

// Badge criteria
const BADGE_CRITERIA = {
  reliable: { minRatings: 20, minPunctuality: 4.5 },
  quality_expert: { minRatings: 30, minQuality: 4.5 },
  communicator: { minRatings: 15, minCommunication: 4.5 },
  fair_employer: { minRatings: 20, minFairness: 4.5 },
  timely_payer: { minRatings: 25, minPaymentTimeliness: 4.5 }
};

/**
 * Fetch all ratings for a user
 */
async function fetchUserRatings(userId) {
  // MOCK: In production, query DynamoDB
  /*
  const params = {
    TableName: process.env.RATINGS_TABLE,
    IndexName: 'RateeIdIndex',
    KeyConditionExpression: 'rateeId = :userId',
    ExpressionAttributeValues: marshall({
      ':userId': userId
    })
  };
  const result = await dynamodb.send(new QueryCommand(params));
  return result.Items.map(item => unmarshall(item));
  */
  
  // MOCK: Generate sample ratings
  const ratings = [];
  const numRatings = Math.floor(Math.random() * 60) + 10;
  
  for (let i = 0; i < numRatings; i++) {
    ratings.push({
      ratingId: `rating_${i}`,
      rateeId: userId,
      score: Math.floor(Math.random() * 2) + 4, // 4-5 range for demo
      feedback: {
        categories: {
          punctuality: Math.floor(Math.random() * 2) + 4,
          quality: Math.floor(Math.random() * 2) + 4,
          communication: Math.floor(Math.random() * 2) + 4
        }
      },
      timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  
  console.log(`MOCK: Generated ${ratings.length} sample ratings`);
  return ratings;
}

/**
 * Calculate average rating
 */
function calculateAverage(ratings) {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, r) => acc + r.score, 0);
  return sum / ratings.length;
}

/**
 * Calculate category averages
 */
function calculateCategoryAverages(ratings) {
  const categories = {};
  const counts = {};

  ratings.forEach(rating => {
    if (rating.feedback && rating.feedback.categories) {
      Object.entries(rating.feedback.categories).forEach(([category, score]) => {
        if (!categories[category]) {
          categories[category] = 0;
          counts[category] = 0;
        }
        categories[category] += score;
        counts[category]++;
      });
    }
  });

  const averages = {};
  Object.keys(categories).forEach(category => {
    averages[category] = categories[category] / counts[category];
  });

  return averages;
}

/**
 * Determine trust tier
 */
function determineTier(average, totalRatings) {
  if (average >= TIER_THRESHOLDS.platinum.minAverage && 
      totalRatings >= TIER_THRESHOLDS.platinum.minRatings) {
    return 'platinum';
  }
  if (average >= TIER_THRESHOLDS.gold.minAverage && 
      totalRatings >= TIER_THRESHOLDS.gold.minRatings) {
    return 'gold';
  }
  if (average >= TIER_THRESHOLDS.silver.minAverage && 
      totalRatings >= TIER_THRESHOLDS.silver.minRatings) {
    return 'silver';
  }
  return 'bronze';
}

/**
 * Calculate earned badges
 */
function calculateBadges(totalRatings, categoryAverages) {
  const badges = [];

  // Check each badge criteria
  if (totalRatings >= BADGE_CRITERIA.reliable.minRatings &&
      categoryAverages.punctuality >= BADGE_CRITERIA.reliable.minPunctuality) {
    badges.push({
      id: 'reliable',
      name: 'विश्वसनीय / Reliable',
      icon: '⏰',
      earnedAt: new Date().toISOString()
    });
  }

  if (totalRatings >= BADGE_CRITERIA.quality_expert.minRatings &&
      categoryAverages.quality >= BADGE_CRITERIA.quality_expert.minQuality) {
    badges.push({
      id: 'quality_expert',
      name: 'गुणवत्ता विशेषज्ञ / Quality Expert',
      icon: '⭐',
      earnedAt: new Date().toISOString()
    });
  }

  if (totalRatings >= BADGE_CRITERIA.communicator.minRatings &&
      categoryAverages.communication >= BADGE_CRITERIA.communicator.minCommunication) {
    badges.push({
      id: 'communicator',
      name: 'अच्छा संवादक / Great Communicator',
      icon: '💬',
      earnedAt: new Date().toISOString()
    });
  }

  if (totalRatings >= BADGE_CRITERIA.fair_employer.minRatings &&
      categoryAverages.fairness >= BADGE_CRITERIA.fair_employer.minFairness) {
    badges.push({
      id: 'fair_employer',
      name: 'निष्पक्ष नियोक्ता / Fair Employer',
      icon: '⚖️',
      earnedAt: new Date().toISOString()
    });
  }

  if (totalRatings >= BADGE_CRITERIA.timely_payer.minRatings &&
      categoryAverages.payment_timeliness >= BADGE_CRITERIA.timely_payer.minPaymentTimeliness) {
    badges.push({
      id: 'timely_payer',
      name: 'समय पर भुगतान / Timely Payer',
      icon: '💰',
      earnedAt: new Date().toISOString()
    });
  }

  return badges;
}

/**
 * Calculate rating distribution
 */
function calculateDistribution(ratings) {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratings.forEach(rating => {
    distribution[rating.score]++;
  });
  return distribution;
}

exports.handler = async (event) => {
  try {
    // Extract user ID from EventBridge event
    const detail = event.detail || JSON.parse(event.body || '{}');
    const { rateeId, rateeType } = detail;

    if (!rateeId) {
      throw new Error('Missing rateeId in event');
    }

    console.log('Calculating trust tier for:', rateeId);

    // Fetch all ratings for user
    const ratings = await fetchUserRatings(rateeId);

    // Calculate metrics
    const totalRatings = ratings.length;
    const averageRating = calculateAverage(ratings);
    const categoryAverages = calculateCategoryAverages(ratings);
    const distribution = calculateDistribution(ratings);

    // Determine trust tier
    const tier = determineTier(averageRating, totalRatings);

    // Calculate badges
    const badges = calculateBadges(totalRatings, categoryAverages);

    // Calculate recent trend (last 10 ratings vs overall)
    const recentRatings = ratings.slice(0, Math.min(10, ratings.length));
    const recentAverage = calculateAverage(recentRatings);
    const trend = recentAverage > averageRating ? 'improving' : 
                  recentAverage < averageRating ? 'declining' : 'stable';

    // Create trust profile
    const trustProfile = {
      userId: rateeId,
      userType: rateeType,
      tier,
      averageRating: parseFloat(averageRating.toFixed(2)),
      totalRatings,
      categoryAverages,
      distribution,
      badges,
      trend,
      recentAverage: parseFloat(recentAverage.toFixed(2)),
      lastUpdated: new Date().toISOString(),
      nextTier: getNextTier(tier),
      progressToNextTier: calculateProgress(tier, averageRating, totalRatings)
    };

    // MOCK: Update trust profile in DynamoDB
    // In production, uncomment this:
    /*
    const updateParams = {
      TableName: process.env.TRUST_PROFILES_TABLE,
      Key: marshall({ userId: rateeId }),
      UpdateExpression: 'SET trustProfile = :profile, lastUpdated = :timestamp',
      ExpressionAttributeValues: marshall({
        ':profile': trustProfile,
        ':timestamp': trustProfile.lastUpdated
      })
    };
    await dynamodb.send(new UpdateItemCommand(updateParams));
    */

    console.log('MOCK: Updated trust profile in DynamoDB:', trustProfile);

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        trustProfile
      })
    };

  } catch (error) {
    console.error('Error calculating trust tier:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to calculate trust tier',
        message: error.message
      })
    };
  }
};

/**
 * Get next tier in progression
 */
function getNextTier(currentTier) {
  const tiers = ['bronze', 'silver', 'gold', 'platinum'];
  const currentIndex = tiers.indexOf(currentTier);
  return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
}

/**
 * Calculate progress to next tier (0-100%)
 */
function calculateProgress(currentTier, average, totalRatings) {
  const nextTier = getNextTier(currentTier);
  if (!nextTier) return 100;

  const threshold = TIER_THRESHOLDS[nextTier];
  const ratingProgress = (totalRatings / threshold.minRatings) * 100;
  const averageProgress = (average / threshold.minAverage) * 100;

  return Math.min(Math.min(ratingProgress, averageProgress), 100);
}

// Export for testing
exports.determineTier = determineTier;
exports.calculateBadges = calculateBadges;
exports.TIER_THRESHOLDS = TIER_THRESHOLDS;
