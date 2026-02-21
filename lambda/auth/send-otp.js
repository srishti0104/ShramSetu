/**
 * Lambda function to generate and send OTP via SMS
 * 
 * @fileoverview Generates 6-digit OTP, stores in Redis with 60-second validity,
 * and sends via SMS (currently mocked, will integrate with AWS SNS)
 */

import crypto from 'crypto';

/**
 * Generate a 6-digit OTP
 * @returns {string} 6-digit OTP
 */
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Store OTP in Redis with TTL (MOCK - will use ElastiCache Redis)
 * @param {string} phoneNumber - Phone number
 * @param {string} otp - OTP code
 * @param {number} ttlSeconds - Time to live in seconds
 */
async function storeOTPInRedis(phoneNumber, otp, ttlSeconds = 60) {
  // MOCK: In production, this will use AWS ElastiCache Redis
  // Key format: otp:{phoneNumber}
  // Value: {otp, attempts: 0, createdAt: timestamp}
  
  console.log(`[MOCK Redis] Storing OTP for ${phoneNumber}: ${otp} (TTL: ${ttlSeconds}s)`);
  
  // Mock implementation - in production:
  // await redisClient.setex(`otp:${phoneNumber}`, ttlSeconds, JSON.stringify({
  //   otp,
  //   attempts: 0,
  //   createdAt: Date.now()
  // }));
  
  return true;
}

/**
 * Send OTP via SMS (MOCK - will use AWS SNS)
 * @param {string} phoneNumber - Phone number with country code
 * @param {string} otp - OTP code
 */
async function sendSMS(phoneNumber, otp) {
  // MOCK: In production, this will use AWS SNS
  console.log(`[MOCK SMS] Sending OTP to ${phoneNumber}: ${otp}`);
  console.log(`SMS Content: Your shram-Setu verification code is ${otp}. Valid for 60 seconds. Do not share this code.`);
  
  // Mock implementation - in production:
  // const params = {
  //   Message: `Your shram-Setu verification code is ${otp}. Valid for 60 seconds. Do not share this code.`,
  //   PhoneNumber: phoneNumber,
  //   MessageAttributes: {
  //     'AWS.SNS.SMS.SMSType': {
  //       DataType: 'String',
  //       StringValue: 'Transactional'
  //     }
  //   }
  // };
  // await sns.publish(params).promise();
  
  return true;
}

/**
 * Check rate limiting (MOCK - will use Redis)
 * @param {string} phoneNumber - Phone number
 * @returns {Promise<{allowed: boolean, retryAfter?: number}>}
 */
async function checkRateLimit(phoneNumber) {
  // MOCK: In production, check Redis for rate limiting
  // Allow max 3 OTP requests per phone number per 15 minutes
  
  console.log(`[MOCK Redis] Checking rate limit for ${phoneNumber}`);
  
  // Mock implementation - in production:
  // const key = `otp_rate_limit:${phoneNumber}`;
  // const count = await redisClient.incr(key);
  // if (count === 1) {
  //   await redisClient.expire(key, 900); // 15 minutes
  // }
  // if (count > 3) {
  //   const ttl = await redisClient.ttl(key);
  //   return { allowed: false, retryAfter: ttl };
  // }
  
  return { allowed: true };
}

/**
 * Lambda handler for sending OTP
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} API Gateway response
 */
export async function handler(event) {
  const requestId = event.requestContext?.requestId || crypto.randomUUID();
  
  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { phoneNumber } = body;
    
    // Validate phone number
    if (!phoneNumber) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'INVALID_INPUT',
          message: 'Phone number is required',
          category: 'validation',
          severity: 'error',
          requestId,
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Validate phone number format (Indian mobile: +91XXXXXXXXXX)
    const phoneRegex = /^\+91[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'INVALID_PHONE_FORMAT',
          message: 'Invalid phone number format. Expected: +91XXXXXXXXXX',
          category: 'validation',
          severity: 'error',
          requestId,
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Check rate limiting
    const rateLimitCheck = await checkRateLimit(phoneNumber);
    if (!rateLimitCheck.allowed) {
      return {
        statusCode: 429,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Retry-After': rateLimitCheck.retryAfter.toString()
        },
        body: JSON.stringify({
          success: false,
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many OTP requests. Please try again later.',
          category: 'rate_limit',
          severity: 'warning',
          details: {
            retryAfter: rateLimitCheck.retryAfter
          },
          requestId,
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP in Redis with 60-second TTL
    await storeOTPInRedis(phoneNumber, otp, 60);
    
    // Send OTP via SMS
    await sendSMS(phoneNumber, otp);
    
    // Log audit trail
    console.log(`[AUDIT] OTP sent to ${phoneNumber} at ${new Date().toISOString()}`);
    
    // Return success response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'OTP sent successfully',
        data: {
          phoneNumber,
          expiresIn: 60,
          // In development, include OTP for testing
          ...(process.env.NODE_ENV === 'development' && { otp })
        },
        requestId,
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('[ERROR] Failed to send OTP:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Failed to send OTP. Please try again.',
        category: 'server_error',
        severity: 'critical',
        requestId,
        timestamp: new Date().toISOString()
      })
    };
  }
}

