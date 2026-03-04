/**
 * Check a specific transcription job result
 */

import { TranscribeClient, GetTranscriptionJobCommand } from '@aws-sdk/client-transcribe';
import { readFileSync } from 'fs';

// Read .env
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

const accessKeyId = envVars.VITE_AWS_ACCESS_KEY_ID;
const secretAccessKey = envVars.VITE_AWS_SECRET_ACCESS_KEY;
const region = envVars.VITE_AWS_REGION || 'ap-south-1';

const transcribeClient = new TranscribeClient({
  region,
  credentials: { accessKeyId, secretAccessKey }
});

// Check the most recent job
const jobName = 'transcribe-1772439766625';

console.log(`🔍 Checking transcription job: ${jobName}\n`);

try {
  const command = new GetTranscriptionJobCommand({
    TranscriptionJobName: jobName
  });

  const response = await transcribeClient.send(command);
  const job = response.TranscriptionJob;

  console.log('📊 Job Details:');
  console.log('  Status:', job.TranscriptionJobStatus);
  console.log('  Language:', job.LanguageCode);
  console.log('  Media Format:', job.MediaFormat);
  console.log('  Media URI:', job.Media.MediaFileUri);
  console.log('  Created:', job.CreationTime);
  console.log('  Completed:', job.CompletionTime);

  if (job.TranscriptionJobStatus === 'COMPLETED') {
    console.log('\n📄 Fetching transcript...');
    const transcriptUri = job.Transcript.TranscriptFileUri;
    console.log('  URI:', transcriptUri);

    const transcriptResponse = await fetch(transcriptUri);
    const transcriptData = await transcriptResponse.json();

    console.log('\n✅ Transcription Result:');
    console.log('  Text:', transcriptData.results.transcripts[0].transcript);
    
    if (transcriptData.results.items && transcriptData.results.items.length > 0) {
      const confidences = transcriptData.results.items
        .filter(item => item.alternatives && item.alternatives[0])
        .map(item => parseFloat(item.alternatives[0].confidence));
      
      const avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
      console.log('  Confidence:', (avgConfidence * 100).toFixed(1) + '%');
      console.log('  Words detected:', transcriptData.results.items.length);
    }

    console.log('\n📝 Full transcript data:');
    console.log(JSON.stringify(transcriptData, null, 2));
  } else if (job.TranscriptionJobStatus === 'FAILED') {
    console.error('\n❌ Job failed:', job.FailureReason);
  }

} catch (error) {
  console.error('❌ Error:', error.message);
}
