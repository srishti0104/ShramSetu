/**
 * Monitoring and Logging Configuration for shram-Setu
 */

export const MonitoringConfig = {
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

