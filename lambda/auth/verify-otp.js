/**
 * Lambda function to verify OTP
 * 
 * @fileoverview Validates OTP against stored value in Redis with 60-second window,
 * implements attempt limiting (max 3 attempts)
 */

import crypto from 'crypto';

/**
 * Retrieve OTP from Redis (MOCK - will use ElastiCache Redis)
 * @param {string} phoneNumber - Phone number
 * @returns {Promise<{otp: string, attempts: number, createdAt: number} | null>}
 */
async function getOTPFromRedis(phoneNumber) {
  // MOCK: In production, this will use AWS ElastiCache Redis
  console.log(`[MOCK Redis] Retrieving OTP for ${phoneNumber}`);
  
  // Mock implementation - in production:
  // const data = await redisClient.get(`otp:${phoneNumber}`);
  // if (!data) return null;
  // return JSON.parse(data);
  
  // For testing, return mock data
  return null;
}

/**
 * Update OTP attempts in Redis (MOCK)
 * @param {string} phoneNumber - Phone number
 * @param {number} attempts - Current attempt count
 */
async function updateOTPAttempts(phoneNumber, attempts) {
  console.log(`[MOCK Redis] Updating OTP attempts for ${phoneNumber}: ${attempts}`);
  
  // Mock implementation - in production:
  // const data = await redisClient.get(`otp:${phoneNumber}`);
  // if (data) {
  //   const otpData = JSON.parse(data);
  //   otpData.attempts = attempts;
  //   const ttl = await redisClient.ttl(`otp:${phoneNumber}`);
  //   await redisClient.setex(`otp:${phoneNumber}`, ttl, JSON.stringify(otpData));
  // }
}

/**
 * Delete OTP from Redis (MOCK)
 * @param {string} phoneNumber - Phone number
 */
async function deleteOTPFromRedis(phoneNumber) {
  console.log(`[MOCK Redis] Deleting OTP for ${phoneNumber}`);
  
  // Mock implementation - in production:
  // await redisClient.del(`otp:${phoneNumber}`);
}

/**
 * Lambda handler for verifying OTP
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} API Gateway response
 */
export async function handler(event) {
  const requestId = event.requestContext?.requestId || crypto.randomUUID();
  
  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { phoneNumber, otp } = body;
    
    // Validate input
    if (!phoneNumber || !otp) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'INVALID_INPUT',
          message: 'Phone number and OTP are required',
          category: 'validation',
          severity: 'error',
          requestId,
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'INVALID_OTP_FORMAT',
          message: 'OTP must be 6 digits',
          category: 'validation',
          severity: 'error',
          requestId,
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Retrieve OTP from Redis
    const storedOTPData = await getOTPFromRedis(phoneNumber);
    
    if (!storedOTPData) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'OTP_NOT_FOUND',
          message: 'OTP not found or expired. Please request a new OTP.',
          category: 'not_found',
          severity: 'warning',
          requestId,
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Check if OTP has expired (60-second window)
    const currentTime = Date.now();
    const otpAge = (currentTime - storedOTPData.createdAt) / 1000; // in seconds
    
    if (otpAge > 60) {
      await deleteOTPFromRedis(phoneNumber);
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'OTP_EXPIRED',
          message: 'OTP has expired. Please request a new OTP.',
          category: 'validation',
          severity: 'warning',
          details: {
            expiresIn: 60,
            ageSeconds: Math.floor(otpAge)
          },
          requestId,
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Check attempt limit (max 3 attempts)
    if (storedOTPData.attempts >= 3) {
      await deleteOTPFromRedis(phoneNumber);
      return {
        statusCode: 429,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'MAX_ATTEMPTS_EXCEEDED',
          message: 'Maximum verification attempts exceeded. Please request a new OTP.',
          category: 'rate_limit',
          severity: 'warning',
          details: {
            maxAttempts: 3
          },
          requestId,
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Verify OTP
    if (otp !== storedOTPData.otp) {
      // Increment attempt count
      const newAttempts = storedOTPData.attempts + 1;
      await updateOTPAttempts(phoneNumber, newAttempts);
      
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'INVALID_OTP',
          message: 'Invalid OTP. Please try again.',
          category: 'validation',
          severity: 'warning',
          details: {
            attemptsRemaining: 3 - newAttempts
          },
          requestId,
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // OTP verified successfully - delete from Redis
    await deleteOTPFromRedis(phoneNumber);
    
    // Log audit trail
    console.log(`[AUDIT] OTP verified successfully for ${phoneNumber} at ${new Date().toISOString()}`);
    
    // Return success response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'OTP verified successfully',
        data: {
          phoneNumber,
          verified: true
        },
        requestId,
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('[ERROR] Failed to verify OTP:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Failed to verify OTP. Please try again.',
        category: 'server_error',
        severity: 'critical',
        requestId,
        timestamp: new Date().toISOString()
      })
    };
  }
}
