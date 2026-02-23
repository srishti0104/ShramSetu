/**
 * AWS KMS Configuration for shram-Setu
 */
export declare const KMSConfig: {
    masterKey: {
        alias: string;
        description: string;
        enableKeyRotation: boolean;
        rotationPeriod: number;
        removalPolicy: string;
        keyPolicy: {
            Version: string;
            Statement: ({
                Sid: string;
                Effect: string;
                Principal: {
                    AWS: string;
                    Service?: undefined;
                };
                Action: string;
                Resource: string;
            } | {
                Sid: string;
                Effect: string;
                Principal: {
                    Service: string[];
                    AWS?: undefined;
                };
                Action: string[];
                Resource: string;
            })[];
        };
    };
    dataClassification: {
        highlySensitive: {
            data: string[];
            encryption: string;
            keyRotation: boolean;
            auditLogging: boolean;
        };
        sensitive: {
            data: string[];
            encryption: string;
            keyRotation: boolean;
            auditLogging: boolean;
        };
        internal: {
            data: string[];
            encryption: string;
            keyRotation: boolean;
            auditLogging: boolean;
        };
    };
    encryptionAtRest: {
        dynamodb: {
            enabled: boolean;
            keyType: string;
            keyAlias: string;
        };
        rds: {
            enabled: boolean;
            keyType: string;
            keyAlias: string;
        };
        s3: {
            enabled: boolean;
            keyType: string;
            keyAlias: string;
            bucketKeyEnabled: boolean;
        };
        elasticache: {
            enabled: boolean;
            keyType: string;
        };
        cloudwatchLogs: {
            enabled: boolean;
            keyType: string;
            keyAlias: string;
        };
    };
    encryptionInTransit: {
        apiGateway: {
            protocol: string;
            certificateType: string;
        };
        rds: {
            sslMode: string;
            certificateVerification: boolean;
        };
        elasticache: {
            transitEncryption: boolean;
            authToken: boolean;
        };
        lambda: {
            environmentVariables: string;
        };
    };
    keyGrants: {
        lambda: {
            grantee: string;
            operations: string[];
        };
        s3: {
            grantee: string;
            operations: string[];
        };
    };
    monitoring: {
        cloudWatchMetrics: string[];
        alarms: {
            unusualActivity: {
                metric: string;
                threshold: number;
                period: number;
                evaluationPeriods: number;
            };
        };
    };
    compliance: {
        cloudTrailLogging: boolean;
        keyUsageLogging: boolean;
        accessLogging: boolean;
        retentionPeriod: number;
    };
};
