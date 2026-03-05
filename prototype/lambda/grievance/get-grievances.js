/**
 * Get Grievances Lambda Function
 * Retrieves grievances for admin dashboard
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

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
    const queryParams = event.queryStringParameters || {};
    const { status, workerId, limit, lastKey } = queryParams;

    let command;
    let params = {
      TableName: GRIEVANCE_TABLE,
      Limit: parseInt(limit) || 50,
    };

    if (lastKey) {
      params.ExclusiveStartKey = JSON.parse(decodeURIComponent(lastKey));
    }

    if (status) {
      // Query by status using GSI
      command = new QueryCommand({
        ...params,
        IndexName: 'StatusIndex',
        KeyConditionExpression: '#status = :status',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': status,
        },
        ScanIndexForward: false, // Most recent first
      });
    } else if (workerId) {
      // Query by worker ID using GSI
      command = new QueryCommand({
        ...params,
        IndexName: 'WorkerIdIndex',
        KeyConditionExpression: 'workerId = :workerId',
        ExpressionAttributeValues: {
          ':workerId': workerId,
        },
        ScanIndexForward: false, // Most recent first
      });
    } else {
      // Scan all grievances (for admin dashboard)
      command = new ScanCommand(params);
    }

    const result = await docClient.send(command);

    // Calculate statistics
    const stats = {
      total: result.Items.length,
      byStatus: {},
      byCategory: {},
      bySeverity: {},
      byPriority: {},
    };

    result.Items.forEach(item => {
      // Count by status
      stats.byStatus[item.status] = (stats.byStatus[item.status] || 0) + 1;
      
      // Count by category
      stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
      
      // Count by severity
      stats.bySeverity[item.severity] = (stats.bySeverity[item.severity] || 0) + 1;
      
      // Count by priority
      stats.byPriority[item.priority] = (stats.byPriority[item.priority] || 0) + 1;
    });

    // Prepare response
    const response = {
      success: true,
      grievances: result.Items.map(item => ({
        ...item,
        // Hide sensitive information for non-admin users
        contactNumber: item.isAnonymous ? 'ANONYMOUS' : (item.contactNumber || 'N/A'),
        ipAddress: undefined, // Remove IP address from response
        userAgent: undefined, // Remove user agent from response
      })),
      statistics: stats,
      pagination: {
        hasMore: !!result.LastEvaluatedKey,
        lastKey: result.LastEvaluatedKey ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey)) : null,
        count: result.Items.length,
      },
    };

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(response),
    };

  } catch (error) {
    console.error('Error retrieving grievances:', error);
    
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to retrieve grievances. Please try again.',
      }),
    };
  }
};