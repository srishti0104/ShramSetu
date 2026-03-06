@echo off
echo ============================================
echo Deploying Shram Setu Transcribe API
echo ============================================

echo.
echo 1. Installing dependencies...
cd /d "%~dp0"
call npm install

echo.
echo 2. Building TypeScript...
call npx tsc

echo.
echo 3. Deploying CDK stack...
call npx cdk deploy ShramSetuTranscribeStack --app "node cdk-transcribe-app.js" --require-approval never

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo ✅ Transcribe API deployed successfully!
    echo ============================================
    echo.
    echo The API URL will be shown above.
    echo Update your .env file with the new URL.
    echo.
) else (
    echo.
    echo ============================================
    echo ❌ Deployment failed!
    echo ============================================
    echo Please check the error messages above.
)

pause