@echo off
echo ========================================
echo Deploying Shram Setu Job Applications Infrastructure
echo ========================================

echo.
echo Compiling TypeScript...
call npx tsc cdk-job-applications-app.ts --target es2020 --module commonjs --lib es2020 --outDir ./dist

if %errorlevel% neq 0 (
    echo ❌ TypeScript compilation failed
    pause
    exit /b 1
)

echo.
echo Bootstrapping CDK (if needed)...
call npx cdk bootstrap --app "node ./dist/cdk-job-applications-app.js"

echo.
echo Deploying Job Applications Stack...
call npx cdk deploy ShramSetuJobApplicationsStack --app "node ./dist/cdk-job-applications-app.js" --require-approval never

if %errorlevel% neq 0 (
    echo ❌ Deployment failed
    pause
    exit /b 1
)

echo.
echo ✅ Job Applications infrastructure deployed successfully!
echo.
echo 📋 Next steps:
echo 1. Copy the API Gateway URL from the output above
echo 2. Update VITE_JOB_APPLICATIONS_API_URL in your .env file
echo 3. Test job applications in your app
echo.
pause