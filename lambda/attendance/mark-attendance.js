/**
 * Lambda Function: Mark Attendance
 * Records worker attendance after TOTP validation
 * Creates cryptographic audit trail
 * 
 * @param {Object} event - API Gateway event
 * @param {string} event.body.sessionId - Work session ID
 * @param {string} event.body.workerId - Worker ID
 * @param {string} event.body.code - Validated TOTP code
 * @param {Object} event.body.location - Worker's GPS location (optional)
 * @returns {Object} Attendance record with audit signature
 */

const crypto = require('crypto');

// MOCK: In production, uncomment AWS SDK imports
// const { DynamoDBClient, GetItemCommand, UpdateItemCommand, PutItemCommand } = require('@aws-sdk/client-dynamodb');
// const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

// MOCK: Initialize clients
// const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION });

/**
 * Generate cryptographic signature for audit trail
 * Uses HMAC-SHA256 with session secret
 * @param {Object} record - Attendance record
 * @param {string} secret - Session secret
 * @returns {string} Hex signature
 */
function generateAuditSignature(record, secret) {
  const data = JSON.stringify({
    sessionId: record.sessionId,
    workerId: record.workerId,
    timestamp: record.timestamp,
    code: record.code
  });

  const hmac = crypto.createHmac('sha256', Buffer.from(secret, 'hex'));
  hmac.update(data);
  return hmac.digest('hex');
}

/**
 * Verify audit signature
 * @param {Object} record - Attendance record
 * @param {string} signature - Signature to verify
 * @param {string} secret - Session secret
 * @returns {boolean} True if signature is valid
 */
function verifyAuditSignature(record, signature, secret) {
  const expectedSignature = generateAuditSignature(record, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

/**
 * Calculate distance between two GPS coordinates (Haversine formula)
 * @param {Object} coord1 - {latitude, longitude}
 * @param {Object} coord2 - {latitude, longitude}
 * @returns {number} Distance in meters
 */
function calculateDistance(coord1, coord2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = coord1.latitude * Math.PI / 180;
  const φ2 = coord2.latitude * Math.PI / 180;
  const Δφ = (coord2.latitude - coord1.latitude) * Math.PI / 180;
  const Δλ = (coord2.longitude - coord1.longitude) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { sessionId, workerId, code, location } = body;

    // Validate required fields
    if (!sessionId || !workerId || !code) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Missing required fields',
          required: ['sessionId', 'workerId', 'code']
        })
      };
    }

    // MOCK: Retrieve session from DynamoDB
    // In production, uncomment this:
    /*
    const getParams = {
      TableName: process.env.WORK_SESSIONS_TABLE,
      Key: marshall({ sessionId })
    };
    const result = await dynamodb.send(new GetItemCommand(getParams));
    
    if (!result.Item) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Session not found' })
      };
    }
    
    const session = unmarshall(result.Item);
    */

    // MOCK: Simulate session retrieval
    const session = {
      sessionId,
      contractorId: 'contractor_123',
      jobId: 'job_456',
      status: 'active',
      totpSecret: crypto.randomBytes(32).toString('hex'),
      location: {
        latitude: 19.0760,
        longitude: 72.8777,
        address: 'Mumbai, Maharashtra'
      },
      attendanceRecords: [],
      expectedWorkers: [workerId]
    };

    console.log('MOCK: Retrieved session from DynamoDB');

    // Verify session is active
    if (session.status !== 'active') {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Session not active',
          status: session.status
        })
      };
    }

    // Check if worker already marked attendance
    const existingRecord = session.attendanceRecords?.find(r => r.workerId === workerId);
    if (existingRecord) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Attendance already marked',
          markedAt: existingRecord.timestamp
        })
      };
    }

    // Validate location if provided
    let locationVerification = null;
    if (location && location.latitude && location.longitude) {
      const distance = calculateDistance(
        { latitude: location.latitude, longitude: location.longitude },
        { latitude: session.location.latitude, longitude: session.location.longitude }
      );

      locationVerification = {
        distance: Math.round(distance),
        withinRange: distance <= 500, // 500 meters tolerance
        workerLocation: location,
        sessionLocation: session.location
      };
    }

    // Create attendance record
    const timestamp = new Date().toISOString();
    const attendanceRecord = {
      attendanceId: `att_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      sessionId,
      workerId,
      code, // Store for audit purposes
      timestamp,
      markedBy: 'worker',
      location: location || null,
      locationVerification,
      metadata: {
        userAgent: event.headers?.['User-Agent'] || 'unknown',
        ipAddress: event.requestContext?.identity?.sourceIp || 'unknown'
      }
    };

    // Generate cryptographic audit signature
    const auditSignature = generateAuditSignature(attendanceRecord, session.totpSecret);
    attendanceRecord.auditSignature = auditSignature;

    // MOCK: Store attendance record in DynamoDB
    // In production, uncomment this:
    /*
    // Store in attendance records table
    const putParams = {
      TableName: process.env.ATTENDANCE_RECORDS_TABLE,
      Item: marshall(attendanceRecord)
    };
    await dynamodb.send(new PutItemCommand(putParams));

    // Update session with attendance record
    const updateParams = {
      TableName: process.env.WORK_SESSIONS_TABLE,
      Key: marshall({ sessionId }),
      UpdateExpression: 'SET attendanceRecords = list_append(if_not_exists(attendanceRecords, :empty_list), :record), metadata.totalMarked = metadata.totalMarked + :inc, metadata.lastUpdated = :timestamp',
      ExpressionAttributeValues: marshall({
        ':record': [attendanceRecord],
        ':empty_list': [],
        ':inc': 1,
        ':timestamp': timestamp
      })
    };
    await dynamodb.send(new UpdateItemCommand(updateParams));
    */

    console.log('MOCK: Storing attendance record in DynamoDB:', attendanceRecord);

    // MOCK: Send WebSocket notification to contractor
    // In production, use API Gateway WebSocket API
    console.log('MOCK: Sending WebSocket notification to contractor:', {
      contractorId: session.contractorId,
      event: 'attendance_marked',
      data: {
        sessionId,
        workerId,
        timestamp
      }
    });

    return {
      statusCode: 201,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        attendance: {
          attendanceId: attendanceRecord.attendanceId,
          sessionId: attendanceRecord.sessionId,
          workerId: attendanceRecord.workerId,
          timestamp: attendanceRecord.timestamp,
          locationVerification: attendanceRecord.locationVerification,
          auditSignature: attendanceRecord.auditSignature
        },
        message: 'Attendance marked successfully'
      })
    };

  } catch (error) {
    console.error('Error marking attendance:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to mark attendance',
        message: error.message
      })
    };
  }
};

// Export for testing
exports.generateAuditSignature = generateAuditSignature;
exports.verifyAuditSignature = verifyAuditSignature;
exports.calculateDistance = calculateDistance;
