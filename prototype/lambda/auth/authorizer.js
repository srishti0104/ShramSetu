/**
 * Lambda authorizer for API Gateway
 * 
 * @fileoverview Validates JWT access tokens and generates IAM policy
 * for API Gateway authorization
 */

import jwt from 'jsonwebtoken';

// JWT secret (in production, use AWS Secrets Manager)
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

/**
 * Generate IAM policy for API Gateway
 * @param {string} principalId - User ID
 * @param {string} effect - 'Allow' or 'Deny'
 * @param {string} resource - API Gateway resource ARN
 * @param {Object} context - Additional context to pass to Lambda
 * @returns {Object} IAM policy
 */
function generatePolicy(principalId, effect, resource, context = {}) {
  const authResponse = {
    principalId
  };
  
  if (effect && resource) {
    authResponse.policyDocument = {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource
        }
      ]
    };
  }
  
  // Add context to pass to Lambda functions
  if (Object.keys(context).length > 0) {
    authResponse.context = context;
  }
  
  return authResponse;
}

/**
 * Extract token from Authorization header
 * @param {string} authorizationHeader - Authorization header value
 * @returns {string | null} Token or null
 */
function extractToken(authorizationHeader) {
  if (!authorizationHeader) {
    return null;
  }
  
  // Expected format: "Bearer <token>"
  const parts = authorizationHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}

/**
 * Lambda authorizer handler
 * @param {Object} event - API Gateway authorizer event
 * @returns {Promise<Object>} IAM policy
 */
export async function handler(event) {
  console.log('[AUTHORIZER] Event:', JSON.stringify(event, null, 2));
  
  try {
    // Extract token from Authorization header
    const token = extractToken(event.authorizationToken);
    
    if (!token) {
      console.log('[AUTHORIZER] No token provided');
      throw new Error('Unauthorized');
    }
    
    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'shram-setu',
        audience: 'shram-setu-app'
      });
    } catch (error) {
      console.log('[AUTHORIZER] Token verification failed:', error.message);
      throw new Error('Unauthorized');
    }
    
    // Token is valid - generate Allow policy
    const policy = generatePolicy(
      decoded.userId,
      'Allow',
      event.methodArn,
      {
        userId: decoded.userId,
        role: decoded.role,
        phoneNumber: decoded.phoneNumber,
        languageCode: decoded.languageCode
      }
    );
    
    console.log('[AUTHORIZER] Authorization successful for user:', decoded.userId);
    return policy;
    
  } catch (error) {
    console.error('[AUTHORIZER] Authorization failed:', error.message);
    
    // Return Deny policy
    // Note: In production, you might want to return 'Unauthorized' error
    // instead of a Deny policy to avoid caching
    throw new Error('Unauthorized');
  }
}

/**
 * Alternative: Request-based authorizer (for custom authorization logic)
 * This can be used if you need more control over the authorization process
 * 
 * @param {Object} event - API Gateway request event
 * @returns {Promise<Object>} Authorization response
 */
export async function requestAuthorizer(event) {
  console.log('[REQUEST_AUTHORIZER] Event:', JSON.stringify(event, null, 2));
  
  try {
    // Extract token from headers
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    const token = extractToken(authHeader);
    
    if (!token) {
      return {
        isAuthorized: false,
        context: {}
      };
    }
    
    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'shram-setu',
        audience: 'shram-setu-app'
      });
    } catch (error) {
      return {
        isAuthorized: false,
        context: {}
      };
    }
    
    // Additional authorization checks can be added here
    // For example, check if user has permission for specific resource
    
    return {
      isAuthorized: true,
      context: {
        userId: decoded.userId,
        role: decoded.role,
        phoneNumber: decoded.phoneNumber,
        languageCode: decoded.languageCode
      }
    };
    
  } catch (error) {
    console.error('[REQUEST_AUTHORIZER] Authorization failed:', error);
    return {
      isAuthorized: false,
      context: {}
    };
  }
}

