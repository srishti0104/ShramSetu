/**
 * Lambda function to verify OTP
 * 
 * @fileoverview Validates OTP against stored value in DynamoDB with 60-second window,
 * implements attempt limiting (max 3 attempts)
 */

import crypto from 'crypto';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: process.env.REGION || 'ap-south-1' });
const dynamodb = DynamoDBDocumentClient.from(client);

const OTP_TABLE = process.env.OTP_TABLE_NAME;

/**
 * Retrieve OTP from DynamoDB
 * @param {string} phoneNumber - Phone number
 * @returns {Promise<{otp: string, attempts: number, createdAt: number, expiresAt: number} | null>}
 */
async function getOTPFromDynamoDB(phoneNumber) {
  console.log(`[DynamoDB] Retrieving OTP for ${phoneNumber}`);
  
  try {
    const params = {
      TableName: OTP_TABLE,
      Key: { phoneNumber }
    };
    
    const result = await dynamodb.send(new GetCommand(params));
    return result.Item || null;
  } catch (error) {
    console.error('[ERROR] Failed to retrieve OTP:', error);
    throw error;
  }
}

/**
 * Update OTP attempts in DynamoDB
 * @param {string} phoneNumber - Phone number
 * @param {number} attempts - Current attempt count
 */
async function updateOTPAttempts(phoneNumber, attempts) {
  console.log(`[DynamoDB] Updating OTP attempts for ${phoneNumber}: ${attempts}`);
  
  try {
    const params = {
      TableName: OTP_TABLE,
      Key: { phoneNumber },
      UpdateExpression: 'SET attempts = :attempts',
      ExpressionAttributeValues: {
        ':attempts': attempts
      }
    };
    
    await dynamodb.send(new UpdateCommand(params));
  } catch (error) {
    console.error('[ERROR] Failed to update OTP attempts:', error);
    throw error;
  }
}

/**
 * Delete OTP from DynamoDB
 * @param {string} phoneNumber - Phone number
 */
async function deleteOTPFromDynamoDB(phoneNumber) {
  console.log(`[DynamoDB] Deleting OTP for ${phoneNumber}`);
  
  try {
    const params = {
      TableName: OTP_TABLE,
      Key: { phoneNumber }
    };
    
    await dynamodb.send(new DeleteCommand(params));
  } catch (error) {
    console.error('[ERROR] Failed to delete OTP:', error);
    throw error;
  }
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
    
    // Retrieve OTP from DynamoDB
    const storedOTPData = await getOTPFromDynamoDB(phoneNumber);
    
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
    const currentTime = Math.floor(Date.now() / 1000);
    const otpAge = currentTime - storedOTPData.createdAt; // in seconds
    
    if (otpAge > 60 || currentTime > storedOTPData.expiresAt) {
      await deleteOTPFromDynamoDB(phoneNumber);
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
            ageSeconds: otpAge
          },
          requestId,
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Check attempt limit (max 3 attempts)
    if (storedOTPData.attempts >= 3) {
      await deleteOTPFromDynamoDB(phoneNumber);
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
    
    // OTP verified successfully - delete from DynamoDB
    await deleteOTPFromDynamoDB(phoneNumber);
    
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

