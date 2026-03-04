/**
 * AWS Transcribe Setup Diagnostic Script
 * 
 * Run this to verify your AWS Transcribe configuration
 * Usage: node test-transcribe-setup.js
 */

import { TranscribeClient, ListTranscriptionJobsCommand } from '@aws-sdk/client-transcribe';
import { S3Client, ListBucketsCommand, GetBucketLocationCommand } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

console.log('🔍 AWS Transcribe Setup Diagnostic\n');
console.log('=' .repeat(50));

// Check environment variables
console.log('\n1️⃣ Checking Environment Variables...');
const accessKeyId = process.env.VITE_AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.VITE_AWS_SECRET_ACCESS_KEY;
const region = process.env.VITE_AWS_REGION;
const bucketName = process.env.VITE_S3_BUCKET_NAME;

if (!accessKeyId || !secretAccessKey) {
  console.error('❌ AWS credentials not found in .env file');
  process.exit(1);
}

console.log('✅ AWS Access Key ID:', accessKeyId.substring(0, 10) + '...');
console.log('✅ AWS Region:', region);
console.log('✅ S3 Bucket Name:', bucketName);

// Test S3 connection
console.log('\n2️⃣ Testing S3 Connection...');
const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey
  }
});

try {
  const listBucketsCommand = new ListBucketsCommand({});
  const bucketsResponse = await s3Client.send(listBucketsCommand);
  console.log('✅ S3 connection successful');
  console.log(`📦 Found ${bucketsResponse.Buckets.length} buckets`);
  
  // Check if our bucket exists
  const bucketExists = bucketsResponse.Buckets.some(b => b.Name === bucketName);
  if (bucketExists) {
    console.log(`✅ Bucket "${bucketName}" exists`);
  } else {
    console.error(`❌ Bucket "${bucketName}" not found`);
    console.log('Available buckets:', bucketsResponse.Buckets.map(b => b.Name).join(', '));
  }
} catch (error) {
  console.error('❌ S3 connection failed:', error.message);
  process.exit(1);
}

// Test Transcribe connection
console.log('\n3️⃣ Testing Transcribe Connection...');
const transcribeClient = new TranscribeClient({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey
  }
});

try {
  const listJobsCommand = new ListTranscriptionJobsCommand({
    MaxResults: 5
  });
  const jobsResponse = await transcribeClient.send(listJobsCommand);
  console.log('✅ Transcribe connection successful');
  console.log(`📝 Recent transcription jobs: ${jobsResponse.TranscriptionJobSummaries?.length || 0}`);
  
  if (jobsResponse.TranscriptionJobSummaries && jobsResponse.TranscriptionJobSummaries.length > 0) {
    console.log('\nRecent jobs:');
    jobsResponse.TranscriptionJobSummaries.forEach((job, index) => {
      console.log(`  ${index + 1}. ${job.TranscriptionJobName}`);
      console.log(`     Status: ${job.TranscriptionJobStatus}`);
      console.log(`     Language: ${job.LanguageCode}`);
      if (job.FailureReason) {
        console.log(`     ❌ Failure: ${job.FailureReason}`);
      }
    });
  }
} catch (error) {
  console.error('❌ Transcribe connection failed:', error.message);
  console.error('Error code:', error.name);
  process.exit(1);
}

// Check IAM permissions
console.log('\n4️⃣ Checking Permissions...');
console.log('✅ Basic permissions verified (able to list jobs and buckets)');
console.log('\n⚠️  Make sure your IAM user has these policies:');
console.log('   - AmazonTranscribeFullAccess');
console.log('   - AmazonS3FullAccess (or at least read/write to your bucket)');

// Check S3 bucket configuration
console.log('\n5️⃣ S3 Bucket Configuration Checklist:');
console.log('   □ Bucket exists in the correct region');
console.log('   □ Bucket has public access enabled (or proper bucket policy)');
console.log('   □ Bucket policy allows Transcribe service to read objects');
console.log('   □ CORS configuration allows browser uploads');

console.log('\n6️⃣ Recommended S3 Bucket Policy:');
console.log(`
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowTranscribeAccess",
      "Effect": "Allow",
      "Principal": {
        "Service": "transcribe.amazonaws.com"
      },
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::${bucketName}/*"
    }
  ]
}
`);

console.log('\n7️⃣ Recommended CORS Configuration:');
console.log(`
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
`);

console.log('\n' + '='.repeat(50));
console.log('✅ Diagnostic complete!');
console.log('\nIf all checks passed, your AWS Transcribe setup is ready.');
console.log('If you see errors, follow the recommendations above.\n');
