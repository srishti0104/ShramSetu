# 🛠️ Shram-Setu

**श्रम सेतु** - A voice-first Progressive Web Application empowering India's blue-collar workforce through accessible technology.

![Shram-Setu](https://img.shields.io/badge/Status-Production-green)
![React](https://img.shields.io/badge/React-19-blue)
![PWA](https://img.shields.io/badge/PWA-Ready-green)
![AWS](https://img.shields.io/badge/AWS-Deployed-orange)
![License](https://img.shields.io/badge/License-MIT-yellow)

**🌐 Live Demo:** [https://main.dzsokk69d2hk5.amplifyapp.com](https://main.dzsokk69d2hk5.amplifyapp.com)

## 🌟 Overview

Shram-Setu addresses critical challenges faced by daily wage workers and contractors in India: job discovery, wage compliance, attendance tracking, and labor rights enforcement through a voice-first, offline-capable platform.

## 🎯 Target Users

- **Workers**: Daily wage laborers, construction workers, domestic workers with varying literacy levels
- **Contractors**: Small business owners, construction contractors, job providers  
- **Support Organizations**: NGOs, legal aid organizations monitoring labor rights

## ✨ Core Features

### 🎤 Voice-First Interface
Multi-language voice commands supporting Hindi, English, Tamil, Telugu, Bengali, Marathi, Gujarati, and Punjabi
- **Technologies**: Web Speech API, Amazon Transcribe, Amazon Polly
- **Components**: `src/components/voice/VoiceRecorder.jsx`, `src/components/ai/AIAssistant.jsx`
- **Services**: `src/services/aws/transcribeService.js`, `src/services/aws/pollyService.js`

### 📍 Job Marketplace
Geospatial job matching with distance calculation and filtering
- **Technologies**: Amazon Location Service, DynamoDB, AWS Lambda
- **Components**: `src/components/jobs/JobSearch.jsx`, `src/components/jobs/JobCard.jsx`
- **Services**: `src/services/aws/locationService.js`
- **Backend**: `lambda/jobs/get-jobs.js`, `lambda/jobs/get-contractor-jobs.js`

### 💰 E-Khata Ledger
Digital wage tracking with transaction history and compliance checking
- **Technologies**: DynamoDB, AWS Lambda
- **Components**: `src/components/ledger/LedgerView.jsx`
- **Backend**: `lambda/ledger/` (transaction management)

### 🔢 TOTP Attendance
Secure attendance verification with cryptographic audit trails
- **Technologies**: TOTP Algorithm, DynamoDB
- **Components**: `src/components/attendance/AttendanceMarker.jsx`
- **Services**: `src/services/totp-attendance/totpService.js`
- **Backend**: `lambda/attendance/` (verification and storage)

### 📄 Payslip Auditor
OCR-powered payslip processing with Minimum Wage Act validation
- **Technologies**: Amazon Textract, AWS Lambda
- **Components**: `src/components/payslip/PayslipAuditor.jsx`
- **Services**: `src/services/aws/textractService.js`
- **Backend**: `lambda-textract/extract-payslip.js`

### 🛡️ Suraksha Grievance
Voice-based safety reporting with AI-powered sentiment analysis and triage
- **Technologies**: Amazon Comprehend, Amazon Bedrock, DynamoDB
- **Components**: `src/components/grievance/GrievanceForm.jsx`
- **Services**: `src/services/aws/comprehendService.js`, `src/services/aws/bedrockService.js`
- **Backend**: `lambda/grievances/` (submission and analysis)

### ⭐ Trust Tier System
Dual rating system with tier-based prioritization for workers and contractors
- **Technologies**: DynamoDB, AWS Lambda
- **Components**: `src/components/ratings/RatingSystem.jsx`
- **Backend**: `lambda/ratings/` (rating management)

### 🤖 AI Assistant
Intelligent conversational assistant with agentic mode and context awareness
- **Technologies**: Google Gemini 2.0 Flash-Lite, Groq AI (Llama 3.3 70B), Amazon Polly
- **Components**: `src/components/ai/AIAssistant.jsx`, `src/components/ai/FloatingAIButton.jsx`
- **Services**: `src/services/ai/geminiService.js`, `src/services/ai/groqService.js`

### 📱 Offline-First Architecture
Works without internet with automatic delta sync
- **Technologies**: IndexedDB, Service Workers, PWA
- **Components**: `src/components/sync/SyncManager.jsx`
- **Services**: `src/services/deltaSyncService.js`
- **Hooks**: `src/hooks/useDeltaSync.js`, `src/hooks/useOfflineDetection.js`

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- AWS Account (for deployment)
- API Keys:
  - Google Gemini API key
  - Groq API key (optional)
  - AWS credentials

### Installation

```bash
# Clone the repository
git clone https://github.com/srishti0104/ShramSetu.git
cd ShramSetu/prototype

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your API keys:
# VITE_GEMINI_API_KEY=your_gemini_key
# VITE_GROQ_API_KEY=your_groq_key
# VITE_AWS_REGION=ap-south-1
# VITE_S3_BUCKET_NAME=your_bucket_name

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app locally, or visit the deployed version at [https://main.dzsokk69d2hk5.amplifyapp.com](https://main.dzsokk69d2hk5.amplifyapp.com).

### Environment Configuration

Create a `.env` file in the `prototype` directory with the following variables:

```bash
# AWS Configuration
VITE_AWS_REGION=ap-south-1

# Authentication
VITE_AUTH_API_URL=https://your-auth-api.execute-api.ap-south-1.amazonaws.com/prod
VITE_USE_MOCK_AUTH=true  # Set to 'false' for real AWS authentication

# AI Services
VITE_BEDROCK_API_URL=https://your-bedrock-api.execute-api.ap-south-1.amazonaws.com/prod
VITE_TRANSCRIBE_API_URL=https://your-transcribe-api.execute-api.ap-south-1.amazonaws.com/prod
VITE_TEXTRACT_API_URL=https://your-textract-api.execute-api.ap-south-1.amazonaws.com/prod

# Other Services
VITE_RATINGS_API_URL=https://your-ratings-api.execute-api.ap-south-1.amazonaws.com/prod
VITE_GRIEVANCE_API_URL=https://your-grievance-api.execute-api.ap-south-1.amazonaws.com/prod
VITE_SYNC_API_URL=https://your-sync-api.execute-api.ap-south-1.amazonaws.com/prod

# Storage
VITE_S3_BUCKET_NAME=your-bucket-name

# Optional: Fallback AI Services
VITE_GROQ_API_KEY=your-groq-api-key
VITE_GEMINI_API_KEY=your-gemini-api-key
```

**Important Notes:**
- Set `VITE_USE_MOCK_AUTH=true` for local development without AWS
- Mock mode uses OTP `123456` for testing
- All API URLs must use HTTPS in production
- See `.env.example` for complete configuration

**⚠️ Security Warning:**
- NEVER commit your `.env` file to GitHub
- NEVER commit real AWS credentials, API keys, or bucket names
- Always use placeholder values in README examples
- Keep your `.env` file in `.gitignore`

### Environment Variables

Create a `.env` file in the `prototype/` directory:

```bash
# AI Services
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_GROQ_API_KEY=your_groq_api_key_here

# AWS Configuration
VITE_AWS_REGION=ap-south-1
VITE_AWS_ACCESS_KEY_ID=your_access_key
VITE_AWS_SECRET_ACCESS_KEY=your_secret_key

# AWS Service Endpoints
VITE_S3_BUCKET_NAME=your-bucket-name
VITE_TEXTRACT_API_URL=https://your-textract-api.amazonaws.com/prod
VITE_TRANSCRIBE_API_URL=https://your-transcribe-api.amazonaws.com/prod
VITE_AUTH_API_URL=https://your-auth-api.amazonaws.com/prod
VITE_JOBS_API_URL=https://your-jobs-api.amazonaws.com/prod
VITE_RATINGS_API_URL=https://your-ratings-api.amazonaws.com/prod
```

**⚠️ Security Warning:**
- NEVER commit your `.env` file to GitHub
- NEVER commit real AWS credentials, API keys, or bucket names to README
- Always use placeholder values (like `your-bucket-name`, `your-api-key`) in documentation
- Keep your `.env` file in `.gitignore`
- Real credentials should only exist in your local `.env` file and AWS Secrets Manager

## 🏗️ Tech Stack & Architecture

### Frontend Technologies

#### Core Framework
- **React 19.2.0** - UI framework with React Compiler for optimization
  - Location: `src/components/`, `src/pages/`
  - Entry: `src/main.jsx`, `src/App.jsx`
  
- **Vite 5.4.11** - Build tool and development server
  - Config: `vite.config.js`
  - Fast HMR and optimized production builds

#### Progressive Web App (PWA)
- **vite-plugin-pwa 0.17.5** - PWA capabilities
  - Service Worker: Auto-generated by Vite PWA plugin
  - Manifest: `public/manifest.json`
  - Offline support with Workbox 7.0.0

#### Internationalization (i18n)
- **i18next 25.8.14** & **react-i18next 16.5.5**
  - Location: `src/locales/` (8 languages: hi, en, ta, te, bn, mr, gu, pa)
  - Config: `src/utils/i18n.js`
  - Components: `src/components/LanguageSwitcher.jsx`
  - Context: `src/contexts/LanguageContext.jsx`

#### State Management & Routing
- **React Context API**
  - Auth: `src/contexts/AuthContext.jsx`
  - Language: `src/contexts/LanguageContext.jsx`
  - User Profile: `src/contexts/UserProfileContext.jsx`
  - Onboarding: `src/contexts/OnboardingContext.jsx`

#### Custom Hooks
- `src/hooks/useAuth.js` - Authentication state
- `src/hooks/useDeltaSync.js` - Offline sync management
- `src/hooks/useOfflineDetection.js` - Network status
- `src/hooks/useVoiceCommand.js` - Voice command processing
- `src/hooks/useVoiceNarration.js` - Text-to-speech narration
- `src/hooks/useVoiceSession.js` - Voice session management

### AWS Services (Backend)

#### AI/ML Services

**1. Amazon Transcribe** - Speech-to-Text
- **Purpose**: Convert voice recordings to text in 6 Indian languages
- **Languages**: Hindi, English, Tamil, Telugu, Marathi, Bengali
- **Service**: `src/services/aws/transcribeService.js`
- **Used in**: Voice Recorder (`src/components/voice/VoiceRecorder.jsx`)
- **Lambda**: `lambda-transcribe/` (processing pipeline)
- **Features**: Automatic language detection, confidence scoring

**2. Amazon Polly** - Text-to-Speech
- **Purpose**: Convert text responses to natural speech
- **Voices**: Aditi (Hindi), Kajal (English-India)
- **Service**: `src/services/aws/pollyService.js`
- **Used in**: AI Assistant (`src/components/ai/AIAssistant.jsx`)
- **Features**: Neural engine for natural voice, audio caching

**3. Amazon Textract** - Document OCR
- **Purpose**: Extract text from payslip images
- **Service**: `src/services/aws/textractService.js`
- **Used in**: Payslip Auditor (`src/components/payslip/PayslipAuditor.jsx`)
- **Lambda**: `lambda-textract/extract-payslip.js`
- **Features**: Table detection, key-value pair extraction, wage compliance validation

**4. Amazon Comprehend** - NLP & Sentiment Analysis
- **Purpose**: Analyze grievance sentiment and urgency
- **Service**: `src/services/aws/comprehendService.js`
- **Used in**: Grievance Form (`src/components/grievance/GrievanceForm.jsx`)
- **Features**: Sentiment detection (POSITIVE/NEGATIVE/NEUTRAL/MIXED), entity extraction, urgency scoring

**5. Amazon Bedrock** - Advanced AI
- **Purpose**: Intelligent conversational AI for complex queries
- **Service**: `src/services/aws/bedrockService.js`
- **Used in**: AI Assistant (fallback for complex queries)
- **Lambda**: `lambda-bedrock/` (AI processing)

**6. Amazon Location Service** - Geospatial
- **Purpose**: Job search by location, distance calculation
- **Service**: `src/services/aws/locationService.js`
- **Used in**: Job Search (`src/components/jobs/JobSearch.jsx`)
- **Features**: Place search, route calculation, radius-based job filtering
- **Infrastructure**: `infrastructure/lib/location-stack.ts`

#### Storage & Database

**1. Amazon S3** - File Storage
- **Purpose**: Store audio recordings, payslip images, documents
- **Service**: `src/services/aws/s3Service.js`
- **Bucket**: `your-bucket-name`
- **Features**: Signed URLs, automatic lifecycle (90-day deletion)
- **Infrastructure**: `infrastructure/lib/s3-stack.ts`

**2. Amazon DynamoDB** - NoSQL Database
- **Tables**:
  - `ShramSetu-Jobs` - Job postings
  - `ShramSetu-Ratings` - Worker/contractor ratings
  - `ShramSetu-JobApplications` - Application tracking
  - `ShramSetu-Grievances` - Complaint records
  - `ShramSetu-Attendance` - TOTP attendance logs
  - `ShramSetu-Ledger` - Transaction history
- **Services**: 
  - `src/services/aws/jobApplicationsService.js`
  - `src/services/aws/applicationService.js`
- **Lambda Functions**: `lambda/jobs/`, `lambda/ratings/`, `lambda/grievances/`, `lambda/attendance/`

#### Serverless Compute

**AWS Lambda Functions**
- **Authentication**: `lambda/auth/` - OTP generation, user verification
  - Service: `src/services/aws/authService.js`
  - Used in: `src/components/auth/` (Login, Signup)
  
- **Jobs Management**: `lambda/jobs/`
  - `get-jobs.js` - Fetch available jobs
  - `get-contractor-jobs.js` - Contractor-specific jobs
  - `create-job.js` - Post new jobs
  
- **Ratings**: `lambda/ratings/`
  - `get-ratings.js` - Fetch ratings
  - `submit-rating.js` - Submit new ratings
  
- **Grievances**: `lambda/grievances/`
  - `submit-grievance.js` - File complaints
  - `analyze-grievance.js` - AI-powered analysis
  
- **Attendance**: `lambda/attendance/`
  - `mark-attendance.js` - TOTP verification
  - `get-attendance.js` - Attendance history

#### Infrastructure as Code

**AWS CDK (TypeScript)**
- **Location**: `infrastructure/`
- **Stacks**:
  - `cdk-auth-app.ts` - Authentication infrastructure
  - `cdk-jobs-app.ts` - Jobs management
  - `cdk-ratings-app.ts` - Rating system
  - `cdk-grievance-app.ts` - Grievance handling
  - `cdk-services-app.ts` - S3 & Location Service
  - `cdk-bedrock-app.ts` - AI services
  - `cdk-textract-app.ts` - Document processing
  - `cdk-job-applications-app.ts` - Application tracking

### Third-Party AI Services

**1. Google Gemini 2.0 Flash-Lite** (Primary AI)
- **Purpose**: Conversational AI assistant
- **Service**: `src/services/ai/geminiService.js`
- **Used in**: AI Assistant (`src/components/ai/AIAssistant.jsx`)
- **Features**: Multilingual support, 15 requests/min free tier
- **Model**: `gemini-2.0-flash-lite`

**2. Groq AI** (Backup AI)
- **Purpose**: Fast AI responses (<1 second)
- **Service**: `src/services/ai/groqService.js`
- **Used in**: AI Assistant (alternative provider)
- **Model**: Llama 3.3 70B
- **Features**: 30 requests/min free tier

**3. Translation Service**
- **Service**: `src/services/ai/translationService.js`
- **Purpose**: Translate between Indian languages
- **Used in**: Voice commands, job postings

### Deployment & Hosting

**AWS Amplify**
- **Purpose**: Frontend hosting and CI/CD
- **Config**: `amplify.yml`
- **Features**: Automatic builds from GitHub, environment variables
- **Build**: `npm run build` → `dist/` directory

### Development Tools

**Testing**
- **Vitest 1.0.4** - Unit and integration testing
  - Config: `vitest.config.js`, `vitest.property.config.js`, `vitest.integration.config.js`
  - Scripts: `npm run test`, `npm run test:unit`, `npm run test:property`
  
- **fast-check 3.15.0** - Property-based testing
  - Used for: TOTP algorithm verification, data validation

**Code Quality**
- **ESLint 9.39.1** - Linting
  - Config: `eslint.config.js`
  - Plugins: react-hooks, react-refresh
  
- **Babel React Compiler 1.0.0** - React optimization

**Local Development Servers**
- `local-textract-server.js` - Mock Textract API
- `local-transcribe-server.js` - Mock Transcribe API
- `local-bedrock-server.cjs` - Mock Bedrock API
- `mock-ratings-server.cjs` - Mock Ratings API
- `jobs-server.cjs` - Mock Jobs API

### Browser APIs

**Web Speech API**
- **Purpose**: Voice recognition and synthesis (fallback)
- **Used in**: `src/components/voice/VoiceRecorder.jsx`
- **Features**: Real-time speech recognition, Hindi language support

**IndexedDB**
- **Purpose**: Offline data storage
- **Used in**: Delta sync service (`src/services/deltaSyncService.js`)
- **Features**: Store jobs, transactions, attendance offline

**Service Workers**
- **Purpose**: Offline functionality, background sync
- **Generated by**: vite-plugin-pwa
- **Features**: Cache-first strategy, offline page serving

## 📁 Project Structure

```
ShramSetu/
├── prototype/                          # Main application directory
│   ├── src/                           # Source code
│   │   ├── components/                # React components
│   │   │   ├── ai/                   # AI Assistant components
│   │   │   │   ├── AIAssistant.jsx   # Main AI chat (Gemini/Groq + Polly)
│   │   │   │   └── FloatingAIButton.jsx # Floating AI button
│   │   │   ├── voice/                # Voice interface
│   │   │   │   └── VoiceRecorder.jsx # Audio recording (Transcribe)
│   │   │   ├── jobs/                 # Job marketplace
│   │   │   │   ├── JobSearch.jsx     # Job search (Location Service)
│   │   │   │   └── JobCard.jsx       # Job display
│   │   │   ├── ledger/               # E-Khata ledger
│   │   │   │   └── LedgerView.jsx    # Transaction history (DynamoDB)
│   │   │   ├── attendance/           # TOTP attendance
│   │   │   │   └── AttendanceMarker.jsx # Attendance marking (TOTP)
│   │   │   ├── grievance/            # Suraksha grievance
│   │   │   │   └── GrievanceForm.jsx # Complaint filing (Comprehend)
│   │   │   ├── ratings/              # Trust tier system
│   │   │   │   └── RatingSystem.jsx  # Rating management (DynamoDB)
│   │   │   ├── payslip/              # Payslip auditor
│   │   │   │   └── PayslipAuditor.jsx # OCR processing (Textract)
│   │   │   ├── sync/                 # Offline sync
│   │   │   │   └── SyncManager.jsx   # Delta sync (IndexedDB)
│   │   │   ├── auth/                 # Authentication
│   │   │   ├── dashboard/            # Dashboard views
│   │   │   └── common/               # Shared components
│   │   │
│   │   ├── services/                 # Service layer
│   │   │   ├── aws/                  # AWS service integrations
│   │   │   │   ├── transcribeService.js    # Amazon Transcribe
│   │   │   │   ├── pollyService.js         # Amazon Polly
│   │   │   │   ├── textractService.js      # Amazon Textract
│   │   │   │   ├── comprehendService.js    # Amazon Comprehend
│   │   │   │   ├── bedrockService.js       # Amazon Bedrock
│   │   │   │   ├── locationService.js      # Amazon Location
│   │   │   │   ├── s3Service.js            # Amazon S3
│   │   │   │   ├── authService.js          # Auth Lambda
│   │   │   │   ├── jobApplicationsService.js # Jobs Lambda
│   │   │   │   └── applicationService.js   # Applications Lambda
│   │   │   ├── ai/                   # Third-party AI services
│   │   │   │   ├── geminiService.js        # Google Gemini
│   │   │   │   ├── groqService.js          # Groq AI
│   │   │   │   └── translationService.js   # Translation
│   │   │   ├── totp-attendance/      # TOTP algorithm
│   │   │   ├── voice/                # Voice processing
│   │   │   └── deltaSyncService.js   # Offline sync logic
│   │   │
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useAuth.js            # Authentication
│   │   │   ├── useDeltaSync.js       # Offline sync
│   │   │   ├── useOfflineDetection.js # Network status
│   │   │   ├── useVoiceCommand.js    # Voice commands
│   │   │   ├── useVoiceNarration.js  # TTS narration
│   │   │   └── useVoiceSession.js    # Voice sessions
│   │   │
│   │   ├── contexts/                 # React contexts
│   │   │   ├── AuthContext.jsx       # Auth state
│   │   │   ├── LanguageContext.jsx   # i18n state
│   │   │   ├── UserProfileContext.jsx # User data
│   │   │   └── OnboardingContext.jsx # Onboarding flow
│   │   │
│   │   ├── locales/                  # i18n translations
│   │   │   ├── hi/                   # Hindi
│   │   │   ├── en/                   # English
│   │   │   ├── ta/                   # Tamil
│   │   │   ├── te/                   # Telugu
│   │   │   ├── bn/                   # Bengali
│   │   │   ├── mr/                   # Marathi
│   │   │   ├── gu/                   # Gujarati
│   │   │   └── pa/                   # Punjabi
│   │   │
│   │   ├── utils/                    # Utility functions
│   │   ├── types/                    # Type definitions
│   │   ├── config/                   # Configuration
│   │   │   └── aws-config.js         # AWS SDK config
│   │   └── main.jsx                  # App entry point
│   │
│   ├── lambda/                       # AWS Lambda functions
│   │   ├── auth/                     # Authentication
│   │   │   ├── generate-otp.js       # OTP generation
│   │   │   └── verify-otp.js         # OTP verification
│   │   ├── jobs/                     # Job management
│   │   │   ├── get-jobs.js           # Fetch jobs
│   │   │   ├── get-contractor-jobs.js # Contractor jobs
│   │   │   └── create-job.js         # Post jobs
│   │   ├── ratings/                  # Rating system
│   │   │   ├── get-ratings.js        # Fetch ratings
│   │   │   └── submit-rating.js      # Submit ratings
│   │   ├── grievances/               # Grievance handling
│   │   │   ├── submit-grievance.js   # File complaints
│   │   │   └── analyze-grievance.js  # AI analysis
│   │   ├── attendance/               # Attendance tracking
│   │   │   ├── mark-attendance.js    # TOTP verification
│   │   │   └── get-attendance.js     # History
│   │   └── job-applications/         # Application tracking
│   │
│   ├── lambda-textract/              # Textract Lambda
│   │   └── extract-payslip.js        # Payslip OCR
│   │
│   ├── lambda-transcribe/            # Transcribe Lambda
│   │   └── process-audio.js          # Audio processing
│   │
│   ├── lambda-bedrock/               # Bedrock Lambda
│   │   └── ai-query.js               # AI processing
│   │
│   ├── infrastructure/               # AWS CDK (IaC)
│   │   ├── lib/                      # CDK stacks
│   │   │   ├── s3-stack.ts           # S3 bucket
│   │   │   ├── location-stack.ts     # Location Service
│   │   │   └── ...                   # Other stacks
│   │   ├── cdk-auth-app.ts           # Auth stack
│   │   ├── cdk-jobs-app.ts           # Jobs stack
│   │   ├── cdk-ratings-app.ts        # Ratings stack
│   │   ├── cdk-grievance-app.ts      # Grievance stack
│   │   ├── cdk-services-app.ts       # S3 & Location
│   │   ├── cdk-bedrock-app.ts        # AI services
│   │   └── cdk-textract-app.ts       # Textract
│   │
│   ├── public/                       # Static assets
│   │   ├── manifest.json             # PWA manifest
│   │   └── icons/                    # App icons
│   │
│   ├── vite.config.js                # Vite configuration
│   ├── amplify.yml                   # AWS Amplify config
│   ├── package.json                  # Dependencies
│   └── .env                          # Environment variables
│
├── requirements.md                   # Project requirements
├── design.md                         # Design document
├── tasks.md                          # Implementation tasks
└── README.md                         # This file
```

## 🎨 Design Principles

1. **Voice-First Architecture** 
   - All features accessible through natural language
   - Technologies: Web Speech API, Amazon Transcribe, Amazon Polly
   - Components: VoiceRecorder, AIAssistant
   
2. **Offline-First Design** 
   - Essential functionality without internet
   - Technologies: IndexedDB, Service Workers, PWA
   - Services: deltaSyncService, useDeltaSync hook
   
3. **Accessibility by Default** 
   - High contrast UI, screen reader support
   - Technologies: i18next (8 languages), voice narration
   - Components: LanguageSwitcher, useVoiceNarration
   
4. **Privacy & Security** 
   - End-to-end encryption, Indian regulation compliance
   - Technologies: TOTP algorithm, AWS IAM, DynamoDB encryption
   - Services: TOTP attendance, secure Lambda functions
   
5. **Progressive Enhancement** 
   - Works on basic smartphones
   - Technologies: PWA, responsive design, fallback mechanisms
   - Features: Web Speech API fallback, offline mode

## 🔐 Security Features

- **TOTP Attendance**: Cryptographic time-based one-time passwords
- **AWS IAM**: Role-based access control for all services
- **DynamoDB Encryption**: At-rest encryption for all data
- **S3 Signed URLs**: Temporary access to uploaded files
- **Lambda Authorization**: API Gateway with IAM authentication
- **HTTPS Only**: All communications encrypted in transit
- **DPDPA 2023 Compliance**: Indian data protection regulations

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start Vite development server (http://localhost:5173)
npm run build        # Build for production (outputs to dist/)
npm run preview      # Preview production build locally
npm run lint         # Run ESLint for code quality

# Testing
npm run test         # Run all tests with Vitest
npm run test:unit    # Run unit tests only
npm run test:property # Run property-based tests (fast-check)
npm run test:integration # Run integration tests
npm run test:coverage # Generate test coverage report

# Local Mock Servers (for development without AWS)
npm run textract-server    # Mock Textract API (port 3001)
npm run transcribe-server  # Mock Transcribe API (port 3002)
npm run bedrock-server     # Mock Bedrock API (port 3003)
npm run ratings-server     # Mock Ratings API (port 3004)
npm run jobs-server        # Mock Jobs API (port 3005)

# AWS Deployment (from infrastructure/ directory)
cd infrastructure
npm run build              # Compile TypeScript CDK code
npm run deploy:auth        # Deploy authentication stack
npm run deploy:jobs        # Deploy jobs management stack
npm run deploy:ratings     # Deploy ratings system stack
npm run deploy:grievance   # Deploy grievance handling stack
npm run deploy:services    # Deploy S3 & Location Service
npm run deploy:textract    # Deploy Textract processing
npm run deploy:bedrock     # Deploy AI services
```

## 🌐 Current Status

**✅ Production Deployed** - All core features implemented and deployed on AWS
- Fully functional PWA with offline support
- Voice interface with AWS Transcribe & Polly
- AI Assistant with Gemini 2.0 Flash-Lite & Groq
- Complete job marketplace with Location Service
- Digital ledger with DynamoDB
- TOTP attendance system
- Payslip OCR with Textract
- Grievance system with Comprehend sentiment analysis
- Rating system with DynamoDB
- Offline sync with IndexedDB

**🚀 Deployed AWS Services**
- ✅ Amazon Transcribe (Speech-to-Text)
- ✅ Amazon Polly (Text-to-Speech)
- ✅ Amazon Textract (Document OCR)
- ✅ Amazon Comprehend (Sentiment Analysis)
- ✅ Amazon Bedrock (Advanced AI)
- ✅ Amazon Location Service (Geospatial)
- ✅ Amazon S3 (File Storage)
- ✅ Amazon DynamoDB (Database)
- ✅ AWS Lambda (Serverless Functions)
- ✅ AWS Amplify (Frontend Hosting)

**📊 Cost Estimate**
Within AWS Free Tier for moderate usage:
- S3: ₹0-10/month
- Transcribe: ₹0-50/month
- Comprehend: ₹0 (within free tier)
- Location Service: ₹0 (within free tier)
- Polly: ₹0-20/month
- Lambda: ₹0 (within free tier)
- DynamoDB: ₹0 (within free tier)
- Amplify: ₹0 (within free tier)
- **Total: ₹0-80/month** for testing/small scale

## 🚀 Deployment Guide

### Frontend Deployment (AWS Amplify)

1. **Connect GitHub Repository**
   ```bash
   # Push code to GitHub
   git push origin main
   ```

2. **Configure Amplify**
   - Go to AWS Amplify Console
   - Connect your GitHub repository
   - Select branch: `work3` or `main`
   - Build settings are in `amplify.yml`

3. **Set Environment Variables**
   In Amplify Console, add:
   - `VITE_GEMINI_API_KEY`
   - `VITE_GROQ_API_KEY`
   - `VITE_AWS_REGION`
   - All AWS service endpoint URLs

4. **Deploy**
   - Amplify will automatically build and deploy
   - Access your app at: `https://your-app.amplifyapp.com`

### Backend Deployment (AWS CDK)

1. **Install AWS CDK**
   ```bash
   npm install -g aws-cdk
   ```

2. **Configure AWS Credentials**
   ```bash
   aws configure
   # Enter your AWS Access Key ID
   # Enter your AWS Secret Access Key
   # Default region: ap-south-1
   ```

3. **Deploy Infrastructure**
   ```bash
   cd infrastructure
   npm install
   npm run build
   
   # Deploy all services
   npm run deploy:auth
   npm run deploy:jobs
   npm run deploy:ratings
   npm run deploy:grievance
   npm run deploy:services
   npm run deploy:textract
   npm run deploy:bedrock
   ```

4. **Update Frontend Environment Variables**
   After deployment, CDK will output API endpoints. Update your `.env` file with these URLs.

### Database Setup (DynamoDB)

Tables are automatically created by CDK stacks:
- `ShramSetu-Jobs`
- `ShramSetu-Ratings`
- `ShramSetu-JobApplications`
- `ShramSetu-Grievances`
- `ShramSetu-Attendance`
- `ShramSetu-Ledger`

### Monitoring & Logs

- **CloudWatch Logs**: Monitor Lambda function logs
- **Amplify Console**: View build and deployment logs
- **DynamoDB Console**: Monitor table metrics
- **S3 Console**: View uploaded files

## 📊 Technology Usage Map

### Feature → Technology Mapping

| Feature | Frontend Tech | AWS Services | Third-Party | Components | Services |
|---------|--------------|--------------|-------------|------------|----------|
| **Voice Input** | Web Speech API | Amazon Transcribe | - | VoiceRecorder.jsx | transcribeService.js |
| **Voice Output** | Web Speech API | Amazon Polly | - | AIAssistant.jsx | pollyService.js |
| **AI Assistant** | React 19 | Amazon Bedrock | Gemini, Groq | AIAssistant.jsx, FloatingAIButton.jsx | geminiService.js, groqService.js, bedrockService.js |
| **Job Search** | React 19 | DynamoDB, Location Service, Lambda | - | JobSearch.jsx, JobCard.jsx | locationService.js, jobApplicationsService.js |
| **Payslip OCR** | React 19 | Textract, S3, Lambda | - | PayslipAuditor.jsx | textractService.js, s3Service.js |
| **Grievance** | React 19 | Comprehend, DynamoDB, Lambda | - | GrievanceForm.jsx | comprehendService.js |
| **Attendance** | React 19 | DynamoDB, Lambda | - | AttendanceMarker.jsx | totpService.js |
| **Ratings** | React 19 | DynamoDB, Lambda | - | RatingSystem.jsx | applicationService.js |
| **Ledger** | React 19 | DynamoDB, Lambda | - | LedgerView.jsx | - |
| **Offline Sync** | IndexedDB, Service Workers | - | - | SyncManager.jsx | deltaSyncService.js |
| **i18n** | i18next, react-i18next | - | - | LanguageSwitcher.jsx | i18n.js |
| **Auth** | React Context | Lambda, DynamoDB | - | Login.jsx, Signup.jsx | authService.js |

### AWS Service → Usage Mapping

| AWS Service | Purpose | Used In | Lambda Functions | Frontend Service |
|-------------|---------|---------|------------------|------------------|
| **Transcribe** | Speech-to-text | Voice commands, job posting | lambda-transcribe/ | transcribeService.js |
| **Polly** | Text-to-speech | AI responses, narration | - | pollyService.js |
| **Textract** | Document OCR | Payslip extraction | lambda-textract/extract-payslip.js | textractService.js |
| **Comprehend** | Sentiment analysis | Grievance triage | lambda/grievances/analyze-grievance.js | comprehendService.js |
| **Bedrock** | Advanced AI | Complex queries | lambda-bedrock/ai-query.js | bedrockService.js |
| **Location** | Geospatial | Job distance calculation | - | locationService.js |
| **S3** | File storage | Audio, images, documents | - | s3Service.js |
| **DynamoDB** | Database | All data storage | All lambda functions | Multiple services |
| **Lambda** | Serverless compute | All backend logic | lambda/* | All AWS services |
| **Amplify** | Hosting & CI/CD | Frontend deployment | - | - |

### Component → Service → AWS Mapping

```
VoiceRecorder.jsx
  └─> transcribeService.js
      └─> Amazon Transcribe API
      └─> s3Service.js → Amazon S3

AIAssistant.jsx
  ├─> geminiService.js → Google Gemini API
  ├─> groqService.js → Groq API
  └─> pollyService.js → Amazon Polly

PayslipAuditor.jsx
  └─> textractService.js
      └─> Lambda (extract-payslip.js)
          └─> Amazon Textract
          └─> Amazon S3

GrievanceForm.jsx
  └─> comprehendService.js
      └─> Amazon Comprehend
      └─> Lambda (analyze-grievance.js)
          └─> DynamoDB

JobSearch.jsx
  ├─> locationService.js → Amazon Location Service
  └─> jobApplicationsService.js
      └─> Lambda (get-jobs.js)
          └─> DynamoDB

AttendanceMarker.jsx
  └─> totpService.js (local TOTP generation)
      └─> Lambda (mark-attendance.js)
          └─> DynamoDB

RatingSystem.jsx
  └─> applicationService.js
      └─> Lambda (submit-rating.js, get-ratings.js)
          └─> DynamoDB

SyncManager.jsx
  └─> deltaSyncService.js
      └─> IndexedDB (local)
      └─> Lambda (sync endpoints)
          └─> DynamoDB
```

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for India's blue-collar workforce
- Designed with accessibility and inclusion in mind
- Supports Digital India initiatives
- Compliant with DPDPA 2023 and labor regulations

## 📞 Contact

For questions or support, please open an issue or contact the development team.

---

**Made with ❤️ for India's workforce**


## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test locally with mock servers
5. Run tests (`npm run test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Code Style

- Follow ESLint rules (`npm run lint`)
- Use JSDoc comments for functions
- Write tests for new features
- Keep components small and focused
- Use custom hooks for reusable logic

### Testing

```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:unit          # Unit tests
npm run test:property      # Property-based tests
npm run test:integration   # Integration tests
npm run test:coverage      # Coverage report
```

## 📚 Documentation

- **requirements.md** - Detailed project requirements and specifications
- **design.md** - System architecture and design decisions
- **tasks.md** - Implementation task list and progress tracking
- **prototype/README.md** - Prototype-specific documentation

## 🙏 Acknowledgments

- Built for India's blue-collar workforce
- Designed with accessibility and inclusion in mind
- Supports Digital India initiatives
- Compliant with DPDPA 2023 and labor regulations
- Powered by AWS, Google Gemini, and Groq AI

## 📞 Contact

For questions or support, please open an issue or contact the development team.

**Repository**: [https://github.com/srishti0104/ShramSetu](https://github.com/srishti0104/ShramSetu)

---

**Made with ❤️ for India's workforce**
