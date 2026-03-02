# Quick Deploy Checklist ✅

Use this as a quick reference while deploying. See `DEPLOY_GUIDE.md` for detailed instructions.

## Pre-Deployment ✅

- [x] Lambda package created: `lambda-transcribe/transcribe-lambda.zip`
- [x] AWS credentials configured
- [x] S3 bucket exists: `shram-setu-uploads-808840719701`

## Lambda Function Deployment

### 1. Upload Lambda Function
- [ ] Go to: https://console.aws.amazon.com/lambda/
- [ ] Region: **ap-south-1 (Mumbai)**
- [ ] Function name: `shram-setu-transcribe`
- [ ] Runtime: **Node.js 20.x**
- [ ] Upload: `lambda-transcribe/transcribe-lambda.zip`

### 2. Configure Lambda
- [ ] **Timeout**: 120 seconds (2 minutes)
- [ ] **Memory**: 512 MB
- [ ] **Environment Variables**:
  - [ ] `S3_BUCKET_NAME` = `shram-setu-uploads-808840719701`
  - [ ] `AWS_REGION` = `ap-south-1`

### 3. Set Permissions
- [ ] Go to: Configuration → Permissions → Role
- [ ] Add policy: `AmazonTranscribeFullAccess`
- [ ] Add policy: `AmazonS3FullAccess`

## API Gateway Configuration

### 4. Connect to API Gateway
- [ ] Go to: https://console.aws.amazon.com/apigateway/
- [ ] Region: **ap-south-1 (Mumbai)**
- [ ] Find API ID: `1zrunscvoc`
- [ ] Create/Update resource: `/transcribe`
- [ ] Method: **POST**
- [ ] Integration: **Lambda Function**
- [ ] Lambda: `shram-setu-transcribe`
- [ ] Enable: **Lambda Proxy integration**

### 5. Enable CORS
- [ ] Select `/transcribe` resource
- [ ] Actions → Enable CORS
- [ ] Methods: POST, OPTIONS
- [ ] Headers: `Content-Type`
- [ ] Click: Enable CORS

### 6. Deploy API
- [ ] Actions → Deploy API
- [ ] Stage: **prod**
- [ ] Verify URL: `https://1zrunscvoc.execute-api.ap-south-1.amazonaws.com/prod`

## Testing

### 7. Test API Endpoint
```powershell
cd ShramSetu/prototype
node test-transcribe-api.js
```
- [ ] Status: 200 or 400 (not 403/500)
- [ ] Response from Lambda received

### 8. Test in Browser
```powershell
npm run dev
```
- [ ] Open: http://localhost:5173
- [ ] Go to Voice Recorder
- [ ] Enable: "Use AWS Transcribe"
- [ ] Record audio (3-5 seconds)
- [ ] Check: Browser console (F12)
- [ ] Wait: 10-30 seconds
- [ ] Verify: Transcribed text appears

## Troubleshooting Quick Fixes

### If you see 403 Forbidden:
```
Lambda → Configuration → Permissions → Add policies
```

### If you see CORS error:
```
API Gateway → /transcribe → Actions → Enable CORS → Deploy API
```

### If you see timeout:
```
Lambda → Configuration → General → Timeout → 180 seconds
```

### If no speech detected:
- Speak louder and clearer
- Record for at least 3 seconds
- Try English first
- Check microphone permissions

## Files Location

- **Lambda package**: `ShramSetu/prototype/lambda-transcribe/transcribe-lambda.zip`
- **Test script**: `ShramSetu/prototype/test-transcribe-api.js`
- **Detailed guide**: `ShramSetu/prototype/DEPLOY_GUIDE.md`
- **Troubleshooting**: `ShramSetu/prototype/TRANSCRIBE_TROUBLESHOOTING.md`

## Current Configuration

```
AWS Region: ap-south-1 (Mumbai)
S3 Bucket: shram-setu-uploads-808840719701
API Gateway: https://1zrunscvoc.execute-api.ap-south-1.amazonaws.com/prod
Lambda Function: shram-setu-transcribe
```

## Success Criteria ✅

You'll know it's working when:
1. ✅ `test-transcribe-api.js` returns 200 status
2. ✅ Browser console shows "Transcription complete"
3. ✅ Transcribed text appears in the UI
4. ✅ No errors in CloudWatch logs

---

**Estimated Time**: 15-20 minutes

**Next Step**: Open `DEPLOY_GUIDE.md` for detailed instructions!
