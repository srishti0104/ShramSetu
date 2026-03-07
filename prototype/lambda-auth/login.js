const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const dynamoClient = new DynamoDBClient({ region: process.env.REGION || 'ap-south-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// JWT secret (in production, use AWS Secrets Manager)
const JWT_SECRET = process.env.JWT_SECRET || 'shram-setu-secret-key-change-in-production';

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  try {
    const body = JSON.parse(event.body);
    const { phoneNumber, password } = body;

    // Validate required fields
    if (!phoneNumber || !password) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Phone number and password are required'
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
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Invalid phone number or password'
        })
      };
    }

    const user = result.Item;

    // Check if account is active
    if (!user.isActive) {
      return {
        statusCode: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Account is inactive'
        })
      };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Invalid phone number or password'
        })
      };
    }

    // Update last login time
    await docClient.send(new UpdateCommand({
      TableName: process.env.USERS_TABLE_NAME,
      Key: { phoneNumber },
      UpdateExpression: 'SET lastLoginAt = :timestamp',
      ExpressionAttributeValues: {
        ':timestamp': new Date().toISOString()
      }
    }));

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

    // Remove password before returning
    const { password: _, ...userData } = user;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Login successful',
        user: userData,
        token
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
        error: 'Login failed',
        message: error.message
      })
    };
  }
};
