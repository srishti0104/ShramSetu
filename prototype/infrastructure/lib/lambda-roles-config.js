"use strict";
/**
 * AWS Lambda Execution Roles Configuration for shram-Setu
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LambdaRolesConfig = void 0;
exports.LambdaRolesConfig = {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFtYmRhLXJvbGVzLWNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxhbWJkYS1yb2xlcy1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOzs7QUFFVSxRQUFBLGlCQUFpQixHQUFHO0lBQy9CLDZCQUE2QjtJQUM3QixjQUFjLEVBQUU7UUFDZCxRQUFRLEVBQUUsOEJBQThCO1FBQ3hDLFdBQVcsRUFBRSw4Q0FBOEM7UUFFM0QsdUJBQXVCO1FBQ3ZCLGVBQWUsRUFBRTtZQUNmLGtFQUFrRTtZQUNsRSxzRUFBc0U7U0FDdkU7UUFFRCxxQkFBcUI7UUFDckIsZ0JBQWdCLEVBQUU7WUFDaEIsT0FBTyxFQUFFLFlBQVk7WUFDckIsU0FBUyxFQUFFO2dCQUNUO29CQUNFLE1BQU0sRUFBRSxPQUFPO29CQUNmLFNBQVMsRUFBRTt3QkFDVCxPQUFPLEVBQUUsc0JBQXNCO3FCQUNoQztvQkFDRCxNQUFNLEVBQUUsZ0JBQWdCO2lCQUN6QjthQUNGO1NBQ0Y7S0FDRjtJQUVELHNCQUFzQjtJQUN0QixjQUFjLEVBQUU7UUFDZCx5QkFBeUI7UUFDekIsY0FBYyxFQUFFO1lBQ2QsVUFBVSxFQUFFLHlCQUF5QjtZQUNyQyxXQUFXLEVBQUUsMkJBQTJCO1lBQ3hDLFVBQVUsRUFBRTtnQkFDVjtvQkFDRSxNQUFNLEVBQUUsT0FBTztvQkFDZixNQUFNLEVBQUU7d0JBQ04sa0JBQWtCO3dCQUNsQixrQkFBa0I7d0JBQ2xCLHFCQUFxQjt3QkFDckIscUJBQXFCO3dCQUNyQixnQkFBZ0I7d0JBQ2hCLGVBQWU7d0JBQ2YsdUJBQXVCO3dCQUN2Qix5QkFBeUI7cUJBQzFCO29CQUNELFFBQVEsRUFBRTt3QkFDUiw2Q0FBNkM7d0JBQzdDLHFEQUFxRDt3QkFDckQsNENBQTRDO3dCQUM1QyxvREFBb0Q7d0JBQ3BELCtDQUErQzt3QkFDL0MsdURBQXVEO3dCQUN2RCx1REFBdUQ7d0JBQ3ZELGtEQUFrRDt3QkFDbEQsMERBQTBEO3dCQUMxRCxr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O1FBQ3JCLE9BQU8sRUFBRSxFQUFFLEVBQUUsVUFBVTtRQUN2QixVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUs7UUFDdEIsNEJBQTRCLEVBQUUsR0FBRztRQUNqQyxPQUFPLEVBQUUsUUFBUSxFQUFFLGdCQUFnQjtRQUNuQyxXQUFXLEVBQUU7WUFDWCxTQUFTLEVBQUU7WUFDVCxtQ0FBbUM7YUFDcEM7U0FDRjtLQUNGO0NBQ0YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBBV1MgTGFtYmRhIEV4ZWN1dGlvbiBSb2xlcyBDb25maWd1cmF0aW9uIGZvciBzaHJhbS1TZXR1XHJcbiAqL1xyXG5cclxuZXhwb3J0IGNvbnN0IExhbWJkYVJvbGVzQ29uZmlnID0ge1xyXG4gIC8vIEJhc2UgTGFtYmRhIEV4ZWN1dGlvbiBSb2xlXHJcbiAgYmFzZUxhbWJkYVJvbGU6IHtcclxuICAgIHJvbGVOYW1lOiAnc2hyYW1TZXR1TGFtYmRhRXhlY3V0aW9uUm9sZScsXHJcbiAgICBkZXNjcmlwdGlvbjogJ0Jhc2UgZXhlY3V0aW9uIHJvbGUgZm9yIGFsbCBMYW1iZGEgZnVuY3Rpb25zJyxcclxuICAgIFxyXG4gICAgLy8gQVdTIE1hbmFnZWQgUG9saWNpZXNcclxuICAgIG1hbmFnZWRQb2xpY2llczogW1xyXG4gICAgICAnYXJuOmF3czppYW06OmF3czpwb2xpY3kvc2VydmljZS1yb2xlL0FXU0xhbWJkYUJhc2ljRXhlY3V0aW9uUm9sZScsXHJcbiAgICAgICdhcm46YXdzOmlhbTo6YXdzOnBvbGljeS9zZXJ2aWNlLXJvbGUvQVdTTGFtYmRhVlBDQWNjZXNzRXhlY3V0aW9uUm9sZScsXHJcbiAgICBdLFxyXG4gICAgXHJcbiAgICAvLyBUcnVzdCByZWxhdGlvbnNoaXBcclxuICAgIGFzc3VtZVJvbGVQb2xpY3k6IHtcclxuICAgICAgVmVyc2lvbjogJzIwMTItMTAtMTcnLFxyXG4gICAgICBTdGF0ZW1lbnQ6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBFZmZlY3Q6ICdBbGxvdycsXHJcbiAgICAgICAgICBQcmluY2lwYWw6IHtcclxuICAgICAgICAgICAgU2VydmljZTogJ2xhbWJkYS5hbWF6b25hd3MuY29tJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBBY3Rpb246ICdzdHM6QXNzdW1lUm9sZScsXHJcbiAgICAgICAgfSxcclxuICAgICAgXSxcclxuICAgIH0sXHJcbiAgfSxcclxuXHJcbiAgLy8gQ3VzdG9tIElBTSBQb2xpY2llc1xyXG4gIGN1c3RvbVBvbGljaWVzOiB7XHJcbiAgICAvLyBEeW5hbW9EQiBBY2Nlc3MgUG9saWN5XHJcbiAgICBkeW5hbW9kYkFjY2Vzczoge1xyXG4gICAgICBwb2xpY3lOYW1lOiAnc2hyYW1TZXR1RHluYW1vREJBY2Nlc3MnLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ0FjY2VzcyB0byBEeW5hbW9EQiB0YWJsZXMnLFxyXG4gICAgICBzdGF0ZW1lbnRzOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgRWZmZWN0OiAnQWxsb3cnLFxyXG4gICAgICAgICAgQWN0aW9uOiBbXHJcbiAgICAgICAgICAgICdkeW5hbW9kYjpHZXRJdGVtJyxcclxuICAgICAgICAgICAgJ2R5bmFtb2RiOlB1dEl0ZW0nLFxyXG4gICAgICAgICAgICAnZHluYW1vZGI6VXBkYXRlSXRlbScsXHJcbiAgICAgICAgICAgICdkeW5hbW9kYjpEZWxldGVJdGVtJyxcclxuICAgICAgICAgICAgJ2R5bmFtb2RiOlF1ZXJ5JyxcclxuICAgICAgICAgICAgJ2R5bmFtb2RiOlNjYW4nLFxyXG4gICAgICAgICAgICAnZHluYW1vZGI6QmF0Y2hHZXRJdGVtJyxcclxuICAgICAgICAgICAgJ2R5bmFtb2RiOkJhdGNoV3JpdGVJdGVtJyxcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgICBSZXNvdXJjZTogW1xyXG4gICAgICAgICAgICAnYXJuOmF3czpkeW5hbW9kYjoqOio6dGFibGUvc2hyYW0tc2V0dS11c2VycycsXHJcbiAgICAgICAgICAgICdhcm46YXdzOmR5bmFtb2RiOio6Kjp0YWJsZS9zaHJhbS1zZXR1LXVzZXJzL2luZGV4LyonLFxyXG4gICAgICAgICAgICAnYXJuOmF3czpkeW5hbW9kYjoqOio6dGFibGUvc2hyYW0tc2V0dS1qb2JzJyxcclxuICAgICAgICAgICAgJ2Fybjphd3M6ZHluYW1vZGI6KjoqOnRhYmxlL3NocmFtLXNldHUtam9icy9pbmRleC8qJyxcclxuICAgICAgICAgICAgJ2Fybjphd3M6ZHluYW1vZGI6KjoqOnRhYmxlL3NocmFtLXNldHUtcmF0aW5ncycsXHJcbiAgICAgICAgICAgICdhcm46YXdzOmR5bmFtb2RiOio6Kjp0YWJsZS9zaHJhbS1zZXR1LXJhdGluZ3MvaW5kZXgvKicsXHJcbiAgICAgICAgICAgICdhcm46YXdzOmR5bmFtb2RiOio6Kjp0YWJsZS9zaHJhbS1zZXR1LXN5bmMtb3BlcmF0aW9ucycsXHJcbiAgICAgICAgICAgICdhcm46YXdzOmR5bmFtb2RiOio6Kjp0YWJsZS9zaHJhbS1zZXR1LWF0dGVuZGFuY2UnLFxyXG4gICAgICAgICAgICAnYXJuOmF3czpkeW5hbW9kYjoqOio6dGFibGUvc2hyYW0tc2V0dS1hdHRlbmRhbmNlL2luZGV4LyonLFxyXG4gICAgICAgICAgICAnYXJuOmF3czpkeW5hbW9kYjoqOio6dGFibGUvc2hyYW0tc2V0dS1ncmlldmFuY2VzJyxcclxuICAgICAgICAgICAgJ2Fybjphd3M6ZHluYW1vZGI6KjoqOnRhYmxlL3NocmFtLXNldHUtZ3JpZXZhbmNlcy9pbmRleC8qJyxcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBFZmZlY3Q6ICdBbGxvdycsXHJcbiAgICAgICAgICBBY3Rpb246IFsnZHluYW1vZGI6RGVzY3JpYmVTdHJlYW0nLCAnZHluYW1vZGI6R2V0UmVjb3JkcycsICdkeW5hbW9kYjpHZXRTaGFyZEl0ZXJhdG9yJywgJ2R5bmFtb2RiOkxpc3RTdHJlYW1zJ10sXHJcbiAgICAgICAgICBSZXNvdXJjZTogJ2Fybjphd3M6ZHluYW1vZGI6KjoqOnRhYmxlLyovc3RyZWFtLyonLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIF0sXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIFMzIEFjY2VzcyBQb2xpY3lcclxuICAgIHMzQWNjZXNzOiB7XHJcbiAgICAgIHBvbGljeU5hbWU6ICdzaHJhbVNldHVTM0FjY2VzcycsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiAnQWNjZXNzIHRvIFMzIGJ1Y2tldHMnLFxyXG4gICAgICBzdGF0ZW1lbnRzOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgRWZmZWN0OiAnQWxsb3cnLFxyXG4gICAgICAgICAgQWN0aW9uOiBbXHJcbiAgICAgICAgICAgICdzMzpHZXRPYmplY3QnLFxyXG4gICAgICAgICAgICAnczM6UHV0T2JqZWN0JyxcclxuICAgICAgICAgICAgJ3MzOkRlbGV0ZU9iamVjdCcsXHJcbiAgICAgICAgICAgICdzMzpMaXN0QnVja2V0JyxcclxuICAgICAgICAgICAgJ3MzOkdldE9iamVjdFZlcnNpb24nLFxyXG4gICAgICAgICAgXSxcclxuICAgICAgICAgIFJlc291cmNlOiBbXHJcbiAgICAgICAgICAgICdhcm46YXdzOnMzOjo6c2hyYW0tc2V0dS1hdWRpby0qJyxcclxuICAgICAgICAgICAgJ2Fybjphd3M6czM6OjpzaHJhbS1zZXR1LWF1ZGlvLSovKicsXHJcbiAgICAgICAgICAgICdhcm46YXdzOnMzOjo6c2hyYW0tc2V0dS1kb2N1bWVudHMtKicsXHJcbiAgICAgICAgICAgICdhcm46YXdzOnMzOjo6c2hyYW0tc2V0dS1kb2N1bWVudHMtKi8qJyxcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBFZmZlY3Q6ICdBbGxvdycsXHJcbiAgICAgICAgICBBY3Rpb246IFsnczM6R2V0QnVja2V0TG9jYXRpb24nLCAnczM6TGlzdEFsbE15QnVja2V0cyddLFxyXG4gICAgICAgICAgUmVzb3VyY2U6ICcqJyxcclxuICAgICAgICB9LFxyXG4gICAgICBdLFxyXG4gICAgfSxcclxuXHJcbiAgICAvLyBSRFMgQWNjZXNzIFBvbGljeVxyXG4gICAgcmRzQWNjZXNzOiB7XHJcbiAgICAgIHBvbGljeU5hbWU6ICdzaHJhbVNldHVSRFNBY2Nlc3MnLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ0FjY2VzcyB0byBSRFMgUG9zdGdyZVNRTCcsXHJcbiAgICAgIHN0YXRlbWVudHM6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBFZmZlY3Q6ICdBbGxvdycsXHJcbiAgICAgICAgICBBY3Rpb246IFtcclxuICAgICAgICAgICAgJ3Jkcy1kYjpjb25uZWN0JyxcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgICBSZXNvdXJjZTogJ2Fybjphd3M6cmRzLWRiOio6KjpkYnVzZXI6Ki9zaHJhbV9zZXR1X3VzZXInLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIF0sXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIEVsYXN0aUNhY2hlIEFjY2VzcyBQb2xpY3lcclxuICAgIGVsYXN0aWNhY2hlQWNjZXNzOiB7XHJcbiAgICAgIHBvbGljeU5hbWU6ICdzaHJhbVNldHVFbGFzdGlDYWNoZUFjY2VzcycsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiAnQWNjZXNzIHRvIEVsYXN0aUNhY2hlIFJlZGlzJyxcclxuICAgICAgc3RhdGVtZW50czogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIEVmZmVjdDogJ0FsbG93JyxcclxuICAgICAgICAgIEFjdGlvbjogW1xyXG4gICAgICAgICAgICAnZWxhc3RpY2FjaGU6RGVzY3JpYmVDYWNoZUNsdXN0ZXJzJyxcclxuICAgICAgICAgICAgJ2VsYXN0aWNhY2hlOkRlc2NyaWJlUmVwbGljYXRpb25Hcm91cHMnLFxyXG4gICAgICAgICAgXSxcclxuICAgICAgICAgIFJlc291cmNlOiAnKicsXHJcbiAgICAgICAgfSxcclxuICAgICAgXSxcclxuICAgIH0sXHJcblxyXG4gICAgLy8gS01TIEFjY2VzcyBQb2xpY3lcclxuICAgIGttc0FjY2Vzczoge1xyXG4gICAgICBwb2xpY3lOYW1lOiAnc2hyYW1TZXR1S01TQWNjZXNzJyxcclxuICAgICAgZGVzY3JpcHRpb246ICdBY2Nlc3MgdG8gS01TIGVuY3J5cHRpb24ga2V5cycsXHJcbiAgICAgIHN0YXRlbWVudHM6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBFZmZlY3Q6ICdBbGxvdycsXHJcbiAgICAgICAgICBBY3Rpb246IFtcclxuICAgICAgICAgICAgJ2ttczpEZWNyeXB0JyxcclxuICAgICAgICAgICAgJ2ttczpFbmNyeXB0JyxcclxuICAgICAgICAgICAgJ2ttczpHZW5lcmF0ZURhdGFLZXknLFxyXG4gICAgICAgICAgICAna21zOkRlc2NyaWJlS2V5JyxcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgICBSZXNvdXJjZTogJ2Fybjphd3M6a21zOio6KjprZXkvKicsXHJcbiAgICAgICAgICBDb25kaXRpb246IHtcclxuICAgICAgICAgICAgU3RyaW5nRXF1YWxzOiB7XHJcbiAgICAgICAgICAgICAgJ2ttczpWaWFTZXJ2aWNlJzogW1xyXG4gICAgICAgICAgICAgICAgJ3MzLiouYW1hem9uYXdzLmNvbScsXHJcbiAgICAgICAgICAgICAgICAnZHluYW1vZGIuKi5hbWF6b25hd3MuY29tJyxcclxuICAgICAgICAgICAgICAgICdyZHMuKi5hbWF6b25hd3MuY29tJyxcclxuICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICBdLFxyXG4gICAgfSxcclxuXHJcbiAgICAvLyBBV1MgQUkvTUwgU2VydmljZXMgQWNjZXNzIFBvbGljeVxyXG4gICAgYWlTZXJ2aWNlc0FjY2Vzczoge1xyXG4gICAgICBwb2xpY3lOYW1lOiAnc2hyYW1TZXR1QUlTZXJ2aWNlc0FjY2VzcycsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiAnQWNjZXNzIHRvIEFXUyBBSS9NTCBzZXJ2aWNlcycsXHJcbiAgICAgIHN0YXRlbWVudHM6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBFZmZlY3Q6ICdBbGxvdycsXHJcbiAgICAgICAgICBBY3Rpb246IFtcclxuICAgICAgICAgICAgLy8gQW1hem9uIFRyYW5zY3JpYmVcclxuICAgICAgICAgICAgJ3RyYW5zY3JpYmU6U3RhcnRUcmFuc2NyaXB0aW9uSm9iJyxcclxuICAgICAgICAgICAgJ3RyYW5zY3JpYmU6R2V0VHJhbnNjcmlwdGlvbkpvYicsXHJcbiAgICAgICAgICAgICd0cmFuc2NyaWJlOkxpc3RUcmFuc2NyaXB0aW9uSm9icycsXHJcbiAgICAgICAgICAgICd0cmFuc2NyaWJlOkRlbGV0ZVRyYW5zY3JpcHRpb25Kb2InLFxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gQW1hem9uIFBvbGx5XHJcbiAgICAgICAgICAgICdwb2xseTpTeW50aGVzaXplU3BlZWNoJyxcclxuICAgICAgICAgICAgJ3BvbGx5OkRlc2NyaWJlVm9pY2VzJyxcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIEFtYXpvbiBMZXhcclxuICAgICAgICAgICAgJ2xleDpQb3N0VGV4dCcsXHJcbiAgICAgICAgICAgICdsZXg6UG9zdENvbnRlbnQnLFxyXG4gICAgICAgICAgICAnbGV4OkdldFNlc3Npb24nLFxyXG4gICAgICAgICAgICAnbGV4OlB1dFNlc3Npb24nLFxyXG4gICAgICAgICAgICAnbGV4OkRlbGV0ZVNlc3Npb24nLFxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gQW1hem9uIEJlZHJvY2sgKGZvciBhZHZhbmNlZCBOTFUpXHJcbiAgICAgICAgICAgICdiZWRyb2NrOkludm9rZU1vZGVsJyxcclxuICAgICAgICAgICAgJ2JlZHJvY2s6SW52b2tlTW9kZWxXaXRoUmVzcG9uc2VTdHJlYW0nLFxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gQW1hem9uIFRleHRyYWN0XHJcbiAgICAgICAgICAgICd0ZXh0cmFjdDpBbmFseXplRG9jdW1lbnQnLFxyXG4gICAgICAgICAgICAndGV4dHJhY3Q6RGV0ZWN0RG9jdW1lbnRUZXh0JyxcclxuICAgICAgICAgICAgJ3RleHRyYWN0OkdldERvY3VtZW50QW5hbHlzaXMnLFxyXG4gICAgICAgICAgICAndGV4dHJhY3Q6U3RhcnREb2N1bWVudEFuYWx5c2lzJyxcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIEFtYXpvbiBSZWtvZ25pdGlvblxyXG4gICAgICAgICAgICAncmVrb2duaXRpb246RGV0ZWN0VGV4dCcsXHJcbiAgICAgICAgICAgICdyZWtvZ25pdGlvbjpEZXRlY3RMYWJlbHMnLFxyXG4gICAgICAgICAgICAncmVrb2duaXRpb246RGV0ZWN0TW9kZXJhdGlvbkxhYmVscycsXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBBbWF6b24gQ29tcHJlaGVuZFxyXG4gICAgICAgICAgICAnY29tcHJlaGVuZDpEZXRlY3RTZW50aW1lbnQnLFxyXG4gICAgICAgICAgICAnY29tcHJlaGVuZDpEZXRlY3RFbnRpdGllcycsXHJcbiAgICAgICAgICAgICdjb21wcmVoZW5kOkRldGVjdEtleVBocmFzZXMnLFxyXG4gICAgICAgICAgICAnY29tcHJlaGVuZDpEZXRlY3REb21pbmFudExhbmd1YWdlJyxcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIEFtYXpvbiBMb2NhdGlvbiBTZXJ2aWNlXHJcbiAgICAgICAgICAgICdnZW86U2VhcmNoUGxhY2VJbmRleEZvclBvc2l0aW9uJyxcclxuICAgICAgICAgICAgJ2dlbzpTZWFyY2hQbGFjZUluZGV4Rm9yVGV4dCcsXHJcbiAgICAgICAgICAgICdnZW86Q2FsY3VsYXRlUm91dGUnLFxyXG4gICAgICAgICAgICAnZ2VvOkdldFBsYWNlJyxcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgICBSZXNvdXJjZTogJyonLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIF0sXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIFNlY3JldHMgTWFuYWdlciBBY2Nlc3MgUG9saWN5XHJcbiAgICBzZWNyZXRzTWFuYWdlckFjY2Vzczoge1xyXG4gICAgICBwb2xpY3lOYW1lOiAnc2hyYW1TZXR1U2VjcmV0c01hbmFnZXJBY2Nlc3MnLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ0FjY2VzcyB0byBTZWNyZXRzIE1hbmFnZXInLFxyXG4gICAgICBzdGF0ZW1lbnRzOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgRWZmZWN0OiAnQWxsb3cnLFxyXG4gICAgICAgICAgQWN0aW9uOiBbXHJcbiAgICAgICAgICAgICdzZWNyZXRzbWFuYWdlcjpHZXRTZWNyZXRWYWx1ZScsXHJcbiAgICAgICAgICAgICdzZWNyZXRzbWFuYWdlcjpEZXNjcmliZVNlY3JldCcsXHJcbiAgICAgICAgICBdLFxyXG4gICAgICAgICAgUmVzb3VyY2U6ICdhcm46YXdzOnNlY3JldHNtYW5hZ2VyOio6KjpzZWNyZXQ6c2hyYW0tc2V0dS8qJyxcclxuICAgICAgICB9LFxyXG4gICAgICBdLFxyXG4gICAgfSxcclxuXHJcbiAgICAvLyBTTlMvU0VTIEFjY2VzcyBQb2xpY3kgKGZvciBub3RpZmljYXRpb25zKVxyXG4gICAgbm90aWZpY2F0aW9uQWNjZXNzOiB7XHJcbiAgICAgIHBvbGljeU5hbWU6ICdzaHJhbVNldHVOb3RpZmljYXRpb25BY2Nlc3MnLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ0FjY2VzcyB0byBTTlMgYW5kIFNFUyBmb3Igbm90aWZpY2F0aW9ucycsXHJcbiAgICAgIHN0YXRlbWVudHM6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBFZmZlY3Q6ICdBbGxvdycsXHJcbiAgICAgICAgICBBY3Rpb246IFtcclxuICAgICAgICAgICAgJ3NuczpQdWJsaXNoJyxcclxuICAgICAgICAgICAgJ3NuczpTdWJzY3JpYmUnLFxyXG4gICAgICAgICAgICAnc25zOlVuc3Vic2NyaWJlJyxcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgICBSZXNvdXJjZTogJ2Fybjphd3M6c25zOio6KjpzaHJhbS1zZXR1LSonLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgRWZmZWN0OiAnQWxsb3cnLFxyXG4gICAgICAgICAgQWN0aW9uOiBbXHJcbiAgICAgICAgICAgICdzZXM6U2VuZEVtYWlsJyxcclxuICAgICAgICAgICAgJ3NlczpTZW5kUmF3RW1haWwnLFxyXG4gICAgICAgICAgXSxcclxuICAgICAgICAgIFJlc291cmNlOiAnKicsXHJcbiAgICAgICAgfSxcclxuICAgICAgXSxcclxuICAgIH0sXHJcblxyXG4gICAgLy8gRXZlbnRCcmlkZ2UgQWNjZXNzIFBvbGljeVxyXG4gICAgZXZlbnRCcmlkZ2VBY2Nlc3M6IHtcclxuICAgICAgcG9saWN5TmFtZTogJ3NocmFtU2V0dUV2ZW50QnJpZGdlQWNjZXNzJyxcclxuICAgICAgZGVzY3JpcHRpb246ICdBY2Nlc3MgdG8gRXZlbnRCcmlkZ2UnLFxyXG4gICAgICBzdGF0ZW1lbnRzOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgRWZmZWN0OiAnQWxsb3cnLFxyXG4gICAgICAgICAgQWN0aW9uOiBbXHJcbiAgICAgICAgICAgICdldmVudHM6UHV0RXZlbnRzJyxcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgICBSZXNvdXJjZTogJ2Fybjphd3M6ZXZlbnRzOio6KjpldmVudC1idXMvc2hyYW0tc2V0dS0qJyxcclxuICAgICAgICB9LFxyXG4gICAgICBdLFxyXG4gICAgfSxcclxuXHJcbiAgICAvLyBBUEkgR2F0ZXdheSBNYW5hZ2VtZW50IEFjY2VzcyAoZm9yIFdlYlNvY2tldClcclxuICAgIGFwaUdhdGV3YXlNYW5hZ2VtZW50OiB7XHJcbiAgICAgIHBvbGljeU5hbWU6ICdzaHJhbVNldHVBUElHYXRld2F5TWFuYWdlbWVudCcsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiAnQWNjZXNzIHRvIEFQSSBHYXRld2F5IE1hbmFnZW1lbnQgQVBJJyxcclxuICAgICAgc3RhdGVtZW50czogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIEVmZmVjdDogJ0FsbG93JyxcclxuICAgICAgICAgIEFjdGlvbjogW1xyXG4gICAgICAgICAgICAnZXhlY3V0ZS1hcGk6TWFuYWdlQ29ubmVjdGlvbnMnLFxyXG4gICAgICAgICAgICAnZXhlY3V0ZS1hcGk6SW52b2tlJyxcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgICBSZXNvdXJjZTogJ2Fybjphd3M6ZXhlY3V0ZS1hcGk6KjoqOiovQGNvbm5lY3Rpb25zLyonLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIF0sXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIFgtUmF5IFRyYWNpbmcgUG9saWN5XHJcbiAgICB4cmF5QWNjZXNzOiB7XHJcbiAgICAgIHBvbGljeU5hbWU6ICdzaHJhbVNldHVYUmF5QWNjZXNzJyxcclxuICAgICAgZGVzY3JpcHRpb246ICdBY2Nlc3MgdG8gWC1SYXkgZm9yIGRpc3RyaWJ1dGVkIHRyYWNpbmcnLFxyXG4gICAgICBzdGF0ZW1lbnRzOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgRWZmZWN0OiAnQWxsb3cnLFxyXG4gICAgICAgICAgQWN0aW9uOiBbXHJcbiAgICAgICAgICAgICd4cmF5OlB1dFRyYWNlU2VnbWVudHMnLFxyXG4gICAgICAgICAgICAneHJheTpQdXRUZWxlbWV0cnlSZWNvcmRzJyxcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgICBSZXNvdXJjZTogJyonLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIF0sXHJcbiAgICB9LFxyXG4gIH0sXHJcblxyXG4gIC8vIEZ1bmN0aW9uLXNwZWNpZmljIHJvbGUgY29uZmlndXJhdGlvbnNcclxuICBmdW5jdGlvblJvbGVzOiB7XHJcbiAgICAvLyBBdXRoIGZ1bmN0aW9ucyBuZWVkIG1pbmltYWwgcGVybWlzc2lvbnNcclxuICAgIGF1dGhGdW5jdGlvbnM6IHtcclxuICAgICAgcG9saWNpZXM6IFsnZHluYW1vZGJBY2Nlc3MnLCAnc2VjcmV0c01hbmFnZXJBY2Nlc3MnLCAna21zQWNjZXNzJ10sXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIFZvaWNlIGZ1bmN0aW9ucyBuZWVkIEFJIHNlcnZpY2VzXHJcbiAgICB2b2ljZUZ1bmN0aW9uczoge1xyXG4gICAgICBwb2xpY2llczogWydkeW5hbW9kYkFjY2VzcycsICdzM0FjY2VzcycsICdhaVNlcnZpY2VzQWNjZXNzJywgJ2ttc0FjY2VzcycsICdlbGFzdGljYWNoZUFjY2VzcyddLFxyXG4gICAgfSxcclxuXHJcbiAgICAvLyBKb2IgZnVuY3Rpb25zIG5lZWQgbG9jYXRpb24gc2VydmljZXNcclxuICAgIGpvYkZ1bmN0aW9uczoge1xyXG4gICAgICBwb2xpY2llczogWydkeW5hbW9kYkFjY2VzcycsICdhaVNlcnZpY2VzQWNjZXNzJywgJ2V2ZW50QnJpZGdlQWNjZXNzJywgJ2ttc0FjY2VzcyddLFxyXG4gICAgfSxcclxuXHJcbiAgICAvLyBMZWRnZXIgZnVuY3Rpb25zIG5lZWQgUkRTIGFuZCBTM1xyXG4gICAgbGVkZ2VyRnVuY3Rpb25zOiB7XHJcbiAgICAgIHBvbGljaWVzOiBbJ2R5bmFtb2RiQWNjZXNzJywgJ3Jkc0FjY2VzcycsICdzM0FjY2VzcycsICdhaVNlcnZpY2VzQWNjZXNzJywgJ2ttc0FjY2VzcyddLFxyXG4gICAgfSxcclxuXHJcbiAgICAvLyBBdHRlbmRhbmNlIGZ1bmN0aW9ucyBuZWVkIFJlZGlzXHJcbiAgICBhdHRlbmRhbmNlRnVuY3Rpb25zOiB7XHJcbiAgICAgIHBvbGljaWVzOiBbJ2R5bmFtb2RiQWNjZXNzJywgJ2VsYXN0aWNhY2hlQWNjZXNzJywgJ2ttc0FjY2VzcyddLFxyXG4gICAgfSxcclxuXHJcbiAgICAvLyBHcmlldmFuY2UgZnVuY3Rpb25zIG5lZWQgQUkgYW5kIG5vdGlmaWNhdGlvbnNcclxuICAgIGdyaWV2YW5jZUZ1bmN0aW9uczoge1xyXG4gICAgICBwb2xpY2llczogWydkeW5hbW9kYkFjY2VzcycsICdzM0FjY2VzcycsICdhaVNlcnZpY2VzQWNjZXNzJywgJ25vdGlmaWNhdGlvbkFjY2VzcycsICdrbXNBY2Nlc3MnXSxcclxuICAgIH0sXHJcblxyXG4gICAgLy8gV2ViU29ja2V0IGZ1bmN0aW9ucyBuZWVkIEFQSSBHYXRld2F5IG1hbmFnZW1lbnRcclxuICAgIHdlYnNvY2tldEZ1bmN0aW9uczoge1xyXG4gICAgICBwb2xpY2llczogWydkeW5hbW9kYkFjY2VzcycsICdhcGlHYXRld2F5TWFuYWdlbWVudCcsICdrbXNBY2Nlc3MnXSxcclxuICAgIH0sXHJcblxyXG4gICAgLy8gU3luYyBmdW5jdGlvbnMgbmVlZCBjb21wcmVoZW5zaXZlIGFjY2Vzc1xyXG4gICAgc3luY0Z1bmN0aW9uczoge1xyXG4gICAgICBwb2xpY2llczogWydkeW5hbW9kYkFjY2VzcycsICdlbGFzdGljYWNoZUFjY2VzcycsICdldmVudEJyaWRnZUFjY2VzcycsICdrbXNBY2Nlc3MnXSxcclxuICAgIH0sXHJcbiAgfSxcclxuXHJcbiAgLy8gRW52aXJvbm1lbnQgdmFyaWFibGVzIGZvciBMYW1iZGEgZnVuY3Rpb25zXHJcbiAgZW52aXJvbm1lbnRWYXJpYWJsZXM6IHtcclxuICAgIGNvbW1vbjoge1xyXG4gICAgICBOT0RFX0VOVjogJ3Byb2R1Y3Rpb24nLFxyXG4gICAgICBMT0dfTEVWRUw6ICdpbmZvJyxcclxuICAgICAgQVdTX05PREVKU19DT05ORUNUSU9OX1JFVVNFX0VOQUJMRUQ6ICcxJyxcclxuICAgIH0sXHJcbiAgICBkYXRhYmFzZToge1xyXG4gICAgICBVU0VSU19UQUJMRTogJ3NocmFtLXNldHUtdXNlcnMnLFxyXG4gICAgICBKT0JTX1RBQkxFOiAnc2hyYW0tc2V0dS1qb2JzJyxcclxuICAgICAgUkFUSU5HU19UQUJMRTogJ3NocmFtLXNldHUtcmF0aW5ncycsXHJcbiAgICAgIFNZTkNfVEFCTEU6ICdzaHJhbS1zZXR1LXN5bmMtb3BlcmF0aW9ucycsXHJcbiAgICAgIEFUVEVOREFOQ0VfVEFCTEU6ICdzaHJhbS1zZXR1LWF0dGVuZGFuY2UnLFxyXG4gICAgICBHUklFVkFOQ0VTX1RBQkxFOiAnc2hyYW0tc2V0dS1ncmlldmFuY2VzJyxcclxuICAgICAgUkRTX0VORFBPSU5UOiAnJHtSRFNfRU5EUE9JTlR9JyxcclxuICAgICAgUkRTX0RBVEFCQVNFOiAnc2hyYW1fc2V0dV9sZWRnZXInLFxyXG4gICAgICBSRURJU19FTkRQT0lOVDogJyR7UkVESVNfRU5EUE9JTlR9JyxcclxuICAgIH0sXHJcbiAgICBzdG9yYWdlOiB7XHJcbiAgICAgIEFVRElPX0JVQ0tFVDogJ3NocmFtLXNldHUtYXVkaW8tJHtBQ0NPVU5UX0lEfScsXHJcbiAgICAgIERPQ1VNRU5UX0JVQ0tFVDogJ3NocmFtLXNldHUtZG9jdW1lbnRzLSR7QUNDT1VOVF9JRH0nLFxyXG4gICAgfSxcclxuICAgIHNlY3VyaXR5OiB7XHJcbiAgICAgIEtNU19LRVlfSUQ6ICcke0tNU19LRVlfSUR9JyxcclxuICAgICAgSldUX1NFQ1JFVF9BUk46ICcke0pXVF9TRUNSRVRfQVJOfScsXHJcbiAgICAgIFJFRElTX0FVVEhfVE9LRU5fQVJOOiAnJHtSRURJU19BVVRIX1RPS0VOX0FSTn0nLFxyXG4gICAgfSxcclxuICB9LFxyXG5cclxuICAvLyBMYW1iZGEgZnVuY3Rpb24gY29uZmlndXJhdGlvbiBkZWZhdWx0c1xyXG4gIGZ1bmN0aW9uRGVmYXVsdHM6IHtcclxuICAgIHJ1bnRpbWU6ICdub2RlanMxOC54JyxcclxuICAgIHRpbWVvdXQ6IDMwLCAvLyBzZWNvbmRzXHJcbiAgICBtZW1vcnlTaXplOiA1MTIsIC8vIE1CXHJcbiAgICByZXNlcnZlZENvbmN1cnJlbnRFeGVjdXRpb25zOiAxMDAsXHJcbiAgICB0cmFjaW5nOiAnQWN0aXZlJywgLy8gWC1SYXkgdHJhY2luZ1xyXG4gICAgZW52aXJvbm1lbnQ6IHtcclxuICAgICAgdmFyaWFibGVzOiB7XHJcbiAgICAgICAgLy8gTWVyZ2VkIGZyb20gZW52aXJvbm1lbnRWYXJpYWJsZXNcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxufTtcclxuXHJcbiJdfQ==