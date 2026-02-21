import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';

export class shramSetuStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
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
      atRestEncryptionEnabled: true,
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

