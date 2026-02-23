const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');
const jwt = require('jsonwebtoken');

const dynamoClient = new DynamoDBClient({ region: process.env.REGION || 'ap-south-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// JWT secret (in production, use AWS Secrets Manager)
const JWT_SECRET = process.env.JWT_SECRET || 'shram-setu-secret-key-change-in-production';

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  try {
    const body = JSON.parse(event.body);
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Phone number is required'
        })
      };
    }

    // Get user from DynamoDB
    const result = await docClient.send(new GetCommand({
      TableName: process.env.USERS_TABLE_NAME,
      Key: { phoneNumber }
    }));

    if (!result.Item) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'User not found'
        })
      };
    }

    const user = result.Item;

    if (!user.isActive) {
      return {
        statusCode: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'User account is inactive'
        })
      };
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.userId,
        phoneNumber: user.phoneNumber,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' } // Token valid for 7 days
    );

    // Remove sensitive data
    const { ...userData } = user;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Login successful',
        token,
        user: userData
      })
    };

  } catch (error) {
    console.error('Error:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
