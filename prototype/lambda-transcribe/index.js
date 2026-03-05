/**
 * AWS Lambda Function for Transcribe Service
 * 
 * Handles audio transcription using Amazon Transcribe
 * Accepts base64 encoded audio from browser
 */

import { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand } from '@aws-sdk/client-transcribe';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

const s3Client = new S3Client({ region: process.env.AWS_REGION || 'ap-south-1' });
const transcribeClient = new TranscribeClient({ region: process.env.AWS_REGION || 'ap-south-1' });

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'shram-setu-uploads-808840719701';
const MAX_POLL_ATTEMPTS = 30;
const POLL_INTERVAL = 2000; // 2 seconds

/**
 * Upload audio to S3
 */
async function uploadAudioToS3(audioBase64, audioFormat, userId) {
  const buffer = Buffer.from(audioBase64, 'base64');
  const fileName = `audio/${userId}/${Date.now()}.${audioFormat}`;
  
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
  
  const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${fileName}`;
  
  console.log('✅ Audio uploaded to S3:', fileUrl);
  
  return { fileUrl, fileName };
}

/**
 * Start transcription job
 */
async function startTranscriptionJob(fileUrl, languageCode, audioFormat) {
  const jobName = `transcribe-${Date.now()}`;
  
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

/**
 * Wait for transcription to complete
 */
async function waitForTranscription(jobName) {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    const command = new GetTranscriptionJobCommand({
      TranscriptionJobName: jobName
    });

    const response = await transcribeClient.send(command);
    const job = response.TranscriptionJob;
    const status = job.TranscriptionJobStatus;

    console.log(`📊 Transcription status (${attempt + 1}/${MAX_POLL_ATTEMPTS}):`, status);

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
      const { GetObjectCommand } = await import('@aws-sdk/client-s3');
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
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
  }

  throw new Error('Transcription timeout');
}

/**
 * Lambda handler
 */
export async function handler(event) {
  const requestId = event.requestContext?.requestId || crypto.randomUUID();
  
  console.log('🎤 Transcribe Lambda invoked:', requestId);
  
  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { audio, audioFormat, languageCode, userId } = body;
    
    // Validate input
    if (!audio || !audioFormat || !languageCode || !userId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({
          success: false,
          error: 'Missing required fields: audio, audioFormat, languageCode, userId',
          requestId
        })
      };
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
    
    // Return success response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        text: result.text,
        confidence: result.confidence,
        language: languageCode,
        jobName,
        audioUrl: fileUrl,
        warning: result.warning,
        requestId,
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('❌ Transcription error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: false,
        error: error.message || 'Transcription failed',
        requestId,
        timestamp: new Date().toISOString()
      })
    };
  }
}
