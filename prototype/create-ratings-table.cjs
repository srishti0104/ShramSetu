/**
 * Create DynamoDB Ratings Table
 * Run this script to create the ratings table in DynamoDB
 */

const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config();

const dynamodb = new DynamoDBClient({ 
  region: process.env.VITE_AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.VITE_AWS_SECRET_ACCESS_KEY
  }
});

const TABLE_NAME = process.env.RATINGS_TABLE || 'Shram-setu-ratings';

async function createRatingsTable() {
  try {
    // Check if table already exists
    try {
      const describeParams = {
        TableName: TABLE_NAME
      };
      await dynamodb.send(new DescribeTableCommand(describeParams));
      console.log(`✅ Table ${TABLE_NAME} already exists`);
      return;
    } catch (error) {
      if (error.name !== 'ResourceNotFoundException') {
        throw error;
      }
      // Table doesn't exist, create it
    }

    console.log(`🔨 Creating DynamoDB table: ${TABLE_NAME}`);

    const createParams = {
      TableName: TABLE_NAME,
      KeySchema: [
        {
          AttributeName: 'ratingId',
          KeyType: 'HASH' // Partition key
        }
      ],
      AttributeDefinitions: [
        {
          AttributeName: 'ratingId',
          AttributeType: 'S'
        },
        {
          AttributeName: 'toUserId',
          AttributeType: 'S'
        },
        {
          AttributeName: 'fromUserId',
          AttributeType: 'S'
        },
        {
          AttributeName: 'createdAt',
          AttributeType: 'S'
        }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'toUserId-index',
          KeySchema: [
            {
              AttributeName: 'toUserId',
              KeyType: 'HASH'
            },
            {
              AttributeName: 'createdAt',
              KeyType: 'RANGE'
            }
          ],
          Projection: {
            ProjectionType: 'ALL'
          },
          BillingMode: 'PAY_PER_REQUEST'
        },
        {
          IndexName: 'fromUserId-index',
          KeySchema: [
            {
              AttributeName: 'fromUserId',
              KeyType: 'HASH'
            },
            {
              AttributeName: 'createdAt',
              KeyType: 'RANGE'
            }
          ],
          Projection: {
            ProjectionType: 'ALL'
          },
          BillingMode: 'PAY_PER_REQUEST'
        }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    };

    const result = await dynamodb.send(new CreateTableCommand(createParams));
    console.log(`✅ Table ${TABLE_NAME} created successfully!`);
    console.log(`📊 Table ARN: ${result.TableDescription.TableArn}`);
    console.log(`🌍 Region: ${process.env.VITE_AWS_REGION || 'ap-south-1'}`);
    console.log(`⏳ Table is being created... This may take a few moments.`);

  } catch (error) {
    console.error('❌ Error creating table:', error.message);
    process.exit(1);
  }
}

// Run the script
createRatingsTable();