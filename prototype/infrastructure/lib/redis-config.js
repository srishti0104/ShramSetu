"use strict";
/**
 * ElastiCache Redis Configuration for shram-Setu
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisBestPractices = exports.RedisOperations = exports.RedisClientConfig = exports.RedisConfig = void 0;
exports.RedisConfig = {
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
exports.RedisClientConfig = {
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
exports.RedisOperations = {
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
exports.RedisBestPractices = {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVkaXMtY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicmVkaXMtY29uZmlnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7O0FBRVUsUUFBQSxXQUFXLEdBQUc7SUFDekIsV0FBVyxFQUFFLGtCQUFrQjtJQUMvQixPQUFPLEVBQUUsaURBQWlEO0lBRTFELHdCQUF3QjtJQUN4QixPQUFPLEVBQUU7UUFDUCxRQUFRLEVBQUUsZ0JBQWdCO1FBQzFCLGFBQWEsRUFBRSxDQUFDO1FBQ2hCLE1BQU0sRUFBRSxPQUFPO1FBQ2YsYUFBYSxFQUFFLEtBQUs7UUFDcEIsSUFBSSxFQUFFLElBQUk7S0FDWDtJQUVELFdBQVc7SUFDWCxRQUFRLEVBQUU7UUFDUix3QkFBd0IsRUFBRSxJQUFJO1FBQzlCLHVCQUF1QixFQUFFLElBQUk7UUFDN0IsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLHVCQUF1QjtLQUNoRDtJQUVELHlCQUF5QjtJQUN6QixNQUFNLEVBQUU7UUFDTixzQkFBc0IsRUFBRSxDQUFDLEVBQUUsT0FBTztRQUNsQyxjQUFjLEVBQUUsYUFBYSxFQUFFLE1BQU07UUFDckMsMEJBQTBCLEVBQUUscUJBQXFCLEVBQUUsTUFBTTtLQUMxRDtJQUVELDJCQUEyQjtJQUMzQixVQUFVLEVBQUU7UUFDVixlQUFlLEVBQUUsYUFBYSxFQUFFLGlDQUFpQztRQUNqRSxPQUFPLEVBQUUsR0FBRyxFQUFFLHlDQUF5QztRQUN2RCxZQUFZLEVBQUUsR0FBRztRQUNqQixTQUFTLEVBQUUsT0FBTyxFQUFFLDBCQUEwQjtLQUMvQztJQUVELHFDQUFxQztJQUNyQyxjQUFjLEVBQUU7UUFDZCxxQkFBcUI7UUFDckIsUUFBUSxFQUFFO1lBQ1IsVUFBVSxFQUFFLGtCQUFrQjtZQUM5QixHQUFHLEVBQUUsSUFBSSxFQUFFLFNBQVM7WUFDcEIsSUFBSSxFQUFFLE1BQU07WUFDWixNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLGNBQWMsRUFB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QztJQUVELFFBQVEsRUFBRTtRQUNSLG1CQUFtQjtRQUNuQixtQ0FBbUM7UUFDbkMsOEJBQThCO1FBQzlCLDZDQUE2QztLQUM5QztJQUVELFVBQVUsRUFBRTtRQUNWLG9DQUFvQztRQUNwQyw0QkFBNEI7UUFDNUIsMEJBQTBCO1FBQzFCLDBCQUEwQjtLQUMzQjtDQUNGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogRWxhc3RpQ2FjaGUgUmVkaXMgQ29uZmlndXJhdGlvbiBmb3Igc2hyYW0tU2V0dVxyXG4gKi9cclxuXHJcbmV4cG9ydCBjb25zdCBSZWRpc0NvbmZpZyA9IHtcclxuICBjbHVzdGVyTmFtZTogJ3NocmFtLXNldHUtcmVkaXMnLFxyXG4gIHB1cnBvc2U6ICdTZXNzaW9uIG1hbmFnZW1lbnQgYW5kIGFjdGl2ZSBUT1RQIGNvZGUgc3RvcmFnZScsXHJcbiAgXHJcbiAgLy8gQ2x1c3RlciBjb25maWd1cmF0aW9uXHJcbiAgY2x1c3Rlcjoge1xyXG4gICAgbm9kZVR5cGU6ICdjYWNoZS50My5taWNybycsXHJcbiAgICBudW1DYWNoZU5vZGVzOiAxLFxyXG4gICAgZW5naW5lOiAncmVkaXMnLFxyXG4gICAgZW5naW5lVmVyc2lvbjogJzcuMCcsXHJcbiAgICBwb3J0OiA2Mzc5LFxyXG4gIH0sXHJcblxyXG4gIC8vIFNlY3VyaXR5XHJcbiAgc2VjdXJpdHk6IHtcclxuICAgIHRyYW5zaXRFbmNyeXB0aW9uRW5hYmxlZDogdHJ1ZSxcclxuICAgIGF0UmVzdEVuY3J5cHRpb25FbmFibGVkOiB0cnVlLFxyXG4gICAgYXV0aFRva2VuRW5hYmxlZDogdHJ1ZSwgLy8gUmVxdWlyZSBBVVRIIGNvbW1hbmRcclxuICB9LFxyXG5cclxuICAvLyBCYWNrdXAgYW5kIG1haW50ZW5hbmNlXHJcbiAgYmFja3VwOiB7XHJcbiAgICBzbmFwc2hvdFJldGVudGlvbkxpbWl0OiA1LCAvLyBkYXlzXHJcbiAgICBzbmFwc2hvdFdpbmRvdzogJzAzOjAwLTA1OjAwJywgLy8gVVRDXHJcbiAgICBwcmVmZXJyZWRNYWludGVuYW5jZVdpbmRvdzogJ3N1bjowNTowMC1zdW46MDc6MDAnLCAvLyBVVENcclxuICB9LFxyXG5cclxuICAvLyBQYXJhbWV0ZXIgZ3JvdXAgc2V0dGluZ3NcclxuICBwYXJhbWV0ZXJzOiB7XHJcbiAgICBtYXhtZW1vcnlQb2xpY3k6ICdhbGxrZXlzLWxydScsIC8vIEV2aWN0IGxlYXN0IHJlY2VudGx5IHVzZWQga2V5c1xyXG4gICAgdGltZW91dDogMzAwLCAvLyBDbG9zZSBpZGxlIGNvbm5lY3Rpb25zIGFmdGVyIDUgbWludXRlc1xyXG4gICAgdGNwS2VlcGFsaXZlOiAzMDAsXHJcbiAgICBtYXhtZW1vcnk6ICcwLjhnYicsIC8vIDgwJSBvZiBhdmFpbGFibGUgbWVtb3J5XHJcbiAgfSxcclxuXHJcbiAgLy8gRGF0YSBzdHJ1Y3R1cmVzIGFuZCB1c2FnZSBwYXR0ZXJuc1xyXG4gIGRhdGFTdHJ1Y3R1cmVzOiB7XHJcbiAgICAvLyBTZXNzaW9uIG1hbmFnZW1lbnRcclxuICAgIHNlc3Npb25zOiB7XHJcbiAgICAgIGtleVBhdHRlcm46ICdzZXNzaW9uOnt1c2VySWR9JyxcclxuICAgICAgdHRsOiAzNjAwLCAvLyAxIGhvdXJcclxuICAgICAgdHlwZTogJ2hhc2gnLFxyXG4gICAgICBmaWVsZHM6IFsndXNlcklkJywgJ3Rva2VuJywgJ2xhc3RBY3Rpdml0eScsICdkZXZpY2VJbmZvJ10sXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIFRPVFAgY29kZXNcclxuICAgIHRvdHBDb2Rlczoge1xyXG4gICAgICBrZXlQYXR0ZXJuOiAndG90cDp7c2Vzc2lvbklkfScsXHJcbiAgICAgIHR0bDogMzAwLCAvLyA1IG1pbnV0ZXNcclxuICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgIHZhbHVlOiAnNi1kaWdpdCBjb2RlJyxcclxuICAgIH0sXHJcblxyXG4gICAgLy8gUmF0ZSBsaW1pdGluZ1xyXG4gICAgcmF0ZUxpbWl0czoge1xyXG4gICAgICBrZXlQYXR0ZXJuOiAncmF0ZWxpbWl0Ont1c2VySWR9OnthY3Rpb259JyxcclxuICAgICAgdHRsOiA2MCwgLy8gMSBtaW51dGVcclxuICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgIHZhbHVlOiAncmVxdWVzdCBjb3VudCcsXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIE9UUCB2ZXJpZmljYXRpb25cclxuICAgIG90cENvZGVzOiB7XHJcbiAgICAgIGtleVBhdHRlcm46ICdvdHA6e21vYmlsZU51bWJlcn0nLFxyXG4gICAgICB0dGw6IDMwMCwgLy8gNSBtaW51dGVzXHJcbiAgICAgIHR5cGU6ICdoYXNoJyxcclxuICAgICAgZmllbGRzOiBbJ2NvZGUnLCAnYXR0ZW1wdHMnLCAnY3JlYXRlZEF0J10sXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIFZvaWNlIHNlc3Npb24gY29udGV4dFxyXG4gICAgdm9pY2VDb250ZXh0OiB7XHJcbiAgICAgIGtleVBhdHRlcm46ICd2b2ljZTp7c2Vzc2lvbklkfScsXHJcbiAgICAgIHR0bDogMTgwMCwgLy8gMzAgbWludXRlc1xyXG4gICAgICB0eXBlOiAnaGFzaCcsXHJcbiAgICAgIGZpZWxkczogWyd1c2VySWQnLCAnbGFuZ3VhZ2UnLCAnY3VycmVudEludGVudCcsICdoaXN0b3J5J10sXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIFN5bmMgcXVldWUgc3RhdHVzXHJcbiAgICBzeW5jU3RhdHVzOiB7XHJcbiAgICAgIGtleVBhdHRlcm46ICdzeW5jOnt1c2VySWR9JyxcclxuICAgICAgdHRsOiAzNjAwLCAvLyAxIGhvdXJcclxuICAgICAgdHlwZTogJ2hhc2gnLFxyXG4gICAgICBmaWVsZHM6IFsnbGFzdFN5bmNUaW1lJywgJ3BlbmRpbmdPcHMnLCAnZmFpbGVkT3BzJ10sXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIEFjdGl2ZSB3b3JrIHNlc3Npb25zXHJcbiAgICBhY3RpdmVTZXNzaW9uczoge1xyXG4gICAgICBrZXlQYXR0ZXJuOiAnd29ya3Nlc3Npb246e3Nlc3Npb25JZH0nLFxyXG4gICAgICB0dGw6IDI4ODAwLCAvLyA4IGhvdXJzXHJcbiAgICAgIHR5cGU6ICdoYXNoJyxcclxuICAgICAgZmllbGRzOiBbJ2NvbnRyYWN0b3JJZCcsICdqb2JJZCcsICdzdGFydFRpbWUnLCAnZXhwZWN0ZWRXb3JrZXJzJ10sXHJcbiAgICB9LFxyXG4gIH0sXHJcblxyXG4gIC8vIENvbm5lY3Rpb24gcG9vbCBzZXR0aW5nc1xyXG4gIGNvbm5lY3Rpb25Qb29sOiB7XHJcbiAgICBtYXhDb25uZWN0aW9uczogNTAsXHJcbiAgICBtaW5Db25uZWN0aW9uczogNSxcclxuICAgIGFjcXVpcmVUaW1lb3V0OiAxMDAwMCwgLy8gMTAgc2Vjb25kc1xyXG4gICAgaWRsZVRpbWVvdXQ6IDMwMDAwLCAvLyAzMCBzZWNvbmRzXHJcbiAgfSxcclxuXHJcbiAgLy8gTW9uaXRvcmluZyBhbmQgYWxlcnRzXHJcbiAgbW9uaXRvcmluZzoge1xyXG4gICAgbWV0cmljczogW1xyXG4gICAgICAnQ1BVVXRpbGl6YXRpb24nLFxyXG4gICAgICAnRGF0YWJhc2VNZW1vcnlVc2FnZVBlcmNlbnRhZ2UnLFxyXG4gICAgICAnTmV0d29ya0J5dGVzSW4nLFxyXG4gICAgICAnTmV0d29ya0J5dGVzT3V0JyxcclxuICAgICAgJ0N1cnJDb25uZWN0aW9ucycsXHJcbiAgICAgICdFdmljdGlvbnMnLFxyXG4gICAgICAnQ2FjaGVIaXRzJyxcclxuICAgICAgJ0NhY2hlTWlzc2VzJyxcclxuICAgIF0sXHJcbiAgICBhbGFybXM6IHtcclxuICAgICAgaGlnaENQVToge1xyXG4gICAgICAgIHRocmVzaG9sZDogNzUsIC8vIHBlcmNlbnRcclxuICAgICAgICBldmFsdWF0aW9uUGVyaW9kczogMixcclxuICAgICAgICBwZXJpb2Q6IDMwMCwgLy8gNSBtaW51dGVzXHJcbiAgICAgIH0sXHJcbiAgICAgIGhpZ2hNZW1vcnk6IHtcclxuICAgICAgICB0aHJlc2hvbGQ6IDkwLCAvLyBwZXJjZW50XHJcbiAgICAgICAgZXZhbHVhdGlvblBlcmlvZHM6IDIsXHJcbiAgICAgICAgcGVyaW9kOiAzMDAsXHJcbiAgICAgIH0sXHJcbiAgICAgIGhpZ2hFdmljdGlvbnM6IHtcclxuICAgICAgICB0aHJlc2hvbGQ6IDEwMDAsXHJcbiAgICAgICAgZXZhbHVhdGlvblBlcmlvZHM6IDEsXHJcbiAgICAgICAgcGVyaW9kOiAzMDAsXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbn07XHJcblxyXG4vKipcclxuICogUmVkaXMgQ2xpZW50IENvbmZpZ3VyYXRpb24gZm9yIExhbWJkYSBGdW5jdGlvbnNcclxuICovXHJcbmV4cG9ydCBjb25zdCBSZWRpc0NsaWVudENvbmZpZyA9IHtcclxuICAvLyBDb25uZWN0aW9uIG9wdGlvbnNcclxuICBjb25uZWN0aW9uOiB7XHJcbiAgICBob3N0OiAnJHtSRURJU19FTkRQT0lOVH0nLCAvLyBGcm9tIGVudmlyb25tZW50IHZhcmlhYmxlXHJcbiAgICBwb3J0OiA2Mzc5LFxyXG4gICAgcGFzc3dvcmQ6ICcke1JFRElTX0FVVEhfVE9LRU59JywgLy8gRnJvbSBTZWNyZXRzIE1hbmFnZXJcclxuICAgIHRsczoge1xyXG4gICAgICBlbmFibGVkOiB0cnVlLFxyXG4gICAgfSxcclxuICAgIHJldHJ5U3RyYXRlZ3k6IHtcclxuICAgICAgbWF4QXR0ZW1wdHM6IDMsXHJcbiAgICAgIGluaXRpYWxEZWxheTogMTAwLCAvLyBtc1xyXG4gICAgICBtYXhEZWxheTogMjAwMCwgLy8gbXNcclxuICAgICAgbXVsdGlwbGllcjogMixcclxuICAgIH0sXHJcbiAgfSxcclxuXHJcbiAgLy8gQ29tbWFuZCB0aW1lb3V0XHJcbiAgY29tbWFuZFRpbWVvdXQ6IDUwMDAsIC8vIDUgc2Vjb25kc1xyXG5cclxuICAvLyBLZXkgbmFtaW5nIGNvbnZlbnRpb25zXHJcbiAga2V5TmFtaW5nOiB7XHJcbiAgICBzZXBhcmF0b3I6ICc6JyxcclxuICAgIHByZWZpeDogJ3NocmFtJyxcclxuICAgIGZvcm1hdDogJ3NocmFtOntlbnRpdHl9OntpZH0nLFxyXG4gIH0sXHJcbn07XHJcblxyXG4vKipcclxuICogQ29tbW9uIFJlZGlzIE9wZXJhdGlvbnNcclxuICovXHJcbmV4cG9ydCBjb25zdCBSZWRpc09wZXJhdGlvbnMgPSB7XHJcbiAgLy8gU2Vzc2lvbiBtYW5hZ2VtZW50XHJcbiAgc2Vzc2lvbjoge1xyXG4gICAgY3JlYXRlOiAnSFNFVCBzZXNzaW9uOnt1c2VySWR9IGZpZWxkIHZhbHVlJyxcclxuICAgIGdldDogJ0hHRVRBTEwgc2Vzc2lvbjp7dXNlcklkfScsXHJcbiAgICB1cGRhdGU6ICdIU0VUIHNlc3Npb246e3VzZXJJZH0gZmllbGQgdmFsdWUnLFxyXG4gICAgZGVsZXRlOiAnREVMIHNlc3Npb246e3VzZXJJZH0nLFxyXG4gICAgZXh0ZW5kOiAnRVhQSVJFIHNlc3Npb246e3VzZXJJZH0gMzYwMCcsXHJcbiAgfSxcclxuXHJcbiAgLy8gVE9UUCBtYW5hZ2VtZW50XHJcbiAgdG90cDoge1xyXG4gICAgc3RvcmU6ICdTRVRFWCB0b3RwOntzZXNzaW9uSWR9IDMwMCB7Y29kZX0nLFxyXG4gICAgZ2V0OiAnR0VUIHRvdHA6e3Nlc3Npb25JZH0nLFxyXG4gICAgZGVsZXRlOiAnREVMIHRvdHA6e3Nlc3Npb25JZH0nLFxyXG4gIH0sXHJcblxyXG4gIC8vIFJhdGUgbGltaXRpbmdcclxuICByYXRlTGltaXQ6IHtcclxuICAgIGluY3JlbWVudDogJ0lOQ1IgcmF0ZWxpbWl0Ont1c2VySWR9OnthY3Rpb259JyxcclxuICAgIHNldEV4cGlyeTogJ0VYUElSRSByYXRlbGltaXQ6e3VzZXJJZH06e2FjdGlvbn0gNjAnLFxyXG4gICAgY2hlY2s6ICdHRVQgcmF0ZWxpbWl0Ont1c2VySWR9OnthY3Rpb259JyxcclxuICB9LFxyXG5cclxuICAvLyBPVFAgbWFuYWdlbWVudFxyXG4gIG90cDoge1xyXG4gICAgc3RvcmU6ICdITVNFVCBvdHA6e21vYmlsZX0gY29kZSB7Y29kZX0gYXR0ZW1wdHMgMCBjcmVhdGVkQXQge3RpbWVzdGFtcH0nLFxyXG4gICAgZ2V0OiAnSEdFVEFMTCBvdHA6e21vYmlsZX0nLFxyXG4gICAgaW5jcmVtZW50QXR0ZW1wdHM6ICdISU5DUkJZIG90cDp7bW9iaWxlfSBhdHRlbXB0cyAxJyxcclxuICAgIGRlbGV0ZTogJ0RFTCBvdHA6e21vYmlsZX0nLFxyXG4gIH0sXHJcbn07XHJcblxyXG4vKipcclxuICogUmVkaXMgQmVzdCBQcmFjdGljZXNcclxuICovXHJcbmV4cG9ydCBjb25zdCBSZWRpc0Jlc3RQcmFjdGljZXMgPSB7XHJcbiAga2V5RGVzaWduOiBbXHJcbiAgICAnVXNlIGRlc2NyaXB0aXZlIGtleSBuYW1lcyB3aXRoIGNvbnNpc3RlbnQgbmFtaW5nIGNvbnZlbnRpb24nLFxyXG4gICAgJ0luY2x1ZGUgZW50aXR5IHR5cGUgYW5kIElEIGluIGtleSBuYW1lJyxcclxuICAgICdVc2UgY29sb25zIGFzIHNlcGFyYXRvcnMgKGUuZy4sIHVzZXI6MTIzOnNlc3Npb24pJyxcclxuICAgICdTZXQgYXBwcm9wcmlhdGUgVFRMIGZvciBhbGwga2V5cyB0byBwcmV2ZW50IG1lbW9yeSBibG9hdCcsXHJcbiAgXSxcclxuICBcclxuICBwZXJmb3JtYW5jZTogW1xyXG4gICAgJ1VzZSBwaXBlbGluaW5nIGZvciBtdWx0aXBsZSBjb21tYW5kcycsXHJcbiAgICAnQXZvaWQgS0VZUyBjb21tYW5kIGluIHByb2R1Y3Rpb24gKHVzZSBTQ0FOIGluc3RlYWQpJyxcclxuICAgICdVc2UgY29ubmVjdGlvbiBwb29saW5nJyxcclxuICAgICdTZXQgcmVhc29uYWJsZSBjb21tYW5kIHRpbWVvdXRzJyxcclxuICBdLFxyXG5cclxuICBzZWN1cml0eTogW1xyXG4gICAgJ0VuYWJsZSBBVVRIIHRva2VuJyxcclxuICAgICdVc2UgVExTIGZvciBlbmNyeXB0aW9uIGluIHRyYW5zaXQnLFxyXG4gICAgJ1JvdGF0ZSBBVVRIIHRva2VucyByZWd1bGFybHknLFxyXG4gICAgJ1Jlc3RyaWN0IG5ldHdvcmsgYWNjZXNzIHZpYSBzZWN1cml0eSBncm91cHMnLFxyXG4gIF0sXHJcblxyXG4gIG1vbml0b3Jpbmc6IFtcclxuICAgICdNb25pdG9yIG1lbW9yeSB1c2FnZSBhbmQgZXZpY3Rpb25zJyxcclxuICAgICdUcmFjayBjYWNoZSBoaXQvbWlzcyByYXRpbycsXHJcbiAgICAnTW9uaXRvciBjb25uZWN0aW9uIGNvdW50JyxcclxuICAgICdTZXQgdXAgQ2xvdWRXYXRjaCBhbGFybXMnLFxyXG4gIF0sXHJcbn07XHJcblxyXG4iXX0=