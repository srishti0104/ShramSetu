#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class SimpleTranscribeStack extends cdk.Stack {
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
      },
    });

    // API Gateway with CORS
    const api = new apigateway.RestApi(this, 'TranscribeApi', {
      restApiName: 'Simple Transcribe API',
      description: 'Simple transcribe API with CORS for localhost and production',
      defaultCorsPreflightOptions: {
        allowOrigins: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'https://main.dzsokk69d2hk5.amplifyapp.com'],
        allowMethods: ['POST', 'OPTIONS'],
        allowHeaders: ['Content-Type'],
        allowCredentials: false,
      },
      deployOptions: {
        stageName: 'prod',
      },
    });

    // Add POST method to root
    api.root.addMethod('POST', new apigateway.LambdaIntegration(transcribeLambda));

    // Output
    new cdk.CfnOutput(this, 'TranscribeApiUrl', {
      value: api.url,
      description: 'Simple Transcribe API URL',
    });
  }
}

const app = new cdk.App();
new SimpleTranscribeStack(app, 'SimpleTranscribeStack', {
  env: {
    account: '808840719701',
    region: 'ap-south-1',
  },
});