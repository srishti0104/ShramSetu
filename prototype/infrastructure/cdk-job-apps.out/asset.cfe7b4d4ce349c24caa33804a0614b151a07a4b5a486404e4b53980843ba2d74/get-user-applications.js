/**
 * Get User Applications Lambda Function
 * 
 * Retrieves job applications for a specific user
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const TABLE_NAME = process.env.JOB_APPLICATIONS_TABLE || 'Shram-setu-job-applications';

exports.handler = async (event) => {
  console.log('📋 Get user applications event:', JSON.stringify(event, null, 2));

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Accept',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
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
    // Get userId from path parameters
    const userId = event.pathParameters?.userId;
    
    if (!userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Missing userId parameter'
        })
      };
    }

    console.log('🔍 Querying applications for user:', userId);

    // Query applications by user ID using GSI
    const queryCommand = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'UserApplicationsIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false, // Sort by appliedAt descending (newest first)
      Limit: 50 // Limit to 50 applications
    });

    const result = await docClient.send(queryCommand);
    
    console.log(`✅ Found ${result.Items?.length || 0} applications for user ${userId}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        applications: result.Items || [],
        count: result.Items?.length || 0
      })
    };

  } catch (error) {
    console.error('❌ Error fetching user applications:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to fetch applications',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};