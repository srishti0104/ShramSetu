/**
 * Lambda Function: Submit Rating
 * Allows mutual rating between workers and contractors after job completion
 * 
 * @param {Object} event - API Gateway event
 * @param {string} event.body.jobId - Completed job ID
 * @param {string} event.body.raterId - User submitting the rating
 * @param {string} event.body.rateeId - User being rated
 * @param {string} event.body.raterType - 'worker' or 'contractor'
 * @param {number} event.body.score - Rating score (1-5)
 * @param {Object} event.body.feedback - Detailed feedback
 * @returns {Object} Submitted rating with updated trust tier
 */

const crypto = require('crypto');

// MOCK: In production, uncomment AWS SDK imports
// const { DynamoDBClient, PutItemCommand, GetItemCommand, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
// const { EventBridgeClient, PutEventsCommand } = require('@aws-sdk/client-eventbridge');
// const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

// MOCK: Initialize clients
// const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION });
// const eventBridge = new EventBridgeClient({ region: process.env.AWS_REGION });

// Rating categories
const RATING_CATEGORIES = {
  worker: ['punctuality', 'quality', 'professionalism', 'communication', 'reliability'],
  contractor: ['payment_timeliness', 'work_conditions', 'communication', 'fairness', 'respect']
};

/**
 * Validate rating data
 */
function validateRating(data) {
  const { jobId, raterId, rateeId, raterType, score, feedback } = data;

  if (!jobId || !raterId || !rateeId || !raterType || score === undefined) {
    return { valid: false, error: 'Missing required fields' };
  }

  if (raterId === rateeId) {
    return { valid: false, error: 'Cannot rate yourself' };
  }

  if (!['worker', 'contractor'].includes(raterType)) {
    return { valid: false, error: 'Invalid rater type' };
  }

  if (score < 1 || score > 5 || !Number.isInteger(score)) {
    return { valid: false, error: 'Score must be an integer between 1 and 5' };
  }

  // Validate feedback categories
  if (feedback && feedback.categories) {
    const validCategories = RATING_CATEGORIES[raterType === 'worker' ? 'contractor' : 'worker'];
    for (const category in feedback.categories) {
      if (!validCategories.includes(category)) {
        return { valid: false, error: `Invalid category: ${category}` };
      }
      const categoryScore = feedback.categories[category];
      if (categoryScore < 1 || categoryScore > 5 || !Number.isInteger(categoryScore)) {
        return { valid: false, error: `Invalid score for category ${category}` };
      }
    }
  }

  return { valid: true };
}

/**
 * Check if rating already exists
 */
async function checkExistingRating(jobId, raterId) {
  // MOCK: In production, query DynamoDB
  /*
  const params = {
    TableName: process.env.RATINGS_TABLE,
    IndexName: 'JobRaterIndex',
    KeyConditionExpression: 'jobId = :jobId AND raterId = :raterId',
    ExpressionAttributeValues: marshall({
      ':jobId': jobId,
      ':raterId': raterId
    })
  };
  const result = await dynamodb.send(new QueryCommand(params));
  return result.Items && result.Items.length > 0;
  */
  
  console.log('MOCK: Checking existing rating:', { jobId, raterId });
  return false; // Mock: no existing rating
}

/**
 * Verify job completion and eligibility
 */
async function verifyJobEligibility(jobId, raterId, rateeId) {
  // MOCK: In production, verify from DynamoDB
  /*
  const params = {
    TableName: process.env.JOBS_TABLE,
    Key: marshall({ jobId })
  };
  const result = await dynamodb.send(new GetItemCommand(params));
  
  if (!result.Item) {
    return { eligible: false, error: 'Job not found' };
  }
  
  const job = unmarshall(result.Item);
  
  if (job.status !== 'completed') {
    return { eligible: false, error: 'Job not completed' };
  }
  
  // Verify rater and ratee were part of the job
  const isRaterInvolved = job.workerId === raterId || job.contractorId === raterId;
  const isRateeInvolved = job.workerId === rateeId || job.contractorId === rateeId;
  
  if (!isRaterInvolved || !isRateeInvolved) {
    return { eligible: false, error: 'Users not involved in this job' };
  }
  
  return { eligible: true, job };
  */
  
  console.log('MOCK: Verifying job eligibility');
  return {
    eligible: true,
    job: {
      jobId,
      status: 'completed',
      completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    }
  };
}

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { jobId, raterId, rateeId, raterType, score, feedback } = body;

    // Validate rating data
    const validation = validateRating(body);
    if (!validation.valid) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: validation.error })
      };
    }

    // Check for existing rating
    const existingRating = await checkExistingRating(jobId, raterId);
    if (existingRating) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Rating already submitted for this job'
        })
      };
    }

    // Verify job eligibility
    const eligibility = await verifyJobEligibility(jobId, raterId, rateeId);
    if (!eligibility.eligible) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: eligibility.error })
      };
    }

    // Create rating record
    const ratingId = `rating_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    const timestamp = new Date().toISOString();

    const rating = {
      ratingId,
      jobId,
      raterId,
      rateeId,
      raterType,
      rateeType: raterType === 'worker' ? 'contractor' : 'worker',
      score,
      feedback: {
        categories: feedback?.categories || {},
        comment: feedback?.comment || '',
        tags: feedback?.tags || []
      },
      timestamp,
      verified: true, // Verified through job completion
      metadata: {
        jobCompletedAt: eligibility.job.completedAt,
        ratingDelay: Date.now() - new Date(eligibility.job.completedAt).getTime()
      }
    };

    // MOCK: Store rating in DynamoDB
    // In production, uncomment this:
    /*
    const putParams = {
      TableName: process.env.RATINGS_TABLE,
      Item: marshall(rating)
    };
    await dynamodb.send(new PutItemCommand(putParams));
    */

    console.log('MOCK: Storing rating in DynamoDB:', rating);

    // MOCK: Trigger trust tier recalculation via EventBridge
    // In production, uncomment this:
    /*
    const eventParams = {
      Entries: [{
        Source: 'shram-setu.ratings',
        DetailType: 'RatingSubmitted',
        Detail: JSON.stringify({
          ratingId,
          rateeId,
          rateeType: rating.rateeType,
          score
        }),
        EventBusName: process.env.EVENT_BUS_NAME
      }]
    };
    await eventBridge.send(new PutEventsCommand(eventParams));
    */

    console.log('MOCK: Triggering trust tier recalculation event');

    // Calculate new trust tier (simplified for mock)
    const newTier = score >= 4 ? 'gold' : score >= 3 ? 'silver' : 'bronze';

    return {
      statusCode: 201,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        rating: {
          ratingId: rating.ratingId,
          jobId: rating.jobId,
          rateeId: rating.rateeId,
          score: rating.score,
          timestamp: rating.timestamp
        },
        trustTier: {
          current: newTier,
          updated: true
        },
        message: 'Rating submitted successfully'
      })
    };

  } catch (error) {
    console.error('Error submitting rating:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to submit rating',
        message: error.message
      })
    };
  }
};

// Export for testing
exports.validateRating = validateRating;
exports.RATING_CATEGORIES = RATING_CATEGORIES;

