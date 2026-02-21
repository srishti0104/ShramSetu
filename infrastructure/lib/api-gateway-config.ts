/**
 * API Gateway Configuration for Shramik-Setu
 */

export const APIGatewayConfig = {
  restApi: {
    name: 'Shramik-Setu API',
    description: 'REST API for Shramik-Setu platform',
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
    name: 'Shramik-Setu WebSocket API',
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
