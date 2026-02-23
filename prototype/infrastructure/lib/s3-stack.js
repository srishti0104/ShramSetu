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
exports.S3Stack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const s3 = __importStar(require("aws-cdk-lib/aws-s3"));
class S3Stack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // Create S3 bucket for file uploads
        this.bucket = new s3.Bucket(this, 'ShramSetuUploadsBucket', {
            bucketName: 'shram-setu-uploads-' + this.account,
            versioned: false,
            publicReadAccess: false,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            encryption: s3.BucketEncryption.S3_MANAGED,
            cors: [
                {
                    allowedMethods: [
                        s3.HttpMethods.GET,
                        s3.HttpMethods.PUT,
                        s3.HttpMethods.POST,
                        s3.HttpMethods.DELETE
                    ],
                    allowedOrigins: ['*'], // In production, specify your domain
                    allowedHeaders: ['*'],
                    exposedHeaders: ['ETag'],
                    maxAge: 3000
                }
            ],
            lifecycleRules: [
                {
                    id: 'DeleteOldFiles',
                    enabled: true,
                    expiration: cdk.Duration.days(90), // Delete files after 90 days
                    transitions: [
                        {
                            storageClass: s3.StorageClass.INFREQUENT_ACCESS,
                            transitionAfter: cdk.Duration.days(30) // Move to cheaper storage after 30 days
                        }
                    ]
                }
            ],
            removalPolicy: cdk.RemovalPolicy.RETAIN // Keep bucket when stack is deleted
        });
        // Output bucket name
        new cdk.CfnOutput(this, 'BucketName', {
            value: this.bucket.bucketName,
            description: 'S3 Bucket name for file uploads',
            exportName: 'ShramSetuBucketName'
        });
        new cdk.CfnOutput(this, 'BucketArn', {
            value: this.bucket.bucketArn,
            description: 'S3 Bucket ARN',
            exportName: 'ShramSetuBucketArn'
        });
    }
}
exports.S3Stack = S3Stack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiczMtc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzMy1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFDbkMsdURBQXlDO0FBSXpDLE1BQWEsT0FBUSxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBR3BDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDOUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsb0NBQW9DO1FBQ3BDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSx3QkFBd0IsRUFBRTtZQUMxRCxVQUFVLEVBQUUscUJBQXFCLEdBQUcsSUFBSSxDQUFDLE9BQU87WUFDaEQsU0FBUyxFQUFFLEtBQUs7WUFDaEIsZ0JBQWdCLEVBQUUsS0FBSztZQUN2QixpQkFBaUIsRUFBRSxFQUFFLENBQUMsaUJBQWlCLENBQUMsU0FBUztZQUNqRCxVQUFVLEVBQUUsRUFBRSxDQUFDLGdCQUFnQixDQUFDLFVBQVU7WUFDMUMsSUFBSSxFQUFFO2dCQUNKO29CQUNFLGNBQWMsRUFBRTt3QkFDZCxFQUFFLENBQUMsV0FBVyxDQUFDLEdBQUc7d0JBQ2xCLEVBQUUsQ0FBQyxXQUFXLENBQUMsR0FBRzt3QkFDbEIsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJO3dCQUNuQixFQUFFLENBQUMsV0FBVyxDQUFDLE1BQU07cUJBQ3RCO29CQUNELGNBQWMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLHFDQUFxQztvQkFDNUQsY0FBYyxFQUFFLENBQUMsR0FBRyxDQUFDO29CQUNyQixjQUFjLEVBQUUsQ0FBQyxNQUFNLENBQUM7b0JBQ3hCLE1BQU0sRUFBRSxJQUFJO2lCQUNiO2FBQ0Y7WUFDRCxjQUFjLEVBQUU7Z0JBQ2Q7b0JBQ0UsRUFBRSxFQUFFLGdCQUFnQjtvQkFDcEIsT0FBTyxFQUFFLElBQUk7b0JBQ2IsVUFBVSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLDZCQUE2QjtvQkFDaEUsV0FBVyxFQUFFO3dCQUNYOzRCQUNFLFlBQVksRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLGlCQUFpQjs0QkFDL0MsZUFBZSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLHdDQUF3Qzt5QkFDaEY7cUJBQ0Y7aUJBQ0Y7YUFDRjtZQUNELGFBQWEsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxvQ0FBb0M7U0FDN0UsQ0FBQyxDQUFDO1FBRUgscUJBQXFCO1FBQ3JCLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQ3BDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVU7WUFDN0IsV0FBVyxFQUFFLGlDQUFpQztZQUM5QyxVQUFVLEVBQUUscUJBQXFCO1NBQ2xDLENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFO1lBQ25DLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVM7WUFDNUIsV0FBVyxFQUFFLGVBQWU7WUFDNUIsVUFBVSxFQUFFLG9CQUFvQjtTQUNqQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUF4REQsMEJBd0RDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcclxuaW1wb3J0ICogYXMgczMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXMzJztcclxuaW1wb3J0ICogYXMgaWFtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xyXG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBTM1N0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcclxuICBwdWJsaWMgcmVhZG9ubHkgYnVja2V0OiBzMy5CdWNrZXQ7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcclxuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xyXG5cclxuICAgIC8vIENyZWF0ZSBTMyBidWNrZXQgZm9yIGZpbGUgdXBsb2Fkc1xyXG4gICAgdGhpcy5idWNrZXQgPSBuZXcgczMuQnVja2V0KHRoaXMsICdTaHJhbVNldHVVcGxvYWRzQnVja2V0Jywge1xyXG4gICAgICBidWNrZXROYW1lOiAnc2hyYW0tc2V0dS11cGxvYWRzLScgKyB0aGlzLmFjY291bnQsXHJcbiAgICAgIHZlcnNpb25lZDogZmFsc2UsXHJcbiAgICAgIHB1YmxpY1JlYWRBY2Nlc3M6IGZhbHNlLFxyXG4gICAgICBibG9ja1B1YmxpY0FjY2VzczogczMuQmxvY2tQdWJsaWNBY2Nlc3MuQkxPQ0tfQUxMLFxyXG4gICAgICBlbmNyeXB0aW9uOiBzMy5CdWNrZXRFbmNyeXB0aW9uLlMzX01BTkFHRUQsXHJcbiAgICAgIGNvcnM6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBhbGxvd2VkTWV0aG9kczogW1xyXG4gICAgICAgICAgICBzMy5IdHRwTWV0aG9kcy5HRVQsXHJcbiAgICAgICAgICAgIHMzLkh0dHBNZXRob2RzLlBVVCxcclxuICAgICAgICAgICAgczMuSHR0cE1ldGhvZHMuUE9TVCxcclxuICAgICAgICAgICAgczMuSHR0cE1ldGhvZHMuREVMRVRFXHJcbiAgICAgICAgICBdLFxyXG4gICAgICAgICAgYWxsb3dlZE9yaWdpbnM6IFsnKiddLCAvLyBJbiBwcm9kdWN0aW9uLCBzcGVjaWZ5IHlvdXIgZG9tYWluXHJcbiAgICAgICAgICBhbGxvd2VkSGVhZGVyczogWycqJ10sXHJcbiAgICAgICAgICBleHBvc2VkSGVhZGVyczogWydFVGFnJ10sXHJcbiAgICAgICAgICBtYXhBZ2U6IDMwMDBcclxuICAgICAgICB9XHJcbiAgICAgIF0sXHJcbiAgICAgIGxpZmVjeWNsZVJ1bGVzOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgaWQ6ICdEZWxldGVPbGRGaWxlcycsXHJcbiAgICAgICAgICBlbmFibGVkOiB0cnVlLFxyXG4gICAgICAgICAgZXhwaXJhdGlvbjogY2RrLkR1cmF0aW9uLmRheXMoOTApLCAvLyBEZWxldGUgZmlsZXMgYWZ0ZXIgOTAgZGF5c1xyXG4gICAgICAgICAgdHJhbnNpdGlvbnM6IFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIHN0b3JhZ2VDbGFzczogczMuU3RvcmFnZUNsYXNzLklORlJFUVVFTlRfQUNDRVNTLFxyXG4gICAgICAgICAgICAgIHRyYW5zaXRpb25BZnRlcjogY2RrLkR1cmF0aW9uLmRheXMoMzApIC8vIE1vdmUgdG8gY2hlYXBlciBzdG9yYWdlIGFmdGVyIDMwIGRheXNcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgXVxyXG4gICAgICAgIH1cclxuICAgICAgXSxcclxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuUkVUQUlOIC8vIEtlZXAgYnVja2V0IHdoZW4gc3RhY2sgaXMgZGVsZXRlZFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gT3V0cHV0IGJ1Y2tldCBuYW1lXHJcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnQnVja2V0TmFtZScsIHtcclxuICAgICAgdmFsdWU6IHRoaXMuYnVja2V0LmJ1Y2tldE5hbWUsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiAnUzMgQnVja2V0IG5hbWUgZm9yIGZpbGUgdXBsb2FkcycsXHJcbiAgICAgIGV4cG9ydE5hbWU6ICdTaHJhbVNldHVCdWNrZXROYW1lJ1xyXG4gICAgfSk7XHJcblxyXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0J1Y2tldEFybicsIHtcclxuICAgICAgdmFsdWU6IHRoaXMuYnVja2V0LmJ1Y2tldEFybixcclxuICAgICAgZGVzY3JpcHRpb246ICdTMyBCdWNrZXQgQVJOJyxcclxuICAgICAgZXhwb3J0TmFtZTogJ1NocmFtU2V0dUJ1Y2tldEFybidcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG4iXX0=