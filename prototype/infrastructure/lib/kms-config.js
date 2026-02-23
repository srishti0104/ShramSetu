"use strict";
/**
 * AWS KMS Configuration for shram-Setu
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.KMSConfig = void 0;
exports.KMSConfig = {
    // Master encryption key
    masterKey: {
        alias: 'alias/shram-setu-master-key',
        description: 'Master encryption key for shram-Setu platform',
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
            keyAlias: 'alias/shram-setu-master-key',
        },
        rds: {
            enabled: true,
            keyType: 'CUSTOMER_MANAGED',
            keyAlias: 'alias/shram-setu-master-key',
        },
        s3: {
            enabled: true,
            keyType: 'CUSTOMER_MANAGED',
            keyAlias: 'alias/shram-setu-master-key',
            bucketKeyEnabled: true, // Reduce KMS costs
        },
        elasticache: {
            enabled: true,
            keyType: 'AWS_MANAGED',
        },
        cloudwatchLogs: {
            enabled: true,
            keyType: 'CUSTOMER_MANAGED',
            keyAlias: 'alias/shram-setu-master-key',
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
            grantee: 'arn:aws:iam::${ACCOUNT_ID}:role/shramSetuLambdaExecutionRole',
            operations: ['Decrypt', 'Encrypt', 'GenerateDataKey', 'DescribeKey'],
        },
        s3: {
            grantee: 'arn:aws:iam::${ACCOUNT_ID}:role/shramSetuLambdaExecutionRole',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia21zLWNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImttcy1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOzs7QUFFVSxRQUFBLFNBQVMsR0FBRztJQUN2Qix3QkFBd0I7SUFDeEIsU0FBUyxFQUFFO1FBQ1QsS0FBSyxFQUFFLDZCQUE2QjtRQUNwQyxXQUFXLEVBQUUsK0NBQStDO1FBQzVELGlCQUFpQixFQUFFLElBQUk7UUFDdkIsY0FBYyxFQUFFLEdBQUcsRUFBRSxPQUFPO1FBQzVCLGFBQWEsRUFBRSxRQUFRLEVBQUUsNkJBQTZCO1FBRXRELGFBQWE7UUFDYixTQUFTLEVBQUU7WUFDVCxPQUFPLEVBQUUsWUFBWTtZQUNyQixTQUFTLEVBQUU7Z0JBQ1Q7b0JBQ0UsR0FBRyxFQUFFLDZCQUE2QjtvQkFDbEMsTUFBTSxFQUFFLE9BQU87b0JBQ2YsU0FBUyxFQUFFO3dCQUNULEdBQUcsRUFBRSxpQ0FBaUM7cUJBQ3ZDO29CQUNELE1BQU0sRUFBRSxPQUFPO29CQUNmLFFBQVEsRUFBRSxHQUFHO2lCQUNkO2dCQUNEO29CQUNFLEdBQUcsRUFBRSwrQkFBK0I7b0JBQ3BDLE1BQU0sRUFBRSxPQUFPO29CQUNmLFNBQVMsRUFBRTt3QkFDVCxPQUFPLEVBQUU7NEJBQ1Asa0JBQWtCOzRCQUNsQix3QkFBd0I7NEJBQ3hCLG1CQUFtQjs0QkFDbkIsMkJBQTJCOzRCQUMzQixzQkFBc0I7NEJBQ3RCLG9CQUFvQjt5QkFDckI7cUJBQ0Y7b0JBQ0QsTUFBTSxFQUFFO3dCQUNOLGFBQWE7d0JBQ2IsYUFBYTt3QkFDYixxQkFBcUI7d0JBQ3JCLGlCQUFpQjtxQkFDbEI7b0JBQ0QsUUFBUSxFQUFFLEdBQUc7aUJBQ2Q7YUFDRjtTQUNGO0tBQ0Y7SUFFRCxrREFBa0Q7SUFDbEQsa0JBQWtCLEVBQUU7UUFDbEIsc0NBQXNDO1FBQ3RDLGVBQWUsRUFBRTtZQUNmLElBQUksRUFBRTtnQkFDSixzQkFBc0I7Z0JBQ3RCLGdCQUFnQjtn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Q25CLGVBQWUsRUFBRSxJQUFJLEVBQUUseUJBQXlCO0tBQ2pEO0NBQ0YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBBV1MgS01TIENvbmZpZ3VyYXRpb24gZm9yIHNocmFtLVNldHVcclxuICovXHJcblxyXG5leHBvcnQgY29uc3QgS01TQ29uZmlnID0ge1xyXG4gIC8vIE1hc3RlciBlbmNyeXB0aW9uIGtleVxyXG4gIG1hc3RlcktleToge1xyXG4gICAgYWxpYXM6ICdhbGlhcy9zaHJhbS1zZXR1LW1hc3Rlci1rZXknLFxyXG4gICAgZGVzY3JpcHRpb246ICdNYXN0ZXIgZW5jcnlwdGlvbiBrZXkgZm9yIHNocmFtLVNldHUgcGxhdGZvcm0nLFxyXG4gICAgZW5hYmxlS2V5Um90YXRpb246IHRydWUsXHJcbiAgICByb3RhdGlvblBlcmlvZDogMzY1LCAvLyBkYXlzXHJcbiAgICByZW1vdmFsUG9saWN5OiAnUkVUQUlOJywgLy8gTmV2ZXIgZGVsZXRlIGluIHByb2R1Y3Rpb25cclxuICAgIFxyXG4gICAgLy8gS2V5IHBvbGljeVxyXG4gICAga2V5UG9saWN5OiB7XHJcbiAgICAgIFZlcnNpb246ICcyMDEyLTEwLTE3JyxcclxuICAgICAgU3RhdGVtZW50OiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgU2lkOiAnRW5hYmxlIElBTSBVc2VyIFBlcm1pc3Npb25zJyxcclxuICAgICAgICAgIEVmZmVjdDogJ0FsbG93JyxcclxuICAgICAgICAgIFByaW5jaXBhbDoge1xyXG4gICAgICAgICAgICBBV1M6ICdhcm46YXdzOmlhbTo6JHtBQ0NPVU5UX0lEfTpyb290JyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBBY3Rpb246ICdrbXM6KicsXHJcbiAgICAgICAgICBSZXNvdXJjZTogJyonLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgU2lkOiAnQWxsb3cgc2VydmljZXMgdG8gdXNlIHRoZSBrZXknLFxyXG4gICAgICAgICAgRWZmZWN0OiAnQWxsb3cnLFxyXG4gICAgICAgICAgUHJpbmNpcGFsOiB7XHJcbiAgICAgICAgICAgIFNlcnZpY2U6IFtcclxuICAgICAgICAgICAgICAnczMuYW1hem9uYXdzLmNvbScsXHJcbiAgICAgICAgICAgICAgJ2R5bmFtb2RiLmFtYXpvbmF3cy5jb20nLFxyXG4gICAgICAgICAgICAgICdyZHMuYW1hem9uYXdzLmNvbScsXHJcbiAgICAgICAgICAgICAgJ2VsYXN0aWNhY2hlLmFtYXpvbmF3cy5jb20nLFxyXG4gICAgICAgICAgICAgICdsYW1iZGEuYW1hem9uYXdzLmNvbScsXHJcbiAgICAgICAgICAgICAgJ2xvZ3MuYW1hem9uYXdzLmNvbScsXHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgQWN0aW9uOiBbXHJcbiAgICAgICAgICAgICdrbXM6RGVjcnlwdCcsXHJcbiAgICAgICAgICAgICdrbXM6RW5jcnlwdCcsXHJcbiAgICAgICAgICAgICdrbXM6R2VuZXJhdGVEYXRhS2V5JyxcclxuICAgICAgICAgICAgJ2ttczpEZXNjcmliZUtleScsXHJcbiAgICAgICAgICBdLFxyXG4gICAgICAgICAgUmVzb3VyY2U6ICcqJyxcclxuICAgICAgICB9LFxyXG4gICAgICBdLFxyXG4gICAgfSxcclxuICB9LFxyXG5cclxuICAvLyBEYXRhIGNsYXNzaWZpY2F0aW9uIGFuZCBlbmNyeXB0aW9uIHJlcXVpcmVtZW50c1xyXG4gIGRhdGFDbGFzc2lmaWNhdGlvbjoge1xyXG4gICAgLy8gSGlnaGx5IFNlbnNpdGl2ZSAtIEFsd2F5cyBlbmNyeXB0ZWRcclxuICAgIGhpZ2hseVNlbnNpdGl2ZToge1xyXG4gICAgICBkYXRhOiBbXHJcbiAgICAgICAgJ0UtU2hyYW0gY2FyZCBudW1iZXJzJyxcclxuICAgICAgICAnTW9iaWxlIG51bWJlcnMnLFxyXG4gICAgICAgICdCaW9tZXRyaWMgZGF0YScsXHJcbiAgICAgICAgJ0ZpbmFuY2lhbCB0cmFuc2FjdGlvbiBkZXRhaWxzJyxcclxuICAgICAgICAnQmFuayBhY2NvdW50IGluZm9ybWF0aW9uJyxcclxuICAgICAgICAnQWFkaGFhciBudW1iZXJzIChpZiBjb2xsZWN0ZWQpJyxcclxuICAgICAgXSxcclxuICAgICAgZW5jcnlwdGlvbjogJ0tNUyB3aXRoIGN1c3RvbWVyLW1hbmFnZWQga2V5JyxcclxuICAgICAga2V5Um90YXRpb246IHRydWUsXHJcbiAgICAgIGF1ZGl0TG9nZ2luZzogdHJ1ZSxcclxuICAgIH0sXHJcblxyXG4gICAgLy8gU2Vuc2l0aXZlIC0gRW5jcnlwdGVkXHJcbiAgICBzZW5zaXRpdmU6IHtcclxuICAgICAgZGF0YTogW1xyXG4gICAgICAgICdVc2VyIHByb2ZpbGVzJyxcclxuICAgICAgICAnSm9iIGFwcGxpY2F0aW9ucycsXHJcbiAgICAgICAgJ1JhdGluZ3MgYW5kIHJldmlld3MnLFxyXG4gICAgICAgICdBdHRlbmRhbmNlIHJlY29yZHMnLFxyXG4gICAgICAgICdWb2ljZSByZWNvcmRpbmdzJyxcclxuICAgICAgICAnUGF5c2xpcCBpbWFnZXMnLFxyXG4gICAgICBdLFxyXG4gICAgICBlbmNyeXB0aW9uOiAnS01TIHdpdGggY3VzdG9tZXItbWFuYWdlZCBrZXknLFxyXG4gICAgICBrZXlSb3RhdGlvbjogdHJ1ZSxcclxuICAgICAgYXVkaXRMb2dnaW5nOiB0cnVlLFxyXG4gICAgfSxcclxuXHJcbiAgICAvLyBJbnRlcm5hbCAtIFN0YW5kYXJkIGVuY3J5cHRpb25cclxuICAgIGludGVybmFsOiB7XHJcbiAgICAgIGRhdGE6IFtcclxuICAgICAgICAnSm9iIHBvc3RpbmdzJyxcclxuICAgICAgICAnU3lzdGVtIGxvZ3MnLFxyXG4gICAgICAgICdBbmFseXRpY3MgZGF0YScsXHJcbiAgICAgIF0sXHJcbiAgICAgIGVuY3J5cHRpb246ICdBV1MgbWFuYWdlZCBrZXlzJyxcclxuICAgICAga2V5Um90YXRpb246IGZhbHNlLFxyXG4gICAgICBhdWRpdExvZ2dpbmc6IGZhbHNlLFxyXG4gICAgfSxcclxuICB9LFxyXG5cclxuICAvLyBFbmNyeXB0aW9uIGF0IHJlc3QgY29uZmlndXJhdGlvblxyXG4gIGVuY3J5cHRpb25BdFJlc3Q6IHtcclxuICAgIGR5bmFtb2RiOiB7XHJcbiAgICAgIGVuYWJsZWQ6IHRydWUsXHJcbiAgICAgIGtleVR5cGU6ICdDVVNUT01FUl9NQU5BR0VEJyxcclxuICAgICAga2V5QWxpYXM6ICdhbGlhcy9zaHJhbS1zZXR1LW1hc3Rlci1rZXknLFxyXG4gICAgfSxcclxuICAgIHJkczoge1xyXG4gICAgICBlbmFibGVkOiB0cnVlLFxyXG4gICAgICBrZXlUeXBlOiAnQ1VTVE9NRVJfTUFOQUdFRCcsXHJcbiAgICAgIGtleUFsaWFzOiAnYWxpYXMvc2hyYW0tc2V0dS1tYXN0ZXIta2V5JyxcclxuICAgIH0sXHJcbiAgICBzMzoge1xyXG4gICAgICBlbmFibGVkOiB0cnVlLFxyXG4gICAgICBrZXlUeXBlOiAnQ1VTVE9NRVJfTUFOQUdFRCcsXHJcbiAgICAgIGtleUFsaWFzOiAnYWxpYXMvc2hyYW0tc2V0dS1tYXN0ZXIta2V5JyxcclxuICAgICAgYnVja2V0S2V5RW5hYmxlZDogdHJ1ZSwgLy8gUmVkdWNlIEtNUyBjb3N0c1xyXG4gICAgfSxcclxuICAgIGVsYXN0aWNhY2hlOiB7XHJcbiAgICAgIGVuYWJsZWQ6IHRydWUsXHJcbiAgICAgIGtleVR5cGU6ICdBV1NfTUFOQUdFRCcsXHJcbiAgICB9LFxyXG4gICAgY2xvdWR3YXRjaExvZ3M6IHtcclxuICAgICAgZW5hYmxlZDogdHJ1ZSxcclxuICAgICAga2V5VHlwZTogJ0NVU1RPTUVSX01BTkFHRUQnLFxyXG4gICAgICBrZXlBbGlhczogJ2FsaWFzL3NocmFtLXNldHUtbWFzdGVyLWtleScsXHJcbiAgICB9LFxyXG4gIH0sXHJcblxyXG4gIC8vIEVuY3J5cHRpb24gaW4gdHJhbnNpdFxyXG4gIGVuY3J5cHRpb25JblRyYW5zaXQ6IHtcclxuICAgIGFwaUdhdGV3YXk6IHtcclxuICAgICAgcHJvdG9jb2w6ICdUTFMgMS4zJyxcclxuICAgICAgY2VydGlmaWNhdGVUeXBlOiAnQUNNJyxcclxuICAgIH0sXHJcbiAgICByZHM6IHtcclxuICAgICAgc3NsTW9kZTogJ3JlcXVpcmUnLFxyXG4gICAgICBjZXJ0aWZpY2F0ZVZlcmlmaWNhdGlvbjogdHJ1ZSxcclxuICAgIH0sXHJcbiAgICBlbGFzdGljYWNoZToge1xyXG4gICAgICB0cmFuc2l0RW5jcnlwdGlvbjogdHJ1ZSxcclxuICAgICAgYXV0aFRva2VuOiB0cnVlLFxyXG4gICAgfSxcclxuICAgIGxhbWJkYToge1xyXG4gICAgICBlbnZpcm9ubWVudFZhcmlhYmxlczogJ2VuY3J5cHRlZCcsXHJcbiAgICB9LFxyXG4gIH0sXHJcblxyXG4gIC8vIEtleSBncmFudHMgZm9yIHNlcnZpY2VzXHJcbiAga2V5R3JhbnRzOiB7XHJcbiAgICBsYW1iZGE6IHtcclxuICAgICAgZ3JhbnRlZTogJ2Fybjphd3M6aWFtOjoke0FDQ09VTlRfSUR9OnJvbGUvc2hyYW1TZXR1TGFtYmRhRXhlY3V0aW9uUm9sZScsXHJcbiAgICAgIG9wZXJhdGlvbnM6IFsnRGVjcnlwdCcsICdFbmNyeXB0JywgJ0dlbmVyYXRlRGF0YUtleScsICdEZXNjcmliZUtleSddLFxyXG4gICAgfSxcclxuICAgIHMzOiB7XHJcbiAgICAgIGdyYW50ZWU6ICdhcm46YXdzOmlhbTo6JHtBQ0NPVU5UX0lEfTpyb2xlL3NocmFtU2V0dUxhbWJkYUV4ZWN1dGlvblJvbGUnLFxyXG4gICAgICBvcGVyYXRpb25zOiBbJ0RlY3J5cHQnLCAnRW5jcnlwdCcsICdHZW5lcmF0ZURhdGFLZXknXSxcclxuICAgIH0sXHJcbiAgfSxcclxuXHJcbiAgLy8gS2V5IG1vbml0b3JpbmcgYW5kIGFsZXJ0c1xyXG4gIG1vbml0b3Jpbmc6IHtcclxuICAgIGNsb3VkV2F0Y2hNZXRyaWNzOiBbXHJcbiAgICAgICdOdW1iZXJPZkRlY3J5cHRDYWxscycsXHJcbiAgICAgICdOdW1iZXJPZkVuY3J5cHRDYWxscycsXHJcbiAgICAgICdOdW1iZXJPZkdlbmVyYXRlRGF0YUtleUNhbGxzJyxcclxuICAgIF0sXHJcbiAgICBhbGFybXM6IHtcclxuICAgICAgdW51c3VhbEFjdGl2aXR5OiB7XHJcbiAgICAgICAgbWV0cmljOiAnTnVtYmVyT2ZEZWNyeXB0Q2FsbHMnLFxyXG4gICAgICAgIHRocmVzaG9sZDogMTAwMDAsXHJcbiAgICAgICAgcGVyaW9kOiAzMDAsIC8vIDUgbWludXRlc1xyXG4gICAgICAgIGV2YWx1YXRpb25QZXJpb2RzOiAyLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG5cclxuICAvLyBDb21wbGlhbmNlIGFuZCBhdWRpdFxyXG4gIGNvbXBsaWFuY2U6IHtcclxuICAgIGNsb3VkVHJhaWxMb2dnaW5nOiB0cnVlLFxyXG4gICAga2V5VXNhZ2VMb2dnaW5nOiB0cnVlLFxyXG4gICAgYWNjZXNzTG9nZ2luZzogdHJ1ZSxcclxuICAgIHJldGVudGlvblBlcmlvZDogMjU1NSwgLy8gNyB5ZWFycyBmb3IgY29tcGxpYW5jZVxyXG4gIH0sXHJcbn07XHJcblxyXG4iXX0=