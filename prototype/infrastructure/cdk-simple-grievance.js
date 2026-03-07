#!/usr/bin/env node
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
exports.SimpleGrievanceStack = void 0;
require("source-map-support/register");
const cdk = __importStar(require("aws-cdk-lib"));
const lambda = __importStar(require("aws-cdk-lib/aws-lambda"));
const apigateway = __importStar(require("aws-cdk-lib/aws-apigateway"));
const dynamodb = __importStar(require("aws-cdk-lib/aws-dynamodb"));
const iam = __importStar(require("aws-cdk-lib/aws-iam"));
const s3 = __importStar(require("aws-cdk-lib/aws-s3"));
class SimpleGrievanceStack extends cdk.Stack {
    constructor(scope, id, props) {
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
exports.SimpleGrievanceStack = SimpleGrievanceStack;
const app = new cdk.App();
new SimpleGrievanceStack(app, 'SimpleGrievanceStack', {
    env: {
        account: '808840719701',
        region: 'ap-south-1',
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLXNpbXBsZS1ncmlldmFuY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjZGstc2ltcGxlLWdyaWV2YW5jZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsdUNBQXFDO0FBQ3JDLGlEQUFtQztBQUNuQywrREFBaUQ7QUFDakQsdUVBQXlEO0FBQ3pELG1FQUFxRDtBQUNyRCx5REFBMkM7QUFDM0MsdURBQXlDO0FBR3pDLE1BQWEsb0JBQXFCLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDakQsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4Qiw0QkFBNEI7UUFDNUIsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLHVCQUF1QixDQUFDLENBQUM7UUFDckcsTUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLHNCQUFzQixFQUFFLHlDQUF5QyxDQUFDLENBQUM7UUFFdEgsZ0NBQWdDO1FBQ2hDLE1BQU0sVUFBVSxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUU7WUFDM0QsU0FBUyxFQUFFLElBQUksR0FBRyxDQUFDLGdCQUFnQixDQUFDLHNCQUFzQixDQUFDO1lBQzNELGVBQWUsRUFBRTtnQkFDZixHQUFHLENBQUMsYUFBYSxDQUFDLHdCQUF3QixDQUFDLDBDQUEwQyxDQUFDO2FBQ3ZGO1lBQ0QsY0FBYyxFQUFFO2dCQUNkLGNBQWMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxjQUFjLENBQUM7b0JBQ3JDLFVBQVUsRUFBRTt3QkFDVixJQUFJLEdBQUcsQ0FBQyxlQUFlLENBQUM7NEJBQ3RCLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUs7NEJBQ3hCLE9BQU8sRUFBRTtnQ0FDUCxrQkFBa0I7Z0NBQ2xCLGtCQUFrQjtnQ0FDbEIsZ0JBQWdCO2dDQUNoQixlQUFlO2dDQUNmLHFCQUFxQjtnQ0FDckIscUJBQXFCOzZCQUN0Qjs0QkFDRCxTQUFTLEVBQUU7Z0NBQ1Qsa0RBQWtEO2dDQUNsRCwwREFBMEQ7NkJBQzNEO3lCQUNGLENBQUM7cUJBQ0g7aUJBQ0YsQ0FBQztnQkFDRixRQUFRLEVBQUUsSUFBSSxHQUFHLENBQUMsY0FBYyxDQUFDO29CQUMvQixVQUFVLEVBQUU7d0JBQ1YsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDOzRCQUN0QixNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLOzRCQUN4QixPQUFPLEVBQUU7Z0NBQ1AsY0FBYztnQ0FDZCxjQUFjO2dDQUNkLGlCQUFpQjtnQ0FDakIscUJBQXFCOzZCQUN0Qjs0QkFDRCxTQUFTLEVBQUUsQ0FBQyx3REFBd0QsQ0FBQzt5QkFDdEUsQ0FBQztxQkFDSDtpQkFDRixDQUFDO2FBQ0g7U0FDRixDQUFDLENBQUM7UUFFSCxpREFBaUQ7UUFDakQsTUFBTSxpQkFBaUIsR0FBRztZQUN4QixlQUFlLEVBQUUsdUJBQXVCO1lBQ3hDLFlBQVksRUFBRSx5Q0FBeUM7U0FDeEQsQ0FBQztRQUVGLDBCQUEwQjtRQUMxQixNQUFNLHFCQUFxQixHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUseUJBQXlCLEVBQUU7WUFDakYsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztZQUNuQyxPQUFPLEVBQUUsMEJBQTBCO1lBQ25DLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQztZQUNsRCxJQUFJLEVBQUUsVUFBVTtZQUNoQixXQUFXLEVBQUUsaUJBQWlCO1lBQzlCLE9BQU8sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDakMsVUFBVSxFQUFFLEdBQUc7U0FDaEIsQ0FBQyxDQUFDO1FBRUgsOENBQThDO1FBQzlDLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSx1QkFBdUIsRUFBRTtZQUM3RSxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ25DLE9BQU8sRUFBRSx3QkFBd0I7WUFDakMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDO1lBQ2xELElBQUksRUFBRSxVQUFVO1lBQ2hCLFdBQVcsRUFBRSxpQkFBaUI7WUFDOUIsT0FBTyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUNqQyxVQUFVLEVBQUUsR0FBRztTQUNoQixDQUFDLENBQUM7UUFFSCx3QkFBd0I7UUFDeEIsTUFBTSxHQUFHLEdBQUcsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7WUFDdkQsV0FBVyxFQUFFLHNCQUFzQjtZQUNuQyxXQUFXLEVBQUUsOENBQThDO1lBQzNELDJCQUEyQixFQUFFO2dCQUMzQixZQUFZLEVBQUUsQ0FBQyx1QkFBdUIsRUFBRSx1QkFBdUIsRUFBRSx1QkFBdUIsQ0FBQztnQkFDekYsWUFBWSxFQUFFLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBQztnQkFDekQsWUFBWSxFQUFFLENBQUMsY0FBYyxFQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUsV0FBVyxFQUFFLHNCQUFzQixDQUFDO2dCQUNsRyxnQkFBZ0IsRUFBRSxLQUFLO2FBQ3hCO1lBQ0QsYUFBYSxFQUFFO2dCQUNiLFNBQVMsRUFBRSxNQUFNO2FBQ2xCO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsb0NBQW9DO1FBQ3BDLE1BQU0saUJBQWlCLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFNUQseUJBQXlCO1FBQ3pCLE1BQU0sY0FBYyxHQUFHLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMvRCxjQUFjLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7UUFFMUYsc0JBQXNCO1FBQ3RCLE1BQU0sWUFBWSxHQUFHLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMzRCxZQUFZLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7UUFFckYsU0FBUztRQUNULElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLEVBQUU7WUFDekMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxHQUFHO1lBQ2QsV0FBVyxFQUFFLDBCQUEwQjtTQUN4QyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUEvR0Qsb0RBK0dDO0FBRUQsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDMUIsSUFBSSxvQkFBb0IsQ0FBQyxHQUFHLEVBQUUsc0JBQXNCLEVBQUU7SUFDcEQsR0FBRyxFQUFFO1FBQ0gsT0FBTyxFQUFFLGNBQWM7UUFDdkIsTUFBTSxFQUFFLFlBQVk7S0FDckI7Q0FDRixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXHJcbmltcG9ydCAnc291cmNlLW1hcC1zdXBwb3J0L3JlZ2lzdGVyJztcclxuaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcclxuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xyXG5pbXBvcnQgKiBhcyBhcGlnYXRld2F5IGZyb20gJ2F3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5JztcclxuaW1wb3J0ICogYXMgZHluYW1vZGIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWR5bmFtb2RiJztcclxuaW1wb3J0ICogYXMgaWFtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xyXG5pbXBvcnQgKiBhcyBzMyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtczMnO1xyXG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBTaW1wbGVHcmlldmFuY2VTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XHJcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xyXG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XHJcblxyXG4gICAgLy8gSW1wb3J0IGV4aXN0aW5nIHJlc291cmNlc1xyXG4gICAgY29uc3QgZ3JpZXZhbmNlVGFibGUgPSBkeW5hbW9kYi5UYWJsZS5mcm9tVGFibGVOYW1lKHRoaXMsICdHcmlldmFuY2VUYWJsZScsICdTaHJhbS1zZXR1LWdyaWV2YW5jZXMnKTtcclxuICAgIGNvbnN0IGF1ZGlvQnVja2V0ID0gczMuQnVja2V0LmZyb21CdWNrZXROYW1lKHRoaXMsICdHcmlldmFuY2VBdWRpb0J1Y2tldCcsICdzaHJhbS1zZXR1LWdyaWV2YW5jZS1hdWRpby04MDg4NDA3MTk3MDEnKTtcclxuXHJcbiAgICAvLyBJQU0gUm9sZSBmb3IgTGFtYmRhIGZ1bmN0aW9uc1xyXG4gICAgY29uc3QgbGFtYmRhUm9sZSA9IG5ldyBpYW0uUm9sZSh0aGlzLCAnR3JpZXZhbmNlTGFtYmRhUm9sZScsIHtcclxuICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoJ2xhbWJkYS5hbWF6b25hd3MuY29tJyksXHJcbiAgICAgIG1hbmFnZWRQb2xpY2llczogW1xyXG4gICAgICAgIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZSgnc2VydmljZS1yb2xlL0FXU0xhbWJkYUJhc2ljRXhlY3V0aW9uUm9sZScpLFxyXG4gICAgICBdLFxyXG4gICAgICBpbmxpbmVQb2xpY2llczoge1xyXG4gICAgICAgIER5bmFtb0RCQWNjZXNzOiBuZXcgaWFtLlBvbGljeURvY3VtZW50KHtcclxuICAgICAgICAgIHN0YXRlbWVudHM6IFtcclxuICAgICAgICAgICAgbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xyXG4gICAgICAgICAgICAgIGVmZmVjdDogaWFtLkVmZmVjdC5BTExPVyxcclxuICAgICAgICAgICAgICBhY3Rpb25zOiBbXHJcbiAgICAgICAgICAgICAgICAnZHluYW1vZGI6UHV0SXRlbScsXHJcbiAgICAgICAgICAgICAgICAnZHluYW1vZGI6R2V0SXRlbScsXHJcbiAgICAgICAgICAgICAgICAnZHluYW1vZGI6UXVlcnknLFxyXG4gICAgICAgICAgICAgICAgJ2R5bmFtb2RiOlNjYW4nLFxyXG4gICAgICAgICAgICAgICAgJ2R5bmFtb2RiOlVwZGF0ZUl0ZW0nLFxyXG4gICAgICAgICAgICAgICAgJ2R5bmFtb2RiOkRlbGV0ZUl0ZW0nLFxyXG4gICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgcmVzb3VyY2VzOiBbXHJcbiAgICAgICAgICAgICAgICAnYXJuOmF3czpkeW5hbW9kYjoqOio6dGFibGUvU2hyYW0tc2V0dS1ncmlldmFuY2VzJyxcclxuICAgICAgICAgICAgICAgICdhcm46YXdzOmR5bmFtb2RiOio6Kjp0YWJsZS9TaHJhbS1zZXR1LWdyaWV2YW5jZXMvaW5kZXgvKicsXHJcbiAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICBdLFxyXG4gICAgICAgIH0pLFxyXG4gICAgICAgIFMzQWNjZXNzOiBuZXcgaWFtLlBvbGljeURvY3VtZW50KHtcclxuICAgICAgICAgIHN0YXRlbWVudHM6IFtcclxuICAgICAgICAgICAgbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xyXG4gICAgICAgICAgICAgIGVmZmVjdDogaWFtLkVmZmVjdC5BTExPVyxcclxuICAgICAgICAgICAgICBhY3Rpb25zOiBbXHJcbiAgICAgICAgICAgICAgICAnczM6R2V0T2JqZWN0JyxcclxuICAgICAgICAgICAgICAgICdzMzpQdXRPYmplY3QnLFxyXG4gICAgICAgICAgICAgICAgJ3MzOkRlbGV0ZU9iamVjdCcsXHJcbiAgICAgICAgICAgICAgICAnczM6R2V0T2JqZWN0VmVyc2lvbicsXHJcbiAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICByZXNvdXJjZXM6IFsnYXJuOmF3czpzMzo6OnNocmFtLXNldHUtZ3JpZXZhbmNlLWF1ZGlvLTgwODg0MDcxOTcwMS8qJ10sXHJcbiAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgXSxcclxuICAgICAgICB9KSxcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEVudmlyb25tZW50IHZhcmlhYmxlcyBmb3IgYWxsIExhbWJkYSBmdW5jdGlvbnNcclxuICAgIGNvbnN0IGNvbW1vbkVudmlyb25tZW50ID0ge1xyXG4gICAgICBHUklFVkFOQ0VfVEFCTEU6ICdTaHJhbS1zZXR1LWdyaWV2YW5jZXMnLFxyXG4gICAgICBBVURJT19CVUNLRVQ6ICdzaHJhbS1zZXR1LWdyaWV2YW5jZS1hdWRpby04MDg4NDA3MTk3MDEnLFxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBTdWJtaXQgR3JpZXZhbmNlIExhbWJkYVxyXG4gICAgY29uc3Qgc3VibWl0R3JpZXZhbmNlTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnU3VibWl0R3JpZXZhbmNlRnVuY3Rpb24nLCB7XHJcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxyXG4gICAgICBoYW5kbGVyOiAnc3VibWl0LWdyaWV2YW5jZS5oYW5kbGVyJyxcclxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvZ3JpZXZhbmNlJyksXHJcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXHJcbiAgICAgIGVudmlyb25tZW50OiBjb21tb25FbnZpcm9ubWVudCxcclxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzApLFxyXG4gICAgICBtZW1vcnlTaXplOiAyNTYsXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBHZXQgR3JpZXZhbmNlcyBMYW1iZGEgKGZvciBhZG1pbiBkYXNoYm9hcmQpXHJcbiAgICBjb25zdCBnZXRHcmlldmFuY2VzTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnR2V0R3JpZXZhbmNlc0Z1bmN0aW9uJywge1xyXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcclxuICAgICAgaGFuZGxlcjogJ2dldC1ncmlldmFuY2VzLmhhbmRsZXInLFxyXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJy4uL2xhbWJkYS9ncmlldmFuY2UnKSxcclxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcclxuICAgICAgZW52aXJvbm1lbnQ6IGNvbW1vbkVudmlyb25tZW50LFxyXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMCksXHJcbiAgICAgIG1lbW9yeVNpemU6IDI1NixcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEFQSSBHYXRld2F5IHdpdGggQ09SU1xyXG4gICAgY29uc3QgYXBpID0gbmV3IGFwaWdhdGV3YXkuUmVzdEFwaSh0aGlzLCAnR3JpZXZhbmNlQXBpJywge1xyXG4gICAgICByZXN0QXBpTmFtZTogJ1NpbXBsZSBHcmlldmFuY2UgQVBJJyxcclxuICAgICAgZGVzY3JpcHRpb246ICdTaW1wbGUgZ3JpZXZhbmNlIEFQSSB3aXRoIENPUlMgZm9yIGxvY2FsaG9zdCcsXHJcbiAgICAgIGRlZmF1bHRDb3JzUHJlZmxpZ2h0T3B0aW9uczoge1xyXG4gICAgICAgIGFsbG93T3JpZ2luczogWydodHRwOi8vbG9jYWxob3N0OjUxNzMnLCAnaHR0cDovL2xvY2FsaG9zdDo1MTc0JywgJ2h0dHA6Ly9sb2NhbGhvc3Q6NTE3NSddLFxyXG4gICAgICAgIGFsbG93TWV0aG9kczogWydHRVQnLCAnUE9TVCcsICdQVVQnLCAnREVMRVRFJywgJ09QVElPTlMnXSxcclxuICAgICAgICBhbGxvd0hlYWRlcnM6IFsnQ29udGVudC1UeXBlJywgJ1gtQW16LURhdGUnLCAnQXV0aG9yaXphdGlvbicsICdYLUFwaS1LZXknLCAnWC1BbXotU2VjdXJpdHktVG9rZW4nXSxcclxuICAgICAgICBhbGxvd0NyZWRlbnRpYWxzOiBmYWxzZSxcclxuICAgICAgfSxcclxuICAgICAgZGVwbG95T3B0aW9uczoge1xyXG4gICAgICAgIHN0YWdlTmFtZTogJ3Byb2QnLFxyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gQVBJIEdhdGV3YXkgUmVzb3VyY2VzIGFuZCBNZXRob2RzXHJcbiAgICBjb25zdCBncmlldmFuY2VSZXNvdXJjZSA9IGFwaS5yb290LmFkZFJlc291cmNlKCdncmlldmFuY2UnKTtcclxuXHJcbiAgICAvLyBQT1NUIC9ncmlldmFuY2Uvc3VibWl0XHJcbiAgICBjb25zdCBzdWJtaXRSZXNvdXJjZSA9IGdyaWV2YW5jZVJlc291cmNlLmFkZFJlc291cmNlKCdzdWJtaXQnKTtcclxuICAgIHN1Ym1pdFJlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHN1Ym1pdEdyaWV2YW5jZUxhbWJkYSkpO1xyXG5cclxuICAgIC8vIEdFVCAvZ3JpZXZhbmNlL2xpc3RcclxuICAgIGNvbnN0IGxpc3RSZXNvdXJjZSA9IGdyaWV2YW5jZVJlc291cmNlLmFkZFJlc291cmNlKCdsaXN0Jyk7XHJcbiAgICBsaXN0UmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihnZXRHcmlldmFuY2VzTGFtYmRhKSk7XHJcblxyXG4gICAgLy8gT3V0cHV0XHJcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnR3JpZXZhbmNlQXBpVXJsJywge1xyXG4gICAgICB2YWx1ZTogYXBpLnVybCxcclxuICAgICAgZGVzY3JpcHRpb246ICdTaW1wbGUgR3JpZXZhbmNlIEFQSSBVUkwnLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5jb25zdCBhcHAgPSBuZXcgY2RrLkFwcCgpO1xyXG5uZXcgU2ltcGxlR3JpZXZhbmNlU3RhY2soYXBwLCAnU2ltcGxlR3JpZXZhbmNlU3RhY2snLCB7XHJcbiAgZW52OiB7XHJcbiAgICBhY2NvdW50OiAnODA4ODQwNzE5NzAxJyxcclxuICAgIHJlZ2lvbjogJ2FwLXNvdXRoLTEnLFxyXG4gIH0sXHJcbn0pOyJdfQ==