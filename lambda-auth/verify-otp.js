const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = new DynamoDBClient({ region: process.env.REGION || 'ap-south-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  try {
    const body = JSON.parse(event.body);
    const { phoneNumber, otp } = body;

    if (!phoneNumber || !otp) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Phone number and OTP are required'
        })
      };
    }

    // Get OTP from DynamoDB
    const result = await docClient.send(new GetCommand({
      TableName: process.env.OTP_TABLE_NAME,
      Key: { phoneNumber }
    }));

    if (!result.Item) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'OTP not found or expired'
        })
      };
    }

    const { otp: storedOTP, expiresAt } = result.Item;

    // Check if OTP is expired
    if (Date.now() > expiresAt) {
      // Delete expired OTP
      await docClient.send(new DeleteCommand({
        TableName: process.env.OTP_TABLE_NAME,
        Key: { phoneNumber }
      }));

      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'OTP has expired'
        })
      };
    }

    // Verify OTP
    if (otp !== storedOTP) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Invalid OTP'
        })
      };
    }

    // Delete OTP after successful verification
    await docClient.send(new DeleteCommand({
      TableName: process.env.OTP_TABLE_NAME,
      Key: { phoneNumber }
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'OTP verified successfully',
        phoneNumber
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
