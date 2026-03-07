#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

class ShramSetuUserTableStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create DynamoDB table for users
    const usersTable = new dynamodb.Table(this, 'ShramSetuUsersTable', {
      tableName: 'ShramSetuUsers',
      partitionKey: {
        name: 'phoneNumber',
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // On-demand pricing
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: true, // Enable backups
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Don't delete table on stack deletion
      
      // Enable streams for real-time data processing (optional)
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES
    });

    // Add Global Secondary Index for userId
    usersTable.addGlobalSecondaryIndex({
      indexName: 'userId-index',
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING
      },
      projectionType: dynamodb.ProjectionType.ALL
    });

    // Add Global Secondary Index for role queries
    usersTable.addGlobalSecondaryIndex({
      indexName: 'role-createdAt-index',
      partitionKey: {
        name: 'role',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'createdAt',
        type: dynamodb.AttributeType.STRING
      },
      projectionType: dynamodb.ProjectionType.ALL
    });

    // Output table name and ARN
    new cdk.CfnOutput(this, 'UsersTableName', {
      value: usersTable.tableName,
      description: 'DynamoDB Users Table Name',
      exportName: 'ShramSetuUsersTableName'
    });

    new cdk.CfnOutput(this, 'UsersTableArn', {
      value: usersTable.tableArn,
      description: 'DynamoDB Users Table ARN',
      exportName: 'ShramSetuUsersTableArn'
    });
  }
}

const app = new cdk.App();
new ShramSetuUserTableStack(app, 'ShramSetuUserTableStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'ap-south-1' // Mumbai region
  },
  description: 'DynamoDB table for Shram Setu user data'
});

app.synth();
