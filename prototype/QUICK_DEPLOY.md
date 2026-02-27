# Quick Deploy Guide - AWS Services

## 🚀 Deploy in 3 Steps (10 minutes)

### Step 1: Build & Deploy (5 minutes)

```powershell
cd ShramSetu/infrastructure
npm run build
npm run deploy:services
```

Wait for deployment to complete. You'll see outputs like:
```
ShramSetuS3Stack.BucketName = shram-setu-uploads-808840719701
ShramSetuLocationStack.PlaceIndexName = ShramSetuPlaceIndex
```

### Step 2: Update .env (1 minute)

Edit `ShramSetu/.env` and add:

```bash
VITE_S3_BUCKET_NAME=shram-setu-uploads-808840719701
```

(Use the bucket name from Step 1 output)

### Step 3: Test (5 minutes)

```powershell
cd ..
npm run dev
```

Open http://localhost:5173 and test:
- Voice Recorder (Transcribe)
- Grievance Form (Comprehend)
- Job Search (Location)

## ✅ What You Get

- **S3**: Store audio, images, documents
- **Transcribe**: Voice to text (Hindi + English)
- **Comprehend**: Sentiment analysis for grievances
- **Location**: Job search by distance

## 💰 Cost

**₹0-60/month** (mostly free tier)

## 📚 Full Documentation

See `AWS_SERVICES_DEPLOYMENT_GUIDE.md` for detailed instructions.

## 🆘 Need Help?

Check `AWS_SERVICES_SUMMARY.md` for troubleshooting.

---

**That's it! You're ready to go! 🎉**
