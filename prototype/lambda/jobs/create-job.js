/**
 * Create Job Lambda Function
 * Handles job creation in DynamoDB
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto');

// AWS SDK automatically uses the Lambda execution environment's region
const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

const JOBS_TABLE = process.env.JOBS_TABLE || 'Shram-setu-jobs';

exports.handler = async (event) => {
  console.log('Create Job Event:', JSON.stringify(event, null, 2));

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const {
      contractorId,
      title,
      description,
      location,
      wageRate,
      wageType,
      duration,
      skillsRequired,
      workersNeeded,
      startDate
    } = body;

    // Validate required fields
    if (!contractorId || !title || !description || !location || !wageRate || !wageType || !duration || !workersNeeded || !startDate) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Missing required fields',
          required: ['contractorId', 'title', 'description', 'location', 'wageRate', 'wageType', 'duration', 'workersNeeded', 'startDate']
        })
      };
    }

    // Validate location object
    if (!location.city || !location.state) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Location must include city and state'
        })
      };
    }

    // Generate unique job ID
    const jobId = `job_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    const timestamp = Date.now();

    // Create job object
    const job = {
      jobId,
      contractorId,
      title,
      description,
      location: {
        address: location.address || '',
        city: location.city,
        state: location.state,
        latitude: location.latitude || null,
        longitude: location.longitude || null,
        coordinates: location.coordinates || null
      },
      city: location.city,
      status: 'open',
      wageRate: parseFloat(wageRate),
      wageType,
      duration,
      skillsRequired: skillsRequired || [],
      workersNeeded: parseInt(workersNeeded),
      workersHired: 0,
      startDate,
      postedAt: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
      applications: [],
      metadata: {
        views: 0,
        applicationsCount: 0
      }
    };

    // Store job in DynamoDB
    const params = {
      TableName: JOBS_TABLE,
      Item: job,
      ConditionExpression: 'attribute_not_exists(jobId)'
    };

    await dynamodb.send(new PutCommand(params));

    console.log('Job created successfully:', jobId);

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        job: {
          jobId: job.jobId,
          contractorId: job.contractorId,
          title: job.title,
          description: job.description,
          location: job.location,
          wageRate: job.wageRate,
          wageType: job.wageType,
          duration: job.duration,
          skillsRequired: job.skillsRequired,
          workersNeeded: job.workersNeeded,
          startDate: job.startDate,
          status: job.status,
          postedAt: job.postedAt
        },
        message: 'Job created successfully'
      })
    };

  } catch (error) {
    console.error('Error creating job:', error);

    if (error.name === 'ConditionalCheckFailedException') {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Job already exists'
        })
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to create job',
        message: error.message
      })
    };
  }
};
