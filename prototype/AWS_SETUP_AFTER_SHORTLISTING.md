# 🚀 AWS Setup Guide - After Shortlisting

## 📋 Overview
This guide will help you quickly integrate the new AWS API keys you receive after shortlisting.

---

## 🔑 Step 1: Update AWS Credentials in .env

Open `ShramSetu/.env` and update these values:

```env
# ============================================
# AWS CREDENTIALS (Update after shortlisting)
# ============================================

# Basic AWS Credentials
VITE_AWS_ACCESS_KEY_ID=YOUR_NEW_ACCESS_KEY_HERE
VITE_AWS_SECRET_ACCESS_KEY=YOUR_NEW_SECRET_KEY_HERE
VITE_AWS_REGION=ap-south-1

# Bedrock Bearer Token (if provided separately)
VITE_AWS_BEARER_TOKEN_BEDROCK=YOUR_BEDROCK_TOKEN_HERE

# ============================================
# API ENDPOINTS (Already deployed - no change needed)
# ============================================

# Textract API Endpoint
VITE_TEXTRACT_API_URL=https://kgre8icwj7.execute-api.ap-south-1.amazonaws.com/prod

# Auth API Endpoint
VITE_AUTH_API_URL=https://c6ikb39522.execute-api.ap-south-1.amazonaws.com/prod

# Delta Sync API Endpoint
VITE_SYNC_API_URL=https://8fxdfd43b7.execute-api.ap-south-1.amazonaws.com/prod

# Bedrock Proxy API Endpoint
VITE_BEDROCK_API_URL=https://br6vfmwfie.execute-api.ap-south-1.amazonaws.com/prod

# S3 Bucket Name
VITE_S3_BUCKET_NAME=shram-setu-uploads-372733619851
```

---

## 🧪 Step 2: Test AWS Services

After updating credentials, run these tests:

### Test 1: Basic AWS Connection
```bash
cd ShramSetu
node test-bedrock.js
```

**Expected Output:**
```
✅ SUCCESS! Bedrock is working!
🤖 AI Response: [AI response here]
```

### Test 2: Bedrock Proxy
```bash
node test-proxy.js
```

**Expected Output:**
```
✅ SUCCESS! Payment method is ACTIVE!
🤖 AI Response: Proxy is working!
```

### Test 3: Run the App
```bash
npm run dev
```

Then test each feature:
1. **Voice Recorder** - Test Transcribe (speech-to-text)
2. **Payslip Auditor** - Test Textract (OCR)
3. **Grievance Form** - Test Comprehend (sentiment analysis)
4. **Job Search** - Test Location Service (GPS distance)
5. **AI Assistant** - Toggle to "AWS Bedrock AI" mode
6. **Offline Sync** - Test Delta Sync with DynamoDB

---

## 🔄 Step 3: Toggle AWS Services ON

In your app, you'll see toggle switches for each AWS service:

### Current State (Mock Mode):
- 🎭 Mock Transcribe
- 🎭 Mock Textract
- 🎭 Mock Comprehend
- 🎭 Mock AI

### After Adding Keys (Real AWS):
- 🤖 AWS Transcribe ✅
- 🤖 AWS Textract ✅
- 🤖 AWS Comprehend ✅
- 🤖 AWS Bedrock AI ✅

Just flip the toggles to use real AWS services!

---

## 📦 Step 4: Redeploy Lambda Functions (If Needed)

If you get new AWS credentials, you may need to redeploy Lambda functions:

### Redeploy Bedrock Lambda:
```bash
cd infrastructure
npx cdk deploy --app "npx ts-node cdk-bedrock-app.ts" ShramSetuBedrockStack
```

### Redeploy Other Lambdas (if needed):
```bash
npx cdk deploy --app "npx ts-node cdk-textract-app.ts" ShramSetuTextractStack
npx cdk deploy --app "npx ts-node cdk-auth-app.ts" ShramSetuAuthStack
npx cdk deploy --app "npx ts-node cdk-sync-app.ts" ShramSetuSyncStack
```

---

## 🎯 Quick Checklist

After adding new AWS keys, verify:

- [ ] Updated `.env` with new credentials
- [ ] Restarted dev server (`npm run dev`)
- [ ] Tested Bedrock proxy (`node test-proxy.js`)
- [ ] Voice Recorder works with real Transcribe
- [ ] Payslip Auditor works with real Textract
- [ ] Grievance Form works with real Comprehend
- [ ] Job Search works with real Location Service
- [ ] AI Assistant works with real Bedrock
- [ ] Delta Sync works with DynamoDB

---

## 🆘 Troubleshooting

### Issue: "Payment method required"
**Solution:** Wait 2-24 hours after adding payment method to AWS account

### Issue: "Access Denied"
**Solution:** Ensure new API keys have these permissions:
- BedrockFullAccess
- TranscribeFullAccess
- TextractFullAccess
- ComprehendFullAccess
- LocationFullAccess
- DynamoDBFullAccess
- LambdaFullAccess

### Issue: "Model not found"
**Solution:** Request model access in AWS Bedrock console:
1. Go to AWS Bedrock Console
2. Click "Model access"
3. Enable Claude 3 Sonnet

---

## 📊 Expected Costs (After Free Tier)

| Service | Usage | Cost/Month |
|---------|-------|------------|
| Bedrock (Claude 3 Sonnet) | 10,000 requests | ~$2.00 |
| Transcribe | 100 minutes | $0.24 |
| Textract | 100 payslips | $0.15 |
| Comprehend | 1,000 texts | $0.10 |
| Location Service | 1,000 requests | $0.40 |
| Lambda | 50,000 invocations | $0.10 |
| DynamoDB | 1GB storage | $0.25 |
| **TOTAL** | | **~$3.24/month** |

---

## 🎉 Success Indicators

When everything is working, you'll see:

1. **Console Logs:**
   ```
   ✅ Using Bedrock Lambda Proxy
   ✅ Transcribe service initialized
   ✅ Textract service initialized
   ✅ Comprehend service initialized
   ```

2. **In App:**
   - All toggles show "🤖 AWS [Service]"
   - AI responses are intelligent and contextual
   - OCR extracts text accurately
   - Voice commands work in Hindi/English

3. **No Errors:**
   - No "payment method" errors
   - No "access denied" errors
   - No CORS errors

---

## 📞 Support

If you face issues after adding new keys:

1. **Check AWS Console** for service limits
2. **Run test scripts** to identify which service is failing
3. **Check browser console** for detailed error messages
4. **Verify .env file** has correct format (no extra spaces)

---

## 🚀 You're Ready!

Your app is **fully prepared** to accept new AWS credentials. Just:
1. Update `.env` file
2. Restart server
3. Toggle services ON
4. Demo with real AI! 🎉

**Current Status:** Mock mode (perfect for initial demo)
**After Shortlisting:** Real AWS services (production-ready)

Good luck with your hackathon! 🏆