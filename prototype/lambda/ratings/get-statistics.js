/**
 * Lambda Function: Get Rating Statistics
 * Provides comprehensive rating statistics for employer/employee evaluation
 * 
 * @param {Object} event - API Gateway event
 * @param {string} event.pathParameters.userId - User ID
 * @param {string} event.queryStringParameters.type - User type ('worker' or 'employer')
 * @returns {Object} Comprehensive rating statistics
 */

const { DynamoDBClient, QueryCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' });

/**
 * Calculate comprehensive statistics from ratings
 */
function calculateStatistics(ratings, userType) {
  if (ratings.length === 0) {
    return {
      totalRatings: 0,
      averageRating: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      categoryAverages: {},
      trend: 'no_data',
      trustTier: 'bronze',
      badges: [],
      performanceMetrics: {
        consistency: 0,
        improvement: 0,
        reliability: 0
      }
    };
  }

  // Basic statistics
  const totalRatings = ratings.length;
  const averageRating = ratings.reduce((sum, r) => sum + r.score, 0) / totalRatings;
  
  // Rating distribution
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratings.forEach(rating => {
    distribution[rating.score] = (distribution[rating.score] || 0) + 1;
  });

  // Category averages
  const categoryTotals = {};
  const categoryCounts = {};
  
  ratings.forEach(rating => {
    if (rating.feedback && rating.feedback.categories) {
      Object.entries(rating.feedback.categories).forEach(([category, score]) => {
        categoryTotals[category] = (categoryTotals[category] || 0) + score;
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });
    }
  });

  const categoryAverages = {};
  Object.keys(categoryTotals).forEach(category => {
    categoryAverages[category] = categoryTotals[category] / categoryCounts[category];
  });

  // Calculate trend (last 10 vs previous ratings)
  const recentRatings = ratings.slice(-10);
  const olderRatings = ratings.slice(0, -10);
  
  let trend = 'stable';
  if (olderRatings.length > 0) {
    const recentAvg = recentRatings.reduce((sum, r) => sum + r.score, 0) / recentRatings.length;
    const olderAvg = olderRatings.reduce((sum, r) => sum + r.score, 0) / olderRatings.length;
    
    if (recentAvg > olderAvg + 0.2) trend = 'improving';
    else if (recentAvg < olderAvg - 0.2) trend = 'declining';
  }

  // Determine trust tier
  let trustTier = 'bronze';
  if (averageRating >= 4.5 && totalRatings >= 50) trustTier = 'platinum';
  else if (averageRating >= 4.0 && totalRatings >= 25) trustTier = 'gold';
  else if (averageRating >= 3.0 && totalRatings >= 10) trustTier = 'silver';

  // Calculate badges
  const badges = [];
  if (totalRatings >= 20 && categoryAverages.punctuality >= 4.5) {
    badges.push({ id: 'reliable', name: 'विश्वसनीय / Reliable', icon: '⏰' });
  }
  if (totalRatings >= 30 && categoryAverages.quality >= 4.5) {
    badges.push({ id: 'quality_expert', name: 'गुणवत्ता विशेषज्ञ / Quality Expert', icon: '⭐' });
  }
  if (totalRatings >= 15 && categoryAverages.communication >= 4.5) {
    badges.push({ id: 'communicator', name: 'संवाद विशेषज्ञ / Great Communicator', icon: '💬' });
  }
  if (userType === 'employer' && totalRatings >= 20 && categoryAverages.fairness >= 4.5) {
    badges.push({ id: 'fair_employer', name: 'निष्पक्ष नियोक्ता / Fair Employer', icon: '⚖️' });
  }
  if (userType === 'employer' && totalRatings >= 25 && categoryAverages.payment_timeliness >= 4.5) {
    badges.push({ id: 'timely_payer', name: 'समयनिष्ठ भुगतान / Timely Payer', icon: '💰' });
  }

  // Performance metrics
  const performanceMetrics = {
    consistency: calculateConsistency(ratings),
    improvement: calculateImprovement(ratings),
    reliability: averageRating / 5 * 100
  };

  return {
    totalRatings,
    averageRating: parseFloat(averageRating.toFixed(2)),
    distribution,
    categoryAverages,
    trend,
    trustTier,
    badges,
    performanceMetrics,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Calculate consistency score (lower variance = higher consistency)
 */
function calculateConsistency(ratings) {
  if (ratings.length < 2) return 100;
  
  const avg = ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;
  const variance = ratings.reduce((sum, r) => sum + Math.pow(r.score - avg, 2), 0) / ratings.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Convert to percentage (lower std dev = higher consistency)
  return Math.max(0, 100 - (standardDeviation * 25));
}

/**
 * Calculate improvement score (trend over time)
 */
function calculateImprovement(ratings) {
  if (ratings.length < 5) return 50; // Neutral for insufficient data
  
  const firstHalf = ratings.slice(0, Math.floor(ratings.length / 2));
  const secondHalf = ratings.slice(Math.floor(ratings.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, r) => sum + r.score, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, r) => sum + r.score, 0) / secondHalf.length;
  
  const improvement = ((secondAvg - firstAvg) / 4) * 100; // Scale to percentage
  return Math.max(0, Math.min(100, 50 + improvement * 10)); // Center around 50%
}

/**
 * Main Lambda handler
 */
exports.handler = async (event) => {
  try {
    const { userId } = event.pathParameters || {};
    const { type: userType } = event.queryStringParameters || {};

    if (!userId) {
      return {
        statusCode: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token'
        },
        body: JSON.stringify({ error: 'User ID is required' })
      };
    }

    if (!userType || !['worker', 'employer'].includes(userType)) {
      return {
        statusCode: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token'
        },
        body: JSON.stringify({ error: 'Valid user type (worker/employer) is required' })
      };
    }

    // Fetch ratings from DynamoDB
    let ratings = [];
    try {
      const params = {
        TableName: process.env.RATINGS_TABLE || 'Shram-setu-ratings',
        IndexName: 'toUserId-index',
        KeyConditionExpression: 'toUserId = :userId',
        ExpressionAttributeValues: marshall({
          ':userId': userId
        }),
        ScanIndexForward: false // Most recent first
      };

      const result = await dynamodb.send(new QueryCommand(params));
      ratings = result.Items ? result.Items.map(item => unmarshall(item)) : [];
    } catch (error) {
      console.error('Error fetching ratings from DynamoDB:', error);
      // Continue with empty ratings array for graceful degradation
    }

    // Calculate comprehensive statistics
    const statistics = calculateStatistics(ratings, userType);

    // Add additional evaluation metrics
    const evaluationData = {
      ...statistics,
      userId,
      userType,
      evaluationScore: calculateEvaluationScore(statistics),
      recommendations: generateRecommendations(statistics, userType),
      riskFactors: identifyRiskFactors(statistics, ratings),
      strengths: identifyStrengths(statistics, userType)
    };

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token'
      },
      body: JSON.stringify(evaluationData)
    };

  } catch (error) {
    console.error('Error getting rating statistics:', error);
    return {
      statusCode: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token'
      },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

/**
 * Calculate overall evaluation score (0-100)
 */
function calculateEvaluationScore(stats) {
  if (stats.totalRatings === 0) return 0;
  
  const ratingScore = (stats.averageRating / 5) * 60; // 60% weight
  const volumeScore = Math.min(stats.totalRatings / 50, 1) * 20; // 20% weight
  const consistencyScore = (stats.performanceMetrics.consistency / 100) * 20; // 20% weight
  
  return Math.round(ratingScore + volumeScore + consistencyScore);
}

/**
 * Generate recommendations based on statistics
 */
function generateRecommendations(stats, userType) {
  const recommendations = [];
  
  if (stats.averageRating < 3.5) {
    recommendations.push({
      type: 'improvement',
      message: userType === 'worker' 
        ? 'Focus on improving work quality and communication'
        : 'Consider improving payment timeliness and work conditions'
    });
  }
  
  if (stats.totalRatings < 10) {
    recommendations.push({
      type: 'engagement',
      message: 'Complete more jobs to build a stronger reputation'
    });
  }
  
  if (stats.performanceMetrics.consistency < 70) {
    recommendations.push({
      type: 'consistency',
      message: 'Work on maintaining consistent performance across all jobs'
    });
  }
  
  return recommendations;
}

/**
 * Identify risk factors
 */
function identifyRiskFactors(stats, ratings) {
  const risks = [];
  
  if (stats.trend === 'declining') {
    risks.push({ type: 'declining_performance', severity: 'medium' });
  }
  
  if (stats.distribution[1] + stats.distribution[2] > stats.totalRatings * 0.2) {
    risks.push({ type: 'high_negative_ratings', severity: 'high' });
  }
  
  if (stats.performanceMetrics.consistency < 50) {
    risks.push({ type: 'inconsistent_performance', severity: 'medium' });
  }
  
  return risks;
}

/**
 * Identify strengths
 */
function identifyStrengths(stats, userType) {
  const strengths = [];
  
  if (stats.averageRating >= 4.5) {
    strengths.push('excellent_ratings');
  }
  
  if (stats.totalRatings >= 50) {
    strengths.push('high_volume');
  }
  
  if (stats.performanceMetrics.consistency >= 80) {
    strengths.push('consistent_performance');
  }
  
  if (stats.trend === 'improving') {
    strengths.push('improving_trend');
  }
  
  return strengths;
}