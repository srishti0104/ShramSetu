/**
 * Direct Transcribe Lambda Function
 * Handles direct audio transcription for grievance system
 */

const { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand } = require('@aws-sdk/client-transcribe');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');

const transcribeClient = new TranscribeClient({ region: process.env.AWS_REGION });
const s3Client = new S3Client({ region: process.env.AWS_REGION });

const AUDIO_BUCKET = process.env.AUDIO_BUCKET || 'shram-setu-uploads-808840719701';

/**
 * CORS headers for API Gateway
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

/**
 * Upload audio to S3
 */
async function uploadAudioToS3(audioBase64, audioFormat, userId) {
  const buffer = Buffer.from(audioBase64, 'base64');
  const fileName = `transcribe/${userId}/${Date.now()}.${audioFormat}`;
  
  const command = new PutObjectCommand({
    Bucket: AUDIO_BUCKET,
    Key: fileName,
    Body: buffer,
    ContentType: `audio/${audioFormat}`,
    Metadata: {
      uploadedBy: userId,
      uploadedAt: new Date().toISOString()
    }
  });

  await s3Client.send(command);
  
  const fileUrl = `https://${AUDIO_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  
  console.log('✅ Audio uploaded to S3:', fileUrl);
  
  return { fileUrl, fileName };
}

/**
 * Start transcription job
 */
async function startTranscriptionJob(fileUrl, languageCode, audioFormat) {
  const jobName = `direct-transcribe-${Date.now()}`;
  
  const command = new StartTranscriptionJobCommand({
    TranscriptionJobName: jobName,
    LanguageCode: languageCode,
    MediaFormat: audioFormat,
    Media: {
      MediaFileUri: fileUrl
    },
    OutputBucketName: AUDIO_BUCKET,
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
      const urlParts = new URL(transcriptUri);
      const pathParts = urlParts.pathname.split('/').filter(p => p);
      
      // If first part is bucket name, remove it
      const transcriptKey = pathParts[0] === AUDIO_BUCKET ? pathParts.slice(1).join('/') : pathParts.join('/');
      
      console.log('📄 Fetching transcript from S3:', transcriptKey);
      
      // Fetch from S3 using SDK
      const getCommand = new GetObjectCommand({
        Bucket: AUDIO_BUCKET,
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

/**
 * Main Lambda handler
 */
exports.handler = async (event) => {
  console.log('Received direct transcribe event:', JSON.stringify(event, null, 2));

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { audio, audioFormat, languageCode, userId } = body;

    // Validate input
    if (!audio || !audioFormat || !languageCode || !userId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: 'Missing required fields: audio, audioFormat, languageCode, userId'
        }),
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
    
    console.log('✅ Direct transcription complete!');
    
    // Return success response
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        text: result.text,
        confidence: result.confidence,
        language: languageCode,
        jobName,
        audioUrl: fileUrl,
        warning: result.warning,
        timestamp: new Date().toISOString()
      }),
    };

  } catch (error) {
    console.error('Error in direct transcription:', error);
    
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to transcribe audio. Please try again.',
      }),
    };
  }
};