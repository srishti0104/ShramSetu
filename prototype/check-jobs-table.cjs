/**
 * Script to check Shram-setu-jobs DynamoDB table status
 * Run: node check-jobs-table.cjs
 */

const { DynamoDBClient, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config();

const client = new DynamoDBClient({
  region: process.env.VITE_AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.VITE_AWS_SECRET_ACCESS_KEY
  }
});

const TABLE_NAME = 'Shram-setu-jobs';

async function checkTableStatus() {
  try {
    const command = new DescribeTableCommand({ TableName: TABLE_NAME });
    const response = await client.send(command);
    const table = response.Table;

    console.log('📊 DynamoDB Table Status\n');
    console.log(`Table Name: ${table.TableName}`);
    console.log(`Status: ${table.TableStatus}`);
    console.log(`Table ARN: ${table.TableArn}`);
    console.log(`Item Count: ${table.ItemCount}`);
    console.log(`Table Size: ${(table.TableSizeBytes / 1024).toFixed(2)} KB`);
    console.log(`Billing Mode: ${table.BillingModeSummary?.BillingMode || 'PROVISIONED'}`);
    console.log(`Encryption: ${table.SSEDescription?.Status || 'DISABLED'}`);
    
    console.log('\n🔍 Global Secondary Indexes:');
    if (table.GlobalSecondaryIndexes) {
      table.GlobalSecondaryIndexes.forEach((gsi, index) => {
        console.log(`   ${index + 1}. ${gsi.IndexName}`);
        console.log(`      Status: ${gsi.IndexStatus}`);
        console.log(`      Keys: ${gsi.KeySchema.map(k => k.AttributeName).join(', ')}`);
      });
    }

    console.log('\n📝 Attribute Definitions:');
    table.AttributeDefinitions.forEach(attr => {
      console.log(`   - ${attr.AttributeName} (${attr.AttributeType})`);
    });

    if (table.TableStatus === 'ACTIVE') {
      console.log('\n✅ Table is ACTIVE and ready to use!');
    } else {
      console.log(`\n⏳ Table is ${table.TableStatus}... Please wait.`);
    }

  } catch (error) {
    if (error.name === 'ResourceNotFoundException') {
      console.log(`❌ Table "${TABLE_NAME}" does not exist.`);
      console.log('💡 Run: node create-jobs-table.cjs to create it.');
    } else {
      console.error('❌ Error checking table:', error.message);
    }
  }
}

checkTableStatus();
