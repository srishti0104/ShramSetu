const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto');

const dynamoClient = new DynamoDBClient({ region: process.env.REGION || 'ap-south-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Generate unique user ID
function generateUserId() {
  return 'user_' + crypto.randomBytes(16).toString('hex');
}

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  try {
    const body = JSON.parse(event.body);
    const { phoneNumber, name, role, occupation, location, eShramId } = body;

    if (!phoneNumber || !name || !role) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Phone number, name, and role are required'
        })
      };
    }

    // Check if user already exists
    const existingUser = await docClient.send(new GetCommand({
      TableName: process.env.USERS_TABLE_NAME,
      Key: { phoneNumber }
    }));

    if (existingUser.Item) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'User already exists'
        })
      };
    }

    // Create new user
    const userId = generateUserId();
    const user = {
      userId,
      phoneNumber,
      name,
      role, // 'worker' or 'employer'
      occupation: occupation || null,
      location: location || null,
      eShramId: eShramId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };

    await docClient.send(new PutCommand({
      TableName: process.env.USERS_TABLE_NAME,
      Item: user
    }));

    // Remove sensitive data before returning
    const { ...userData } = user;

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'User registered successfully',
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
