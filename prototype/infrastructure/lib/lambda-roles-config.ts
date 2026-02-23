/**
 * AWS Lambda Execution Roles Configuration for shram-Setu
 */

export const LambdaRolesConfig = {
  // Base Lambda Execution Role
  baseLambdaRole: {
    roleName: 'shramSetuLambdaExecutionRole',
    description: 'Base execution role for all Lambda functions',
    
    // AWS Managed Policies
    managedPolicies: [
      'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
      'arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole',
    ],
    
    // Trust relationship
    assumeRolePolicy: {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: {
            Service: 'lambda.amazonaws.com',
          },
          Action: 'sts:AssumeRole',
        },
      ],
    },
  },

  // Custom IAM Policies
  customPolicies: {
    // DynamoDB Access Policy
    dynamodbAccess: {
      policyName: 'shramSetuDynamoDBAccess',
      description: 'Access to DynamoDB tables',
      statements: [
        {
          Effect: 'Allow',
          Action: [
            'dynamodb:GetItem',
            'dynamodb:PutItem',
            'dynamodb:UpdateItem',
            'dynamodb:DeleteItem',
            'dynamodb:Query',
            'dynamodb:Scan',
            'dynamodb:BatchGetItem',
            'dynamodb:BatchWriteItem',
          ],
          Resource: [
            'arn:aws:dynamodb:*:*:table/shram-setu-users',
            'arn:aws:dynamodb:*:*:table/shram-setu-users/index/*',
            'arn:aws:dynamodb:*:*:table/shram-setu-jobs',
            'arn:aws:dynamodb:*:*:table/shram-setu-jobs/index/*',
            'arn:aws:dynamodb:*:*:table/shram-setu-ratings',
            'arn:aws:dynamodb:*:*:table/shram-setu-ratings/index/*',
            'arn:aws:dynamodb:*:*:table/shram-setu-sync-operations',
            'arn:aws:dynamodb:*:*:table/shram-setu-attendance',
            'arn:aws:dynamodb:*:*:table/shram-setu-attendance/index/*',
            'arn:aws:dynamodb:*:*:table/shram-setu-grievances',
            'arn:aws:dynamodb:*:*:table/shram-setu-grievances/index/*',
          ],
        },
        {
          Effect: 'Allow',
          Action: ['dynamodb:DescribeStream', 'dynamodb:GetRecords', 'dynamodb:GetShardIterator', 'dynamodb:ListStreams'],
          Resource: 'arn:aws:dynamodb:*:*:table/*/stream/*',
        },
      ],
    },

    // S3 Access Policy
    s3Access: {
      policyName: 'shramSetuS3Access',
      description: 'Access to S3 buckets',
      statements: [
        {
          Effect: 'Allow',
          Action: [
            's3:GetObject',
            's3:PutObject',
            's3:DeleteObject',
            's3:ListBucket',
            's3:GetObjectVersion',
          ],
          Resource: [
            'arn:aws:s3:::shram-setu-audio-*',
            'arn:aws:s3:::shram-setu-audio-*/*',
            'arn:aws:s3:::shram-setu-documents-*',
            'arn:aws:s3:::shram-setu-documents-*/*',
          ],
        },
        {
          Effect: 'Allow',
          Action: ['s3:GetBucketLocation', 's3:ListAllMyBuckets'],
          Resource: '*',
        },
      ],
    },

    // RDS Access Policy
    rdsAccess: {
      policyName: 'shramSetuRDSAccess',
      description: 'Access to RDS PostgreSQL',
      statements: [
        {
          Effect: 'Allow',
          Action: [
            'rds-db:connect',
          ],
          Resource: 'arn:aws:rds-db:*:*:dbuser:*/shram_setu_user',
        },
      ],
    },

    // ElastiCache Access Policy
    elasticacheAccess: {
      policyName: 'shramSetuElastiCacheAccess',
      description: 'Access to ElastiCache Redis',
      statements: [
        {
          Effect: 'Allow',
          Action: [
            'elasticache:DescribeCacheClusters',
            'elasticache:DescribeReplicationGroups',
          ],
          Resource: '*',
        },
      ],
    },

    // KMS Access Policy
    kmsAccess: {
      policyName: 'shramSetuKMSAccess',
      description: 'Access to KMS encryption keys',
      statements: [
        {
          Effect: 'Allow',
          Action: [
            'kms:Decrypt',
            'kms:Encrypt',
            'kms:GenerateDataKey',
            'kms:DescribeKey',
          ],
          Resource: 'arn:aws:kms:*:*:key/*',
          Condition: {
            StringEquals: {
              'kms:ViaService': [
                's3.*.amazonaws.com',
                'dynamodb.*.amazonaws.com',
                'rds.*.amazonaws.com',
              ],
            },
          },
        },
      ],
    },

    // AWS AI/ML Services Access Policy
    aiServicesAccess: {
      policyName: 'shramSetuAIServicesAccess',
      description: 'Access to AWS AI/ML services',
      statements: [
        {
          Effect: 'Allow',
          Action: [
            // Amazon Transcribe
            'transcribe:StartTranscriptionJob',
            'transcribe:GetTranscriptionJob',
            'transcribe:ListTranscriptionJobs',
            'transcribe:DeleteTranscriptionJob',
            
            // Amazon Polly
            'polly:SynthesizeSpeech',
            'polly:DescribeVoices',
            
            // Amazon Lex
            'lex:PostText',
            'lex:PostContent',
            'lex:GetSession',
            'lex:PutSession',
            'lex:DeleteSession',
            
            // Amazon Bedrock (for advanced NLU)
            'bedrock:InvokeModel',
            'bedrock:InvokeModelWithResponseStream',
            
            // Amazon Textract
            'textract:AnalyzeDocument',
            'textract:DetectDocumentText',
            'textract:GetDocumentAnalysis',
            'textract:StartDocumentAnalysis',
            
            // Amazon Rekognition
            'rekognition:DetectText',
            'rekognition:DetectLabels',
            'rekognition:DetectModerationLabels',
            
            // Amazon Comprehend
            'comprehend:DetectSentiment',
            'comprehend:DetectEntities',
            'comprehend:DetectKeyPhrases',
            'comprehend:DetectDominantLanguage',
            
            // Amazon Location Service
            'geo:SearchPlaceIndexForPosition',
            'geo:SearchPlaceIndexForText',
            'geo:CalculateRoute',
            'geo:GetPlace',
          ],
          Resource: '*',
        },
      ],
    },

    // Secrets Manager Access Policy
    secretsManagerAccess: {
      policyName: 'shramSetuSecretsManagerAccess',
      description: 'Access to Secrets Manager',
      statements: [
        {
          Effect: 'Allow',
          Action: [
            'secretsmanager:GetSecretValue',
            'secretsmanager:DescribeSecret',
          ],
          Resource: 'arn:aws:secretsmanager:*:*:secret:shram-setu/*',
        },
      ],
    },

    // SNS/SES Access Policy (for notifications)
    notificationAccess: {
      policyName: 'shramSetuNotificationAccess',
      description: 'Access to SNS and SES for notifications',
      statements: [
        {
          Effect: 'Allow',
          Action: [
            'sns:Publish',
            'sns:Subscribe',
            'sns:Unsubscribe',
          ],
          Resource: 'arn:aws:sns:*:*:shram-setu-*',
        },
        {
          Effect: 'Allow',
          Action: [
            'ses:SendEmail',
            'ses:SendRawEmail',
          ],
          Resource: '*',
        },
      ],
    },

    // EventBridge Access Policy
    eventBridgeAccess: {
      policyName: 'shramSetuEventBridgeAccess',
      description: 'Access to EventBridge',
      statements: [
        {
          Effect: 'Allow',
          Action: [
            'events:PutEvents',
          ],
          Resource: 'arn:aws:events:*:*:event-bus/shram-setu-*',
        },
      ],
    },

    // API Gateway Management Access (for WebSocket)
    apiGatewayManagement: {
      policyName: 'shramSetuAPIGatewayManagement',
      description: 'Access to API Gateway Management API',
      statements: [
        {
          Effect: 'Allow',
          Action: [
            'execute-api:ManageConnections',
            'execute-api:Invoke',
          ],
          Resource: 'arn:aws:execute-api:*:*:*/@connections/*',
        },
      ],
    },

    // X-Ray Tracing Policy
    xrayAccess: {
      policyName: 'shramSetuXRayAccess',
      description: 'Access to X-Ray for distributed tracing',
      statements: [
        {
          Effect: 'Allow',
          Action: [
            'xray:PutTraceSegments',
            'xray:PutTelemetryRecords',
          ],
          Resource: '*',
        },
      ],
    },
  },

  // Function-specific role configurations
  functionRoles: {
    // Auth functions need minimal permissions
    authFunctions: {
      policies: ['dynamodbAccess', 'secretsManagerAccess', 'kmsAccess'],
    },

    // Voice functions need AI services
    voiceFunctions: {
      policies: ['dynamodbAccess', 's3Access', 'aiServicesAccess', 'kmsAccess', 'elasticacheAccess'],
    },

    // Job functions need location services
    jobFunctions: {
      policies: ['dynamodbAccess', 'aiServicesAccess', 'eventBridgeAccess', 'kmsAccess'],
    },

    // Ledger functions need RDS and S3
    ledgerFunctions: {
      policies: ['dynamodbAccess', 'rdsAccess', 's3Access', 'aiServicesAccess', 'kmsAccess'],
    },

    // Attendance functions need Redis
    attendanceFunctions: {
      policies: ['dynamodbAccess', 'elasticacheAccess', 'kmsAccess'],
    },

    // Grievance functions need AI and notifications
    grievanceFunctions: {
      policies: ['dynamodbAccess', 's3Access', 'aiServicesAccess', 'notificationAccess', 'kmsAccess'],
    },

    // WebSocket functions need API Gateway management
    websocketFunctions: {
      policies: ['dynamodbAccess', 'apiGatewayManagement', 'kmsAccess'],
    },

    // Sync functions need comprehensive access
    syncFunctions: {
      policies: ['dynamodbAccess', 'elasticacheAccess', 'eventBridgeAccess', 'kmsAccess'],
    },
  },

  // Environment variables for Lambda functions
  environmentVariables: {
    common: {
      NODE_ENV: 'production',
      LOG_LEVEL: 'info',
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    },
    database: {
      USERS_TABLE: 'shram-setu-users',
      JOBS_TABLE: 'shram-setu-jobs',
      RATINGS_TABLE: 'shram-setu-ratings',
      SYNC_TABLE: 'shram-setu-sync-operations',
      ATTENDANCE_TABLE: 'shram-setu-attendance',
      GRIEVANCES_TABLE: 'shram-setu-grievances',
      RDS_ENDPOINT: '${RDS_ENDPOINT}',
      RDS_DATABASE: 'shram_setu_ledger',
      REDIS_ENDPOINT: '${REDIS_ENDPOINT}',
    },
    storage: {
      AUDIO_BUCKET: 'shram-setu-audio-${ACCOUNT_ID}',
      DOCUMENT_BUCKET: 'shram-setu-documents-${ACCOUNT_ID}',
    },
    security: {
      KMS_KEY_ID: '${KMS_KEY_ID}',
      JWT_SECRET_ARN: '${JWT_SECRET_ARN}',
      REDIS_AUTH_TOKEN_ARN: '${REDIS_AUTH_TOKEN_ARN}',
    },
  },

  // Lambda function configuration defaults
  functionDefaults: {
    runtime: 'nodejs18.x',
    timeout: 30, // seconds
    memorySize: 512, // MB
    reservedConcurrentExecutions: 100,
    tracing: 'Active', // X-Ray tracing
    environment: {
      variables: {
        // Merged from environmentVariables
      },
    },
  },
};

