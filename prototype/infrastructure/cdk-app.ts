#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { shramSetuStack } from './lib/shramik-setu-stack';

const app = new cdk.App();

new shramSetuStack(app, 'ShramSetuStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'ap-south-1', // Mumbai region for India
  },
  description: 'Shram-Setu: Voice-first PWA for India\'s blue-collar workforce',
});

app.synth();


