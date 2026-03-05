import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs';

export class RatingsLambdaStack extends cdk.Stack {
  public readonly api: apigateway.RestApi;
  public readonly ratingsTable: dynamodb.ITable;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Use existing DynamoDB Table for Ratings
    this.ratingsTable = dynamodb.Table.fromTableName(this, 'RatingsTable', 'Shram-setu-ratings');

    // Create EventBridge Event Bus
    const eventBus = new events.EventBus(this, 'RatingsEventBus', {
      eventBusName: 'shram-setu-events',
    });

    // IAM Role for Lambda functions
    const lambdaRole = new iam.Role(this, 'RatingsLambdaRole', {
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
                this.ratingsTable.tableArn,
                `${this.ratingsTable.tableArn}/index/*`,
              ],
            }),
          ],
        }),
        EventBridgeAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'events:PutEvents',
              ],
              resources: [eventBus.eventBusArn],
            }),
          ],
        }),
      },
    });

    // Lambda Layer for common dependencies
    const ratingsLayer = new lambda.LayerVersion(this, 'RatingsLayer', {
      code: lambda.Code.fromAsset('../lambda/layers/ratings-layer'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
      description: 'Common dependencies for ratings Lambda functions',
    });

    // Environment variables for all Lambda functions
    const commonEnvironment = {
      RATINGS_TABLE: this.ratingsTable.tableName,
      EVENT_BUS_NAME: eventBus.eventBusName,
    };

    // Submit Rating Lambda
    const submitRatingLambda = new lambda.Function(this, 'SubmitRatingFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'submit-rating.handler',
      code: lambda.Code.fromAsset('../lambda/ratings'),
      role: lambdaRole,
      layers: [ratingsLayer],
      environment: commonEnvironment,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });

    // Get Profile Lambda
    const getProfileLambda = new lambda.Function(this, 'GetProfileFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'get-profile.handler',
      code: lambda.Code.fromAsset('../lambda/ratings'),
      role: lambdaRole,
      layers: [ratingsLayer],
      environment: commonEnvironment,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });

    // Get Statistics Lambda
    const getStatisticsLambda = new lambda.Function(this, 'GetStatisticsFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'get-statistics.handler',
      code: lambda.Code.fromAsset('../lambda/ratings'),
      role: lambdaRole,
      layers: [ratingsLayer],
      environment: commonEnvironment,
      timeout: cdk.Duration.seconds(30),
      memorySize: 512, // More memory for statistics calculations
    });

    // Calculate Tier Lambda (triggered by EventBridge)
    const calculateTierLambda = new lambda.Function(this, 'CalculateTierFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'calculate-tier.handler',
      code: lambda.Code.fromAsset('../lambda/ratings'),
      role: lambdaRole,
      layers: [ratingsLayer],
      environment: commonEnvironment,
      timeout: cdk.Duration.seconds(60),
      memorySize: 512,
    });

    // EventBridge Rule to trigger tier calculation
    const tierCalculationRule = new events.Rule(this, 'TierCalculationRule', {
      eventBus: eventBus,
      eventPattern: {
        source: ['shram-setu.ratings'],
        detailType: ['RatingSubmitted'],
      },
    });

    tierCalculationRule.addTarget(new targets.LambdaFunction(calculateTierLambda));

    // API Gateway
    this.api = new apigateway.RestApi(this, 'RatingsApi', {
      restApiName: 'Shram Setu Ratings API',
      description: 'API for rating system with employer/employee evaluation',
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
    const ratingsResource = this.api.root.addResource('ratings');

    // POST /ratings/submit
    const submitResource = ratingsResource.addResource('submit');
    submitResource.addMethod('POST', new apigateway.LambdaIntegration(submitRatingLambda), {
      methodResponses: [
        {
          statusCode: '200',
        },
        {
          statusCode: '400',
        },
        {
          statusCode: '500',
        },
      ],
    });

    // GET /ratings/profile/{userId}
    const profileResource = ratingsResource.addResource('profile');
    const userProfileResource = profileResource.addResource('{userId}');
    userProfileResource.addMethod('GET', new apigateway.LambdaIntegration(getProfileLambda));

    // GET /ratings/statistics/{userId}
    const statisticsResource = ratingsResource.addResource('statistics');
    const userStatisticsResource = statisticsResource.addResource('{userId}');
    userStatisticsResource.addMethod('GET', new apigateway.LambdaIntegration(getStatisticsLambda));

    // GET /ratings/user/{userId}/ratings
    const userResource = ratingsResource.addResource('user');
    const userIdResource = userResource.addResource('{userId}');
    const userRatingsResource = userIdResource.addResource('ratings');
    userRatingsResource.addMethod('GET', new apigateway.LambdaIntegration(getProfileLambda));

    // CloudWatch Alarms for monitoring
    const submitRatingAlarm = new cdk.aws_cloudwatch.Alarm(this, 'SubmitRatingErrorAlarm', {
      metric: submitRatingLambda.metricErrors(),
      threshold: 5,
      evaluationPeriods: 2,
      treatMissingData: cdk.aws_cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    // Outputs
    new cdk.CfnOutput(this, 'RatingsApiUrl', {
      value: this.api.url,
      description: 'Ratings API Gateway URL',
      exportName: 'RatingsApiUrl',
    });

    new cdk.CfnOutput(this, 'RatingsTableName', {
      value: this.ratingsTable.tableName,
      description: 'DynamoDB Ratings Table Name',
      exportName: 'RatingsTableName',
    });

    new cdk.CfnOutput(this, 'EventBusName', {
      value: eventBus.eventBusName,
      description: 'EventBridge Event Bus Name',
      exportName: 'RatingsEventBusName',
    });
  }
}