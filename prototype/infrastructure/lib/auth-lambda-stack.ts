import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class AuthLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Tables
    const usersTable = new dynamodb.Table(this, 'UsersTable', {
      partitionKey: { name: 'phoneNumber', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      pointInTimeRecovery: true
    });

    const otpTable = new dynamodb.Table(this, 'OTPTable', {
      partitionKey: { name: 'phoneNumber', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      timeToLiveAttribute: 'expiresAt'
    });

    // Lambda Functions
    const sendOTPLambda = new lambda.Function(this, 'SendOTPFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'send-otp.handler',
      code: lambda.Code.fromAsset('../lambda-auth'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        REGION: this.region,
        OTP_TABLE_NAME: otpTable.tableName,
        USERS_TABLE_NAME: usersTable.tableName
      }
    });

    const verifyOTPLambda = new lambda.Function(this, 'VerifyOTPFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'verify-otp.handler',
      code: lambda.Code.fromAsset('../lambda-auth'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        REGION: this.region,
        OTP_TABLE_NAME: otpTable.tableName
      }
    });

    const registerLambda = new lambda.Function(this, 'RegisterFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'register.handler',
      code: lambda.Code.fromAsset('../lambda-auth'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        REGION: this.region,
        USERS_TABLE_NAME: usersTable.tableName
      }
    });

    const loginLambda = new lambda.Function(this, 'LoginFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'login.handler',
      code: lambda.Code.fromAsset('../lambda-auth'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        REGION: this.region,
        USERS_TABLE_NAME: usersTable.tableName,
        JWT_SECRET: 'shram-setu-secret-key-change-in-production'
      }
    });

    // Grant permissions
    otpTable.grantReadWriteData(sendOTPLambda);
    otpTable.grantReadWriteData(verifyOTPLambda);
    usersTable.grantReadWriteData(registerLambda);
    usersTable.grantReadData(loginLambda);
    usersTable.grantReadData(sendOTPLambda); // Need to check if user exists

    // Grant SNS permissions for sending SMS
    sendOTPLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['sns:Publish'],
      resources: ['*']
    }));

    // API Gateway
    const api = new apigateway.RestApi(this, 'AuthAPI', {
      restApiName: 'Shram-Setu Auth API',
      description: 'Authentication API for Shram Setu',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token'
        ]
      },
      deployOptions: {
        stageName: 'prod',
        throttlingRateLimit: 10,
        throttlingBurstLimit: 20
      }
    });

    // API Resources and Methods
    const authResource = api.root.addResource('auth');

    const sendOTPResource = authResource.addResource('send-otp');
    sendOTPResource.addMethod('POST', new apigateway.LambdaIntegration(sendOTPLambda));

    const verifyOTPResource = authResource.addResource('verify-otp');
    verifyOTPResource.addMethod('POST', new apigateway.LambdaIntegration(verifyOTPLambda));

    const registerResource = authResource.addResource('register');
    registerResource.addMethod('POST', new apigateway.LambdaIntegration(registerLambda));

    const loginResource = authResource.addResource('login');
    loginResource.addMethod('POST', new apigateway.LambdaIntegration(loginLambda));

    // Outputs
    new cdk.CfnOutput(this, 'AuthAPIEndpoint', {
      value: api.url,
      description: 'Auth API Gateway endpoint URL',
      exportName: 'AuthAPIEndpoint'
    });

    new cdk.CfnOutput(this, 'UsersTableName', {
      value: usersTable.tableName,
      description: 'Users DynamoDB table name',
      exportName: 'UsersTableName'
    });

    new cdk.CfnOutput(this, 'OTPTableName', {
      value: otpTable.tableName,
      description: 'OTP DynamoDB table name',
      exportName: 'OTPTableName'
    });
  }
}
