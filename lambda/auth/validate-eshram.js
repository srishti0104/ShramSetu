/**
 * Lambda function to validate E-Shram credentials
 * 
 * @fileoverview Validates worker E-Shram card number against government database,
 * extracts worker information, and caches results in DynamoDB
 */

import crypto from 'crypto';

/**
 * Validate E-Shram number format
 * @param {string} eshramNumber - E-Shram card number
 * @returns {boolean}
 */
function isValidEshramFormat(eshramNumber) {
  // E-Shram number is 12 digits
  return /^\d{12}$/.test(eshramNumber);
}

/**
 * Call E-Shram API to validate credentials (MOCK)
 * @param {string} eshramNumber - E-Shram card number
 * @returns {Promise<Object | null>}
 */
async function callEshramAPI(eshramNumber) {
  console.log(`[MOCK E-Shram API] Validating E-Shram number: ${eshramNumber}`);
  
  // MOCK: In production, this will call the actual E-Shram government API
  // API endpoint: https://eshram.gov.in/api/validate (hypothetical)
  
  // Mock implementation - simulate API call
  // In production:
  // const response = await fetch('https://eshram.gov.in/api/validate', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${process.env.ESHRAM_API_KEY}`
  //   },
  //   body: JSON.stringify({ eshramNumber })
  // });
  // const data = await response.json();
  // return data;
  
  // Mock valid E-Shram data
  if (eshramNumber.startsWith('1234')) {
    return {
      eshramNumber,
      name: 'Mock Worker Name',
      dateOfBirth: '1990-01-15',
      gender: 'male',
      mobileNumber: '+919876543210',
      occupation: 'Construction Worker',
      skills: ['Masonry', 'Carpentry'],
      state: 'Maharashtra',
      district: 'Mumbai',
      address: 'Mock Address, Mumbai, Maharashtra',
      registrationDate: '2021-08-15',
      isActive: true,
      verified: true
    };
  }
  
  // Mock invalid E-Shram number
  return null;
}

/**
 * Get cached E-Shram data from DynamoDB (MOCK)
 * @param {string} eshramNumber - E-Shram card number
 * @returns {Promise<Object | null>}
 */
async function getCachedEshramData(eshramNumber) {
  console.log(`[MOCK DynamoDB] Getting cached E-Shram data: ${eshramNumber}`);
  
  // Mock implementation - in production:
  // const params = {
  //   TableName: 'shramik-setu-eshram-cache',
  //   Key: { eshramNumber }
  // };
  // const result = await dynamodb.get(params).promise();
  // return result.Item || null;
  
  return null;
}

/**
 * Cache E-Shram data in DynamoDB (MOCK)
 * @param {string} eshramNumber - E-Shram card number
 * @param {Object} data - E-Shram data
 * @param {number} ttlDays - Cache TTL in days
 */
async function cacheEshramData(eshramNumber, data, ttlDays = 30) {
  console.log(`[MOCK DynamoDB] Caching E-Shram data: ${eshramNumber}`);
  
  const ttl = Math.floor(Date.now() / 1000) + (ttlDays * 24 * 60 * 60);
  
  // Mock implementation - in production:
  // const params = {
  //   TableName: 'shramik-setu-eshram-cache',
  //   Item: {
  //     eshramNumber,
  //     data,
  //     cachedAt: new Date().toISOString(),
  //     ttl
  //   }
  // };
  // await dynamodb.put(params).promise();
}

/**
 * Extract worker information from E-Shram data
 * @param {Object} eshramData - E-Shram API response
 * @returns {Object}
 */
function extractWorkerInfo(eshramData) {
  return {
    eshramNumber: eshramData.eshramNumber,
    name: eshramData.name,
    dateOfBirth: eshramData.dateOfBirth,
    gender: eshramData.gender,
    mobileNumber: eshramData.mobileNumber,
    occupation: eshramData.occupation,
    skills: eshramData.skills || [],
    location: {
      state: eshramData.state,
      district: eshramData.district,
      address: eshramData.address
    },
    registrationDate: eshramData.registrationDate,
    isActive: eshramData.isActive,
    verified: eshramData.verified
  };
}

/**
 * Lambda handler for E-Shram validation
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} API Gateway response
 */
export async function handler(event) {
  const requestId = event.requestContext?.requestId || crypto.randomUUID();
  
  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { eshramNumber, forceRefresh } = body;
    
    // Validate input
    if (!eshramNumber) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'INVALID_INPUT',
          message: 'E-Shram number is required',
          category: 'validation',
          severity: 'error',
          requestId,
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Validate E-Shram number format
    if (!isValidEshramFormat(eshramNumber)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'INVALID_ESHRAM_FORMAT',
          message: 'E-Shram number must be 12 digits',
          category: 'validation',
          severity: 'error',
          requestId,
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Check cache first (unless forceRefresh is true)
    let eshramData = null;
    if (!forceRefresh) {
      const cachedData = await getCachedEshramData(eshramNumber);
      if (cachedData) {
        console.log(`[CACHE HIT] E-Shram data found in cache: ${eshramNumber}`);
        eshramData = cachedData.data;
      }
    }
    
    // If not in cache or forceRefresh, call E-Shram API
    if (!eshramData) {
      console.log(`[CACHE MISS] Calling E-Shram API: ${eshramNumber}`);
      eshramData = await callEshramAPI(eshramNumber);
      
      if (!eshramData) {
        return {
          statusCode: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            success: false,
            error: 'ESHRAM_NOT_FOUND',
            message: 'E-Shram number not found or invalid',
            category: 'not_found',
            severity: 'warning',
            requestId,
            timestamp: new Date().toISOString()
          })
        };
      }
      
      // Cache the result
      await cacheEshramData(eshramNumber, eshramData);
    }
    
    // Check if E-Shram registration is active
    if (!eshramData.isActive) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'ESHRAM_INACTIVE',
          message: 'E-Shram registration is inactive',
          category: 'validation',
          severity: 'warning',
          requestId,
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Extract worker information
    const workerInfo = extractWorkerInfo(eshramData);
    
    // Log audit trail
    console.log(`[AUDIT] E-Shram validated: ${eshramNumber} at ${new Date().toISOString()}`);
    
    // Return success response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'E-Shram credentials validated successfully',
        data: {
          workerInfo,
          validated: true,
          validatedAt: new Date().toISOString()
        },
        requestId,
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('[ERROR] Failed to validate E-Shram:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Failed to validate E-Shram credentials. Please try again.',
        category: 'server_error',
        severity: 'critical',
        requestId,
        timestamp: new Date().toISOString()
      })
    };
  }
}
