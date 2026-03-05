/**
 * Submit Grievance Lambda Function
 * Handles voice-based grievance submissions with DynamoDB storage
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({ region: process.env.AWS_REGION });

const GRIEVANCE_TABLE = process.env.GRIEVANCE_TABLE;
const AUDIO_BUCKET = process.env.AUDIO_BUCKET;

/**
 * CORS headers for API Gateway
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

/**
 * Generate unique grievance ID
 */
function generateGrievanceId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `GRV_${timestamp}_${random}`;
}

/**
 * Calculate urgency score based on category and severity
 */
function calculateUrgencyScore(category, severity) {
  const categoryWeights = {
    'safety': 0.9,
    'harassment': 0.8,
    'wage': 0.6,
    'working_conditions': 0.5,
    'contract': 0.4,
    'other': 0.3
  };

  const severityWeights = {
    'critical': 1.0,
    'high': 0.8,
    'medium': 0.5,
    'low': 0.3
  };

  const categoryWeight = categoryWeights[category] || 0.3;
  const severityWeight = severityWeights[severity] || 0.3;
  
  return Math.round((categoryWeight + severityWeight) * 50);
}

/**
 * Determine assignment based on urgency
 */
function getAssignment(urgencyScore) {
  if (urgencyScore >= 80) {
    return {
      assignedTo: 'Emergency Response Team',
      priority: 'CRITICAL',
      responseTime: '2 hours'
    };
  } else if (urgencyScore >= 60) {
    return {
      assignedTo: 'NGO Legal Aid',
      priority: 'HIGH',
      responseTime: '24 hours'
    };
  } else if (urgencyScore >= 40) {
    return {
      assignedTo: 'Support Team',
      priority: 'MEDIUM',
      responseTime: '3-5 days'
    };
  } else {
    return {
      assignedTo: 'General Support',
      priority: 'LOW',
      responseTime: '1 week'
    };
  }
}

/**
 * Main Lambda handler
 */
exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  try {
    const body = JSON.parse(event.body);
    
    // Validate required fields
    const { category, severity, description, workerId, location, contractorName, isAnonymous, contactNumber, hasAudio } = body;
    
    if (!category || !severity || !description) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Missing required fields: category, severity, description'
        }),
      };
    }

    // Generate grievance data
    const grievanceId = generateGrievanceId();
    const submittedAt = new Date().toISOString();
    const urgencyScore = calculateUrgencyScore(category, severity);
    const assignment = getAssignment(urgencyScore);
    
    // Create grievance record
    const grievanceData = {
      grievanceId,
      submittedAt,
      workerId: isAnonymous ? 'ANONYMOUS' : (workerId || 'UNKNOWN'),
      category,
      severity,
      description,
      location: location || '',
      contractorName: contractorName || '',
      isAnonymous: Boolean(isAnonymous),
      contactNumber: isAnonymous ? '' : (contactNumber || ''),
      status: 'submitted',
      urgencyScore,
      assignedTo: assignment.assignedTo,
      priority: assignment.priority,
      expectedResponseTime: assignment.responseTime,
      hasAudio: Boolean(hasAudio),
      audioProcessed: false,
      transcription: '',
      createdAt: submittedAt,
      updatedAt: submittedAt,
      // Metadata for tracking
      source: 'web_app',
      version: '1.0',
      ipAddress: event.requestContext?.identity?.sourceIp || 'unknown',
      userAgent: event.headers?.['User-Agent'] || 'unknown'
    };

    // Store in DynamoDB
    const putCommand = new PutCommand({
      TableName: GRIEVANCE_TABLE,
      Item: grievanceData,
    });

    await docClient.send(putCommand);

    // Generate audio upload URL if needed
    let audioUploadUrl = null;
    if (hasAudio) {
      const audioKey = `grievances/${grievanceId}/audio.webm`;
      const putObjectCommand = new PutObjectCommand({
        Bucket: AUDIO_BUCKET,
        Key: audioKey,
        ContentType: 'audio/webm',
        Metadata: {
          grievanceId,
          uploadedAt: submittedAt,
        },
      });

      audioUploadUrl = await getSignedUrl(s3Client, putObjectCommand, { expiresIn: 3600 }); // 1 hour
    }

    // Generate tracking number for user
    const trackingNumber = `TRACK${grievanceId.split('_')[1]}`;

    console.log(`Grievance submitted successfully: ${grievanceId}`);

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        grievance: {
          grievanceId,
          trackingNumber,
          status: 'submitted',
          submittedAt,
          urgencyScore,
          assignedTo: assignment.assignedTo,
          priority: assignment.priority,
          expectedResponseTime: assignment.responseTime,
        },
        audioUploadUrl,
        message: 'Grievance submitted successfully. You will receive updates on the provided contact information.',
      }),
    };

  } catch (error) {
    console.error('Error submitting grievance:', error);
    
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to submit grievance. Please try again.',
      }),
    };
  }
};