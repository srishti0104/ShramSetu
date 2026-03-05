import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class GrievanceLambdaStack extends cdk.Stack {
  public readonly api: apigateway.RestApi;
  public readonly grievanceTable: dynamodb.Table;
  public readonly audioBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create new DynamoDB Table for Grievances (if it doesn't exist)
    this.grievanceTable = new dynamodb.Table(this, 'GrievanceTable', {
      tableName: 'Shram-setu-grievances',
      partitionKey: { name: 'grievanceId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'submittedAt', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // GSI for querying by worker ID
    this.grievanceTable.addGlobalSecondaryIndex({
      indexName: 'WorkerIdIndex',
      partitionKey: { name: 'workerId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'submittedAt', type: dynamodb.AttributeType.STRING },
    });

    // GSI for querying by status
    this.grievanceTable.addGlobalSecondaryIndex({
      indexName: 'StatusIndex',
      partitionKey: { name: 'status', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'submittedAt', type: dynamodb.AttributeType.STRING },
    });

    // Create new S3 Bucket for audio recordings (if it doesn't exist)
    this.audioBucket = new s3.Bucket(this, 'GrievanceAudioBucket', {
      bucketName: `shram-setu-grievance-audio-${this.account}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      lifecycleRules: [
        {
          id: 'DeleteOldAudio',
          expiration: cdk.Duration.days(365), // Keep audio for 1 year
          abortIncompleteMultipartUploadAfter: cdk.Duration.days(7),
        },
      ],
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // IAM Role for Lambda functions
    const lambdaRole = new iam.Role(this, 'GrievanceLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
      inlinePolicies: {
        DynamoDBAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'dynamodb:PutItem',
                'dynamodb:GetItem',
                'dynamodb:Query',
                'dynamodb:Scan',
                'dynamodb:UpdateItem',
                'dynamodb:DeleteItem',
              ],
              resources: [
                this.grievanceTable.tableArn,
                `${this.grievanceTable.tableArn}/index/*`,
              ],
            }),
          ],
        }),
        S3Access: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                's3:GetObject',
                's3:PutObject',
                's3:DeleteObject',
                's3:GetObjectVersion',
              ],
              resources: [`${this.audioBucket.bucketArn}/*`],
            }),
          ],
        }),
        TranscribeAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'transcribe:StartTranscriptionJob',
                'transcribe:GetTranscriptionJob',
                'transcribe:ListTranscriptionJobs',
              ],
              resources: ['*'],
            }),
          ],
        }),
      },
    });

    // Environment variables for all Lambda functions
    const commonEnvironment = {
      GRIEVANCE_TABLE: this.grievanceTable.tableName,
      AUDIO_BUCKET: this.audioBucket.bucketName,
    };

    // Submit Grievance Lambda
    const submitGrievanceLambda = new lambda.Function(this, 'SubmitGrievanceFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'submit-grievance.handler',
      code: lambda.Code.fromAsset('../lambda/grievance'),
      role: lambdaRole,
      environment: commonEnvironment,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });

    // Process Audio Lambda (for transcription)
    const processAudioLambda = new lambda.Function(this, 'ProcessAudioFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'process-audio.handler',
      code: lambda.Code.fromAsset('../lambda/grievance'),
      role: lambdaRole,
      environment: commonEnvironment,
      timeout: cdk.Duration.minutes(5),
      memorySize: 512,
    });

    // Get Grievances Lambda (for admin dashboard)
    const getGrievancesLambda = new lambda.Function(this, 'GetGrievancesFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'get-grievances.handler',
      code: lambda.Code.fromAsset('../lambda/grievance'),
      role: lambdaRole,
      environment: commonEnvironment,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });

    // Update Grievance Status Lambda
    const updateStatusLambda = new lambda.Function(this, 'UpdateStatusFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'update-status.handler',
      code: lambda.Code.fromAsset('../lambda/grievance'),
      role: lambdaRole,
      environment: commonEnvironment,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });

    // API Gateway
    this.api = new apigateway.RestApi(this, 'GrievanceApi', {
      restApiName: 'Shram Setu Grievance API',
      description: 'API for voice-based grievance reporting system',
      defaultCorsPreflightOptions: {
        allowOrigins: ['http://localhost:5173', 'http://localhost:5174', 'https://your-domain.com'],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
        allowCredentials: false,
      },
      deployOptions: {
        stageName: 'prod',
      },
    });

    // API Gateway Resources and Methods
    const grievanceResource = this.api.root.addResource('grievance');

    // POST /grievance/submit
    const submitResource = grievanceResource.addResource('submit');
    submitResource.addMethod('POST', new apigateway.LambdaIntegration(submitGrievanceLambda));

    // POST /grievance/process-audio
    const processAudioResource = grievanceResource.addResource('process-audio');
    processAudioResource.addMethod('POST', new apigateway.LambdaIntegration(processAudioLambda));

    // GET /grievance/list
    const listResource = grievanceResource.addResource('list');
    listResource.addMethod('GET', new apigateway.LambdaIntegration(getGrievancesLambda));

    // PUT /grievance/{grievanceId}/status
    const grievanceIdResource = grievanceResource.addResource('{grievanceId}');
    const statusResource = grievanceIdResource.addResource('status');
    statusResource.addMethod('PUT', new apigateway.LambdaIntegration(updateStatusLambda));

    // Outputs
    new cdk.CfnOutput(this, 'GrievanceApiUrl', {
      value: this.api.url,
      description: 'Grievance API Gateway URL',
      exportName: 'GrievanceApiUrl',
    });

    new cdk.CfnOutput(this, 'GrievanceTableName', {
      value: this.grievanceTable.tableName,
      description: 'DynamoDB Grievance Table Name',
      exportName: 'GrievanceTableName',
    });

    new cdk.CfnOutput(this, 'AudioBucketName', {
      value: this.audioBucket.bucketName,
      description: 'S3 Audio Bucket Name',
      exportName: 'GrievanceAudioBucketName',
    });
  }
}