#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { GrievanceLambdaStack } from './lib/grievance-lambda-stack';

const app = new cdk.App();

new GrievanceLambdaStack(app, 'ShramSetuGrievanceStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'ap-south-1',
  },
  description: 'Shram Setu Voice-based Grievance System with DynamoDB and AWS Transcribe',
  tags: {
    Project: 'ShramSetu',
    Environment: 'Production',
    Component: 'Grievance',
  },
});