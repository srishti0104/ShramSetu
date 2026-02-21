# Project Structure

## Directory Organization

```
shram-setu/
├── .kiro/
│   ├── specs/           # Feature specifications
│   └── steering/        # Project steering documents
├── src/
│   ├── components/      # React components
│   │   ├── voice/       # Voice interface components
│   │   ├── jobs/        # Job marketplace components
│   │   ├── ledger/      # E-Khata ledger components
│   │   ├── attendance/  # TOTP attendance components
│   │   └── grievance/   # Suraksha grievance components
│   ├── services/        # Business logic and API clients
│   │   ├── voice-assistant/
│   │   ├── geospatial-matcher/
│   │   ├── e-khata-ledger/
│   │   ├── payslip-auditor/
│   │   ├── totp-attendance/
│   │   ├── trust-tier/
│   │   └── delta-sync/
│   ├── hooks/           # React hooks
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript type definitions
│   ├── store/           # State management
│   └── workers/         # Service workers
├── lambda/              # AWS Lambda functions
│   ├── auth/
│   ├── jobs/
│   ├── ledger/
│   ├── attendance/
│   ├── grievances/
│   └── ratings/
├── tests/
│   ├── unit/            # Unit tests
│   ├── integration/     # Integration tests
│   └── property/        # Property-based tests
├── public/              # Static assets
└── infrastructure/      # AWS CDK/CloudFormation

```

## Key Components

### Voice Assistant (`src/services/voice-assistant/`)
Central conversational AI handling voice commands using Amazon Transcribe, Polly, and Lex/Bedrock.

### E-Shram Validator (`src/services/e-shram-validator/`)
Validates worker credentials against government E-Shram database.

### Geospatial Matcher (`src/services/geospatial-matcher/`)
Location-based job matching using Amazon Location Service with city-bounded search.

### E-Khata Ledger (`src/services/e-khata-ledger/`)
Digital financial ledger with ACID-compliant PostgreSQL backend for wage tracking and compliance.

### Payslip Auditor (`src/services/payslip-auditor/`)
OCR-powered payslip processing using Amazon Textract with Minimum Wage Act validation.

### TOTP Attendance (`src/services/totp-attendance/`)
Time-based One-Time Password system for secure attendance verification with cryptographic audit trails.

### Suraksha Grievance Module (`src/services/grievance/`)
Voice-based safety reporting with AI-powered triage using Amazon Comprehend.

### Trust Tier System (`src/services/trust-tier/`)
Dual rating system for workers and contractors with tier-based prioritization.

### Delta Sync (`src/services/delta-sync/`)
Offline-first synchronization with conflict resolution strategies.

## Data Models Location

All TypeScript interfaces and data models are defined in `src/types/`:
- `user.ts`: User, WorkerProfile, ContractorProfile
- `job.ts`: Job, JobApplication, JobMatch
- `transaction.ts`: Transaction, WageCalculation, ComplianceCheck
- `attendance.ts`: WorkSession, AttendanceRecord, TOTPValidation
- `grievance.ts`: Grievance, GrievanceTriage
- `rating.ts`: Rating, TrustProfile
- `sync.ts`: SyncOperation, SyncConflict, CachedEntity

## API Structure

REST endpoints follow pattern: `/api/v1/{resource}/{action}`

WebSocket events for real-time features: attendance, notifications, job updates

## Testing Organization

- Unit tests co-located with source files using `.test.ts` suffix
- Property tests in `tests/property/` with references to design document properties
- Integration tests in `tests/integration/` covering end-to-end flows
- Each property test must include tag: `Feature: shram-setu, Property {number}: {description}`

## Offline Storage

IndexedDB stores:
- `jobs`: Job listings cache
- `transactions`: Payment history
- `attendance`: Attendance records
- `profiles`: User profiles
- `syncQueue`: Pending operations
- `cache`: General cached entities

Maximum 50MB offline storage with priority-based eviction.
