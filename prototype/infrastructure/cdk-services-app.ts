#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { S3Stack } from './lib/s3-stack';
import { LocationStack } from './lib/location-stack';

const app = new cdk.App();

// Deploy S3 bucket for file storage
new S3Stack(app, 'ShramSetuS3Stack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'ap-south-1'
  },
  description: 'S3 bucket for Shram Setu file uploads (audio, images, documents)'
});

// Deploy Location Service for geospatial features
new LocationStack(app, 'ShramSetuLocationStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'ap-south-1'
  },
  description: 'Amazon Location Service for Shram Setu job search'
});

app.synth();
