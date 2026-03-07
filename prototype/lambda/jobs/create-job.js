/**
 * Lambda Function: Create Job
 * Creates a new job posting in DynamoDB
 * 
 * @param {Object} event - API Gateway event
 * @returns {Object} Job details with job ID
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto');

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' });
const dynamodb = DynamoDBDocumentClient.from(client);

// Table name from environment variable
const JOBS_TABLE = process.env.JOBS_TABLE || 'Shram-setu-jobs';

exports.handler = async (event) => {
  console.log('Create Job Lambda - Event:', JSON.stringify(event, null, 2));

  try {
    const body = JSON.parse(event.body);
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
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
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
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
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
        coordinates: location.coordinates || null
      },
      city: location.city, // Add city at root level for GSI
      status: 'open', // Add status at root level for GSI
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
    try {
      const params = {
        TableName: JOBS_TABLE,
        Item: job,
        ConditionExpression: 'attribute_not_exists(jobId)' // Prevent duplicate jobs
      };

      await dynamodb.send(new PutCommand(params));

      console.log('Job created successfully:', jobId);

      return {
        statusCode: 201,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
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

    } catch (dbError) {
      console.error('DynamoDB error:', dbError);

      // Check if it's a conditional check failure (duplicate job)
      if (dbError.name === 'ConditionalCheckFailedException') {
        return {
          statusCode: 409,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            success: false,
            error: 'Job already exists',
            message: 'A job with this ID already exists'
          })
        };
      }

      throw dbError;
    }

  } catch (error) {
    console.error('Error creating job:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Failed to create job',
        message: error.message
      })
    };
  }
};
