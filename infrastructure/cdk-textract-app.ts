#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { TextractLambdaStack } from './lib/textract-lambda-stack';

const app = new cdk.App();

new TextractLambdaStack(app, 'ShramSetuTextractStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'ap-south-1'
  },
  description: 'Shram-Setu Textract OCR Lambda Stack'
});

app.synth();
