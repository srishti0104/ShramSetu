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
exports.JobApplicationsStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const lambda = __importStar(require("aws-cdk-lib/aws-lambda"));
const apigateway = __importStar(require("aws-cdk-lib/aws-apigateway"));
const dynamodb = __importStar(require("aws-cdk-lib/aws-dynamodb"));
class JobApplicationsStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // DynamoDB Table for Job Applications
        const jobApplicationsTable = new dynamodb.Table(this, 'JobApplicationsTable', {
            tableName: 'Shram-setu-job-applications',
            partitionKey: {
                name: 'applicationId',
                type: dynamodb.AttributeType.STRING
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
            pointInTimeRecovery: true
        });
        // GSI for querying by user
        jobApplicationsTable.addGlobalSecondaryIndex({
            indexName: 'UserApplicationsIndex',
            partitionKey: {
                name: 'userId',
                type: dynamodb.AttributeType.STRING
            },
            sortKey: {
                name: 'appliedAt',
                type: dynamodb.AttributeType.STRING
            }
        });
        // GSI for querying by contractor
        jobApplicationsTable.addGlobalSecondaryIndex({
            indexName: 'ContractorApplicationsIndex',
            partitionKey: {
                name: 'contractorId',
                type: dynamodb.AttributeType.STRING
            },
            sortKey: {
                name: 'appliedAt',
                type: dynamodb.AttributeType.STRING
            }
        });
        // GSI for querying by contractor and job
        jobApplicationsTable.addGlobalSecondaryIndex({
            indexName: 'ContractorJobIndex',
            partitionKey: {
                name: 'contractorJobIndex',
                type: dynamodb.AttributeType.STRING
            },
            sortKey: {
                name: 'appliedAt',
                type: dynamodb.AttributeType.STRING
            }
        });
        // Lambda function for submitting applications
        const submitApplicationLambda = new lambda.Function(this, 'SubmitApplicationFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'submit-application.handler',
            code: lambda.Code.fromAsset('../lambda/job-applications'),
            timeout: cdk.Duration.seconds(30),
            memorySize: 256,
            environment: {
                JOB_APPLICATIONS_TABLE: jobApplicationsTable.tableName
            }
        });
        // Lambda function for getting user applications
        const getUserApplicationsLambda = new lambda.Function(this, 'GetUserApplicationsFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'get-user-applications.handler',
            code: lambda.Code.fromAsset('../lambda/job-applications'),
            timeout: cdk.Duration.seconds(30),
            memorySize: 256,
            environment: {
                JOB_APPLICATIONS_TABLE: jobApplicationsTable.tableName
            }
        });
        // Lambda function for getting contractor applications
        const getContractorApplicationsLambda = new lambda.Function(this, 'GetContractorApplicationsFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'get-contractor-applications.handler',
            code: lambda.Code.fromAsset('../lambda/job-applications'),
            timeout: cdk.Duration.seconds(30),
            memorySize: 256,
            environment: {
                JOB_APPLICATIONS_TABLE: jobApplicationsTable.tableName
            }
        });
        // Lambda function for updating application status
        const updateApplicationStatusLambda = new lambda.Function(this, 'UpdateApplicationStatusFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'update-application-status.handler',
            code: lambda.Code.fromAsset('../lambda/job-applications'),
            timeout: cdk.Duration.seconds(30),
            memorySize: 256,
            environment: {
                JOB_APPLICATIONS_TABLE: jobApplicationsTable.tableName
            }
        });
        // Grant DynamoDB permissions to Lambda functions
        jobApplicationsTable.grantReadWriteData(submitApplicationLambda);
        jobApplicationsTable.grantReadData(getUserApplicationsLambda);
        jobApplicationsTable.grantReadData(getContractorApplicationsLambda);
        jobApplicationsTable.grantReadWriteData(updateApplicationStatusLambda);
        // API Gateway
        const api = new apigateway.RestApi(this, 'JobApplicationsApi', {
            restApiName: 'Shram Setu Job Applications API',
            description: 'API for managing job applications',
            defaultCorsPreflightOptions: {
                allowOrigins: apigateway.Cors.ALL_ORIGINS,
                allowMethods: apigateway.Cors.ALL_METHODS,
                allowHeaders: ['Content-Type', 'Accept', 'Authorization']
            }
        });
        // API Resources
        const applicationsResource = api.root.addResource('applications');
        // POST /applications/submit
        const submitResource = applicationsResource.addResource('submit');
        submitResource.addMethod('POST', new apigateway.LambdaIntegration(submitApplicationLambda));
        // GET /applications/user/{userId}
        const userResource = applicationsResource.addResource('user');
        const userIdResource = userResource.addResource('{userId}');
        userIdResource.addMethod('GET', new apigateway.LambdaIntegration(getUserApplicationsLambda));
        // GET /applications/contractor/{contractorId}
        const contractorResource = applicationsResource.addResource('contractor');
        const contractorIdResource = contractorResource.addResource('{contractorId}');
        contractorIdResource.addMethod('GET', new apigateway.LambdaIntegration(getContractorApplicationsLambda));
        // PUT /applications/{applicationId}/status
        const applicationIdResource = applicationsResource.addResource('{applicationId}');
        const statusResource = applicationIdResource.addResource('status');
        statusResource.addMethod('PUT', new apigateway.LambdaIntegration(updateApplicationStatusLambda));
        // Output the API URL
        new cdk.CfnOutput(this, 'JobApplicationsApiUrl', {
            value: api.url,
            description: 'Job Applications API Gateway URL'
        });
        // Output the DynamoDB table name
        new cdk.CfnOutput(this, 'JobApplicationsTableName', {
            value: jobApplicationsTable.tableName,
            description: 'Job Applications DynamoDB Table Name'
        });
    }
}
exports.JobApplicationsStack = JobApplicationsStack;
// Create the CDK app
const app = new cdk.App();
new JobApplicationsStack(app, 'ShramSetuJobApplicationsStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION || 'ap-south-1'
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLWpvYi1hcHBsaWNhdGlvbnMtYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2RrLWpvYi1hcHBsaWNhdGlvbnMtYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSxpREFBbUM7QUFDbkMsK0RBQWlEO0FBQ2pELHVFQUF5RDtBQUN6RCxtRUFBcUQ7QUFHckQsTUFBYSxvQkFBcUIsU0FBUSxHQUFHLENBQUMsS0FBSztJQUNqRCxZQUFZLEtBQWMsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDNUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsc0NBQXNDO1FBQ3RDLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxzQkFBc0IsRUFBRTtZQUM1RSxTQUFTLEVBQUUsNkJBQTZCO1lBQ3hDLFlBQVksRUFBRTtnQkFDWixJQUFJLEVBQUUsZUFBZTtnQkFDckIsSUFBSSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTTthQUNwQztZQUNELFdBQVcsRUFBRSxRQUFRLENBQUMsV0FBVyxDQUFDLGVBQWU7WUFDakQsYUFBYSxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsTUFBTTtZQUN2QyxtQkFBbUIsRUFBRSxJQUFJO1NBQzFCLENBQUMsQ0FBQztRQUVILDJCQUEyQjtRQUMzQixvQkFBb0IsQ0FBQyx1QkFBdUIsQ0FBQztZQUMzQyxTQUFTLEVBQUUsdUJBQXVCO1lBQ2xDLFlBQVksRUFBRTtnQkFDWixJQUFJLEVBQUUsUUFBUTtnQkFDZCxJQUFJLEVBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNO2FBQ3BDO1lBQ0QsT0FBTyxFQUFFO2dCQUNQLElBQUksRUFBRSxXQUFXO2dCQUNqQixJQUFJLEVBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNO2FBQ3BDO1NBQ0YsQ0FBQyxD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cUJBQXFCO0FBQ3JCLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQzFCLElBQUksb0JBQW9CLENBQUMsR0FBRyxFQUFFLCtCQUErQixFQUFFO0lBQzdELEdBQUcsRUFBRTtRQUNILE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQjtRQUN4QyxNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsSUFBSSxZQUFZO0tBQ3ZEO0NBQ0YsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxyXG5pbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xyXG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XHJcbmltcG9ydCAqIGFzIGFwaWdhdGV3YXkgZnJvbSAnYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXknO1xyXG5pbXBvcnQgKiBhcyBkeW5hbW9kYiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZHluYW1vZGInO1xyXG5pbXBvcnQgKiBhcyBpYW0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSc7XHJcblxyXG5leHBvcnQgY2xhc3MgSm9iQXBwbGljYXRpb25zU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xyXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBjZGsuQXBwLCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XHJcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcclxuXHJcbiAgICAvLyBEeW5hbW9EQiBUYWJsZSBmb3IgSm9iIEFwcGxpY2F0aW9uc1xyXG4gICAgY29uc3Qgam9iQXBwbGljYXRpb25zVGFibGUgPSBuZXcgZHluYW1vZGIuVGFibGUodGhpcywgJ0pvYkFwcGxpY2F0aW9uc1RhYmxlJywge1xyXG4gICAgICB0YWJsZU5hbWU6ICdTaHJhbS1zZXR1LWpvYi1hcHBsaWNhdGlvbnMnLFxyXG4gICAgICBwYXJ0aXRpb25LZXk6IHtcclxuICAgICAgICBuYW1lOiAnYXBwbGljYXRpb25JZCcsXHJcbiAgICAgICAgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkdcclxuICAgICAgfSxcclxuICAgICAgYmlsbGluZ01vZGU6IGR5bmFtb2RiLkJpbGxpbmdNb2RlLlBBWV9QRVJfUkVRVUVTVCxcclxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuUkVUQUlOLFxyXG4gICAgICBwb2ludEluVGltZVJlY292ZXJ5OiB0cnVlXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBHU0kgZm9yIHF1ZXJ5aW5nIGJ5IHVzZXJcclxuICAgIGpvYkFwcGxpY2F0aW9uc1RhYmxlLmFkZEdsb2JhbFNlY29uZGFyeUluZGV4KHtcclxuICAgICAgaW5kZXhOYW1lOiAnVXNlckFwcGxpY2F0aW9uc0luZGV4JyxcclxuICAgICAgcGFydGl0aW9uS2V5OiB7XHJcbiAgICAgICAgbmFtZTogJ3VzZXJJZCcsXHJcbiAgICAgICAgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkdcclxuICAgICAgfSxcclxuICAgICAgc29ydEtleToge1xyXG4gICAgICAgIG5hbWU6ICdhcHBsaWVkQXQnLFxyXG4gICAgICAgIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HXHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEdTSSBmb3IgcXVlcnlpbmcgYnkgY29udHJhY3RvclxyXG4gICAgam9iQXBwbGljYXRpb25zVGFibGUuYWRkR2xvYmFsU2Vjb25kYXJ5SW5kZXgoe1xyXG4gICAgICBpbmRleE5hbWU6ICdDb250cmFjdG9yQXBwbGljYXRpb25zSW5kZXgnLFxyXG4gICAgICBwYXJ0aXRpb25LZXk6IHtcclxuICAgICAgICBuYW1lOiAnY29udHJhY3RvcklkJyxcclxuICAgICAgICB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklOR1xyXG4gICAgICB9LFxyXG4gICAgICBzb3J0S2V5OiB7XHJcbiAgICAgICAgbmFtZTogJ2FwcGxpZWRBdCcsXHJcbiAgICAgICAgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkdcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gR1NJIGZvciBxdWVyeWluZyBieSBjb250cmFjdG9yIGFuZCBqb2JcclxuICAgIGpvYkFwcGxpY2F0aW9uc1RhYmxlLmFkZEdsb2JhbFNlY29uZGFyeUluZGV4KHtcclxuICAgICAgaW5kZXhOYW1lOiAnQ29udHJhY3RvckpvYkluZGV4JyxcclxuICAgICAgcGFydGl0aW9uS2V5OiB7XHJcbiAgICAgICAgbmFtZTogJ2NvbnRyYWN0b3JKb2JJbmRleCcsXHJcbiAgICAgICAgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkdcclxuICAgICAgfSxcclxuICAgICAgc29ydEtleToge1xyXG4gICAgICAgIG5hbWU6ICdhcHBsaWVkQXQnLFxyXG4gICAgICAgIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HXHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIExhbWJkYSBmdW5jdGlvbiBmb3Igc3VibWl0dGluZyBhcHBsaWNhdGlvbnNcclxuICAgIGNvbnN0IHN1Ym1pdEFwcGxpY2F0aW9uTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnU3VibWl0QXBwbGljYXRpb25GdW5jdGlvbicsIHtcclxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXHJcbiAgICAgIGhhbmRsZXI6ICdzdWJtaXQtYXBwbGljYXRpb24uaGFuZGxlcicsXHJcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi4vbGFtYmRhL2pvYi1hcHBsaWNhdGlvbnMnKSxcclxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzApLFxyXG4gICAgICBtZW1vcnlTaXplOiAyNTYsXHJcbiAgICAgIGVudmlyb25tZW50OiB7XHJcbiAgICAgICAgSk9CX0FQUExJQ0FUSU9OU19UQUJMRTogam9iQXBwbGljYXRpb25zVGFibGUudGFibGVOYW1lXHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIExhbWJkYSBmdW5jdGlvbiBmb3IgZ2V0dGluZyB1c2VyIGFwcGxpY2F0aW9uc1xyXG4gICAgY29uc3QgZ2V0VXNlckFwcGxpY2F0aW9uc0xhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0dldFVzZXJBcHBsaWNhdGlvbnNGdW5jdGlvbicsIHtcclxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXHJcbiAgICAgIGhhbmRsZXI6ICdnZXQtdXNlci1hcHBsaWNhdGlvbnMuaGFuZGxlcicsXHJcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi4vbGFtYmRhL2pvYi1hcHBsaWNhdGlvbnMnKSxcclxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzApLFxyXG4gICAgICBtZW1vcnlTaXplOiAyNTYsXHJcbiAgICAgIGVudmlyb25tZW50OiB7XHJcbiAgICAgICAgSk9CX0FQUExJQ0FUSU9OU19UQUJMRTogam9iQXBwbGljYXRpb25zVGFibGUudGFibGVOYW1lXHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIExhbWJkYSBmdW5jdGlvbiBmb3IgZ2V0dGluZyBjb250cmFjdG9yIGFwcGxpY2F0aW9uc1xyXG4gICAgY29uc3QgZ2V0Q29udHJhY3RvckFwcGxpY2F0aW9uc0xhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0dldENvbnRyYWN0b3JBcHBsaWNhdGlvbnNGdW5jdGlvbicsIHtcclxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXHJcbiAgICAgIGhhbmRsZXI6ICdnZXQtY29udHJhY3Rvci1hcHBsaWNhdGlvbnMuaGFuZGxlcicsXHJcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi4vbGFtYmRhL2pvYi1hcHBsaWNhdGlvbnMnKSxcclxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzApLFxyXG4gICAgICBtZW1vcnlTaXplOiAyNTYsXHJcbiAgICAgIGVudmlyb25tZW50OiB7XHJcbiAgICAgICAgSk9CX0FQUExJQ0FUSU9OU19UQUJMRTogam9iQXBwbGljYXRpb25zVGFibGUudGFibGVOYW1lXHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIExhbWJkYSBmdW5jdGlvbiBmb3IgdXBkYXRpbmcgYXBwbGljYXRpb24gc3RhdHVzXHJcbiAgICBjb25zdCB1cGRhdGVBcHBsaWNhdGlvblN0YXR1c0xhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1VwZGF0ZUFwcGxpY2F0aW9uU3RhdHVzRnVuY3Rpb24nLCB7XHJcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxyXG4gICAgICBoYW5kbGVyOiAndXBkYXRlLWFwcGxpY2F0aW9uLXN0YXR1cy5oYW5kbGVyJyxcclxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvam9iLWFwcGxpY2F0aW9ucycpLFxyXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMCksXHJcbiAgICAgIG1lbW9yeVNpemU6IDI1NixcclxuICAgICAgZW52aXJvbm1lbnQ6IHtcclxuICAgICAgICBKT0JfQVBQTElDQVRJT05TX1RBQkxFOiBqb2JBcHBsaWNhdGlvbnNUYWJsZS50YWJsZU5hbWVcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gR3JhbnQgRHluYW1vREIgcGVybWlzc2lvbnMgdG8gTGFtYmRhIGZ1bmN0aW9uc1xyXG4gICAgam9iQXBwbGljYXRpb25zVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKHN1Ym1pdEFwcGxpY2F0aW9uTGFtYmRhKTtcclxuICAgIGpvYkFwcGxpY2F0aW9uc1RhYmxlLmdyYW50UmVhZERhdGEoZ2V0VXNlckFwcGxpY2F0aW9uc0xhbWJkYSk7XHJcbiAgICBqb2JBcHBsaWNhdGlvbnNUYWJsZS5ncmFudFJlYWREYXRhKGdldENvbnRyYWN0b3JBcHBsaWNhdGlvbnNMYW1iZGEpO1xyXG4gICAgam9iQXBwbGljYXRpb25zVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKHVwZGF0ZUFwcGxpY2F0aW9uU3RhdHVzTGFtYmRhKTtcclxuXHJcbiAgICAvLyBBUEkgR2F0ZXdheVxyXG4gICAgY29uc3QgYXBpID0gbmV3IGFwaWdhdGV3YXkuUmVzdEFwaSh0aGlzLCAnSm9iQXBwbGljYXRpb25zQXBpJywge1xyXG4gICAgICByZXN0QXBpTmFtZTogJ1NocmFtIFNldHUgSm9iIEFwcGxpY2F0aW9ucyBBUEknLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ0FQSSBmb3IgbWFuYWdpbmcgam9iIGFwcGxpY2F0aW9ucycsXHJcbiAgICAgIGRlZmF1bHRDb3JzUHJlZmxpZ2h0T3B0aW9uczoge1xyXG4gICAgICAgIGFsbG93T3JpZ2luczogYXBpZ2F0ZXdheS5Db3JzLkFMTF9PUklHSU5TLFxyXG4gICAgICAgIGFsbG93TWV0aG9kczogYXBpZ2F0ZXdheS5Db3JzLkFMTF9NRVRIT0RTLFxyXG4gICAgICAgIGFsbG93SGVhZGVyczogWydDb250ZW50LVR5cGUnLCAnQWNjZXB0JywgJ0F1dGhvcml6YXRpb24nXVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBBUEkgUmVzb3VyY2VzXHJcbiAgICBjb25zdCBhcHBsaWNhdGlvbnNSZXNvdXJjZSA9IGFwaS5yb290LmFkZFJlc291cmNlKCdhcHBsaWNhdGlvbnMnKTtcclxuICAgIFxyXG4gICAgLy8gUE9TVCAvYXBwbGljYXRpb25zL3N1Ym1pdFxyXG4gICAgY29uc3Qgc3VibWl0UmVzb3VyY2UgPSBhcHBsaWNhdGlvbnNSZXNvdXJjZS5hZGRSZXNvdXJjZSgnc3VibWl0Jyk7XHJcbiAgICBzdWJtaXRSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihzdWJtaXRBcHBsaWNhdGlvbkxhbWJkYSkpO1xyXG4gICAgXHJcbiAgICAvLyBHRVQgL2FwcGxpY2F0aW9ucy91c2VyL3t1c2VySWR9XHJcbiAgICBjb25zdCB1c2VyUmVzb3VyY2UgPSBhcHBsaWNhdGlvbnNSZXNvdXJjZS5hZGRSZXNvdXJjZSgndXNlcicpO1xyXG4gICAgY29uc3QgdXNlcklkUmVzb3VyY2UgPSB1c2VyUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ3t1c2VySWR9Jyk7XHJcbiAgICB1c2VySWRSZXNvdXJjZS5hZGRNZXRob2QoJ0dFVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGdldFVzZXJBcHBsaWNhdGlvbnNMYW1iZGEpKTtcclxuICAgIFxyXG4gICAgLy8gR0VUIC9hcHBsaWNhdGlvbnMvY29udHJhY3Rvci97Y29udHJhY3RvcklkfVxyXG4gICAgY29uc3QgY29udHJhY3RvclJlc291cmNlID0gYXBwbGljYXRpb25zUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ2NvbnRyYWN0b3InKTtcclxuICAgIGNvbnN0IGNvbnRyYWN0b3JJZFJlc291cmNlID0gY29udHJhY3RvclJlc291cmNlLmFkZFJlc291cmNlKCd7Y29udHJhY3RvcklkfScpO1xyXG4gICAgY29udHJhY3RvcklkUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihnZXRDb250cmFjdG9yQXBwbGljYXRpb25zTGFtYmRhKSk7XHJcbiAgICBcclxuICAgIC8vIFBVVCAvYXBwbGljYXRpb25zL3thcHBsaWNhdGlvbklkfS9zdGF0dXNcclxuICAgIGNvbnN0IGFwcGxpY2F0aW9uSWRSZXNvdXJjZSA9IGFwcGxpY2F0aW9uc1Jlc291cmNlLmFkZFJlc291cmNlKCd7YXBwbGljYXRpb25JZH0nKTtcclxuICAgIGNvbnN0IHN0YXR1c1Jlc291cmNlID0gYXBwbGljYXRpb25JZFJlc291cmNlLmFkZFJlc291cmNlKCdzdGF0dXMnKTtcclxuICAgIHN0YXR1c1Jlc291cmNlLmFkZE1ldGhvZCgnUFVUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXBkYXRlQXBwbGljYXRpb25TdGF0dXNMYW1iZGEpKTtcclxuXHJcbiAgICAvLyBPdXRwdXQgdGhlIEFQSSBVUkxcclxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdKb2JBcHBsaWNhdGlvbnNBcGlVcmwnLCB7XHJcbiAgICAgIHZhbHVlOiBhcGkudXJsLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ0pvYiBBcHBsaWNhdGlvbnMgQVBJIEdhdGV3YXkgVVJMJ1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gT3V0cHV0IHRoZSBEeW5hbW9EQiB0YWJsZSBuYW1lXHJcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnSm9iQXBwbGljYXRpb25zVGFibGVOYW1lJywge1xyXG4gICAgICB2YWx1ZTogam9iQXBwbGljYXRpb25zVGFibGUudGFibGVOYW1lLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ0pvYiBBcHBsaWNhdGlvbnMgRHluYW1vREIgVGFibGUgTmFtZSdcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuLy8gQ3JlYXRlIHRoZSBDREsgYXBwXHJcbmNvbnN0IGFwcCA9IG5ldyBjZGsuQXBwKCk7XHJcbm5ldyBKb2JBcHBsaWNhdGlvbnNTdGFjayhhcHAsICdTaHJhbVNldHVKb2JBcHBsaWNhdGlvbnNTdGFjaycsIHtcclxuICBlbnY6IHtcclxuICAgIGFjY291bnQ6IHByb2Nlc3MuZW52LkNES19ERUZBVUxUX0FDQ09VTlQsXHJcbiAgICByZWdpb246IHByb2Nlc3MuZW52LkNES19ERUZBVUxUX1JFR0lPTiB8fCAnYXAtc291dGgtMSdcclxuICB9XHJcbn0pOyJdfQ==