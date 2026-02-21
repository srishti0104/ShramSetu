/**
 * Lambda Function: Create Work Session
 * Creates a new work session for attendance tracking
 * 
 * @param {Object} event - API Gateway event
 * @param {string} event.body.contractorId - Contractor creating the session
 * @param {string} event.body.jobId - Associated job ID
 * @param {string} event.body.location - Work location
 * @param {string} event.body.shiftType - Shift type (morning/afternoon/evening/night)
 * @param {string[]} event.body.expectedWorkers - Array of expected worker IDs
 * @returns {Object} Session details with session ID
 */

// MOCK: In production, uncomment AWS SDK imports
// const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
// const { marshall } = require('@aws-sdk/util-dynamodb');

const crypto = require('crypto');

// MOCK: Initialize DynamoDB client
// const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { contractorId, jobId, location, shiftType, expectedWorkers } = body;

    // Validate required fields
    if (!contractorId || !jobId || !location || !shiftType) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Missing required fields',
          required: ['contractorId', 'jobId', 'location', 'shiftType']
        })
      };
    }

    // Validate shift type
    const validShifts = ['morning', 'afternoon', 'evening', 'night', 'full_day'];
    if (!validShifts.includes(shiftType)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Invalid shift type',
          validShifts
        })
      };
    }

    // Generate unique session ID
    const sessionId = `session_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    const timestamp = new Date().toISOString();

    // Create session object
    const session = {
      sessionId,
      contractorId,
      jobId,
      location,
      shiftType,
      expectedWorkers: expectedWorkers || [],
      status: 'active',
      createdAt: timestamp,
      startTime: timestamp,
      endTime: null,
      attendanceRecords: [],
      totpSecret: crypto.randomBytes(32).toString('hex'), // Secret for TOTP generation
      metadata: {
        totalExpected: (expectedWorkers || []).length,
        totalMarked: 0,
        lastUpdated: timestamp
      }
    };

    // MOCK: Store session in DynamoDB
    // In production, uncomment this:
    /*
    const params = {
      TableName: process.env.WORK_SESSIONS_TABLE,
      Item: marshall(session)
    };
    await dynamodb.send(new PutItemCommand(params));
    */

    // MOCK: Simulate database storage
    console.log('MOCK: Storing session in DynamoDB:', session);

    return {
      statusCode: 201,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        session: {
          sessionId: session.sessionId,
          contractorId: session.contractorId,
          jobId: session.jobId,
          location: session.location,
          shiftType: session.shiftType,
          expectedWorkers: session.expectedWorkers,
          status: session.status,
          createdAt: session.createdAt,
          startTime: session.startTime
        },
        message: 'Work session created successfully'
      })
    };

  } catch (error) {
    console.error('Error creating work session:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to create work session',
        message: error.message
      })
    };
  }
};
