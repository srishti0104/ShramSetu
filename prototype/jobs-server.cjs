/**
 * Jobs API Server
 * Express.js server for handling job creation and management
 * Connects to AWS DynamoDB
 */

const express = require('express');
const cors = require('cors');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.JOBS_SERVER_PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: process.env.VITE_AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.VITE_AWS_SECRET_ACCESS_KEY
  }
});

const dynamodb = DynamoDBDocumentClient.from(client);

// Table name
const JOBS_TABLE = process.env.JOBS_TABLE || 'Shram-setu-jobs';

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'jobs-api',
    timestamp: new Date().toISOString()
  });
});

/**
 * Create a new job
 * POST /jobs
 */
app.post('/jobs', async (req, res) => {
  try {
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
    } = req.body;

    // Validate required fields
    if (!contractorId || !title || !description || !location || !wageRate || !wageType || !duration || !workersNeeded || !startDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['contractorId', 'title', 'description', 'location', 'wageRate', 'wageType', 'duration', 'workersNeeded', 'startDate']
      });
    }

    // Validate location object
    if (!location.city || !location.state) {
      return res.status(400).json({
        success: false,
        error: 'Location must include city and state'
      });
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
    const params = {
      TableName: JOBS_TABLE,
      Item: job,
      ConditionExpression: 'attribute_not_exists(jobId)'
    };

    await dynamodb.send(new PutCommand(params));

    console.log('Job created successfully:', jobId);

    res.status(201).json({
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
    });

  } catch (error) {
    console.error('Error creating job:', error);

    if (error.name === 'ConditionalCheckFailedException') {
      return res.status(409).json({
        success: false,
        error: 'Job already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create job',
      message: error.message
    });
  }
});

/**
 * Get job by ID
 * GET /jobs/:jobId
 */
app.get('/jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;

    const params = {
      TableName: JOBS_TABLE,
      Key: { jobId }
    };

    const result = await dynamodb.send(new GetCommand(params));

    if (!result.Item) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    res.json({
      success: true,
      job: result.Item
    });

  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch job',
      message: error.message
    });
  }
});

/**
 * Get jobs by contractor
 * GET /jobs?contractorId=xxx
 */
app.get('/jobs', async (req, res) => {
  try {
    const { contractorId } = req.query;

    if (!contractorId) {
      return res.status(400).json({
        success: false,
        error: 'contractorId is required'
      });
    }

    const params = {
      TableName: JOBS_TABLE,
      IndexName: 'contractorId-index',
      KeyConditionExpression: 'contractorId = :contractorId',
      ExpressionAttributeValues: {
        ':contractorId': contractorId
      },
      ScanIndexForward: false // Sort by postedAt descending
    };

    const result = await dynamodb.send(new QueryCommand(params));

    res.json({
      success: true,
      jobs: result.Items || [],
      count: result.Count || 0
    });

  } catch (error) {
    console.error('Error fetching contractor jobs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch jobs',
      message: error.message
    });
  }
});

/**
 * Update job status
 * PATCH /jobs/:jobId/status
 */
app.patch('/jobs/:jobId/status', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status } = req.body;

    if (!status || !['open', 'filled', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be: open, filled, or cancelled'
      });
    }

    const params = {
      TableName: JOBS_TABLE,
      Key: { jobId },
      UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': status,
        ':updatedAt': Date.now()
      },
      ReturnValues: 'ALL_NEW'
    };

    const result = await dynamodb.send(new UpdateCommand(params));

    res.json({
      success: true,
      job: result.Attributes,
      message: 'Job status updated successfully'
    });

  } catch (error) {
    console.error('Error updating job status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update job status',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Jobs API Server running on http://localhost:${PORT}`);
  console.log(`📊 DynamoDB Table: ${JOBS_TABLE}`);
  console.log(`🌍 Region: ${process.env.VITE_AWS_REGION || 'ap-south-1'}`);
});
