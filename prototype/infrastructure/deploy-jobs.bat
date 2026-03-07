@echo off
REM ============================================
REM Deploy Jobs Lambda Stack to AWS (Windows)
REM ============================================

echo 🚀 Deploying Shram-Setu Jobs Stack...
echo.

REM Check if AWS CLI is configured
aws sts get-caller-identity >nul 2>&1
if errorlevel 1 (
    echo ❌ AWS CLI is not configured. Please run 'aws configure' first.
    exit /b 1
)

echo ✅ AWS CLI configured
for /f "tokens=*" %%a in ('aws sts get-caller-identity --query Account --output text') do set ACCOUNT=%%a
echo 📦 Account: %ACCOUNT%
echo 🌍 Region: ap-south-1
echo.

REM Install dependencies
echo 📦 Installing dependencies...
cd /d "%~dp0"
call npm install

REM Build TypeScript
echo 🔨 Building TypeScript...
call npm run build

REM Bootstrap CDK (if not already done)
echo 🏗️  Bootstrapping CDK...
call npx cdk bootstrap

REM Deploy the stack
echo 🚀 Deploying Jobs Stack...
call npx cdk deploy ShramSetuJobsStack --app "node cdk-jobs-app.js" --require-approval never

if errorlevel 1 (
    echo.
    echo ❌ Deployment failed!
    exit /b 1
)

echo.
echo ✅ Deployment successful!
echo.
echo 📋 Next steps:
echo 1. Copy the API Gateway URL from the output above
echo 2. Update .env.production with: VITE_JOBS_API_URL=^<your-api-url^>
echo 3. Rebuild your frontend: npm run build
echo.

pause
