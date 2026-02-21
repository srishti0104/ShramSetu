/**
 * DynamoDB Table Configurations for Shram-Setu
 */

export const DynamoDBTables = {
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
export const PostgreSQLConfig = {
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


