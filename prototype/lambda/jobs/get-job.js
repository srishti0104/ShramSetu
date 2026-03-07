/**
 * Lambda Function: Get Job
 * Retrieves a job by ID from DynamoDB
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' });
const dynamodb = DynamoDBDocumentClient.from(client);

const JOBS_TABLE = process.env.JOBS_TABLE || 'Shram-setu-jobs';

exports.handler = async (event) => {
  console.log('Get Job Lambda - Event:', JSON.stringify(event, null, 2));

  try {
    const jobId = event.pathParameters?.jobId;

    if (!jobId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'jobId is required'
        })
      };
    }

    const params = {
      TableName: JOBS_TABLE,
      Key: { jobId }
    };

    const result = await dynamodb.send(new GetCommand(params));

    if (!result.Item) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Job not found'
        })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        job: result.Item
      })
    };

  } catch (error) {
    console.error('Error fetching job:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Failed to fetch job',
        message: error.message
      })
    };
  }
};
