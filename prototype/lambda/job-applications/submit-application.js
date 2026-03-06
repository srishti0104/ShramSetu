/**
 * Submit Job Application Lambda Function
 * 
 * Handles job application submissions to DynamoDB
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const TABLE_NAME = process.env.JOB_APPLICATIONS_TABLE || 'Shram-setu-job-applications';

exports.handler = async (event) => {
  console.log('📝 Job Application submission event:', JSON.stringify(event, null, 2));

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Accept',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight' })
    };
  }

  try {
    // Parse request body
    const requestBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    
    // Validate required fields
    const requiredFields = ['jobId', 'contractorId', 'applicantProfile'];
    for (const field of requiredFields) {
      if (!requestBody[field]) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: `Missing required field: ${field}`
          })
        };
      }
    }

    // Generate application ID
    const applicationId = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    // Prepare application data
    const applicationData = {
      applicationId,
      jobId: requestBody.jobId,
      contractorId: requestBody.contractorId,
      applicantProfile: requestBody.applicantProfile,
      jobDetails: requestBody.jobDetails || {},
      status: 'pending',
      appliedAt: timestamp,
      updatedAt: timestamp,
      
      // GSI keys for querying
      userId: requestBody.applicantProfile.userId || requestBody.applicantProfile.phoneNumber,
      contractorJobIndex: `${requestBody.contractorId}#${requestBody.jobId}`,
      
      // Additional metadata
      applicationSource: 'mobile_app',
      deviceInfo: requestBody.deviceInfo || {},
      location: requestBody.location || {}
    };

    console.log('💾 Saving application to DynamoDB:', applicationData);

    // Save to DynamoDB
    const putCommand = new PutCommand({
      TableName: TABLE_NAME,
      Item: applicationData,
      ConditionExpression: 'attribute_not_exists(applicationId)' // Prevent duplicates
    });

    await docClient.send(putCommand);

    console.log('✅ Application saved successfully');

    // Return success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Application submitted successfully',
        applicationId,
        status: 'pending',
        appliedAt: timestamp
      })
    };

  } catch (error) {
    console.error('❌ Error submitting application:', error);

    // Handle specific DynamoDB errors
    if (error.name === 'ConditionalCheckFailedException') {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Application already exists for this job'
        })
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to submit application',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};