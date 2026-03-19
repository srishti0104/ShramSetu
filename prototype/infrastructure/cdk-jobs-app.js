#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
var cdk = require("aws-cdk-lib");
var jobs_lambda_stack_1 = require("./lib/jobs-lambda-stack");
var app = new cdk.App();
new jobs_lambda_stack_1.JobsLambdaStack(app, 'ShramSetuJobsStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION || 'ap-south-1',
    },
    description: 'Shram-Setu Jobs Management Stack with DynamoDB and Lambda',
});
app.synth();
