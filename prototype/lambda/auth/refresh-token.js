/**
 * Lambda function for refreshing access token
 * 
 * @fileoverview Validates refresh token and generates new access token
 */

import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// JWT secrets (in production, use AWS Secrets Manager)
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key-change-in-production';

/**
 * Get stored refresh token from Redis (MOCK)
 * @param {string} userId - User ID
 * @returns {Promise<string | null>}
 */
async function getStoredRefreshToken(userId) {
  console.log(`[MOCK Redis] Getting refresh token for user: ${userId}`);
  
  // Mock implementation - in production:
  // const key = `refresh_token:${userId}`;
  // return await redisClient.get(key);
  
  return null;
}

/**
 * Delete refresh token from Redis (MOCK)
 * @param {string} userId - User ID
 */
async function deleteRefreshToken(userId) {
  console.log(`[MOCK Redis] Deleting refresh token for user: ${userId}`);
  
  // Mock implementation - in production:
  // const key = `refresh_token:${userId}`;
  // await redisClient.del(key);
}

/**
 * Store new refresh token in Redis (MOCK)
 * @param {string} userId - User ID
 * @param {string} refreshToken - Refresh token
 */
async function storeRefreshToken(userId, refreshToken) {
  console.log(`[MOCK Redis] Storing new refresh token for user: ${userId}`);
  
  // Mock implementation - in production:
  // const key = `refresh_token:${userId}`;
  // const ttl = 30 * 24 * 60 * 60; // 30 days in seconds
  // await redisClient.setex(key, ttl, refreshToken);
}

/**
 * Get user from DynamoDB (MOCK)
 * @param {string} userId - User ID
 * @returns {Promise<Object | null>}
 */
async function getUserById(userId) {
  console.log(`[MOCK DynamoDB] Getting user by ID: ${userId}`);
  
  // Mock implementation - in production:
  // const params = {
  //   TableName: 'shram-setu-users',
  //   Key: { userId }
  // };
  // const result = await dynamodb.get(params).promise();
  // return result.Item || null;
  
  return null;
}

/**
 * Generate JWT access token
 * @param {Object} user - User object
 * @returns {string}
 */
function generateAccessToken(user) {
  const payload = {
    userId: user.userId,
    phoneNumber: user.phoneNumber,
    role: user.role,
    languageCode: user.languageCode
  };
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1h',
    issuer: 'shram-setu',
    audience: 'shram-setu-app'
  });
}

/**
 * Generate JWT refresh token
 * @param {Object} user - User object
 * @returns {string}
 */
function generateRefreshToken(user) {
  const payload = {
    userId: user.userId,
    tokenId: crypto.randomUUID()
  };
  
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: '30d',
    issuer: 'shram-setu',
    audience: 'shram-setu-app'
  });
}

/**
 * Lambda handler for refreshing access token
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} API Gateway response
 */
export async function handler(event) {
  const requestId = event.requestContext?.requestId || crypto.randomUUID();
  
  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { refreshToken } = body;
    
    // Validate input
    if (!refreshToken) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'INVALID_INPUT',
          message: 'Refresh token is required',
          category: 'validation',
          severity: 'error',
          requestId,
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET, {
        issuer: 'shram-setu',
        audience: 'shram-setu-app'
      });
    } catch (error) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'INVALID_TOKEN',
          message: 'Invalid or expired refresh token',
          category: 'authentication',
          severity: 'warning',
          requestId,
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Check if refresh token exists in Redis
    const storedToken = await getStoredRefreshToken(decoded.userId);
    if (!storedToken || storedToken !== refreshToken) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'TOKEN_REVOKED',
          message: 'Refresh token has been revoked',
          category: 'authentication',
          severity: 'warning',
          requestId,
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Get user from database
    const user = await getUserById(decoded.userId);
    
    if (!user) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User not found',
          category: 'not_found',
          severity: 'warning',
          requestId,
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Check if user is active
    if (!user.isActive) {
      // Delete refresh token
      await deleteRefreshToken(user.userId);
      
      return {
        statusCode: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'USER_INACTIVE',
          message: 'User account is inactive',
          category: 'authorization',
          severity: 'warning',
          requestId,
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    
    // Delete old refresh token and store new one
    await deleteRefreshToken(user.userId);
    await storeRefreshToken(user.userId, newRefreshToken);
    
    // Log audit trail
    console.log(`[AUDIT] Token refreshed for user: ${user.userId} at ${new Date().toISOString()}`);
    
    // Return success response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          tokens: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            expiresIn: 3600, // 1 hour in seconds
            tokenType: 'Bearer'
          }
        },
        requestId,
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('[ERROR] Failed to refresh token:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Failed to refresh token. Please try again.',
        category: 'server_error',
        severity: 'critical',
        requestId,
        timestamp: new Date().toISOString()
      })
    };
  }
}

