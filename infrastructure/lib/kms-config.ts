/**
 * AWS KMS Configuration for Shramik-Setu
 */

export const KMSConfig = {
  // Master encryption key
  masterKey: {
    alias: 'alias/shramik-setu-master-key',
    description: 'Master encryption key for Shramik-Setu platform',
    enableKeyRotation: true,
    rotationPeriod: 365, // days
    removalPolicy: 'RETAIN', // Never delete in production
    
    // Key policy
    keyPolicy: {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'Enable IAM User Permissions',
          Effect: 'Allow',
          Principal: {
            AWS: 'arn:aws:iam::${ACCOUNT_ID}:root',
          },
          Action: 'kms:*',
          Resource: '*',
        },
        {
          Sid: 'Allow services to use the key',
          Effect: 'Allow',
          Principal: {
            Service: [
              's3.amazonaws.com',
              'dynamodb.amazonaws.com',
              'rds.amazonaws.com',
              'elasticache.amazonaws.com',
              'lambda.amazonaws.com',
              'logs.amazonaws.com',
            ],
          },
          Action: [
            'kms:Decrypt',
            'kms:Encrypt',
            'kms:GenerateDataKey',
            'kms:DescribeKey',
          ],
          Resource: '*',
        },
      ],
    },
  },

  // Data classification and encryption requirements
  dataClassification: {
    // Highly Sensitive - Always encrypted
    highlySensitive: {
      data: [
        'E-Shram card numbers',
        'Mobile numbers',
        'Biometric data',
        'Financial transaction details',
        'Bank account information',
        'Aadhaar numbers (if collected)',
      ],
      encryption: 'KMS with customer-managed key',
      keyRotation: true,
      auditLogging: true,
    },

    // Sensitive - Encrypted
    sensitive: {
      data: [
        'User profiles',
        'Job applications',
        'Ratings and reviews',
        'Attendance records',
        'Voice recordings',
        'Payslip images',
      ],
      encryption: 'KMS with customer-managed key',
      keyRotation: true,
      auditLogging: true,
    },

    // Internal - Standard encryption
    internal: {
      data: [
        'Job postings',
        'System logs',
        'Analytics data',
      ],
      encryption: 'AWS managed keys',
      keyRotation: false,
      auditLogging: false,
    },
  },

  // Encryption at rest configuration
  encryptionAtRest: {
    dynamodb: {
      enabled: true,
      keyType: 'CUSTOMER_MANAGED',
      keyAlias: 'alias/shramik-setu-master-key',
    },
    rds: {
      enabled: true,
      keyType: 'CUSTOMER_MANAGED',
      keyAlias: 'alias/shramik-setu-master-key',
    },
    s3: {
      enabled: true,
      keyType: 'CUSTOMER_MANAGED',
      keyAlias: 'alias/shramik-setu-master-key',
      bucketKeyEnabled: true, // Reduce KMS costs
    },
    elasticache: {
      enabled: true,
      keyType: 'AWS_MANAGED',
    },
    cloudwatchLogs: {
      enabled: true,
      keyType: 'CUSTOMER_MANAGED',
      keyAlias: 'alias/shramik-setu-master-key',
    },
  },

  // Encryption in transit
  encryptionInTransit: {
    apiGateway: {
      protocol: 'TLS 1.3',
      certificateType: 'ACM',
    },
    rds: {
      sslMode: 'require',
      certificateVerification: true,
    },
    elasticache: {
      transitEncryption: true,
      authToken: true,
    },
    lambda: {
      environmentVariables: 'encrypted',
    },
  },

  // Key grants for services
  keyGrants: {
    lambda: {
      grantee: 'arn:aws:iam::${ACCOUNT_ID}:role/ShramikSetuLambdaExecutionRole',
      operations: ['Decrypt', 'Encrypt', 'GenerateDataKey', 'DescribeKey'],
    },
    s3: {
      grantee: 'arn:aws:iam::${ACCOUNT_ID}:role/ShramikSetuLambdaExecutionRole',
      operations: ['Decrypt', 'Encrypt', 'GenerateDataKey'],
    },
  },

  // Key monitoring and alerts
  monitoring: {
    cloudWatchMetrics: [
      'NumberOfDecryptCalls',
      'NumberOfEncryptCalls',
      'NumberOfGenerateDataKeyCalls',
    ],
    alarms: {
      unusualActivity: {
        metric: 'NumberOfDecryptCalls',
        threshold: 10000,
        period: 300, // 5 minutes
        evaluationPeriods: 2,
      },
    },
  },

  // Compliance and audit
  compliance: {
    cloudTrailLogging: true,
    keyUsageLogging: true,
    accessLogging: true,
    retentionPeriod: 2555, // 7 years for compliance
  },
};
