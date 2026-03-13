/**
 * Lambda function for user login
 * 
 * @fileoverview Authenticates user and generates JWT tokens
 * (access token: 1 hour, refresh token: 30 days)
 */

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: process.env.REGION || 'ap-south-1' });
const dynamodb = DynamoDBDocumentClient.from(client);

const USERS_TABLE = process.env.USERS_TABLE_NAME;

// JWT secret (in production, use AWS Secrets Manager)
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key-change-in-production';

/**
 * Get user from DynamoDB
 * @param {string} phoneNumber - Phone number
 * @returns {Promise<Object | null>}
 */
async function getUserByPhone(phoneNumber) {
  console.log(`[DynamoDB] Getting user by phone: ${phoneNumber}`);
  
  try {
    const params = {
      TableName: USERS_TABLE,
      Key: { phoneNumber }
    };
    
    const result = await dynamodb.send(new GetCommand(params));
    return result.Item || null;
  } catch (error) {
    console.error('[ERROR] Failed to get user:', error);
    throw error;
  }
}

/**
 * Update user last login timestamp
 * @param {string} phoneNumber - Phone number
 */
async function updateLastLogin(phoneNumber) {
  console.log(`[DynamoDB] Updating last login for user: ${phoneNumber}`);
  
  try {
    const now = new Date().toISOString();
    const params = {
      TableName: USERS_TABLE,
      Key: { phoneNumber },
      UpdateExpression: 'SET lastLoginAt = :now, updatedAt = :now',
      ExpressionAttributeValues: {
        ':now': now
      }
    };
    
    await dynamodb.send(new UpdateCommand(params));
  } catch (error) {
    console.error('[ERROR] Failed to update last login:', error);
    // Don't throw - this is not critical
  }
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
    await updateLastLogin(user.phoneNumber);
    
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

