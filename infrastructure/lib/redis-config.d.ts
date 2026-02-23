/**
 * ElastiCache Redis Configuration for shram-Setu
 */
export declare const RedisConfig: {
    clusterName: string;
    purpose: string;
    cluster: {
        nodeType: string;
        numCacheNodes: number;
        engine: string;
        engineVersion: string;
        port: number;
    };
    security: {
        transitEncryptionEnabled: boolean;
        atRestEncryptionEnabled: boolean;
        authTokenEnabled: boolean;
    };
    backup: {
        snapshotRetentionLimit: number;
        snapshotWindow: string;
        preferredMaintenanceWindow: string;
    };
    parameters: {
        maxmemoryPolicy: string;
        timeout: number;
        tcpKeepalive: number;
        maxmemory: string;
    };
    dataStructures: {
        sessions: {
            keyPattern: string;
            ttl: number;
            type: string;
            fields: string[];
        };
        totpCodes: {
            keyPattern: string;
            ttl: number;
            type: string;
            value: string;
        };
        rateLimits: {
            keyPattern: string;
            ttl: number;
            type: string;
            value: string;
        };
        otpCodes: {
            keyPattern: string;
            ttl: number;
            type: string;
            fields: string[];
        };
        voiceContext: {
            keyPattern: string;
            ttl: number;
            type: string;
            fields: string[];
        };
        syncStatus: {
            keyPattern: string;
            ttl: number;
            type: string;
            fields: string[];
        };
        activeSessions: {
            keyPattern: string;
            ttl: number;
            type: string;
            fields: string[];
        };
    };
    connectionPool: {
        maxConnections: number;
        minConnections: number;
        acquireTimeout: number;
        idleTimeout: number;
    };
    monitoring: {
        metrics: string[];
        alarms: {
            highCPU: {
                threshold: number;
                evaluationPeriods: number;
                period: number;
            };
            highMemory: {
                threshold: number;
                evaluationPeriods: number;
                period: number;
            };
            highEvictions: {
                threshold: number;
                evaluationPeriods: number;
                period: number;
            };
        };
    };
};
/**
 * Redis Client Configuration for Lambda Functions
 */
export declare const RedisClientConfig: {
    connection: {
        host: string;
        port: number;
        password: string;
        tls: {
            enabled: boolean;
        };
        retryStrategy: {
            maxAttempts: number;
            initialDelay: number;
            maxDelay: number;
            multiplier: number;
        };
    };
    commandTimeout: number;
    keyNaming: {
        separator: string;
        prefix: string;
        format: string;
    };
};
/**
 * Common Redis Operations
 */
export declare const RedisOperations: {
    session: {
        create: string;
        get: string;
        update: string;
        delete: string;
        extend: string;
    };
    totp: {
        store: string;
        get: string;
        delete: string;
    };
    rateLimit: {
        increment: string;
        setExpiry: string;
        check: string;
    };
    otp: {
        store: string;
        get: string;
        incrementAttempts: string;
        delete: string;
    };
};
/**
 * Redis Best Practices
 */
export declare const RedisBestPractices: {
    keyDesign: string[];
    performance: string[];
    security: string[];
    monitoring: string[];
};
