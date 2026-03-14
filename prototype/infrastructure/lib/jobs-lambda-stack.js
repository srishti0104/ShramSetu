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
exports.JobsLambdaStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const dynamodb = __importStar(require("aws-cdk-lib/aws-dynamodb"));
const lambda = __importStar(require("aws-cdk-lib/aws-lambda"));
const apigateway = __importStar(require("aws-cdk-lib/aws-apigateway"));
const path = __importStar(require("path"));
class JobsLambdaStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // ============================================
        // DynamoDB Table for Jobs (Use existing table)
        // ============================================
        const jobsTable = dynamodb.Table.fromTableName(this, 'JobsTable', 'Shram-setu-jobs');
        // ============================================
        // Lambda Function: Create Job
        // ============================================
        const createJobFunction = new lambda.Function(this, 'CreateJobFunction', {
            functionName: 'ShramSetu-CreateJob',
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'create-job.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/jobs')),
            environment: {
                JOBS_TABLE: jobsTable.tableName,
            },
            timeout: cdk.Duration.seconds(30),
            memorySize: 256,
        });
        // Grant Lambda permissions to write to DynamoDB
        jobsTable.grantReadWriteData(createJobFunction);
        // ============================================
        // Lambda Function: Get Job
        // ============================================
        const getJobFunction = new lambda.Function(this, 'GetJobFunction', {
            functionName: 'ShramSetu-GetJob',
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'get-job.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/jobs')),
            environment: {
                JOBS_TABLE: jobsTable.tableName,
            },
            timeout: cdk.Duration.seconds(10),
            memorySize: 128,
        });
        jobsTable.grantReadData(getJobFunction);
        // ============================================
        // Lambda Function: Search Jobs
        // ============================================
        const searchJobsFunction = new lambda.Function(this, 'SearchJobsFunction', {
            functionName: 'ShramSetu-SearchJobs',
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'search.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/jobs')),
            environment: {
                JOBS_TABLE: jobsTable.tableName,
            },
            timeout: cdk.Duration.seconds(30),
            memorySize: 256,
        });
        jobsTable.grantReadData(searchJobsFunction);
        // ============================================
        // API Gateway
        // ============================================
        const api = new apigateway.RestApi(this, 'JobsApi', {
            restApiName: 'ShramSetu Jobs API',
            description: 'API for job management in Shram-Setu',
            defaultCorsPreflightOptions: {
                allowOrigins: apigateway.Cors.ALL_ORIGINS,
                allowMethods: apigateway.Cors.ALL_METHODS,
                allowHeaders: [
                    'Content-Type',
                    'X-Amz-Date',
                    'Authorization',
                    'X-Api-Key',
                    'X-Amz-Security-Token',
                ],
            },
            deployOptions: {
                stageName: 'prod',
                throttlingRateLimit: 1000,
                throttlingBurstLimit: 2000,
                metricsEnabled: true,
                loggingLevel: apigateway.MethodLoggingLevel.INFO,
            },
        });
        // /jobs resource
        const jobsResource = api.root.addResource('jobs');
        // POST /jobs - Create job
        jobsResource.addMethod('POST', new apigateway.LambdaIntegration(createJobFunction, {
            proxy: true,
        }));
        // GET /jobs - Search jobs (with query parameters)
        jobsResource.addMethod('GET', new apigateway.LambdaIntegration(searchJobsFunction, {
            proxy: true,
        }));
        // /jobs/{jobId} resource
        const jobIdResource = jobsResource.addResource('{jobId}');
        // GET /jobs/{jobId} - Get specific job
        jobIdResource.addMethod('GET', new apigateway.LambdaIntegration(getJobFunction, {
            proxy: true,
        }));
        // ============================================
        // CloudWatch Alarms
        // ============================================
        // Alarm for CreateJob function errors
        const createJobErrorAlarm = createJobFunction.metricErrors({
            period: cdk.Duration.minutes(5),
        }).createAlarm(this, 'CreateJobErrorAlarm', {
            threshold: 5,
            evaluationPeriods: 1,
            alarmDescription: 'Alert when CreateJob function has errors',
            alarmName: 'ShramSetu-CreateJob-Errors',
        });
        // Alarm for DynamoDB throttling
        const tableThrottleAlarm = jobsTable.metricUserErrors({
            period: cdk.Duration.minutes(5),
        }).createAlarm(this, 'JobsTableThrottleAlarm', {
            threshold: 10,
            evaluationPeriods: 1,
            alarmDescription: 'Alert when Jobs table is being throttled',
            alarmName: 'ShramSetu-JobsTable-Throttle',
        });
        // ============================================
        // Outputs
        // ============================================
        new cdk.CfnOutput(this, 'JobsTableName', {
            value: jobsTable.tableName,
            description: 'DynamoDB Jobs Table Name',
            exportName: 'ShramSetuJobsTableName',
        });
        new cdk.CfnOutput(this, 'JobsApiUrl', {
            value: api.url,
            description: 'Jobs API Gateway URL',
            exportName: 'ShramSetuJobsApiUrl',
        });
        new cdk.CfnOutput(this, 'CreateJobFunctionArn', {
            value: createJobFunction.functionArn,
            description: 'Create Job Lambda Function ARN',
        });
        new cdk.CfnOutput(this, 'JobsTableArn', {
            value: jobsTable.tableArn,
            description: 'Jobs Table ARN',
        });
    }
}
exports.JobsLambdaStack = JobsLambdaStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam9icy1sYW1iZGEtc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJqb2JzLWxhbWJkYS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFDbkMsbUVBQXFEO0FBQ3JELCtEQUFpRDtBQUNqRCx1RUFBeUQ7QUFHekQsMkNBQTZCO0FBRTdCLE1BQWEsZUFBZ0IsU0FBUSxHQUFHLENBQUMsS0FBSztJQUM1QyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQzlELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLCtDQUErQztRQUMvQywrQ0FBK0M7UUFDL0MsK0NBQStDO1FBQy9DLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUM1QyxJQUFJLEVBQ0osV0FBVyxFQUNYLGlCQUFpQixDQUNsQixDQUFDO1FBRUYsK0NBQStDO1FBQy9DLDhCQUE4QjtRQUM5QiwrQ0FBK0M7UUFDL0MsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFO1lBQ3ZFLFlBQVksRUFBRSxxQkFBcUI7WUFDbkMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztZQUNuQyxPQUFPLEVBQUUsb0JBQW9CO1lBQzdCLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO1lBQ3RFLFdBQVcsRUFBRTtnQkFDWCxVQUFVLEVBQUUsU0FBUyxDQUFDLFNBQVM7YUFDaEM7WUFDRCxPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ2pDLFVBQVUsRUFBRSxHQUFHO1NBQ2hCLENBQUMs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LGVBQWUsRUFBRTtZQUN2QyxLQUFLLEVBQUUsU0FBUyxDQUFDLFNBQVM7WUFDMUIsV0FBVyxFQUFFLDBCQUEwQjtZQUN2QyxVQUFVLEVBQUUsd0JBQXdCO1NBQ3JDLENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQ3BDLEtBQUssRUFBRSxHQUFHLENBQUMsR0FBRztZQUNkLFdBQVcsRUFBRSxzQkFBc0I7WUFDbkMsVUFBVSxFQUFFLHFCQUFxQjtTQUNsQyxDQUFDLENBQUM7UUFFSCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLHNCQUFzQixFQUFFO1lBQzlDLEtBQUssRUFBRSxpQkFBaUIsQ0FBQyxXQUFXO1lBQ3BDLFdBQVcsRUFBRSxnQ0FBZ0M7U0FDOUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7WUFDdEMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxRQUFRO1lBQ3pCLFdBQVcsRUFBRSxnQkFBZ0I7U0FDOUIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBMUtELDBDQTBLQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XHJcbmltcG9ydCAqIGFzIGR5bmFtb2RiIGZyb20gJ2F3cy1jZGstbGliL2F3cy1keW5hbW9kYic7XHJcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcclxuaW1wb3J0ICogYXMgYXBpZ2F0ZXdheSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheSc7XHJcbmltcG9ydCAqIGFzIGlhbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcclxuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XHJcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XHJcblxyXG5leHBvcnQgY2xhc3MgSm9ic0xhbWJkYVN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcclxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XHJcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcclxuXHJcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gICAgLy8gRHluYW1vREIgVGFibGUgZm9yIEpvYnMgKFVzZSBleGlzdGluZyB0YWJsZSlcclxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgICBjb25zdCBqb2JzVGFibGUgPSBkeW5hbW9kYi5UYWJsZS5mcm9tVGFibGVOYW1lKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICAnSm9ic1RhYmxlJyxcclxuICAgICAgJ1NocmFtLXNldHUtam9icydcclxuICAgICk7XHJcblxyXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAgIC8vIExhbWJkYSBGdW5jdGlvbjogQ3JlYXRlIEpvYlxyXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAgIGNvbnN0IGNyZWF0ZUpvYkZ1bmN0aW9uID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnQ3JlYXRlSm9iRnVuY3Rpb24nLCB7XHJcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ1NocmFtU2V0dS1DcmVhdGVKb2InLFxyXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMjBfWCxcclxuICAgICAgaGFuZGxlcjogJ2NyZWF0ZS1qb2IuaGFuZGxlcicsXHJcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vLi4vbGFtYmRhL2pvYnMnKSksXHJcbiAgICAgIGVudmlyb25tZW50OiB7XHJcbiAgICAgICAgSk9CU19UQUJMRTogam9ic1RhYmxlLnRhYmxlTmFtZSxcclxuICAgICAgfSxcclxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzApLFxyXG4gICAgICBtZW1vcnlTaXplOiAyNTYsXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBHcmFudCBMYW1iZGEgcGVybWlzc2lvbnMgdG8gd3JpdGUgdG8gRHluYW1vREJcclxuICAgIGpvYnNUYWJsZS5ncmFudFJlYWRXcml0ZURhdGEoY3JlYXRlSm9iRnVuY3Rpb24pO1xyXG5cclxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgICAvLyBMYW1iZGEgRnVuY3Rpb246IEdldCBKb2JcclxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgICBjb25zdCBnZXRKb2JGdW5jdGlvbiA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0dldEpvYkZ1bmN0aW9uJywge1xyXG4gICAgICBmdW5jdGlvbk5hbWU6ICdTaHJhbVNldHUtR2V0Sm9iJyxcclxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzIwX1gsXHJcbiAgICAgIGhhbmRsZXI6ICdnZXQtam9iLmhhbmRsZXInLFxyXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQocGF0aC5qb2luKF9fZGlybmFtZSwgJy4uLy4uL2xhbWJkYS9qb2JzJykpLFxyXG4gICAgICBlbnZpcm9ubWVudDoge1xyXG4gICAgICAgIEpPQlNfVEFCTEU6IGpvYnNUYWJsZS50YWJsZU5hbWUsXHJcbiAgICAgIH0sXHJcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDEwKSxcclxuICAgICAgbWVtb3J5U2l6ZTogMTI4LFxyXG4gICAgfSk7XHJcblxyXG4gICAgam9ic1RhYmxlLmdyYW50UmVhZERhdGEoZ2V0Sm9iRnVuY3Rpb24pO1xyXG5cclxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgICAvLyBMYW1iZGEgRnVuY3Rpb246IFNlYXJjaCBKb2JzXHJcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gICAgY29uc3Qgc2VhcmNoSm9ic0Z1bmN0aW9uID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnU2VhcmNoSm9ic0Z1bmN0aW9uJywge1xyXG4gICAgICBmdW5jdGlvbk5hbWU6ICdTaHJhbVNldHUtU2VhcmNoSm9icycsXHJcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18yMF9YLFxyXG4gICAgICBoYW5kbGVyOiAnc2VhcmNoLmhhbmRsZXInLFxyXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQocGF0aC5qb2luKF9fZGlybmFtZSwgJy4uLy4uL2xhbWJkYS9qb2JzJykpLFxyXG4gICAgICBlbnZpcm9ubWVudDoge1xyXG4gICAgICAgIEpPQlNfVEFCTEU6IGpvYnNUYWJsZS50YWJsZU5hbWUsXHJcbiAgICAgIH0sXHJcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMwKSxcclxuICAgICAgbWVtb3J5U2l6ZTogMjU2LFxyXG4gICAgfSk7XHJcblxyXG4gICAgam9ic1RhYmxlLmdyYW50UmVhZERhdGEoc2VhcmNoSm9ic0Z1bmN0aW9uKTtcclxuXHJcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gICAgLy8gQVBJIEdhdGV3YXlcclxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgICBjb25zdCBhcGkgPSBuZXcgYXBpZ2F0ZXdheS5SZXN0QXBpKHRoaXMsICdKb2JzQXBpJywge1xyXG4gICAgICByZXN0QXBpTmFtZTogJ1NocmFtU2V0dSBKb2JzIEFQSScsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiAnQVBJIGZvciBqb2IgbWFuYWdlbWVudCBpbiBTaHJhbS1TZXR1JyxcclxuICAgICAgZGVmYXVsdENvcnNQcmVmbGlnaHRPcHRpb25zOiB7XHJcbiAgICAgICAgYWxsb3dPcmlnaW5zOiBhcGlnYXRld2F5LkNvcnMuQUxMX09SSUdJTlMsXHJcbiAgICAgICAgYWxsb3dNZXRob2RzOiBhcGlnYXRld2F5LkNvcnMuQUxMX01FVEhPRFMsXHJcbiAgICAgICAgYWxsb3dIZWFkZXJzOiBbXHJcbiAgICAgICAgICAnQ29udGVudC1UeXBlJyxcclxuICAgICAgICAgICdYLUFtei1EYXRlJyxcclxuICAgICAgICAgICdBdXRob3JpemF0aW9uJyxcclxuICAgICAgICAgICdYLUFwaS1LZXknLFxyXG4gICAgICAgICAgJ1gtQW16LVNlY3VyaXR5LVRva2VuJyxcclxuICAgICAgICBdLFxyXG4gICAgICB9LFxyXG4gICAgICBkZXBsb3lPcHRpb25zOiB7XHJcbiAgICAgICAgc3RhZ2VOYW1lOiAncHJvZCcsXHJcbiAgICAgICAgdGhyb3R0bGluZ1JhdGVMaW1pdDogMTAwMCxcclxuICAgICAgICB0aHJvdHRsaW5nQnVyc3RMaW1pdDogMjAwMCxcclxuICAgICAgICBtZXRyaWNzRW5hYmxlZDogdHJ1ZSxcclxuICAgICAgICBsb2dnaW5nTGV2ZWw6IGFwaWdhdGV3YXkuTWV0aG9kTG9nZ2luZ0xldmVsLklORk8sXHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyAvam9icyByZXNvdXJjZVxyXG4gICAgY29uc3Qgam9ic1Jlc291cmNlID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ2pvYnMnKTtcclxuXHJcbiAgICAvLyBQT1NUIC9qb2JzIC0gQ3JlYXRlIGpvYlxyXG4gICAgam9ic1Jlc291cmNlLmFkZE1ldGhvZChcclxuICAgICAgJ1BPU1QnLFxyXG4gICAgICBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihjcmVhdGVKb2JGdW5jdGlvbiwge1xyXG4gICAgICAgIHByb3h5OiB0cnVlLFxyXG4gICAgICB9KVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBHRVQgL2pvYnMgLSBTZWFyY2ggam9icyAod2l0aCBxdWVyeSBwYXJhbWV0ZXJzKVxyXG4gICAgam9ic1Jlc291cmNlLmFkZE1ldGhvZChcclxuICAgICAgJ0dFVCcsXHJcbiAgICAgIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHNlYXJjaEpvYnNGdW5jdGlvbiwge1xyXG4gICAgICAgIHByb3h5OiB0cnVlLFxyXG4gICAgICB9KVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyAvam9icy97am9iSWR9IHJlc291cmNlXHJcbiAgICBjb25zdCBqb2JJZFJlc291cmNlID0gam9ic1Jlc291cmNlLmFkZFJlc291cmNlKCd7am9iSWR9Jyk7XHJcblxyXG4gICAgLy8gR0VUIC9qb2JzL3tqb2JJZH0gLSBHZXQgc3BlY2lmaWMgam9iXHJcbiAgICBqb2JJZFJlc291cmNlLmFkZE1ldGhvZChcclxuICAgICAgJ0dFVCcsXHJcbiAgICAgIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGdldEpvYkZ1bmN0aW9uLCB7XHJcbiAgICAgICAgcHJveHk6IHRydWUsXHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG5cclxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgICAvLyBDbG91ZFdhdGNoIEFsYXJtc1xyXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAgIFxyXG4gICAgLy8gQWxhcm0gZm9yIENyZWF0ZUpvYiBmdW5jdGlvbiBlcnJvcnNcclxuICAgIGNvbnN0IGNyZWF0ZUpvYkVycm9yQWxhcm0gPSBjcmVhdGVKb2JGdW5jdGlvbi5tZXRyaWNFcnJvcnMoe1xyXG4gICAgICBwZXJpb2Q6IGNkay5EdXJhdGlvbi5taW51dGVzKDUpLFxyXG4gICAgfSkuY3JlYXRlQWxhcm0odGhpcywgJ0NyZWF0ZUpvYkVycm9yQWxhcm0nLCB7XHJcbiAgICAgIHRocmVzaG9sZDogNSxcclxuICAgICAgZXZhbHVhdGlvblBlcmlvZHM6IDEsXHJcbiAgICAgIGFsYXJtRGVzY3JpcHRpb246ICdBbGVydCB3aGVuIENyZWF0ZUpvYiBmdW5jdGlvbiBoYXMgZXJyb3JzJyxcclxuICAgICAgYWxhcm1OYW1lOiAnU2hyYW1TZXR1LUNyZWF0ZUpvYi1FcnJvcnMnLFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gQWxhcm0gZm9yIER5bmFtb0RCIHRocm90dGxpbmdcclxuICAgIGNvbnN0IHRhYmxlVGhyb3R0bGVBbGFybSA9IGpvYnNUYWJsZS5tZXRyaWNVc2VyRXJyb3JzKHtcclxuICAgICAgcGVyaW9kOiBjZGsuRHVyYXRpb24ubWludXRlcyg1KSxcclxuICAgIH0pLmNyZWF0ZUFsYXJtKHRoaXMsICdKb2JzVGFibGVUaHJvdHRsZUFsYXJtJywge1xyXG4gICAgICB0aHJlc2hvbGQ6IDEwLFxyXG4gICAgICBldmFsdWF0aW9uUGVyaW9kczogMSxcclxuICAgICAgYWxhcm1EZXNjcmlwdGlvbjogJ0FsZXJ0IHdoZW4gSm9icyB0YWJsZSBpcyBiZWluZyB0aHJvdHRsZWQnLFxyXG4gICAgICBhbGFybU5hbWU6ICdTaHJhbVNldHUtSm9ic1RhYmxlLVRocm90dGxlJyxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgICAvLyBPdXRwdXRzXHJcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0pvYnNUYWJsZU5hbWUnLCB7XHJcbiAgICAgIHZhbHVlOiBqb2JzVGFibGUudGFibGVOYW1lLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ0R5bmFtb0RCIEpvYnMgVGFibGUgTmFtZScsXHJcbiAgICAgIGV4cG9ydE5hbWU6ICdTaHJhbVNldHVKb2JzVGFibGVOYW1lJyxcclxuICAgIH0pO1xyXG5cclxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdKb2JzQXBpVXJsJywge1xyXG4gICAgICB2YWx1ZTogYXBpLnVybCxcclxuICAgICAgZGVzY3JpcHRpb246ICdKb2JzIEFQSSBHYXRld2F5IFVSTCcsXHJcbiAgICAgIGV4cG9ydE5hbWU6ICdTaHJhbVNldHVKb2JzQXBpVXJsJyxcclxuICAgIH0pO1xyXG5cclxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdDcmVhdGVKb2JGdW5jdGlvbkFybicsIHtcclxuICAgICAgdmFsdWU6IGNyZWF0ZUpvYkZ1bmN0aW9uLmZ1bmN0aW9uQXJuLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ0NyZWF0ZSBKb2IgTGFtYmRhIEZ1bmN0aW9uIEFSTicsXHJcbiAgICB9KTtcclxuXHJcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnSm9ic1RhYmxlQXJuJywge1xyXG4gICAgICB2YWx1ZTogam9ic1RhYmxlLnRhYmxlQXJuLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ0pvYnMgVGFibGUgQVJOJyxcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG4iXX0=