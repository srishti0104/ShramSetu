"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatingsLambdaStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const lambda = __importStar(require("aws-cdk-lib/aws-lambda"));
const apigateway = __importStar(require("aws-cdk-lib/aws-apigateway"));
const dynamodb = __importStar(require("aws-cdk-lib/aws-dynamodb"));
const iam = __importStar(require("aws-cdk-lib/aws-iam"));
const events = __importStar(require("aws-cdk-lib/aws-events"));
const targets = __importStar(require("aws-cdk-lib/aws-events-targets"));
class RatingsLambdaStack extends cdk.Stack {
    constructor(scope, id, props) {
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
exports.RatingsLambdaStack = RatingsLambdaStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmF0aW5ncy1sYW1iZGEtc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJyYXRpbmdzLWxhbWJkYS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFDbkMsK0RBQWlEO0FBQ2pELHVFQUF5RDtBQUN6RCxtRUFBcUQ7QUFDckQseURBQTJDO0FBQzNDLCtEQUFpRDtBQUNqRCx3RUFBMEQ7QUFHMUQsTUFBYSxrQkFBbUIsU0FBUSxHQUFHLENBQUMsS0FBSztJQUkvQyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQzlELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLDBDQUEwQztRQUMxQyxJQUFJLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztRQUU3RiwrQkFBK0I7UUFDL0IsTUFBTSxRQUFRLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRTtZQUM1RCxZQUFZLEVBQUUsbUJBQW1CO1NBQ2xDLENBQUMsQ0FBQztRQUVILGdDQUFnQztRQUNoQyxNQUFNLFVBQVUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFO1lBQ3pELFNBQVMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxzQkFBc0IsQ0FBQztZQUMzRCxlQUFlLEVBQUU7Z0JBQ2YsR0FBRyxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQywwQ0FBMEMsQ0FBQzthQUN2RjtZQUNELGNBQWMsRUFBRTtnQkFDZCxjQUFjLEVBQUUsSUFBSSxHQUFHLENBQUMsY0FBYyxDQUFDO29CQUNyQyxVQUFVLEVBQUU7d0JBQ1YsSUFBSSxHQUFHLENB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QUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHO1lBQ25CLFdBQVcsRUFBRSx5QkFBeUI7WUFDdEMsVUFBVSxFQUFFLGVBQWU7U0FDNUIsQ0FBQyxDQUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRTtZQUMxQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTO1lBQ2xDLFdBQVcsRUFBRSw2QkFBNkI7WUFDMUMsVUFBVSxFQUFFLGtCQUFrQjtTQUMvQixDQUFDLENBQUM7UUFFSCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRTtZQUN0QyxLQUFLLEVBQUUsUUFBUSxDQUFDLFlBQVk7WUFDNUIsV0FBVyxFQUFFLDRCQUE0QjtZQUN6QyxVQUFVLEVBQUUscUJBQXFCO1NBQ2xDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQTVNRCxnREE0TUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xyXG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XHJcbmltcG9ydCAqIGFzIGFwaWdhdGV3YXkgZnJvbSAnYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXknO1xyXG5pbXBvcnQgKiBhcyBkeW5hbW9kYiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZHluYW1vZGInO1xyXG5pbXBvcnQgKiBhcyBpYW0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSc7XHJcbmltcG9ydCAqIGFzIGV2ZW50cyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZXZlbnRzJztcclxuaW1wb3J0ICogYXMgdGFyZ2V0cyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZXZlbnRzLXRhcmdldHMnO1xyXG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBSYXRpbmdzTGFtYmRhU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xyXG4gIHB1YmxpYyByZWFkb25seSBhcGk6IGFwaWdhdGV3YXkuUmVzdEFwaTtcclxuICBwdWJsaWMgcmVhZG9ubHkgcmF0aW5nc1RhYmxlOiBkeW5hbW9kYi5JVGFibGU7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcclxuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xyXG5cclxuICAgIC8vIFVzZSBleGlzdGluZyBEeW5hbW9EQiBUYWJsZSBmb3IgUmF0aW5nc1xyXG4gICAgdGhpcy5yYXRpbmdzVGFibGUgPSBkeW5hbW9kYi5UYWJsZS5mcm9tVGFibGVOYW1lKHRoaXMsICdSYXRpbmdzVGFibGUnLCAnU2hyYW0tc2V0dS1yYXRpbmdzJyk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIEV2ZW50QnJpZGdlIEV2ZW50IEJ1c1xyXG4gICAgY29uc3QgZXZlbnRCdXMgPSBuZXcgZXZlbnRzLkV2ZW50QnVzKHRoaXMsICdSYXRpbmdzRXZlbnRCdXMnLCB7XHJcbiAgICAgIGV2ZW50QnVzTmFtZTogJ3NocmFtLXNldHUtZXZlbnRzJyxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIElBTSBSb2xlIGZvciBMYW1iZGEgZnVuY3Rpb25zXHJcbiAgICBjb25zdCBsYW1iZGFSb2xlID0gbmV3IGlhbS5Sb2xlKHRoaXMsICdSYXRpbmdzTGFtYmRhUm9sZScsIHtcclxuICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoJ2xhbWJkYS5hbWF6b25hd3MuY29tJyksXHJcbiAgICAgIG1hbmFnZWRQb2xpY2llczogW1xyXG4gICAgICAgIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZSgnc2VydmljZS1yb2xlL0FXU0xhbWJkYUJhc2ljRXhlY3V0aW9uUm9sZScpLFxyXG4gICAgICBdLFxyXG4gICAgICBpbmxpbmVQb2xpY2llczoge1xyXG4gICAgICAgIER5bmFtb0RCQWNjZXNzOiBuZXcgaWFtLlBvbGljeURvY3VtZW50KHtcclxuICAgICAgICAgIHN0YXRlbWVudHM6IFtcclxuICAgICAgICAgICAgbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xyXG4gICAgICAgICAgICAgIGVmZmVjdDogaWFtLkVmZmVjdC5BTExPVyxcclxuICAgICAgICAgICAgICBhY3Rpb25zOiBbXHJcbiAgICAgICAgICAgICAgICAnZHluYW1vZGI6UHV0SXRlbScsXHJcbiAgICAgICAgICAgICAgICAnZHluYW1vZGI6R2V0SXRlbScsXHJcbiAgICAgICAgICAgICAgICAnZHluYW1vZGI6UXVlcnknLFxyXG4gICAgICAgICAgICAgICAgJ2R5bmFtb2RiOlNjYW4nLFxyXG4gICAgICAgICAgICAgICAgJ2R5bmFtb2RiOlVwZGF0ZUl0ZW0nLFxyXG4gICAgICAgICAgICAgICAgJ2R5bmFtb2RiOkRlbGV0ZUl0ZW0nLFxyXG4gICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgcmVzb3VyY2VzOiBbXHJcbiAgICAgICAgICAgICAgICB0aGlzLnJhdGluZ3NUYWJsZS50YWJsZUFybixcclxuICAgICAgICAgICAgICAgIGAke3RoaXMucmF0aW5nc1RhYmxlLnRhYmxlQXJufS9pbmRleC8qYCxcclxuICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgfSksXHJcbiAgICAgICAgRXZlbnRCcmlkZ2VBY2Nlc3M6IG5ldyBpYW0uUG9saWN5RG9jdW1lbnQoe1xyXG4gICAgICAgICAgc3RhdGVtZW50czogW1xyXG4gICAgICAgICAgICBuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XHJcbiAgICAgICAgICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxyXG4gICAgICAgICAgICAgIGFjdGlvbnM6IFtcclxuICAgICAgICAgICAgICAgICdldmVudHM6UHV0RXZlbnRzJyxcclxuICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgIHJlc291cmNlczogW2V2ZW50QnVzLmV2ZW50QnVzQXJuXSxcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICBdLFxyXG4gICAgICAgIH0pLFxyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gTGFtYmRhIExheWVyIGZvciBjb21tb24gZGVwZW5kZW5jaWVzXHJcbiAgICBjb25zdCByYXRpbmdzTGF5ZXIgPSBuZXcgbGFtYmRhLkxheWVyVmVyc2lvbih0aGlzLCAnUmF0aW5nc0xheWVyJywge1xyXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJy4uL2xhbWJkYS9sYXllcnMvcmF0aW5ncy1sYXllcicpLFxyXG4gICAgICBjb21wYXRpYmxlUnVudGltZXM6IFtsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWF0sXHJcbiAgICAgIGRlc2NyaXB0aW9uOiAnQ29tbW9uIGRlcGVuZGVuY2llcyBmb3IgcmF0aW5ncyBMYW1iZGEgZnVuY3Rpb25zJyxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEVudmlyb25tZW50IHZhcmlhYmxlcyBmb3IgYWxsIExhbWJkYSBmdW5jdGlvbnNcclxuICAgIGNvbnN0IGNvbW1vbkVudmlyb25tZW50ID0ge1xyXG4gICAgICBSQVRJTkdTX1RBQkxFOiB0aGlzLnJhdGluZ3NUYWJsZS50YWJsZU5hbWUsXHJcbiAgICAgIEVWRU5UX0JVU19OQU1FOiBldmVudEJ1cy5ldmVudEJ1c05hbWUsXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIFN1Ym1pdCBSYXRpbmcgTGFtYmRhXHJcbiAgICBjb25zdCBzdWJtaXRSYXRpbmdMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdTdWJtaXRSYXRpbmdGdW5jdGlvbicsIHtcclxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXHJcbiAgICAgIGhhbmRsZXI6ICdzdWJtaXQtcmF0aW5nLmhhbmRsZXInLFxyXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJy4uL2xhbWJkYS9yYXRpbmdzJyksXHJcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXHJcbiAgICAgIGxheWVyczogW3JhdGluZ3NMYXllcl0sXHJcbiAgICAgIGVudmlyb25tZW50OiBjb21tb25FbnZpcm9ubWVudCxcclxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzApLFxyXG4gICAgICBtZW1vcnlTaXplOiAyNTYsXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBHZXQgUHJvZmlsZSBMYW1iZGFcclxuICAgIGNvbnN0IGdldFByb2ZpbGVMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdHZXRQcm9maWxlRnVuY3Rpb24nLCB7XHJcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxyXG4gICAgICBoYW5kbGVyOiAnZ2V0LXByb2ZpbGUuaGFuZGxlcicsXHJcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi4vbGFtYmRhL3JhdGluZ3MnKSxcclxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcclxuICAgICAgbGF5ZXJzOiBbcmF0aW5nc0xheWVyXSxcclxuICAgICAgZW52aXJvbm1lbnQ6IGNvbW1vbkVudmlyb25tZW50LFxyXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMCksXHJcbiAgICAgIG1lbW9yeVNpemU6IDI1NixcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEdldCBTdGF0aXN0aWNzIExhbWJkYVxyXG4gICAgY29uc3QgZ2V0U3RhdGlzdGljc0xhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0dldFN0YXRpc3RpY3NGdW5jdGlvbicsIHtcclxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXHJcbiAgICAgIGhhbmRsZXI6ICdnZXQtc3RhdGlzdGljcy5oYW5kbGVyJyxcclxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvcmF0aW5ncycpLFxyXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxyXG4gICAgICBsYXllcnM6IFtyYXRpbmdzTGF5ZXJdLFxyXG4gICAgICBlbnZpcm9ubWVudDogY29tbW9uRW52aXJvbm1lbnQsXHJcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMwKSxcclxuICAgICAgbWVtb3J5U2l6ZTogNTEyLCAvLyBNb3JlIG1lbW9yeSBmb3Igc3RhdGlzdGljcyBjYWxjdWxhdGlvbnNcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIENhbGN1bGF0ZSBUaWVyIExhbWJkYSAodHJpZ2dlcmVkIGJ5IEV2ZW50QnJpZGdlKVxyXG4gICAgY29uc3QgY2FsY3VsYXRlVGllckxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0NhbGN1bGF0ZVRpZXJGdW5jdGlvbicsIHtcclxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXHJcbiAgICAgIGhhbmRsZXI6ICdjYWxjdWxhdGUtdGllci5oYW5kbGVyJyxcclxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvcmF0aW5ncycpLFxyXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxyXG4gICAgICBsYXllcnM6IFtyYXRpbmdzTGF5ZXJdLFxyXG4gICAgICBlbnZpcm9ubWVudDogY29tbW9uRW52aXJvbm1lbnQsXHJcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDYwKSxcclxuICAgICAgbWVtb3J5U2l6ZTogNTEyLFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gRXZlbnRCcmlkZ2UgUnVsZSB0byB0cmlnZ2VyIHRpZXIgY2FsY3VsYXRpb25cclxuICAgIGNvbnN0IHRpZXJDYWxjdWxhdGlvblJ1bGUgPSBuZXcgZXZlbnRzLlJ1bGUodGhpcywgJ1RpZXJDYWxjdWxhdGlvblJ1bGUnLCB7XHJcbiAgICAgIGV2ZW50QnVzOiBldmVudEJ1cyxcclxuICAgICAgZXZlbnRQYXR0ZXJuOiB7XHJcbiAgICAgICAgc291cmNlOiBbJ3NocmFtLXNldHUucmF0aW5ncyddLFxyXG4gICAgICAgIGRldGFpbFR5cGU6IFsnUmF0aW5nU3VibWl0dGVkJ10sXHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aWVyQ2FsY3VsYXRpb25SdWxlLmFkZFRhcmdldChuZXcgdGFyZ2V0cy5MYW1iZGFGdW5jdGlvbihjYWxjdWxhdGVUaWVyTGFtYmRhKSk7XHJcblxyXG4gICAgLy8gQVBJIEdhdGV3YXlcclxuICAgIHRoaXMuYXBpID0gbmV3IGFwaWdhdGV3YXkuUmVzdEFwaSh0aGlzLCAnUmF0aW5nc0FwaScsIHtcclxuICAgICAgcmVzdEFwaU5hbWU6ICdTaHJhbSBTZXR1IFJhdGluZ3MgQVBJJyxcclxuICAgICAgZGVzY3JpcHRpb246ICdBUEkgZm9yIHJhdGluZyBzeXN0ZW0gd2l0aCBlbXBsb3llci9lbXBsb3llZSBldmFsdWF0aW9uJyxcclxuICAgICAgZGVmYXVsdENvcnNQcmVmbGlnaHRPcHRpb25zOiB7XHJcbiAgICAgICAgYWxsb3dPcmlnaW5zOiBbJ2h0dHA6Ly9sb2NhbGhvc3Q6NTE3MycsICdodHRwOi8vbG9jYWxob3N0OjUxNzQnLCAnaHR0cHM6Ly95b3VyLWRvbWFpbi5jb20nXSxcclxuICAgICAgICBhbGxvd01ldGhvZHM6IFsnR0VUJywgJ1BPU1QnLCAnUFVUJywgJ0RFTEVURScsICdPUFRJT05TJ10sXHJcbiAgICAgICAgYWxsb3dIZWFkZXJzOiBbJ0NvbnRlbnQtVHlwZScsICdYLUFtei1EYXRlJywgJ0F1dGhvcml6YXRpb24nLCAnWC1BcGktS2V5JywgJ1gtQW16LVNlY3VyaXR5LVRva2VuJ10sXHJcbiAgICAgICAgYWxsb3dDcmVkZW50aWFsczogZmFsc2UsXHJcbiAgICAgIH0sXHJcbiAgICAgIGRlcGxveU9wdGlvbnM6IHtcclxuICAgICAgICBzdGFnZU5hbWU6ICdwcm9kJyxcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEFQSSBHYXRld2F5IFJlc291cmNlcyBhbmQgTWV0aG9kc1xyXG4gICAgY29uc3QgcmF0aW5nc1Jlc291cmNlID0gdGhpcy5hcGkucm9vdC5hZGRSZXNvdXJjZSgncmF0aW5ncycpO1xyXG5cclxuICAgIC8vIFBPU1QgL3JhdGluZ3Mvc3VibWl0XHJcbiAgICBjb25zdCBzdWJtaXRSZXNvdXJjZSA9IHJhdGluZ3NSZXNvdXJjZS5hZGRSZXNvdXJjZSgnc3VibWl0Jyk7XHJcbiAgICBzdWJtaXRSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihzdWJtaXRSYXRpbmdMYW1iZGEpLCB7XHJcbiAgICAgIG1ldGhvZFJlc3BvbnNlczogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIHN0YXR1c0NvZGU6ICcyMDAnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgc3RhdHVzQ29kZTogJzQwMCcsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBzdGF0dXNDb2RlOiAnNTAwJyxcclxuICAgICAgICB9LFxyXG4gICAgICBdLFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gR0VUIC9yYXRpbmdzL3Byb2ZpbGUve3VzZXJJZH1cclxuICAgIGNvbnN0IHByb2ZpbGVSZXNvdXJjZSA9IHJhdGluZ3NSZXNvdXJjZS5hZGRSZXNvdXJjZSgncHJvZmlsZScpO1xyXG4gICAgY29uc3QgdXNlclByb2ZpbGVSZXNvdXJjZSA9IHByb2ZpbGVSZXNvdXJjZS5hZGRSZXNvdXJjZSgne3VzZXJJZH0nKTtcclxuICAgIHVzZXJQcm9maWxlUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihnZXRQcm9maWxlTGFtYmRhKSk7XHJcblxyXG4gICAgLy8gR0VUIC9yYXRpbmdzL3N0YXRpc3RpY3Mve3VzZXJJZH1cclxuICAgIGNvbnN0IHN0YXRpc3RpY3NSZXNvdXJjZSA9IHJhdGluZ3NSZXNvdXJjZS5hZGRSZXNvdXJjZSgnc3RhdGlzdGljcycpO1xyXG4gICAgY29uc3QgdXNlclN0YXRpc3RpY3NSZXNvdXJjZSA9IHN0YXRpc3RpY3NSZXNvdXJjZS5hZGRSZXNvdXJjZSgne3VzZXJJZH0nKTtcclxuICAgIHVzZXJTdGF0aXN0aWNzUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihnZXRTdGF0aXN0aWNzTGFtYmRhKSk7XHJcblxyXG4gICAgLy8gR0VUIC9yYXRpbmdzL3VzZXIve3VzZXJJZH0vcmF0aW5nc1xyXG4gICAgY29uc3QgdXNlclJlc291cmNlID0gcmF0aW5nc1Jlc291cmNlLmFkZFJlc291cmNlKCd1c2VyJyk7XHJcbiAgICBjb25zdCB1c2VySWRSZXNvdXJjZSA9IHVzZXJSZXNvdXJjZS5hZGRSZXNvdXJjZSgne3VzZXJJZH0nKTtcclxuICAgIGNvbnN0IHVzZXJSYXRpbmdzUmVzb3VyY2UgPSB1c2VySWRSZXNvdXJjZS5hZGRSZXNvdXJjZSgncmF0aW5ncycpO1xyXG4gICAgdXNlclJhdGluZ3NSZXNvdXJjZS5hZGRNZXRob2QoJ0dFVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGdldFByb2ZpbGVMYW1iZGEpKTtcclxuXHJcbiAgICAvLyBDbG91ZFdhdGNoIEFsYXJtcyBmb3IgbW9uaXRvcmluZ1xyXG4gICAgY29uc3Qgc3VibWl0UmF0aW5nQWxhcm0gPSBuZXcgY2RrLmF3c19jbG91ZHdhdGNoLkFsYXJtKHRoaXMsICdTdWJtaXRSYXRpbmdFcnJvckFsYXJtJywge1xyXG4gICAgICBtZXRyaWM6IHN1Ym1pdFJhdGluZ0xhbWJkYS5tZXRyaWNFcnJvcnMoKSxcclxuICAgICAgdGhyZXNob2xkOiA1LFxyXG4gICAgICBldmFsdWF0aW9uUGVyaW9kczogMixcclxuICAgICAgdHJlYXRNaXNzaW5nRGF0YTogY2RrLmF3c19jbG91ZHdhdGNoLlRyZWF0TWlzc2luZ0RhdGEuTk9UX0JSRUFDSElORyxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIE91dHB1dHNcclxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdSYXRpbmdzQXBpVXJsJywge1xyXG4gICAgICB2YWx1ZTogdGhpcy5hcGkudXJsLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ1JhdGluZ3MgQVBJIEdhdGV3YXkgVVJMJyxcclxuICAgICAgZXhwb3J0TmFtZTogJ1JhdGluZ3NBcGlVcmwnLFxyXG4gICAgfSk7XHJcblxyXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ1JhdGluZ3NUYWJsZU5hbWUnLCB7XHJcbiAgICAgIHZhbHVlOiB0aGlzLnJhdGluZ3NUYWJsZS50YWJsZU5hbWUsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiAnRHluYW1vREIgUmF0aW5ncyBUYWJsZSBOYW1lJyxcclxuICAgICAgZXhwb3J0TmFtZTogJ1JhdGluZ3NUYWJsZU5hbWUnLFxyXG4gICAgfSk7XHJcblxyXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0V2ZW50QnVzTmFtZScsIHtcclxuICAgICAgdmFsdWU6IGV2ZW50QnVzLmV2ZW50QnVzTmFtZSxcclxuICAgICAgZGVzY3JpcHRpb246ICdFdmVudEJyaWRnZSBFdmVudCBCdXMgTmFtZScsXHJcbiAgICAgIGV4cG9ydE5hbWU6ICdSYXRpbmdzRXZlbnRCdXNOYW1lJyxcclxuICAgIH0pO1xyXG4gIH1cclxufSJdfQ==