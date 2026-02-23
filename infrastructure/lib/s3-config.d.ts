/**
 * S3 Bucket Configurations for shram-Setu
 */
export declare const S3BucketConfig: {
    audioBucket: {
        bucketName: string;
        purpose: string;
        encryption: string;
        versioning: boolean;
        lifecycleRules: {
            id: string;
            enabled: boolean;
            transitions: {
                storageClass: string;
                transitionAfter: number;
            }[];
            expiration: number;
        }[];
        corsRules: {
            allowedOrigins: string[];
            allowedMethods: string[];
            allowedHeaders: string[];
            maxAge: number;
        }[];
        publicAccess: {
            blockPublicAcls: boolean;
            blockPublicPolicy: boolean;
            ignorePublicAcls: boolean;
            restrictPublicBuckets: boolean;
        };
    };
    documentBucket: {
        bucketName: string;
        purpose: string;
        encryption: string;
        versioning: boolean;
        lifecycleRules: {
            id: string;
            enabled: boolean;
            transitions: {
                storageClass: string;
                transitionAfter: number;
            }[];
        }[];
        corsRules: {
            allowedOrigins: string[];
            allowedMethods: string[];
            allowedHeaders: string[];
            maxAge: number;
        }[];
        publicAccess: {
            blockPublicAcls: boolean;
            blockPublicPolicy: boolean;
            ignorePublicAcls: boolean;
            restrictPublicBuckets: boolean;
        };
    };
    folderStructure: {
        audio: {
            grievances: string;
            voiceCommands: string;
            transcriptions: string;
        };
        documents: {
            payslips: string;
            receipts: string;
            verificationDocs: string;
            eShramCards: string;
        };
    };
    presignedUrlConfig: {
        upload: {
            expiresIn: number;
            maxFileSize: number;
        };
        download: {
            expiresIn: number;
        };
    };
    allowedFileTypes: {
        audio: string[];
        images: string[];
        documents: string[];
    };
    fileSizeLimits: {
        audio: number;
        image: number;
        document: number;
    };
};
/**
 * S3 Event Notifications Configuration
 */
export declare const S3EventConfig: {
    payslipUpload: {
        events: string[];
        prefix: string;
        suffix: string;
        lambdaFunction: string;
    };
    grievanceAudioUpload: {
        events: string[];
        prefix: string;
        suffix: string;
        lambdaFunction: string;
    };
};
/**
 * CloudFront Distribution Configuration for S3
 */
export declare const CloudFrontConfig: {
    enabled: boolean;
    priceClass: string;
    geoRestriction: {
        restrictionType: string;
        locations: string[];
    };
    cacheBehaviors: {
        audio: {
            pathPattern: string;
            minTTL: number;
            defaultTTL: number;
            maxTTL: number;
        };
        documents: {
            pathPattern: string;
            minTTL: number;
            defaultTTL: number;
            maxTTL: number;
        };
    };
};
