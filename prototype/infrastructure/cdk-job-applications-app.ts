#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';

export class JobApplicationsStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Table for Job Applications
    const jobApplicationsTable = new dynamodb.Table(this, 'JobApplicationsTable', {
      tableName: 'Shram-setu-job-applications',
      partitionKey: {
        name: 'applicationId',
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      pointInTimeRecovery: true
    });

    // GSI for querying by user
    jobApplicationsTable.addGlobalSecondaryIndex({
      indexName: 'UserApplicationsIndex',
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'appliedAt',
        type: dynamodb.AttributeType.STRING
      }
    });

    // GSI for querying by contractor
    jobApplicationsTable.addGlobalSecondaryIndex({
      indexName: 'ContractorApplicationsIndex',
      partitionKey: {
        name: 'contractorId',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'appliedAt',
        type: dynamodb.AttributeType.STRING
      }
    });

    // GSI for querying by contractor and job
    jobApplicationsTable.addGlobalSecondaryIndex({
      indexName: 'ContractorJobIndex',
      partitionKey: {
        name: 'contractorJobIndex',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'appliedAt',
        type: dynamodb.AttributeType.STRING
      }
    });

    // Lambda function for submitting applications
    const submitApplicationLambda = new lambda.Function(this, 'SubmitApplicationFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'submit-application.handler',
      code: lambda.Code.fromAsset('../lambda/job-applications'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        JOB_APPLICATIONS_TABLE: jobApplicationsTable.tableName
      }
    });

    // Lambda function for getting user applications
    const getUserApplicationsLambda = new lambda.Function(this, 'GetUserApplicationsFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'get-user-applications.handler',
      code: lambda.Code.fromAsset('../lambda/job-applications'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        JOB_APPLICATIONS_TABLE: jobApplicationsTable.tableName
      }
    });

    // Lambda function for getting contractor applications
    const getContractorApplicationsLambda = new lambda.Function(this, 'GetContractorApplicationsFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'get-contractor-applications.handler',
      code: lambda.Code.fromAsset('../lambda/job-applications'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        JOB_APPLICATIONS_TABLE: jobApplicationsTable.tableName
      }
    });

    // Lambda function for updating application status
    const updateApplicationStatusLambda = new lambda.Function(this, 'UpdateApplicationStatusFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'update-application-status.handler',
      code: lambda.Code.fromAsset('../lambda/job-applications'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        JOB_APPLICATIONS_TABLE: jobApplicationsTable.tableName
      }
    });

    // Grant DynamoDB permissions to Lambda functions
    jobApplicationsTable.grantReadWriteData(submitApplicationLambda);
    jobApplicationsTable.grantReadData(getUserApplicationsLambda);
    jobApplicationsTable.grantReadData(getContractorApplicationsLambda);
    jobApplicationsTable.grantReadWriteData(updateApplicationStatusLambda);

    // API Gateway
    const api = new apigateway.RestApi(this, 'JobApplicationsApi', {
      restApiName: 'Shram Setu Job Applications API',
      description: 'API for managing job applications',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Accept', 'Authorization']
      }
    });

    // API Resources
    const applicationsResource = api.root.addResource('applications');
    
    // POST /applications/submit
    const submitResource = applicationsResource.addResource('submit');
    submitResource.addMethod('POST', new apigateway.LambdaIntegration(submitApplicationLambda));
    
    // GET /applications/user/{userId}
    const userResource = applicationsResource.addResource('user');
    const userIdResource = userResource.addResource('{userId}');
    userIdResource.addMethod('GET', new apigateway.LambdaIntegration(getUserApplicationsLambda));
    
    // GET /applications/contractor/{contractorId}
    const contractorResource = applicationsResource.addResource('contractor');
    const contractorIdResource = contractorResource.addResource('{contractorId}');
    contractorIdResource.addMethod('GET', new apigateway.LambdaIntegration(getContractorApplicationsLambda));
    
    // PUT /applications/{applicationId}/status
    const applicationIdResource = applicationsResource.addResource('{applicationId}');
    const statusResource = applicationIdResource.addResource('status');
    statusResource.addMethod('PUT', new apigateway.LambdaIntegration(updateApplicationStatusLambda));

    // Output the API URL
    new cdk.CfnOutput(this, 'JobApplicationsApiUrl', {
      value: api.url,
      description: 'Job Applications API Gateway URL'
    });

    // Output the DynamoDB table name
    new cdk.CfnOutput(this, 'JobApplicationsTableName', {
      value: jobApplicationsTable.tableName,
      description: 'Job Applications DynamoDB Table Name'
    });
  }
}

// Create the CDK app
const app = new cdk.App();
new JobApplicationsStack(app, 'ShramSetuJobApplicationsStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'ap-south-1'
  }
});