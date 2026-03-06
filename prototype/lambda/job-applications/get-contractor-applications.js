/**
 * Get Contractor Applications Lambda Function
 * 
 * Retrieves job applications for a specific contractor
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const TABLE_NAME = process.env.JOB_APPLICATIONS_TABLE || 'Shram-setu-job-applications';

exports.handler = async (event) => {
  console.log('📋 Get contractor applications event:', JSON.stringify(event, null, 2));

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
    // Get contractorId from path parameters
    const contractorId = event.pathParameters?.contractorId;
    
    if (!contractorId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Missing contractorId parameter'
        })
      };
    }

    console.log('🔍 Querying applications for contractor:', contractorId);

    // Query applications by contractor ID using GSI
    const queryCommand = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'ContractorApplicationsIndex',
      KeyConditionExpression: 'contractorId = :contractorId',
      ExpressionAttributeValues: {
        ':contractorId': contractorId
      },
      ScanIndexForward: false, // Sort by appliedAt descending (newest first)
      Limit: 100 // Limit to 100 applications
    });

    const result = await docClient.send(queryCommand);
    
    console.log(`✅ Found ${result.Items?.length || 0} applications for contractor ${contractorId}`);

    // Group applications by status for easier management
    const applicationsByStatus = {
      pending: [],
      reviewed: [],
      accepted: [],
      rejected: []
    };

    result.Items?.forEach(app => {
      const status = app.status || 'pending';
      if (applicationsByStatus[status]) {
        applicationsByStatus[status].push(app);
      }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        applications: result.Items || [],
        applicationsByStatus,
        count: result.Items?.length || 0,
        summary: {
          total: result.Items?.length || 0,
          pending: applicationsByStatus.pending.length,
          reviewed: applicationsByStatus.reviewed.length,
          accepted: applicationsByStatus.accepted.length,
          rejected: applicationsByStatus.rejected.length
        }
      })
    };

  } catch (error) {
    console.error('❌ Error fetching contractor applications:', error);

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