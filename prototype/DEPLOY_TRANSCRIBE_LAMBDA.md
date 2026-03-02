# Deploy Transcribe Lambda Function

## Overview
This guide will help you deploy the Transcribe Lambda function to AWS.

## Prerequisites
- AWS CLI configured
- AWS account with appropriate permissions
- Node.js installed

## Step 1: Install Dependencies

```bash
cd lambda-transcribe
npm install
```

## Step 2: Create Deployment Package

```bash
# Create a zip file with the Lambda function and dependencies
zip -r transcribe-lambda.zip index.js node_modules/ package.json
```

On Windows PowerShell:
```powershell
Compress-Archive -Path index.js,node_modules,package.json -DestinationPath transcribe-lambda.zip -Force
```

## Step 3: Create IAM Role for Lambda

The Lambda function needs permissions to:
- Access S3 bucket
- Use Transcribe service
- Write CloudWatch logs

Create a role with these policies:
- `AmazonTranscribeFullAccess`
- `AmazonS3FullAccess` (or custom policy for your bucket)
- `AWSLambdaBasicExecutionRole`

## Step 4: Deploy Lambda Function

### Option A: Using AWS CLI

```bash
aws lambda create-function \
  --function-name shram-setu-transcribe \
  --runtime nodejs20.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/YOUR_LAMBDA_ROLE \
  --handler index.handler \
  --zip-file fileb://transcribe-lambda.zip \
  --timeout 120 \
  --memory-size 512 \
  --environment Variables="{S3_BUCKET_NAME=shram-setu-uploads-808840719701,AWS_REGION=ap-south-1}"
```

### Option B: Using AWS Console

1. Go to AWS Lambda Console
2. Click "Create function"
3. Choose "Author from scratch"
4. Function name: `shram-setu-transcribe`
5. Runtime: Node.js 20.x
6. Architecture: x86_64
7. Click "Create function"
8. Upload the `transcribe-lambda.zip` file
9. Set handler to `index.handler`
10. Set timeout to 120 seconds
11. Set memory to 512 MB
12. Add environment variables:
    - `S3_BUCKET_NAME`: `shram-setu-uploads-808840719701`
    - `AWS_REGION`: `ap-south-1`

## Step 5: Create API Gateway

1. Go to API Gateway Console
2. Create new REST API
3. Create resource: `/transcribe`
4. Create POST method
5. Integration type: Lambda Function
6. Select your Lambda function
7. Enable CORS
8. Deploy API to stage (e.g., "prod")
9. Note the Invoke URL

## Step 6: Update .env File

Update your `.env` file with the API Gateway URL:

```
VITE_TRANSCRIBE_API_URL=https://YOUR_API_ID.execute-api.ap-south-1.amazonaws.com/prod
```

## Step 7: Test the Deployment

```bash
cd ..
node test-transcribe-api.js
```

## Troubleshooting

### Lambda Timeout
If transcription takes too long, increase Lambda timeout:
```bash
aws lambda update-function-configuration \
  --function-name shram-setu-transcribe \
  --timeout 180
```

### Permission Errors
Ensure the Lambda execution role has:
- S3 read/write permissions
- Transcribe full access
- CloudWatch Logs write permissions

### CORS Errors
Enable CORS in API Gateway:
1. Select the POST method
2. Click "Enable CORS"
3. Add headers: `Content-Type`
4. Add methods: `POST, OPTIONS`
5. Deploy API

## Quick Deploy Script (PowerShell)

```powershell
# Navigate to lambda directory
cd lambda-transcribe

# Install dependencies
npm install

# Create deployment package
Compress-Archive -Path index.js,node_modules,package.json -DestinationPath transcribe-lambda.zip -Force

# Deploy (replace with your values)
aws lambda update-function-code `
  --function-name shram-setu-transcribe `
  --zip-file fileb://transcribe-lambda.zip

Write-Host "✅ Lambda function deployed successfully!"
```

## Monitoring

View Lambda logs:
```bash
aws logs tail /aws/lambda/shram-setu-transcribe --follow
```

Or check CloudWatch Logs in AWS Console.

## Cost Optimization

- Set appropriate timeout (don't use max if not needed)
- Use appropriate memory size (512MB is usually sufficient)
- Consider using Lambda reserved concurrency for cost control
- Monitor CloudWatch metrics for optimization opportunities
