"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsLambdaStack = void 0;
var cdk = require("aws-cdk-lib");
var dynamodb = require("aws-cdk-lib/aws-dynamodb");
var lambda = require("aws-cdk-lib/aws-lambda");
var apigateway = require("aws-cdk-lib/aws-apigateway");
var path = require("path");
var JobsLambdaStack = /** @class */ (function (_super) {
    __extends(JobsLambdaStack, _super);
    function JobsLambdaStack(scope, id, props) {
        var _this = _super.call(this, scope, id, props) || this;
        // ============================================
        // DynamoDB Table for Jobs (Use existing table)
        // ============================================
        var jobsTable = dynamodb.Table.fromTableName(_this, 'JobsTable', 'Shram-setu-jobs');
        // ============================================
        // Lambda Function: Create Job
        // ============================================
        var createJobFunction = new lambda.Function(_this, 'CreateJobFunction', {
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
        var getJobFunction = new lambda.Function(_this, 'GetJobFunction', {
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
        var searchJobsFunction = new lambda.Function(_this, 'SearchJobsFunction', {
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
        var api = new apigateway.RestApi(_this, 'JobsApi', {
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
        var jobsResource = api.root.addResource('jobs');
        // POST /jobs - Create job
        jobsResource.addMethod('POST', new apigateway.LambdaIntegration(createJobFunction, {
            proxy: true,
        }));
        // GET /jobs - Search jobs (with query parameters)
        jobsResource.addMethod('GET', new apigateway.LambdaIntegration(searchJobsFunction, {
            proxy: true,
        }));
        // /jobs/{jobId} resource
        var jobIdResource = jobsResource.addResource('{jobId}');
        // GET /jobs/{jobId} - Get specific job
        jobIdResource.addMethod('GET', new apigateway.LambdaIntegration(getJobFunction, {
            proxy: true,
        }));
        // ============================================
        // CloudWatch Alarms
        // ============================================
        // Alarm for CreateJob function errors
        var createJobErrorAlarm = createJobFunction.metricErrors({
            period: cdk.Duration.minutes(5),
        }).createAlarm(_this, 'CreateJobErrorAlarm', {
            threshold: 5,
            evaluationPeriods: 1,
            alarmDescription: 'Alert when CreateJob function has errors',
            alarmName: 'ShramSetu-CreateJob-Errors',
        });
        // Alarm for DynamoDB throttling
        var tableThrottleAlarm = jobsTable.metricUserErrors({
            period: cdk.Duration.minutes(5),
        }).createAlarm(_this, 'JobsTableThrottleAlarm', {
            threshold: 10,
            evaluationPeriods: 1,
            alarmDescription: 'Alert when Jobs table is being throttled',
            alarmName: 'ShramSetu-JobsTable-Throttle',
        });
        // ============================================
        // Outputs
        // ============================================
        new cdk.CfnOutput(_this, 'JobsTableName', {
            value: jobsTable.tableName,
            description: 'DynamoDB Jobs Table Name',
            exportName: 'ShramSetuJobsTableName',
        });
        new cdk.CfnOutput(_this, 'JobsApiUrl', {
            value: api.url,
            description: 'Jobs API Gateway URL',
            exportName: 'ShramSetuJobsApiUrl',
        });
        new cdk.CfnOutput(_this, 'CreateJobFunctionArn', {
            value: createJobFunction.functionArn,
            description: 'Create Job Lambda Function ARN',
        });
        new cdk.CfnOutput(_this, 'JobsTableArn', {
            value: jobsTable.tableArn,
            description: 'Jobs Table ARN',
        });
        return _this;
    }
    return JobsLambdaStack;
}(cdk.Stack));
exports.JobsLambdaStack = JobsLambdaStack;
