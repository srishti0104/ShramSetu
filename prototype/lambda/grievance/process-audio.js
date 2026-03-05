/**
 * Process Audio Lambda Function
 * Handles audio transcription using AWS Transcribe
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand } = require('@aws-sdk/client-transcribe');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const transcribeClient = new TranscribeClient({ region: process.env.AWS_REGION });
const s3Client = new S3Client({ region: process.env.AWS_REGION });

const GRIEVANCE_TABLE = process.env.GRIEVANCE_TABLE;
const AUDIO_BUCKET = process.env.AUDIO_BUCKET;

/**
 * CORS headers for API Gateway
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

/**
 * Start transcription job
 */
async function startTranscription(grievanceId, audioKey, languageCode = 'hi-IN') {
  const jobName = `grievance-${grievanceId}-${Date.now()}`;
  const mediaUri = `s3://${AUDIO_BUCKET}/${audioKey}`;

  const params = {
    TranscriptionJobName: jobName,
    LanguageCode: languageCode,
    MediaFormat: 'webm',
    Media: {
      MediaFileUri: mediaUri,
    },
    OutputBucketName: AUDIO_BUCKET,
    OutputKey: `transcriptions/${grievanceId}/`,
    Settings: {
      ShowSpeakerLabels: false,
      MaxSpeakerLabels: 1,
    },
  };

  const command = new StartTranscriptionJobCommand(params);
  const result = await transcribeClient.send(command);
  
  return {
    jobName,
    status: result.TranscriptionJob.TranscriptionJobStatus,
  };
}

/**
 * Get transcription result
 */
async function getTranscriptionResult(jobName) {
  const command = new GetTranscriptionJobCommand({
    TranscriptionJobName: jobName,
  });

  const result = await transcribeClient.send(command);
  const job = result.TranscriptionJob;

  if (job.TranscriptionJobStatus === 'COMPLETED') {
    // Get the transcription from S3
    const transcriptUri = job.Transcript.TranscriptFileUri;
    const bucketKey = transcriptUri.split(`${AUDIO_BUCKET}/`)[1];
    
    const getObjectCommand = new GetObjectCommand({
      Bucket: AUDIO_BUCKET,
      Key: bucketKey,
    });

    const response = await s3Client.send(getObjectCommand);
    const transcriptData = JSON.parse(await response.Body.transformToString());
    
    return {
      status: 'COMPLETED',
      transcript: transcriptData.results.transcripts[0].transcript,
      confidence: transcriptData.results.transcripts[0].confidence || 0.8,
      languageCode: job.LanguageCode,
    };
  }

  return {
    status: job.TranscriptionJobStatus,
    transcript: null,
  };
}

/**
 * Update grievance with transcription
 */
async function updateGrievanceWithTranscription(grievanceId, submittedAt, transcription) {
  const updateCommand = new UpdateCommand({
    TableName: GRIEVANCE_TABLE,
    Key: {
      grievanceId,
      submittedAt,
    },
    UpdateExpression: 'SET transcription = :transcription, audioProcessed = :processed, updatedAt = :updatedAt',
    ExpressionAttributeValues: {
      ':transcription': transcription.transcript,
      ':processed': true,
      ':updatedAt': new Date().toISOString(),
    },
  });

  await docClient.send(updateCommand);
}

/**
 * Main Lambda handler
 */
exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

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
    const { grievanceId, submittedAt, action, jobName, languageCode } = body;

    if (!grievanceId || !submittedAt) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Missing required fields: grievanceId, submittedAt'
        }),
      };
    }

    if (action === 'start') {
      // Start transcription job
      const audioKey = `grievances/${grievanceId}/audio.webm`;
      const transcriptionJob = await startTranscription(grievanceId, audioKey, languageCode || 'hi-IN');
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          jobName: transcriptionJob.jobName,
          status: transcriptionJob.status,
          message: 'Transcription job started successfully',
        }),
      };

    } else if (action === 'check' && jobName) {
      // Check transcription status
      const result = await getTranscriptionResult(jobName);
      
      if (result.status === 'COMPLETED') {
        // Update grievance with transcription
        await updateGrievanceWithTranscription(grievanceId, submittedAt, result);
        
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            status: 'COMPLETED',
            transcription: result.transcript,
            confidence: result.confidence,
            message: 'Audio transcribed successfully',
          }),
        };
      }

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          status: result.status,
          message: `Transcription job is ${result.status.toLowerCase()}`,
        }),
      };

    } else {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Invalid action. Use "start" or "check"',
        }),
      };
    }

  } catch (error) {
    console.error('Error processing audio:', error);
    
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to process audio. Please try again.',
      }),
    };
  }
};