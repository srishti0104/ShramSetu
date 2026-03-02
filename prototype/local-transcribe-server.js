/**
 * Local Transcribe Server
 * 
 * Runs a local Express server that mimics the Lambda API
 * Uses AWS Transcribe directly from your local machine
 * 
 * Usage: node local-transcribe-server.js
 */

import express from 'express';
import cors from 'cors';
import { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand } from '@aws-sdk/client-transcribe';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';
import crypto from 'crypto';

const app = express();
const PORT = 3001;

// Read .env file
const envContent = readFileSync('.env', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex > 0) {
      const key = trimmed.substring(0, eqIndex).trim();
      const value = trimmed.substring(eqIndex + 1).trim();
      if (key && value) envVars[key] = value;
    }
  }
});

// AWS Configuration - using credentials from .env
const AWS_CONFIG = {
  region: envVars.VITE_AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: envVars.VITE_AWS_ACCESS_KEY_ID || 'YOUR_ACCESS_KEY',
    secretAccessKey: envVars.VITE_AWS_SECRET_ACCESS_KEY || 'YOUR_SECRET_KEY'
  }
};

const BUCKET_NAME = envVars.VITE_S3_BUCKET_NAME || 'shram-setu-uploads-808840719701';

// Check if credentials are configured
if (!envVars.VITE_AWS_ACCESS_KEY_ID || !envVars.VITE_AWS_SECRET_ACCESS_KEY) {
  console.error('❌ AWS credentials not found in .env file');
  console.error('Please add VITE_AWS_ACCESS_KEY_ID and VITE_AWS_SECRET_ACCESS_KEY to .env');
  process.exit(1);
}

const s3Client = new S3Client(AWS_CONFIG);
const transcribeClient = new TranscribeClient(AWS_CONFIG);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'Local Transcribe Server',
    endpoints: {
      health: 'GET /',
      transcribe: 'POST /transcribe'
    }
  });
});

// Upload audio to S3
async function uploadAudioToS3(audioBase64, audioFormat, userId) {
  const buffer = Buffer.from(audioBase64, 'base64');
  const fileName = `audio/${userId}/${Date.now()}.${audioFormat}`;
  
  console.log(`📤 Uploading to S3: ${fileName} (${buffer.length} bytes)`);
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: buffer,
    ContentType: `audio/${audioFormat}`,
    Metadata: {
      uploadedBy: userId,
      uploadedAt: new Date().toISOString()
    }
  });

  await s3Client.send(command);
  
  const fileUrl = `https://${BUCKET_NAME}.s3.${AWS_CONFIG.region}.amazonaws.com/${fileName}`;
  
  console.log('✅ Audio uploaded to S3:', fileUrl);
  
  return { fileUrl, fileName };
}

// Start transcription job
async function startTranscriptionJob(fileUrl, languageCode, audioFormat) {
  const jobName = `transcribe-${Date.now()}`;
  
  console.log(`🚀 Starting transcription job: ${jobName}`);
  
  const command = new StartTranscriptionJobCommand({
    TranscriptionJobName: jobName,
    LanguageCode: languageCode,
    MediaFormat: audioFormat,
    Media: {
      MediaFileUri: fileUrl
    },
    OutputBucketName: BUCKET_NAME,
    Settings: {
      ShowSpeakerLabels: false,
      ShowAlternatives: true,
      MaxAlternatives: 2
    }
  });

  await transcribeClient.send(command);
  
  console.log('✅ Transcription job started:', jobName);
  
  return jobName;
}

// Wait for transcription to complete
async function waitForTranscription(jobName, maxAttempts = 30) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const command = new GetTranscriptionJobCommand({
      TranscriptionJobName: jobName
    });

    const response = await transcribeClient.send(command);
    const job = response.TranscriptionJob;
    const status = job.TranscriptionJobStatus;

    console.log(`📊 Transcription status (${attempt + 1}/${maxAttempts}):`, status);

    if (status === 'COMPLETED') {
      // Get the transcript file key from the URI
      const transcriptUri = job.Transcript.TranscriptFileUri;
      console.log('📄 Transcript URI:', transcriptUri);
      
      // Extract the S3 key from the URI
      // URI format: https://s3.region.amazonaws.com/bucket/key or https://bucket.s3.region.amazonaws.com/key
      const urlParts = new URL(transcriptUri);
      const pathParts = urlParts.pathname.split('/').filter(p => p);
      
      // If first part is bucket name, remove it
      const transcriptKey = pathParts[0] === BUCKET_NAME ? pathParts.slice(1).join('/') : pathParts.join('/');
      
      console.log('📄 Fetching transcript from S3:', transcriptKey);
      
      // Fetch from S3 using SDK
      const getCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: transcriptKey
      });
      
      const s3Response = await s3Client.send(getCommand);
      const transcriptText = await s3Response.Body.transformToString();
      const transcriptData = JSON.parse(transcriptText);

      // Check if we have results
      if (!transcriptData.results || !transcriptData.results.transcripts || transcriptData.results.transcripts.length === 0) {
        console.warn('⚠️ No transcription results found');
        return { 
          text: '', 
          confidence: 0,
          warning: 'No speech detected in audio'
        };
      }

      const text = transcriptData.results.transcripts[0].transcript;
      const items = transcriptData.results.items || [];
      
      // Calculate average confidence
      const confidenceScores = items
        .filter(item => item.alternatives && item.alternatives[0])
        .map(item => parseFloat(item.alternatives[0].confidence));
      
      const confidence = confidenceScores.length > 0
        ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
        : 0;

      console.log('✅ Transcribed text:', text);
      console.log('📊 Confidence:', (confidence * 100).toFixed(1) + '%');

      return { text, confidence };
    } else if (status === 'FAILED') {
      const failureReason = job.FailureReason || 'Unknown error';
      console.error('❌ Transcription job failed:', failureReason);
      throw new Error(`Transcription job failed: ${failureReason}`);
    }

    // Wait before next attempt
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  throw new Error('Transcription timeout');
}

// Transcribe endpoint
app.post('/transcribe', async (req, res) => {
  const requestId = crypto.randomUUID();
  
  console.log('\n🎤 Transcribe request received:', requestId);
  
  try {
    const { audio, audioFormat, languageCode, userId } = req.body;
    
    // Validate input
    if (!audio || !audioFormat || !languageCode || !userId) {
      console.error('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: audio, audioFormat, languageCode, userId',
        requestId
      });
    }
    
    console.log('📊 Request details:', {
      audioSize: audio.length,
      audioFormat,
      languageCode,
      userId
    });
    
    // Step 1: Upload audio to S3
    const { fileUrl, fileName } = await uploadAudioToS3(audio, audioFormat, userId);
    
    // Step 2: Start transcription job
    const jobName = await startTranscriptionJob(fileUrl, languageCode, audioFormat);
    
    // Step 3: Wait for transcription to complete
    const result = await waitForTranscription(jobName);
    
    console.log('✅ Transcription complete!');
    
    // Return success response
    res.json({
      success: true,
      text: result.text,
      confidence: result.confidence,
      language: languageCode,
      jobName,
      audioUrl: fileUrl,
      warning: result.warning,
      requestId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Transcription error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Transcription failed',
      requestId,
      timestamp: new Date().toISOString()
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 Local Transcribe Server Started!');
  console.log('='.repeat(60));
  console.log(`\n📍 Server running at: http://localhost:${PORT}`);
  console.log(`\n🔧 Configuration:`);
  console.log(`   AWS Region: ${AWS_CONFIG.region}`);
  console.log(`   S3 Bucket: ${BUCKET_NAME}`);
  console.log(`   Access Key: ${AWS_CONFIG.credentials.accessKeyId?.substring(0, 10)}...`);
  console.log(`\n📡 Endpoints:`);
  console.log(`   GET  / - Health check`);
  console.log(`   POST /transcribe - Transcribe audio`);
  console.log(`\n💡 Update your .env file:`);
  console.log(`   VITE_TRANSCRIBE_API_URL=http://localhost:${PORT}`);
  console.log('\n' + '='.repeat(60) + '\n');
  console.log('Ready to accept requests! Press Ctrl+C to stop.\n');
});
