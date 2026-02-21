# API Gateway and Lambda Configuration Guide

## REST API Endpoints

Base URL: `https://api.shramik-setu.com/v1`

### Authentication Endpoints
- `POST /auth/send-otp` - Send OTP to mobile number
- `POST /auth/verify-otp` - Verify OTP code
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/refresh-token` - Refresh JWT token
- `POST /auth/logout` - User logout

### Onboarding Endpoints
- `POST /onboarding/validate-eshram` - Validate E-Shram card
- `POST /onboarding/complete-profile` - Complete user profile

### Voice Assistant Endpoints
- `POST /voice/process-command` - Process voice command
- `POST /voice/synthesize-speech` - Generate speech from text
- `GET /voice/session/{sessionId}` - Get voice session
- `DELETE /voice/session/{sessionId}` - Delete voice session

### Job Marketplace Endpoints
- `GET /jobs/search` - Search for jobs
- `POST /jobs` - Create job posting
- `GET /jobs/{jobId}` - Get job details
- `PUT /jobs/{jobId}` - Update job
- `DELETE /jobs/{jobId}` - Delete job
- `POST /jobs/{jobId}/apply` - Apply for job
- `GET /jobs/{jobId}/applications` - Get job applications
- `PUT /jobs/{jobId}/applications/{applicationId}` - Update application status

### E-Khata Ledger Endpoints
- `POST /ledger/transactions` - Create transaction
- `GET /ledger/transactions` - Get transactions
- `GET /ledger/transactions/{transactionId}` - Get transaction details
- `GET /ledger/balance/{workerId}` - Get worker balance
- `GET /ledger/compliance-check` - Check wage compliance
- `POST /ledger/payslip/upload` - Upload payslip
- `GET /ledger/payslip/{payslipId}` - Get payslip

### Attendance Endpoints
- `POST /attendance/sessions` - Create work session
- `GET /attendance/sessions/{sessionId}` - Get session details
- `POST /attendance/sessions/{sessionId}/generate-totp` - Generate TOTP code
- `POST /attendance/sessions/{sessionId}/mark` - Mark attendance
- `GET /attendance/records` - Get attendance records

### Grievance Endpoints
- `POST /grievances` - Submit grievance
- `GET /grievances` - List grievances
- `GET /grievances/{grievanceId}` - Get grievance details
- `PUT /grievances/{grievanceId}` - Update grievance status

### Rating Endpoints
- `POST /ratings` - Submit rating
- `GET /ratings/{userId}` - Get user ratings
- `GET /ratings/trust-profile/{userId}` - Get trust profile

### Sync Endpoints
- `POST /sync/operations` - Process sync operations
- `GET /sync/status` - Get sync status
- `POST /sync/resolve-conflict` - Resolve sync conflict

## WebSocket API

Connection URL: `wss://ws.shramik-setu.com`

### Routes
- `$connect` - Establish connection
- `$disconnect` - Close connection
- `subscribe` - Subscribe to events
- `unsubscribe` - Unsubscribe from events

### Events
- `job_posted` - New job posted
- `application_status` - Application status changed
- `totp_generated` - TOTP code generated
- `payment_received` - Payment received
- `grievance_update` - Grievance status updated
- `attendance_marked` - Attendance marked

## Lambda Execution Roles

### Base Role
All Lambda functions inherit from `ShramikSetuLambdaExecutionRole` with:
- CloudWatch Logs access
- VPC access (for RDS and Redis)
- X-Ray tracing

### Custom Policies
- **DynamoDB Access**: Read/write to all tables
- **S3 Access**: Read/write to audio and document buckets
- **RDS Access**: Connect to PostgreSQL database
- **ElastiCache Access**: Connect to Redis cluster
- **KMS Access**: Encrypt/decrypt with customer-managed keys
- **AI Services Access**: Use Transcribe, Polly, Lex, Textract, Rekognition, Comprehend, Location Service
- **Secrets Manager Access**: Retrieve secrets
- **SNS/SES Access**: Send notifications
- **EventBridge Access**: Publish events
- **API Gateway Management**: Manage WebSocket connections

## Rate Limiting

- General: 1000 requests/second
- OTP generation: 10 requests/minute
- Voice processing: 5 requests/minute

## Authentication

All endpoints (except auth endpoints) require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Error Responses

Standard error format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {},
    "timestamp": 1234567890,
    "requestId": "uuid",
    "retryable": false
  }
}
```
