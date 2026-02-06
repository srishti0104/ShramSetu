# Design Document: Shramik-Setu

## Overview

Shramik-Setu is a voice-first Progressive Web Application designed to empower India's blue-collar workforce through accessible technology. The platform addresses critical challenges faced by daily wage workers and contractors: job discovery, wage compliance, attendance tracking, and labor rights enforcement.

### Core Design Principles

1. **Voice-First Architecture**: All features accessible through natural language voice commands
2. **Offline-First Design**: Essential functionality available without internet connectivity
3. **Accessibility by Default**: High contrast UI, screen reader support, and multi-language interface
4. **Privacy and Security**: End-to-end encryption for sensitive data, compliance with Indian regulations
5. **Progressive Enhancement**: Works on basic smartphones with graceful degradation

### Target Users

- **Workers**: Daily wage laborers, construction workers, domestic workers with varying literacy levels
- **Contractors**: Small business owners, construction contractors, job providers
- **Support Organizations**: NGOs, legal aid organizations monitoring labor rights

### Technology Philosophy

The design prioritizes AWS services for voice processing (Transcribe, Polly, Lex) while maintaining a lightweight frontend optimized for low-end devices and poor connectivity. The architecture supports both online and offline modes with intelligent synchronization.

## Architecture

### High-Level System Architecture


```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer (PWA)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Voice UI     │  │ Visual UI    │  │ Offline Manager      │  │
│  │ (Recorder)   │  │ (React)      │  │ (DynamoDB + SW)     │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ REST API     │  │ WebSocket    │  │ GraphQL (Optional)   │  │
│  │ (Lambda)     │  │ (API GW)     │  │ (AppSync)            │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Application Services Layer                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Voice        │  │ Job Matching │  │ E-Khata Ledger       │  │
│  │ Assistant    │  │ Service      │  │ Service              │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Payslip      │  │ Attendance   │  │ Grievance            │  │
│  │ Auditor      │  │ Service      │  │ Service              │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AWS Services Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Transcribe   │  │ Polly        │  │ Lex/Bedrock          │  │
│  │ (STT)        │  │ (TTS)        │  │ (NLU/AI)             │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Textract     │  │ Rekognition  │  │ Location Service     │  │
│  │ (OCR)        │  │ (Image)      │  │ (Geospatial)         │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Data Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ DynamoDB     │  │ S3           │  │ RDS (PostgreSQL)     │  │
│  │ (NoSQL)      │  │ (Files)      │  │ (Relational)         │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Architecture Layers

**Client Layer (PWA)**
- Progressive Web App built with React and TypeScript
- Service Worker for offline functionality and caching
- IndexedDB for local data persistence
- Web Audio API for voice recording
- Responsive UI with high contrast mode

**API Gateway Layer**
- AWS API Gateway for REST endpoints
- WebSocket API for real-time features (attendance, notifications)
- Lambda authorizers for authentication
- Rate limiting and throttling

**Application Services Layer**
- Microservices architecture using AWS Lambda
- Event-driven communication via EventBridge
- Step Functions for complex workflows
- Each service owns its domain logic

**AWS Services Layer**
- Amazon Transcribe for speech-to-text (Hindi + regional languages)
- Amazon Polly for text-to-speech responses
- Amazon Lex or Bedrock for natural language understanding
- Amazon Textract for OCR processing
- Amazon Location Service for geospatial matching

**Data Layer**
- DynamoDB for user profiles, jobs, ratings (high-scale, low-latency)
- PostgreSQL (RDS) for financial ledger (ACID compliance)
- S3 for audio recordings, payslip images, documents
- ElastiCache (Redis) for session management and caching



## Components and Interfaces

### 1. Voice Assistant Component

**Purpose**: Central conversational AI handling voice commands and natural language processing

**Technology Stack**:
- Amazon Transcribe (speech-to-text)
- Amazon Polly (text-to-speech)
- Amazon Lex or Bedrock (intent recognition and dialogue management)
- Lambda functions for business logic

**Core Interfaces**:

```typescript
interface VoiceCommand {
  audioData: Blob;
  language: LanguageCode;
  userId: string;
  sessionId: string;
  timestamp: number;
}

interface VoiceResponse {
  text: string;
  audioUrl: string;
  intent: Intent;
  confidence: number;
  followUpPrompt?: string;
}

interface Intent {
  name: string; // "search_jobs", "check_wages", "report_grievance", etc.
  slots: Record<string, any>;
  confirmationStatus: "Confirmed" | "Denied" | "None";
}

interface ConversationContext {
  sessionId: string;
  userId: string;
  language: LanguageCode;
  history: Message[];
  currentIntent?: Intent;
  metadata: Record<string, any>;
}
```

**Key Operations**:
- `processVoiceCommand(command: VoiceCommand): Promise<VoiceResponse>`
- `synthesizeSpeech(text: string, language: LanguageCode): Promise<AudioBuffer>`
- `detectIntent(transcript: string, context: ConversationContext): Promise<Intent>`
- `handleFallback(failedCommand: VoiceCommand): Promise<VoiceResponse>`

**Language Support**:
- Hindi (primary)
- Regional languages: Tamil, Telugu, Bengali, Marathi, Gujarati
- Mixed-language conversation handling
- Fallback to English for technical terms

**Error Handling**:
- Retry mechanism for failed transcription (up to 3 attempts)
- Simplified visual prompts when voice fails
- Context preservation across retries
- Graceful degradation to text input

### 2. E-Shram Validator Component

**Purpose**: Verify worker credentials against government E-Shram database

**Technology Stack**:
- AWS Lambda for API integration
- API Gateway for external calls
- DynamoDB for caching validated credentials
- Secrets Manager for API keys

**Core Interfaces**:

```typescript
interface EShramCard {
  cardNumber: string;
  mobileNumber: string;
  name: string;
  dateOfBirth: string;
}

interface EShramValidationResult {
  isValid: boolean;
  workerInfo?: WorkerInfo;
  errorCode?: string;
  errorMessage?: string;
}

interface WorkerInfo {
  name: string;
  skills: string[];
  location: Location;
  registrationDate: string;
  verified: boolean;
}
```

**Key Operations**:
- `validateEShramCard(card: EShramCard): Promise<EShramValidationResult>`
- `extractWorkerInfo(validationResult: EShramValidationResult): WorkerInfo`
- `cacheValidatedCredentials(cardNumber: string, info: WorkerInfo): Promise<void>`

**Integration Points**:
- Government E-Shram API (external)
- Onboarding service (internal)
- User profile service (internal)

### 3. Geospatial Matcher Component

**Purpose**: Match workers with nearby job opportunities using location-based algorithms

**Technology Stack**:
- Amazon Location Service for geocoding and routing
- DynamoDB with geospatial indexes
- Lambda for matching algorithms
- EventBridge for job notifications

**Core Interfaces**:

```typescript
interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city: string;
  state: string;
  pincode: string;
}

interface Job {
  jobId: string;
  title: string;
  description: string;
  location: Location;
  wageRate: number;
  duration: string;
  skillsRequired: string[];
  contractorId: string;
  postedAt: number;
  status: "open" | "filled" | "cancelled";
}

interface JobSearchCriteria {
  workerId: string;
  workerLocation: Location;
  skills: string[];
  maxDistance?: number; // in kilometers
  minWage?: number;
}

interface JobMatch {
  job: Job;
  distance: number;
  travelTime: number;
  matchScore: number;
  contractor: ContractorProfile;
}
```

**Key Operations**:
- `searchJobs(criteria: JobSearchCriteria): Promise<JobMatch[]>`
- `calculateDistance(from: Location, to: Location): Promise<number>`
- `estimateTravelTime(from: Location, to: Location): Promise<number>`
- `rankMatches(jobs: Job[], worker: WorkerProfile): JobMatch[]`

**Matching Algorithm**:
1. Filter jobs within city boundaries
2. Calculate distance and travel time for each job
3. Score based on: proximity (40%), skill match (30%), trust tier (20%), wage (10%)
4. Sort by match score descending
5. Return top 20 matches

### 4. E-Khata Ledger Component

**Purpose**: Digital financial ledger for tracking wages, advances, and payments with legal compliance

**Technology Stack**:
- PostgreSQL (RDS) for ACID-compliant transactions
- Lambda for business logic
- EventBridge for payment notifications
- S3 for receipt storage

**Core Interfaces**:

```typescript
interface Transaction {
  transactionId: string;
  workerId: string;
  contractorId: string;
  type: "wage" | "advance" | "deduction" | "bonus";
  amount: number;
  date: string;
  workDescription: string;
  paymentMethod: "cash" | "upi" | "bank_transfer";
  receiptUrl?: string;
  status: "pending" | "completed" | "disputed";
}

interface WageCalculation {
  grossWage: number;
  advances: number;
  deductions: number;
  netWage: number;
  hoursWorked: number;
  overtimeHours: number;
  overtimePay: number;
}

interface ComplianceCheck {
  isCompliant: boolean;
  minimumWage: number;
  actualWage: number;
  violations: Violation[];
  state: string;
  industry: string;
}

interface Violation {
  type: "below_minimum_wage" | "unpaid_overtime" | "missing_benefits";
  description: string;
  severity: "low" | "medium" | "high";
  suggestedAction: string;
}
```

**Key Operations**:
- `recordTransaction(transaction: Transaction): Promise<string>`
- `calculateWages(workerId: string, period: DateRange): Promise<WageCalculation>`
- `checkCompliance(wage: WageCalculation, location: Location): Promise<ComplianceCheck>`
- `getPaymentHistory(workerId: string, limit: number): Promise<Transaction[]>`
- `trackAdvance(workerId: string, amount: number): Promise<void>`

**Compliance Engine**:
- Maintains state-wise minimum wage database
- Validates against Minimum Wage Act 1948
- Checks Labour Act provisions (overtime, holidays)
- Cross-references PM Shram Yogi Maandhan eligibility



### 5. Payslip Auditor Component

**Purpose**: OCR-powered payslip processing and wage compliance verification

**Technology Stack**:
- Amazon Textract for OCR
- Amazon Rekognition for image quality assessment
- Lambda for parsing and validation
- S3 for document storage

**Core Interfaces**:

```typescript
interface PayslipImage {
  imageUrl: string;
  uploadedBy: string;
  uploadedAt: number;
  format: "jpg" | "png" | "pdf";
}

interface ExtractedPayslipData {
  employerName?: string;
  employeeId?: string;
  payPeriod?: string;
  grossPay?: number;
  deductions?: number;
  netPay?: number;
  hoursWorked?: number;
  confidence: number;
  rawText: string;
}

interface PayslipValidation {
  isValid: boolean;
  extractedData: ExtractedPayslipData;
  complianceCheck: ComplianceCheck;
  requiresManualReview: boolean;
  errors: string[];
}
```

**Key Operations**:
- `extractText(image: PayslipImage): Promise<ExtractedPayslipData>`
- `parsePayslipData(rawText: string): Promise<ExtractedPayslipData>`
- `validatePayslip(data: ExtractedPayslipData): Promise<PayslipValidation>`
- `storeInLedger(validation: PayslipValidation, workerId: string): Promise<void>`

**OCR Processing Pipeline**:
1. Image quality assessment (reject if too blurry/dark)
2. Text extraction using Textract
3. Pattern matching for common payslip formats
4. Entity extraction (amounts, dates, names)
5. Validation and confidence scoring
6. Manual review flagging if confidence < 80%

**Supported Formats**:
- Standard Indian payslip templates
- Handwritten receipts (limited support)
- Multi-language documents (Hindi, English, regional)

### 6. TOTP Attendance Component

**Purpose**: Time-based One-Time Password system for secure attendance verification

**Technology Stack**:
- Lambda for TOTP generation and validation
- DynamoDB for attendance records
- EventBridge for expiration handling
- Redis (ElastiCache) for active code storage

**Core Interfaces**:

```typescript
interface WorkSession {
  sessionId: string;
  contractorId: string;
  jobId: string;
  startTime: number;
  expectedWorkers: string[];
  totpCode?: string;
  codeExpiresAt?: number;
}

interface AttendanceRecord {
  recordId: string;
  workerId: string;
  sessionId: string;
  markedAt: number;
  location?: Location;
  verificationMethod: "totp" | "manual";
  status: "present" | "absent" | "late";
}

interface TOTPValidation {
  isValid: boolean;
  workerId: string;
  sessionId: string;
  timestamp: number;
  errorCode?: string;
}
```

**Key Operations**:
- `generateTOTP(session: WorkSession): Promise<string>`
- `validateTOTP(code: string, workerId: string, sessionId: string): Promise<TOTPValidation>`
- `markAttendance(validation: TOTPValidation): Promise<AttendanceRecord>`
- `getAttendanceLog(sessionId: string): Promise<AttendanceRecord[]>`

**TOTP Algorithm**:
- 6-digit numeric code
- 5-minute validity window
- HMAC-SHA256 based generation
- Session-specific secret key
- Automatic rotation on expiry

**Security Features**:
- Cryptographic integrity for audit records
- Location verification (optional)
- Rate limiting to prevent brute force
- Immutable audit trail

### 7. Suraksha Grievance Module

**Purpose**: Voice-based safety and grievance reporting with AI-powered triage

**Technology Stack**:
- Amazon Transcribe for voice-to-text
- Amazon Comprehend for sentiment analysis
- Lambda for processing and routing
- S3 for encrypted audio storage
- SNS for notifications to NGOs

**Core Interfaces**:

```typescript
interface Grievance {
  grievanceId: string;
  reportedBy: string;
  audioUrl: string;
  transcript: string;
  category: GrievanceCategory;
  severity: "low" | "medium" | "high" | "critical";
  isAnonymous: boolean;
  status: "submitted" | "under_review" | "resolved" | "escalated";
  createdAt: number;
  assignedTo?: string;
}

type GrievanceCategory = 
  | "wage_dispute"
  | "safety_violation"
  | "harassment"
  | "working_conditions"
  | "contract_violation"
  | "other";

interface GrievanceTriage {
  category: GrievanceCategory;
  severity: string;
  keywords: string[];
  suggestedAction: string;
  requiresLegalAid: boolean;
  ngoReferrals: string[];
}
```

**Key Operations**:
- `submitGrievance(audio: Blob, isAnonymous: boolean): Promise<string>`
- `transcribeGrievance(audioUrl: string): Promise<string>`
- `triageGrievance(transcript: string): Promise<GrievanceTriage>`
- `routeToNGO(grievance: Grievance, ngoId: string): Promise<void>`
- `updateStatus(grievanceId: string, status: string): Promise<void>`

**AI Triage Logic**:
- NLP-based keyword extraction
- Sentiment analysis for urgency detection
- Category classification using ML model
- Automatic escalation for critical issues
- NGO matching based on location and expertise

### 8. Trust Tier System Component

**Purpose**: Dual rating system for building community trust

**Technology Stack**:
- DynamoDB for ratings and profiles
- Lambda for rating calculations
- EventBridge for rating notifications

**Core Interfaces**:

```typescript
interface Rating {
  ratingId: string;
  fromUserId: string;
  toUserId: string;
  jobId: string;
  score: 1 | 2 | 3 | 4 | 5;
  category: "worker_rating" | "contractor_rating";
  feedback: RatingFeedback;
  createdAt: number;
}

interface RatingFeedback {
  paymentTimeliness?: number;
  workQuality?: number;
  communication?: number;
  workingConditions?: number;
  comments?: string;
}

interface TrustProfile {
  userId: string;
  trustTier: "bronze" | "silver" | "gold" | "platinum";
  averageRating: number;
  totalRatings: number;
  recentRatings: Rating[];
  badges: string[];
}
```

**Key Operations**:
- `submitRating(rating: Rating): Promise<void>`
- `calculateTrustTier(userId: string): Promise<string>`
- `getTrustProfile(userId: string): Promise<TrustProfile>`
- `updateTierBadges(userId: string): Promise<void>`

**Trust Tier Calculation**:
- Bronze: 0-10 ratings, avg >= 3.0
- Silver: 11-50 ratings, avg >= 3.5
- Gold: 51-200 ratings, avg >= 4.0
- Platinum: 200+ ratings, avg >= 4.5

### 9. Delta Sync Component

**Purpose**: Offline-first data synchronization with conflict resolution

**Technology Stack**:
- IndexedDB for local storage
- Service Worker for background sync
- Lambda for server-side sync processing
- DynamoDB Streams for change detection

**Core Interfaces**:

```typescript
interface SyncOperation {
  operationId: string;
  type: "create" | "update" | "delete";
  entity: string;
  data: any;
  timestamp: number;
  userId: string;
  status: "queued" | "syncing" | "completed" | "failed";
  retryCount: number;
}

interface SyncConflict {
  operationId: string;
  localData: any;
  serverData: any;
  conflictType: "version" | "concurrent_edit" | "deleted";
  resolution: "server_wins" | "client_wins" | "manual";
}

interface SyncStatus {
  lastSyncTime: number;
  pendingOperations: number;
  failedOperations: number;
  conflicts: SyncConflict[];
}
```

**Key Operations**:
- `queueOperation(operation: SyncOperation): Promise<void>`
- `syncPendingOperations(): Promise<SyncStatus>`
- `resolveConflict(conflict: SyncConflict): Promise<void>`
- `getCachedData(entity: string, id: string): Promise<any>`

**Conflict Resolution Strategy**:
- Financial records: Server wins (authoritative)
- User preferences: Client wins (local priority)
- Attendance records: Manual resolution required
- Job applications: Last-write-wins with timestamp

**Sync Queue Management**:
- Maximum 1000 queued operations
- Automatic retry with exponential backoff
- Priority queue (critical operations first)
- Batch processing for efficiency



## Data Models

### User Models

```typescript
interface User {
  userId: string;
  mobileNumber: string;
  role: "worker" | "contractor";
  preferredLanguage: LanguageCode;
  createdAt: number;
  lastLoginAt: number;
  isVerified: boolean;
  deviceInfo: DeviceInfo;
}

interface WorkerProfile extends User {
  role: "worker";
  eShramCardNumber: string;
  name: string;
  skills: string[];
  location: Location;
  trustProfile: TrustProfile;
  preferences: WorkerPreferences;
}

interface ContractorProfile extends User {
  role: "contractor";
  businessName: string;
  gstNumber?: string;
  location: Location;
  trustProfile: TrustProfile;
  verificationDocuments: string[];
}

interface WorkerPreferences {
  maxTravelDistance: number;
  minWageRate: number;
  preferredJobTypes: string[];
  notificationSettings: NotificationSettings;
}
```

### Job and Transaction Models

```typescript
interface Job {
  jobId: string;
  contractorId: string;
  title: string;
  description: string;
  location: Location;
  wageRate: number;
  wageType: "hourly" | "daily" | "piece_rate" | "contract";
  duration: string;
  skillsRequired: string[];
  workersNeeded: number;
  workersHired: number;
  startDate: string;
  endDate?: string;
  status: "open" | "in_progress" | "completed" | "cancelled";
  postedAt: number;
  applications: JobApplication[];
}

interface JobApplication {
  applicationId: string;
  jobId: string;
  workerId: string;
  appliedAt: number;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  distance: number;
  matchScore: number;
}

interface Transaction {
  transactionId: string;
  workerId: string;
  contractorId: string;
  jobId?: string;
  type: "wage" | "advance" | "deduction" | "bonus";
  amount: number;
  currency: "INR";
  date: string;
  workDescription: string;
  paymentMethod: "cash" | "upi" | "bank_transfer" | "cheque";
  receiptUrl?: string;
  status: "pending" | "completed" | "disputed";
  metadata: {
    hoursWorked?: number;
    overtimeHours?: number;
    complianceChecked: boolean;
    violations?: Violation[];
  };
}
```

### Attendance and Session Models

```typescript
interface WorkSession {
  sessionId: string;
  jobId: string;
  contractorId: string;
  date: string;
  startTime: number;
  endTime?: number;
  expectedWorkers: string[];
  attendanceRecords: AttendanceRecord[];
  totpCode?: string;
  codeGeneratedAt?: number;
  codeExpiresAt?: number;
  status: "active" | "completed" | "cancelled";
}

interface AttendanceRecord {
  recordId: string;
  sessionId: string;
  workerId: string;
  markedAt: number;
  markedBy: string;
  location?: Location;
  verificationMethod: "totp" | "manual" | "biometric";
  status: "present" | "absent" | "late" | "half_day";
  hoursWorked?: number;
  signature?: string; // cryptographic signature for audit
}
```

### Grievance and Rating Models

```typescript
interface Grievance {
  grievanceId: string;
  reportedBy: string;
  reportedAgainst?: string;
  jobId?: string;
  audioUrl: string;
  transcript: string;
  category: GrievanceCategory;
  severity: "low" | "medium" | "high" | "critical";
  isAnonymous: boolean;
  status: "submitted" | "under_review" | "resolved" | "escalated" | "closed";
  createdAt: number;
  updatedAt: number;
  assignedTo?: string;
  resolution?: string;
  ngoReferrals: string[];
}

interface Rating {
  ratingId: string;
  fromUserId: string;
  toUserId: string;
  jobId: string;
  score: 1 | 2 | 3 | 4 | 5;
  category: "worker_rating" | "contractor_rating";
  aspects: {
    paymentTimeliness?: number;
    workQuality?: number;
    communication?: number;
    workingConditions?: number;
    punctuality?: number;
    reliability?: number;
  };
  comments?: string;
  createdAt: number;
  isVerified: boolean;
}

interface TrustProfile {
  userId: string;
  trustTier: "bronze" | "silver" | "gold" | "platinum";
  averageRating: number;
  totalRatings: number;
  ratingBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  recentRatings: Rating[];
  badges: string[];
  joinedAt: number;
  lastRatingAt?: number;
}
```

### Sync and Cache Models

```typescript
interface SyncOperation {
  operationId: string;
  userId: string;
  type: "create" | "update" | "delete";
  entity: "job" | "transaction" | "attendance" | "rating" | "profile";
  entityId: string;
  data: any;
  timestamp: number;
  status: "queued" | "syncing" | "completed" | "failed";
  retryCount: number;
  maxRetries: 3;
  error?: string;
}

interface CachedEntity {
  entityType: string;
  entityId: string;
  data: any;
  cachedAt: number;
  expiresAt: number;
  version: number;
}
```

## API Design

### REST API Endpoints

**Authentication & Onboarding**
```
POST   /api/v1/auth/send-otp
POST   /api/v1/auth/verify-otp
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh-token
POST   /api/v1/auth/logout

POST   /api/v1/onboarding/validate-eshram
POST   /api/v1/onboarding/complete-profile
```

**Voice Assistant**
```
POST   /api/v1/voice/process-command
POST   /api/v1/voice/synthesize-speech
GET    /api/v1/voice/session/{sessionId}
DELETE /api/v1/voice/session/{sessionId}
```

**Job Marketplace**
```
GET    /api/v1/jobs/search
POST   /api/v1/jobs
GET    /api/v1/jobs/{jobId}
PUT    /api/v1/jobs/{jobId}
DELETE /api/v1/jobs/{jobId}

POST   /api/v1/jobs/{jobId}/apply
GET    /api/v1/jobs/{jobId}/applications
PUT    /api/v1/jobs/{jobId}/applications/{applicationId}
```

**E-Khata Ledger**
```
POST   /api/v1/ledger/transactions
GET    /api/v1/ledger/transactions
GET    /api/v1/ledger/transactions/{transactionId}
GET    /api/v1/ledger/balance/{workerId}
GET    /api/v1/ledger/compliance-check

POST   /api/v1/ledger/payslip/upload
GET    /api/v1/ledger/payslip/{payslipId}
```

**Attendance**
```
POST   /api/v1/attendance/sessions
GET    /api/v1/attendance/sessions/{sessionId}
POST   /api/v1/attendance/sessions/{sessionId}/generate-totp
POST   /api/v1/attendance/sessions/{sessionId}/mark
GET    /api/v1/attendance/records
```

**Grievances**
```
POST   /api/v1/grievances
GET    /api/v1/grievances
GET    /api/v1/grievances/{grievanceId}
PUT    /api/v1/grievances/{grievanceId}
```

**Ratings & Trust**
```
POST   /api/v1/ratings
GET    /api/v1/ratings/{userId}
GET    /api/v1/trust-profile/{userId}
```

**Sync**
```
POST   /api/v1/sync/operations
GET    /api/v1/sync/status
POST   /api/v1/sync/resolve-conflict
```

### WebSocket Events

**Real-time Notifications**
```
// Client -> Server
{ "action": "subscribe", "channel": "jobs", "filters": {...} }
{ "action": "subscribe", "channel": "attendance", "sessionId": "..." }
{ "action": "unsubscribe", "channel": "..." }

// Server -> Client
{ "event": "job_posted", "data": {...} }
{ "event": "application_status", "data": {...} }
{ "event": "totp_generated", "data": {...} }
{ "event": "payment_received", "data": {...} }
{ "event": "grievance_update", "data": {...} }
```

### GraphQL Schema (Optional Enhancement)

```graphql
type Query {
  me: User!
  jobs(filter: JobFilter, location: LocationInput): [Job!]!
  job(id: ID!): Job
  transactions(userId: ID!, limit: Int): [Transaction!]!
  trustProfile(userId: ID!): TrustProfile!
  grievances(userId: ID!): [Grievance!]!
}

type Mutation {
  applyForJob(jobId: ID!): JobApplication!
  recordTransaction(input: TransactionInput!): Transaction!
  submitRating(input: RatingInput!): Rating!
  submitGrievance(input: GrievanceInput!): Grievance!
  markAttendance(sessionId: ID!, totpCode: String!): AttendanceRecord!
}

type Subscription {
  jobPosted(location: LocationInput!): Job!
  attendanceMarked(sessionId: ID!): AttendanceRecord!
  paymentReceived(userId: ID!): Transaction!
}
```



## Security Architecture

### Authentication and Authorization

**Multi-Factor Authentication Flow**:
1. Mobile number + OTP (primary)
2. E-Shram card validation (identity verification)
3. Biometric/Passkey (optional, for returning users)

**Token Management**:
- JWT tokens with 1-hour expiry
- Refresh tokens with 30-day expiry
- Token rotation on refresh
- Secure storage in httpOnly cookies (web) or secure storage (mobile)

**Authorization Model**:
```typescript
interface Permission {
  resource: string;
  action: "create" | "read" | "update" | "delete";
  conditions?: Record<string, any>;
}

interface Role {
  name: "worker" | "contractor" | "admin" | "ngo";
  permissions: Permission[];
}

// Example: Workers can only read their own transactions
{
  resource: "transaction",
  action: "read",
  conditions: { workerId: "${user.userId}" }
}
```

### Data Encryption

**At Rest**:
- DynamoDB encryption using AWS KMS
- RDS encryption with customer-managed keys
- S3 server-side encryption (SSE-KMS)
- IndexedDB encryption for sensitive offline data

**In Transit**:
- TLS 1.3 for all API communications
- Certificate pinning for mobile apps
- WebSocket secure connections (WSS)

**Field-Level Encryption**:
- E-Shram card numbers
- Mobile numbers
- Financial transaction details
- Grievance audio recordings
- Personal identification information

### Privacy Protection

**Data Minimization**:
- Collect only essential information
- Anonymous grievance reporting option
- Automatic PII redaction in logs
- Time-limited data retention

**Compliance**:
- Digital Personal Data Protection Act (DPDPA) 2023 compliance
- E-Shram data handling guidelines
- Right to data deletion
- Consent management for data sharing

**Audit Logging**:
```typescript
interface AuditLog {
  logId: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: number;
  ipAddress: string;
  userAgent: string;
  result: "success" | "failure";
  metadata: Record<string, any>;
}
```

### API Security

**Rate Limiting**:
- 100 requests/minute per user (general)
- 10 requests/minute for OTP generation
- 5 requests/minute for voice processing
- Exponential backoff for repeated failures

**Input Validation**:
- Schema validation for all API inputs
- Sanitization of user-generated content
- File upload restrictions (size, type)
- SQL injection prevention
- XSS protection

**API Authentication**:
- AWS Signature V4 for service-to-service
- API keys for external integrations
- OAuth 2.0 for third-party apps
- Lambda authorizers for custom logic

### Secure File Handling

**Upload Security**:
- Virus scanning for uploaded files
- Image validation before OCR processing
- Maximum file size limits (5MB for images)
- Allowed MIME types whitelist

**Storage Security**:
- Pre-signed URLs with expiration
- Access logging for S3 buckets
- Versioning for critical documents
- Cross-region replication for disaster recovery

## Offline-First Architecture

### Service Worker Strategy

**Caching Strategy**:
```javascript
// Network-first for dynamic data
const networkFirst = [
  '/api/v1/jobs/search',
  '/api/v1/ledger/transactions',
  '/api/v1/attendance/sessions'
];

// Cache-first for static assets
const cacheFirst = [
  '/static/',
  '/assets/',
  '/fonts/',
  '/icons/'
];

// Stale-while-revalidate for profiles
const staleWhileRevalidate = [
  '/api/v1/trust-profile/',
  '/api/v1/jobs/'
];
```

**Background Sync**:
- Automatic sync when connection restored
- Periodic sync every 15 minutes (when online)
- Manual sync trigger available
- Sync status indicators in UI

### Local Data Storage

**IndexedDB Schema**:
```typescript
// Object Stores
const stores = {
  jobs: { keyPath: 'jobId', indexes: ['status', 'location', 'postedAt'] },
  transactions: { keyPath: 'transactionId', indexes: ['workerId', 'date'] },
  attendance: { keyPath: 'recordId', indexes: ['sessionId', 'workerId'] },
  profiles: { keyPath: 'userId' },
  syncQueue: { keyPath: 'operationId', indexes: ['status', 'timestamp'] },
  cache: { keyPath: ['entityType', 'entityId'] }
};
```

**Storage Quotas**:
- Maximum 50MB for offline data
- Automatic cleanup of old cache entries
- Priority-based eviction (critical data retained)
- User notification when quota exceeded

### Delta Sync Implementation

**Change Detection**:
```typescript
interface ChangeVector {
  userId: string;
  lastSyncTimestamp: number;
  entityVersions: Map<string, number>;
}

interface Delta {
  entity: string;
  entityId: string;
  operation: "create" | "update" | "delete";
  data: any;
  version: number;
  timestamp: number;
}
```

**Sync Algorithm**:
1. Client sends last sync timestamp and entity versions
2. Server computes deltas since last sync
3. Server sends only changed entities
4. Client applies deltas to local storage
5. Client sends queued local operations
6. Server validates and applies operations
7. Server returns conflicts if any
8. Client resolves conflicts based on strategy

**Conflict Resolution**:
```typescript
interface ConflictResolution {
  strategy: "server_wins" | "client_wins" | "merge" | "manual";
  resolver: (local: any, server: any) => any;
}

const resolutionStrategies: Record<string, ConflictResolution> = {
  transaction: { strategy: "server_wins", resolver: (l, s) => s },
  profile: { strategy: "merge", resolver: mergeProfiles },
  attendance: { strategy: "manual", resolver: promptUser },
  preferences: { strategy: "client_wins", resolver: (l, s) => l }
};
```

### Offline Capabilities

**Available Offline**:
- View cached job listings
- View payment history
- View attendance records
- Access trust profile
- Record voice grievances (queued for upload)
- View cached payslips

**Requires Online**:
- Job search with fresh results
- Apply for jobs
- Generate TOTP codes
- Real-time voice assistant
- OCR payslip processing
- Submit ratings

**Graceful Degradation**:
- Show cached data with "offline" indicator
- Queue operations with visual feedback
- Disable unavailable features with explanations
- Provide offline alternatives where possible

### Progressive Enhancement

**Core Experience** (works on all devices):
- Basic job browsing
- Text-based interaction
- Simple forms
- Essential features only

**Enhanced Experience** (modern browsers):
- Voice commands
- Real-time updates
- Rich media
- Advanced animations

**Optimal Experience** (high-end devices):
- Full voice interaction
- Instant sync
- All features enabled
- Smooth animations



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified several areas where properties can be consolidated:

**Redundancy Analysis**:
- Properties 4.2 and 4.3 (rating feedback capture) can be combined into a single property about feedback field completeness
- Properties 11.1, 11.2, and 11.3 (OCR extraction, parsing, validation) represent a pipeline that can be tested as one comprehensive property
- Properties 9.1, 9.2, 9.3 (accessibility features) can be combined into a comprehensive accessibility compliance property
- Properties 14.1 and 14.2 (encryption at rest and in transit) can be combined into a comprehensive data security property

The following properties represent the minimal set needed to validate all testable requirements without redundancy.

### Voice Assistant Properties

**Property 1: Voice transcription accuracy**
*For any* audio input in supported languages containing common labor-related vocabulary, the transcription accuracy should be at least 95%.
**Validates: Requirements 1.1**

**Property 2: Intent recognition correctness**
*For any* valid voice command for job search, payment queries, or grievance reporting, the Voice Assistant should correctly identify the intent and extract relevant parameters.
**Validates: Requirements 1.2, 13.1**

**Property 3: Language-consistent responses**
*For any* voice interaction, the audio response language should match the user's preferred language setting.
**Validates: Requirements 1.3**

**Property 4: Fallback mechanism activation**
*For any* failed voice recognition attempt, the system should provide fallback options including visual prompts and retry mechanisms.
**Validates: Requirements 1.4**

**Property 5: Cross-language context preservation**
*For any* conversation where the user switches languages, the conversation context should be maintained and responses should be in the new language.
**Validates: Requirements 1.5**

**Property 6: Natural language variation handling**
*For any* voice command with natural language variations, colloquial expressions, or mixed-language content, the Voice Assistant should correctly understand the intent.
**Validates: Requirements 13.2**

**Property 7: Multi-step workflow support**
*For any* complex multi-step workflow initiated through voice, all steps should execute correctly in sequence.
**Validates: Requirements 13.3**

**Property 8: Ambiguity resolution**
*For any* ambiguous voice command, the Voice Assistant should ask clarifying questions before proceeding.
**Validates: Requirements 13.4**

**Property 9: Spoken confirmation provision**
*For any* executed voice command, the system should provide spoken confirmation and status updates.
**Validates: Requirements 13.5**

**Property 10: Conversation context maintenance**
*For any* multi-turn conversation, the Voice Assistant should maintain context across all exchanges.
**Validates: Requirements 13.7**

### Authentication and Onboarding Properties

**Property 11: OTP delivery timeliness**
*For any* valid mobile number, an OTP should be sent and the system should be ready to verify within 60 seconds.
**Validates: Requirements 2.2**

**Property 12: E-Shram validation correctness**
*For any* E-Shram card details provided, the validator should return the correct validation status (valid/invalid) based on government database.
**Validates: Requirements 2.3**

**Property 13: Worker information extraction completeness**
*For any* successfully validated E-Shram card, all worker information (skills, location, name) should be extracted and stored.
**Validates: Requirements 2.4**

**Property 14: Role-based configuration**
*For any* user role selection (Worker/Contractor), the system should configure the appropriate permissions and features for that role.
**Validates: Requirements 2.5**

**Property 15: Conditional biometric enablement**
*For any* device with biometric authentication available, the system should enable passkey setup; otherwise, it should not offer this option.
**Validates: Requirements 2.6**

### Geospatial Matching Properties

**Property 16: City-bounded job search**
*For any* worker location, job search results should only include jobs within the same city, sorted by distance.
**Validates: Requirements 3.1**

**Property 17: Job result completeness**
*For any* job search result, the displayed information should include distance, travel time, job details, and be in the user's preferred language.
**Validates: Requirements 3.2**

**Property 18: Application notification and tracking**
*For any* job application submitted by a worker, the contractor should receive a notification and the application status should be tracked.
**Validates: Requirements 3.3**

**Property 19: Job posting validation**
*For any* job posting attempt, the system should reject postings that lack required fields (location, wage rate, duration, skills).
**Validates: Requirements 3.4**

**Property 20: Worker prioritization algorithm**
*For any* job matching scenario, workers should be ranked based on proximity (40%), skill match (30%), trust tier (20%), and wage expectations (10%).
**Validates: Requirements 3.5**

### Trust and Rating Properties

**Property 21: Mutual rating prompts**
*For any* completed job, both the worker and contractor should be prompted to provide ratings on a 5-point scale.
**Validates: Requirements 4.1**

**Property 22: Rating feedback completeness**
*For any* rating submitted (worker or contractor), all required feedback fields should be captured and stored.
**Validates: Requirements 4.2, 4.3**

**Property 23: Trust profile display completeness**
*For any* user profile viewed, the display should include current trust tier and recent rating summaries.
**Validates: Requirements 4.4**

### TOTP Attendance Properties

**Property 24: TOTP generation properties**
*For any* work session started, the generated TOTP code should be exactly 6 digits, unique, and valid for exactly 5 minutes.
**Validates: Requirements 5.1**

**Property 25: TOTP validation and attendance marking**
*For any* valid TOTP code entered by a worker, the system should mark the worker as present for that session.
**Validates: Requirements 5.2**

**Property 26: TOTP expiration and rotation**
*For any* expired TOTP code, the system should reject it, generate a new code, and invalidate the previous one.
**Validates: Requirements 5.3**

**Property 27: Attendance audit trail creation**
*For any* attendance marking event, an immutable audit record should be created with timestamp, location, and cryptographic signature.
**Validates: Requirements 5.4**

**Property 28: Audit log cryptographic integrity**
*For any* attendance audit record, the cryptographic signature should be verifiable and valid.
**Validates: Requirements 5.5**

### Financial Ledger Properties

**Property 29: Transaction storage completeness**
*For any* wage payment recorded, all transaction details (amount, date, work description, contractor information) should be stored.
**Validates: Requirements 6.1**

**Property 30: Payslip OCR and compliance validation**
*For any* uploaded payslip image, the system should extract wage information using OCR and validate against Minimum Wage Act 1948.
**Validates: Requirements 6.2, 11.1, 11.2, 11.3**

**Property 31: Wage violation flagging**
*For any* detected wage violation, the system should flag the discrepancy and provide suggested corrective actions.
**Validates: Requirements 6.3**

**Property 32: Payment history report completeness**
*For any* payment history request, the report should include all transactions with compliance status.
**Validates: Requirements 6.4**

**Property 33: Advance tracking and deduction**
*For any* advance given to a worker, the system should track the amount and automatically deduct it from future wage calculations.
**Validates: Requirements 6.5**

**Property 34: Payslip processing success storage**
*For any* successfully processed payslip, the structured wage data should be stored in the worker's E-Khata Ledger.
**Validates: Requirements 11.5**

**Property 35: Multi-format payslip support**
*For any* payslip in common Indian formats (including multiple languages and handwritten text), the system should attempt to process it.
**Validates: Requirements 11.6**

**Property 36: Financial data encryption**
*For any* sensitive financial data (payslips, transactions), the stored information should be encrypted.
**Validates: Requirements 11.7**

### Grievance System Properties

**Property 37: Grievance audio capture and encryption**
*For any* grievance recording, the audio should be captured and stored with encryption.
**Validates: Requirements 7.1**

**Property 38: Grievance transcription and NLP processing**
*For any* submitted voice grievance, the system should transcribe the audio to text and identify key issues using NLP.
**Validates: Requirements 7.2**

**Property 39: Serious violation auto-flagging**
*For any* grievance containing serious violations, the system should automatically flag it for urgent review and legal aid referral.
**Validates: Requirements 7.3**

**Property 40: Anonymous reporting identity protection**
*For any* grievance marked as anonymous, the user's identity should not be exposed while maintaining case integrity.
**Validates: Requirements 7.4**

**Property 41: NGO notification routing**
*For any* grievance requiring follow-up, the system should notify relevant NGOs based on issue type and location.
**Validates: Requirements 7.5**

### Offline Sync Properties

**Property 42: Offline data accessibility**
*For any* offline device state, users should be able to view cached job listings, attendance records, and payment history.
**Validates: Requirements 8.1**

**Property 43: Offline operation queuing**
*For any* user action performed offline, the operation should be queued locally with conflict resolution metadata (up to queue limit).
**Validates: Requirements 8.2**

**Property 44: Sync on connectivity restoration**
*For any* queued operations when connectivity is restored, the system should synchronize them with the server using optimistic conflict resolution.
**Validates: Requirements 8.3**

**Property 45: Conflict resolution strategy**
*For any* data conflict during sync, the system should prioritize server data for financial records and client data for preferences.
**Validates: Requirements 8.4**

**Property 46: Sync failure notification**
*For any* critical operation that fails to sync, the system should notify the user and provide manual resolution options.
**Validates: Requirements 8.5**

### Accessibility Properties

**Property 47: WCAG AAA contrast compliance**
*For any* UI element in high contrast mode, the color combinations should meet WCAG AAA contrast ratio standards.
**Validates: Requirements 9.1, 9.2**

**Property 48: Outdoor readability optimization**
*For any* text displayed, the fonts and sizes should be optimized for readability in outdoor lighting conditions.
**Validates: Requirements 9.3**

**Property 49: Screen reader and keyboard navigation support**
*For any* navigation action, the interface should support both screen reader compatibility and keyboard navigation.
**Validates: Requirements 9.4**

**Property 50: Alternative content provision**
*For any* visual element conveying information, alternative text descriptions and audio cues should be provided.
**Validates: Requirements 9.5**

### Performance Properties

**Property 51: Initial load time**
*For any* first visit to the platform on 2G/3G/4G/5G connections, the initial interface should load within 3 seconds.
**Validates: Requirements 10.1**

**Property 52: PWA native functionality**
*For any* installed PWA, the system should function as a native app with offline capabilities and push notifications.
**Validates: Requirements 10.2**

**Property 53: Cached content navigation speed**
*For any* navigation between features using cached content, loading times should be under 1 second.
**Validates: Requirements 10.3**

**Property 54: Background update handling**
*For any* app update, the system should download it in the background and prompt users to refresh when ready.
**Validates: Requirements 10.4**

**Property 55: Intelligent cache management**
*For any* low storage scenario, the system should manage cache size by prioritizing essential features and recent data.
**Validates: Requirements 10.5**

### OCR Processing Properties

**Property 56: OCR retry and manual verification**
*For any* OCR extraction that fails or produces unclear results (confidence < 80%), the system should retry, and if still failing, request manual verification.
**Validates: Requirements 11.4**

### Security Properties

**Property 57: Comprehensive data encryption**
*For any* sensitive user data (at rest or in transit), the system should use industry-standard encryption and secure HTTPS connections.
**Validates: Requirements 14.1, 14.2**

**Property 58: Role-based access control enforcement**
*For any* data access attempt, the system should enforce role-based access control ensuring users only access their own data.
**Validates: Requirements 14.3**

**Property 59: Complete data deletion**
*For any* user data deletion request, all personal information should be permanently removed from all systems.
**Validates: Requirements 14.5**

**Property 60: Financial audit trail maintenance**
*For any* financial data processing operation, an audit trail should be created and maintained for compliance.
**Validates: Requirements 14.7**

### Legal Compliance Properties

**Property 61: Minimum wage compliance validation**
*For any* wage data processed, the system should validate compliance with the Minimum Wage Act 1948 for the relevant state and industry.
**Validates: Requirements 15.1**

**Property 62: Labour Act provisions application**
*For any* legal compliance calculation, the system should apply current Labour Act provisions for overtime, holidays, and working hours.
**Validates: Requirements 15.2**

**Property 63: PM Shram Yogi Maandhan eligibility check**
*For any* wage calculation, the system should cross-reference with PM Shram Yogi Maandhan scheme benefits and eligibility.
**Validates: Requirements 15.3**

**Property 64: Violation explanation provision**
*For any* detected wage violation, the system should provide clear explanations of the violation and worker rights.
**Validates: Requirements 15.4**

**Property 65: Multi-employment-type wage calculation**
*For any* wage calculation, the system should correctly handle different employment types (daily wage, contract, permanent, piece-rate).
**Validates: Requirements 15.6**



## Error Handling

### Error Classification

**User Errors** (4xx-equivalent):
- Invalid input data
- Missing required fields
- Authentication failures
- Authorization violations
- Resource not found

**System Errors** (5xx-equivalent):
- Service unavailable
- Database connection failures
- External API failures (E-Shram, AWS services)
- Timeout errors
- Internal server errors

**Network Errors**:
- Connection lost
- Request timeout
- DNS resolution failure
- SSL/TLS errors

### Error Response Format

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: number;
    requestId: string;
    retryable: boolean;
  };
}

// Example error codes
const ErrorCodes = {
  // Authentication
  AUTH_INVALID_OTP: "AUTH_001",
  AUTH_EXPIRED_TOKEN: "AUTH_002",
  AUTH_INSUFFICIENT_PERMISSIONS: "AUTH_003",
  
  // Validation
  VALIDATION_MISSING_FIELD: "VAL_001",
  VALIDATION_INVALID_FORMAT: "VAL_002",
  VALIDATION_CONSTRAINT_VIOLATION: "VAL_003",
  
  // Business Logic
  JOB_ALREADY_FILLED: "BIZ_001",
  INSUFFICIENT_BALANCE: "BIZ_002",
  TOTP_EXPIRED: "BIZ_003",
  
  // External Services
  ESHRAM_SERVICE_UNAVAILABLE: "EXT_001",
  TRANSCRIBE_FAILED: "EXT_002",
  OCR_FAILED: "EXT_003",
  
  // System
  DATABASE_ERROR: "SYS_001",
  INTERNAL_ERROR: "SYS_002",
  RATE_LIMIT_EXCEEDED: "SYS_003"
};
```

### Retry Strategies

**Exponential Backoff**:
```typescript
interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

const retryConfigs: Record<string, RetryConfig> = {
  voiceTranscription: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2
  },
  ocrProcessing: {
    maxRetries: 2,
    initialDelay: 2000,
    maxDelay: 8000,
    backoffMultiplier: 2
  },
  externalAPI: {
    maxRetries: 3,
    initialDelay: 500,
    maxDelay: 5000,
    backoffMultiplier: 2
  }
};
```

**Circuit Breaker Pattern**:
- Open circuit after 5 consecutive failures
- Half-open state after 30 seconds
- Close circuit after 3 successful requests
- Applied to external service calls (E-Shram, AWS services)

### Graceful Degradation

**Voice Assistant Fallback Chain**:
1. Primary: Amazon Transcribe + Lex
2. Fallback 1: Simplified voice commands with keyword matching
3. Fallback 2: Visual prompts with voice recording for later processing
4. Fallback 3: Text input with simplified UI

**OCR Processing Fallback**:
1. Primary: Amazon Textract
2. Fallback 1: Retry with image enhancement
3. Fallback 2: Manual data entry with guided form
4. Fallback 3: Save for later processing when service available

**Geospatial Matching Fallback**:
1. Primary: Amazon Location Service with full routing
2. Fallback 1: Simple distance calculation (haversine formula)
3. Fallback 2: City-based filtering only
4. Fallback 3: Show all jobs with manual filtering

### User-Facing Error Messages

**Localized Error Messages**:
```typescript
const errorMessages = {
  en: {
    AUTH_INVALID_OTP: "The code you entered is incorrect. Please try again.",
    NETWORK_ERROR: "Connection lost. Your changes will be saved and synced when you're back online.",
    OCR_FAILED: "We couldn't read your payslip. Please try taking a clearer photo or enter the details manually."
  },
  hi: {
    AUTH_INVALID_OTP: "आपके द्वारा दर्ज किया गया कोड गलत है। कृपया पुनः प्रयास करें।",
    NETWORK_ERROR: "कनेक्शन टूट गया। आपके बदलाव सहेजे जाएंगे और ऑनलाइन होने पर सिंक हो जाएंगे।",
    OCR_FAILED: "हम आपकी पेस्लिप नहीं पढ़ सके। कृपया स्पष्ट फोटो लें या विवरण मैन्युअल रूप से दर्ज करें।"
  }
};
```

**Voice Error Responses**:
- Spoken error messages in user's language
- Simplified explanations for voice-first users
- Actionable next steps provided verbally

### Monitoring and Alerting

**Error Metrics**:
- Error rate by endpoint
- Error rate by error code
- Failed voice transcriptions
- Failed OCR attempts
- Sync failures
- Authentication failures

**Alerting Thresholds**:
- Critical: Error rate > 5% for 5 minutes
- Warning: Error rate > 2% for 10 minutes
- Info: New error code detected
- Critical: External service unavailable

**Logging Strategy**:
```typescript
interface LogEntry {
  level: "debug" | "info" | "warn" | "error" | "critical";
  timestamp: number;
  requestId: string;
  userId?: string;
  component: string;
  message: string;
  error?: Error;
  metadata?: Record<string, any>;
}
```

## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit tests and property-based tests as complementary approaches:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs
- Together they provide comprehensive coverage: unit tests catch concrete bugs, property tests verify general correctness

### Property-Based Testing

**Framework Selection**:
- **JavaScript/TypeScript**: fast-check
- **Python**: Hypothesis
- **Java**: jqwik

**Configuration**:
- Minimum 100 iterations per property test (due to randomization)
- Each property test must reference its design document property
- Tag format: `Feature: shramik-setu, Property {number}: {property_text}`

**Example Property Test**:
```typescript
import fc from 'fast-check';

// Feature: shramik-setu, Property 24: TOTP generation properties
describe('TOTP Attendance', () => {
  it('should generate 6-digit unique codes valid for 5 minutes', () => {
    fc.assert(
      fc.property(
        fc.record({
          sessionId: fc.uuid(),
          contractorId: fc.uuid(),
          jobId: fc.uuid()
        }),
        (session) => {
          const totp = generateTOTP(session);
          
          // Property assertions
          expect(totp.code).toMatch(/^\d{6}$/); // Exactly 6 digits
          expect(totp.expiresAt - totp.generatedAt).toBe(5 * 60 * 1000); // 5 minutes
          
          // Uniqueness check
          const totp2 = generateTOTP(session);
          expect(totp.code).not.toBe(totp2.code);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Unit Testing

**Focus Areas**:
- Specific examples demonstrating correct behavior
- Edge cases (empty inputs, boundary values, special characters)
- Error conditions and exception handling
- Integration points between components

**Example Unit Test**:
```typescript
describe('E-Khata Ledger', () => {
  it('should reject transactions with negative amounts', async () => {
    const transaction = {
      workerId: 'worker-123',
      contractorId: 'contractor-456',
      type: 'wage',
      amount: -100,
      date: '2024-01-15'
    };
    
    await expect(recordTransaction(transaction))
      .rejects
      .toThrow('Transaction amount must be positive');
  });
  
  it('should handle zero-hour work sessions', async () => {
    const session = {
      sessionId: 'session-789',
      startTime: Date.now(),
      endTime: Date.now() // Same time
    };
    
    const hours = calculateHoursWorked(session);
    expect(hours).toBe(0);
  });
});
```

### Integration Testing

**Test Scenarios**:
1. **End-to-End Job Application Flow**:
   - Worker searches for jobs
   - Worker applies for job
   - Contractor receives notification
   - Contractor accepts application
   - Both parties receive confirmation

2. **Voice-to-Action Flow**:
   - User speaks command
   - System transcribes audio
   - System identifies intent
   - System executes action
   - System provides spoken confirmation

3. **Payslip Processing Flow**:
   - User uploads payslip image
   - OCR extracts text
   - Parser extracts wage data
   - Compliance engine validates
   - Data stored in ledger
   - User receives confirmation

4. **Offline Sync Flow**:
   - User goes offline
   - User performs actions (queued)
   - User comes back online
   - System syncs queued operations
   - Conflicts resolved
   - User notified of sync status

### Test Data Generation

**Generators for Property Tests**:
```typescript
// Location generator
const locationGen = fc.record({
  latitude: fc.double({ min: 8.0, max: 37.0 }), // India bounds
  longitude: fc.double({ min: 68.0, max: 97.0 }),
  city: fc.constantFrom('Mumbai', 'Delhi', 'Bangalore', 'Chennai'),
  state: fc.constantFrom('Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu')
});

// Job generator
const jobGen = fc.record({
  jobId: fc.uuid(),
  title: fc.constantFrom('Construction Worker', 'Painter', 'Electrician'),
  location: locationGen,
  wageRate: fc.integer({ min: 300, max: 1500 }),
  duration: fc.constantFrom('1 day', '1 week', '1 month'),
  skillsRequired: fc.array(fc.constantFrom('painting', 'electrical', 'plumbing'), { minLength: 1, maxLength: 3 })
});

// Transaction generator
const transactionGen = fc.record({
  transactionId: fc.uuid(),
  workerId: fc.uuid(),
  contractorId: fc.uuid(),
  type: fc.constantFrom('wage', 'advance', 'bonus'),
  amount: fc.integer({ min: 100, max: 10000 }),
  date: fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') })
});
```

### Performance Testing

**Load Testing Scenarios**:
- 1000 concurrent voice transcription requests
- 5000 concurrent job searches
- 10000 concurrent attendance markings
- 100 payslip uploads per minute

**Performance Benchmarks**:
- Voice transcription: < 3 seconds for 30-second audio
- Job search: < 500ms for 100 results
- TOTP generation: < 100ms
- OCR processing: < 5 seconds for standard payslip
- Sync operation: < 2 seconds for 100 queued operations

### Security Testing

**Automated Security Tests**:
- SQL injection attempts
- XSS attack vectors
- CSRF token validation
- Rate limiting enforcement
- Authentication bypass attempts
- Authorization boundary tests

**Penetration Testing**:
- Quarterly third-party security audits
- OWASP Top 10 vulnerability scanning
- API security testing
- Mobile app security assessment

### Accessibility Testing

**Automated Accessibility Tests**:
- WCAG AAA compliance checking
- Color contrast validation
- Screen reader compatibility
- Keyboard navigation testing
- Focus management verification

**Manual Accessibility Testing**:
- Real screen reader testing (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation
- High contrast mode verification
- Voice command testing with actual users

### Test Coverage Goals

**Code Coverage Targets**:
- Unit tests: 80% line coverage
- Integration tests: 70% path coverage
- Property tests: 100% of correctness properties
- E2E tests: All critical user journeys

**Requirement Coverage**:
- 100% of testable acceptance criteria
- All 65 correctness properties implemented as property tests
- All error conditions tested
- All edge cases identified and tested

### Continuous Testing

**CI/CD Pipeline**:
1. Pre-commit: Linting, type checking
2. On commit: Unit tests, property tests
3. On PR: Integration tests, security scans
4. Pre-deployment: E2E tests, performance tests
5. Post-deployment: Smoke tests, monitoring

**Test Automation**:
- Automated test execution on every commit
- Parallel test execution for speed
- Flaky test detection and quarantine
- Test result reporting and trending

