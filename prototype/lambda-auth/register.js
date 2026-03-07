const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

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
    const { 
      phoneNumber, 
      password,
      role, 
      language,
      location,
      skills,
      customSkills,
      profile
    } = body;

    // Validate required fields
    if (!phoneNumber || !password || !role) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Phone number, password, and role are required'
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
        statusCode: 409,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'PHONE_ALREADY_REGISTERED',
          message: 'This phone number is already registered'
        })
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique user ID
    const userId = generateUserId();
    const timestamp = new Date().toISOString();

    // Create new user with all signup details
    const user = {
      userId,
      phoneNumber,
      password: hashedPassword,
      role,
      language: language || 'en',
      location: location || null,
      skills: skills || [],
      customSkills: customSkills || {},
      profile: profile || {},
      createdAt: timestamp,
      updatedAt: timestamp,
      lastLoginAt: timestamp,
      isActive: true
    };

    await docClient.send(new PutCommand({
      TableName: process.env.USERS_TABLE_NAME,
      Item: user
    }));

    // Remove password before returning
    const { password: _, ...userData } = user;

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'User registered successfully',
        user: userData,
        token: 'jwt_token_placeholder' // Add JWT generation later
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
        error: 'Registration failed',
        message: error.message
      })
    };
  }
};
