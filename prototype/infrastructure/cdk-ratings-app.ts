#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { RatingsLambdaStack } from './lib/ratings-lambda-stack';

const app = new cdk.App();

// Get environment configuration
const account = process.env.CDK_DEFAULT_ACCOUNT || '808840719701';
const region = process.env.CDK_DEFAULT_REGION || 'ap-south-1';

const env = {
  account,
  region,
};

// Deploy Ratings Stack
new RatingsLambdaStack(app, 'ShramSetuRatingsStack', {
  env,
  description: 'Shram Setu Ratings System with DynamoDB and API Gateway',
  tags: {
    Project: 'ShramSetu',
    Component: 'Ratings',
    Environment: 'Production',
  },
});

app.synth();