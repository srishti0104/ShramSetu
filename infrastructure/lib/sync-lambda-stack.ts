import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class SyncLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB table for sync data
    const syncTable = new dynamodb.Table(this, 'SyncTable', {
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'serverTimestamp',
        type: dynamodb.AttributeType.NUMBER
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      pointInTimeRecovery: true,
      tableName: 'ShramSetuSyncData'
    });

    // Add GSI for querying by changeId
    syncTable.addGlobalSecondaryIndex({
      indexName: 'changeId-index',
      partitionKey: {
        name: 'changeId',
        type: dynamodb.AttributeType.STRING
      },
      projectionType: dynamodb.ProjectionType.ALL
    });

    // Lambda function
    const syncLambda = new lambda.Function(this, 'SyncFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'sync-handler.handler',
      code: lambda.Code.fromAsset('../lambda-sync'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        REGION: this.region,
        SYNC_TABLE_NAME: syncTable.tableName
      }
    });

    // Grant Lambda permissions to DynamoDB
    syncTable.grantReadWriteData(syncLambda);

    // API Gateway
    const api = new apigateway.RestApi(this, 'SyncAPI', {
      restApiName: 'Shram-Setu Delta Sync API',
      description: 'API for delta synchronization',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization']
      }
    });

    const syncIntegration = new apigateway.LambdaIntegration(syncLambda);

    // POST /sync - Push changes
    const syncResource = api.root.addResource('sync');
    syncResource.addMethod('POST', syncIntegration);

    // GET /changes - Pull changes
    const changesResource = api.root.addResource('changes');
    changesResource.addMethod('GET', syncIntegration);

    // GET /stats - Get sync statistics
    const statsResource = api.root.addResource('stats');
    statsResource.addMethod('GET', syncIntegration);

    // Outputs
    new cdk.CfnOutput(this, 'SyncAPIEndpoint', {
      value: api.url,
      description: 'Delta Sync API Gateway endpoint URL',
      exportName: 'SyncAPIEndpoint'
    });

    new cdk.CfnOutput(this, 'SyncTableName', {
      value: syncTable.tableName,
      description: 'DynamoDB table for sync data',
      exportName: 'SyncTableName'
    });

    new cdk.CfnOutput(this, 'SyncLambdaName', {
      value: syncLambda.functionName,
      description: 'Sync Lambda function name',
      exportName: 'SyncLambdaName'
    });
  }
}
