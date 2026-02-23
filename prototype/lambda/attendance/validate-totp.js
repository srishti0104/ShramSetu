/**
 * Lambda Function: Validate TOTP
 * Validates a 6-digit TOTP code with 5-minute window
 * Supports time drift tolerance (±1 window)
 * 
 * @param {Object} event - API Gateway event
 * @param {string} event.body.sessionId - Work session ID
 * @param {string} event.body.code - 6-digit TOTP code
 * @param {string} event.body.workerId - Worker attempting validation
 * @returns {Object} Validation result
 */

const crypto = require('crypto');

// MOCK: In production, uncomment AWS SDK imports
// const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');
// const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

// MOCK: Initialize clients
// const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION });

// TOTP Configuration
const TOTP_WINDOW = 30; // 30 seconds per code
const TOTP_VALIDITY_WINDOWS = 10; // 5 minutes = 10 windows
const TOTP_DIGITS = 6;
const TIME_DRIFT_TOLERANCE = 1; // Allow ±1 window for clock drift

/**
 * Generate TOTP using HMAC-SHA256
 * @param {string} secret - Base secret for TOTP generation
 * @param {number} timeStep - Time step (epoch / 30)
 * @returns {string} 6-digit TOTP code
 */
function generateTOTP(secret, timeStep) {
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigUInt64BE(BigInt(timeStep));

  const hmac = crypto.createHmac('sha256', Buffer.from(secret, 'hex'));
  hmac.update(timeBuffer);
  const hash = hmac.digest();

  const offset = hash[hash.length - 1] & 0x0f;
  const binary = 
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

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
 * Validate TOTP code with time drift tolerance
 * @param {string} secret - Session TOTP secret
 * @param {string} code - Code to validate
 * @param {number} currentTimeStep - Current time step
 * @returns {Object} Validation result
 */
function validateTOTPCode(secret, code, currentTimeStep) {
  // Check current window and adjacent windows for time drift
  for (let drift = -TIME_DRIFT_TOLERANCE; drift <= TIME_DRIFT_TOLERANCE; drift++) {
    const timeStep = currentTimeStep + drift;
    const expectedCode = generateTOTP(secret, timeStep);
    
    if (expectedCode === code) {
      return {
        valid: true,
        timeStep,
        drift,
        message: drift === 0 ? 'Code valid' : `Code valid (time drift: ${drift * TOTP_WINDOW}s)`
      };
    }
  }

  return {
    valid: false,
    message: 'Invalid or expired code'
  };
}

/**
 * Check if code was recently used (prevent replay attacks)
 * @param {string} sessionId - Session ID
 * @param {string} code - TOTP code
 * @returns {Promise<boolean>} True if code was already used
 */
async function isCodeUsed(sessionId, code) {
  // MOCK: In production, check Redis for used codes
  /*
  const redis = require('redis');
  const redisClient = redis.createClient({ url: process.env.REDIS_URL });
  await redisClient.connect();
  
  const usedKey = `totp:used:${sessionId}:${code}`;
  const exists = await redisClient.exists(usedKey);
  
  await redisClient.disconnect();
  return exists === 1;
  */
  
  console.log('MOCK: Checking if code was used:', { sessionId, code });
  return false; // Mock: code not used
}

/**
 * Mark code as used
 * @param {string} sessionId - Session ID
 * @param {string} code - TOTP code
 * @param {number} ttl - Time to live in seconds
 */
async function markCodeAsUsed(sessionId, code, ttl) {
  // MOCK: In production, store in Redis with TTL
  /*
  const redis = require('redis');
  const redisClient = redis.createClient({ url: process.env.REDIS_URL });
  await redisClient.connect();
  
  const usedKey = `totp:used:${sessionId}:${code}`;
  await redisClient.setEx(usedKey, ttl, '1');
  
  await redisClient.disconnect();
  */
  
  console.log('MOCK: Marking code as used:', { sessionId, code, ttl });
}

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { sessionId, code, workerId } = body;

    // Validate required fields
    if (!sessionId || !code || !workerId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Missing required fields',
          required: ['sessionId', 'code', 'workerId']
        })
      };
    }

    // Validate code format
    if (!/^\d{6}$/.test(code)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Invalid code format',
          message: 'Code must be 6 digits'
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
      status: 'active',
      totpSecret: crypto.randomBytes(32).toString('hex'),
      createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString() // 2 minutes ago
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

    // Check if code was already used (prevent replay attacks)
    const codeUsed = await isCodeUsed(sessionId, code);
    if (codeUsed) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Code already used',
          message: 'This code has already been used for attendance'
        })
      };
    }

    // Validate TOTP code
    const currentTimeStep = getCurrentTimeStep();
    const validation = validateTOTPCode(session.totpSecret, code, currentTimeStep);

    if (!validation.valid) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Invalid code',
          message: validation.message
        })
      };
    }

    // Mark code as used (TTL = 5 minutes)
    await markCodeAsUsed(sessionId, code, TOTP_VALIDITY_WINDOWS * TOTP_WINDOW);

    // Return validation success
    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        validation: {
          valid: true,
          sessionId,
          workerId,
          validatedAt: new Date().toISOString(),
          timeStep: validation.timeStep,
          drift: validation.drift,
          message: validation.message
        }
      })
    };

  } catch (error) {
    console.error('Error validating TOTP:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to validate TOTP',
        message: error.message
      })
    };
  }
};

// Export for testing
exports.generateTOTP = generateTOTP;
exports.validateTOTPCode = validateTOTPCode;
exports.getCurrentTimeStep = getCurrentTimeStep;

