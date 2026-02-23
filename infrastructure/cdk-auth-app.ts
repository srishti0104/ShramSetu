#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AuthLambdaStack } from './lib/auth-lambda-stack';

const app = new cdk.App();

new AuthLambdaStack(app, 'ShramSetuAuthStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'ap-south-1'
  },
  description: 'Authentication services for Shram Setu application'
});

app.synth();
