/**
 * Update Grievance Status Lambda Function
 * Updates grievance status for admin actions
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const GRIEVANCE_TABLE = process.env.GRIEVANCE_TABLE;

/**
 * CORS headers for API Gateway
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

/**
 * Valid status transitions
 */
const VALID_STATUSES = [
  'submitted',
  'under_review',
  'investigating',
  'escalated',
  'resolved',
  'closed',
  'rejected'
];

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
    const grievanceId = event.pathParameters?.grievanceId;
    const body = JSON.parse(event.body);
    const { status, adminNotes, assignedTo, submittedAt } = body;

    if (!grievanceId || !submittedAt) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Missing required fields: grievanceId, submittedAt'
        }),
      };
    }

    if (!status || !VALID_STATUSES.includes(status)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: `Invalid status. Valid statuses: ${VALID_STATUSES.join(', ')}`
        }),
      };
    }

    // First, get the current grievance to verify it exists
    const getCommand = new GetCommand({
      TableName: GRIEVANCE_TABLE,
      Key: {
        grievanceId,
        submittedAt,
      },
    });

    const currentGrievance = await docClient.send(getCommand);
    
    if (!currentGrievance.Item) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Grievance not found'
        }),
      };
    }

    // Prepare update expression
    let updateExpression = 'SET #status = :status, updatedAt = :updatedAt';
    let expressionAttributeNames = {
      '#status': 'status',
    };
    let expressionAttributeValues = {
      ':status': status,
      ':updatedAt': new Date().toISOString(),
    };

    // Add admin notes if provided
    if (adminNotes) {
      updateExpression += ', adminNotes = :adminNotes';
      expressionAttributeValues[':adminNotes'] = adminNotes;
    }

    // Update assigned person if provided
    if (assignedTo) {
      updateExpression += ', assignedTo = :assignedTo';
      expressionAttributeValues[':assignedTo'] = assignedTo;
    }

    // Add status history
    const statusHistory = currentGrievance.Item.statusHistory || [];
    statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      adminNotes: adminNotes || '',
      assignedTo: assignedTo || currentGrievance.Item.assignedTo,
    });

    updateExpression += ', statusHistory = :statusHistory';
    expressionAttributeValues[':statusHistory'] = statusHistory;

    // Update the grievance
    const updateCommand = new UpdateCommand({
      TableName: GRIEVANCE_TABLE,
      Key: {
        grievanceId,
        submittedAt,
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    const result = await docClient.send(updateCommand);

    console.log(`Grievance ${grievanceId} status updated to ${status}`);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        grievance: result.Attributes,
        message: `Grievance status updated to ${status}`,
      }),
    };

  } catch (error) {
    console.error('Error updating grievance status:', error);
    
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to update grievance status. Please try again.',
      }),
    };
  }
};