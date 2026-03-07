#!/usr/bin/env node
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
exports.TranscribeLambdaStack = void 0;
require("source-map-support/register");
const cdk = __importStar(require("aws-cdk-lib"));
const lambda = __importStar(require("aws-cdk-lib/aws-lambda"));
const apigateway = __importStar(require("aws-cdk-lib/aws-apigateway"));
const iam = __importStar(require("aws-cdk-lib/aws-iam"));
class TranscribeLambdaStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // IAM Role for Lambda
        const lambdaRole = new iam.Role(this, 'TranscribeLambdaRole', {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
            ],
            inlinePolicies: {
                TranscribeAccess: new iam.PolicyDocument({
                    statements: [
                        new iam.PolicyStatement({
                            effect: iam.Effect.ALLOW,
                            actions: [
                                'transcribe:StartTranscriptionJob',
                                'transcribe:GetTranscriptionJob',
                                'transcribe:ListTranscriptionJobs',
                            ],
                            resources: ['*'],
                        }),
                    ],
                }),
                S3Access: new iam.PolicyDocument({
                    statements: [
                        new iam.PolicyStatement({
                            effect: iam.Effect.ALLOW,
                            actions: [
                                's3:GetObject',
                                's3:PutObject',
                                's3:DeleteObject',
                            ],
                            resources: ['arn:aws:s3:::shram-setu-uploads-808840719701/*'],
                        }),
                    ],
                }),
            },
        });
        // Lambda Function
        const transcribeLambda = new lambda.Function(this, 'TranscribeFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('../lambda-transcribe'),
            role: lambdaRole,
            timeout: cdk.Duration.minutes(3),
            memorySize: 512,
            environment: {
                S3_BUCKET_NAME: 'shram-setu-uploads-808840719701',
                // AWS_REGION is automatically set by Lambda runtime
            },
        });
        // API Gateway with proper CORS
        const api = new apigateway.RestApi(this, 'TranscribeApi', {
            restApiName: 'Shram Setu Transcribe API',
            description: 'API for AWS Transcribe service with proper CORS',
            defaultCorsPreflightOptions: {
                allowOrigins: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'https://your-domain.com'],
                allowMethods: ['GET', 'POST', 'OPTIONS'],
                allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
                allowCredentials: false,
            },
            deployOptions: {
                stageName: 'prod',
            },
        });
        // Add Lambda integration
        const lambdaIntegration = new apigateway.LambdaIntegration(transcribeLambda, {
            requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
        });
        // Add POST method to root
        api.root.addMethod('POST', lambdaIntegration);
        // Output the API URL
        new cdk.CfnOutput(this, 'TranscribeApiUrl', {
            value: api.url,
            description: 'Transcribe API Gateway URL',
            exportName: 'TranscribeApiUrl',
        });
    }
}
exports.TranscribeLambdaStack = TranscribeLambdaStack;
const app = new cdk.App();
new TranscribeLambdaStack(app, 'ShramSetuTranscribeStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT || '808840719701',
        region: process.env.CDK_DEFAULT_REGION || 'ap-south-1',
    },
    description: 'Shram Setu Transcribe API with proper CORS configuration',
    tags: {
        Project: 'ShramSetu',
        Component: 'Transcribe',
        Environment: 'Production',
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLXRyYW5zY3JpYmUtYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2RrLXRyYW5zY3JpYmUtYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSx1Q0FBcUM7QUFDckMsaURBQW1DO0FBQ25DLCtEQUFpRDtBQUNqRCx1RUFBeUQ7QUFDekQseURBQTJDO0FBRzNDLE1BQWEscUJBQXNCLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDbEQsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixzQkFBc0I7UUFDdEIsTUFBTSxVQUFVLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxzQkFBc0IsRUFBRTtZQUM1RCxTQUFTLEVBQUUsSUFBSSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsc0JBQXNCLENBQUM7WUFDM0QsZUFBZSxFQUFFO2dCQUNmLEdBQUcsQ0FBQyxhQUFhLENBQUMsd0JBQXdCLENBQUMsMENBQTBDLENBQUM7YUFDdkY7WUFDRCxjQUFjLEVBQUU7Z0JBQ2QsZ0JBQWdCLEVBQUUsSUFBSSxHQUFHLENBQUMsY0FBYyxDQUFDO29CQUN2QyxVQUFVLEVBQUU7d0JBQ1YsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDOzRCQUN0QixNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLOzRCQUN4QixPQUFPLEVBQUU7Z0NBQ1Asa0NBQWtDO2dDQUNsQyxnQ0FBZ0M7Z0NBQ2hDLGtDQUFrQzs2QkFDbkM7NEJBQ0QsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFDO3lCQUNqQixDQUFDO3FCQUNIO2lCQUNGLENBQUM7Z0JBQ0YsUUFBUSxFQUFFLElBQUksR0FBRyxDQUFDLGNBQWMsQ0FBQztvQkFDL0IsVUFBVSxFQUFFO3dCQUNWLElBQUksR0FB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LXN1cHBvcnQvcmVnaXN0ZXInO1xyXG5pbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xyXG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XHJcbmltcG9ydCAqIGFzIGFwaWdhdGV3YXkgZnJvbSAnYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXknO1xyXG5pbXBvcnQgKiBhcyBpYW0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSc7XHJcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFRyYW5zY3JpYmVMYW1iZGFTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XHJcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xyXG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XHJcblxyXG4gICAgLy8gSUFNIFJvbGUgZm9yIExhbWJkYVxyXG4gICAgY29uc3QgbGFtYmRhUm9sZSA9IG5ldyBpYW0uUm9sZSh0aGlzLCAnVHJhbnNjcmliZUxhbWJkYVJvbGUnLCB7XHJcbiAgICAgIGFzc3VtZWRCeTogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKCdsYW1iZGEuYW1hem9uYXdzLmNvbScpLFxyXG4gICAgICBtYW5hZ2VkUG9saWNpZXM6IFtcclxuICAgICAgICBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoJ3NlcnZpY2Utcm9sZS9BV1NMYW1iZGFCYXNpY0V4ZWN1dGlvblJvbGUnKSxcclxuICAgICAgXSxcclxuICAgICAgaW5saW5lUG9saWNpZXM6IHtcclxuICAgICAgICBUcmFuc2NyaWJlQWNjZXNzOiBuZXcgaWFtLlBvbGljeURvY3VtZW50KHtcclxuICAgICAgICAgIHN0YXRlbWVudHM6IFtcclxuICAgICAgICAgICAgbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xyXG4gICAgICAgICAgICAgIGVmZmVjdDogaWFtLkVmZmVjdC5BTExPVyxcclxuICAgICAgICAgICAgICBhY3Rpb25zOiBbXHJcbiAgICAgICAgICAgICAgICAndHJhbnNjcmliZTpTdGFydFRyYW5zY3JpcHRpb25Kb2InLFxyXG4gICAgICAgICAgICAgICAgJ3RyYW5zY3JpYmU6R2V0VHJhbnNjcmlwdGlvbkpvYicsXHJcbiAgICAgICAgICAgICAgICAndHJhbnNjcmliZTpMaXN0VHJhbnNjcmlwdGlvbkpvYnMnLFxyXG4gICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgcmVzb3VyY2VzOiBbJyonXSxcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICBdLFxyXG4gICAgICAgIH0pLFxyXG4gICAgICAgIFMzQWNjZXNzOiBuZXcgaWFtLlBvbGljeURvY3VtZW50KHtcclxuICAgICAgICAgIHN0YXRlbWVudHM6IFtcclxuICAgICAgICAgICAgbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xyXG4gICAgICAgICAgICAgIGVmZmVjdDogaWFtLkVmZmVjdC5BTExPVyxcclxuICAgICAgICAgICAgICBhY3Rpb25zOiBbXHJcbiAgICAgICAgICAgICAgICAnczM6R2V0T2JqZWN0JyxcclxuICAgICAgICAgICAgICAgICdzMzpQdXRPYmplY3QnLFxyXG4gICAgICAgICAgICAgICAgJ3MzOkRlbGV0ZU9iamVjdCcsXHJcbiAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICByZXNvdXJjZXM6IFsnYXJuOmF3czpzMzo6OnNocmFtLXNldHUtdXBsb2Fkcy04MDg4NDA3MTk3MDEvKiddLFxyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgfSksXHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBMYW1iZGEgRnVuY3Rpb25cclxuICAgIGNvbnN0IHRyYW5zY3JpYmVMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdUcmFuc2NyaWJlRnVuY3Rpb24nLCB7XHJcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxyXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXHJcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi4vbGFtYmRhLXRyYW5zY3JpYmUnKSxcclxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcclxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoMyksXHJcbiAgICAgIG1lbW9yeVNpemU6IDUxMixcclxuICAgICAgZW52aXJvbm1lbnQ6IHtcclxuICAgICAgICBTM19CVUNLRVRfTkFNRTogJ3NocmFtLXNldHUtdXBsb2Fkcy04MDg4NDA3MTk3MDEnLFxyXG4gICAgICAgIC8vIEFXU19SRUdJT04gaXMgYXV0b21hdGljYWxseSBzZXQgYnkgTGFtYmRhIHJ1bnRpbWVcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEFQSSBHYXRld2F5IHdpdGggcHJvcGVyIENPUlNcclxuICAgIGNvbnN0IGFwaSA9IG5ldyBhcGlnYXRld2F5LlJlc3RBcGkodGhpcywgJ1RyYW5zY3JpYmVBcGknLCB7XHJcbiAgICAgIHJlc3RBcGlOYW1lOiAnU2hyYW0gU2V0dSBUcmFuc2NyaWJlIEFQSScsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiAnQVBJIGZvciBBV1MgVHJhbnNjcmliZSBzZXJ2aWNlIHdpdGggcHJvcGVyIENPUlMnLFxyXG4gICAgICBkZWZhdWx0Q29yc1ByZWZsaWdodE9wdGlvbnM6IHtcclxuICAgICAgICBhbGxvd09yaWdpbnM6IFsnaHR0cDovL2xvY2FsaG9zdDo1MTczJywgJ2h0dHA6Ly9sb2NhbGhvc3Q6NTE3NCcsICdodHRwOi8vbG9jYWxob3N0OjUxNzUnLCAnaHR0cHM6Ly95b3VyLWRvbWFpbi5jb20nXSxcclxuICAgICAgICBhbGxvd01ldGhvZHM6IFsnR0VUJywgJ1BPU1QnLCAnT1BUSU9OUyddLFxyXG4gICAgICAgIGFsbG93SGVhZGVyczogWydDb250ZW50LVR5cGUnLCAnWC1BbXotRGF0ZScsICdBdXRob3JpemF0aW9uJywgJ1gtQXBpLUtleScsICdYLUFtei1TZWN1cml0eS1Ub2tlbiddLFxyXG4gICAgICAgIGFsbG93Q3JlZGVudGlhbHM6IGZhbHNlLFxyXG4gICAgICB9LFxyXG4gICAgICBkZXBsb3lPcHRpb25zOiB7XHJcbiAgICAgICAgc3RhZ2VOYW1lOiAncHJvZCcsXHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBBZGQgTGFtYmRhIGludGVncmF0aW9uXHJcbiAgICBjb25zdCBsYW1iZGFJbnRlZ3JhdGlvbiA9IG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHRyYW5zY3JpYmVMYW1iZGEsIHtcclxuICAgICAgcmVxdWVzdFRlbXBsYXRlczogeyAnYXBwbGljYXRpb24vanNvbic6ICd7IFwic3RhdHVzQ29kZVwiOiBcIjIwMFwiIH0nIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBBZGQgUE9TVCBtZXRob2QgdG8gcm9vdFxyXG4gICAgYXBpLnJvb3QuYWRkTWV0aG9kKCdQT1NUJywgbGFtYmRhSW50ZWdyYXRpb24pO1xyXG5cclxuICAgIC8vIE91dHB1dCB0aGUgQVBJIFVSTFxyXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ1RyYW5zY3JpYmVBcGlVcmwnLCB7XHJcbiAgICAgIHZhbHVlOiBhcGkudXJsLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ1RyYW5zY3JpYmUgQVBJIEdhdGV3YXkgVVJMJyxcclxuICAgICAgZXhwb3J0TmFtZTogJ1RyYW5zY3JpYmVBcGlVcmwnLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5jb25zdCBhcHAgPSBuZXcgY2RrLkFwcCgpO1xyXG5uZXcgVHJhbnNjcmliZUxhbWJkYVN0YWNrKGFwcCwgJ1NocmFtU2V0dVRyYW5zY3JpYmVTdGFjaycsIHtcclxuICBlbnY6IHtcclxuICAgIGFjY291bnQ6IHByb2Nlc3MuZW52LkNES19ERUZBVUxUX0FDQ09VTlQgfHwgJzgwODg0MDcxOTcwMScsXHJcbiAgICByZWdpb246IHByb2Nlc3MuZW52LkNES19ERUZBVUxUX1JFR0lPTiB8fCAnYXAtc291dGgtMScsXHJcbiAgfSxcclxuICBkZXNjcmlwdGlvbjogJ1NocmFtIFNldHUgVHJhbnNjcmliZSBBUEkgd2l0aCBwcm9wZXIgQ09SUyBjb25maWd1cmF0aW9uJyxcclxuICB0YWdzOiB7XHJcbiAgICBQcm9qZWN0OiAnU2hyYW1TZXR1JyxcclxuICAgIENvbXBvbmVudDogJ1RyYW5zY3JpYmUnLFxyXG4gICAgRW52aXJvbm1lbnQ6ICdQcm9kdWN0aW9uJyxcclxuICB9LFxyXG59KTsiXX0=