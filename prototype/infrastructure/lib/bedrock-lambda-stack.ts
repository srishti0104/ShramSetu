import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class BedrockLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create Lambda function for Bedrock proxy
    const bedrockLambda = new lambda.Function(this, 'BedrockProxyFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../lambda-bedrock'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        REGION: this.region
      }
    });

    // Grant Bedrock permissions to Lambda
    bedrockLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'bedrock:InvokeModel',
        'bedrock:InvokeModelWithResponseStream'
      ],
      resources: ['*']
    }));

    // Add CloudWatch Logs permissions
    bedrockLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:PutLogEvents'
      ],
      resources: ['*']
    }));

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'BedrockProxyAPI', {
      restApiName: 'Shram-Setu Bedrock Proxy API',
      description: 'Proxy API for AWS Bedrock calls from browser',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization']
      }
    });

    // Create Lambda integration
    const bedrockIntegration = new apigateway.LambdaIntegration(bedrockLambda);

    // Add routes
    const chatResource = api.root.addResource('chat');
    chatResource.addMethod('POST', bedrockIntegration);

    // Output the API endpoint
    new cdk.CfnOutput(this, 'BedrockAPIEndpoint', {
      value: api.url,
      description: 'Bedrock Proxy API Gateway endpoint URL'
    });
  }
}