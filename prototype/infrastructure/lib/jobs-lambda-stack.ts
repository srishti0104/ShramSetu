import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as path from 'path';

export class JobsLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ============================================
    // DynamoDB Table for Jobs
    // ============================================
    const jobsTable = new dynamodb.Table(this, 'JobsTable', {
      tableName: 'Shram-setu-jobs',
      partitionKey: {
        name: 'jobId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Keep table on stack deletion
      pointInTimeRecovery: true,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    });

    // Global Secondary Index: contractorId-index
    jobsTable.addGlobalSecondaryIndex({
      indexName: 'contractorId-index',
      partitionKey: {
        name: 'contractorId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'postedAt',
        type: dynamodb.AttributeType.NUMBER,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Global Secondary Index: city-status-index
    jobsTable.addGlobalSecondaryIndex({
      indexName: 'city-status-index',
      partitionKey: {
        name: 'city',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'status',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // ============================================
    // Lambda Function: Create Job
    // ============================================
    const createJobFunction = new lambda.Function(this, 'CreateJobFunction', {
      functionName: 'ShramSetu-CreateJob',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'create-job.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/jobs')),
      environment: {
        JOBS_TABLE: jobsTable.tableName,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });

    // Grant Lambda permissions to write to DynamoDB
    jobsTable.grantReadWriteData(createJobFunction);

    // ============================================
    // Lambda Function: Get Job
    // ============================================
    const getJobFunction = new lambda.Function(this, 'GetJobFunction', {
      functionName: 'ShramSetu-GetJob',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'get-job.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/jobs')),
      environment: {
        JOBS_TABLE: jobsTable.tableName,
      },
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
    });

    jobsTable.grantReadData(getJobFunction);

    // ============================================
    // Lambda Function: Search Jobs
    // ============================================
    const searchJobsFunction = new lambda.Function(this, 'SearchJobsFunction', {
      functionName: 'ShramSetu-SearchJobs',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'search.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/jobs')),
      environment: {
        JOBS_TABLE: jobsTable.tableName,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });

    jobsTable.grantReadData(searchJobsFunction);

    // ============================================
    // API Gateway
    // ============================================
    const api = new apigateway.RestApi(this, 'JobsApi', {
      restApiName: 'ShramSetu Jobs API',
      description: 'API for job management in Shram-Setu',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
      },
      deployOptions: {
        stageName: 'prod',
        throttlingRateLimit: 1000,
        throttlingBurstLimit: 2000,
        metricsEnabled: true,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
      },
    });

    // /jobs resource
    const jobsResource = api.root.addResource('jobs');

    // POST /jobs - Create job
    jobsResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(createJobFunction, {
        proxy: true,
      })
    );

    // GET /jobs - Search jobs (with query parameters)
    jobsResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(searchJobsFunction, {
        proxy: true,
      })
    );

    // /jobs/{jobId} resource
    const jobIdResource = jobsResource.addResource('{jobId}');

    // GET /jobs/{jobId} - Get specific job
    jobIdResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(getJobFunction, {
        proxy: true,
      })
    );

    // ============================================
    // CloudWatch Alarms
    // ============================================
    
    // Alarm for CreateJob function errors
    const createJobErrorAlarm = createJobFunction.metricErrors({
      period: cdk.Duration.minutes(5),
    }).createAlarm(this, 'CreateJobErrorAlarm', {
      threshold: 5,
      evaluationPeriods: 1,
      alarmDescription: 'Alert when CreateJob function has errors',
      alarmName: 'ShramSetu-CreateJob-Errors',
    });

    // Alarm for DynamoDB throttling
    const tableThrottleAlarm = jobsTable.metricUserErrors({
      period: cdk.Duration.minutes(5),
    }).createAlarm(this, 'JobsTableThrottleAlarm', {
      threshold: 10,
      evaluationPeriods: 1,
      alarmDescription: 'Alert when Jobs table is being throttled',
      alarmName: 'ShramSetu-JobsTable-Throttle',
    });

    // ============================================
    // Outputs
    // ============================================
    new cdk.CfnOutput(this, 'JobsTableName', {
      value: jobsTable.tableName,
      description: 'DynamoDB Jobs Table Name',
      exportName: 'ShramSetuJobsTableName',
    });

    new cdk.CfnOutput(this, 'JobsApiUrl', {
      value: api.url,
      description: 'Jobs API Gateway URL',
      exportName: 'ShramSetuJobsApiUrl',
    });

    new cdk.CfnOutput(this, 'CreateJobFunctionArn', {
      value: createJobFunction.functionArn,
      description: 'Create Job Lambda Function ARN',
    });

    new cdk.CfnOutput(this, 'JobsTableArn', {
      value: jobsTable.tableArn,
      description: 'Jobs Table ARN',
    });
  }
}
