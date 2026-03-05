@echo off
REM Deploy Grievance System to AWS (Windows version)
REM This script deploys the complete voice-based grievance infrastructure

echo 🚀 Starting Shram Setu Grievance System Deployment
echo ===================================================

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

REM Install Lambda dependencies
echo 📦 Installing Lambda dependencies...
cd ..\lambda\grievance
call npm install --production
cd ..\..\infrastructure

REM Install CDK dependencies
echo 📦 Installing CDK dependencies...
call npm install

REM Bootstrap CDK (if not already done)
echo 🔧 Bootstrapping CDK...
call npx cdk bootstrap aws://%ACCOUNT%/%REGION%

REM Deploy the stack
echo 🚀 Deploying Grievance Stack...
call npm run deploy:grievance

if errorlevel 1 (
    echo ❌ Deployment failed!
    exit /b 1
)

echo.
echo ✅ Deployment Successful!
echo =========================

REM Check if outputs file exists and extract API URL
if exist "grievance-outputs.json" (
    echo 📝 Deployment outputs saved to grievance-outputs.json
    echo 🌐 Check the file for your API Gateway URL
    echo.
    echo 📝 Update your .env file with the API Gateway URL from the outputs
)

echo.
echo 🎉 Grievance System is now live in production!
echo    Workers can now submit voice-based grievances
echo    Data will be stored in DynamoDB for admin review
echo.
echo 🧪 Test the deployment by:
echo    1. Submitting a test grievance through the web app
echo    2. Checking DynamoDB table 'Shram-setu-grievances'
echo    3. Verifying audio files in S3 bucket

pause