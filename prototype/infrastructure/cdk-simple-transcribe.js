#!/usr/bin/env node
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
exports.SimpleTranscribeStack = void 0;
require("source-map-support/register");
var cdk = require("aws-cdk-lib");
var lambda = require("aws-cdk-lib/aws-lambda");
var apigateway = require("aws-cdk-lib/aws-apigateway");
var iam = require("aws-cdk-lib/aws-iam");
var SimpleTranscribeStack = /** @class */ (function (_super) {
    __extends(SimpleTranscribeStack, _super);
    function SimpleTranscribeStack(scope, id, props) {
        var _this = _super.call(this, scope, id, props) || this;
        // IAM Role for Lambda
        var lambdaRole = new iam.Role(_this, 'TranscribeLambdaRole', {
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
        var transcribeLambda = new lambda.Function(_this, 'TranscribeFunction', {
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
        var api = new apigateway.RestApi(_this, 'TranscribeApi', {
            restApiName: 'Simple Transcribe API',
            description: 'Simple transcribe API with CORS for localhost',
            defaultCorsPreflightOptions: {
                allowOrigins: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
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
        new cdk.CfnOutput(_this, 'TranscribeApiUrl', {
            value: api.url,
            description: 'Simple Transcribe API URL',
        });
        return _this;
    }
    return SimpleTranscribeStack;
}(cdk.Stack));
exports.SimpleTranscribeStack = SimpleTranscribeStack;
var app = new cdk.App();
new SimpleTranscribeStack(app, 'SimpleTranscribeStack', {
    env: {
        account: '808840719701',
        region: 'ap-south-1',
    },
});
