import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class TextractLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const textractLambda = new lambda.Function(this, 'TextractOCRFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../lambda-textract'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        REGION: this.region
      }
    });

    textractLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'textract:DetectDocumentText',
        'textract:AnalyzeDocument'
      ],
      resources: ['*']
    }));

    const api = new apigateway.RestApi(this, 'TextractAPI', {
      restApiName: 'Shram-Setu Textract API',
      description: 'API for Textract OCR processing',
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

    const textractIntegration = new apigateway.LambdaIntegration(textractLambda, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' }
    });

    const extractResource = api.root.addResource('extract-payslip');
    extractResource.addMethod('POST', textractIntegration);

    new cdk.CfnOutput(this, 'APIEndpoint', {
      value: api.url,
      description: 'API Gateway endpoint URL',
      exportName: 'TextractAPIEndpoint'
    });

    new cdk.CfnOutput(this, 'LambdaFunctionName', {
      value: textractLambda.functionName,
      description: 'Lambda function name',
      exportName: 'TextractLambdaName'
    });
  }
}
