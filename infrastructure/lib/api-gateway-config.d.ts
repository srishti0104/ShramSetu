/**
 * API Gateway Configuration for Shram-Setu
 */
export declare const APIGatewayConfig: {
    restApi: {
        name: string;
        description: string;
        deploymentStage: string;
        throttling: {
            rateLimit: number;
            burstLimit: number;
        };
        cors: {
            allowOrigins: string[];
            allowMethods: string[];
            allowHeaders: string[];
            maxAge: number;
        };
        usagePlans: {
            free: {
                name: string;
                throttle: {
                    rateLimit: number;
                    burstLimit: number;
                };
                quota: {
                    limit: number;
                    period: string;
                };
            };
            premium: {
                name: string;
                throttle: {
                    rateLimit: number;
                    burstLimit: number;
                };
                quota: {
                    limit: number;
                    period: string;
                };
            };
        };
    };
    endpoints: {
        auth: {
            basePath: string;
            methods: {
                sendOtp: {
                    path: string;
                    method: string;
                    lambda: string;
                    rateLimit: number;
                    auth: boolean;
                };
                verifyOtp: {
                    path: string;
                    method: string;
                    lambda: string;
                    rateLimit: number;
                    auth: boolean;
                };
                register: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
                login: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
                refreshToken: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
                logout: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
            };
        };
        onboarding: {
            basePath: string;
            methods: {
                validateEshram: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
                completeProfile: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
            };
        };
        voice: {
            basePath: string;
            methods: {
                processCommand: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                    rateLimit: number;
                };
                synthesizeSpeech: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
                getSession: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
                deleteSession: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
            };
        };
        jobs: {
            basePath: string;
            methods: {
                search: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
                create: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
                get: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
                update: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
                delete: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
                apply: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
                getApplications: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
                updateApplication: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
            };
        };
        ledger: {
            basePath: string;
            methods: {
                createTransaction: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
                getTransactions: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
                getTransaction: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
                getBalance: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
                checkCompliance: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
                uploadPayslip: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
                getPayslip: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
            };
        };
        attendance: {
            basePath: string;
            methods: {
                createSession: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
                getSession: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
                generateTotp: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
                markAttendance: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
                getRecords: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
            };
        };
        grievances: {
            basePath: string;
            methods: {
                create: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
                list: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
                get: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
                update: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
            };
        };
        ratings: {
            basePath: string;
            methods: {
                submit: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
                get: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
                getTrustProfile: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
            };
        };
        sync: {
            basePath: string;
            methods: {
                processOperations: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
                getStatus: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
                resolveConflict: {
                    path: string;
                    method: string;
                    lambda: string;
                    auth: boolean;
                };
            };
        };
    };
    websocketApi: {
        name: string;
        description: string;
        routeSelectionExpression: string;
        routes: {
            connect: {
                routeKey: string;
                lambda: string;
                auth: boolean;
            };
            disconnect: {
                routeKey: string;
                lambda: string;
            };
            default: {
                routeKey: string;
                lambda: string;
            };
            subscribe: {
                routeKey: string;
                lambda: string;
            };
            unsubscribe: {
                routeKey: string;
                lambda: string;
            };
        };
        events: {
            jobPosted: string;
            applicationStatus: string;
            totpGenerated: string;
            paymentReceived: string;
            grievanceUpdate: string;
            attendanceMarked: string;
        };
    };
    authorizer: {
        name: string;
        type: string;
        identitySource: string;
        authorizerResultTtl: number;
        lambda: string;
    };
    models: {
        errorResponse: {
            schema: {
                type: string;
                properties: {
                    error: {
                        type: string;
                        properties: {
                            code: {
                                type: string;
                            };
                            message: {
                                type: string;
                            };
                            details: {
                                type: string;
                            };
                            timestamp: {
                                type: string;
                            };
                            requestId: {
                                type: string;
                            };
                            retryable: {
                                type: string;
                            };
                        };
                    };
                };
            };
        };
    };
    monitoring: {
        accessLogging: boolean;
        executionLogging: boolean;
        dataTraceEnabled: boolean;
        metricsEnabled: boolean;
        cloudWatchMetrics: string[];
    };
};
