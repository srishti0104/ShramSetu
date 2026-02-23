"use strict";
/**
 * S3 Bucket Configurations for shram-Setu
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudFrontConfig = exports.S3EventConfig = exports.S3BucketConfig = void 0;
exports.S3BucketConfig = {
    audioBucket: {
        bucketName: 'shram-setu-audio',
        purpose: 'Store voice recordings for grievances and voice commands',
        encryption: 'KMS',
        versioning: true,
        lifecycleRules: [
            {
                id: 'archive-old-audio',
                enabled: true,
                transitions: [
                    {
                        storageClass: 'INTELLIGENT_TIERING',
                        transitionAfter: 30, // days
                    },
                    {
                        storageClass: 'GLACIER',
                        transitionAfter: 180, // days
                    },
                ],
                expiration: 365, // days
            },
        ],
        corsRules: [
            {
                allowedOrigins: ['*'], // Update with actual domain in production
                allowedMethods: ['GET', 'PUT', 'POST'],
                allowedHeaders: ['*'],
                maxAge: 3000,
            },
        ],
        publicAccess: {
            blockPublicAcls: true,
            blockPublicPolicy: true,
            ignorePublicAcls: true,
            restrictPublicBuckets: true,
        },
    },
    documentBucket: {
        bucketName: 'shram-setu-documents',
        purpose: 'Store payslip images, receipts, and verification documents',
        encryption: 'KMS',
        versioning: true,
        lifecycleRules: [
            {
                id: 'archive-old-documents',
                enabled: true,
                transitions: [
                    {
                        storageClass: 'INTELLIGENT_TIERING',
                        transitionAfter: 90, // days
                    },
                ],
                // No expiration - keep documents indefinitely for compliance
            },
        ],
        corsRules: [
            {
                allowedOrigins: ['*'], // Update with actual domain in production
                allowedMethods: ['GET', 'PUT', 'POST'],
                allowedHeaders: ['*'],
                maxAge: 3000,
            },
        ],
        publicAccess: {
            blockPublicAcls: true,
            blockPublicPolicy: true,
            ignorePublicAcls: true,
            restrictPublicBuckets: true,
        },
    },
    // Folder structure within buckets
    folderStructure: {
        audio: {
            grievances: 'grievances/{userId}/{grievanceId}/',
            voiceCommands: 'voice-commands/{userId}/{sessionId}/',
            transcriptions: 'transcriptions/{userId}/{audioId}/',
        },
        documents: {
            payslips: 'payslips/{workerId}/{year}/{month}/',
            receipts: 'receipts/{transactionId}/',
            verificationDocs: 'verification/{userId}/',
            eShramCards: 'eshram/{userId}/',
        },
    },
    // Pre-signed URL configuration
    presignedUrlConfig: {
        upload: {
            expiresIn: 300, // 5 minutes
            maxFileSize: 5 * 1024 * 1024, // 5MB
        },
        download: {
            expiresIn: 3600, // 1 hour
        },
    },
    // File type restrictions
    allowedFileTypes: {
        audio: ['.mp3', '.wav', '.m4a', '.ogg', '.webm'],
        images: ['.jpg', '.jpeg', '.png', '.webp'],
        documents: ['.pdf', '.jpg', '.jpeg', '.png'],
    },
    // File size limits
    fileSizeLimits: {
        audio: 10 * 1024 * 1024, // 10MB
        image: 5 * 1024 * 1024, // 5MB
        document: 5 * 1024 * 1024, // 5MB
    },
};
/**
 * S3 Event Notifications Configuration
 */
exports.S3EventConfig = {
    // Trigger Lambda on payslip upload
    payslipUpload: {
        events: ['s3:ObjectCreated:*'],
        prefix: 'payslips/',
        suffix: '',
        lambdaFunction: 'payslip-processor',
    },
    // Trigger Lambda on grievance audio upload
    grievanceAudioUpload: {
        events: ['s3:ObjectCreated:*'],
        prefix: 'grievances/',
        suffix: '',
        lambdaFunction: 'grievance-transcriber',
    },
};
/**
 * CloudFront Distribution Configuration for S3
 */
exports.CloudFrontConfig = {
    enabled: true,
    priceClass: 'PriceClass_200', // Use edge locations in US, Europe, Asia, Middle East, and Africa
    geoRestriction: {
        restrictionType: 'whitelist',
        locations: ['IN'], // India only
    },
    cacheBehaviors: {
        audio: {
            pathPattern: 'audio/*',
            minTTL: 0,
            defaultTTL: 86400, // 1 day
            maxTTL: 31536000, // 1 year
        },
        documents: {
            pathPattern: 'documents/*',
            minTTL: 0,
            defaultTTL: 3600, // 1 hour
            maxTTL: 86400, // 1 day
        },
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiczMtY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiczMtY29uZmlnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7O0FBRVUsUUFBQSxjQUFjLEdBQUc7SUFDNUIsV0FBVyxFQUFFO1FBQ1gsVUFBVSxFQUFFLGtCQUFrQjtRQUM5QixPQUFPLEVBQUUsMERBQTBEO1FBQ25FLFVBQVUsRUFBRSxLQUFLO1FBQ2pCLFVBQVUsRUFBRSxJQUFJO1FBQ2hCLGNBQWMsRUFBRTtZQUNkO2dCQUNFLEVBQUUsRUFBRSxtQkFBbUI7Z0JBQ3ZCLE9BQU8sRUFBRSxJQUFJO2dCQUNiLFdBQVcsRUFBRTtvQkFDWDt3QkFDRSxZQUFZLEVBQUUscUJBQXFCO3dCQUNuQyxlQUFlLEVBQUUsRUFBRSxFQUFFLE9BQU87cUJBQzdCO29CQUNEO3dCQUNFLFlBQVksRUFBRSxTQUFTO3dCQUN2QixlQUFlLEVBQUUsR0FBRyxFQUFFLE9BQU87cUJBQzlCO2lCQUNGO2dCQUNELFVBQVUsRUFBRSxHQUFHLEVBQUUsT0FBTzthQUN6QjtTQUNGO1FBQ0QsU0FBUyxFQUFFO1lBQ1Q7Z0JBQ0UsY0FBYyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsMENBQTBDO2dCQUNqRSxjQUFjLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQztnQkFDdEMsY0FBYyxFQUFFLENBQUMsR0FBRyxDQUFDO2dCQUNyQixNQUFNLEVBQUUsSUFBSTthQUNiO1NBQ0Y7UUFDRCxZQUFZLEVBQUU7WUFDWixlQUFlLEVBQUUsSUFBSTtZQUNyQixpQkFBaUIsRUFBRSxJQUFJO1lBQ3ZCLGdCQUFnQixFQUFFLElBQUk7WUFDdEIscUJBQXFCLEVBQUUsSUFBSTtTQUM1QjtLQUNGO0lBRUQsY0FBYyxFQUFFO1FBQ2QsVUFBVSxFQUFFLHNCQUFzQjtRQUNsQyxPQUFPLEVBQUUsNERBQTREO1FBQ3JFLFVBQVUsRUFBRSxLQUFLO1FBQ2pCLFVBQVUsRUFBRSxJQUFJO1FB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Q0QsY0FBYyxFQUFFO1FBQ2QsS0FBSyxFQUFFO1lBQ0wsV0FBVyxFQUFFLFNBQVM7WUFDdEIsTUFBTSxFQUFFLENBQUM7WUFDVCxVQUFVLEVBQUUsS0FBSyxFQUFFLFFBQVE7WUFDM0IsTUFBTSxFQUFFLFFBQVEsRUFBRSxTQUFTO1NBQzVCO1FBQ0QsU0FBUyxFQUFFO1lBQ1QsV0FBVyxFQUFFLGFBQWE7WUFDMUIsTUFBTSxFQUFFLENBQUM7WUFDVCxVQUFVLEVBQUUsSUFBSSxFQUFFLFNBQVM7WUFDM0IsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRO1NBQ3hCO0tBQ0Y7Q0FDRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIFMzIEJ1Y2tldCBDb25maWd1cmF0aW9ucyBmb3Igc2hyYW0tU2V0dVxyXG4gKi9cclxuXHJcbmV4cG9ydCBjb25zdCBTM0J1Y2tldENvbmZpZyA9IHtcclxuICBhdWRpb0J1Y2tldDoge1xyXG4gICAgYnVja2V0TmFtZTogJ3NocmFtLXNldHUtYXVkaW8nLFxyXG4gICAgcHVycG9zZTogJ1N0b3JlIHZvaWNlIHJlY29yZGluZ3MgZm9yIGdyaWV2YW5jZXMgYW5kIHZvaWNlIGNvbW1hbmRzJyxcclxuICAgIGVuY3J5cHRpb246ICdLTVMnLFxyXG4gICAgdmVyc2lvbmluZzogdHJ1ZSxcclxuICAgIGxpZmVjeWNsZVJ1bGVzOiBbXHJcbiAgICAgIHtcclxuICAgICAgICBpZDogJ2FyY2hpdmUtb2xkLWF1ZGlvJyxcclxuICAgICAgICBlbmFibGVkOiB0cnVlLFxyXG4gICAgICAgIHRyYW5zaXRpb25zOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHN0b3JhZ2VDbGFzczogJ0lOVEVMTElHRU5UX1RJRVJJTkcnLFxyXG4gICAgICAgICAgICB0cmFuc2l0aW9uQWZ0ZXI6IDMwLCAvLyBkYXlzXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzdG9yYWdlQ2xhc3M6ICdHTEFDSUVSJyxcclxuICAgICAgICAgICAgdHJhbnNpdGlvbkFmdGVyOiAxODAsIC8vIGRheXNcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgXSxcclxuICAgICAgICBleHBpcmF0aW9uOiAzNjUsIC8vIGRheXNcclxuICAgICAgfSxcclxuICAgIF0sXHJcbiAgICBjb3JzUnVsZXM6IFtcclxuICAgICAge1xyXG4gICAgICAgIGFsbG93ZWRPcmlnaW5zOiBbJyonXSwgLy8gVXBkYXRlIHdpdGggYWN0dWFsIGRvbWFpbiBpbiBwcm9kdWN0aW9uXHJcbiAgICAgICAgYWxsb3dlZE1ldGhvZHM6IFsnR0VUJywgJ1BVVCcsICdQT1NUJ10sXHJcbiAgICAgICAgYWxsb3dlZEhlYWRlcnM6IFsnKiddLFxyXG4gICAgICAgIG1heEFnZTogMzAwMCxcclxuICAgICAgfSxcclxuICAgIF0sXHJcbiAgICBwdWJsaWNBY2Nlc3M6IHtcclxuICAgICAgYmxvY2tQdWJsaWNBY2xzOiB0cnVlLFxyXG4gICAgICBibG9ja1B1YmxpY1BvbGljeTogdHJ1ZSxcclxuICAgICAgaWdub3JlUHVibGljQWNsczogdHJ1ZSxcclxuICAgICAgcmVzdHJpY3RQdWJsaWNCdWNrZXRzOiB0cnVlLFxyXG4gICAgfSxcclxuICB9LFxyXG5cclxuICBkb2N1bWVudEJ1Y2tldDoge1xyXG4gICAgYnVja2V0TmFtZTogJ3NocmFtLXNldHUtZG9jdW1lbnRzJyxcclxuICAgIHB1cnBvc2U6ICdTdG9yZSBwYXlzbGlwIGltYWdlcywgcmVjZWlwdHMsIGFuZCB2ZXJpZmljYXRpb24gZG9jdW1lbnRzJyxcclxuICAgIGVuY3J5cHRpb246ICdLTVMnLFxyXG4gICAgdmVyc2lvbmluZzogdHJ1ZSxcclxuICAgIGxpZmVjeWNsZVJ1bGVzOiBbXHJcbiAgICAgIHtcclxuICAgICAgICBpZDogJ2FyY2hpdmUtb2xkLWRvY3VtZW50cycsXHJcbiAgICAgICAgZW5hYmxlZDogdHJ1ZSxcclxuICAgICAgICB0cmFuc2l0aW9uczogW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzdG9yYWdlQ2xhc3M6ICdJTlRFTExJR0VOVF9USUVSSU5HJyxcclxuICAgICAgICAgICAgdHJhbnNpdGlvbkFmdGVyOiA5MCwgLy8gZGF5c1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICBdLFxyXG4gICAgICAgIC8vIE5vIGV4cGlyYXRpb24gLSBrZWVwIGRvY3VtZW50cyBpbmRlZmluaXRlbHkgZm9yIGNvbXBsaWFuY2VcclxuICAgICAgfSxcclxuICAgIF0sXHJcbiAgICBjb3JzUnVsZXM6IFtcclxuICAgICAge1xyXG4gICAgICAgIGFsbG93ZWRPcmlnaW5zOiBbJyonXSwgLy8gVXBkYXRlIHdpdGggYWN0dWFsIGRvbWFpbiBpbiBwcm9kdWN0aW9uXHJcbiAgICAgICAgYWxsb3dlZE1ldGhvZHM6IFsnR0VUJywgJ1BVVCcsICdQT1NUJ10sXHJcbiAgICAgICAgYWxsb3dlZEhlYWRlcnM6IFsnKiddLFxyXG4gICAgICAgIG1heEFnZTogMzAwMCxcclxuICAgICAgfSxcclxuICAgIF0sXHJcbiAgICBwdWJsaWNBY2Nlc3M6IHtcclxuICAgICAgYmxvY2tQdWJsaWNBY2xzOiB0cnVlLFxyXG4gICAgICBibG9ja1B1YmxpY1BvbGljeTogdHJ1ZSxcclxuICAgICAgaWdub3JlUHVibGljQWNsczogdHJ1ZSxcclxuICAgICAgcmVzdHJpY3RQdWJsaWNCdWNrZXRzOiB0cnVlLFxyXG4gICAgfSxcclxuICB9LFxyXG5cclxuICAvLyBGb2xkZXIgc3RydWN0dXJlIHdpdGhpbiBidWNrZXRzXHJcbiAgZm9sZGVyU3RydWN0dXJlOiB7XHJcbiAgICBhdWRpbzoge1xyXG4gICAgICBncmlldmFuY2VzOiAnZ3JpZXZhbmNlcy97dXNlcklkfS97Z3JpZXZhbmNlSWR9LycsXHJcbiAgICAgIHZvaWNlQ29tbWFuZHM6ICd2b2ljZS1jb21tYW5kcy97dXNlcklkfS97c2Vzc2lvbklkfS8nLFxyXG4gICAgICB0cmFuc2NyaXB0aW9uczogJ3RyYW5zY3JpcHRpb25zL3t1c2VySWR9L3thdWRpb0lkfS8nLFxyXG4gICAgfSxcclxuICAgIGRvY3VtZW50czoge1xyXG4gICAgICBwYXlzbGlwczogJ3BheXNsaXBzL3t3b3JrZXJJZH0ve3llYXJ9L3ttb250aH0vJyxcclxuICAgICAgcmVjZWlwdHM6ICdyZWNlaXB0cy97dHJhbnNhY3Rpb25JZH0vJyxcclxuICAgICAgdmVyaWZpY2F0aW9uRG9jczogJ3ZlcmlmaWNhdGlvbi97dXNlcklkfS8nLFxyXG4gICAgICBlU2hyYW1DYXJkczogJ2VzaHJhbS97dXNlcklkfS8nLFxyXG4gICAgfSxcclxuICB9LFxyXG5cclxuICAvLyBQcmUtc2lnbmVkIFVSTCBjb25maWd1cmF0aW9uXHJcbiAgcHJlc2lnbmVkVXJsQ29uZmlnOiB7XHJcbiAgICB1cGxvYWQ6IHtcclxuICAgICAgZXhwaXJlc0luOiAzMDAsIC8vIDUgbWludXRlc1xyXG4gICAgICBtYXhGaWxlU2l6ZTogNSAqIDEwMjQgKiAxMDI0LCAvLyA1TUJcclxuICAgIH0sXHJcbiAgICBkb3dubG9hZDoge1xyXG4gICAgICBleHBpcmVzSW46IDM2MDAsIC8vIDEgaG91clxyXG4gICAgfSxcclxuICB9LFxyXG5cclxuICAvLyBGaWxlIHR5cGUgcmVzdHJpY3Rpb25zXHJcbiAgYWxsb3dlZEZpbGVUeXBlczoge1xyXG4gICAgYXVkaW86IFsnLm1wMycsICcud2F2JywgJy5tNGEnLCAnLm9nZycsICcud2VibSddLFxyXG4gICAgaW1hZ2VzOiBbJy5qcGcnLCAnLmpwZWcnLCAnLnBuZycsICcud2VicCddLFxyXG4gICAgZG9jdW1lbnRzOiBbJy5wZGYnLCAnLmpwZycsICcuanBlZycsICcucG5nJ10sXHJcbiAgfSxcclxuXHJcbiAgLy8gRmlsZSBzaXplIGxpbWl0c1xyXG4gIGZpbGVTaXplTGltaXRzOiB7XHJcbiAgICBhdWRpbzogMTAgKiAxMDI0ICogMTAyNCwgLy8gMTBNQlxyXG4gICAgaW1hZ2U6IDUgKiAxMDI0ICogMTAyNCwgLy8gNU1CXHJcbiAgICBkb2N1bWVudDogNSAqIDEwMjQgKiAxMDI0LCAvLyA1TUJcclxuICB9LFxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFMzIEV2ZW50IE5vdGlmaWNhdGlvbnMgQ29uZmlndXJhdGlvblxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IFMzRXZlbnRDb25maWcgPSB7XHJcbiAgLy8gVHJpZ2dlciBMYW1iZGEgb24gcGF5c2xpcCB1cGxvYWRcclxuICBwYXlzbGlwVXBsb2FkOiB7XHJcbiAgICBldmVudHM6IFsnczM6T2JqZWN0Q3JlYXRlZDoqJ10sXHJcbiAgICBwcmVmaXg6ICdwYXlzbGlwcy8nLFxyXG4gICAgc3VmZml4OiAnJyxcclxuICAgIGxhbWJkYUZ1bmN0aW9uOiAncGF5c2xpcC1wcm9jZXNzb3InLFxyXG4gIH0sXHJcblxyXG4gIC8vIFRyaWdnZXIgTGFtYmRhIG9uIGdyaWV2YW5jZSBhdWRpbyB1cGxvYWRcclxuICBncmlldmFuY2VBdWRpb1VwbG9hZDoge1xyXG4gICAgZXZlbnRzOiBbJ3MzOk9iamVjdENyZWF0ZWQ6KiddLFxyXG4gICAgcHJlZml4OiAnZ3JpZXZhbmNlcy8nLFxyXG4gICAgc3VmZml4OiAnJyxcclxuICAgIGxhbWJkYUZ1bmN0aW9uOiAnZ3JpZXZhbmNlLXRyYW5zY3JpYmVyJyxcclxuICB9LFxyXG59O1xyXG5cclxuLyoqXHJcbiAqIENsb3VkRnJvbnQgRGlzdHJpYnV0aW9uIENvbmZpZ3VyYXRpb24gZm9yIFMzXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgQ2xvdWRGcm9udENvbmZpZyA9IHtcclxuICBlbmFibGVkOiB0cnVlLFxyXG4gIHByaWNlQ2xhc3M6ICdQcmljZUNsYXNzXzIwMCcsIC8vIFVzZSBlZGdlIGxvY2F0aW9ucyBpbiBVUywgRXVyb3BlLCBBc2lhLCBNaWRkbGUgRWFzdCwgYW5kIEFmcmljYVxyXG4gIGdlb1Jlc3RyaWN0aW9uOiB7XHJcbiAgICByZXN0cmljdGlvblR5cGU6ICd3aGl0ZWxpc3QnLFxyXG4gICAgbG9jYXRpb25zOiBbJ0lOJ10sIC8vIEluZGlhIG9ubHlcclxuICB9LFxyXG4gIGNhY2hlQmVoYXZpb3JzOiB7XHJcbiAgICBhdWRpbzoge1xyXG4gICAgICBwYXRoUGF0dGVybjogJ2F1ZGlvLyonLFxyXG4gICAgICBtaW5UVEw6IDAsXHJcbiAgICAgIGRlZmF1bHRUVEw6IDg2NDAwLCAvLyAxIGRheVxyXG4gICAgICBtYXhUVEw6IDMxNTM2MDAwLCAvLyAxIHllYXJcclxuICAgIH0sXHJcbiAgICBkb2N1bWVudHM6IHtcclxuICAgICAgcGF0aFBhdHRlcm46ICdkb2N1bWVudHMvKicsXHJcbiAgICAgIG1pblRUTDogMCxcclxuICAgICAgZGVmYXVsdFRUTDogMzYwMCwgLy8gMSBob3VyXHJcbiAgICAgIG1heFRUTDogODY0MDAsIC8vIDEgZGF5XHJcbiAgICB9LFxyXG4gIH0sXHJcbn07XHJcblxyXG4iXX0=