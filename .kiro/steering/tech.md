# Technology Stack

## Frontend

- Progressive Web App (PWA) built with React and TypeScript
- Service Worker for offline functionality and caching
- IndexedDB for local data persistence
- Web Audio API for voice recording
- Responsive UI with high contrast mode support

## Backend Services

- AWS Lambda for serverless microservices
- AWS API Gateway for REST endpoints and WebSocket API
- AWS EventBridge for event-driven communication
- AWS Step Functions for complex workflows

## AWS AI/ML Services

- Amazon Transcribe: Speech-to-text (Hindi + regional languages)
- Amazon Polly: Text-to-speech responses
- Amazon Lex or Bedrock: Natural language understanding and dialogue management
- Amazon Textract: OCR for payslip processing
- Amazon Rekognition: Image quality assessment
- Amazon Comprehend: Sentiment analysis for grievances
- Amazon Location Service: Geospatial matching and routing

## Data Layer

- DynamoDB: User profiles, jobs, ratings (high-scale, low-latency)
- PostgreSQL (RDS): Financial ledger (ACID compliance)
- S3: Audio recordings, payslip images, documents
- ElastiCache (Redis): Session management and active TOTP codes

## Security & Compliance

- AWS KMS for encryption at rest
- TLS 1.3 for all API communications
- JWT tokens with 1-hour expiry, refresh tokens with 30-day expiry
- Digital Personal Data Protection Act (DPDPA) 2023 compliance
- E-Shram data handling guidelines

## Testing Framework

- Property-Based Testing: fast-check (JavaScript/TypeScript)
- Unit Testing: Jest or Vitest
- Integration Testing: Custom E2E scenarios
- Minimum 100 iterations per property test

## Common Commands

### Development
```bash
# Install dependencies
npm install

# Start development server (run manually in terminal)
npm run dev

# Run tests
npm test

# Run property-based tests (may take longer)
npm run test:pbt
```

### Build & Deploy
```bash
# Build for production
npm run build

# Deploy to AWS
npm run deploy

# Run linting
npm run lint

# Type checking
npm run type-check
```

### Testing
```bash
# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run property tests
npm run test:property

# Run all tests with coverage
npm run test:coverage
```

## Performance Benchmarks

- Voice transcription: < 3 seconds for 30-second audio
- Job search: < 500ms for 100 results
- TOTP generation: < 100ms
- OCR processing: < 5 seconds for standard payslip
- Initial load: < 3 seconds on 2G/3G/4G/5G
- Cached navigation: < 1 second
