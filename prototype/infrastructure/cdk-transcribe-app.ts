#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class TranscribeLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // IAM Role for Lambda
    const lambdaRole = new iam.Role(this, 'TranscribeLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
      inlinePolicies: {
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
        S3Access: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                's3:GetObject',
                's3:PutObject',
                's3:DeleteObject',
              ],
              resources: ['arn:aws:s3:::shram-setu-uploads-808840719701/*'],
            }),
          ],
        }),
      },
    });

    // Lambda Function
    const transcribeLambda = new lambda.Function(this, 'TranscribeFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../lambda-transcribe'),
      role: lambdaRole,
      timeout: cdk.Duration.minutes(3),
      memorySize: 512,
      environment: {
        S3_BUCKET_NAME: 'shram-setu-uploads-808840719701',
        // AWS_REGION is automatically set by Lambda runtime
      },
    });

    // API Gateway with proper CORS
    const api = new apigateway.RestApi(this, 'TranscribeApi', {
      restApiName: 'Shram Setu Transcribe API',
      description: 'API for AWS Transcribe service with proper CORS',
      defaultCorsPreflightOptions: {
        allowOrigins: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'https://your-domain.com'],
        allowMethods: ['GET', 'POST', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
        allowCredentials: false,
      },
      deployOptions: {
        stageName: 'prod',
      },
    });

    // Add Lambda integration
    const lambdaIntegration = new apigateway.LambdaIntegration(transcribeLambda, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
    });

    // Add POST method to root
    api.root.addMethod('POST', lambdaIntegration);

    // Output the API URL
    new cdk.CfnOutput(this, 'TranscribeApiUrl', {
      value: api.url,
      description: 'Transcribe API Gateway URL',
      exportName: 'TranscribeApiUrl',
    });
  }
}

const app = new cdk.App();
new TranscribeLambdaStack(app, 'ShramSetuTranscribeStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT || '808840719701',
    region: process.env.CDK_DEFAULT_REGION || 'ap-south-1',
  },
  description: 'Shram Setu Transcribe API with proper CORS configuration',
  tags: {
    Project: 'ShramSetu',
    Component: 'Transcribe',
    Environment: 'Production',
  },
});