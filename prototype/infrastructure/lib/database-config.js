"use strict";
/**
 * DynamoDB Table Configurations for Shram-Setu
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgreSQLConfig = exports.DynamoDBTables = void 0;
exports.DynamoDBTables = {
    users: {
        tableName: 'Shram-setu-users',
        partitionKey: 'userId',
        globalSecondaryIndexes: [
            {
                indexName: 'mobileNumber-index',
                partitionKey: 'mobileNumber',
            },
            {
                indexName: 'eShramCardNumber-index',
                partitionKey: 'eShramCardNumber',
            },
        ],
        attributes: {
            userId: 'string',
            mobileNumber: 'string',
            eShramCardNumber: 'string',
            role: 'string', // 'worker' | 'contractor'
            preferredLanguage: 'string',
            createdAt: 'number',
            lastLoginAt: 'number',
            isVerified: 'boolean',
        },
    },
    jobs: {
        tableName: 'Shram-setu-jobs',
        partitionKey: 'jobId',
        globalSecondaryIndexes: [
            {
                indexName: 'city-status-index',
                partitionKey: 'city',
                sortKey: 'status',
            },
            {
                indexName: 'contractorId-index',
                partitionKey: 'contractorId',
                sortKey: 'postedAt',
            },
        ],
        attributes: {
            jobId: 'string',
            contractorId: 'string',
            title: 'string',
            description: 'string',
            city: 'string',
            state: 'string',
            wageRate: 'number',
            status: 'string', // 'open' | 'filled' | 'cancelled'
            postedAt: 'number',
            skillsRequired: 'array',
        },
    },
    ratings: {
        tableName: 'Shram-setu-ratings',
        partitionKey: 'ratingId',
        globalSecondaryIndexes: [
            {
                indexName: 'toUserId-index',
                partitionKey: 'toUserId',
                sortKey: 'createdAt',
            },
            {
                indexName: 'fromUserId-index',
                partitionKey: 'fromUserId',
                sortKey: 'createdAt',
            },
        ],
        attributes: {
            ratingId: 'string',
            fromUserId: 'string',
            toUserId: 'string',
            jobId: 'string',
            score: 'number', // 1-5
            category: 'string', // 'worker_rating' | 'contractor_rating'
            createdAt: 'number',
        },
    },
    syncOperations: {
        tableName: 'Shram-setu-sync-operations',
        partitionKey: 'userId',
        sortKey: 'timestamp',
        timeToLiveAttribute: 'ttl',
        attributes: {
            userId: 'string',
            operationId: 'string',
            timestamp: 'number',
            type: 'string', // 'create' | 'update' | 'delete'
            entity: 'string',
            status: 'string', // 'queued' | 'syncing' | 'completed' | 'failed'
            ttl: 'number', // Auto-delete after 7 days
        },
    },
    attendance: {
        tableName: 'Shram-setu-attendance',
        partitionKey: 'sessionId',
        sortKey: 'recordId',
        globalSecondaryIndexes: [
            {
                indexName: 'workerId-index',
                partitionKey: 'workerId',
                sortKey: 'markedAt',
            },
        ],
        attributes: {
            sessionId: 'string',
            recordId: 'string',
            workerId: 'string',
            markedAt: 'number',
            status: 'string', // 'present' | 'absent' | 'late'
            signature: 'string', // Cryptographic signature
        },
    },
    grievances: {
        tableName: 'Shram-setu-grievances',
        partitionKey: 'grievanceId',
        globalSecondaryIndexes: [
            {
                indexName: 'reportedBy-index',
                partitionKey: 'reportedBy',
                sortKey: 'createdAt',
            },
            {
                indexName: 'status-severity-index',
                partitionKey: 'status',
                sortKey: 'severity',
            },
        ],
        attributes: {
            grievanceId: 'string',
            reportedBy: 'string',
            audioUrl: 'string',
            transcript: 'string',
            category: 'string',
            severity: 'string', // 'low' | 'medium' | 'high' | 'critical'
            status: 'string', // 'submitted' | 'under_review' | 'resolved' | 'escalated'
            isAnonymous: 'boolean',
            createdAt: 'number',
        },
    },
};
/**
 * PostgreSQL RDS Configuration
 */
exports.PostgreSQLConfig = {
    databaseName: 'Shram_setu_ledger',
    engine: 'postgres',
    version: '15',
    instanceClass: 't3.small',
    allocatedStorage: 20, // GB
    maxAllocatedStorage: 100, // GB (auto-scaling)
    multiAz: true,
    backupRetentionDays: 7,
    deletionProtection: true,
    // Tables to be created
    tables: {
        transactions: {
            columns: {
                transaction_id: 'UUID PRIMARY KEY',
                worker_id: 'VARCHAR(255) NOT NULL',
                contractor_id: 'VARCHAR(255) NOT NULL',
                job_id: 'VARCHAR(255)',
                type: 'VARCHAR(50) NOT NULL', // 'wage' | 'advance' | 'deduction' | 'bonus'
                amount: 'DECIMAL(10, 2) NOT NULL',
                currency: 'VARCHAR(3) DEFAULT \'INR\'',
                date: 'DATE NOT NULL',
                work_description: 'TEXT',
                payment_method: 'VARCHAR(50)', // 'cash' | 'upi' | 'bank_transfer' | 'cheque'
                receipt_url: 'TEXT',
                status: 'VARCHAR(50) DEFAULT \'pending\'', // 'pending' | 'completed' | 'disputed'
                hours_worked: 'DECIMAL(5, 2)',
                overtime_hours: 'DECIMAL(5, 2)',
                compliance_checked: 'BOOLEAN DEFAULT FALSE',
                created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
                updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
            },
            indexes: [
                'CREATE INDEX idx_worker_id ON transactions(worker_id)',
                'CREATE INDEX idx_contractor_id ON transactions(contractor_id)',
                'CREATE INDEX idx_date ON transactions(date)',
                'CREATE INDEX idx_status ON transactions(status)',
            ],
        },
        wage_calculations: {
            columns: {
                calculation_id: 'UUID PRIMARY KEY',
                worker_id: 'VARCHAR(255) NOT NULL',
                period_start: 'DATE NOT NULL',
                period_end: 'DATE NOT NULL',
                gross_wage: 'DECIMAL(10, 2) NOT NULL',
                advances: 'DECIMAL(10, 2) DEFAULT 0',
                deductions: 'DECIMAL(10, 2) DEFAULT 0',
                net_wage: 'DECIMAL(10, 2) NOT NULL',
                hours_worked: 'DECIMAL(6, 2)',
                overtime_hours: 'DECIMAL(6, 2)',
                overtime_pay: 'DECIMAL(10, 2) DEFAULT 0',
                created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
            },
            indexes: [
                'CREATE INDEX idx_worker_period ON wage_calculations(worker_id, period_start, period_end)',
            ],
        },
        compliance_checks: {
            columns: {
                check_id: 'UUID PRIMARY KEY',
                transaction_id: 'UUID REFERENCES transactions(transaction_id)',
                is_compliant: 'BOOLEAN NOT NULL',
                minimum_wage: 'DECIMAL(10, 2)',
                actual_wage: 'DECIMAL(10, 2)',
                state: 'VARCHAR(100)',
                industry: 'VARCHAR(100)',
                violations: 'JSONB', // Array of violation objects
                checked_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
            },
            indexes: [
                'CREATE INDEX idx_transaction_id ON compliance_checks(transaction_id)',
                'CREATE INDEX idx_is_compliant ON compliance_checks(is_compliant)',
            ],
        },
        minimum_wage_rates: {
            columns: {
                rate_id: 'UUID PRIMARY KEY',
                state: 'VARCHAR(100) NOT NULL',
                industry: 'VARCHAR(100) NOT NULL',
                skill_level: 'VARCHAR(50)', // 'unskilled' | 'semi_skilled' | 'skilled'
                daily_rate: 'DECIMAL(10, 2) NOT NULL',
                hourly_rate: 'DECIMAL(10, 2) NOT NULL',
                effective_from: 'DATE NOT NULL',
                effective_to: 'DATE',
                created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
            },
            indexes: [
                'CREATE INDEX idx_state_industry ON minimum_wage_rates(state, industry)',
                'CREATE INDEX idx_effective_dates ON minimum_wage_rates(effective_from, effective_to)',
            ],
        },
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YWJhc2UtY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGF0YWJhc2UtY29uZmlnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7O0FBRVUsUUFBQSxjQUFjLEdBQUc7SUFDNUIsS0FBSyxFQUFFO1FBQ0wsU0FBUyxFQUFFLGtCQUFrQjtRQUM3QixZQUFZLEVBQUUsUUFBUTtRQUN0QixzQkFBc0IsRUFBRTtZQUN0QjtnQkFDRSxTQUFTLEVBQUUsb0JBQW9CO2dCQUMvQixZQUFZLEVBQUUsY0FBYzthQUM3QjtZQUNEO2dCQUNFLFNBQVMsRUFBRSx3QkFBd0I7Z0JBQ25DLFlBQVksRUFBRSxrQkFBa0I7YUFDakM7U0FDRjtRQUNELFVBQVUsRUFBRTtZQUNWLE1BQU0sRUFBRSxRQUFRO1lBQ2hCLFlBQVksRUFBRSxRQUFRO1lBQ3RCLGdCQUFnQixFQUFFLFFBQVE7WUFDMUIsSUFBSSxFQUFFLFFBQVEsRUFBRSwwQkFBMEI7WUFDMUMsaUJBQWlCLEVBQUUsUUFBUTtZQUMzQixTQUFTLEVBQUUsUUFBUTtZQUNuQixXQUFXLEVBQUUsUUFBUTtZQUNyQixVQUFVLEVBQUUsU0FBUztTQUN0QjtLQUNGO0lBRUQsSUFBSSxFQUFFO1FBQ0osU0FBUyxFQUFFLGlCQUFpQjtRQUM1QixZQUFZLEVBQUUsT0FBTztRQUNyQixzQkFBc0IsRUFBRTtZQUN0QjtnQkFDRSxTQUFTLEVBQUUsbUJBQW1CO2dCQUM5QixZQUFZLEVBQUUsTUFBTTtnQkFDcEIsT0FBTyxFQUFFLFFBQVE7YUFDbEI7WUFDRDtnQkFDRSxTQUFTLEVBQUUsb0JBQW9CO2dCQUMvQixZQUFZLEVBQUUsY0FBYztnQkFDNUIsT0FBTyxFQUFFLFVBQVU7YUFDcEI7U0FDRjtRQUNELFVBQVUsRUFBRTtZQUNWLEtBQUssRUFBRSxRQUFRO1lBQ2YsWUFBWSxFQUFFLFFBQVE7WUFDdEIsS0FBSyxFQUFFLFFBQVE7WUFDZixXQUFXLEVBQUUsUUFBUTtZQUNyQixJQUFJLEVB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YXRpb25zIGZvciBTaHJhbS1TZXR1XHJcbiAqL1xyXG5cclxuZXhwb3J0IGNvbnN0IER5bmFtb0RCVGFibGVzID0ge1xyXG4gIHVzZXJzOiB7XHJcbiAgICB0YWJsZU5hbWU6ICdTaHJhbS1zZXR1LXVzZXJzJyxcclxuICAgIHBhcnRpdGlvbktleTogJ3VzZXJJZCcsXHJcbiAgICBnbG9iYWxTZWNvbmRhcnlJbmRleGVzOiBbXHJcbiAgICAgIHtcclxuICAgICAgICBpbmRleE5hbWU6ICdtb2JpbGVOdW1iZXItaW5kZXgnLFxyXG4gICAgICAgIHBhcnRpdGlvbktleTogJ21vYmlsZU51bWJlcicsXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBpbmRleE5hbWU6ICdlU2hyYW1DYXJkTnVtYmVyLWluZGV4JyxcclxuICAgICAgICBwYXJ0aXRpb25LZXk6ICdlU2hyYW1DYXJkTnVtYmVyJyxcclxuICAgICAgfSxcclxuICAgIF0sXHJcbiAgICBhdHRyaWJ1dGVzOiB7XHJcbiAgICAgIHVzZXJJZDogJ3N0cmluZycsXHJcbiAgICAgIG1vYmlsZU51bWJlcjogJ3N0cmluZycsXHJcbiAgICAgIGVTaHJhbUNhcmROdW1iZXI6ICdzdHJpbmcnLFxyXG4gICAgICByb2xlOiAnc3RyaW5nJywgLy8gJ3dvcmtlcicgfCAnY29udHJhY3RvcidcclxuICAgICAgcHJlZmVycmVkTGFuZ3VhZ2U6ICdzdHJpbmcnLFxyXG4gICAgICBjcmVhdGVkQXQ6ICdudW1iZXInLFxyXG4gICAgICBsYXN0TG9naW5BdDogJ251bWJlcicsXHJcbiAgICAgIGlzVmVyaWZpZWQ6ICdib29sZWFuJyxcclxuICAgIH0sXHJcbiAgfSxcclxuXHJcbiAgam9iczoge1xyXG4gICAgdGFibGVOYW1lOiAnU2hyYW0tc2V0dS1qb2JzJyxcclxuICAgIHBhcnRpdGlvbktleTogJ2pvYklkJyxcclxuICAgIGdsb2JhbFNlY29uZGFyeUluZGV4ZXM6IFtcclxuICAgICAge1xyXG4gICAgICAgIGluZGV4TmFtZTogJ2NpdHktc3RhdHVzLWluZGV4JyxcclxuICAgICAgICBwYXJ0aXRpb25LZXk6ICdjaXR5JyxcclxuICAgICAgICBzb3J0S2V5OiAnc3RhdHVzJyxcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGluZGV4TmFtZTogJ2NvbnRyYWN0b3JJZC1pbmRleCcsXHJcbiAgICAgICAgcGFydGl0aW9uS2V5OiAnY29udHJhY3RvcklkJyxcclxuICAgICAgICBzb3J0S2V5OiAncG9zdGVkQXQnLFxyXG4gICAgICB9LFxyXG4gICAgXSxcclxuICAgIGF0dHJpYnV0ZXM6IHtcclxuICAgICAgam9iSWQ6ICdzdHJpbmcnLFxyXG4gICAgICBjb250cmFjdG9ySWQ6ICdzdHJpbmcnLFxyXG4gICAgICB0aXRsZTogJ3N0cmluZycsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiAnc3RyaW5nJyxcclxuICAgICAgY2l0eTogJ3N0cmluZycsXHJcbiAgICAgIHN0YXRlOiAnc3RyaW5nJyxcclxuICAgICAgd2FnZVJhdGU6ICdudW1iZXInLFxyXG4gICAgICBzdGF0dXM6ICdzdHJpbmcnLCAvLyAnb3BlbicgfCAnZmlsbGVkJyB8ICdjYW5jZWxsZWQnXHJcbiAgICAgIHBvc3RlZEF0OiAnbnVtYmVyJyxcclxuICAgICAgc2tpbGxzUmVxdWlyZWQ6ICdhcnJheScsXHJcbiAgICB9LFxyXG4gIH0sXHJcblxyXG4gIHJhdGluZ3M6IHtcclxuICAgIHRhYmxlTmFtZTogJ1NocmFtLXNldHUtcmF0aW5ncycsXHJcbiAgICBwYXJ0aXRpb25LZXk6ICdyYXRpbmdJZCcsXHJcbiAgICBnbG9iYWxTZWNvbmRhcnlJbmRleGVzOiBbXHJcbiAgICAgIHtcclxuICAgICAgICBpbmRleE5hbWU6ICd0b1VzZXJJZC1pbmRleCcsXHJcbiAgICAgICAgcGFydGl0aW9uS2V5OiAndG9Vc2VySWQnLFxyXG4gICAgICAgIHNvcnRLZXk6ICdjcmVhdGVkQXQnLFxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgaW5kZXhOYW1lOiAnZnJvbVVzZXJJZC1pbmRleCcsXHJcbiAgICAgICAgcGFydGl0aW9uS2V5OiAnZnJvbVVzZXJJZCcsXHJcbiAgICAgICAgc29ydEtleTogJ2NyZWF0ZWRBdCcsXHJcbiAgICAgIH0sXHJcbiAgICBdLFxyXG4gICAgYXR0cmlidXRlczoge1xyXG4gICAgICByYXRpbmdJZDogJ3N0cmluZycsXHJcbiAgICAgIGZyb21Vc2VySWQ6ICdzdHJpbmcnLFxyXG4gICAgICB0b1VzZXJJZDogJ3N0cmluZycsXHJcbiAgICAgIGpvYklkOiAnc3RyaW5nJyxcclxuICAgICAgc2NvcmU6ICdudW1iZXInLCAvLyAxLTVcclxuICAgICAgY2F0ZWdvcnk6ICdzdHJpbmcnLCAvLyAnd29ya2VyX3JhdGluZycgfCAnY29udHJhY3Rvcl9yYXRpbmcnXHJcbiAgICAgIGNyZWF0ZWRBdDogJ251bWJlcicsXHJcbiAgICB9LFxyXG4gIH0sXHJcblxyXG4gIHN5bmNPcGVyYXRpb25zOiB7XHJcbiAgICB0YWJsZU5hbWU6ICdTaHJhbS1zZXR1LXN5bmMtb3BlcmF0aW9ucycsXHJcbiAgICBwYXJ0aXRpb25LZXk6ICd1c2VySWQnLFxyXG4gICAgc29ydEtleTogJ3RpbWVzdGFtcCcsXHJcbiAgICB0aW1lVG9MaXZlQXR0cmlidXRlOiAndHRsJyxcclxuICAgIGF0dHJpYnV0ZXM6IHtcclxuICAgICAgdXNlcklkOiAnc3RyaW5nJyxcclxuICAgICAgb3BlcmF0aW9uSWQ6ICdzdHJpbmcnLFxyXG4gICAgICB0aW1lc3RhbXA6ICdudW1iZXInLFxyXG4gICAgICB0eXBlOiAnc3RyaW5nJywgLy8gJ2NyZWF0ZScgfCAndXBkYXRlJyB8ICdkZWxldGUnXHJcbiAgICAgIGVudGl0eTogJ3N0cmluZycsXHJcbiAgICAgIHN0YXR1czogJ3N0cmluZycsIC8vICdxdWV1ZWQnIHwgJ3N5bmNpbmcnIHwgJ2NvbXBsZXRlZCcgfCAnZmFpbGVkJ1xyXG4gICAgICB0dGw6ICdudW1iZXInLCAvLyBBdXRvLWRlbGV0ZSBhZnRlciA3IGRheXNcclxuICAgIH0sXHJcbiAgfSxcclxuXHJcbiAgYXR0ZW5kYW5jZToge1xyXG4gICAgdGFibGVOYW1lOiAnU2hyYW0tc2V0dS1hdHRlbmRhbmNlJyxcclxuICAgIHBhcnRpdGlvbktleTogJ3Nlc3Npb25JZCcsXHJcbiAgICBzb3J0S2V5OiAncmVjb3JkSWQnLFxyXG4gICAgZ2xvYmFsU2Vjb25kYXJ5SW5kZXhlczogW1xyXG4gICAgICB7XHJcbiAgICAgICAgaW5kZXhOYW1lOiAnd29ya2VySWQtaW5kZXgnLFxyXG4gICAgICAgIHBhcnRpdGlvbktleTogJ3dvcmtlcklkJyxcclxuICAgICAgICBzb3J0S2V5OiAnbWFya2VkQXQnLFxyXG4gICAgICB9LFxyXG4gICAgXSxcclxuICAgIGF0dHJpYnV0ZXM6IHtcclxuICAgICAgc2Vzc2lvbklkOiAnc3RyaW5nJyxcclxuICAgICAgcmVjb3JkSWQ6ICdzdHJpbmcnLFxyXG4gICAgICB3b3JrZXJJZDogJ3N0cmluZycsXHJcbiAgICAgIG1hcmtlZEF0OiAnbnVtYmVyJyxcclxuICAgICAgc3RhdHVzOiAnc3RyaW5nJywgLy8gJ3ByZXNlbnQnIHwgJ2Fic2VudCcgfCAnbGF0ZSdcclxuICAgICAgc2lnbmF0dXJlOiAnc3RyaW5nJywgLy8gQ3J5cHRvZ3JhcGhpYyBzaWduYXR1cmVcclxuICAgIH0sXHJcbiAgfSxcclxuXHJcbiAgZ3JpZXZhbmNlczoge1xyXG4gICAgdGFibGVOYW1lOiAnU2hyYW0tc2V0dS1ncmlldmFuY2VzJyxcclxuICAgIHBhcnRpdGlvbktleTogJ2dyaWV2YW5jZUlkJyxcclxuICAgIGdsb2JhbFNlY29uZGFyeUluZGV4ZXM6IFtcclxuICAgICAge1xyXG4gICAgICAgIGluZGV4TmFtZTogJ3JlcG9ydGVkQnktaW5kZXgnLFxyXG4gICAgICAgIHBhcnRpdGlvbktleTogJ3JlcG9ydGVkQnknLFxyXG4gICAgICAgIHNvcnRLZXk6ICdjcmVhdGVkQXQnLFxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgaW5kZXhOYW1lOiAnc3RhdHVzLXNldmVyaXR5LWluZGV4JyxcclxuICAgICAgICBwYXJ0aXRpb25LZXk6ICdzdGF0dXMnLFxyXG4gICAgICAgIHNvcnRLZXk6ICdzZXZlcml0eScsXHJcbiAgICAgIH0sXHJcbiAgICBdLFxyXG4gICAgYXR0cmlidXRlczoge1xyXG4gICAgICBncmlldmFuY2VJZDogJ3N0cmluZycsXHJcbiAgICAgIHJlcG9ydGVkQnk6ICdzdHJpbmcnLFxyXG4gICAgICBhdWRpb1VybDogJ3N0cmluZycsXHJcbiAgICAgIHRyYW5zY3JpcHQ6ICdzdHJpbmcnLFxyXG4gICAgICBjYXRlZ29yeTogJ3N0cmluZycsXHJcbiAgICAgIHNldmVyaXR5OiAnc3RyaW5nJywgLy8gJ2xvdycgfCAnbWVkaXVtJyB8ICdoaWdoJyB8ICdjcml0aWNhbCdcclxuICAgICAgc3RhdHVzOiAnc3RyaW5nJywgLy8gJ3N1Ym1pdHRlZCcgfCAndW5kZXJfcmV2aWV3JyB8ICdyZXNvbHZlZCcgfCAnZXNjYWxhdGVkJ1xyXG4gICAgICBpc0Fub255bW91czogJ2Jvb2xlYW4nLFxyXG4gICAgICBjcmVhdGVkQXQ6ICdudW1iZXInLFxyXG4gICAgfSxcclxuICB9LFxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFBvc3RncmVTUUwgUkRTIENvbmZpZ3VyYXRpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBQb3N0Z3JlU1FMQ29uZmlnID0ge1xyXG4gIGRhdGFiYXNlTmFtZTogJ1NocmFtX3NldHVfbGVkZ2VyJyxcclxuICBlbmdpbmU6ICdwb3N0Z3JlcycsXHJcbiAgdmVyc2lvbjogJzE1JyxcclxuICBpbnN0YW5jZUNsYXNzOiAndDMuc21hbGwnLFxyXG4gIGFsbG9jYXRlZFN0b3JhZ2U6IDIwLCAvLyBHQlxyXG4gIG1heEFsbG9jYXRlZFN0b3JhZ2U6IDEwMCwgLy8gR0IgKGF1dG8tc2NhbGluZylcclxuICBtdWx0aUF6OiB0cnVlLFxyXG4gIGJhY2t1cFJldGVudGlvbkRheXM6IDcsXHJcbiAgZGVsZXRpb25Qcm90ZWN0aW9uOiB0cnVlLFxyXG4gIFxyXG4gIC8vIFRhYmxlcyB0byBiZSBjcmVhdGVkXHJcbiAgdGFibGVzOiB7XHJcbiAgICB0cmFuc2FjdGlvbnM6IHtcclxuICAgICAgY29sdW1uczoge1xyXG4gICAgICAgIHRyYW5zYWN0aW9uX2lkOiAnVVVJRCBQUklNQVJZIEtFWScsXHJcbiAgICAgICAgd29ya2VyX2lkOiAnVkFSQ0hBUigyNTUpIE5PVCBOVUxMJyxcclxuICAgICAgICBjb250cmFjdG9yX2lkOiAnVkFSQ0hBUigyNTUpIE5PVCBOVUxMJyxcclxuICAgICAgICBqb2JfaWQ6ICdWQVJDSEFSKDI1NSknLFxyXG4gICAgICAgIHR5cGU6ICdWQVJDSEFSKDUwKSBOT1QgTlVMTCcsIC8vICd3YWdlJyB8ICdhZHZhbmNlJyB8ICdkZWR1Y3Rpb24nIHwgJ2JvbnVzJ1xyXG4gICAgICAgIGFtb3VudDogJ0RFQ0lNQUwoMTAsIDIpIE5PVCBOVUxMJyxcclxuICAgICAgICBjdXJyZW5jeTogJ1ZBUkNIQVIoMykgREVGQVVMVCBcXCdJTlJcXCcnLFxyXG4gICAgICAgIGRhdGU6ICdEQVRFIE5PVCBOVUxMJyxcclxuICAgICAgICB3b3JrX2Rlc2NyaXB0aW9uOiAnVEVYVCcsXHJcbiAgICAgICAgcGF5bWVudF9tZXRob2Q6ICdWQVJDSEFSKDUwKScsIC8vICdjYXNoJyB8ICd1cGknIHwgJ2JhbmtfdHJhbnNmZXInIHwgJ2NoZXF1ZSdcclxuICAgICAgICByZWNlaXB0X3VybDogJ1RFWFQnLFxyXG4gICAgICAgIHN0YXR1czogJ1ZBUkNIQVIoNTApIERFRkFVTFQgXFwncGVuZGluZ1xcJycsIC8vICdwZW5kaW5nJyB8ICdjb21wbGV0ZWQnIHwgJ2Rpc3B1dGVkJ1xyXG4gICAgICAgIGhvdXJzX3dvcmtlZDogJ0RFQ0lNQUwoNSwgMiknLFxyXG4gICAgICAgIG92ZXJ0aW1lX2hvdXJzOiAnREVDSU1BTCg1LCAyKScsXHJcbiAgICAgICAgY29tcGxpYW5jZV9jaGVja2VkOiAnQk9PTEVBTiBERUZBVUxUIEZBTFNFJyxcclxuICAgICAgICBjcmVhdGVkX2F0OiAnVElNRVNUQU1QIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVAnLFxyXG4gICAgICAgIHVwZGF0ZWRfYXQ6ICdUSU1FU1RBTVAgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCcsXHJcbiAgICAgIH0sXHJcbiAgICAgIGluZGV4ZXM6IFtcclxuICAgICAgICAnQ1JFQVRFIElOREVYIGlkeF93b3JrZXJfaWQgT04gdHJhbnNhY3Rpb25zKHdvcmtlcl9pZCknLFxyXG4gICAgICAgICdDUkVBVEUgSU5ERVggaWR4X2NvbnRyYWN0b3JfaWQgT04gdHJhbnNhY3Rpb25zKGNvbnRyYWN0b3JfaWQpJyxcclxuICAgICAgICAnQ1JFQVRFIElOREVYIGlkeF9kYXRlIE9OIHRyYW5zYWN0aW9ucyhkYXRlKScsXHJcbiAgICAgICAgJ0NSRUFURSBJTkRFWCBpZHhfc3RhdHVzIE9OIHRyYW5zYWN0aW9ucyhzdGF0dXMpJyxcclxuICAgICAgXSxcclxuICAgIH0sXHJcblxyXG4gICAgd2FnZV9jYWxjdWxhdGlvbnM6IHtcclxuICAgICAgY29sdW1uczoge1xyXG4gICAgICAgIGNhbGN1bGF0aW9uX2lkOiAnVVVJRCBQUklNQVJZIEtFWScsXHJcbiAgICAgICAgd29ya2VyX2lkOiAnVkFSQ0hBUigyNTUpIE5PVCBOVUxMJyxcclxuICAgICAgICBwZXJpb2Rfc3RhcnQ6ICdEQVRFIE5PVCBOVUxMJyxcclxuICAgICAgICBwZXJpb2RfZW5kOiAnREFURSBOT1QgTlVMTCcsXHJcbiAgICAgICAgZ3Jvc3Nfd2FnZTogJ0RFQ0lNQUwoMTAsIDIpIE5PVCBOVUxMJyxcclxuICAgICAgICBhZHZhbmNlczogJ0RFQ0lNQUwoMTAsIDIpIERFRkFVTFQgMCcsXHJcbiAgICAgICAgZGVkdWN0aW9uczogJ0RFQ0lNQUwoMTAsIDIpIERFRkFVTFQgMCcsXHJcbiAgICAgICAgbmV0X3dhZ2U6ICdERUNJTUFMKDEwLCAyKSBOT1QgTlVMTCcsXHJcbiAgICAgICAgaG91cnNfd29ya2VkOiAnREVDSU1BTCg2LCAyKScsXHJcbiAgICAgICAgb3ZlcnRpbWVfaG91cnM6ICdERUNJTUFMKDYsIDIpJyxcclxuICAgICAgICBvdmVydGltZV9wYXk6ICdERUNJTUFMKDEwLCAyKSBERUZBVUxUIDAnLFxyXG4gICAgICAgIGNyZWF0ZWRfYXQ6ICdUSU1FU1RBTVAgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCcsXHJcbiAgICAgIH0sXHJcbiAgICAgIGluZGV4ZXM6IFtcclxuICAgICAgICAnQ1JFQVRFIElOREVYIGlkeF93b3JrZXJfcGVyaW9kIE9OIHdhZ2VfY2FsY3VsYXRpb25zKHdvcmtlcl9pZCwgcGVyaW9kX3N0YXJ0LCBwZXJpb2RfZW5kKScsXHJcbiAgICAgIF0sXHJcbiAgICB9LFxyXG5cclxuICAgIGNvbXBsaWFuY2VfY2hlY2tzOiB7XHJcbiAgICAgIGNvbHVtbnM6IHtcclxuICAgICAgICBjaGVja19pZDogJ1VVSUQgUFJJTUFSWSBLRVknLFxyXG4gICAgICAgIHRyYW5zYWN0aW9uX2lkOiAnVVVJRCBSRUZFUkVOQ0VTIHRyYW5zYWN0aW9ucyh0cmFuc2FjdGlvbl9pZCknLFxyXG4gICAgICAgIGlzX2NvbXBsaWFudDogJ0JPT0xFQU4gTk9UIE5VTEwnLFxyXG4gICAgICAgIG1pbmltdW1fd2FnZTogJ0RFQ0lNQUwoMTAsIDIpJyxcclxuICAgICAgICBhY3R1YWxfd2FnZTogJ0RFQ0lNQUwoMTAsIDIpJyxcclxuICAgICAgICBzdGF0ZTogJ1ZBUkNIQVIoMTAwKScsXHJcbiAgICAgICAgaW5kdXN0cnk6ICdWQVJDSEFSKDEwMCknLFxyXG4gICAgICAgIHZpb2xhdGlvbnM6ICdKU09OQicsIC8vIEFycmF5IG9mIHZpb2xhdGlvbiBvYmplY3RzXHJcbiAgICAgICAgY2hlY2tlZF9hdDogJ1RJTUVTVEFNUCBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QJyxcclxuICAgICAgfSxcclxuICAgICAgaW5kZXhlczogW1xyXG4gICAgICAgICdDUkVBVEUgSU5ERVggaWR4X3RyYW5zYWN0aW9uX2lkIE9OIGNvbXBsaWFuY2VfY2hlY2tzKHRyYW5zYWN0aW9uX2lkKScsXHJcbiAgICAgICAgJ0NSRUFURSBJTkRFWCBpZHhfaXNfY29tcGxpYW50IE9OIGNvbXBsaWFuY2VfY2hlY2tzKGlzX2NvbXBsaWFudCknLFxyXG4gICAgICBdLFxyXG4gICAgfSxcclxuXHJcbiAgICBtaW5pbXVtX3dhZ2VfcmF0ZXM6IHtcclxuICAgICAgY29sdW1uczoge1xyXG4gICAgICAgIHJhdGVfaWQ6ICdVVUlEIFBSSU1BUlkgS0VZJyxcclxuICAgICAgICBzdGF0ZTogJ1ZBUkNIQVIoMTAwKSBOT1QgTlVMTCcsXHJcbiAgICAgICAgaW5kdXN0cnk6ICdWQVJDSEFSKDEwMCkgTk9UIE5VTEwnLFxyXG4gICAgICAgIHNraWxsX2xldmVsOiAnVkFSQ0hBUig1MCknLCAvLyAndW5za2lsbGVkJyB8ICdzZW1pX3NraWxsZWQnIHwgJ3NraWxsZWQnXHJcbiAgICAgICAgZGFpbHlfcmF0ZTogJ0RFQ0lNQUwoMTAsIDIpIE5PVCBOVUxMJyxcclxuICAgICAgICBob3VybHlfcmF0ZTogJ0RFQ0lNQUwoMTAsIDIpIE5PVCBOVUxMJyxcclxuICAgICAgICBlZmZlY3RpdmVfZnJvbTogJ0RBVEUgTk9UIE5VTEwnLFxyXG4gICAgICAgIGVmZmVjdGl2ZV90bzogJ0RBVEUnLFxyXG4gICAgICAgIGNyZWF0ZWRfYXQ6ICdUSU1FU1RBTVAgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUCcsXHJcbiAgICAgIH0sXHJcbiAgICAgIGluZGV4ZXM6IFtcclxuICAgICAgICAnQ1JFQVRFIElOREVYIGlkeF9zdGF0ZV9pbmR1c3RyeSBPTiBtaW5pbXVtX3dhZ2VfcmF0ZXMoc3RhdGUsIGluZHVzdHJ5KScsXHJcbiAgICAgICAgJ0NSRUFURSBJTkRFWCBpZHhfZWZmZWN0aXZlX2RhdGVzIE9OIG1pbmltdW1fd2FnZV9yYXRlcyhlZmZlY3RpdmVfZnJvbSwgZWZmZWN0aXZlX3RvKScsXHJcbiAgICAgIF0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbn07XHJcblxyXG5cclxuIl19