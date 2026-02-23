"use strict";
/**
 * Monitoring and Logging Configuration for shram-Setu
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringConfig = void 0;
exports.MonitoringConfig = {
    // CloudWatch Log Groups
    logGroups: {
        apiGateway: {
            logGroupName: '/aws/apigateway/shram-setu',
            retentionDays: 30,
            encryption: true,
            kmsKeyId: '${KMS_KEY_ID}',
        },
        lambda: {
            logGroupName: '/aws/lambda/shram-setu',
            retentionDays: 30,
            encryption: true,
            kmsKeyId: '${KMS_KEY_ID}',
        },
        rds: {
            logGroupName: '/aws/rds/shram-setu',
            retentionDays: 7,
            encryption: true,
            kmsKeyId: '${KMS_KEY_ID}',
        },
        application: {
            logGroupName: '/shram-setu/application',
            retentionDays: 90,
            encryption: true,
            kmsKeyId: '${KMS_KEY_ID}',
        },
    },
    // CloudWatch Metrics
    customMetrics: {
        namespace: 'shramSetu',
        metrics: [
            // API metrics
            {
                name: 'APIRequestCount',
                unit: 'Count',
                dimensions: ['Endpoint', 'Method', 'StatusCode'],
            },
            {
                name: 'APILatency',
                unit: 'Milliseconds',
                dimensions: ['Endpoint', 'Method'],
            },
            {
                name: 'APIErrorRate',
                unit: 'Percent',
                dimensions: ['Endpoint', 'ErrorType'],
            },
            // Voice processing metrics
            {
                name: 'VoiceTranscriptionTime',
                unit: 'Seconds',
                dimensions: ['Language'],
            },
            {
                name: 'VoiceTranscriptionAccuracy',
                unit: 'Percent',
                dimensions: ['Language'],
            },
            // Job marketplace metrics
            {
                name: 'JobSearchLatency',
                unit: 'Milliseconds',
                dimensions: ['City'],
            },
            {
                name: 'JobApplicationCount',
                unit: 'Count',
                dimensions: ['JobType'],
            },
            // Financial ledger metrics
            {
                name: 'TransactionCount',
                unit: 'Count',
                dimensions: ['Type', 'Status'],
            },
            {
                name: 'ComplianceViolations',
                unit: 'Count',
                dimensions: ['State', 'ViolationType'],
            },
            // TOTP metrics
            {
                name: 'TOTPGenerationTime',
                unit: 'Milliseconds',
            },
            {
                name: 'TOTPValidationSuccess',
                unit: 'Percent',
            },
            // Sync metrics
            {
                name: 'SyncOperationCount',
                unit: 'Count',
                dimensions: ['Status'],
            },
            {
                name: 'SyncConflictCount',
                unit: 'Count',
                dimensions: ['ConflictType'],
            },
            // User metrics
            {
                name: 'ActiveUsers',
                unit: 'Count',
                dimensions: ['Role', 'Language'],
            },
            {
                name: 'NewRegistrations',
                unit: 'Count',
                dimensions: ['Role'],
            },
        ],
    },
    // CloudWatch Alarms
    alarms: {
        // API Gateway alarms
        apiGateway: [
            {
                alarmName: 'HighAPIErrorRate',
                metric: '5XXError',
                threshold: 10,
                evaluationPeriods: 2,
                period: 300, // 5 minutes
                comparisonOperator: 'GreaterThanThreshold',
                treatMissingData: 'notBreaching',
                actions: ['${SNS_TOPIC_ARN}'],
            },
            {
                alarmName: 'HighAPILatency',
                metric: 'Latency',
                statistic: 'Average',
                threshold: 3000, // 3 seconds
                evaluationPeriods: 3,
                period: 300,
                comparisonOperator: 'GreaterThanThreshold',
                actions: ['${SNS_TOPIC_ARN}'],
            },
        ],
        // Lambda alarms
        lambda: [
            {
                alarmName: 'LambdaErrors',
                metric: 'Errors',
                threshold: 5,
                evaluationPeriods: 2,
                period: 300,
                comparisonOperator: 'GreaterThanThreshold',
                actions: ['${SNS_TOPIC_ARN}'],
            },
            {
                alarmName: 'LambdaThrottles',
                metric: 'Throttles',
                threshold: 10,
                evaluationPeriods: 2,
                period: 300,
                comparisonOperator: 'GreaterThanThreshold',
                actions: ['${SNS_TOPIC_ARN}'],
            },
            {
                alarmName: 'LambdaDuration',
                metric: 'Duration',
                statistic: 'Average',
                threshold: 25000, // 25 seconds (near timeout)
                evaluationPeriods: 2,
                period: 300,
                comparisonOperator: 'GreaterThanThreshold',
                actions: ['${SNS_TOPIC_ARN}'],
            },
        ],
        // DynamoDB alarms
        dynamodb: [
            {
                alarmName: 'DynamoDBReadThrottles',
                metric: 'ReadThrottleEvents',
                threshold: 10,
                evaluationPeriods: 2,
                period: 300,
                comparisonOperator: 'GreaterThanThreshold',
                actions: ['${SNS_TOPIC_ARN}'],
            },
            {
                alarmName: 'DynamoDBWriteThrottles',
                metric: 'WriteThrottleEvents',
                threshold: 10,
                evaluationPeriods: 2,
                period: 300,
                comparisonOperator: 'GreaterThanThreshold',
                actions: ['${SNS_TOPIC_ARN}'],
            },
        ],
        // RDS alarms
        rds: [
            {
                alarmName: 'RDSHighCPU',
                metric: 'CPUUtilization',
                threshold: 80,
                evaluationPeriods: 3,
                period: 300,
                comparisonOperator: 'GreaterThanThreshold',
                actions: ['${SNS_TOPIC_ARN}'],
            },
            {
                alarmName: 'RDSLowStorage',
                metric: 'FreeStorageSpace',
                threshold: 5368709120, // 5GB
                evaluationPeriods: 1,
                period: 300,
                comparisonOperator: 'LessThanThreshold',
                actions: ['${SNS_TOPIC_ARN}'],
            },
            {
                alarmName: 'RDSHighConnections',
                metric: 'DatabaseConnections',
                threshold: 80,
                evaluationPeriods: 2,
                period: 300,
                comparisonOperator: 'GreaterThanThreshold',
                actions: ['${SNS_TOPIC_ARN}'],
            },
        ],
        // ElastiCache alarms
        elasticache: [
            {
                alarmName: 'RedisHighCPU',
                metric: 'CPUUtilization',
                threshold: 75,
                evaluationPeriods: 2,
                period: 300,
                comparisonOperator: 'GreaterThanThreshold',
                actions: ['${SNS_TOPIC_ARN}'],
            },
            {
                alarmName: 'RedisHighMemory',
                metric: 'DatabaseMemoryUsagePercentage',
                threshold: 90,
                evaluationPeriods: 2,
                period: 300,
                comparisonOperator: 'GreaterThanThreshold',
                actions: ['${SNS_TOPIC_ARN}'],
            },
            {
                alarmName: 'RedisHighEvictions',
                metric: 'Evictions',
                threshold: 1000,
                evaluationPeriods: 1,
                period: 300,
                comparisonOperator: 'GreaterThanThreshold',
                actions: ['${SNS_TOPIC_ARN}'],
            },
        ],
    },
    // X-Ray Tracing
    xray: {
        enabled: true,
        samplingRate: 0.1, // 10% of requests
        // Trace segments
        segments: {
            apiGateway: true,
            lambda: true,
            dynamodb: true,
            rds: true,
            s3: true,
            sns: true,
        },
        // Service map
        serviceMap: {
            enabled: true,
            refreshInterval: 300, // 5 minutes
        },
    },
    // CloudWatch Dashboards
    dashboards: {
        main: {
            dashboardName: 'shramSetu-Main',
            widgets: [
                // API metrics
                {
                    type: 'metric',
                    properties: {
                        metrics: [
                            ['AWS/ApiGateway', 'Count', { stat: 'Sum' }],
                            ['.', '4XXError', { stat: 'Sum' }],
                            ['.', '5XXError', { stat: 'Sum' }],
                        ],
                        period: 300,
                        stat: 'Sum',
                        region: 'ap-south-1',
                        title: 'API Gateway Requests',
                    },
                },
                // Lambda metrics
                {
                    type: 'metric',
                    properties: {
                        metrics: [
                            ['AWS/Lambda', 'Invocations', { stat: 'Sum' }],
                            ['.', 'Errors', { stat: 'Sum' }],
                            ['.', 'Throttles', { stat: 'Sum' }],
                        ],
                        period: 300,
                        stat: 'Sum',
                        region: 'ap-south-1',
                        title: 'Lambda Invocations',
                    },
                },
                // DynamoDB metrics
                {
                    type: 'metric',
                    properties: {
                        metrics: [
                            ['AWS/DynamoDB', 'ConsumedReadCapacityUnits', { stat: 'Sum' }],
                            ['.', 'ConsumedWriteCapacityUnits', { stat: 'Sum' }],
                        ],
                        period: 300,
                        stat: 'Sum',
                        region: 'ap-south-1',
                        title: 'DynamoDB Capacity',
                    },
                },
            ],
        },
    },
    // SNS Topics for alerts
    snsTopics: {
        critical: {
            topicName: 'shram-setu-critical-alerts',
            displayName: 'shram-Setu Critical Alerts',
            subscriptions: [
                {
                    protocol: 'email',
                    endpoint: 'ops-team@shram-setu.com',
                },
                {
                    protocol: 'sms',
                    endpoint: '+91XXXXXXXXXX',
                },
            ],
        },
        warnings: {
            topicName: 'shram-setu-warnings',
            displayName: 'shram-Setu Warnings',
            subscriptions: [
                {
                    protocol: 'email',
                    endpoint: 'dev-team@shram-setu.com',
                },
            ],
        },
    },
    // Log Insights Queries
    logInsightsQueries: [
        {
            name: 'API Errors',
            queryString: `
        fields @timestamp, @message
        | filter @message like /ERROR/
        | sort @timestamp desc
        | limit 100
      `,
        },
        {
            name: 'Slow API Requests',
            queryString: `
        fields @timestamp, @message, @duration
        | filter @duration > 3000
        | sort @duration desc
        | limit 50
      `,
        },
        {
            name: 'Failed Transactions',
            queryString: `
        fields @timestamp, transactionId, errorMessage
        | filter status = "failed"
        | sort @timestamp desc
        | limit 100
      `,
        },
    ],
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9uaXRvcmluZy1jb25maWcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJtb25pdG9yaW5nLWNvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7OztBQUVVLFFBQUEsZ0JBQWdCLEdBQUc7SUFDOUIsd0JBQXdCO0lBQ3hCLFNBQVMsRUFBRTtRQUNULFVBQVUsRUFBRTtZQUNWLFlBQVksRUFBRSw0QkFBNEI7WUFDMUMsYUFBYSxFQUFFLEVBQUU7WUFDakIsVUFBVSxFQUFFLElBQUk7WUFDaEIsUUFBUSxFQUFFLGVBQWU7U0FDMUI7UUFDRCxNQUFNLEVBQUU7WUFDTixZQUFZLEVBQUUsd0JBQXdCO1lBQ3RDLGFBQWEsRUFBRSxFQUFFO1lBQ2pCLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLFFBQVEsRUFBRSxlQUFlO1NBQzFCO1FBQ0QsR0FBRyxFQUFFO1lBQ0gsWUFBWSxFQUFFLHFCQUFxQjtZQUNuQyxhQUFhLEVBQUUsQ0FBQztZQUNoQixVQUFVLEVBQUUsSUFBSTtZQUNoQixRQUFRLEVBQUUsZUFBZTtTQUMxQjtRQUNELFdBQVcsRUFBRTtZQUNYLFlBQVksRUFBRSx5QkFBeUI7WUFDdkMsYUFBYSxFQUFFLEVBQUU7WUFDakIsVUFBVSxFQUFFLElBQUk7WUFDaEIsUUFBUSxFQUFFLGVBQWU7U0FDMUI7S0FDRjtJQUVELHFCQUFxQjtJQUNyQixhQUFhLEVBQUU7UUFDYixTQUFTLEVBQUUsV0FBVztRQUN0QixPQUFPLEVBQUU7WUFDUCxjQUFjO1lBQ2Q7Z0JBQ0UsSUFBSSxFQUFFLGlCQUFpQjtnQkFDdkIsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsVUFBVSxFQUFFLENBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxZQUFZLENBQUM7YUFDakQ7WUFDRDtnQkFDRSxJQUFJLEVBQUUsWUFBWTtnQkFDbEIsSUFBSSxFQUFFLGNBQWM7Z0JBQ3BCLFVBQVUsRUFBRSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUM7YUFDbkM7WUFDRDtnQkFDRSxJ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LGFBQWEsRUFBRTtnQkFDYjtvQkFDRSxRQUFRLEVBQUUsT0FBTztvQkFDakIsUUFBUSxFQUFFLHlCQUF5QjtpQkFDcEM7Z0JBQ0Q7b0JBQ0UsUUFBUSxFQUFFLEtBQUs7b0JBQ2YsUUFBUSxFQUFFLGVBQWU7aUJBQzFCO2FBQ0Y7U0FDRjtRQUNELFFBQVEsRUFBRTtZQUNSLFNBQVMsRUFBRSxxQkFBcUI7WUFDaEMsV0FBVyxFQUFFLHFCQUFxQjtZQUNsQyxhQUFhLEVBQUU7Z0JBQ2I7b0JBQ0UsUUFBUSxFQUFFLE9BQU87b0JBQ2pCLFFBQVEsRUFBRSx5QkFBeUI7aUJBQ3BDO2FBQ0Y7U0FDRjtLQUNGO0lBRUQsdUJBQXVCO0lBQ3ZCLGtCQUFrQixFQUFFO1FBQ2xCO1lBQ0UsSUFBSSxFQUFFLFlBQVk7WUFDbEIsV0FBVyxFQUFFOzs7OztPQUtaO1NBQ0Y7UUFDRDtZQUNFLElBQUksRUFBRSxtQkFBbUI7WUFDekIsV0FBVyxFQUFFOzs7OztPQUtaO1NBQ0Y7UUFDRDtZQUNFLElBQUksRUFBRSxxQkFBcUI7WUFDM0IsV0FBVyxFQUFFOzs7OztPQUtaO1NBQ0Y7S0FDRjtDQUNGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogTW9uaXRvcmluZyBhbmQgTG9nZ2luZyBDb25maWd1cmF0aW9uIGZvciBzaHJhbS1TZXR1XHJcbiAqL1xyXG5cclxuZXhwb3J0IGNvbnN0IE1vbml0b3JpbmdDb25maWcgPSB7XHJcbiAgLy8gQ2xvdWRXYXRjaCBMb2cgR3JvdXBzXHJcbiAgbG9nR3JvdXBzOiB7XHJcbiAgICBhcGlHYXRld2F5OiB7XHJcbiAgICAgIGxvZ0dyb3VwTmFtZTogJy9hd3MvYXBpZ2F0ZXdheS9zaHJhbS1zZXR1JyxcclxuICAgICAgcmV0ZW50aW9uRGF5czogMzAsXHJcbiAgICAgIGVuY3J5cHRpb246IHRydWUsXHJcbiAgICAgIGttc0tleUlkOiAnJHtLTVNfS0VZX0lEfScsXHJcbiAgICB9LFxyXG4gICAgbGFtYmRhOiB7XHJcbiAgICAgIGxvZ0dyb3VwTmFtZTogJy9hd3MvbGFtYmRhL3NocmFtLXNldHUnLFxyXG4gICAgICByZXRlbnRpb25EYXlzOiAzMCxcclxuICAgICAgZW5jcnlwdGlvbjogdHJ1ZSxcclxuICAgICAga21zS2V5SWQ6ICcke0tNU19LRVlfSUR9JyxcclxuICAgIH0sXHJcbiAgICByZHM6IHtcclxuICAgICAgbG9nR3JvdXBOYW1lOiAnL2F3cy9yZHMvc2hyYW0tc2V0dScsXHJcbiAgICAgIHJldGVudGlvbkRheXM6IDcsXHJcbiAgICAgIGVuY3J5cHRpb246IHRydWUsXHJcbiAgICAgIGttc0tleUlkOiAnJHtLTVNfS0VZX0lEfScsXHJcbiAgICB9LFxyXG4gICAgYXBwbGljYXRpb246IHtcclxuICAgICAgbG9nR3JvdXBOYW1lOiAnL3NocmFtLXNldHUvYXBwbGljYXRpb24nLFxyXG4gICAgICByZXRlbnRpb25EYXlzOiA5MCxcclxuICAgICAgZW5jcnlwdGlvbjogdHJ1ZSxcclxuICAgICAga21zS2V5SWQ6ICcke0tNU19LRVlfSUR9JyxcclxuICAgIH0sXHJcbiAgfSxcclxuXHJcbiAgLy8gQ2xvdWRXYXRjaCBNZXRyaWNzXHJcbiAgY3VzdG9tTWV0cmljczoge1xyXG4gICAgbmFtZXNwYWNlOiAnc2hyYW1TZXR1JyxcclxuICAgIG1ldHJpY3M6IFtcclxuICAgICAgLy8gQVBJIG1ldHJpY3NcclxuICAgICAge1xyXG4gICAgICAgIG5hbWU6ICdBUElSZXF1ZXN0Q291bnQnLFxyXG4gICAgICAgIHVuaXQ6ICdDb3VudCcsXHJcbiAgICAgICAgZGltZW5zaW9uczogWydFbmRwb2ludCcsICdNZXRob2QnLCAnU3RhdHVzQ29kZSddLFxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgbmFtZTogJ0FQSUxhdGVuY3knLFxyXG4gICAgICAgIHVuaXQ6ICdNaWxsaXNlY29uZHMnLFxyXG4gICAgICAgIGRpbWVuc2lvbnM6IFsnRW5kcG9pbnQnLCAnTWV0aG9kJ10sXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBuYW1lOiAnQVBJRXJyb3JSYXRlJyxcclxuICAgICAgICB1bml0OiAnUGVyY2VudCcsXHJcbiAgICAgICAgZGltZW5zaW9uczogWydFbmRwb2ludCcsICdFcnJvclR5cGUnXSxcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIFZvaWNlIHByb2Nlc3NpbmcgbWV0cmljc1xyXG4gICAgICB7XHJcbiAgICAgICAgbmFtZTogJ1ZvaWNlVHJhbnNjcmlwdGlvblRpbWUnLFxyXG4gICAgICAgIHVuaXQ6ICdTZWNvbmRzJyxcclxuICAgICAgICBkaW1lbnNpb25zOiBbJ0xhbmd1YWdlJ10sXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBuYW1lOiAnVm9pY2VUcmFuc2NyaXB0aW9uQWNjdXJhY3knLFxyXG4gICAgICAgIHVuaXQ6ICdQZXJjZW50JyxcclxuICAgICAgICBkaW1lbnNpb25zOiBbJ0xhbmd1YWdlJ10sXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyBKb2IgbWFya2V0cGxhY2UgbWV0cmljc1xyXG4gICAgICB7XHJcbiAgICAgICAgbmFtZTogJ0pvYlNlYXJjaExhdGVuY3knLFxyXG4gICAgICAgIHVuaXQ6ICdNaWxsaXNlY29uZHMnLFxyXG4gICAgICAgIGRpbWVuc2lvbnM6IFsnQ2l0eSddLFxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgbmFtZTogJ0pvYkFwcGxpY2F0aW9uQ291bnQnLFxyXG4gICAgICAgIHVuaXQ6ICdDb3VudCcsXHJcbiAgICAgICAgZGltZW5zaW9uczogWydKb2JUeXBlJ10sXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyBGaW5hbmNpYWwgbGVkZ2VyIG1ldHJpY3NcclxuICAgICAge1xyXG4gICAgICAgIG5hbWU6ICdUcmFuc2FjdGlvbkNvdW50JyxcclxuICAgICAgICB1bml0OiAnQ291bnQnLFxyXG4gICAgICAgIGRpbWVuc2lvbnM6IFsnVHlwZScsICdTdGF0dXMnXSxcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIG5hbWU6ICdDb21wbGlhbmNlVmlvbGF0aW9ucycsXHJcbiAgICAgICAgdW5pdDogJ0NvdW50JyxcclxuICAgICAgICBkaW1lbnNpb25zOiBbJ1N0YXRlJywgJ1Zpb2xhdGlvblR5cGUnXSxcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIFRPVFAgbWV0cmljc1xyXG4gICAgICB7XHJcbiAgICAgICAgbmFtZTogJ1RPVFBHZW5lcmF0aW9uVGltZScsXHJcbiAgICAgICAgdW5pdDogJ01pbGxpc2Vjb25kcycsXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBuYW1lOiAnVE9UUFZhbGlkYXRpb25TdWNjZXNzJyxcclxuICAgICAgICB1bml0OiAnUGVyY2VudCcsXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyBTeW5jIG1ldHJpY3NcclxuICAgICAge1xyXG4gICAgICAgIG5hbWU6ICdTeW5jT3BlcmF0aW9uQ291bnQnLFxyXG4gICAgICAgIHVuaXQ6ICdDb3VudCcsXHJcbiAgICAgICAgZGltZW5zaW9uczogWydTdGF0dXMnXSxcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIG5hbWU6ICdTeW5jQ29uZmxpY3RDb3VudCcsXHJcbiAgICAgICAgdW5pdDogJ0NvdW50JyxcclxuICAgICAgICBkaW1lbnNpb25zOiBbJ0NvbmZsaWN0VHlwZSddLFxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gVXNlciBtZXRyaWNzXHJcbiAgICAgIHtcclxuICAgICAgICBuYW1lOiAnQWN0aXZlVXNlcnMnLFxyXG4gICAgICAgIHVuaXQ6ICdDb3VudCcsXHJcbiAgICAgICAgZGltZW5zaW9uczogWydSb2xlJywgJ0xhbmd1YWdlJ10sXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBuYW1lOiAnTmV3UmVnaXN0cmF0aW9ucycsXHJcbiAgICAgICAgdW5pdDogJ0NvdW50JyxcclxuICAgICAgICBkaW1lbnNpb25zOiBbJ1JvbGUnXSxcclxuICAgICAgfSxcclxuICAgIF0sXHJcbiAgfSxcclxuXHJcbiAgLy8gQ2xvdWRXYXRjaCBBbGFybXNcclxuICBhbGFybXM6IHtcclxuICAgIC8vIEFQSSBHYXRld2F5IGFsYXJtc1xyXG4gICAgYXBpR2F0ZXdheTogW1xyXG4gICAgICB7XHJcbiAgICAgICAgYWxhcm1OYW1lOiAnSGlnaEFQSUVycm9yUmF0ZScsXHJcbiAgICAgICAgbWV0cmljOiAnNVhYRXJyb3InLFxyXG4gICAgICAgIHRocmVzaG9sZDogMTAsXHJcbiAgICAgICAgZXZhbHVhdGlvblBlcmlvZHM6IDIsXHJcbiAgICAgICAgcGVyaW9kOiAzMDAsIC8vIDUgbWludXRlc1xyXG4gICAgICAgIGNvbXBhcmlzb25PcGVyYXRvcjogJ0dyZWF0ZXJUaGFuVGhyZXNob2xkJyxcclxuICAgICAgICB0cmVhdE1pc3NpbmdEYXRhOiAnbm90QnJlYWNoaW5nJyxcclxuICAgICAgICBhY3Rpb25zOiBbJyR7U05TX1RPUElDX0FSTn0nXSxcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGFsYXJtTmFtZTogJ0hpZ2hBUElMYXRlbmN5JyxcclxuICAgICAgICBtZXRyaWM6ICdMYXRlbmN5JyxcclxuICAgICAgICBzdGF0aXN0aWM6ICdBdmVyYWdlJyxcclxuICAgICAgICB0aHJlc2hvbGQ6IDMwMDAsIC8vIDMgc2Vjb25kc1xyXG4gICAgICAgIGV2YWx1YXRpb25QZXJpb2RzOiAzLFxyXG4gICAgICAgIHBlcmlvZDogMzAwLFxyXG4gICAgICAgIGNvbXBhcmlzb25PcGVyYXRvcjogJ0dyZWF0ZXJUaGFuVGhyZXNob2xkJyxcclxuICAgICAgICBhY3Rpb25zOiBbJyR7U05TX1RPUElDX0FSTn0nXSxcclxuICAgICAgfSxcclxuICAgIF0sXHJcblxyXG4gICAgLy8gTGFtYmRhIGFsYXJtc1xyXG4gICAgbGFtYmRhOiBbXHJcbiAgICAgIHtcclxuICAgICAgICBhbGFybU5hbWU6ICdMYW1iZGFFcnJvcnMnLFxyXG4gICAgICAgIG1ldHJpYzogJ0Vycm9ycycsXHJcbiAgICAgICAgdGhyZXNob2xkOiA1LFxyXG4gICAgICAgIGV2YWx1YXRpb25QZXJpb2RzOiAyLFxyXG4gICAgICAgIHBlcmlvZDogMzAwLFxyXG4gICAgICAgIGNvbXBhcmlzb25PcGVyYXRvcjogJ0dyZWF0ZXJUaGFuVGhyZXNob2xkJyxcclxuICAgICAgICBhY3Rpb25zOiBbJyR7U05TX1RPUElDX0FSTn0nXSxcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGFsYXJtTmFtZTogJ0xhbWJkYVRocm90dGxlcycsXHJcbiAgICAgICAgbWV0cmljOiAnVGhyb3R0bGVzJyxcclxuICAgICAgICB0aHJlc2hvbGQ6IDEwLFxyXG4gICAgICAgIGV2YWx1YXRpb25QZXJpb2RzOiAyLFxyXG4gICAgICAgIHBlcmlvZDogMzAwLFxyXG4gICAgICAgIGNvbXBhcmlzb25PcGVyYXRvcjogJ0dyZWF0ZXJUaGFuVGhyZXNob2xkJyxcclxuICAgICAgICBhY3Rpb25zOiBbJyR7U05TX1RPUElDX0FSTn0nXSxcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGFsYXJtTmFtZTogJ0xhbWJkYUR1cmF0aW9uJyxcclxuICAgICAgICBtZXRyaWM6ICdEdXJhdGlvbicsXHJcbiAgICAgICAgc3RhdGlzdGljOiAnQXZlcmFnZScsXHJcbiAgICAgICAgdGhyZXNob2xkOiAyNTAwMCwgLy8gMjUgc2Vjb25kcyAobmVhciB0aW1lb3V0KVxyXG4gICAgICAgIGV2YWx1YXRpb25QZXJpb2RzOiAyLFxyXG4gICAgICAgIHBlcmlvZDogMzAwLFxyXG4gICAgICAgIGNvbXBhcmlzb25PcGVyYXRvcjogJ0dyZWF0ZXJUaGFuVGhyZXNob2xkJyxcclxuICAgICAgICBhY3Rpb25zOiBbJyR7U05TX1RPUElDX0FSTn0nXSxcclxuICAgICAgfSxcclxuICAgIF0sXHJcblxyXG4gICAgLy8gRHluYW1vREIgYWxhcm1zXHJcbiAgICBkeW5hbW9kYjogW1xyXG4gICAgICB7XHJcbiAgICAgICAgYWxhcm1OYW1lOiAnRHluYW1vREJSZWFkVGhyb3R0bGVzJyxcclxuICAgICAgICBtZXRyaWM6ICdSZWFkVGhyb3R0bGVFdmVudHMnLFxyXG4gICAgICAgIHRocmVzaG9sZDogMTAsXHJcbiAgICAgICAgZXZhbHVhdGlvblBlcmlvZHM6IDIsXHJcbiAgICAgICAgcGVyaW9kOiAzMDAsXHJcbiAgICAgICAgY29tcGFyaXNvbk9wZXJhdG9yOiAnR3JlYXRlclRoYW5UaHJlc2hvbGQnLFxyXG4gICAgICAgIGFjdGlvbnM6IFsnJHtTTlNfVE9QSUNfQVJOfSddLFxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgYWxhcm1OYW1lOiAnRHluYW1vREJXcml0ZVRocm90dGxlcycsXHJcbiAgICAgICAgbWV0cmljOiAnV3JpdGVUaHJvdHRsZUV2ZW50cycsXHJcbiAgICAgICAgdGhyZXNob2xkOiAxMCxcclxuICAgICAgICBldmFsdWF0aW9uUGVyaW9kczogMixcclxuICAgICAgICBwZXJpb2Q6IDMwMCxcclxuICAgICAgICBjb21wYXJpc29uT3BlcmF0b3I6ICdHcmVhdGVyVGhhblRocmVzaG9sZCcsXHJcbiAgICAgICAgYWN0aW9uczogWycke1NOU19UT1BJQ19BUk59J10sXHJcbiAgICAgIH0sXHJcbiAgICBdLFxyXG5cclxuICAgIC8vIFJEUyBhbGFybXNcclxuICAgIHJkczogW1xyXG4gICAgICB7XHJcbiAgICAgICAgYWxhcm1OYW1lOiAnUkRTSGlnaENQVScsXHJcbiAgICAgICAgbWV0cmljOiAnQ1BVVXRpbGl6YXRpb24nLFxyXG4gICAgICAgIHRocmVzaG9sZDogODAsXHJcbiAgICAgICAgZXZhbHVhdGlvblBlcmlvZHM6IDMsXHJcbiAgICAgICAgcGVyaW9kOiAzMDAsXHJcbiAgICAgICAgY29tcGFyaXNvbk9wZXJhdG9yOiAnR3JlYXRlclRoYW5UaHJlc2hvbGQnLFxyXG4gICAgICAgIGFjdGlvbnM6IFsnJHtTTlNfVE9QSUNfQVJOfSddLFxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgYWxhcm1OYW1lOiAnUkRTTG93U3RvcmFnZScsXHJcbiAgICAgICAgbWV0cmljOiAnRnJlZVN0b3JhZ2VTcGFjZScsXHJcbiAgICAgICAgdGhyZXNob2xkOiA1MzY4NzA5MTIwLCAvLyA1R0JcclxuICAgICAgICBldmFsdWF0aW9uUGVyaW9kczogMSxcclxuICAgICAgICBwZXJpb2Q6IDMwMCxcclxuICAgICAgICBjb21wYXJpc29uT3BlcmF0b3I6ICdMZXNzVGhhblRocmVzaG9sZCcsXHJcbiAgICAgICAgYWN0aW9uczogWycke1NOU19UT1BJQ19BUk59J10sXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBhbGFybU5hbWU6ICdSRFNIaWdoQ29ubmVjdGlvbnMnLFxyXG4gICAgICAgIG1ldHJpYzogJ0RhdGFiYXNlQ29ubmVjdGlvbnMnLFxyXG4gICAgICAgIHRocmVzaG9sZDogODAsXHJcbiAgICAgICAgZXZhbHVhdGlvblBlcmlvZHM6IDIsXHJcbiAgICAgICAgcGVyaW9kOiAzMDAsXHJcbiAgICAgICAgY29tcGFyaXNvbk9wZXJhdG9yOiAnR3JlYXRlclRoYW5UaHJlc2hvbGQnLFxyXG4gICAgICAgIGFjdGlvbnM6IFsnJHtTTlNfVE9QSUNfQVJOfSddLFxyXG4gICAgICB9LFxyXG4gICAgXSxcclxuXHJcbiAgICAvLyBFbGFzdGlDYWNoZSBhbGFybXNcclxuICAgIGVsYXN0aWNhY2hlOiBbXHJcbiAgICAgIHtcclxuICAgICAgICBhbGFybU5hbWU6ICdSZWRpc0hpZ2hDUFUnLFxyXG4gICAgICAgIG1ldHJpYzogJ0NQVVV0aWxpemF0aW9uJyxcclxuICAgICAgICB0aHJlc2hvbGQ6IDc1LFxyXG4gICAgICAgIGV2YWx1YXRpb25QZXJpb2RzOiAyLFxyXG4gICAgICAgIHBlcmlvZDogMzAwLFxyXG4gICAgICAgIGNvbXBhcmlzb25PcGVyYXRvcjogJ0dyZWF0ZXJUaGFuVGhyZXNob2xkJyxcclxuICAgICAgICBhY3Rpb25zOiBbJyR7U05TX1RPUElDX0FSTn0nXSxcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGFsYXJtTmFtZTogJ1JlZGlzSGlnaE1lbW9yeScsXHJcbiAgICAgICAgbWV0cmljOiAnRGF0YWJhc2VNZW1vcnlVc2FnZVBlcmNlbnRhZ2UnLFxyXG4gICAgICAgIHRocmVzaG9sZDogOTAsXHJcbiAgICAgICAgZXZhbHVhdGlvblBlcmlvZHM6IDIsXHJcbiAgICAgICAgcGVyaW9kOiAzMDAsXHJcbiAgICAgICAgY29tcGFyaXNvbk9wZXJhdG9yOiAnR3JlYXRlclRoYW5UaHJlc2hvbGQnLFxyXG4gICAgICAgIGFjdGlvbnM6IFsnJHtTTlNfVE9QSUNfQVJOfSddLFxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgYWxhcm1OYW1lOiAnUmVkaXNIaWdoRXZpY3Rpb25zJyxcclxuICAgICAgICBtZXRyaWM6ICdFdmljdGlvbnMnLFxyXG4gICAgICAgIHRocmVzaG9sZDogMTAwMCxcclxuICAgICAgICBldmFsdWF0aW9uUGVyaW9kczogMSxcclxuICAgICAgICBwZXJpb2Q6IDMwMCxcclxuICAgICAgICBjb21wYXJpc29uT3BlcmF0b3I6ICdHcmVhdGVyVGhhblRocmVzaG9sZCcsXHJcbiAgICAgICAgYWN0aW9uczogWycke1NOU19UT1BJQ19BUk59J10sXHJcbiAgICAgIH0sXHJcbiAgICBdLFxyXG4gIH0sXHJcblxyXG4gIC8vIFgtUmF5IFRyYWNpbmdcclxuICB4cmF5OiB7XHJcbiAgICBlbmFibGVkOiB0cnVlLFxyXG4gICAgc2FtcGxpbmdSYXRlOiAwLjEsIC8vIDEwJSBvZiByZXF1ZXN0c1xyXG4gICAgXHJcbiAgICAvLyBUcmFjZSBzZWdtZW50c1xyXG4gICAgc2VnbWVudHM6IHtcclxuICAgICAgYXBpR2F0ZXdheTogdHJ1ZSxcclxuICAgICAgbGFtYmRhOiB0cnVlLFxyXG4gICAgICBkeW5hbW9kYjogdHJ1ZSxcclxuICAgICAgcmRzOiB0cnVlLFxyXG4gICAgICBzMzogdHJ1ZSxcclxuICAgICAgc25zOiB0cnVlLFxyXG4gICAgfSxcclxuXHJcbiAgICAvLyBTZXJ2aWNlIG1hcFxyXG4gICAgc2VydmljZU1hcDoge1xyXG4gICAgICBlbmFibGVkOiB0cnVlLFxyXG4gICAgICByZWZyZXNoSW50ZXJ2YWw6IDMwMCwgLy8gNSBtaW51dGVzXHJcbiAgICB9LFxyXG4gIH0sXHJcblxyXG4gIC8vIENsb3VkV2F0Y2ggRGFzaGJvYXJkc1xyXG4gIGRhc2hib2FyZHM6IHtcclxuICAgIG1haW46IHtcclxuICAgICAgZGFzaGJvYXJkTmFtZTogJ3NocmFtU2V0dS1NYWluJyxcclxuICAgICAgd2lkZ2V0czogW1xyXG4gICAgICAgIC8vIEFQSSBtZXRyaWNzXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdHlwZTogJ21ldHJpYycsXHJcbiAgICAgICAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgICAgIG1ldHJpY3M6IFtcclxuICAgICAgICAgICAgICBbJ0FXUy9BcGlHYXRld2F5JywgJ0NvdW50JywgeyBzdGF0OiAnU3VtJyB9XSxcclxuICAgICAgICAgICAgICBbJy4nLCAnNFhYRXJyb3InLCB7IHN0YXQ6ICdTdW0nIH1dLFxyXG4gICAgICAgICAgICAgIFsnLicsICc1WFhFcnJvcicsIHsgc3RhdDogJ1N1bScgfV0sXHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgIHBlcmlvZDogMzAwLFxyXG4gICAgICAgICAgICBzdGF0OiAnU3VtJyxcclxuICAgICAgICAgICAgcmVnaW9uOiAnYXAtc291dGgtMScsXHJcbiAgICAgICAgICAgIHRpdGxlOiAnQVBJIEdhdGV3YXkgUmVxdWVzdHMnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIExhbWJkYSBtZXRyaWNzXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdHlwZTogJ21ldHJpYycsXHJcbiAgICAgICAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgICAgIG1ldHJpY3M6IFtcclxuICAgICAgICAgICAgICBbJ0FXUy9MYW1iZGEnLCAnSW52b2NhdGlvbnMnLCB7IHN0YXQ6ICdTdW0nIH1dLFxyXG4gICAgICAgICAgICAgIFsnLicsICdFcnJvcnMnLCB7IHN0YXQ6ICdTdW0nIH1dLFxyXG4gICAgICAgICAgICAgIFsnLicsICdUaHJvdHRsZXMnLCB7IHN0YXQ6ICdTdW0nIH1dLFxyXG4gICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICBwZXJpb2Q6IDMwMCxcclxuICAgICAgICAgICAgc3RhdDogJ1N1bScsXHJcbiAgICAgICAgICAgIHJlZ2lvbjogJ2FwLXNvdXRoLTEnLFxyXG4gICAgICAgICAgICB0aXRsZTogJ0xhbWJkYSBJbnZvY2F0aW9ucycsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8gRHluYW1vREIgbWV0cmljc1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIHR5cGU6ICdtZXRyaWMnLFxyXG4gICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICBtZXRyaWNzOiBbXHJcbiAgICAgICAgICAgICAgWydBV1MvRHluYW1vREInLCAnQ29uc3VtZWRSZWFkQ2FwYWNpdHlVbml0cycsIHsgc3RhdDogJ1N1bScgfV0sXHJcbiAgICAgICAgICAgICAgWycuJywgJ0NvbnN1bWVkV3JpdGVDYXBhY2l0eVVuaXRzJywgeyBzdGF0OiAnU3VtJyB9XSxcclxuICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgcGVyaW9kOiAzMDAsXHJcbiAgICAgICAgICAgIHN0YXQ6ICdTdW0nLFxyXG4gICAgICAgICAgICByZWdpb246ICdhcC1zb3V0aC0xJyxcclxuICAgICAgICAgICAgdGl0bGU6ICdEeW5hbW9EQiBDYXBhY2l0eScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgIF0sXHJcbiAgICB9LFxyXG4gIH0sXHJcblxyXG4gIC8vIFNOUyBUb3BpY3MgZm9yIGFsZXJ0c1xyXG4gIHNuc1RvcGljczoge1xyXG4gICAgY3JpdGljYWw6IHtcclxuICAgICAgdG9waWNOYW1lOiAnc2hyYW0tc2V0dS1jcml0aWNhbC1hbGVydHMnLFxyXG4gICAgICBkaXNwbGF5TmFtZTogJ3NocmFtLVNldHUgQ3JpdGljYWwgQWxlcnRzJyxcclxuICAgICAgc3Vic2NyaXB0aW9uczogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIHByb3RvY29sOiAnZW1haWwnLFxyXG4gICAgICAgICAgZW5kcG9pbnQ6ICdvcHMtdGVhbUBzaHJhbS1zZXR1LmNvbScsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBwcm90b2NvbDogJ3NtcycsXHJcbiAgICAgICAgICBlbmRwb2ludDogJys5MVhYWFhYWFhYWFgnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIF0sXHJcbiAgICB9LFxyXG4gICAgd2FybmluZ3M6IHtcclxuICAgICAgdG9waWNOYW1lOiAnc2hyYW0tc2V0dS13YXJuaW5ncycsXHJcbiAgICAgIGRpc3BsYXlOYW1lOiAnc2hyYW0tU2V0dSBXYXJuaW5ncycsXHJcbiAgICAgIHN1YnNjcmlwdGlvbnM6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBwcm90b2NvbDogJ2VtYWlsJyxcclxuICAgICAgICAgIGVuZHBvaW50OiAnZGV2LXRlYW1Ac2hyYW0tc2V0dS5jb20nLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIF0sXHJcbiAgICB9LFxyXG4gIH0sXHJcblxyXG4gIC8vIExvZyBJbnNpZ2h0cyBRdWVyaWVzXHJcbiAgbG9nSW5zaWdodHNRdWVyaWVzOiBbXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6ICdBUEkgRXJyb3JzJyxcclxuICAgICAgcXVlcnlTdHJpbmc6IGBcclxuICAgICAgICBmaWVsZHMgQHRpbWVzdGFtcCwgQG1lc3NhZ2VcclxuICAgICAgICB8IGZpbHRlciBAbWVzc2FnZSBsaWtlIC9FUlJPUi9cclxuICAgICAgICB8IHNvcnQgQHRpbWVzdGFtcCBkZXNjXHJcbiAgICAgICAgfCBsaW1pdCAxMDBcclxuICAgICAgYCxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6ICdTbG93IEFQSSBSZXF1ZXN0cycsXHJcbiAgICAgIHF1ZXJ5U3RyaW5nOiBgXHJcbiAgICAgICAgZmllbGRzIEB0aW1lc3RhbXAsIEBtZXNzYWdlLCBAZHVyYXRpb25cclxuICAgICAgICB8IGZpbHRlciBAZHVyYXRpb24gPiAzMDAwXHJcbiAgICAgICAgfCBzb3J0IEBkdXJhdGlvbiBkZXNjXHJcbiAgICAgICAgfCBsaW1pdCA1MFxyXG4gICAgICBgLFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgbmFtZTogJ0ZhaWxlZCBUcmFuc2FjdGlvbnMnLFxyXG4gICAgICBxdWVyeVN0cmluZzogYFxyXG4gICAgICAgIGZpZWxkcyBAdGltZXN0YW1wLCB0cmFuc2FjdGlvbklkLCBlcnJvck1lc3NhZ2VcclxuICAgICAgICB8IGZpbHRlciBzdGF0dXMgPSBcImZhaWxlZFwiXHJcbiAgICAgICAgfCBzb3J0IEB0aW1lc3RhbXAgZGVzY1xyXG4gICAgICAgIHwgbGltaXQgMTAwXHJcbiAgICAgIGAsXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG4iXX0=