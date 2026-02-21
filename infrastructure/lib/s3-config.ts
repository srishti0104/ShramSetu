/**
 * S3 Bucket Configurations for shram-Setu
 */

export const S3BucketConfig = {
  audioBucket: {
    bucketName: 'shram-setu-audio',
    purpose: 'Store voice recordings for grievances and voice commands',
    encryption: 'KMS',
    versioning: true,
    lifecycleRules: [
      {
        id: 'archive-old-audio',
        enabled: true,
        transitions: [
          {
            storageClass: 'INTELLIGENT_TIERING',
            transitionAfter: 30, // days
          },
          {
            storageClass: 'GLACIER',
            transitionAfter: 180, // days
          },
        ],
        expiration: 365, // days
      },
    ],
    corsRules: [
      {
        allowedOrigins: ['*'], // Update with actual domain in production
        allowedMethods: ['GET', 'PUT', 'POST'],
        allowedHeaders: ['*'],
        maxAge: 3000,
      },
    ],
    publicAccess: {
      blockPublicAcls: true,
      blockPublicPolicy: true,
      ignorePublicAcls: true,
      restrictPublicBuckets: true,
    },
  },

  documentBucket: {
    bucketName: 'shram-setu-documents',
    purpose: 'Store payslip images, receipts, and verification documents',
    encryption: 'KMS',
    versioning: true,
    lifecycleRules: [
      {
        id: 'archive-old-documents',
        enabled: true,
        transitions: [
          {
            storageClass: 'INTELLIGENT_TIERING',
            transitionAfter: 90, // days
          },
        ],
        // No expiration - keep documents indefinitely for compliance
      },
    ],
    corsRules: [
      {
        allowedOrigins: ['*'], // Update with actual domain in production
        allowedMethods: ['GET', 'PUT', 'POST'],
        allowedHeaders: ['*'],
        maxAge: 3000,
      },
    ],
    publicAccess: {
      blockPublicAcls: true,
      blockPublicPolicy: true,
      ignorePublicAcls: true,
      restrictPublicBuckets: true,
    },
  },

  // Folder structure within buckets
  folderStructure: {
    audio: {
      grievances: 'grievances/{userId}/{grievanceId}/',
      voiceCommands: 'voice-commands/{userId}/{sessionId}/',
      transcriptions: 'transcriptions/{userId}/{audioId}/',
    },
    documents: {
      payslips: 'payslips/{workerId}/{year}/{month}/',
      receipts: 'receipts/{transactionId}/',
      verificationDocs: 'verification/{userId}/',
      eShramCards: 'eshram/{userId}/',
    },
  },

  // Pre-signed URL configuration
  presignedUrlConfig: {
    upload: {
      expiresIn: 300, // 5 minutes
      maxFileSize: 5 * 1024 * 1024, // 5MB
    },
    download: {
      expiresIn: 3600, // 1 hour
    },
  },

  // File type restrictions
  allowedFileTypes: {
    audio: ['.mp3', '.wav', '.m4a', '.ogg', '.webm'],
    images: ['.jpg', '.jpeg', '.png', '.webp'],
    documents: ['.pdf', '.jpg', '.jpeg', '.png'],
  },

  // File size limits
  fileSizeLimits: {
    audio: 10 * 1024 * 1024, // 10MB
    image: 5 * 1024 * 1024, // 5MB
    document: 5 * 1024 * 1024, // 5MB
  },
};

/**
 * S3 Event Notifications Configuration
 */
export const S3EventConfig = {
  // Trigger Lambda on payslip upload
  payslipUpload: {
    events: ['s3:ObjectCreated:*'],
    prefix: 'payslips/',
    suffix: '',
    lambdaFunction: 'payslip-processor',
  },

  // Trigger Lambda on grievance audio upload
  grievanceAudioUpload: {
    events: ['s3:ObjectCreated:*'],
    prefix: 'grievances/',
    suffix: '',
    lambdaFunction: 'grievance-transcriber',
  },
};

/**
 * CloudFront Distribution Configuration for S3
 */
export const CloudFrontConfig = {
  enabled: true,
  priceClass: 'PriceClass_200', // Use edge locations in US, Europe, Asia, Middle East, and Africa
  geoRestriction: {
    restrictionType: 'whitelist',
    locations: ['IN'], // India only
  },
  cacheBehaviors: {
    audio: {
      pathPattern: 'audio/*',
      minTTL: 0,
      defaultTTL: 86400, // 1 day
      maxTTL: 31536000, // 1 year
    },
    documents: {
      pathPattern: 'documents/*',
      minTTL: 0,
      defaultTTL: 3600, // 1 hour
      maxTTL: 86400, // 1 day
    },
  },
};

