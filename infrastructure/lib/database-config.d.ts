/**
 * DynamoDB Table Configurations for Shram-Setu
 */
export declare const DynamoDBTables: {
    users: {
        tableName: string;
        partitionKey: string;
        globalSecondaryIndexes: {
            indexName: string;
            partitionKey: string;
        }[];
        attributes: {
            userId: string;
            mobileNumber: string;
            eShramCardNumber: string;
            role: string;
            preferredLanguage: string;
            createdAt: string;
            lastLoginAt: string;
            isVerified: string;
        };
    };
    jobs: {
        tableName: string;
        partitionKey: string;
        globalSecondaryIndexes: {
            indexName: string;
            partitionKey: string;
            sortKey: string;
        }[];
        attributes: {
            jobId: string;
            contractorId: string;
            title: string;
            description: string;
            city: string;
            state: string;
            wageRate: string;
            status: string;
            postedAt: string;
            skillsRequired: string;
        };
    };
    ratings: {
        tableName: string;
        partitionKey: string;
        globalSecondaryIndexes: {
            indexName: string;
            partitionKey: string;
            sortKey: string;
        }[];
        attributes: {
            ratingId: string;
            fromUserId: string;
            toUserId: string;
            jobId: string;
            score: string;
            category: string;
            createdAt: string;
        };
    };
    syncOperations: {
        tableName: string;
        partitionKey: string;
        sortKey: string;
        timeToLiveAttribute: string;
        attributes: {
            userId: string;
            operationId: string;
            timestamp: string;
            type: string;
            entity: string;
            status: string;
            ttl: string;
        };
    };
    attendance: {
        tableName: string;
        partitionKey: string;
        sortKey: string;
        globalSecondaryIndexes: {
            indexName: string;
            partitionKey: string;
            sortKey: string;
        }[];
        attributes: {
            sessionId: string;
            recordId: string;
            workerId: string;
            markedAt: string;
            status: string;
            signature: string;
        };
    };
    grievances: {
        tableName: string;
        partitionKey: string;
        globalSecondaryIndexes: {
            indexName: string;
            partitionKey: string;
            sortKey: string;
        }[];
        attributes: {
            grievanceId: string;
            reportedBy: string;
            audioUrl: string;
            transcript: string;
            category: string;
            severity: string;
            status: string;
            isAnonymous: string;
            createdAt: string;
        };
    };
};
/**
 * PostgreSQL RDS Configuration
 */
export declare const PostgreSQLConfig: {
    databaseName: string;
    engine: string;
    version: string;
    instanceClass: string;
    allocatedStorage: number;
    maxAllocatedStorage: number;
    multiAz: boolean;
    backupRetentionDays: number;
    deletionProtection: boolean;
    tables: {
        transactions: {
            columns: {
                transaction_id: string;
                worker_id: string;
                contractor_id: string;
                job_id: string;
                type: string;
                amount: string;
                currency: string;
                date: string;
                work_description: string;
                payment_method: string;
                receipt_url: string;
                status: string;
                hours_worked: string;
                overtime_hours: string;
                compliance_checked: string;
                created_at: string;
                updated_at: string;
            };
            indexes: string[];
        };
        wage_calculations: {
            columns: {
                calculation_id: string;
                worker_id: string;
                period_start: string;
                period_end: string;
                gross_wage: string;
                advances: string;
                deductions: string;
                net_wage: string;
                hours_worked: string;
                overtime_hours: string;
                overtime_pay: string;
                created_at: string;
            };
            indexes: string[];
        };
        compliance_checks: {
            columns: {
                check_id: string;
                transaction_id: string;
                is_compliant: string;
                minimum_wage: string;
                actual_wage: string;
                state: string;
                industry: string;
                violations: string;
                checked_at: string;
            };
            indexes: string[];
        };
        minimum_wage_rates: {
            columns: {
                rate_id: string;
                state: string;
                industry: string;
                skill_level: string;
                daily_rate: string;
                hourly_rate: string;
                effective_from: string;
                effective_to: string;
                created_at: string;
            };
            indexes: string[];
        };
    };
};
