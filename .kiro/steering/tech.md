# Technology Stack

## Frontend

- React 19 with JavaScript (JSDoc for type hints)
- Vite for fast development and building
- PWA with Service Worker support (vite-plugin-pwa)
- Web Audio API for voice recording
- IndexedDB for offline storage
- React Compiler (babel-plugin-react-compiler)

## Backend (AWS Ready)

- AWS Lambda for serverless microservices
- DynamoDB for high-scale data
- PostgreSQL (RDS) for financial ledger
- S3 for file storage
- ElastiCache (Redis) for sessions
- API Gateway for REST endpoints

## AI/ML Services (AWS)

- Amazon Transcribe - Speech-to-text
- Amazon Polly - Text-to-speech
- Amazon Lex/Bedrock - Natural language understanding
- Amazon Textract - OCR processing
- Amazon Comprehend - Sentiment analysis
- Amazon Location Service - Geospatial matching

## Build System

- Package Manager: npm
- Bundler: Vite 5.4+
- Linter: ESLint 9 with flat config
- Testing: Vitest with fast-check for property-based testing

## Common Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:5173)
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm run test             # Run all tests
npm run test:unit        # Run unit tests
npm run test:property    # Run property-based tests
npm run test:integration # Run integration tests
npm run test:coverage    # Run tests with coverage

# Code Quality
npm run lint             # Run ESLint

# Infrastructure (CDK)
cd infrastructure
npm run build            # Compile TypeScript
npm run deploy           # Deploy to AWS
npm run diff             # Show deployment diff
npm run synth            # Synthesize CloudFormation
npm run destroy          # Destroy stack
```

## Path Aliases

Vite is configured with path aliases for cleaner imports:

- `@` → `./src`
- `@components` → `./src/components`
- `@services` → `./src/services`
- `@hooks` → `./src/hooks`
- `@utils` → `./src/utils`
- `@store` → `./src/store`

## Environment Variables

- `VITE_API_BASE_URL` - API base URL (default: http://localhost:3000/api/v1)

## Browser Support

Targets modern browsers with ES2020 support. PWA features require HTTPS in production.
