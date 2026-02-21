/**
 * Lambda function for user login
 * 
 * @fileoverview Authenticates user and generates JWT tokens
 * (access token: 1 hour, refresh token: 30 days)
 */

import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// JWT secret (in production, use AWS Secrets Manager)
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key-change-in-production';

/**
 * Get user from DynamoDB (MOCK)
 * @param {string} phoneNumber - Phone number
 * @returns {Promise<Object | null>}
 */
async function getUserByPhone(phoneNumber) {
  console.log(`[MOCK DynamoDB] Getting user by phone: ${phoneNumber}`);
  
  // Mock implementation - in production:
  // const params = {
  //   TableName: 'shram-setu-users',
  //   IndexName: 'phoneNumber-index',
  //   KeyConditionExpression: 'phoneNumber = :phone',
  //   ExpressionAttributeValues: {
  //     ':phone': phoneNumber
  //   }
  // };
  // const result = await dynamodb.query(params).promise();
  // return result.Items?.[0] || null;
  
  return null;
}

/**
 * Update user last login timestamp (MOCK)
 * @param {string} userId - User ID
 */
async function updateLastLogin(userId) {
  console.log(`[MOCK DynamoDB] Updating last login for user: ${userId}`);
  
  // Mock implementation - in production:
  // const params = {
  //   TableName: 'shram-setu-users',
  //   Key: { userId },
  //   UpdateExpression: 'SET lastLoginAt = :now, updatedAt = :now',
  //   ExpressionAttributeValues: {
  //     ':now': new Date().toISOString()
  //   }
  // };
  // await dynamodb.update(params).promise();
}

/**
 * Store refresh token in Redis (MOCK)
 * @param {string} userId - User ID
 * @param {string} refreshToken - Refresh token
 */
async function storeRefreshToken(userId, refreshToken) {
  console.log(`[MOCK Redis] Storing refresh token for user: ${userId}`);
  
  // Mock implementation - in production:
  // const key = `refresh_token:${userId}`;
  // const ttl = 30 * 24 * 60 * 60; // 30 days in seconds
  // await redisClient.setex(key, ttl, refreshToken);
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
 * Lambda handler for user login
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} API Gateway response
 */
export async function handler(event) {
  const requestId = event.requestContext?.requestId || crypto.randomUUID();
  
  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { phoneNumber } = body;
    
    // Validate input
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
    
    // Get user from database
    const user = await getUserByPhone(phoneNumber);
    
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
          message: 'User not found. Please register first.',
          category: 'not_found',
          severity: 'warning',
          requestId,
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Check if user is active
    if (!user.isActive) {
      return {
        statusCode: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'USER_INACTIVE',
          message: 'User account is inactive. Please contact support.',
          category: 'authorization',
          severity: 'warning',
          requestId,
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Store refresh token
    await storeRefreshToken(user.userId, refreshToken);
    
    // Update last login timestamp
    await updateLastLogin(user.userId);
    
    // Log audit trail
    console.log(`[AUDIT] User logged in: ${user.userId} at ${new Date().toISOString()}`);
    
    // Prepare user data (exclude sensitive fields)
    const { phoneNumber: _, ...safeUserData } = user;
    
    // Return success response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Login successful',
        data: {
          user: safeUserData,
          tokens: {
            accessToken,
            refreshToken,
            expiresIn: 3600, // 1 hour in seconds
            tokenType: 'Bearer'
          }
        },
        requestId,
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('[ERROR] Failed to login user:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Failed to login. Please try again.',
        category: 'server_error',
        severity: 'critical',
        requestId,
        timestamp: new Date().toISOString()
      })
    };
  }
}

