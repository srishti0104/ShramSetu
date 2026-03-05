#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class SimpleGrievanceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Import existing resources
    const grievanceTable = dynamodb.Table.fromTableName(this, 'GrievanceTable', 'Shram-setu-grievances');
    const audioBucket = s3.Bucket.fromBucketName(this, 'GrievanceAudioBucket', 'shram-setu-grievance-audio-808840719701');

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
                'arn:aws:dynamodb:*:*:table/Shram-setu-grievances',
                'arn:aws:dynamodb:*:*:table/Shram-setu-grievances/index/*',
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
              resources: ['arn:aws:s3:::shram-setu-grievance-audio-808840719701/*'],
            }),
          ],
        }),
      },
    });

    // Environment variables for all Lambda functions
    const commonEnvironment = {
      GRIEVANCE_TABLE: 'Shram-setu-grievances',
      AUDIO_BUCKET: 'shram-setu-grievance-audio-808840719701',
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

    // API Gateway with CORS
    const api = new apigateway.RestApi(this, 'GrievanceApi', {
      restApiName: 'Simple Grievance API',
      description: 'Simple grievance API with CORS for localhost',
      defaultCorsPreflightOptions: {
        allowOrigins: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
        allowCredentials: false,
      },
      deployOptions: {
        stageName: 'prod',
      },
    });

    // API Gateway Resources and Methods
    const grievanceResource = api.root.addResource('grievance');

    // POST /grievance/submit
    const submitResource = grievanceResource.addResource('submit');
    submitResource.addMethod('POST', new apigateway.LambdaIntegration(submitGrievanceLambda));

    // GET /grievance/list
    const listResource = grievanceResource.addResource('list');
    listResource.addMethod('GET', new apigateway.LambdaIntegration(getGrievancesLambda));

    // Output
    new cdk.CfnOutput(this, 'GrievanceApiUrl', {
      value: api.url,
      description: 'Simple Grievance API URL',
    });
  }
}

const app = new cdk.App();
new SimpleGrievanceStack(app, 'SimpleGrievanceStack', {
  env: {
    account: '808840719701',
    region: 'ap-south-1',
  },
});