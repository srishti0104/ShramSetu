/**
 * Get Job Lambda Function
 * Retrieves job by ID or contractor ID
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

// AWS SDK automatically uses the Lambda execution environment's region
const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

const JOBS_TABLE = process.env.JOBS_TABLE || 'Shram-setu-jobs';

exports.handler = async (event) => {
  console.log('Get Job Event:', JSON.stringify(event, null, 2));

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { jobId } = event.pathParameters || {};
    const { contractorId } = event.queryStringParameters || {};

    // Get single job by ID
    if (jobId) {
      const params = {
        TableName: JOBS_TABLE,
        Key: { jobId }
      };

      const result = await dynamodb.send(new GetCommand(params));

      if (!result.Item) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Job not found'
          })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          job: result.Item
        })
      };
    }

    // Get jobs by contractor
    if (contractorId) {
      const params = {
        TableName: JOBS_TABLE,
        IndexName: 'contractorId-index',
        KeyConditionExpression: 'contractorId = :contractorId',
        ExpressionAttributeValues: {
          ':contractorId': contractorId
        },
        ScanIndexForward: false
      };

      const result = await dynamodb.send(new QueryCommand(params));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          jobs: result.Items || [],
          count: result.Count || 0
        })
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Either jobId or contractorId is required'
      })
    };

  } catch (error) {
    console.error('Error fetching job:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to fetch job',
        message: error.message
      })
    };
  }
};
