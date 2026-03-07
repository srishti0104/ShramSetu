#!/bin/bash

# ============================================
# Deploy Jobs Lambda Stack to AWS
# ============================================

echo "🚀 Deploying Shram-Setu Jobs Stack..."
echo ""

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI is not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✅ AWS CLI configured"
echo "📦 Account: $(aws sts get-caller-identity --query Account --output text)"
echo "🌍 Region: ${AWS_REGION:-ap-south-1}"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
cd "$(dirname "$0")"
npm install

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Bootstrap CDK (if not already done)
echo "🏗️  Bootstrapping CDK..."
npx cdk bootstrap

# Deploy the stack
echo "🚀 Deploying Jobs Stack..."
npx cdk deploy ShramSetuJobsStack --app "node cdk-jobs-app.js" --require-approval never

# Check if deployment was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Copy the API Gateway URL from the output above"
    echo "2. Update .env.production with: VITE_JOBS_API_URL=<your-api-url>"
    echo "3. Rebuild your frontend: npm run build"
    echo ""
else
    echo ""
    echo "❌ Deployment failed!"
    exit 1
fi
