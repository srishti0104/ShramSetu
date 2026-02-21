/**
 * Lambda Function: Generate TOTP
 * Generates a 6-digit Time-based One-Time Password using HMAC-SHA256
 * Valid for 5 minutes with 30-second rotation
 * 
 * @param {Object} event - API Gateway event
 * @param {string} event.body.sessionId - Work session ID
 * @param {string} event.body.contractorId - Contractor requesting TOTP
 * @returns {Object} TOTP code with expiration time
 */

const crypto = require('crypto');

// MOCK: In production, uncomment AWS SDK imports
// const { DynamoDBClient, GetItemCommand, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
// const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
// const { ElastiCacheClient } = require('@aws-sdk/client-elasticache');

// MOCK: Initialize clients
// const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION });

// TOTP Configuration
const TOTP_WINDOW = 30; // 30 seconds per code
const TOTP_VALIDITY = 300; // 5 minutes (10 windows)
const TOTP_DIGITS = 6;

/**
 * Generate TOTP using HMAC-SHA256
 * @param {string} secret - Base secret for TOTP generation
 * @param {number} timeStep - Current time step (epoch / 30)
 * @returns {string} 6-digit TOTP code
 */
function generateTOTP(secret, timeStep) {
  // Convert time step to 8-byte buffer (big-endian)
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigUInt64BE(BigInt(timeStep));

  // Generate HMAC-SHA256
  const hmac = crypto.createHmac('sha256', Buffer.from(secret, 'hex'));
  hmac.update(timeBuffer);
  const hash = hmac.digest();

  // Dynamic truncation (RFC 6238)
  const offset = hash[hash.length - 1] & 0x0f;
  const binary = 
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  // Generate 6-digit code
  const code = (binary % Math.pow(10, TOTP_DIGITS)).toString().padStart(TOTP_DIGITS, '0');
  return code;
}

/**
 * Get current time step
 * @returns {number} Current time step
 */
function getCurrentTimeStep() {
  return Math.floor(Date.now() / 1000 / TOTP_WINDOW);
}

/**
 * Calculate expiration time for current TOTP
 * @returns {Object} Expiration details
 */
function getExpirationInfo() {
  const now = Date.now();
  const currentWindow = Math.floor(now / 1000 / TOTP_WINDOW);
  const nextWindow = (currentWindow + 1) * TOTP_WINDOW * 1000;
  const expiresIn = Math.floor((nextWindow - now) / 1000);
  
  return {
    expiresAt: new Date(nextWindow).toISOString(),
    expiresIn, // seconds
    validUntil: new Date(now + TOTP_VALIDITY * 1000).toISOString()
  };
}

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { sessionId, contractorId } = body;

    // Validate required fields
    if (!sessionId || !contractorId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Missing required fields',
          required: ['sessionId', 'contractorId']
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
      contractorId,
      status: 'active',
      totpSecret: crypto.randomBytes(32).toString('hex')
    };

    console.log('MOCK: Retrieved session from DynamoDB');

    // Verify contractor owns this session
    if (session.contractorId !== contractorId) {
      return {
        statusCode: 403,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Unauthorized',
          message: 'You do not have permission to generate TOTP for this session'
        })
      };
    }

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

    // Generate TOTP
    const timeStep = getCurrentTimeStep();
    const totpCode = generateTOTP(session.totpSecret, timeStep);
    const expirationInfo = getExpirationInfo();

    // MOCK: Store TOTP in Redis with TTL
    // In production, uncomment this:
    /*
    const redis = require('redis');
    const redisClient = redis.createClient({
      url: process.env.REDIS_URL
    });
    await redisClient.connect();
    
    const totpKey = `totp:${sessionId}:${totpCode}`;
    await redisClient.setEx(totpKey, TOTP_VALIDITY, JSON.stringify({
      sessionId,
      code: totpCode,
      timeStep,
      generatedAt: new Date().toISOString()
    }));
    
    await redisClient.disconnect();
    */

    console.log('MOCK: Storing TOTP in Redis:', {
      sessionId,
      code: totpCode,
      timeStep,
      expiresIn: expirationInfo.expiresIn
    });

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        totp: {
          code: totpCode,
          sessionId,
          expiresAt: expirationInfo.expiresAt,
          expiresIn: expirationInfo.expiresIn,
          validUntil: expirationInfo.validUntil,
          rotationInterval: TOTP_WINDOW
        },
        message: 'TOTP generated successfully'
      })
    };

  } catch (error) {
    console.error('Error generating TOTP:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to generate TOTP',
        message: error.message
      })
    };
  }
};

// Export for testing
exports.generateTOTP = generateTOTP;
exports.getCurrentTimeStep = getCurrentTimeStep;
exports.getExpirationInfo = getExpirationInfo;
exports.TOTP_WINDOW = TOTP_WINDOW;
exports.TOTP_VALIDITY = TOTP_VALIDITY;

