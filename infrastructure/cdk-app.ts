#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ShramSetuStack } from './lib/Shram-setu-stack';

const app = new cdk.App();

new ShramSetuStack(app, 'ShramSetuStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'ap-south-1', // Mumbai region for India
  },
  description: 'Shram-Setu: Voice-first PWA for India\'s blue-collar workforce',
});

app.synth();


