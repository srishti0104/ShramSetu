"use strict";
/**
 * API Gateway Configuration for Shram-Setu
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIGatewayConfig = void 0;
exports.APIGatewayConfig = {
    restApi: {
        name: 'Shram-Setu API',
        description: 'REST API for Shram-Setu platform',
        deploymentStage: 'v1',
        // Throttling settings
        throttling: {
            rateLimit: 1000, // requests per second
            burstLimit: 2000, // concurrent requests
        },
        // CORS configuration
        cors: {
            allowOrigins: ['*'], // Update with actual domain in production
            allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowHeaders: [
                'Content-Type',
                'Authorization',
                'X-Amz-Date',
                'X-Api-Key',
                'X-Amz-Security-Token',
                'X-User-Language',
            ],
            maxAge: 3600,
        },
        // API Keys and Usage Plans
        usagePlans: {
            free: {
                name: 'Free Tier',
                throttle: {
                    rateLimit: 100,
                    burstLimit: 200,
                },
                quota: {
                    limit: 10000,
                    period: 'MONTH',
                },
            },
            premium: {
                name: 'Premium Tier',
                throttle: {
                    rateLimit: 1000,
                    burstLimit: 2000,
                },
                quota: {
                    limit: 1000000,
                    period: 'MONTH',
                },
            },
        },
    },
    // REST API Endpoints
    endpoints: {
        // Authentication & Onboarding
        auth: {
            basePath: '/api/v1/auth',
            methods: {
                sendOtp: {
                    path: '/send-otp',
                    method: 'POST',
                    lambda: 'auth-send-otp',
                    rateLimit: 10, // per minute
                    auth: false,
                },
                verifyOtp: {
                    path: '/verify-otp',
                    method: 'POST',
                    lambda: 'auth-verify-otp',
                    rateLimit: 10,
                    auth: false,
                },
                register: {
                    path: '/register',
                    method: 'POST',
                    lambda: 'auth-register',
                    auth: false,
                },
                login: {
                    path: '/login',
                    method: 'POST',
                    lambda: 'auth-login',
                    auth: false,
                },
                refreshToken: {
                    path: '/refresh-token',
                    method: 'POST',
                    lambda: 'auth-refresh-token',
                    auth: true,
                },
                logout: {
                    path: '/logout',
                    method: 'POST',
                    lambda: 'auth-logout',
                    auth: true,
                },
            },
        },
        // Onboarding
        onboarding: {
            basePath: '/api/v1/onboarding',
            methods: {
                validateEshram: {
                    path: '/validate-eshram',
                    method: 'POST',
                    lambda: 'onboarding-validate-eshram',
                    auth: true,
                },
                completeProfile: {
                    path: '/complete-profile',
                    method: 'POST',
                    lambda: 'onboarding-complete-profile',
                    auth: true,
                },
            },
        },
        // Voice Assistant
        voice: {
            basePath: '/api/v1/voice',
            methods: {
                processCommand: {
                    path: '/process-command',
                    method: 'POST',
                    lambda: 'voice-process-command',
                    auth: true,
                    rateLimit: 5, // per minute
                },
                synthesizeSpeech: {
                    path: '/synthesize-speech',
                    method: 'POST',
                    lambda: 'voice-synthesize-speech',
                    auth: true,
                },
                getSession: {
                    path: '/session/{sessionId}',
                    method: 'GET',
                    lambda: 'voice-get-session',
                    auth: true,
                },
                deleteSession: {
                    path: '/session/{sessionId}',
                    method: 'DELETE',
                    lambda: 'voice-delete-session',
                    auth: true,
                },
            },
        },
        // Job Marketplace
        jobs: {
            basePath: '/api/v1/jobs',
            methods: {
                search: {
                    path: '/search',
                    method: 'GET',
                    lambda: 'jobs-search',
                    auth: true,
                },
                create: {
                    path: '',
                    method: 'POST',
                    lambda: 'jobs-create',
                    auth: true,
                },
                get: {
                    path: '/{jobId}',
                    method: 'GET',
                    lambda: 'jobs-get',
                    auth: true,
                },
                update: {
                    path: '/{jobId}',
                    method: 'PUT',
                    lambda: 'jobs-update',
                    auth: true,
                },
                delete: {
                    path: '/{jobId}',
                    method: 'DELETE',
                    lambda: 'jobs-delete',
                    auth: true,
                },
                apply: {
                    path: '/{jobId}/apply',
                    method: 'POST',
                    lambda: 'jobs-apply',
                    auth: true,
                },
                getApplications: {
                    path: '/{jobId}/applications',
                    method: 'GET',
                    lambda: 'jobs-get-applications',
                    auth: true,
                },
                updateApplication: {
                    path: '/{jobId}/applications/{applicationId}',
                    method: 'PUT',
                    lambda: 'jobs-update-application',
                    auth: true,
                },
            },
        },
        // E-Khata Ledger
        ledger: {
            basePath: '/api/v1/ledger',
            methods: {
                createTransaction: {
                    path: '/transactions',
                    method: 'POST',
                    lambda: 'ledger-create-transaction',
                    auth: true,
                },
                getTransactions: {
                    path: '/transactions',
                    method: 'GET',
                    lambda: 'ledger-get-transactions',
                    auth: true,
                },
                getTransaction: {
                    path: '/transactions/{transactionId}',
                    method: 'GET',
                    lambda: 'ledger-get-transaction',
                    auth: true,
                },
                getBalance: {
                    path: '/balance/{workerId}',
                    method: 'GET',
                    lambda: 'ledger-get-balance',
                    auth: true,
                },
                checkCompliance: {
                    path: '/compliance-check',
                    method: 'GET',
                    lambda: 'ledger-check-compliance',
                    auth: true,
                },
                uploadPayslip: {
                    path: '/payslip/upload',
                    method: 'POST',
                    lambda: 'ledger-upload-payslip',
                    auth: true,
                },
                getPayslip: {
                    path: '/payslip/{payslipId}',
                    method: 'GET',
                    lambda: 'ledger-get-payslip',
                    auth: true,
                },
            },
        },
        // Attendance
        attendance: {
            basePath: '/api/v1/attendance',
            methods: {
                createSession: {
                    path: '/sessions',
                    method: 'POST',
                    lambda: 'attendance-create-session',
                    auth: true,
                },
                getSession: {
                    path: '/sessions/{sessionId}',
                    method: 'GET',
                    lambda: 'attendance-get-session',
                    auth: true,
                },
                generateTotp: {
                    path: '/sessions/{sessionId}/generate-totp',
                    method: 'POST',
                    lambda: 'attendance-generate-totp',
                    auth: true,
                },
                markAttendance: {
                    path: '/sessions/{sessionId}/mark',
                    method: 'POST',
                    lambda: 'attendance-mark',
                    auth: true,
                },
                getRecords: {
                    path: '/records',
                    method: 'GET',
                    lambda: 'attendance-get-records',
                    auth: true,
                },
            },
        },
        // Grievances
        grievances: {
            basePath: '/api/v1/grievances',
            methods: {
                create: {
                    path: '',
                    method: 'POST',
                    lambda: 'grievances-create',
                    auth: true,
                },
                list: {
                    path: '',
                    method: 'GET',
                    lambda: 'grievances-list',
                    auth: true,
                },
                get: {
                    path: '/{grievanceId}',
                    method: 'GET',
                    lambda: 'grievances-get',
                    auth: true,
                },
                update: {
                    path: '/{grievanceId}',
                    method: 'PUT',
                    lambda: 'grievances-update',
                    auth: true,
                },
            },
        },
        // Ratings & Trust
        ratings: {
            basePath: '/api/v1/ratings',
            methods: {
                submit: {
                    path: '',
                    method: 'POST',
                    lambda: 'ratings-submit',
                    auth: true,
                },
                get: {
                    path: '/{userId}',
                    method: 'GET',
                    lambda: 'ratings-get',
                    auth: true,
                },
                getTrustProfile: {
                    path: '/trust-profile/{userId}',
                    method: 'GET',
                    lambda: 'ratings-get-trust-profile',
                    auth: true,
                },
            },
        },
        // Sync
        sync: {
            basePath: '/api/v1/sync',
            methods: {
                processOperations: {
                    path: '/operations',
                    method: 'POST',
                    lambda: 'sync-process-operations',
                    auth: true,
                },
                getStatus: {
                    path: '/status',
                    method: 'GET',
                    lambda: 'sync-get-status',
                    auth: true,
                },
                resolveConflict: {
                    path: '/resolve-conflict',
                    method: 'POST',
                    lambda: 'sync-resolve-conflict',
                    auth: true,
                },
            },
        },
    },
    // WebSocket API Configuration
    websocketApi: {
        name: 'Shram-Setu WebSocket API',
        description: 'WebSocket API for real-time features',
        routeSelectionExpression: '$request.body.action',
        routes: {
            connect: {
                routeKey: '$connect',
                lambda: 'websocket-connect',
                auth: true,
            },
            disconnect: {
                routeKey: '$disconnect',
                lambda: 'websocket-disconnect',
            },
            default: {
                routeKey: '$default',
                lambda: 'websocket-default',
            },
            subscribe: {
                routeKey: 'subscribe',
                lambda: 'websocket-subscribe',
            },
            unsubscribe: {
                routeKey: 'unsubscribe',
                lambda: 'websocket-unsubscribe',
            },
        },
        // WebSocket event types
        events: {
            jobPosted: 'job_posted',
            applicationStatus: 'application_status',
            totpGenerated: 'totp_generated',
            paymentReceived: 'payment_received',
            grievanceUpdate: 'grievance_update',
            attendanceMarked: 'attendance_marked',
        },
    },
    // Lambda Authorizer Configuration
    authorizer: {
        name: 'JWTAuthorizer',
        type: 'TOKEN',
        identitySource: 'method.request.header.Authorization',
        authorizerResultTtl: 300, // 5 minutes
        lambda: 'auth-authorizer',
    },
    // Request/Response Models
    models: {
        errorResponse: {
            schema: {
                type: 'object',
                properties: {
                    error: {
                        type: 'object',
                        properties: {
                            code: { type: 'string' },
                            message: { type: 'string' },
                            details: { type: 'object' },
                            timestamp: { type: 'number' },
                            requestId: { type: 'string' },
                            retryable: { type: 'boolean' },
                        },
                    },
                },
            },
        },
    },
    // Monitoring and Logging
    monitoring: {
        accessLogging: true,
        executionLogging: true,
        dataTraceEnabled: false, // Disable in production for security
        metricsEnabled: true,
        cloudWatchMetrics: [
            'Count',
            '4XXError',
            '5XXError',
            'Latency',
            'IntegrationLatency',
            'CacheHitCount',
            'CacheMissCount',
        ],
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLWdhdGV3YXktY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBpLWdhdGV3YXktY29uZmlnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7O0FBRVUsUUFBQSxnQkFBZ0IsR0FBRztJQUM5QixPQUFPLEVBQUU7UUFDUCxJQUFJLEVBQUUsZ0JBQWdCO1FBQ3RCLFdBQVcsRUFBRSxrQ0FBa0M7UUFDL0MsZUFBZSxFQUFFLElBQUk7UUFFckIsc0JBQXNCO1FBQ3RCLFVBQVUsRUFBRTtZQUNWLFNBQVMsRUFBRSxJQUFJLEVBQUUsc0JBQXNCO1lBQ3ZDLFVBQVUsRUFBRSxJQUFJLEVBQUUsc0JBQXNCO1NBQ3pDO1FBRUQscUJBQXFCO1FBQ3JCLElBQUksRUFBRTtZQUNKLFlBQVksRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLDBDQUEwQztZQUMvRCxZQUFZLEVBQUUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsU0FBUyxDQUFDO1lBQ3pELFlBQVksRUFBRTtnQkFDWixjQUFjO2dCQUNkLGVBQWU7Z0JBQ2YsWUFBWTtnQkFDWixXQUFXO2dCQUNYLHNCQUFzQjtnQkFDdEIsaUJBQWlCO2FBQ2xCO1lBQ0QsTUFBTSxFQUFFLElBQUk7U0FDYjtRQUVELDJCQUEyQjtRQUMzQixVQUFVLEVBQUU7WUFDVixJQUFJLEVBQUU7Z0JBQ0osSUFBSSxFQUFFLFdBQVc7Z0JBQ2pCLFFBQVEsRUFBRTtvQkFDUixTQUFTLEVBQUUsR0FBRztvQkFDZCxVQUFVLEVBQUUsR0FBRztpQkFDaEI7Z0JBQ0QsS0FBSyxFQUFFO29CQUNMLEtBQUssRUFBRSxLQUFLO29CQUNaLE1BQU0sRUFBRSxPQUFPO2lCQUNoQjthQUNGO1lBQ0QsT0FBTyxFQUFFO2dCQUNQLElBQUksRUFBRSxjQUFjO2dCQUNwQixRQUFRLEVBQUU7b0JBQ1IsU0FBUyxFQUFFLElBQUk7b0JBQ2YsVUFBVSxFQUFFLElBQUk7aUJBQ2pCO2dC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aUI7S0FDMUI7SUFFRCwwQkFBMEI7SUFDMUIsTUFBTSxFQUFFO1FBQ04sYUFBYSxFQUFFO1lBQ2IsTUFBTSxFQUFFO2dCQUNOLElBQUksRUFBRSxRQUFRO2dCQUNkLFVBQVUsRUFBRTtvQkFDVixLQUFLLEVBQUU7d0JBQ0wsSUFBSSxFQUFFLFFBQVE7d0JBQ2QsVUFBVSxFQUFFOzRCQUNWLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7NEJBQ3hCLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7NEJBQzNCLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7NEJBQzNCLFNBQVMsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7NEJBQzdCLFNBQVMsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7NEJBQzdCLFNBQVMsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUU7eUJBQy9CO3FCQUNGO2lCQUNGO2FBQ0Y7U0FDRjtLQUNGO0lBRUQseUJBQXlCO0lBQ3pCLFVBQVUsRUFBRTtRQUNWLGFBQWEsRUFBRSxJQUFJO1FBQ25CLGdCQUFnQixFQUFFLElBQUk7UUFDdEIsZ0JBQWdCLEVBQUUsS0FBSyxFQUFFLHFDQUFxQztRQUM5RCxjQUFjLEVBQUUsSUFBSTtRQUVwQixpQkFBaUIsRUFBRTtZQUNqQixPQUFPO1lBQ1AsVUFBVTtZQUNWLFVBQVU7WUFDVixTQUFTO1lBQ1Qsb0JBQW9CO1lBQ3BCLGVBQWU7WUFDZixnQkFBZ0I7U0FDakI7S0FDRjtDQUNGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQVBJIEdhdGV3YXkgQ29uZmlndXJhdGlvbiBmb3IgU2hyYW0tU2V0dVxyXG4gKi9cclxuXHJcbmV4cG9ydCBjb25zdCBBUElHYXRld2F5Q29uZmlnID0ge1xyXG4gIHJlc3RBcGk6IHtcclxuICAgIG5hbWU6ICdTaHJhbS1TZXR1IEFQSScsXHJcbiAgICBkZXNjcmlwdGlvbjogJ1JFU1QgQVBJIGZvciBTaHJhbS1TZXR1IHBsYXRmb3JtJyxcclxuICAgIGRlcGxveW1lbnRTdGFnZTogJ3YxJyxcclxuICAgIFxyXG4gICAgLy8gVGhyb3R0bGluZyBzZXR0aW5nc1xyXG4gICAgdGhyb3R0bGluZzoge1xyXG4gICAgICByYXRlTGltaXQ6IDEwMDAsIC8vIHJlcXVlc3RzIHBlciBzZWNvbmRcclxuICAgICAgYnVyc3RMaW1pdDogMjAwMCwgLy8gY29uY3VycmVudCByZXF1ZXN0c1xyXG4gICAgfSxcclxuXHJcbiAgICAvLyBDT1JTIGNvbmZpZ3VyYXRpb25cclxuICAgIGNvcnM6IHtcclxuICAgICAgYWxsb3dPcmlnaW5zOiBbJyonXSwgLy8gVXBkYXRlIHdpdGggYWN0dWFsIGRvbWFpbiBpbiBwcm9kdWN0aW9uXHJcbiAgICAgIGFsbG93TWV0aG9kczogWydHRVQnLCAnUE9TVCcsICdQVVQnLCAnREVMRVRFJywgJ09QVElPTlMnXSxcclxuICAgICAgYWxsb3dIZWFkZXJzOiBbXHJcbiAgICAgICAgJ0NvbnRlbnQtVHlwZScsXHJcbiAgICAgICAgJ0F1dGhvcml6YXRpb24nLFxyXG4gICAgICAgICdYLUFtei1EYXRlJyxcclxuICAgICAgICAnWC1BcGktS2V5JyxcclxuICAgICAgICAnWC1BbXotU2VjdXJpdHktVG9rZW4nLFxyXG4gICAgICAgICdYLVVzZXItTGFuZ3VhZ2UnLFxyXG4gICAgICBdLFxyXG4gICAgICBtYXhBZ2U6IDM2MDAsXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIEFQSSBLZXlzIGFuZCBVc2FnZSBQbGFuc1xyXG4gICAgdXNhZ2VQbGFuczoge1xyXG4gICAgICBmcmVlOiB7XHJcbiAgICAgICAgbmFtZTogJ0ZyZWUgVGllcicsXHJcbiAgICAgICAgdGhyb3R0bGU6IHtcclxuICAgICAgICAgIHJhdGVMaW1pdDogMTAwLFxyXG4gICAgICAgICAgYnVyc3RMaW1pdDogMjAwLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcXVvdGE6IHtcclxuICAgICAgICAgIGxpbWl0OiAxMDAwMCxcclxuICAgICAgICAgIHBlcmlvZDogJ01PTlRIJyxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgICBwcmVtaXVtOiB7XHJcbiAgICAgICAgbmFtZTogJ1ByZW1pdW0gVGllcicsXHJcbiAgICAgICAgdGhyb3R0bGU6IHtcclxuICAgICAgICAgIHJhdGVMaW1pdDogMTAwMCxcclxuICAgICAgICAgIGJ1cnN0TGltaXQ6IDIwMDAsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBxdW90YToge1xyXG4gICAgICAgICAgbGltaXQ6IDEwMDAwMDAsXHJcbiAgICAgICAgICBwZXJpb2Q6ICdNT05USCcsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxuXHJcbiAgLy8gUkVTVCBBUEkgRW5kcG9pbnRzXHJcbiAgZW5kcG9pbnRzOiB7XHJcbiAgICAvLyBBdXRoZW50aWNhdGlvbiAmIE9uYm9hcmRpbmdcclxuICAgIGF1dGg6IHtcclxuICAgICAgYmFzZVBhdGg6ICcvYXBpL3YxL2F1dGgnLFxyXG4gICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgc2VuZE90cDoge1xyXG4gICAgICAgICAgcGF0aDogJy9zZW5kLW90cCcsXHJcbiAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgIGxhbWJkYTogJ2F1dGgtc2VuZC1vdHAnLFxyXG4gICAgICAgICAgcmF0ZUxpbWl0OiAxMCwgLy8gcGVyIG1pbnV0ZVxyXG4gICAgICAgICAgYXV0aDogZmFsc2UsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB2ZXJpZnlPdHA6IHtcclxuICAgICAgICAgIHBhdGg6ICcvdmVyaWZ5LW90cCcsXHJcbiAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgIGxhbWJkYTogJ2F1dGgtdmVyaWZ5LW90cCcsXHJcbiAgICAgICAgICByYXRlTGltaXQ6IDEwLFxyXG4gICAgICAgICAgYXV0aDogZmFsc2UsXHJcbiAgICAgICAgfSxcclxuICAgICAgICByZWdpc3Rlcjoge1xyXG4gICAgICAgICAgcGF0aDogJy9yZWdpc3RlcicsXHJcbiAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgIGxhbWJkYTogJ2F1dGgtcmVnaXN0ZXInLFxyXG4gICAgICAgICAgYXV0aDogZmFsc2UsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBsb2dpbjoge1xyXG4gICAgICAgICAgcGF0aDogJy9sb2dpbicsXHJcbiAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgIGxhbWJkYTogJ2F1dGgtbG9naW4nLFxyXG4gICAgICAgICAgYXV0aDogZmFsc2UsXHJcbiAgICAgICAgfSxcclxuICAgICAgICByZWZyZXNoVG9rZW46IHtcclxuICAgICAgICAgIHBhdGg6ICcvcmVmcmVzaC10b2tlbicsXHJcbiAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgIGxhbWJkYTogJ2F1dGgtcmVmcmVzaC10b2tlbicsXHJcbiAgICAgICAgICBhdXRoOiB0cnVlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbG9nb3V0OiB7XHJcbiAgICAgICAgICBwYXRoOiAnL2xvZ291dCcsXHJcbiAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgIGxhbWJkYTogJ2F1dGgtbG9nb3V0JyxcclxuICAgICAgICAgIGF1dGg6IHRydWUsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcblxyXG4gICAgLy8gT25ib2FyZGluZ1xyXG4gICAgb25ib2FyZGluZzoge1xyXG4gICAgICBiYXNlUGF0aDogJy9hcGkvdjEvb25ib2FyZGluZycsXHJcbiAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICB2YWxpZGF0ZUVzaHJhbToge1xyXG4gICAgICAgICAgcGF0aDogJy92YWxpZGF0ZS1lc2hyYW0nLFxyXG4gICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICBsYW1iZGE6ICdvbmJvYXJkaW5nLXZhbGlkYXRlLWVzaHJhbScsXHJcbiAgICAgICAgICBhdXRoOiB0cnVlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY29tcGxldGVQcm9maWxlOiB7XHJcbiAgICAgICAgICBwYXRoOiAnL2NvbXBsZXRlLXByb2ZpbGUnLFxyXG4gICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICBsYW1iZGE6ICdvbmJvYXJkaW5nLWNvbXBsZXRlLXByb2ZpbGUnLFxyXG4gICAgICAgICAgYXV0aDogdHJ1ZSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuXHJcbiAgICAvLyBWb2ljZSBBc3Npc3RhbnRcclxuICAgIHZvaWNlOiB7XHJcbiAgICAgIGJhc2VQYXRoOiAnL2FwaS92MS92b2ljZScsXHJcbiAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICBwcm9jZXNzQ29tbWFuZDoge1xyXG4gICAgICAgICAgcGF0aDogJy9wcm9jZXNzLWNvbW1hbmQnLFxyXG4gICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICBsYW1iZGE6ICd2b2ljZS1wcm9jZXNzLWNvbW1hbmQnLFxyXG4gICAgICAgICAgYXV0aDogdHJ1ZSxcclxuICAgICAgICAgIHJhdGVMaW1pdDogNSwgLy8gcGVyIG1pbnV0ZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc3ludGhlc2l6ZVNwZWVjaDoge1xyXG4gICAgICAgICAgcGF0aDogJy9zeW50aGVzaXplLXNwZWVjaCcsXHJcbiAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgIGxhbWJkYTogJ3ZvaWNlLXN5bnRoZXNpemUtc3BlZWNoJyxcclxuICAgICAgICAgIGF1dGg6IHRydWUsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRTZXNzaW9uOiB7XHJcbiAgICAgICAgICBwYXRoOiAnL3Nlc3Npb24ve3Nlc3Npb25JZH0nLFxyXG4gICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICAgIGxhbWJkYTogJ3ZvaWNlLWdldC1zZXNzaW9uJyxcclxuICAgICAgICAgIGF1dGg6IHRydWUsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkZWxldGVTZXNzaW9uOiB7XHJcbiAgICAgICAgICBwYXRoOiAnL3Nlc3Npb24ve3Nlc3Npb25JZH0nLFxyXG4gICAgICAgICAgbWV0aG9kOiAnREVMRVRFJyxcclxuICAgICAgICAgIGxhbWJkYTogJ3ZvaWNlLWRlbGV0ZS1zZXNzaW9uJyxcclxuICAgICAgICAgIGF1dGg6IHRydWUsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcblxyXG4gICAgLy8gSm9iIE1hcmtldHBsYWNlXHJcbiAgICBqb2JzOiB7XHJcbiAgICAgIGJhc2VQYXRoOiAnL2FwaS92MS9qb2JzJyxcclxuICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgIHNlYXJjaDoge1xyXG4gICAgICAgICAgcGF0aDogJy9zZWFyY2gnLFxyXG4gICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICAgIGxhbWJkYTogJ2pvYnMtc2VhcmNoJyxcclxuICAgICAgICAgIGF1dGg6IHRydWUsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBjcmVhdGU6IHtcclxuICAgICAgICAgIHBhdGg6ICcnLFxyXG4gICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICBsYW1iZGE6ICdqb2JzLWNyZWF0ZScsXHJcbiAgICAgICAgICBhdXRoOiB0cnVlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0OiB7XHJcbiAgICAgICAgICBwYXRoOiAnL3tqb2JJZH0nLFxyXG4gICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICAgIGxhbWJkYTogJ2pvYnMtZ2V0JyxcclxuICAgICAgICAgIGF1dGg6IHRydWUsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB1cGRhdGU6IHtcclxuICAgICAgICAgIHBhdGg6ICcve2pvYklkfScsXHJcbiAgICAgICAgICBtZXRob2Q6ICdQVVQnLFxyXG4gICAgICAgICAgbGFtYmRhOiAnam9icy11cGRhdGUnLFxyXG4gICAgICAgICAgYXV0aDogdHJ1ZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRlbGV0ZToge1xyXG4gICAgICAgICAgcGF0aDogJy97am9iSWR9JyxcclxuICAgICAgICAgIG1ldGhvZDogJ0RFTEVURScsXHJcbiAgICAgICAgICBsYW1iZGE6ICdqb2JzLWRlbGV0ZScsXHJcbiAgICAgICAgICBhdXRoOiB0cnVlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYXBwbHk6IHtcclxuICAgICAgICAgIHBhdGg6ICcve2pvYklkfS9hcHBseScsXHJcbiAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgIGxhbWJkYTogJ2pvYnMtYXBwbHknLFxyXG4gICAgICAgICAgYXV0aDogdHJ1ZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldEFwcGxpY2F0aW9uczoge1xyXG4gICAgICAgICAgcGF0aDogJy97am9iSWR9L2FwcGxpY2F0aW9ucycsXHJcbiAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgbGFtYmRhOiAnam9icy1nZXQtYXBwbGljYXRpb25zJyxcclxuICAgICAgICAgIGF1dGg6IHRydWUsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB1cGRhdGVBcHBsaWNhdGlvbjoge1xyXG4gICAgICAgICAgcGF0aDogJy97am9iSWR9L2FwcGxpY2F0aW9ucy97YXBwbGljYXRpb25JZH0nLFxyXG4gICAgICAgICAgbWV0aG9kOiAnUFVUJyxcclxuICAgICAgICAgIGxhbWJkYTogJ2pvYnMtdXBkYXRlLWFwcGxpY2F0aW9uJyxcclxuICAgICAgICAgIGF1dGg6IHRydWUsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcblxyXG4gICAgLy8gRS1LaGF0YSBMZWRnZXJcclxuICAgIGxlZGdlcjoge1xyXG4gICAgICBiYXNlUGF0aDogJy9hcGkvdjEvbGVkZ2VyJyxcclxuICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgIGNyZWF0ZVRyYW5zYWN0aW9uOiB7XHJcbiAgICAgICAgICBwYXRoOiAnL3RyYW5zYWN0aW9ucycsXHJcbiAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgIGxhbWJkYTogJ2xlZGdlci1jcmVhdGUtdHJhbnNhY3Rpb24nLFxyXG4gICAgICAgICAgYXV0aDogdHJ1ZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFRyYW5zYWN0aW9uczoge1xyXG4gICAgICAgICAgcGF0aDogJy90cmFuc2FjdGlvbnMnLFxyXG4gICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICAgIGxhbWJkYTogJ2xlZGdlci1nZXQtdHJhbnNhY3Rpb25zJyxcclxuICAgICAgICAgIGF1dGg6IHRydWUsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRUcmFuc2FjdGlvbjoge1xyXG4gICAgICAgICAgcGF0aDogJy90cmFuc2FjdGlvbnMve3RyYW5zYWN0aW9uSWR9JyxcclxuICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICBsYW1iZGE6ICdsZWRnZXItZ2V0LXRyYW5zYWN0aW9uJyxcclxuICAgICAgICAgIGF1dGg6IHRydWUsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRCYWxhbmNlOiB7XHJcbiAgICAgICAgICBwYXRoOiAnL2JhbGFuY2Uve3dvcmtlcklkfScsXHJcbiAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgbGFtYmRhOiAnbGVkZ2VyLWdldC1iYWxhbmNlJyxcclxuICAgICAgICAgIGF1dGg6IHRydWUsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBjaGVja0NvbXBsaWFuY2U6IHtcclxuICAgICAgICAgIHBhdGg6ICcvY29tcGxpYW5jZS1jaGVjaycsXHJcbiAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgbGFtYmRhOiAnbGVkZ2VyLWNoZWNrLWNvbXBsaWFuY2UnLFxyXG4gICAgICAgICAgYXV0aDogdHJ1ZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVwbG9hZFBheXNsaXA6IHtcclxuICAgICAgICAgIHBhdGg6ICcvcGF5c2xpcC91cGxvYWQnLFxyXG4gICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICBsYW1iZGE6ICdsZWRnZXItdXBsb2FkLXBheXNsaXAnLFxyXG4gICAgICAgICAgYXV0aDogdHJ1ZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFBheXNsaXA6IHtcclxuICAgICAgICAgIHBhdGg6ICcvcGF5c2xpcC97cGF5c2xpcElkfScsXHJcbiAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgbGFtYmRhOiAnbGVkZ2VyLWdldC1wYXlzbGlwJyxcclxuICAgICAgICAgIGF1dGg6IHRydWUsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcblxyXG4gICAgLy8gQXR0ZW5kYW5jZVxyXG4gICAgYXR0ZW5kYW5jZToge1xyXG4gICAgICBiYXNlUGF0aDogJy9hcGkvdjEvYXR0ZW5kYW5jZScsXHJcbiAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICBjcmVhdGVTZXNzaW9uOiB7XHJcbiAgICAgICAgICBwYXRoOiAnL3Nlc3Npb25zJyxcclxuICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgbGFtYmRhOiAnYXR0ZW5kYW5jZS1jcmVhdGUtc2Vzc2lvbicsXHJcbiAgICAgICAgICBhdXRoOiB0cnVlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0U2Vzc2lvbjoge1xyXG4gICAgICAgICAgcGF0aDogJy9zZXNzaW9ucy97c2Vzc2lvbklkfScsXHJcbiAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgbGFtYmRhOiAnYXR0ZW5kYW5jZS1nZXQtc2Vzc2lvbicsXHJcbiAgICAgICAgICBhdXRoOiB0cnVlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVUb3RwOiB7XHJcbiAgICAgICAgICBwYXRoOiAnL3Nlc3Npb25zL3tzZXNzaW9uSWR9L2dlbmVyYXRlLXRvdHAnLFxyXG4gICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICBsYW1iZGE6ICdhdHRlbmRhbmNlLWdlbmVyYXRlLXRvdHAnLFxyXG4gICAgICAgICAgYXV0aDogdHJ1ZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1hcmtBdHRlbmRhbmNlOiB7XHJcbiAgICAgICAgICBwYXRoOiAnL3Nlc3Npb25zL3tzZXNzaW9uSWR9L21hcmsnLFxyXG4gICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICBsYW1iZGE6ICdhdHRlbmRhbmNlLW1hcmsnLFxyXG4gICAgICAgICAgYXV0aDogdHJ1ZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFJlY29yZHM6IHtcclxuICAgICAgICAgIHBhdGg6ICcvcmVjb3JkcycsXHJcbiAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgbGFtYmRhOiAnYXR0ZW5kYW5jZS1nZXQtcmVjb3JkcycsXHJcbiAgICAgICAgICBhdXRoOiB0cnVlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIEdyaWV2YW5jZXNcclxuICAgIGdyaWV2YW5jZXM6IHtcclxuICAgICAgYmFzZVBhdGg6ICcvYXBpL3YxL2dyaWV2YW5jZXMnLFxyXG4gICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgY3JlYXRlOiB7XHJcbiAgICAgICAgICBwYXRoOiAnJyxcclxuICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgbGFtYmRhOiAnZ3JpZXZhbmNlcy1jcmVhdGUnLFxyXG4gICAgICAgICAgYXV0aDogdHJ1ZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGxpc3Q6IHtcclxuICAgICAgICAgIHBhdGg6ICcnLFxyXG4gICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICAgIGxhbWJkYTogJ2dyaWV2YW5jZXMtbGlzdCcsXHJcbiAgICAgICAgICBhdXRoOiB0cnVlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0OiB7XHJcbiAgICAgICAgICBwYXRoOiAnL3tncmlldmFuY2VJZH0nLFxyXG4gICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICAgIGxhbWJkYTogJ2dyaWV2YW5jZXMtZ2V0JyxcclxuICAgICAgICAgIGF1dGg6IHRydWUsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB1cGRhdGU6IHtcclxuICAgICAgICAgIHBhdGg6ICcve2dyaWV2YW5jZUlkfScsXHJcbiAgICAgICAgICBtZXRob2Q6ICdQVVQnLFxyXG4gICAgICAgICAgbGFtYmRhOiAnZ3JpZXZhbmNlcy11cGRhdGUnLFxyXG4gICAgICAgICAgYXV0aDogdHJ1ZSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuXHJcbiAgICAvLyBSYXRpbmdzICYgVHJ1c3RcclxuICAgIHJhdGluZ3M6IHtcclxuICAgICAgYmFzZVBhdGg6ICcvYXBpL3YxL3JhdGluZ3MnLFxyXG4gICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgc3VibWl0OiB7XHJcbiAgICAgICAgICBwYXRoOiAnJyxcclxuICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgbGFtYmRhOiAncmF0aW5ncy1zdWJtaXQnLFxyXG4gICAgICAgICAgYXV0aDogdHJ1ZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldDoge1xyXG4gICAgICAgICAgcGF0aDogJy97dXNlcklkfScsXHJcbiAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgbGFtYmRhOiAncmF0aW5ncy1nZXQnLFxyXG4gICAgICAgICAgYXV0aDogdHJ1ZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFRydXN0UHJvZmlsZToge1xyXG4gICAgICAgICAgcGF0aDogJy90cnVzdC1wcm9maWxlL3t1c2VySWR9JyxcclxuICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICBsYW1iZGE6ICdyYXRpbmdzLWdldC10cnVzdC1wcm9maWxlJyxcclxuICAgICAgICAgIGF1dGg6IHRydWUsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcblxyXG4gICAgLy8gU3luY1xyXG4gICAgc3luYzoge1xyXG4gICAgICBiYXNlUGF0aDogJy9hcGkvdjEvc3luYycsXHJcbiAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICBwcm9jZXNzT3BlcmF0aW9uczoge1xyXG4gICAgICAgICAgcGF0aDogJy9vcGVyYXRpb25zJyxcclxuICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgbGFtYmRhOiAnc3luYy1wcm9jZXNzLW9wZXJhdGlvbnMnLFxyXG4gICAgICAgICAgYXV0aDogdHJ1ZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFN0YXR1czoge1xyXG4gICAgICAgICAgcGF0aDogJy9zdGF0dXMnLFxyXG4gICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICAgIGxhbWJkYTogJ3N5bmMtZ2V0LXN0YXR1cycsXHJcbiAgICAgICAgICBhdXRoOiB0cnVlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVzb2x2ZUNvbmZsaWN0OiB7XHJcbiAgICAgICAgICBwYXRoOiAnL3Jlc29sdmUtY29uZmxpY3QnLFxyXG4gICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICBsYW1iZGE6ICdzeW5jLXJlc29sdmUtY29uZmxpY3QnLFxyXG4gICAgICAgICAgYXV0aDogdHJ1ZSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG5cclxuICAvLyBXZWJTb2NrZXQgQVBJIENvbmZpZ3VyYXRpb25cclxuICB3ZWJzb2NrZXRBcGk6IHtcclxuICAgIG5hbWU6ICdTaHJhbS1TZXR1IFdlYlNvY2tldCBBUEknLFxyXG4gICAgZGVzY3JpcHRpb246ICdXZWJTb2NrZXQgQVBJIGZvciByZWFsLXRpbWUgZmVhdHVyZXMnLFxyXG4gICAgcm91dGVTZWxlY3Rpb25FeHByZXNzaW9uOiAnJHJlcXVlc3QuYm9keS5hY3Rpb24nLFxyXG4gICAgXHJcbiAgICByb3V0ZXM6IHtcclxuICAgICAgY29ubmVjdDoge1xyXG4gICAgICAgIHJvdXRlS2V5OiAnJGNvbm5lY3QnLFxyXG4gICAgICAgIGxhbWJkYTogJ3dlYnNvY2tldC1jb25uZWN0JyxcclxuICAgICAgICBhdXRoOiB0cnVlLFxyXG4gICAgICB9LFxyXG4gICAgICBkaXNjb25uZWN0OiB7XHJcbiAgICAgICAgcm91dGVLZXk6ICckZGlzY29ubmVjdCcsXHJcbiAgICAgICAgbGFtYmRhOiAnd2Vic29ja2V0LWRpc2Nvbm5lY3QnLFxyXG4gICAgICB9LFxyXG4gICAgICBkZWZhdWx0OiB7XHJcbiAgICAgICAgcm91dGVLZXk6ICckZGVmYXVsdCcsXHJcbiAgICAgICAgbGFtYmRhOiAnd2Vic29ja2V0LWRlZmF1bHQnLFxyXG4gICAgICB9LFxyXG4gICAgICBzdWJzY3JpYmU6IHtcclxuICAgICAgICByb3V0ZUtleTogJ3N1YnNjcmliZScsXHJcbiAgICAgICAgbGFtYmRhOiAnd2Vic29ja2V0LXN1YnNjcmliZScsXHJcbiAgICAgIH0sXHJcbiAgICAgIHVuc3Vic2NyaWJlOiB7XHJcbiAgICAgICAgcm91dGVLZXk6ICd1bnN1YnNjcmliZScsXHJcbiAgICAgICAgbGFtYmRhOiAnd2Vic29ja2V0LXVuc3Vic2NyaWJlJyxcclxuICAgICAgfSxcclxuICAgIH0sXHJcblxyXG4gICAgLy8gV2ViU29ja2V0IGV2ZW50IHR5cGVzXHJcbiAgICBldmVudHM6IHtcclxuICAgICAgam9iUG9zdGVkOiAnam9iX3Bvc3RlZCcsXHJcbiAgICAgIGFwcGxpY2F0aW9uU3RhdHVzOiAnYXBwbGljYXRpb25fc3RhdHVzJyxcclxuICAgICAgdG90cEdlbmVyYXRlZDogJ3RvdHBfZ2VuZXJhdGVkJyxcclxuICAgICAgcGF5bWVudFJlY2VpdmVkOiAncGF5bWVudF9yZWNlaXZlZCcsXHJcbiAgICAgIGdyaWV2YW5jZVVwZGF0ZTogJ2dyaWV2YW5jZV91cGRhdGUnLFxyXG4gICAgICBhdHRlbmRhbmNlTWFya2VkOiAnYXR0ZW5kYW5jZV9tYXJrZWQnLFxyXG4gICAgfSxcclxuICB9LFxyXG5cclxuICAvLyBMYW1iZGEgQXV0aG9yaXplciBDb25maWd1cmF0aW9uXHJcbiAgYXV0aG9yaXplcjoge1xyXG4gICAgbmFtZTogJ0pXVEF1dGhvcml6ZXInLFxyXG4gICAgdHlwZTogJ1RPS0VOJyxcclxuICAgIGlkZW50aXR5U291cmNlOiAnbWV0aG9kLnJlcXVlc3QuaGVhZGVyLkF1dGhvcml6YXRpb24nLFxyXG4gICAgYXV0aG9yaXplclJlc3VsdFR0bDogMzAwLCAvLyA1IG1pbnV0ZXNcclxuICAgIGxhbWJkYTogJ2F1dGgtYXV0aG9yaXplcicsXHJcbiAgfSxcclxuXHJcbiAgLy8gUmVxdWVzdC9SZXNwb25zZSBNb2RlbHNcclxuICBtb2RlbHM6IHtcclxuICAgIGVycm9yUmVzcG9uc2U6IHtcclxuICAgICAgc2NoZW1hOiB7XHJcbiAgICAgICAgdHlwZTogJ29iamVjdCcsXHJcbiAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgZXJyb3I6IHtcclxuICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXHJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICBjb2RlOiB7IHR5cGU6ICdzdHJpbmcnIH0sXHJcbiAgICAgICAgICAgICAgbWVzc2FnZTogeyB0eXBlOiAnc3RyaW5nJyB9LFxyXG4gICAgICAgICAgICAgIGRldGFpbHM6IHsgdHlwZTogJ29iamVjdCcgfSxcclxuICAgICAgICAgICAgICB0aW1lc3RhbXA6IHsgdHlwZTogJ251bWJlcicgfSxcclxuICAgICAgICAgICAgICByZXF1ZXN0SWQ6IHsgdHlwZTogJ3N0cmluZycgfSxcclxuICAgICAgICAgICAgICByZXRyeWFibGU6IHsgdHlwZTogJ2Jvb2xlYW4nIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH0sXHJcblxyXG4gIC8vIE1vbml0b3JpbmcgYW5kIExvZ2dpbmdcclxuICBtb25pdG9yaW5nOiB7XHJcbiAgICBhY2Nlc3NMb2dnaW5nOiB0cnVlLFxyXG4gICAgZXhlY3V0aW9uTG9nZ2luZzogdHJ1ZSxcclxuICAgIGRhdGFUcmFjZUVuYWJsZWQ6IGZhbHNlLCAvLyBEaXNhYmxlIGluIHByb2R1Y3Rpb24gZm9yIHNlY3VyaXR5XHJcbiAgICBtZXRyaWNzRW5hYmxlZDogdHJ1ZSxcclxuICAgIFxyXG4gICAgY2xvdWRXYXRjaE1ldHJpY3M6IFtcclxuICAgICAgJ0NvdW50JyxcclxuICAgICAgJzRYWEVycm9yJyxcclxuICAgICAgJzVYWEVycm9yJyxcclxuICAgICAgJ0xhdGVuY3knLFxyXG4gICAgICAnSW50ZWdyYXRpb25MYXRlbmN5JyxcclxuICAgICAgJ0NhY2hlSGl0Q291bnQnLFxyXG4gICAgICAnQ2FjaGVNaXNzQ291bnQnLFxyXG4gICAgXSxcclxuICB9LFxyXG59O1xyXG5cclxuXHJcbiJdfQ==