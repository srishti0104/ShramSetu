/**
 * Update Application Status Lambda Function
 * 
 * Updates the status of a job application
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const TABLE_NAME = process.env.JOB_APPLICATIONS_TABLE || 'Shram-setu-job-applications';

exports.handler = async (event) => {
  console.log('📝 Update application status event:', JSON.stringify(event, null, 2));

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Accept',
    'Access-Control-Allow-Methods': 'PUT,OPTIONS',
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
    // Get applicationId from path parameters
    const applicationId = event.pathParameters?.applicationId;
    
    if (!applicationId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Missing applicationId parameter'
        })
      };
    }

    // Parse request body
    const requestBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    
    const { status, contractorId } = requestBody;
    
    // Validate required fields
    if (!status || !contractorId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Missing required fields: status, contractorId'
        })
      };
    }

    // Validate status values
    const validStatuses = ['pending', 'reviewed', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        })
      };
    }

    console.log(`🔄 Updating application ${applicationId} status to ${status}`);

    // First, get the application to verify contractor ownership
    const getCommand = new GetCommand({
      TableName: TABLE_NAME,
      Key: { applicationId }
    });

    const getResult = await docClient.send(getCommand);
    
    if (!getResult.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Application not found'
        })
      };
    }

    // Verify that the contractor owns this application
    if (getResult.Item.contractorId !== contractorId) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Unauthorized: You can only update applications for your own jobs'
        })
      };
    }

    // Update the application status
    const updateCommand = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { applicationId },
      UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': status,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    });

    const updateResult = await docClient.send(updateCommand);
    
    console.log('✅ Application status updated successfully');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Application status updated successfully',
        application: updateResult.Attributes
      })
    };

  } catch (error) {
    console.error('❌ Error updating application status:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to update application status',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};