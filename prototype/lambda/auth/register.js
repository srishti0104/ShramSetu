/**
 * Lambda function for user registration
 * 
 * @fileoverview Creates new user account after OTP verification,
 * stores user data in DynamoDB
 */

import crypto from 'crypto';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: process.env.REGION || 'ap-south-1' });
const dynamodb = DynamoDBDocumentClient.from(client);

const USERS_TABLE = process.env.USERS_TABLE_NAME;

/**
 * Check if user exists in DynamoDB
 * @param {string} phoneNumber - Phone number
 * @returns {Promise<boolean>}
 */
async function userExists(phoneNumber) {
  console.log(`[DynamoDB] Checking if user exists: ${phoneNumber}`);
  
  try {
    const params = {
      TableName: USERS_TABLE,
      Key: { phoneNumber }
    };
    
    const result = await dynamodb.send(new GetCommand(params));
    return !!result.Item;
  } catch (error) {
    console.error('[ERROR] Failed to check user existence:', error);
    throw error;
  }
}

/**
 * Create user in DynamoDB
 * @param {Object} userData - User data
 * @returns {Promise<Object>}
 */
async function createUser(userData) {
  console.log(`[DynamoDB] Creating user:`, { phoneNumber: userData.phoneNumber, role: userData.role });
  
  try {
    const params = {
      TableName: USERS_TABLE,
      Item: userData,
      ConditionExpression: 'attribute_not_exists(phoneNumber)' // Prevent overwriting
    };
    
    await dynamodb.send(new PutCommand(params));
    return userData;
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      throw new Error('USER_EXISTS');
    }
    console.error('[ERROR] Failed to create user:', error);
    throw error;
  }
}

/**
 * Lambda handler for user registration
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} API Gateway response
 */
export async function handler(event) {
  const requestId = event.requestContext?.requestId || crypto.randomUUID();
  
  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const {
      phoneNumber,
      role, // 'worker' or 'contractor'
      languageCode,
      name,
      eshramNumber // Optional for workers
    } = body;
    
    // Validate required fields
    if (!phoneNumber || !role || !languageCode) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'INVALID_INPUT',
          message: 'Phone number, role, and language code are required',
          category: 'validation',
          severity: 'error',
          requestId,
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Validate role
    if (!['worker', 'contractor'].includes(role)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'INVALID_ROLE',
          message: 'Role must be either "worker" or "contractor"',
          category: 'validation',
          severity: 'error',
          requestId,
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Validate language code
    const validLanguages = ['hi', 'en', 'mr', 'gu', 'ta', 'te', 'kn', 'ml', 'bn', 'pa'];
    if (!validLanguages.includes(languageCode)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'INVALID_LANGUAGE',
          message: `Language code must be one of: ${validLanguages.join(', ')}`,
          category: 'validation',
          severity: 'error',
          requestId,
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Check if user already exists
    const exists = await userExists(phoneNumber);
    if (exists) {
      return {
        statusCode: 409,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'USER_EXISTS',
          message: 'User with this phone number already exists',
          category: 'conflict',
          severity: 'warning',
          requestId,
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Generate user ID
    const userId = crypto.randomUUID();
    
    // Create user object
    const now = new Date().toISOString();
    const userData = {
      userId,
      phoneNumber,
      role,
      name: name || null,
      languageCode,
      isActive: true,
      isVerified: true, // Phone verified via OTP
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
      // Role-specific profile initialization
      ...(role === 'worker' && {
        workerProfile: {
          eshramNumber: eshramNumber || null,
          skills: [],
          experience: null,
          preferredLocations: [],
          availability: 'available',
          trustTier: 'unrated',
          totalJobsCompleted: 0,
          overallRating: 0,
          totalRatings: 0
        }
      }),
      ...(role === 'contractor' && {
        contractorProfile: {
          companyName: null,
          businessType: null,
          gstNumber: null,
          trustTier: 'unrated',
          totalJobsPosted: 0,
          overallRating: 0,
          totalRatings: 0
        }
      }),
      preferences: {
        notifications: {
          push: true,
          sms: true,
          email: false
        },
        accessibility: {
          highContrast: false,
          screenReader: false,
          fontSize: 'medium'
        }
      }
    };
    
    // Create user in DynamoDB
    await createUser(userData);
    
    // Log audit trail
    console.log(`[AUDIT] User registered: ${userId} (${phoneNumber}) as ${role} at ${now}`);
    
    // Return success response (exclude sensitive data)
    const { phoneNumber: _, ...safeUserData } = userData;
    
    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'User registered successfully',
        data: {
          user: safeUserData
        },
        requestId,
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('[ERROR] Failed to register user:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Failed to register user. Please try again.',
        category: 'server_error',
        severity: 'critical',
        requestId,
        timestamp: new Date().toISOString()
      })
    };
  }
}

