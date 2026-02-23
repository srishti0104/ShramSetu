const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const sns = new SNSClient({ region: process.env.REGION || 'ap-south-1' });
const dynamoClient = new DynamoDBClient({ region: process.env.REGION || 'ap-south-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + (5 * 60 * 1000); // 5 minutes

    // Store OTP in DynamoDB
    await docClient.send(new PutCommand({
      TableName: process.env.OTP_TABLE_NAME,
      Item: {
        phoneNumber,
        otp,
        expiresAt,
        createdAt: Date.now()
      }
    }));

    // Send OTP via SMS (SNS)
    const message = `Your Shram Setu OTP is: ${otp}. Valid for 5 minutes. Do not share with anyone.`;
    
    await sns.send(new PublishCommand({
      PhoneNumber: phoneNumber,
      Message: message
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'OTP sent successfully',
        expiresIn: 300 // seconds
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
