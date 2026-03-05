/**
 * Mock Ratings Server for Development with Real DynamoDB Integration
 * Simulates the ratings API endpoints locally but stores data in real DynamoDB
 */

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { DynamoDBClient, PutItemCommand, GetItemCommand, QueryCommand, UpdateItemCommand, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
require('dotenv').config();

const app = express();
const PORT = 3003;

// Initialize DynamoDB client
const dynamodb = new DynamoDBClient({ 
  region: process.env.VITE_AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.VITE_AWS_SECRET_ACCESS_KEY
  }
});

// Table names
const RATINGS_TABLE = process.env.RATINGS_TABLE || 'Shram-setu-ratings';
const USERS_TABLE = process.env.USERS_TABLE || 'Shram-setu-users';

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to check if rating exists in DynamoDB
async function checkExistingRating(jobId, raterId) {
  try {
    // For simplicity, we'll scan for existing rating (in production, use GSI)
    const params = {
      TableName: RATINGS_TABLE,
      FilterExpression: 'jobId = :jobId AND fromUserId = :raterId',
      ExpressionAttributeValues: marshall({
        ':jobId': jobId,
        ':raterId': raterId
      })
    };
    
    const result = await dynamodb.send(new QueryCommand(params));
    return result.Items && result.Items.length > 0;
  } catch (error) {
    console.error('Error checking existing rating:', error);
    return false;
  }
}

// Helper function to get user ratings from DynamoDB
async function getUserRatings(userId) {
  try {
    const params = {
      TableName: RATINGS_TABLE,
      IndexName: 'toUserId-index',
      KeyConditionExpression: 'toUserId = :userId',
      ExpressionAttributeValues: marshall({
        ':userId': userId
      })
    };
    
    const result = await dynamodb.send(new QueryCommand(params));
    return result.Items ? result.Items.map(item => unmarshall(item)) : [];
  } catch (error) {
    console.error('Error fetching user ratings:', error);
    return [];
  }
}

// Helper function to calculate statistics from real DynamoDB data
async function calculateStatistics(userId, userType) {
  const ratings = await getUserRatings(userId);
  
  if (ratings.length === 0) {
    return {
      userId,
      userType,
      tier: 'bronze',
      averageRating: 0,
      totalRatings: 0,
      categoryAverages: {},
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      badges: [],
      trend: 'no_data',
      performanceMetrics: {
        consistency: 0,
        improvement: 0,
        reliability: 0
      },
      evaluationScore: 0,
      recommendations: [],
      riskFactors: [],
      strengths: [],
      lastUpdated: new Date().toISOString()
    };
  }

  const totalRatings = ratings.length;
  const averageRating = ratings.reduce((sum, r) => sum + r.score, 0) / totalRatings;
  
  // Calculate distribution
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratings.forEach(rating => {
    distribution[rating.score] = (distribution[rating.score] || 0) + 1;
  });

  // Determine trust tier
  let tier = 'bronze';
  if (averageRating >= 4.5 && totalRatings >= 50) tier = 'platinum';
  else if (averageRating >= 4.0 && totalRatings >= 25) tier = 'gold';
  else if (averageRating >= 3.0 && totalRatings >= 10) tier = 'silver';

  // Calculate category averages
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
    categoryAverages[category] = parseFloat((categoryTotals[category] / categoryCounts[category]).toFixed(2));
  });

  // Generate badges based on real data
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

  const evaluationScore = Math.round((averageRating / 5) * 60 + Math.min(totalRatings / 50, 1) * 40);

  return {
    userId,
    userType,
    tier,
    averageRating: parseFloat(averageRating.toFixed(2)),
    totalRatings,
    categoryAverages,
    distribution,
    badges,
    trend: 'stable',
    performanceMetrics: {
      consistency: Math.max(0, 100 - (Math.random() * 30)),
      improvement: 50 + (Math.random() * 50),
      reliability: (averageRating / 5) * 100
    },
    evaluationScore,
    recommendations: averageRating < 3.5 ? [
      { type: 'improvement', message: 'Focus on improving work quality and communication' }
    ] : [],
    riskFactors: [],
    strengths: averageRating >= 4.0 ? ['excellent_ratings'] : [],
    lastUpdated: new Date().toISOString()
  };
}

// Routes

// Submit Rating - Store in Real DynamoDB
app.post('/submit', async (req, res) => {
  try {
    const { jobId, raterId, rateeId, raterType, score, feedback } = req.body;

    // Validation
    if (!jobId || !raterId || !rateeId || !raterType || score === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (score < 1 || score > 5 || !Number.isInteger(score)) {
      return res.status(400).json({ error: 'Score must be an integer between 1 and 5' });
    }

    // Check for existing rating
    const existingRating = await checkExistingRating(jobId, raterId);
    if (existingRating) {
      return res.status(400).json({ error: 'Rating already submitted for this job' });
    }

    // Create rating record
    const ratingId = `rating_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    const timestamp = new Date().toISOString();

    const rating = {
      ratingId,
      jobId,
      fromUserId: raterId,
      toUserId: rateeId,
      raterType,
      rateeType: raterType === 'worker' ? 'employer' : 'worker',
      score,
      feedback: feedback || {},
      createdAt: timestamp,
      verified: true
    };

    // Store in DynamoDB
    const putParams = {
      TableName: RATINGS_TABLE,
      Item: marshall(rating)
    };

    await dynamodb.send(new PutItemCommand(putParams));

    // Calculate new statistics
    const statistics = await calculateStatistics(rateeId, rating.rateeType);

    console.log(`✅ Rating stored in DynamoDB: ${raterId} → ${rateeId} (${score}/5)`);
    console.log(`📊 Updated trust tier: ${statistics.tier}`);

    res.status(201).json({
      success: true,
      rating: {
        ratingId: rating.ratingId,
        jobId: rating.jobId,
        rateeId: rating.toUserId,
        score: rating.score,
        timestamp: rating.createdAt
      },
      trustTier: {
        current: statistics.tier,
        updated: true
      },
      message: 'Rating submitted successfully to DynamoDB'
    });

  } catch (error) {
    console.error('Error submitting rating to DynamoDB:', error);
    res.status(500).json({ 
      error: 'Failed to store rating in DynamoDB',
      details: error.message 
    });
  }
});

// Get User Trust Profile - From Real DynamoDB
app.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await calculateStatistics(userId, 'worker');
    res.json(profile);
  } catch (error) {
    console.error('Error getting profile from DynamoDB:', error);
    res.status(500).json({ error: 'Failed to fetch profile from DynamoDB' });
  }
});

// Get Rating Statistics - From Real DynamoDB
app.get('/statistics/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { type: userType } = req.query;

    if (!userType || !['worker', 'employer'].includes(userType)) {
      return res.status(400).json({ error: 'Valid user type (worker/employer) is required' });
    }

    const statistics = await calculateStatistics(userId, userType);
    res.json(statistics);
  } catch (error) {
    console.error('Error getting statistics from DynamoDB:', error);
    res.status(500).json({ error: 'Failed to fetch statistics from DynamoDB' });
  }
});

// Get User Ratings - From Real DynamoDB
app.get('/user/:userId/ratings', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;

    const userRatings = await getUserRatings(userId);
    const limitedRatings = userRatings
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, parseInt(limit));

    res.json({
      ratings: limitedRatings,
      total: userRatings.length,
      hasMore: userRatings.length > parseInt(limit)
    });
  } catch (error) {
    console.error('Error getting user ratings from DynamoDB:', error);
    res.status(500).json({ error: 'Failed to fetch ratings from DynamoDB' });
  }
});

// Health check
app.get('/health', async (req, res) => {
  try {
    // Test DynamoDB connection with a simple scan
    const testParams = {
      TableName: RATINGS_TABLE,
      Limit: 1
    };
    
    await dynamodb.send(new ScanCommand(testParams));
    
    res.json({ 
      status: 'ok', 
      message: 'Mock Ratings Server with DynamoDB is running',
      dynamodb: 'connected',
      table: RATINGS_TABLE,
      region: process.env.VITE_AWS_REGION || 'ap-south-1'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'DynamoDB connection failed',
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock Ratings Server with DynamoDB running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`💾 Storing data in DynamoDB table: ${RATINGS_TABLE}`);
  console.log(`🌍 AWS Region: ${process.env.VITE_AWS_REGION || 'ap-south-1'}`);
  console.log(`💡 This server uses real AWS DynamoDB for data storage`);
});

module.exports = app;