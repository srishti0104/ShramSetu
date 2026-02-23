import * as cdk from 'aws-cdk-lib';
import { BedrockLambdaStack } from './lib/bedrock-lambda-stack';

const app = new cdk.App();
new BedrockLambdaStack(app, 'ShramSetuBedrockStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'ap-south-1'
  }
});