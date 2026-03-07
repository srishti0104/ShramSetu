/**
 * Update Job Status Lambda Function
 * Updates job status (open, filled, cancelled)
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

// AWS SDK automatically uses the Lambda execution environment's region
const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

const JOBS_TABLE = process.env.JOBS_TABLE || 'Shram-setu-jobs';

exports.handler = async (event) => {
  console.log('Update Job Status Event:', JSON.stringify(event, null, 2));

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'PATCH,OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { jobId } = event.pathParameters || {};
    const body = JSON.parse(event.body || '{}');
    const { status } = body;

    if (!jobId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'jobId is required'
        })
      };
    }

    if (!status || !['open', 'filled', 'cancelled'].includes(status)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Invalid status. Must be: open, filled, or cancelled'
        })
      };
    }

    const params = {
      TableName: JOBS_TABLE,
      Key: { jobId },
      UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': status,
        ':updatedAt': Date.now()
      },
      ReturnValues: 'ALL_NEW'
    };

    const result = await dynamodb.send(new UpdateCommand(params));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        job: result.Attributes,
        message: 'Job status updated successfully'
      })
    };

  } catch (error) {
    console.error('Error updating job status:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to update job status',
        message: error.message
      })
    };
  }
};
