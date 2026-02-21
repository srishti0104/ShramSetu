# Database Configuration Guide

## DynamoDB Tables

### 1. Users Table
**Purpose**: Store user profiles for workers and contractors

**Partition Key**: `userId` (String)

**Global Secondary Indexes**:
- `mobileNumber-index`: For login and OTP verification
- `eShramCardNumber-index`: For E-Shram validation

**Key Attributes**:
- `userId`, `mobileNumber`, `eShramCardNumber`, `role`, `preferredLanguage`
- `createdAt`, `lastLoginAt`, `isVerified`

### 2. Jobs Table
**Purpose**: Store job postings and applications

**Partition Key**: `jobId` (String)

**Global Secondary Indexes**:
- `city-status-index`: For geospatial job search within cities
- `contractorId-index`: For contractor's job management

**Key Attributes**:
- `jobId`, `contractorId`, `title`, `description`, `city`, `state`
- `wageRate`, `status`, `postedAt`, `skillsRequired`

### 3. Ratings Table
**Purpose**: Store dual rating system data

**Partition Key**: `ratingId` (String)

**Global Secondary Indexes**:
- `toUserId-index`: Query ratings received by a user
- `fromUserId-index`: Query ratings given by a user

**Key Attributes**:
- `ratingId`, `fromUserId`, `toUserId`, `jobId`, `score`, `category`, `createdAt`

### 4. Sync Operations Table
**Purpose**: Track offline sync operations

**Partition Key**: `userId` (String)
**Sort Key**: `timestamp` (Number)

**TTL Attribute**: `ttl` (Auto-delete after 7 days)

**Key Attributes**:
- `userId`, `operationId`, `timestamp`, `type`, `entity`, `status`, `ttl`

### 5. Attendance Table
**Purpose**: Store TOTP-based attendance records

**Partition Key**: `sessionId` (String)
**Sort Key**: `recordId` (String)

**Global Secondary Indexes**:
- `workerId-index`: Query attendance history by worker

**Key Attributes**:
- `sessionId`, `recordId`, `workerId`, `markedAt`, `status`, `signature`

### 6. Grievances Table
**Purpose**: Store voice-based grievance reports

**Partition Key**: `grievanceId` (String)

**Global Secondary Indexes**:
- `reportedBy-index`: Query grievances by reporter
- `status-severity-index`: Query by status and severity for triage

**Key Attributes**:
- `grievanceId`, `reportedBy`, `audioUrl`, `transcript`, `category`
- `severity`, `status`, `isAnonymous`, `createdAt`

## PostgreSQL RDS (Financial Ledger)

### Database: `shramik_setu_ledger`

### Tables

#### 1. transactions
**Purpose**: ACID-compliant financial transaction records

**Columns**:
- `transaction_id` (UUID, Primary Key)
- `worker_id`, `contractor_id`, `job_id`
- `type` (wage/advance/deduction/bonus)
- `amount`, `currency`, `date`
- `payment_method`, `receipt_url`, `status`
- `hours_worked`, `overtime_hours`
- `compliance_checked`

**Constraints**:
- Amount must be >= 0
- Type must be one of: wage, advance, deduction, bonus
- Status must be one of: pending, completed, disputed

#### 2. wage_calculations
**Purpose**: Calculated wage summaries for workers

**Columns**:
- `calculation_id` (UUID, Primary Key)
- `worker_id`, `period_start`, `period_end`
- `gross_wage`, `advances`, `deductions`, `net_wage`
- `hours_worked`, `overtime_hours`, `overtime_pay`

#### 3. compliance_checks
**Purpose**: Wage compliance validation results

**Columns**:
- `check_id` (UUID, Primary Key)
- `transaction_id` (Foreign Key to transactions)
- `is_compliant`, `minimum_wage`, `actual_wage`
- `state`, `industry`, `violations` (JSONB)

#### 4. minimum_wage_rates
**Purpose**: State-wise minimum wage rates (Minimum Wage Act 1948)

**Columns**:
- `rate_id` (UUID, Primary Key)
- `state`, `industry`, `skill_level`
- `daily_rate`, `hourly_rate`
- `effective_from`, `effective_to`

**Pre-populated Data**: Includes rates for Maharashtra, Delhi, Karnataka, Tamil Nadu

## Initialization

### DynamoDB
Tables are automatically created by AWS CDK deployment:
```bash
cd infrastructure
npm run deploy
```

### PostgreSQL
After RDS instance is created, run the initialization script:
```bash
# Get RDS endpoint from CDK output
psql -h <RDS_ENDPOINT> -U postgres -d shramik_setu_ledger -f scripts/init-postgres.sql
```

Or use AWS Systems Manager Session Manager to connect securely.

## Backup and Recovery

### DynamoDB
- Point-in-time recovery enabled
- DynamoDB Streams enabled for change tracking
- Automatic backups

### PostgreSQL
- Automated daily backups (7-day retention)
- Multi-AZ deployment for high availability
- Encryption at rest using KMS

## Monitoring

- CloudWatch metrics for read/write capacity
- CloudWatch alarms for high latency
- RDS Performance Insights enabled
- Query performance monitoring

## Cost Optimization

### DynamoDB
- On-demand billing mode (pay per request)
- No provisioned capacity needed
- Auto-scaling not required

### PostgreSQL
- t3.small instance (can scale up as needed)
- Storage auto-scaling (20GB to 100GB)
- Multi-AZ for production reliability
