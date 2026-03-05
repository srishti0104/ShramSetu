#!/bin/bash

# Deploy Ratings System to AWS
# This script deploys the complete ratings infrastructure

set -e

echo "🚀 Starting Shram Setu Ratings System Deployment"
echo "================================================"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

# Get AWS account and region
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REGION=${AWS_DEFAULT_REGION:-ap-south-1}

echo "📋 Deployment Configuration:"
echo "   Account: $ACCOUNT"
echo "   Region: $REGION"
echo ""

# Install dependencies for Lambda layer
echo "📦 Installing Lambda layer dependencies..."
cd lambda/layers/ratings-layer/nodejs
npm install --production
cd ../../../../

# Install CDK dependencies
echo "📦 Installing CDK dependencies..."
npm install

# Bootstrap CDK (if not already done)
echo "🔧 Bootstrapping CDK..."
npx cdk bootstrap aws://$ACCOUNT/$REGION

# Deploy the stack
echo "🚀 Deploying Ratings Stack..."
npx cdk deploy ShramSetuRatingsStack \
    --require-approval never \
    --app "npx ts-node cdk-ratings-app.ts" \
    --outputs-file ratings-outputs.json

# Check if deployment was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment Successful!"
    echo "========================"
    
    # Extract API Gateway URL from outputs
    if [ -f "ratings-outputs.json" ]; then
        API_URL=$(cat ratings-outputs.json | jq -r '.ShramSetuRatingsStack.RatingsApiUrl // empty')
        TABLE_NAME=$(cat ratings-outputs.json | jq -r '.ShramSetuRatingsStack.RatingsTableName // empty')
        
        if [ ! -z "$API_URL" ]; then
            echo "🌐 API Gateway URL: $API_URL"
            echo ""
            echo "📝 Update your .env file with:"
            echo "VITE_RATINGS_API_URL=$API_URL"
            echo ""
            
            # Update .env file automatically
            if [ -f "../.env" ]; then
                echo "🔧 Updating .env file..."
                sed -i.bak "s|VITE_RATINGS_API_URL=.*|VITE_RATINGS_API_URL=$API_URL|g" ../.env
                echo "✅ .env file updated!"
            fi
        fi
        
        if [ ! -z "$TABLE_NAME" ]; then
            echo "🗄️  DynamoDB Table: $TABLE_NAME"
        fi
    fi
    
    echo ""
    echo "🎉 Ratings System is now live in production!"
    echo "   You can now submit ratings and they will be stored in DynamoDB"
    echo "   The API is available at: $API_URL"
    echo ""
    echo "🧪 Test the deployment:"
    echo "   curl -X GET $API_URL/ratings/profile/test-user"
    
else
    echo "❌ Deployment failed!"
    exit 1
fi