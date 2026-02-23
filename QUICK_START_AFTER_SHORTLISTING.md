# ⚡ Quick Start - After Shortlisting

## 🎯 You Got New AWS Keys? Here's What to Do:

### Step 1: Update .env File (2 minutes)
Open `ShramSetu/.env` and replace these lines:

```env
VITE_AWS_ACCESS_KEY_ID=YOUR_NEW_ACCESS_KEY_HERE
VITE_AWS_SECRET_ACCESS_KEY=YOUR_NEW_SECRET_KEY_HERE
```

If you got a new Bedrock token:
```env
VITE_AWS_BEARER_TOKEN_BEDROCK=YOUR_NEW_BEDROCK_TOKEN_HERE
```

### Step 2: Restart Server (30 seconds)
```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 3: Test (1 minute)
```bash
# In a new terminal:
node test-proxy.js
```

**Success looks like:**
```
✅ SUCCESS! Payment method is ACTIVE!
🤖 AI Response: Proxy is working!
```

### Step 4: Toggle Services ON
In your app at http://localhost:5173:
- Go to each feature
- Toggle from "🎭 Mock" to "🤖 AWS"
- Test each service

---

## ✅ Services to Test:

1. **Voice Recorder** → Toggle "Use AWS Transcribe"
2. **Payslip Auditor** → Toggle "Use AWS Textract OCR"
3. **Grievance Form** → Toggle "Use AWS Comprehend"
4. **Job Search** → Toggle "Use AWS Location Service"
5. **AI Assistant** → Toggle "AWS Bedrock AI"
6. **Offline Sync** → Already using AWS DynamoDB

---

## 🆘 If Something Doesn't Work:

### Error: "Payment method required"
- **Wait**: 2-24 hours after adding payment method
- **Check**: AWS Billing Console for verification status

### Error: "Access Denied"
- **Check**: New keys have required permissions
- **Fix**: Add BedrockFullAccess, TranscribeFullAccess, etc.

### Error: "Model not found"
- **Check**: AWS Bedrock Console → Model Access
- **Fix**: Enable Claude 3 Sonnet model

---

## 📞 Need Help?

See detailed guide: `AWS_SETUP_AFTER_SHORTLISTING.md`

---

## 🎉 That's It!

**Total Time**: ~5 minutes to switch from mock to real AWS services!

Your app is **production-ready** and will impress judges with real AI intelligence! 🚀