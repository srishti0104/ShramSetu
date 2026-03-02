# 🎤 AWS Transcribe Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: "No speech detected" or Empty Transcription

**Symptoms:**
- Transcription completes but returns empty text
- Confidence score is 0%
- Console shows "No transcription results found"

**Causes:**
1. Audio is too quiet or silent
2. Background noise is too loud
3. Audio format not fully supported by AWS Transcribe
4. Recording duration too short (< 1 second)

**Solutions:**
1. **Speak louder and clearer** - Ensure you're speaking directly into the microphone
2. **Reduce background noise** - Find a quiet environment
3. **Record for at least 2-3 seconds** - AWS Transcribe needs sufficient audio
4. **Check microphone permissions** - Ensure browser has microphone access
5. **Test with English first** - Try speaking in English to rule out language-specific issues

### Issue 2: "Transcription job failed"

**Symptoms:**
- Job status shows "FAILED"
- Error message in console

**Causes:**
1. S3 bucket permissions issue
2. Invalid audio format
3. Audio file corrupted
4. AWS service quota exceeded

**Solutions:**
1. **Check S3 bucket policy** - Ensure Transcribe service can read from bucket:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": {
           "Service": "transcribe.amazonaws.com"
         },
         "Action": ["s3:GetObject"],
         "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
       }
     ]
   }
   ```

2. **Verify audio format** - Check browser console for audio format being used
3. **Check AWS service quotas** - Go to AWS Service Quotas console

### Issue 3: "Access Denied" Error

**Symptoms:**
- Error: "Access Denied" or "403 Forbidden"
- Cannot upload to S3 or start transcription job

**Causes:**
1. IAM user lacks necessary permissions
2. S3 bucket policy blocks access
3. Incorrect AWS credentials

**Solutions:**
1. **Attach IAM policies** to your user:
   - `AmazonTranscribeFullAccess`
   - `AmazonS3FullAccess` (or custom policy for your bucket)

2. **Verify credentials** in `.env` file:
   ```bash
   VITE_AWS_ACCESS_KEY_ID=AKIA...
   VITE_AWS_SECRET_ACCESS_KEY=...
   VITE_AWS_REGION=ap-south-1
   VITE_S3_BUCKET_NAME=your-bucket-name
   ```

3. **Test credentials** using the diagnostic script:
   ```bash
   node test-transcribe-setup.js
   ```

### Issue 4: "Bucket not found" Error

**Symptoms:**
- Error: "NoSuchBucket" or "The specified bucket does not exist"

**Causes:**
1. Bucket name mismatch
2. Bucket in different region
3. Bucket doesn't exist

**Solutions:**
1. **Verify bucket name** in `.env` matches actual S3 bucket
2. **Check bucket region** - Must be in same region as configured (ap-south-1)
3. **Create bucket** if it doesn't exist:
   - Go to AWS S3 Console
   - Create bucket with name from `.env`
   - Region: ap-south-1 (Mumbai)

### Issue 5: WebM Format Not Supported

**Symptoms:**
- Error: "InvalidMediaFormat"
- Transcription fails immediately

**Causes:**
- AWS Transcribe has limited WebM support
- Browser only supports WebM recording

**Solutions:**
1. **Updated code now tries MP4 first** - The VoiceRecorder component has been updated to prefer MP4 format
2. **Check browser support**:
   ```javascript
   console.log('MP4 supported:', MediaRecorder.isTypeSupported('audio/mp4'));
   console.log('WebM supported:', MediaRecorder.isTypeSupported('audio/webm'));
   ```
3. **Use Chrome/Edge** - Better audio format support than Firefox/Safari

### Issue 6: Hindi/Regional Language Not Recognized

**Symptoms:**
- English works but Hindi doesn't
- Empty transcription for Hindi audio

**Causes:**
1. Language code mismatch
2. Accent/dialect not well supported
3. Audio quality issues

**Solutions:**
1. **Verify language code** - Should be 'hi-IN' for Hindi
2. **Speak clearly** - Use standard Hindi pronunciation
3. **Try English first** - Rule out other issues
4. **Check supported languages**:
   - Hindi (hi-IN) ✅
   - English India (en-IN) ✅
   - Tamil (ta-IN) ✅
   - Telugu (te-IN) ✅
   - Marathi (mr-IN) ✅
   - Bengali (bn-IN) ✅

### Issue 7: Transcription Takes Too Long

**Symptoms:**
- Transcription timeout error
- Job stuck in "IN_PROGRESS" status

**Causes:**
1. Large audio file
2. AWS service delays
3. Network issues

**Solutions:**
1. **Keep recordings under 30 seconds** for faster processing
2. **Wait longer** - Increase timeout in code if needed
3. **Check AWS status** - Visit AWS Service Health Dashboard

## Testing Checklist

Before reporting an issue, verify:

- [ ] AWS credentials are correct in `.env`
- [ ] S3 bucket exists and is accessible
- [ ] IAM user has Transcribe and S3 permissions
- [ ] S3 bucket policy allows Transcribe service access
- [ ] CORS is configured on S3 bucket
- [ ] Microphone permissions granted in browser
- [ ] Recording duration is at least 2-3 seconds
- [ ] Speaking clearly and loudly
- [ ] Quiet environment (minimal background noise)
- [ ] Browser console shows no errors before transcription

## Diagnostic Commands

### 1. Test AWS Setup
```bash
node test-transcribe-setup.js
```

### 2. Check Environment Variables
```bash
# Windows PowerShell
Get-Content .env

# Check if variables are loaded
npm run dev
# Then check browser console for AWS config logs
```

### 3. Test S3 Upload Manually
```javascript
// In browser console
const s3Service = await import('./src/services/aws/s3Service.js');
const testBlob = new Blob(['test'], { type: 'text/plain' });
const result = await s3Service.default.uploadAudio(testBlob, 'test-user');
console.log('Upload result:', result);
```

### 4. Check Recent Transcription Jobs
Go to AWS Console → Transcribe → Transcription jobs
- Check job status
- View failure reasons
- Download transcription results

## Best Practices

1. **Audio Quality**
   - Speak 6-12 inches from microphone
   - Avoid background noise
   - Speak at normal pace
   - Enunciate clearly

2. **Recording Duration**
   - Minimum: 2 seconds
   - Optimal: 5-15 seconds
   - Maximum: 60 seconds (for faster processing)

3. **Language Selection**
   - Match language to what you're speaking
   - Use standard dialect
   - Avoid code-switching (mixing languages)

4. **Error Handling**
   - Check browser console for detailed errors
   - Note the exact error message
   - Check AWS CloudWatch logs if available

## Getting Help

If issues persist:

1. **Check browser console** - Look for detailed error messages
2. **Check AWS CloudWatch** - View Transcribe service logs
3. **Verify IAM permissions** - Ensure all required policies attached
4. **Test with AWS CLI** - Rule out code issues:
   ```bash
   aws transcribe start-transcription-job \
     --transcription-job-name test-job \
     --language-code hi-IN \
     --media-format mp4 \
     --media MediaFileUri=s3://your-bucket/test.mp4
   ```

## Additional Resources

- [AWS Transcribe Documentation](https://docs.aws.amazon.com/transcribe/)
- [Supported Languages](https://docs.aws.amazon.com/transcribe/latest/dg/supported-languages.html)
- [Supported Media Formats](https://docs.aws.amazon.com/transcribe/latest/dg/how-input.html)
- [IAM Permissions](https://docs.aws.amazon.com/transcribe/latest/dg/security-iam.html)
