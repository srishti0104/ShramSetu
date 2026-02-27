"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.shramSetuStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const dynamodb = __importStar(require("aws-cdk-lib/aws-dynamodb"));
const rds = __importStar(require("aws-cdk-lib/aws-rds"));
const ec2 = __importStar(require("aws-cdk-lib/aws-ec2"));
const s3 = __importStar(require("aws-cdk-lib/aws-s3"));
const kms = __importStar(require("aws-cdk-lib/aws-kms"));
const elasticache = __importStar(require("aws-cdk-lib/aws-elasticache"));
const apigateway = __importStar(require("aws-cdk-lib/aws-apigateway"));
const iam = __importStar(require("aws-cdk-lib/aws-iam"));
class shramSetuStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // KMS Key for encryption
        const encryptionKey = new kms.Key(this, 'shramSetuEncryptionKey', {
            description: 'Encryption key for shram-Setu sensitive data',
            enableKeyRotation: true,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
        });
        // VPC for RDS and ElastiCache
        const vpc = new ec2.Vpc(this, 'shramSetuVPC', {
            maxAzs: 2,
            natGateways: 1,
        });
        // S3 Buckets
        const audioBucket = new s3.Bucket(this, 'AudioBucket', {
            bucketName: `shram-setu-audio-${this.account}`,
            encryption: s3.BucketEncryption.KMS,
            encryptionKey: encryptionKey,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            versioned: true,
            lifecycleRules: [
                {
                    expiration: cdk.Duration.days(365),
                    transitions: [
                        {
                            storageClass: s3.StorageClass.INTELLIGENT_TIERING,
                            transitionAfter: cdk.Duration.days(30),
                        },
                    ],
                },
            ],
        });
        const documentBucket = new s3.Bucket(this, 'DocumentBucket', {
            bucketName: `shram-setu-documents-${this.account}`,
            encryption: s3.BucketEncryption.KMS,
            encryptionKey: encryptionKey,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            versioned: true,
        });
        // DynamoDB Tables
        const usersTable = new dynamodb.Table(this, 'UsersTable', {
            tableName: 'shram-setu-users',
            partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            encryption: dynamodb.TableEncryption.CUSTOMER_MANAGED,
            encryptionKey: encryptionKey,
            pointInTimeRecovery: true,
            stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
        });
        usersTable.addGlobalSecondaryIndex({
            indexName: 'mobileNumber-index',
            partitionKey: { name: 'mobileNumber', type: dynamodb.AttributeType.STRING },
        });
        const jobsTable = new dynamodb.Table(this, 'JobsTable', {
            tableName: 'shram-setu-jobs',
            partitionKey: { name: 'jobId', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            encryption: dynamodb.TableEncryption.CUSTOMER_MANAGED,
            encryptionKey: encryptionKey,
            pointInTimeRecovery: true,
            stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
        });
        jobsTable.addGlobalSecondaryIndex({
            indexName: 'city-status-index',
            partitionKey: { name: 'city', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'status', type: dynamodb.AttributeType.STRING },
        });
        const ratingsTable = new dynamodb.Table(this, 'RatingsTable', {
            tableName: 'shram-setu-ratings',
            partitionKey: { name: 'ratingId', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            encryption: dynamodb.TableEncryption.CUSTOMER_MANAGED,
            encryptionKey: encryptionKey,
            pointInTimeRecovery: true,
        });
        ratingsTable.addGlobalSecondaryIndex({
            indexName: 'toUserId-index',
            partitionKey: { name: 'toUserId', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'createdAt', type: dynamodb.AttributeType.NUMBER },
        });
        const syncOperationsTable = new dynamodb.Table(this, 'SyncOperationsTable', {
            tableName: 'shram-setu-sync-operations',
            partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'timestamp', type: dynamodb.AttributeType.NUMBER },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            encryption: dynamodb.TableEncryption.CUSTOMER_MANAGED,
            encryptionKey: encryptionKey,
            timeToLiveAttribute: 'ttl',
        });
        const attendanceTable = new dynamodb.Table(this, 'AttendanceTable', {
            tableName: 'shram-setu-attendance',
            partitionKey: { name: 'sessionId', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'recordId', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            encryption: dynamodb.TableEncryption.CUSTOMER_MANAGED,
            encryptionKey: encryptionKey,
            pointInTimeRecovery: true,
        });
        // PostgreSQL RDS for Financial Ledger
        const dbSecurityGroup = new ec2.SecurityGroup(this, 'DBSecurityGroup', {
            vpc,
            description: 'Security group for RDS PostgreSQL',
            allowAllOutbound: true,
        });
        const rdsInstance = new rds.DatabaseInstance(this, 'LedgerDatabase', {
            engine: rds.DatabaseInstanceEngine.postgres({
                version: rds.PostgresEngineVersion.VER_15,
            }),
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.SMALL),
            vpc,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
            },
            securityGroups: [dbSecurityGroup],
            databaseName: 'shram_setu_ledger',
            storageEncrypted: true,
            storageEncryptionKey: encryptionKey,
            backupRetention: cdk.Duration.days(7),
            deletionProtection: true,
            multiAz: true,
        });
        // ElastiCache Redis for Session Management
        const cacheSecurityGroup = new ec2.SecurityGroup(this, 'CacheSecurityGroup', {
            vpc,
            description: 'Security group for ElastiCache Redis',
            allowAllOutbound: true,
        });
        const cacheSubnetGroup = new elasticache.CfnSubnetGroup(this, 'CacheSubnetGroup', {
            description: 'Subnet group for ElastiCache',
            subnetIds: vpc.privateSubnets.map(subnet => subnet.subnetId),
        });
        const redisCluster = new elasticache.CfnCacheCluster(this, 'RedisCluster', {
            cacheNodeType: 'cache.t3.micro',
            engine: 'redis',
            numCacheNodes: 1,
            vpcSecurityGroupIds: [cacheSecurityGroup.securityGroupId],
            cacheSubnetGroupName: cacheSubnetGroup.ref,
            engineVersion: '7.0',
            transitEncryptionEnabled: true,
        });
        // Lambda Execution Role
        const lambdaRole = new iam.Role(this, 'LambdaExecutionRole', {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole'),
                iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
            ],
        });
        // Grant permissions
        usersTable.grantReadWriteData(lambdaRole);
        jobsTable.grantReadWriteData(lambdaRole);
        ratingsTable.grantReadWriteData(lambdaRole);
        syncOperationsTable.grantReadWriteData(lambdaRole);
        attendanceTable.grantReadWriteData(lambdaRole);
        audioBucket.grantReadWrite(lambdaRole);
        documentBucket.grantReadWrite(lambdaRole);
        encryptionKey.grantEncryptDecrypt(lambdaRole);
        // Grant AWS AI/ML service permissions
        lambdaRole.addToPolicy(new iam.PolicyStatement({
            actions: [
                'transcribe:StartTranscriptionJob',
                'transcribe:GetTranscriptionJob',
                'polly:SynthesizeSpeech',
                'lex:PostText',
                'lex:PostContent',
                'textract:AnalyzeDocument',
                'textract:DetectDocumentText',
                'rekognition:DetectText',
                'rekognition:DetectLabels',
                'comprehend:DetectSentiment',
                'comprehend:DetectEntities',
                'geo:SearchPlaceIndexForPosition',
                'geo:SearchPlaceIndexForText',
                'geo:CalculateRoute',
            ],
            resources: ['*'],
        }));
        // API Gateway
        const api = new apigateway.RestApi(this, 'shramSetuAPI', {
            restApiName: 'shram-Setu API',
            description: 'API for shram-Setu platform',
            deployOptions: {
                stageName: 'v1',
                throttlingRateLimit: 1000,
                throttlingBurstLimit: 2000,
            },
            defaultCorsPreflightOptions: {
                allowOrigins: apigateway.Cors.ALL_ORIGINS,
                allowMethods: apigateway.Cors.ALL_METHODS,
            },
        });
        // Outputs
        new cdk.CfnOutput(this, 'APIEndpoint', {
            value: api.url,
            description: 'API Gateway endpoint URL',
        });
        new cdk.CfnOutput(this, 'UsersTableName', {
            value: usersTable.tableName,
        });
        new cdk.CfnOutput(this, 'JobsTableName', {
            value: jobsTable.tableName,
        });
        new cdk.CfnOutput(this, 'RatingsTableName', {
            value: ratingsTable.tableName,
        });
        new cdk.CfnOutput(this, 'AudioBucketName', {
            value: audioBucket.bucketName,
        });
        new cdk.CfnOutput(this, 'DocumentBucketName', {
            value: documentBucket.bucketName,
        });
        new cdk.CfnOutput(this, 'RDSEndpoint', {
            value: rdsInstance.dbInstanceEndpointAddress,
        });
        new cdk.CfnOutput(this, 'RedisEndpoint', {
            value: redisCluster.attrRedisEndpointAddress,
        });
        new cdk.CfnOutput(this, 'EncryptionKeyId', {
            value: encryptionKey.keyId,
        });
    }
}
exports.shramSetuStack = shramSetuStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hyYW1pay1zZXR1LXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2hyYW1pay1zZXR1LXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlEQUFtQztBQUVuQyxtRUFBcUQ7QUFDckQseURBQTJDO0FBQzNDLHlEQUEyQztBQUMzQyx1REFBeUM7QUFDekMseURBQTJDO0FBQzNDLHlFQUEyRDtBQUMzRCx1RUFBeUQ7QUFFekQseURBQTJDO0FBRTNDLE1BQWEsY0FBZSxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQzNDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDOUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIseUJBQXlCO1FBQ3pCLE1BQU0sYUFBYSxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsd0JBQXdCLEVBQUU7WUFDaEUsV0FBVyxFQUFFLDhDQUE4QztZQUMzRCxpQkFBaUIsRUFBRSxJQUFJO1lBQ3ZCLGFBQWEsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLE1BQU07U0FDeEMsQ0FBQyxDQUFDO1FBRUgsOEJBQThCO1FBQzlCLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFO1lBQzVDLE1BQU0sRUFBRSxDQUFDO1lBQ1QsV0FBVyxFQUFFLENBQUM7U0FDZixDQUFDLENBQUM7UUFFSCxhQUFhO1FBQ2IsTUFBTSxXQUFXLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7WUFDckQsVUFBVSxFQUFFLG9CQUFvQixJQUFJLENBQUMsT0FBTyxFQUFFO1lBQzlDLFVBQVUsRUFBRSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsR0FBRztZQUNuQyxhQUFhLEVBQUUsYUFBYTtZQUM1QixpQkFBaUIsRUFBRSxFQUFFLENBQUMsaUJBQWlCLENBQUMsU0FBUztZQUNqRCxTQUFTLEVBQUUsSUFBSTtZQUNmLGNBQWMsRUFBRTtnQkFDZDtvQkFDRSxVQUFVLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO29CQUNsQyxXQUFXLEVBQUU7d0JBQ1g7NEJBQ0UsWUFBWSxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsbUJBQW1COzRCQUNqRCxlQUFlLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO3lCQUN2QztxQkFDRjtpQkFDRjthQUNGO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsTUFBTSxjQUFjLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRTtZQUMzRCxVQUFVLEVBQUUsd0JBQXdCLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDbEQsVUFBVSxFQUFFLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHO1lBQ25DLGFBQWEsRUFBRSxhQUFhO1lBQzVCLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTO1lBQ2pELFNBQVMsRUFBRSxJQUFJO1NBQ2hCLENBQUMsQ0FBQztRQUVILGtCQUFrQjtRQUNsQixNQUFNLFVBQVUsR0FBRyxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRTtZQUN4RCxTQUFTLEVBQUUsa0JBQWtCO1lBQzdCLFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFO1lBQ3JFLFdBQVcsRUFBRSxRQUFRLENBQUMsV0FBVyxDQUFDLGVBQWU7WUFDakQsVUFBVSxFQUFFLFFBQVEsQ0FBQyxlQUFlLENBQUMsZ0JBQWdCO1lBQ3JELGFBQWEsRUFBRSxhQUFhO1lBQzVCLG1CQUFtQixFQUFFLElBQUk7WUFDekIsTUFBTSxFQUFFLFFBQVEsQ0FBQyxjQUFjLENBQUMsa0JBQWtCO1NBQ25ELENBQUMsQ0FBQztRQUVILFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQztZQUNqQyxTQUFTLEVBQUUsb0JBQW9CO1lBQy9CLFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFO1NBQzVFLENBQUMsQ0FBQztRQUVILE1BQU0sU0FBUyxHQUFHLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFO1lBQ3RELFNBQVMsRUFBRSxpQkFBaUI7WUFDNUIsWUFBWSxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUU7WUFDcEUsV0FBVyxFQUFFLFFBQVEsQ0FBQyxXQUFXLENBQUMsZUFBZTtZQUNqRCxVQUFVLEVBQUUsUUFBUSxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0I7WUFDckQsYUFBYSxFQUFFLGFBQWE7WUFDNUIsbUJBQW1CLEVBQUUsSUFBSTtZQUN6QixNQUFNLEVBQUUsUUFBUSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0I7U0FDbkQsQ0FBQyxDQUFDO1FBRUgsU0FBUyxDQUFDLHVCQUF1QixDQUFDO1lBQ2hDLFNBQVMsRUFBRSxtQkFBbUI7WUFDOUIsWUFBWSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUU7WUFDbkUsT0FBTyxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUU7U0FDakUsQ0FBQyxDQUFDO1FBRUgsTUFBTSxZQUFZLEdBQUcsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7WUFDNUQsU0FBUyxFQUFFLG9CQUFvQjtZQUMvQixZQUFZLEVBQUUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRTtZQUN2RSxXQUFXLEVBQUUsUUFBUSxDQUFDLFdBQVcsQ0FBQyxlQUFlO1lBQ2pELFVBQVUsRUFBRSxRQUFRLENBQUMsZUFBZSxDQUFDLGdCQUFnQjtZQUNyRCxhQUFhLEVBQUUsYUFBYTtZQUM1QixtQkFBbUIsRUFBRSxJQUFJO1NBQzFCLENBQUMsQ0FBQztRQUVILFlBQVksQ0FBQyx1QkFBdUIsQ0FBQztZQUNuQyxTQUFTLEVBQUUsZ0JBQWdCO1lBQzNCLFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFO1lBQ3ZFLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFO1NBQ3BFLENBQUMsQ0FBQztRQUVILE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxxQkFBcUIsRUFBRTtZQUMxRSxTQUFTLEVBQUUsNEJBQTRCO1lBQ3ZDLFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFO1lBQ3JFLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFO1lBQ25FLFdBQVcsRUFBRSxRQUFRLENBQUMsV0FBVyxDQUFDLGVBQWU7WUFDakQsVUFBVSxFQUFFLFFBQVEsQ0FBQyxlQUFlLENBQUMsZ0JBQWdCO1lBQ3JELGFBQWEsRUFBRSxhQUFhO1lBQzVCLG1CQUFtQixFQUFFLEtBQUs7U0FDM0IsQ0FBQyxDQUFDO1FBRUgsTUFBTSxlQUFlLEdBQUcsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRTtZQUNsRSxTQUFTLEVBQUUsdUJBQXVCO1lBQ2xDLFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFO1lBQ3hFLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFO1lBQ2xFLFdBQVcsRUFBRSxRQUFRLENBQUMsV0FBVyxDQUFDLGVBQWU7WUFDakQsVUFBVSxFQUFFLFFBQVEsQ0FBQyxlQUFlLENBQUMsZ0JBQWdCO1lBQ3JELGFBQWEsRUFBRSxhQUFhO1lBQzVCLG1CQUFtQixFQUFFLElBQUk7U0FDMUIsQ0FBQyxDQUFDO1FBRUgsc0NBQXNDO1FBQ3RDLE1BQU0sZUFBZSxHQUFHLElBQUksR0FBRyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLEVBQUU7WUFDckUsR0FBRztZQUNILFdBQVcsRUFBRSxtQ0FBbUM7WUFDaEQsZ0JBQWdCLEVBQUUsSUFBSTtTQUN2QixDQUFDLENBQUM7UUFFSCxNQUFNLFdBQVcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUU7WUFDbkUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUM7Z0JBQzFDLE9BQU8sRUFBRSxHQUFHLENBQUMscUJBQXFCLENBQUMsTUFBTTthQUMxQyxDQUFDO1lBQ0YsWUFBWSxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO1lBQy9FLEdBQUc7WUFDSCxVQUFVLEVBQUU7Z0JBQ1YsVUFBVSxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsbUJBQW1CO2FBQy9DO1lBQ0QsY0FBYyxFQUFFLENBQUMsZUFBZSxDQUFDO1lBQ2pDLFlBQVksRUFBRSxtQkFBbUI7WUFDakMsZ0JBQWdCLEVBQUUsSUFBSTtZQUN0QixvQkFBb0IsRUFBRSxhQUFhO1lBQ25DLGVBQWUsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDckMsa0JBQWtCLEVBQUUsSUFBSTtZQUN4QixPQUFPLEVBQUUsSUFBSTtTQUNkLENBQUMsQ0FBQztRQUVILDJDQUEyQztRQUMzQyxNQUFNLGtCQUFrQixHQUFHLElBQUksR0FBRyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUU7WUFDM0UsR0FBRztZQUNILFdBQVcsRUFBRSxzQ0FBc0M7WUFDbkQsZ0JBQWdCLEVBQUUsSUFBSTtTQUN2QixDQUFDLENBQUM7UUFFSCxNQUFNLGdCQUFnQixHQUFHLElBQUksV0FBVyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUU7WUFDaEYsV0FBVyxFQUFFLDhCQUE4QjtZQUMzQyxTQUFTLEVBQUUsR0FBRyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO1NBQzdELENBQUMsQ0FBQztRQUVILE1BQU0sWUFBWSxHQUFHLElBQUksV0FBVyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFO1lBQ3pFLGFBQWEsRUFBRSxnQkFBZ0I7WUFDL0IsTUFBTSxFQUFFLE9BQU87WUFDZixhQUFhLEVBQUUsQ0FBQztZQUNoQixtQkFBbUIsRUFBRSxDQUFDLGtCQUFrQixDQUFDLGVBQWUsQ0FBQztZQUN6RCxvQkFBb0IsRUFBRSxnQkFBZ0IsQ0FBQyxHQUFHO1lBQzFDLGFBQWEsRUFBRSxLQUFLO1lBQ3BCLHdCQUF3QixFQUFFLElBQUk7U0FDL0IsQ0FBQyxDQUFDO1FBRUgsd0JBQXdCO1FBQ3hCLE1BQU0sVUFBVSxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUU7WUFDM0QsU0FBUyxFQUFFLElBQUksR0FBRyxDQUFDLGdCQUFnQixDQUFDLHNCQUFzQixDQUFDO1lBQzNELGVBQWUsRUFBRTtnQkFDZixHQUFHLENBQUMsYUFBYSxDQUFDLHdCQUF3QixDQUFDLDhDQUE4QyxDQUFDO2dCQUMxRixHQUFHLENBQUMsYUFBYSxDQUFDLHdCQUF3QixDQUFDLDBDQUEwQyxDQUFDO2FBQ3ZGO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsb0JBQW9CO1FBQ3BCLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMxQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDekMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzVDLG1CQUFtQixDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ25ELGVBQWUsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMvQyxXQUFXLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3ZDLGNBQWMsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDMUMsYUFBYSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRTlDLHNDQUFzQztRQUN0QyxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQztZQUM3QyxPQUFPLEVBQUU7Z0JBQ1Asa0NBQWtDO2dCQUNsQyxnQ0FBZ0M7Z0JBQ2hDLHdCQUF3QjtnQkFDeEIsY0FBYztnQkFDZCxpQkFBaUI7Z0JBQ2pCLDBCQUEwQjtnQkFDMUIsNkJBQTZCO2dCQUM3Qix3QkFBd0I7Z0JBQ3hCLDBCQUEwQjtnQkFDMUIsNEJBQTRCO2dCQUM1QiwyQkFBMkI7Z0JBQzNCLGlDQUFpQztnQkFDakMsNkJBQTZCO2dCQUM3QixvQkFBb0I7YUFDckI7WUFDRCxTQUFTLEVBQUUsQ0FBQyxHQUFHLENBQUM7U0FDakIsQ0FBQyxDQUFDLENBQUM7UUFFSixjQUFjO1FBQ2QsTUFBTSxHQUFHLEdBQUcsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7WUFDdkQsV0FBVyxFQUFFLGdCQUFnQjtZQUM3QixXQUFXLEVBQUUsNkJBQTZCO1lBQzFDLGFBQWEsRUFBRTtnQkFDYixTQUFTLEVBQUUsSUFBSTtnQkFDZixtQkFBbUIsRUFBRSxJQUFJO2dCQUN6QixvQkFBb0IsRUFBRSxJQUFJO2FBQzNCO1lBQ0QsMkJBQTJCLEVBQUU7Z0JBQzNCLFlBQVksRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLFdBQVc7Z0JBQ3pDLFlBQVksRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLFdBQVc7YUFDMUM7U0FDRixDQUFDLENBQUM7UUFFSCxVQUFVO1FBQ1YsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7WUFDckMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxHQUFHO1lBQ2QsV0FBVyxFQUFFLDBCQUEwQjtTQUN4QyxDQUFDLENBQUM7UUFFSCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFO1lBQ3hDLEtBQUssRUFBRSxVQUFVLENBQUMsU0FBUztTQUM1QixDQUFDLENBQUM7UUFFSCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRTtZQUN2QyxLQUFLLEVBQUUsU0FBUyxDQUFDLFNBQVM7U0FDM0IsQ0FBQyxDQUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRTtZQUMxQyxLQUFLLEVBQUUsWUFBWSxDQUFDLFNBQVM7U0FDOUIsQ0FBQyxDQUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRTtZQUN6QyxLQUFLLEVBQUUsV0FBVyxDQUFDLFVBQVU7U0FDOUIsQ0FBQyxDQUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRTtZQUM1QyxLQUFLLEVBQUUsY0FBYyxDQUFDLFVBQVU7U0FDakMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7WUFDckMsS0FBSyxFQUFFLFdBQVcsQ0FBQyx5QkFBeUI7U0FDN0MsQ0FBQyxDQUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDdkMsS0FBSyxFQUFFLFlBQVksQ0FBQyx3QkFBd0I7U0FDN0MsQ0FBQyxDQUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRTtZQUN6QyxLQUFLLEVBQUUsYUFBYSxDQUFDLEtBQUs7U0FDM0IsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBNVBELHdDQTRQQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XHJcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xyXG5pbXBvcnQgKiBhcyBkeW5hbW9kYiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZHluYW1vZGInO1xyXG5pbXBvcnQgKiBhcyByZHMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXJkcyc7XHJcbmltcG9ydCAqIGFzIGVjMiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWMyJztcclxuaW1wb3J0ICogYXMgczMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXMzJztcclxuaW1wb3J0ICogYXMga21zIGZyb20gJ2F3cy1jZGstbGliL2F3cy1rbXMnO1xyXG5pbXBvcnQgKiBhcyBlbGFzdGljYWNoZSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWxhc3RpY2FjaGUnO1xyXG5pbXBvcnQgKiBhcyBhcGlnYXRld2F5IGZyb20gJ2F3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5JztcclxuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xyXG5pbXBvcnQgKiBhcyBpYW0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSc7XHJcblxyXG5leHBvcnQgY2xhc3Mgc2hyYW1TZXR1U3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xyXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcclxuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xyXG5cclxuICAgIC8vIEtNUyBLZXkgZm9yIGVuY3J5cHRpb25cclxuICAgIGNvbnN0IGVuY3J5cHRpb25LZXkgPSBuZXcga21zLktleSh0aGlzLCAnc2hyYW1TZXR1RW5jcnlwdGlvbktleScsIHtcclxuICAgICAgZGVzY3JpcHRpb246ICdFbmNyeXB0aW9uIGtleSBmb3Igc2hyYW0tU2V0dSBzZW5zaXRpdmUgZGF0YScsXHJcbiAgICAgIGVuYWJsZUtleVJvdGF0aW9uOiB0cnVlLFxyXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5SRVRBSU4sXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBWUEMgZm9yIFJEUyBhbmQgRWxhc3RpQ2FjaGVcclxuICAgIGNvbnN0IHZwYyA9IG5ldyBlYzIuVnBjKHRoaXMsICdzaHJhbVNldHVWUEMnLCB7XHJcbiAgICAgIG1heEF6czogMixcclxuICAgICAgbmF0R2F0ZXdheXM6IDEsXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBTMyBCdWNrZXRzXHJcbiAgICBjb25zdCBhdWRpb0J1Y2tldCA9IG5ldyBzMy5CdWNrZXQodGhpcywgJ0F1ZGlvQnVja2V0Jywge1xyXG4gICAgICBidWNrZXROYW1lOiBgc2hyYW0tc2V0dS1hdWRpby0ke3RoaXMuYWNjb3VudH1gLFxyXG4gICAgICBlbmNyeXB0aW9uOiBzMy5CdWNrZXRFbmNyeXB0aW9uLktNUyxcclxuICAgICAgZW5jcnlwdGlvbktleTogZW5jcnlwdGlvbktleSxcclxuICAgICAgYmxvY2tQdWJsaWNBY2Nlc3M6IHMzLkJsb2NrUHVibGljQWNjZXNzLkJMT0NLX0FMTCxcclxuICAgICAgdmVyc2lvbmVkOiB0cnVlLFxyXG4gICAgICBsaWZlY3ljbGVSdWxlczogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIGV4cGlyYXRpb246IGNkay5EdXJhdGlvbi5kYXlzKDM2NSksXHJcbiAgICAgICAgICB0cmFuc2l0aW9uczogW1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgc3RvcmFnZUNsYXNzOiBzMy5TdG9yYWdlQ2xhc3MuSU5URUxMSUdFTlRfVElFUklORyxcclxuICAgICAgICAgICAgICB0cmFuc2l0aW9uQWZ0ZXI6IGNkay5EdXJhdGlvbi5kYXlzKDMwKSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgfSxcclxuICAgICAgXSxcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGRvY3VtZW50QnVja2V0ID0gbmV3IHMzLkJ1Y2tldCh0aGlzLCAnRG9jdW1lbnRCdWNrZXQnLCB7XHJcbiAgICAgIGJ1Y2tldE5hbWU6IGBzaHJhbS1zZXR1LWRvY3VtZW50cy0ke3RoaXMuYWNjb3VudH1gLFxyXG4gICAgICBlbmNyeXB0aW9uOiBzMy5CdWNrZXRFbmNyeXB0aW9uLktNUyxcclxuICAgICAgZW5jcnlwdGlvbktleTogZW5jcnlwdGlvbktleSxcclxuICAgICAgYmxvY2tQdWJsaWNBY2Nlc3M6IHMzLkJsb2NrUHVibGljQWNjZXNzLkJMT0NLX0FMTCxcclxuICAgICAgdmVyc2lvbmVkOiB0cnVlLFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gRHluYW1vREIgVGFibGVzXHJcbiAgICBjb25zdCB1c2Vyc1RhYmxlID0gbmV3IGR5bmFtb2RiLlRhYmxlKHRoaXMsICdVc2Vyc1RhYmxlJywge1xyXG4gICAgICB0YWJsZU5hbWU6ICdzaHJhbS1zZXR1LXVzZXJzJyxcclxuICAgICAgcGFydGl0aW9uS2V5OiB7IG5hbWU6ICd1c2VySWQnLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxyXG4gICAgICBiaWxsaW5nTW9kZTogZHluYW1vZGIuQmlsbGluZ01vZGUuUEFZX1BFUl9SRVFVRVNULFxyXG4gICAgICBlbmNyeXB0aW9uOiBkeW5hbW9kYi5UYWJsZUVuY3J5cHRpb24uQ1VTVE9NRVJfTUFOQUdFRCxcclxuICAgICAgZW5jcnlwdGlvbktleTogZW5jcnlwdGlvbktleSxcclxuICAgICAgcG9pbnRJblRpbWVSZWNvdmVyeTogdHJ1ZSxcclxuICAgICAgc3RyZWFtOiBkeW5hbW9kYi5TdHJlYW1WaWV3VHlwZS5ORVdfQU5EX09MRF9JTUFHRVMsXHJcbiAgICB9KTtcclxuXHJcbiAgICB1c2Vyc1RhYmxlLmFkZEdsb2JhbFNlY29uZGFyeUluZGV4KHtcclxuICAgICAgaW5kZXhOYW1lOiAnbW9iaWxlTnVtYmVyLWluZGV4JyxcclxuICAgICAgcGFydGl0aW9uS2V5OiB7IG5hbWU6ICdtb2JpbGVOdW1iZXInLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3Qgam9ic1RhYmxlID0gbmV3IGR5bmFtb2RiLlRhYmxlKHRoaXMsICdKb2JzVGFibGUnLCB7XHJcbiAgICAgIHRhYmxlTmFtZTogJ3NocmFtLXNldHUtam9icycsXHJcbiAgICAgIHBhcnRpdGlvbktleTogeyBuYW1lOiAnam9iSWQnLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxyXG4gICAgICBiaWxsaW5nTW9kZTogZHluYW1vZGIuQmlsbGluZ01vZGUuUEFZX1BFUl9SRVFVRVNULFxyXG4gICAgICBlbmNyeXB0aW9uOiBkeW5hbW9kYi5UYWJsZUVuY3J5cHRpb24uQ1VTVE9NRVJfTUFOQUdFRCxcclxuICAgICAgZW5jcnlwdGlvbktleTogZW5jcnlwdGlvbktleSxcclxuICAgICAgcG9pbnRJblRpbWVSZWNvdmVyeTogdHJ1ZSxcclxuICAgICAgc3RyZWFtOiBkeW5hbW9kYi5TdHJlYW1WaWV3VHlwZS5ORVdfQU5EX09MRF9JTUFHRVMsXHJcbiAgICB9KTtcclxuXHJcbiAgICBqb2JzVGFibGUuYWRkR2xvYmFsU2Vjb25kYXJ5SW5kZXgoe1xyXG4gICAgICBpbmRleE5hbWU6ICdjaXR5LXN0YXR1cy1pbmRleCcsXHJcbiAgICAgIHBhcnRpdGlvbktleTogeyBuYW1lOiAnY2l0eScsIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXHJcbiAgICAgIHNvcnRLZXk6IHsgbmFtZTogJ3N0YXR1cycsIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCByYXRpbmdzVGFibGUgPSBuZXcgZHluYW1vZGIuVGFibGUodGhpcywgJ1JhdGluZ3NUYWJsZScsIHtcclxuICAgICAgdGFibGVOYW1lOiAnc2hyYW0tc2V0dS1yYXRpbmdzJyxcclxuICAgICAgcGFydGl0aW9uS2V5OiB7IG5hbWU6ICdyYXRpbmdJZCcsIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXHJcbiAgICAgIGJpbGxpbmdNb2RlOiBkeW5hbW9kYi5CaWxsaW5nTW9kZS5QQVlfUEVSX1JFUVVFU1QsXHJcbiAgICAgIGVuY3J5cHRpb246IGR5bmFtb2RiLlRhYmxlRW5jcnlwdGlvbi5DVVNUT01FUl9NQU5BR0VELFxyXG4gICAgICBlbmNyeXB0aW9uS2V5OiBlbmNyeXB0aW9uS2V5LFxyXG4gICAgICBwb2ludEluVGltZVJlY292ZXJ5OiB0cnVlLFxyXG4gICAgfSk7XHJcblxyXG4gICAgcmF0aW5nc1RhYmxlLmFkZEdsb2JhbFNlY29uZGFyeUluZGV4KHtcclxuICAgICAgaW5kZXhOYW1lOiAndG9Vc2VySWQtaW5kZXgnLFxyXG4gICAgICBwYXJ0aXRpb25LZXk6IHsgbmFtZTogJ3RvVXNlcklkJywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcclxuICAgICAgc29ydEtleTogeyBuYW1lOiAnY3JlYXRlZEF0JywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5OVU1CRVIgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IHN5bmNPcGVyYXRpb25zVGFibGUgPSBuZXcgZHluYW1vZGIuVGFibGUodGhpcywgJ1N5bmNPcGVyYXRpb25zVGFibGUnLCB7XHJcbiAgICAgIHRhYmxlTmFtZTogJ3NocmFtLXNldHUtc3luYy1vcGVyYXRpb25zJyxcclxuICAgICAgcGFydGl0aW9uS2V5OiB7IG5hbWU6ICd1c2VySWQnLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxyXG4gICAgICBzb3J0S2V5OiB7IG5hbWU6ICd0aW1lc3RhbXAnLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLk5VTUJFUiB9LFxyXG4gICAgICBiaWxsaW5nTW9kZTogZHluYW1vZGIuQmlsbGluZ01vZGUuUEFZX1BFUl9SRVFVRVNULFxyXG4gICAgICBlbmNyeXB0aW9uOiBkeW5hbW9kYi5UYWJsZUVuY3J5cHRpb24uQ1VTVE9NRVJfTUFOQUdFRCxcclxuICAgICAgZW5jcnlwdGlvbktleTogZW5jcnlwdGlvbktleSxcclxuICAgICAgdGltZVRvTGl2ZUF0dHJpYnV0ZTogJ3R0bCcsXHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBhdHRlbmRhbmNlVGFibGUgPSBuZXcgZHluYW1vZGIuVGFibGUodGhpcywgJ0F0dGVuZGFuY2VUYWJsZScsIHtcclxuICAgICAgdGFibGVOYW1lOiAnc2hyYW0tc2V0dS1hdHRlbmRhbmNlJyxcclxuICAgICAgcGFydGl0aW9uS2V5OiB7IG5hbWU6ICdzZXNzaW9uSWQnLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxyXG4gICAgICBzb3J0S2V5OiB7IG5hbWU6ICdyZWNvcmRJZCcsIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXHJcbiAgICAgIGJpbGxpbmdNb2RlOiBkeW5hbW9kYi5CaWxsaW5nTW9kZS5QQVlfUEVSX1JFUVVFU1QsXHJcbiAgICAgIGVuY3J5cHRpb246IGR5bmFtb2RiLlRhYmxlRW5jcnlwdGlvbi5DVVNUT01FUl9NQU5BR0VELFxyXG4gICAgICBlbmNyeXB0aW9uS2V5OiBlbmNyeXB0aW9uS2V5LFxyXG4gICAgICBwb2ludEluVGltZVJlY292ZXJ5OiB0cnVlLFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gUG9zdGdyZVNRTCBSRFMgZm9yIEZpbmFuY2lhbCBMZWRnZXJcclxuICAgIGNvbnN0IGRiU2VjdXJpdHlHcm91cCA9IG5ldyBlYzIuU2VjdXJpdHlHcm91cCh0aGlzLCAnREJTZWN1cml0eUdyb3VwJywge1xyXG4gICAgICB2cGMsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2VjdXJpdHkgZ3JvdXAgZm9yIFJEUyBQb3N0Z3JlU1FMJyxcclxuICAgICAgYWxsb3dBbGxPdXRib3VuZDogdHJ1ZSxcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IHJkc0luc3RhbmNlID0gbmV3IHJkcy5EYXRhYmFzZUluc3RhbmNlKHRoaXMsICdMZWRnZXJEYXRhYmFzZScsIHtcclxuICAgICAgZW5naW5lOiByZHMuRGF0YWJhc2VJbnN0YW5jZUVuZ2luZS5wb3N0Z3Jlcyh7XHJcbiAgICAgICAgdmVyc2lvbjogcmRzLlBvc3RncmVzRW5naW5lVmVyc2lvbi5WRVJfMTUsXHJcbiAgICAgIH0pLFxyXG4gICAgICBpbnN0YW5jZVR5cGU6IGVjMi5JbnN0YW5jZVR5cGUub2YoZWMyLkluc3RhbmNlQ2xhc3MuVDMsIGVjMi5JbnN0YW5jZVNpemUuU01BTEwpLFxyXG4gICAgICB2cGMsXHJcbiAgICAgIHZwY1N1Ym5ldHM6IHtcclxuICAgICAgICBzdWJuZXRUeXBlOiBlYzIuU3VibmV0VHlwZS5QUklWQVRFX1dJVEhfRUdSRVNTLFxyXG4gICAgICB9LFxyXG4gICAgICBzZWN1cml0eUdyb3VwczogW2RiU2VjdXJpdHlHcm91cF0sXHJcbiAgICAgIGRhdGFiYXNlTmFtZTogJ3NocmFtX3NldHVfbGVkZ2VyJyxcclxuICAgICAgc3RvcmFnZUVuY3J5cHRlZDogdHJ1ZSxcclxuICAgICAgc3RvcmFnZUVuY3J5cHRpb25LZXk6IGVuY3J5cHRpb25LZXksXHJcbiAgICAgIGJhY2t1cFJldGVudGlvbjogY2RrLkR1cmF0aW9uLmRheXMoNyksXHJcbiAgICAgIGRlbGV0aW9uUHJvdGVjdGlvbjogdHJ1ZSxcclxuICAgICAgbXVsdGlBejogdHJ1ZSxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEVsYXN0aUNhY2hlIFJlZGlzIGZvciBTZXNzaW9uIE1hbmFnZW1lbnRcclxuICAgIGNvbnN0IGNhY2hlU2VjdXJpdHlHcm91cCA9IG5ldyBlYzIuU2VjdXJpdHlHcm91cCh0aGlzLCAnQ2FjaGVTZWN1cml0eUdyb3VwJywge1xyXG4gICAgICB2cGMsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2VjdXJpdHkgZ3JvdXAgZm9yIEVsYXN0aUNhY2hlIFJlZGlzJyxcclxuICAgICAgYWxsb3dBbGxPdXRib3VuZDogdHJ1ZSxcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGNhY2hlU3VibmV0R3JvdXAgPSBuZXcgZWxhc3RpY2FjaGUuQ2ZuU3VibmV0R3JvdXAodGhpcywgJ0NhY2hlU3VibmV0R3JvdXAnLCB7XHJcbiAgICAgIGRlc2NyaXB0aW9uOiAnU3VibmV0IGdyb3VwIGZvciBFbGFzdGlDYWNoZScsXHJcbiAgICAgIHN1Ym5ldElkczogdnBjLnByaXZhdGVTdWJuZXRzLm1hcChzdWJuZXQgPT4gc3VibmV0LnN1Ym5ldElkKSxcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IHJlZGlzQ2x1c3RlciA9IG5ldyBlbGFzdGljYWNoZS5DZm5DYWNoZUNsdXN0ZXIodGhpcywgJ1JlZGlzQ2x1c3RlcicsIHtcclxuICAgICAgY2FjaGVOb2RlVHlwZTogJ2NhY2hlLnQzLm1pY3JvJyxcclxuICAgICAgZW5naW5lOiAncmVkaXMnLFxyXG4gICAgICBudW1DYWNoZU5vZGVzOiAxLFxyXG4gICAgICB2cGNTZWN1cml0eUdyb3VwSWRzOiBbY2FjaGVTZWN1cml0eUdyb3VwLnNlY3VyaXR5R3JvdXBJZF0sXHJcbiAgICAgIGNhY2hlU3VibmV0R3JvdXBOYW1lOiBjYWNoZVN1Ym5ldEdyb3VwLnJlZixcclxuICAgICAgZW5naW5lVmVyc2lvbjogJzcuMCcsXHJcbiAgICAgIHRyYW5zaXRFbmNyeXB0aW9uRW5hYmxlZDogdHJ1ZSxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIExhbWJkYSBFeGVjdXRpb24gUm9sZVxyXG4gICAgY29uc3QgbGFtYmRhUm9sZSA9IG5ldyBpYW0uUm9sZSh0aGlzLCAnTGFtYmRhRXhlY3V0aW9uUm9sZScsIHtcclxuICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoJ2xhbWJkYS5hbWF6b25hd3MuY29tJyksXHJcbiAgICAgIG1hbmFnZWRQb2xpY2llczogW1xyXG4gICAgICAgIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZSgnc2VydmljZS1yb2xlL0FXU0xhbWJkYVZQQ0FjY2Vzc0V4ZWN1dGlvblJvbGUnKSxcclxuICAgICAgICBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoJ3NlcnZpY2Utcm9sZS9BV1NMYW1iZGFCYXNpY0V4ZWN1dGlvblJvbGUnKSxcclxuICAgICAgXSxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEdyYW50IHBlcm1pc3Npb25zXHJcbiAgICB1c2Vyc1RhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShsYW1iZGFSb2xlKTtcclxuICAgIGpvYnNUYWJsZS5ncmFudFJlYWRXcml0ZURhdGEobGFtYmRhUm9sZSk7XHJcbiAgICByYXRpbmdzVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKGxhbWJkYVJvbGUpO1xyXG4gICAgc3luY09wZXJhdGlvbnNUYWJsZS5ncmFudFJlYWRXcml0ZURhdGEobGFtYmRhUm9sZSk7XHJcbiAgICBhdHRlbmRhbmNlVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKGxhbWJkYVJvbGUpO1xyXG4gICAgYXVkaW9CdWNrZXQuZ3JhbnRSZWFkV3JpdGUobGFtYmRhUm9sZSk7XHJcbiAgICBkb2N1bWVudEJ1Y2tldC5ncmFudFJlYWRXcml0ZShsYW1iZGFSb2xlKTtcclxuICAgIGVuY3J5cHRpb25LZXkuZ3JhbnRFbmNyeXB0RGVjcnlwdChsYW1iZGFSb2xlKTtcclxuXHJcbiAgICAvLyBHcmFudCBBV1MgQUkvTUwgc2VydmljZSBwZXJtaXNzaW9uc1xyXG4gICAgbGFtYmRhUm9sZS5hZGRUb1BvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XHJcbiAgICAgIGFjdGlvbnM6IFtcclxuICAgICAgICAndHJhbnNjcmliZTpTdGFydFRyYW5zY3JpcHRpb25Kb2InLFxyXG4gICAgICAgICd0cmFuc2NyaWJlOkdldFRyYW5zY3JpcHRpb25Kb2InLFxyXG4gICAgICAgICdwb2xseTpTeW50aGVzaXplU3BlZWNoJyxcclxuICAgICAgICAnbGV4OlBvc3RUZXh0JyxcclxuICAgICAgICAnbGV4OlBvc3RDb250ZW50JyxcclxuICAgICAgICAndGV4dHJhY3Q6QW5hbHl6ZURvY3VtZW50JyxcclxuICAgICAgICAndGV4dHJhY3Q6RGV0ZWN0RG9jdW1lbnRUZXh0JyxcclxuICAgICAgICAncmVrb2duaXRpb246RGV0ZWN0VGV4dCcsXHJcbiAgICAgICAgJ3Jla29nbml0aW9uOkRldGVjdExhYmVscycsXHJcbiAgICAgICAgJ2NvbXByZWhlbmQ6RGV0ZWN0U2VudGltZW50JyxcclxuICAgICAgICAnY29tcHJlaGVuZDpEZXRlY3RFbnRpdGllcycsXHJcbiAgICAgICAgJ2dlbzpTZWFyY2hQbGFjZUluZGV4Rm9yUG9zaXRpb24nLFxyXG4gICAgICAgICdnZW86U2VhcmNoUGxhY2VJbmRleEZvclRleHQnLFxyXG4gICAgICAgICdnZW86Q2FsY3VsYXRlUm91dGUnLFxyXG4gICAgICBdLFxyXG4gICAgICByZXNvdXJjZXM6IFsnKiddLFxyXG4gICAgfSkpO1xyXG5cclxuICAgIC8vIEFQSSBHYXRld2F5XHJcbiAgICBjb25zdCBhcGkgPSBuZXcgYXBpZ2F0ZXdheS5SZXN0QXBpKHRoaXMsICdzaHJhbVNldHVBUEknLCB7XHJcbiAgICAgIHJlc3RBcGlOYW1lOiAnc2hyYW0tU2V0dSBBUEknLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ0FQSSBmb3Igc2hyYW0tU2V0dSBwbGF0Zm9ybScsXHJcbiAgICAgIGRlcGxveU9wdGlvbnM6IHtcclxuICAgICAgICBzdGFnZU5hbWU6ICd2MScsXHJcbiAgICAgICAgdGhyb3R0bGluZ1JhdGVMaW1pdDogMTAwMCxcclxuICAgICAgICB0aHJvdHRsaW5nQnVyc3RMaW1pdDogMjAwMCxcclxuICAgICAgfSxcclxuICAgICAgZGVmYXVsdENvcnNQcmVmbGlnaHRPcHRpb25zOiB7XHJcbiAgICAgICAgYWxsb3dPcmlnaW5zOiBhcGlnYXRld2F5LkNvcnMuQUxMX09SSUdJTlMsXHJcbiAgICAgICAgYWxsb3dNZXRob2RzOiBhcGlnYXRld2F5LkNvcnMuQUxMX01FVEhPRFMsXHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBPdXRwdXRzXHJcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnQVBJRW5kcG9pbnQnLCB7XHJcbiAgICAgIHZhbHVlOiBhcGkudXJsLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ0FQSSBHYXRld2F5IGVuZHBvaW50IFVSTCcsXHJcbiAgICB9KTtcclxuXHJcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnVXNlcnNUYWJsZU5hbWUnLCB7XHJcbiAgICAgIHZhbHVlOiB1c2Vyc1RhYmxlLnRhYmxlTmFtZSxcclxuICAgIH0pO1xyXG5cclxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdKb2JzVGFibGVOYW1lJywge1xyXG4gICAgICB2YWx1ZTogam9ic1RhYmxlLnRhYmxlTmFtZSxcclxuICAgIH0pO1xyXG5cclxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdSYXRpbmdzVGFibGVOYW1lJywge1xyXG4gICAgICB2YWx1ZTogcmF0aW5nc1RhYmxlLnRhYmxlTmFtZSxcclxuICAgIH0pO1xyXG5cclxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdBdWRpb0J1Y2tldE5hbWUnLCB7XHJcbiAgICAgIHZhbHVlOiBhdWRpb0J1Y2tldC5idWNrZXROYW1lLFxyXG4gICAgfSk7XHJcblxyXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0RvY3VtZW50QnVja2V0TmFtZScsIHtcclxuICAgICAgdmFsdWU6IGRvY3VtZW50QnVja2V0LmJ1Y2tldE5hbWUsXHJcbiAgICB9KTtcclxuXHJcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnUkRTRW5kcG9pbnQnLCB7XHJcbiAgICAgIHZhbHVlOiByZHNJbnN0YW5jZS5kYkluc3RhbmNlRW5kcG9pbnRBZGRyZXNzLFxyXG4gICAgfSk7XHJcblxyXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ1JlZGlzRW5kcG9pbnQnLCB7XHJcbiAgICAgIHZhbHVlOiByZWRpc0NsdXN0ZXIuYXR0clJlZGlzRW5kcG9pbnRBZGRyZXNzLFxyXG4gICAgfSk7XHJcblxyXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0VuY3J5cHRpb25LZXlJZCcsIHtcclxuICAgICAgdmFsdWU6IGVuY3J5cHRpb25LZXkua2V5SWQsXHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbiJdfQ==