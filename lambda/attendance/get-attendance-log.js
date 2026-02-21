/**
 * Lambda Function: Get Attendance Log
 * Retrieves attendance records for a session or worker
 * Verifies audit signatures for integrity
 * 
 * @param {Object} event - API Gateway event
 * @param {string} event.queryStringParameters.sessionId - Session ID (optional)
 * @param {string} event.queryStringParameters.workerId - Worker ID (optional)
 * @param {string} event.queryStringParameters.startDate - Start date filter (optional)
 * @param {string} event.queryStringParameters.endDate - End date filter (optional)
 * @returns {Object} Attendance records with verification status
 */

const crypto = require('crypto');

// MOCK: In production, uncomment AWS SDK imports
// const { DynamoDBClient, QueryCommand, GetItemCommand } = require('@aws-sdk/client-dynamodb');
// const { unmarshall } = require('@aws-sdk/util-dynamodb');

// MOCK: Initialize clients
// const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION });

/**
 * Verify audit signature
 * @param {Object} record - Attendance record
 * @param {string} secret - Session secret
 * @returns {boolean} True if signature is valid
 */
function verifyAuditSignature(record, secret) {
  const data = JSON.stringify({
    sessionId: record.sessionId,
    workerId: record.workerId,
    timestamp: record.timestamp,
    code: record.code
  });

  const hmac = crypto.createHmac('sha256', Buffer.from(secret, 'hex'));
  hmac.update(data);
  const expectedSignature = hmac.digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(record.auditSignature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    return false;
  }
}

/**
 * Generate mock attendance records for testing
 */
function generateMockRecords(sessionId, workerId) {
  const records = [];
  const now = Date.now();
  
  for (let i = 0; i < 3; i++) {
    const timestamp = new Date(now - i * 24 * 60 * 60 * 1000).toISOString();
    const secret = crypto.randomBytes(32).toString('hex');
    
    const record = {
      attendanceId: `att_${now - i * 1000}_${crypto.randomBytes(4).toString('hex')}`,
      sessionId: sessionId || `session_${now - i * 1000}`,
      workerId: workerId || `worker_${i}`,
      code: '123456',
      timestamp,
      markedBy: 'worker',
      location: {
        latitude: 19.0760 + (Math.random() - 0.5) * 0.01,
        longitude: 72.8777 + (Math.random() - 0.5) * 0.01
      },
      locationVerification: {
        distance: Math.floor(Math.random() * 200),
        withinRange: true
      }
    };

    // Generate audit signature
    const data = JSON.stringify({
      sessionId: record.sessionId,
      workerId: record.workerId,
      timestamp: record.timestamp,
      code: record.code
    });
    const hmac = crypto.createHmac('sha256', Buffer.from(secret, 'hex'));
    hmac.update(data);
    record.auditSignature = hmac.digest('hex');
    record._secret = secret; // For verification (not stored in real DB)

    records.push(record);
  }

  return records;
}

exports.handler = async (event) => {
  try {
    const params = event.queryStringParameters || {};
    const { sessionId, workerId, startDate, endDate, limit = '50' } = params;

    // Validate at least one filter is provided
    if (!sessionId && !workerId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Missing required parameters',
          message: 'Provide either sessionId or workerId'
        })
      };
    }

    // MOCK: Query attendance records from DynamoDB
    // In production, uncomment this:
    /*
    let queryParams;
    
    if (sessionId) {
      queryParams = {
        TableName: process.env.ATTENDANCE_RECORDS_TABLE,
        KeyConditionExpression: 'sessionId = :sessionId',
        ExpressionAttributeValues: marshall({
          ':sessionId': sessionId
        }),
        Limit: parseInt(limit)
      };
    } else {
      // Query by workerId using GSI
      queryParams = {
        TableName: process.env.ATTENDANCE_RECORDS_TABLE,
        IndexName: 'WorkerIdIndex',
        KeyConditionExpression: 'workerId = :workerId',
        ExpressionAttributeValues: marshall({
          ':workerId': workerId
        }),
        Limit: parseInt(limit)
      };
    }

    // Add date range filter if provided
    if (startDate || endDate) {
      let filterExpression = [];
      if (startDate) {
        queryParams.ExpressionAttributeValues[':startDate'] = { S: startDate };
        filterExpression.push('timestamp >= :startDate');
      }
      if (endDate) {
        queryParams.ExpressionAttributeValues[':endDate'] = { S: endDate };
        filterExpression.push('timestamp <= :endDate');
      }
      queryParams.FilterExpression = filterExpression.join(' AND ');
    }

    const result = await dynamodb.send(new QueryCommand(queryParams));
    const records = result.Items.map(item => unmarshall(item));
    */

    // MOCK: Generate mock records
    const records = generateMockRecords(sessionId, workerId);
    console.log('MOCK: Retrieved attendance records from DynamoDB');

    // Verify audit signatures for each record
    const verifiedRecords = await Promise.all(records.map(async (record) => {
      // MOCK: Get session secret for verification
      // In production, retrieve from DynamoDB
      /*
      const sessionParams = {
        TableName: process.env.WORK_SESSIONS_TABLE,
        Key: marshall({ sessionId: record.sessionId })
      };
      const sessionResult = await dynamodb.send(new GetItemCommand(sessionParams));
      const session = unmarshall(sessionResult.Item);
      const isValid = verifyAuditSignature(record, session.totpSecret);
      */

      // MOCK: Use stored secret for verification
      const isValid = verifyAuditSignature(record, record._secret);
      delete record._secret; // Remove mock secret
      delete record.code; // Don't expose TOTP code

      return {
        ...record,
        auditVerified: isValid,
        auditStatus: isValid ? 'verified' : 'tampered'
      };
    }));

    // Calculate summary statistics
    const summary = {
      totalRecords: verifiedRecords.length,
      verifiedRecords: verifiedRecords.filter(r => r.auditVerified).length,
      tamperedRecords: verifiedRecords.filter(r => !r.auditVerified).length,
      dateRange: {
        earliest: verifiedRecords.length > 0 ? 
          verifiedRecords[verifiedRecords.length - 1].timestamp : null,
        latest: verifiedRecords.length > 0 ? 
          verifiedRecords[0].timestamp : null
      }
    };

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        records: verifiedRecords,
        summary,
        filters: {
          sessionId: sessionId || null,
          workerId: workerId || null,
          startDate: startDate || null,
          endDate: endDate || null
        }
      })
    };

  } catch (error) {
    console.error('Error retrieving attendance log:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to retrieve attendance log',
        message: error.message
      })
    };
  }
};

// Export for testing
exports.verifyAuditSignature = verifyAuditSignature;
