#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { JobsLambdaStack } from './lib/jobs-lambda-stack';

const app = new cdk.App();

new JobsLambdaStack(app, 'ShramSetuJobsStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'ap-south-1',
  },
  description: 'Shram-Setu Jobs Management Stack with DynamoDB and Lambda',
});

app.synth();
