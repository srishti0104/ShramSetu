/**
 * Script to create Shram-setu-jobs DynamoDB table
 * Run: node create-jobs-table.cjs
 */

const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config();

const client = new DynamoDBClient({
  region: process.env.VITE_AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.VITE_AWS_SECRET_ACCESS_KEY
  }
});

const TABLE_NAME = 'Shram-setu-jobs';

async function createJobsTable() {
  try {
    // Check if table already exists
    try {
      const describeCommand = new DescribeTableCommand({ TableName: TABLE_NAME });
      await client.send(describeCommand);
      console.log(`✅ Table "${TABLE_NAME}" already exists!`);
      return;
    } catch (error) {
      if (error.name !== 'ResourceNotFoundException') {
        throw error;
      }
      // Table doesn't exist, proceed to create
    }

    console.log(`📊 Creating DynamoDB table: ${TABLE_NAME}...`);

    const params = {
      TableName: TABLE_NAME,
      KeySchema: [
        { AttributeName: 'jobId', KeyType: 'HASH' } // Partition key
      ],
      AttributeDefinitions: [
        { AttributeName: 'jobId', AttributeType: 'S' },
        { AttributeName: 'contractorId', AttributeType: 'S' },
        { AttributeName: 'postedAt', AttributeType: 'N' },
        { AttributeName: 'city', AttributeType: 'S' },
        { AttributeName: 'status', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'contractorId-index',
          KeySchema: [
            { AttributeName: 'contractorId', KeyType: 'HASH' },
            { AttributeName: 'postedAt', KeyType: 'RANGE' }
          ],
          Projection: {
            ProjectionType: 'ALL'
          }
        },
        {
          IndexName: 'city-status-index',
          KeySchema: [
            { AttributeName: 'city', KeyType: 'HASH' },
            { AttributeName: 'status', KeyType: 'RANGE' }
          ],
          Projection: {
            ProjectionType: 'ALL'
          }
        }
      ],
      BillingMode: 'PAY_PER_REQUEST', // On-demand pricing
      StreamSpecification: {
        StreamEnabled: true,
        StreamViewType: 'NEW_AND_OLD_IMAGES'
      },
      SSESpecification: {
        Enabled: true,
        SSEType: 'KMS'
      },
      Tags: [
        { Key: 'Project', Value: 'ShramSetu' },
        { Key: 'Environment', Value: 'Production' },
        { Key: 'ManagedBy', Value: 'Script' }
      ]
    };

    const command = new CreateTableCommand(params);
    const response = await client.send(command);

    console.log('✅ Table created successfully!');
    console.log('📋 Table Details:');
    console.log(`   - Table Name: ${response.TableDescription.TableName}`);
    console.log(`   - Table ARN: ${response.TableDescription.TableArn}`);
    console.log(`   - Status: ${response.TableDescription.TableStatus}`);
    console.log(`   - Billing Mode: PAY_PER_REQUEST`);
    console.log(`   - Encryption: Enabled (KMS)`);
    console.log('\n🔍 Global Secondary Indexes:');
    console.log('   1. contractorId-index (contractorId, postedAt)');
    console.log('   2. city-status-index (city, status)');
    console.log('\n⏳ Table is being created... This may take a minute.');
    console.log('💡 You can check the status in AWS Console: https://console.aws.amazon.com/dynamodb');

  } catch (error) {
    console.error('❌ Error creating table:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

// Run the script
createJobsTable();
