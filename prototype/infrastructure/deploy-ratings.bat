@echo off
REM Deploy Ratings System to AWS (Windows version)
REM This script deploys the complete ratings infrastructure

echo 🚀 Starting Shram Setu Ratings System Deployment
echo ================================================

REM Check if AWS CLI is configured
aws sts get-caller-identity >nul 2>&1
if errorlevel 1 (
    echo ❌ AWS CLI not configured. Please run 'aws configure' first.
    exit /b 1
)

REM Get AWS account and region
for /f "tokens=*" %%i in ('aws sts get-caller-identity --query Account --output text') do set ACCOUNT=%%i
if "%AWS_DEFAULT_REGION%"=="" (
    set REGION=ap-south-1
) else (
    set REGION=%AWS_DEFAULT_REGION%
)

echo 📋 Deployment Configuration:
echo    Account: %ACCOUNT%
echo    Region: %REGION%
echo.

REM Install dependencies for Lambda layer
echo 📦 Installing Lambda layer dependencies...
cd lambda\layers\ratings-layer\nodejs
call npm install --production
cd ..\..\..\..\

REM Install CDK dependencies
echo 📦 Installing CDK dependencies...
call npm install

REM Bootstrap CDK (if not already done)
echo 🔧 Bootstrapping CDK...
call npx cdk bootstrap aws://%ACCOUNT%/%REGION%

REM Deploy the stack
echo 🚀 Deploying Ratings Stack...
call npx cdk deploy ShramSetuRatingsStack --require-approval never --app "npx ts-node cdk-ratings-app.ts" --outputs-file ratings-outputs.json

if errorlevel 1 (
    echo ❌ Deployment failed!
    exit /b 1
)

echo.
echo ✅ Deployment Successful!
echo ========================

REM Check if outputs file exists and extract API URL
if exist "ratings-outputs.json" (
    echo 📝 Deployment outputs saved to ratings-outputs.json
    echo 🌐 Check the file for your API Gateway URL
    echo.
    echo 📝 Update your .env file with the API Gateway URL from the outputs
)

echo.
echo 🎉 Ratings System is now live in production!
echo    You can now submit ratings and they will be stored in DynamoDB
echo.
echo 🧪 Test the deployment by checking the ratings-outputs.json file
echo    for your API Gateway URL and testing the endpoints

pause