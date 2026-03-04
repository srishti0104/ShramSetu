# Step-by-Step: Deploy Lambda & Connect to API Gateway

## Overview
You have a zip file ready: `lambda-transcribe/transcribe-lambda.zip`
Now we'll upload it to AWS Lambda and connect it to API Gateway.

---

## Part 1: Deploy Lambda Function

### Step 1: Open AWS Lambda Console

1. Go to https://console.aws.amazon.com/lambda/
2. Make sure you're in **ap-south-1 (Mumbai)** region (top right corner)

### Step 2: Check if Function Already Exists

1. Look for a function named `shram-setu-transcribe` or similar
2. If it exists, we'll update it. If not, we'll create it.

### Step 3A: If Function EXISTS - Update It

1. Click on the function name
2. Scroll down to "Code source" section
3. Click **"Upload from"** → **".zip file"**
4. Click **"Upload"** button
5. Select `ShramSetu/prototype/lambda-transcribe/transcribe-lambda.zip`
6. Click **"Save"**
7. Wait for upload to complete
8. Skip to **Step 4**

### Step 3B: If Function DOESN'T EXIST - Create It

1. Click **"Create function"** button (orange button, top right)
2. Choose **"Author from scratch"**
3. Fill in the details:
   - **Function name**: `shram-setu-transcribe`
   - **Runtime**: Node.js 20.x (or latest Node.js version)
   - **Architecture**: x86_64
4. Expand **"Change default execution role"**
5. Choose **"Use an existing role"** if you have one, or **"Create a new role with basic Lambda permissions"**
6. Click **"Create function"** (bottom right)
7. Wait for function to be created
8. Scroll down to "Code source" section
9. Click **"Upload from"** → **".zip file"**
10. Click **"Upload"** button
11. Select `ShramSetu/prototype/lambda-transcribe/transcribe-lambda.zip`
12. Click **"Save"**

### Step 4: Configure Lambda Settings

#### A. Set Timeout
1. Click **"Configuration"** tab (near the top)
2. Click **"General configuration"** (left sidebar)
3. Click **"Edit"** button (top right)
4. Set **Timeout** to: `2 min 0 sec` (120 seconds)
5. Set **Memory** to: `512 MB`
6. Click **"Save"**

#### B. Set Environment Variables
1. Still in **"Configuration"** tab
2. Click **"Environment variables"** (left sidebar)
3. Click **"Edit"** button
4. Click **"Add environment variable"**
5. Add first variable:
   - **Key**: `S3_BUCKET_NAME`
   - **Value**: `shram-setu-uploads-808840719701`
6. Click **"Add environment variable"** again
7. Add second variable:
   - **Key**: `AWS_REGION`
   - **Value**: `ap-south-1`
8. Click **"Save"**

#### C. Set IAM Permissions
1. Still in **"Configuration"** tab
2. Click **"Permissions"** (left sidebar)
3. Click on the **Role name** (it's a blue link)
4. This opens IAM in a new tab
5. Click **"Add permissions"** → **"Attach policies"**
6. Search for and select these policies:
   - ✅ `AmazonTranscribeFullAccess`
   - ✅ `AmazonS3FullAccess` (or create custom policy for your bucket)
7. Click **"Add permissions"**
8. Go back to Lambda tab

### Step 5: Test Lambda Function (Optional but Recommended)

1. Go back to **"Code"** tab
2. Click **"Test"** button (top right)
3. Create a test event:
   - **Event name**: `test-transcribe`
   - **Template**: API Gateway AWS Proxy
4. Replace the JSON with:
```json
{
  "body": "{\"audio\":\"SGVsbG8gV29ybGQ=\",\"audioFormat\":\"webm\",\"languageCode\":\"en-IN\",\"userId\":\"test-user\"}",
  "requestContext": {
    "requestId": "test-123"
  }
}
```
5. Click **"Save"**
6. Click **"Test"** button
7. Check the results - it should process (might fail on actual transcription but should not error on missing variables)

---

## Part 2: Connect to API Gateway

### Step 1: Open API Gateway Console

1. Go to https://console.aws.amazon.com/apigateway/
2. Make sure you're in **ap-south-1 (Mumbai)** region

### Step 2: Find Your API

1. Look for an API with ID: `1zrunscvoc` (from your .env file)
2. Or look for an API named something like `shram-setu-api` or `transcribe-api`
3. Click on the API name

### Step 3: Check if /transcribe Endpoint Exists

1. Look in the **Resources** section (left side)
2. Check if `/transcribe` path exists

### Step 4A: If /transcribe EXISTS - Update It

1. Click on `/transcribe` resource
2. Click on the **POST** method (if it exists)
3. Click **"Integration Request"**
4. Change **Integration type** to **Lambda Function**
5. Check **"Use Lambda Proxy integration"**
6. Select **Lambda Region**: `ap-south-1`
7. Enter **Lambda Function**: `shram-setu-transcribe`
8. Click **"Save"**
9. Click **"OK"** when prompted about permissions
10. Skip to **Step 5**

### Step 4B: If /transcribe DOESN'T EXIST - Create It

1. Click on the root `/` resource
2. Click **"Actions"** → **"Create Resource"**
3. **Resource Name**: `transcribe`
4. **Resource Path**: `transcribe`
5. Check **"Enable API Gateway CORS"**
6. Click **"Create Resource"**
7. With `/transcribe` selected, click **"Actions"** → **"Create Method"**
8. Select **POST** from dropdown
9. Click the checkmark ✓
10. Configure the POST method:
    - **Integration type**: Lambda Function
    - Check **"Use Lambda Proxy integration"**
    - **Lambda Region**: `ap-south-1`
    - **Lambda Function**: `shram-setu-transcribe`
11. Click **"Save"**
12. Click **"OK"** when prompted about permissions

### Step 5: Enable CORS (Important!)

1. Select the `/transcribe` resource
2. Click **"Actions"** → **"Enable CORS"**
3. Make sure these are checked:
   - ✅ POST
   - ✅ OPTIONS
4. **Access-Control-Allow-Headers**: Add `Content-Type`
5. Click **"Enable CORS and replace existing CORS headers"**
6. Click **"Yes, replace existing values"**

### Step 6: Deploy API

1. Click **"Actions"** → **"Deploy API"**
2. **Deployment stage**: Select `prod` (or your existing stage)
3. Click **"Deploy"**
4. You'll see **Invoke URL** at the top - it should be:
   ```
   https://1zrunscvoc.execute-api.ap-south-1.amazonaws.com/prod
   ```
5. This should match your `.env` file!

---

## Part 3: Test the Deployment

### Test 1: Check API Endpoint

```powershell
cd ShramSetu/prototype
node test-transcribe-api.js
```

Expected output:
- Status should be 200 or 400 (not 403 or 500)
- Should see a response from Lambda

### Test 2: Test in Browser

1. Start your dev server:
```powershell
npm run dev
```

2. Open http://localhost:5173

3. Go to Voice Recorder component

4. Enable **"Use AWS Transcribe"** checkbox

5. Click **"Start Recording"**

6. Speak clearly for 3-5 seconds (try English first)

7. Click **"Stop Recording"**

8. Check browser console (F12) for logs

9. Wait 10-30 seconds for transcription

10. You should see transcribed text appear!

---

## Troubleshooting

### Error: "Access Denied" or 403

**Problem**: Lambda doesn't have permissions

**Solution**:
1. Go to Lambda → Configuration → Permissions
2. Click on the role name
3. Add policies: `AmazonTranscribeFullAccess` and `AmazonS3FullAccess`

### Error: "Execution role does not have permissions"

**Problem**: API Gateway can't invoke Lambda

**Solution**:
1. Go to Lambda function
2. Click "Add trigger"
3. Select "API Gateway"
4. Select your API
5. Click "Add"

### Error: "CORS error" in browser

**Problem**: CORS not configured properly

**Solution**:
1. Go to API Gateway
2. Select `/transcribe` resource
3. Actions → Enable CORS
4. Make sure POST and OPTIONS are checked
5. Deploy API again

### Error: "Transcription timeout"

**Problem**: Lambda timeout too short

**Solution**:
1. Go to Lambda → Configuration → General configuration
2. Increase timeout to 2-3 minutes
3. Save

### Error: "No speech detected"

**Problem**: Audio quality or format issue

**Solution**:
1. Speak louder and clearer
2. Record for at least 3 seconds
3. Try English first
4. Check microphone permissions in browser

---

## Quick Reference Commands

```powershell
# Navigate to project
cd ShramSetu/prototype

# Test API endpoint
node test-transcribe-api.js

# Check AWS setup
node check-aws-setup.js

# Start dev server
npm run dev

# Rebuild Lambda package (if you make changes)
cd lambda-transcribe
Compress-Archive -Path index.js,node_modules,package.json -DestinationPath transcribe-lambda.zip -Force
cd ..
```

---

## Summary Checklist

- [ ] Lambda function created/updated
- [ ] Lambda timeout set to 120 seconds
- [ ] Lambda memory set to 512 MB
- [ ] Environment variables added (S3_BUCKET_NAME, AWS_REGION)
- [ ] IAM permissions added (Transcribe, S3)
- [ ] API Gateway /transcribe endpoint created/updated
- [ ] API Gateway connected to Lambda
- [ ] CORS enabled on API Gateway
- [ ] API deployed to prod stage
- [ ] Tested with test-transcribe-api.js
- [ ] Tested in browser

---

## Need Help?

If you get stuck at any step:
1. Check the error message in browser console or CloudWatch logs
2. See `TRANSCRIBE_TROUBLESHOOTING.md` for common issues
3. Make sure all checklist items above are completed
4. Verify your .env file has the correct API URL

The Lambda package is ready at: `ShramSetu/prototype/lambda-transcribe/transcribe-lambda.zip`

Good luck! 🚀
