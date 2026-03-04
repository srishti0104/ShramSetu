/**
 * Simple AWS Setup Checker
 * Run: node check-aws-setup.js
 */

import { TranscribeClient, ListTranscriptionJobsCommand } from '@aws-sdk/client-transcribe';
import { S3Client, ListBucketsCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';

console.log('🔍 AWS Transcribe Setup Checker\n');
console.log('='.repeat(50));

// Read .env file manually
const envContent = readFileSync('.env', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex > 0) {
      const key = trimmed.substring(0, eqIndex).trim();
      const value = trimmed.substring(eqIndex + 1).trim();
      if (key && value) {
        envVars[key] = value;
      }
    }
  }
});

const accessKeyId = envVars.VITE_AWS_ACCESS_KEY_ID;
const secretAccessKey = envVars.VITE_AWS_SECRET_ACCESS_KEY;
const region = envVars.VITE_AWS_REGION || 'ap-south-1';
const bucketName = envVars.VITE_S3_BUCKET_NAME;

console.log('\n1️⃣ Environment Variables:');
console.log('✅ Access Key:', accessKeyId ? accessKeyId.substring(0, 10) + '...' : '❌ NOT FOUND');
console.log('✅ Secret Key:', secretAccessKey ? '***' + secretAccessKey.substring(secretAccessKey.length - 4) : '❌ NOT FOUND');
console.log('✅ Region:', region);
console.log('✅ Bucket:', bucketName);

if (!accessKeyId || !secretAccessKey) {
  console.error('\n❌ AWS credentials not found in .env file');
  process.exit(1);
}

// Test S3
console.log('\n2️⃣ Testing S3 Connection...');
const s3Client = new S3Client({
  region,
  credentials: { accessKeyId, secretAccessKey }
});

try {
  const listBucketsCommand = new ListBucketsCommand({});
  const bucketsResponse = await s3Client.send(listBucketsCommand);
  console.log('✅ S3 connection successful');
  console.log(`📦 Found ${bucketsResponse.Buckets.length} buckets`);
  
  const bucketExists = bucketsResponse.Buckets.some(b => b.Name === bucketName);
  if (bucketExists) {
    console.log(`✅ Bucket "${bucketName}" exists`);
    
    // Check bucket access
    try {
      const headCommand = new HeadBucketCommand({ Bucket: bucketName });
      await s3Client.send(headCommand);
      console.log('✅ Bucket is accessible');
    } catch (err) {
      console.error('❌ Cannot access bucket:', err.message);
    }
  } else {
    console.error(`❌ Bucket "${bucketName}" NOT FOUND`);
    console.log('Available buckets:', bucketsResponse.Buckets.map(b => b.Name).join(', '));
  }
} catch (error) {
  console.error('❌ S3 connection failed:', error.message);
  console.error('Error code:', error.name);
}

// Test Transcribe
console.log('\n3️⃣ Testing Transcribe Connection...');
const transcribeClient = new TranscribeClient({
  region,
  credentials: { accessKeyId, secretAccessKey }
});

try {
  const listJobsCommand = new ListTranscriptionJobsCommand({ MaxResults: 5 });
  const jobsResponse = await transcribeClient.send(listJobsCommand);
  console.log('✅ Transcribe connection successful');
  console.log(`📝 Recent jobs: ${jobsResponse.TranscriptionJobSummaries?.length || 0}`);
  
  if (jobsResponse.TranscriptionJobSummaries && jobsResponse.TranscriptionJobSummaries.length > 0) {
    console.log('\n📋 Recent Transcription Jobs:');
    jobsResponse.TranscriptionJobSummaries.slice(0, 3).forEach((job, i) => {
      console.log(`\n  ${i + 1}. ${job.TranscriptionJobName}`);
      console.log(`     Status: ${job.TranscriptionJobStatus}`);
      console.log(`     Language: ${job.LanguageCode}`);
      console.log(`     Created: ${job.CreationTime?.toLocaleString()}`);
      if (job.FailureReason) {
        console.log(`     ❌ Failure: ${job.FailureReason}`);
      }
    });
  }
} catch (error) {
  console.error('❌ Transcribe connection failed:', error.message);
  console.error('Error code:', error.name);
}

console.log('\n' + '='.repeat(50));
console.log('✅ Diagnostic complete!\n');
