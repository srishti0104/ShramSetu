#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { SyncLambdaStack } from './lib/sync-lambda-stack';

const app = new cdk.App();

new SyncLambdaStack(app, 'ShramSetuSyncStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'ap-south-1'
  },
  description: 'Delta Sync services for Shram Setu application'
});

app.synth();
