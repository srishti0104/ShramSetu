/**
 * ElastiCache Redis Configuration for shram-Setu
 */

export const RedisConfig = {
  clusterName: 'shram-setu-redis',
  purpose: 'Session management and active TOTP code storage',
  
  // Cluster configuration
  cluster: {
    nodeType: 'cache.t3.micro',
    numCacheNodes: 1,
    engine: 'redis',
    engineVersion: '7.0',
    port: 6379,
  },

  // Security
  security: {
    transitEncryptionEnabled: true,
    atRestEncryptionEnabled: true,
    authTokenEnabled: true, // Require AUTH command
  },

  // Backup and maintenance
  backup: {
    snapshotRetentionLimit: 5, // days
    snapshotWindow: '03:00-05:00', // UTC
    preferredMaintenanceWindow: 'sun:05:00-sun:07:00', // UTC
  },

  // Parameter group settings
  parameters: {
    maxmemoryPolicy: 'allkeys-lru', // Evict least recently used keys
    timeout: 300, // Close idle connections after 5 minutes
    tcpKeepalive: 300,
    maxmemory: '0.8gb', // 80% of available memory
  },

  // Data structures and usage patterns
  dataStructures: {
    // Session management
    sessions: {
      keyPattern: 'session:{userId}',
      ttl: 3600, // 1 hour
      type: 'hash',
      fields: ['userId', 'token', 'lastActivity', 'deviceInfo'],
    },

    // TOTP codes
    totpCodes: {
      keyPattern: 'totp:{sessionId}',
      ttl: 300, // 5 minutes
      type: 'string',
      value: '6-digit code',
    },

    // Rate limiting
    rateLimits: {
      keyPattern: 'ratelimit:{userId}:{action}',
      ttl: 60, // 1 minute
      type: 'string',
      value: 'request count',
    },

    // OTP verification
    otpCodes: {
      keyPattern: 'otp:{mobileNumber}',
      ttl: 300, // 5 minutes
      type: 'hash',
      fields: ['code', 'attempts', 'createdAt'],
    },

    // Voice session context
    voiceContext: {
      keyPattern: 'voice:{sessionId}',
      ttl: 1800, // 30 minutes
      type: 'hash',
      fields: ['userId', 'language', 'currentIntent', 'history'],
    },

    // Sync queue status
    syncStatus: {
      keyPattern: 'sync:{userId}',
      ttl: 3600, // 1 hour
      type: 'hash',
      fields: ['lastSyncTime', 'pendingOps', 'failedOps'],
    },

    // Active work sessions
    activeSessions: {
      keyPattern: 'worksession:{sessionId}',
      ttl: 28800, // 8 hours
      type: 'hash',
      fields: ['contractorId', 'jobId', 'startTime', 'expectedWorkers'],
    },
  },

  // Connection pool settings
  connectionPool: {
    maxConnections: 50,
    minConnections: 5,
    acquireTimeout: 10000, // 10 seconds
    idleTimeout: 30000, // 30 seconds
  },

  // Monitoring and alerts
  monitoring: {
    metrics: [
      'CPUUtilization',
      'DatabaseMemoryUsagePercentage',
      'NetworkBytesIn',
      'NetworkBytesOut',
      'CurrConnections',
      'Evictions',
      'CacheHits',
      'CacheMisses',
    ],
    alarms: {
      highCPU: {
        threshold: 75, // percent
        evaluationPeriods: 2,
        period: 300, // 5 minutes
      },
      highMemory: {
        threshold: 90, // percent
        evaluationPeriods: 2,
        period: 300,
      },
      highEvictions: {
        threshold: 1000,
        evaluationPeriods: 1,
        period: 300,
      },
    },
  },
};

/**
 * Redis Client Configuration for Lambda Functions
 */
export const RedisClientConfig = {
  // Connection options
  connection: {
    host: '${REDIS_ENDPOINT}', // From environment variable
    port: 6379,
    password: '${REDIS_AUTH_TOKEN}', // From Secrets Manager
    tls: {
      enabled: true,
    },
    retryStrategy: {
      maxAttempts: 3,
      initialDelay: 100, // ms
      maxDelay: 2000, // ms
      multiplier: 2,
    },
  },

  // Command timeout
  commandTimeout: 5000, // 5 seconds

  // Key naming conventions
  keyNaming: {
    separator: ':',
    prefix: 'shram',
    format: 'shram:{entity}:{id}',
  },
};

/**
 * Common Redis Operations
 */
export const RedisOperations = {
  // Session management
  session: {
    create: 'HSET session:{userId} field value',
    get: 'HGETALL session:{userId}',
    update: 'HSET session:{userId} field value',
    delete: 'DEL session:{userId}',
    extend: 'EXPIRE session:{userId} 3600',
  },

  // TOTP management
  totp: {
    store: 'SETEX totp:{sessionId} 300 {code}',
    get: 'GET totp:{sessionId}',
    delete: 'DEL totp:{sessionId}',
  },

  // Rate limiting
  rateLimit: {
    increment: 'INCR ratelimit:{userId}:{action}',
    setExpiry: 'EXPIRE ratelimit:{userId}:{action} 60',
    check: 'GET ratelimit:{userId}:{action}',
  },

  // OTP management
  otp: {
    store: 'HMSET otp:{mobile} code {code} attempts 0 createdAt {timestamp}',
    get: 'HGETALL otp:{mobile}',
    incrementAttempts: 'HINCRBY otp:{mobile} attempts 1',
    delete: 'DEL otp:{mobile}',
  },
};

/**
 * Redis Best Practices
 */
export const RedisBestPractices = {
  keyDesign: [
    'Use descriptive key names with consistent naming convention',
    'Include entity type and ID in key name',
    'Use colons as separators (e.g., user:123:session)',
    'Set appropriate TTL for all keys to prevent memory bloat',
  ],
  
  performance: [
    'Use pipelining for multiple commands',
    'Avoid KEYS command in production (use SCAN instead)',
    'Use connection pooling',
    'Set reasonable command timeouts',
  ],

  security: [
    'Enable AUTH token',
    'Use TLS for encryption in transit',
    'Rotate AUTH tokens regularly',
    'Restrict network access via security groups',
  ],

  monitoring: [
    'Monitor memory usage and evictions',
    'Track cache hit/miss ratio',
    'Monitor connection count',
    'Set up CloudWatch alarms',
  ],
};

