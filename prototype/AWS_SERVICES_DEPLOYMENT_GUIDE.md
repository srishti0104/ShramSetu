# AWS Services Deployment Guide

## Services Created ✅

You now have 4 new AWS services ready to deploy:

1. **Amazon S3** - File storage for audio, images, and documents
2. **Amazon Transcribe** - Speech-to-text for voice commands
3. **Amazon Comprehend** - Sentiment analysis for grievances
4. **Amazon Location Service** - Geospatial search for jobs

## Prerequisites

- ✅ AWS account fully activated
- ✅ AWS CLI configured
- ✅ CDK bootstrapped
- ✅ Node.js and npm installed

## Deployment Steps

### Step 1: Build Infrastructure Code

```powershell
cd ShramSetu/infrastructure
npm run build
```

### Step 2: Deploy All Services at Once

```powershell
npm run deploy:services
```

This will deploy:
- S3 bucket for file uploads
- Location Service (Place Index + Route Calculator)

**Expected time**: 5-10 minutes

### Step 3: Deploy Individual Services (Optional)

If you want to deploy services one by one:

```powershell
# Deploy S3 only
npm run deploy:s3

# Deploy Location Service only
npm run deploy:location
```

### Step 4: Update .env File

After deployment, you'll see outputs like:

```
ShramSetuS3Stack.BucketName = shram-setu-uploads-372733619851
ShramSetuLocationStack.PlaceIndexName = ShramSetuPlaceIndex
ShramSetuLocationStack.RouteCalculatorName = ShramSetuRouteCalculator
```

Update your `.env` file:

```bash
# S3 Bucket Name
VITE_S3_BUCKET_NAME=shram-setu-uploads-372733619851
```

### Step 5: Test the Services

```powershell
cd ..
npm run dev
```

Open http://localhost:5173 and test:

1. **Voice Recorder** - Record audio (will upload to S3 and transcribe)
2. **Grievance Form** - Submit grievance (will analyze sentiment)
3. **Job Search** - Search jobs by location (will use Location Service)

## Service Details

### 1. Amazon S3 (File Storage)

**What it does:**
- Stores audio recordings from voice commands
- Stores uploaded images (payslips, documents)
- Stores grievance audio files

**Usage in code:**
```javascript
import s3Service from './services/aws/s3Service';

// Upload audio
const result = await s3Service.uploadAudio(audioBlob, userId);

// Upload image
const result = await s3Service.uploadImage(imageFile, userId);

// Upload document
const result = await s3Service.uploadDocument(file, userId);
```

**Cost:**
- First 5GB: FREE (forever)
- After 5GB: ~₹1.50 per GB/month
- Estimated for testing: ₹0-10/month

### 2. Amazon Transcribe (Speech-to-Text)

**What it does:**
- Converts voice commands to text
- Supports Hindi and English
- Automatic language detection

**Usage in code:**
```javascript
import transcribeService from './services/aws/transcribeService';

// Transcribe audio
const result = await transcribeService.transcribeAudio(audioBlob, 'hi-IN', userId);
console.log('Transcribed text:', result.text);

// Auto-detect language
const result = await transcribeService.transcribeWithAutoDetect(audioBlob, userId);
```

**Supported languages:**
- Hindi (hi-IN)
- English (en-IN)
- Tamil (ta-IN)
- Telugu (te-IN)
- Marathi (mr-IN)
- Bengali (bn-IN)

**Cost:**
- First 60 minutes/month: FREE (for 12 months)
- After 60 min: ₹0.80 per minute
- Estimated for testing: ₹0-50/month

### 3. Amazon Comprehend (Sentiment Analysis)

**What it does:**
- Analyzes sentiment of grievance text
- Detects entities (people, places, organizations)
- Extracts key phrases
- Calculates urgency score
- Categorizes grievances

**Usage in code:**
```javascript
import comprehendService from './services/aws/comprehendService';

// Analyze grievance
const analysis = await comprehendService.analyzeGrievance(text, 'en');

console.log('Sentiment:', analysis.sentiment.sentiment); // POSITIVE, NEGATIVE, NEUTRAL
console.log('Urgency:', analysis.summary.urgency); // HIGH, MEDIUM, LOW
console.log('Category:', analysis.summary.category); // SAFETY, PAYMENT, etc.
console.log('Key issues:', analysis.summary.keyIssues);
```

**Categories detected:**
- SAFETY (accidents, injuries, unsafe conditions)
- PAYMENT (salary, wages, money issues)
- HARASSMENT (abuse, discrimination)
- WORKING_CONDITIONS (environment, facilities)
- OTHER

**Cost:**
- First 50,000 units/month: FREE (for 12 months)
- After 50K: ₹0.008 per unit
- Estimated for testing: ₹0/month (within free tier)

### 4. Amazon Location Service (Geospatial)

**What it does:**
- Searches for places by text
- Calculates distances between locations
- Finds jobs within radius
- Gets user's current location

**Usage in code:**
```javascript
import locationService from './services/aws/locationService';

// Search places
const places = await locationService.searchPlaces('Mumbai, Maharashtra');

// Calculate route
const route = await locationService.calculateRoute(
  { latitude: 19.0760, longitude: 72.8777 }, // Mumbai
  { latitude: 18.5204, longitude: 73.8567 }  // Pune
);
console.log('Distance:', route.distance, 'km');
console.log('Duration:', route.durationMinutes, 'minutes');

// Find jobs within 10km
const nearbyJobs = locationService.findJobsWithinRadius(
  userLocation,
  allJobs,
  10 // radius in km
);

// Get current location
const location = await locationService.getCurrentLocation();
```

**Cost:**
- First 50,000 requests/month: FREE (for 12 months)
- After 50K: ₹0.32 per 1000 requests
- Estimated for testing: ₹0/month (within free tier)

## Integration Examples

### Example 1: Voice Command with Transcription

```javascript
// In VoiceRecorder component
import s3Service from '../services/aws/s3Service';
import transcribeService from '../services/aws/transcribeService';

async function handleVoiceCommand(audioBlob) {
  try {
    // Step 1: Upload to S3
    const uploadResult = await s3Service.uploadAudio(audioBlob, userId);
    
    // Step 2: Transcribe
    const transcription = await transcribeService.transcribeAudio(
      audioBlob,
      'hi-IN',
      userId
    );
    
    // Step 3: Process command
    processCommand(transcription.text);
  } catch (error) {
    console.error('Voice command error:', error);
  }
}
```

### Example 2: Grievance with Sentiment Analysis

```javascript
// In GrievanceForm component
import comprehendService from '../services/aws/comprehendService';

async function submitGrievance(text) {
  try {
    // Analyze grievance
    const analysis = await comprehendService.analyzeGrievance(text, 'en');
    
    // Submit with analysis
    await submitToBackend({
      text,
      sentiment: analysis.sentiment.sentiment,
      urgency: analysis.summary.urgency,
      category: analysis.summary.category,
      keyIssues: analysis.summary.keyIssues
    });
    
    // Show urgency alert if needed
    if (analysis.summary.urgency === 'HIGH') {
      alert('High urgency grievance detected! Escalating to priority queue.');
    }
  } catch (error) {
    console.error('Grievance submission error:', error);
  }
}
```

### Example 3: Job Search with Location

```javascript
// In JobSearch component
import locationService from '../services/aws/locationService';

async function searchNearbyJobs(searchRadius = 10) {
  try {
    // Get user location
    const userLocation = await locationService.getCurrentLocation();
    
    // Fetch all jobs
    const allJobs = await fetchJobsFromAPI();
    
    // Filter by distance
    const nearbyJobs = locationService.findJobsWithinRadius(
      userLocation,
      allJobs,
      searchRadius
    );
    
    // Display results
    displayJobs(nearbyJobs);
  } catch (error) {
    console.error('Job search error:', error);
  }
}
```

## Testing Checklist

After deployment, test each service:

### ✅ S3 Testing
- [ ] Upload audio file
- [ ] Upload image file
- [ ] Verify files appear in S3 console
- [ ] Delete file

### ✅ Transcribe Testing
- [ ] Record voice in Hindi
- [ ] Check transcription accuracy
- [ ] Try English voice
- [ ] Test auto-detect

### ✅ Comprehend Testing
- [ ] Submit positive grievance
- [ ] Submit negative grievance
- [ ] Check sentiment scores
- [ ] Verify category detection

### ✅ Location Testing
- [ ] Search for a city
- [ ] Calculate distance between two points
- [ ] Find jobs within 5km
- [ ] Get current location

## Troubleshooting

### S3 Upload Fails
**Error**: "Access Denied"
**Solution**: Check CORS configuration in S3 bucket

### Transcribe Timeout
**Error**: "Transcription timeout"
**Solution**: Audio file might be too long (max 2 hours)

### Comprehend Language Error
**Error**: "Unsupported language"
**Solution**: Use 'en' or 'hi' language codes only

### Location Service Not Found
**Error**: "Place index not found"
**Solution**: Verify deployment completed successfully

## Cost Summary

**Monthly cost estimate for testing:**

| Service | Free Tier | After Free Tier | Estimated Cost |
|---------|-----------|-----------------|----------------|
| S3 | 5GB free | ₹1.50/GB | ₹0-10 |
| Transcribe | 60 min free | ₹0.80/min | ₹0-50 |
| Comprehend | 50K units free | ₹0.008/unit | ₹0 |
| Location | 50K requests free | ₹0.32/1000 | ₹0 |
| **TOTAL** | | | **₹0-60/month** |

All services have generous free tiers - you'll likely stay within free tier during testing!

## Next Steps

1. Deploy services: `npm run deploy:services`
2. Update `.env` with bucket name
3. Test each service
4. Integrate into your app
5. Monitor usage in AWS Console

## Support

If you encounter issues:
1. Check CloudWatch logs in AWS Console
2. Verify IAM permissions
3. Check service quotas
4. Review error messages carefully

Happy deploying! 🚀
