# Project Structure

## Root Directory

```
ShramSetu/
├── src/                    # Frontend source code
├── lambda/                 # AWS Lambda functions
├── infrastructure/         # AWS CDK infrastructure
├── public/                 # Static assets
├── .kiro/                  # Kiro configuration
├── vite.config.js          # Vite configuration
├── eslint.config.js        # ESLint flat config
└── package.json            # Dependencies and scripts
```

## Frontend Structure (`src/`)

```
src/
├── components/             # React components (organized by feature)
│   ├── attendance/        # TOTP attendance components
│   ├── auth/              # Authentication & onboarding
│   ├── grievance/         # Grievance reporting
│   ├── jobs/              # Job marketplace
│   ├── ledger/            # E-Khata ledger
│   ├── payslip/           # Payslip auditor
│   ├── ratings/           # Trust tier system
│   ├── sync/              # Offline sync
│   └── voice/             # Voice interface
├── services/              # API clients
│   ├── totp-attendance/   # Attendance service client
│   └── voice-assistant/   # Voice API client
├── hooks/                 # Custom React hooks
├── contexts/              # React contexts
├── types/                 # Type definitions (JSDoc)
├── App.jsx                # Main app component
└── main.jsx               # Entry point
```

## Backend Structure (`lambda/`)

Lambda functions organized by domain:

```
lambda/
├── auth/                  # Authentication functions
│   ├── login.js
│   ├── register.js
│   ├── send-otp.js
│   └── verify-otp.js
├── attendance/            # Attendance functions
├── jobs/                  # Job marketplace functions
├── ratings/               # Rating system functions
├── grievances/            # Grievance functions
└── voice/                 # Voice processing functions
```

## Infrastructure (`infrastructure/`)

AWS CDK infrastructure as code:

```
infrastructure/
├── lib/                   # CDK construct libraries
│   ├── api-gateway-config.ts
│   ├── database-config.ts
│   ├── lambda-roles-config.ts
│   └── shramik-setu-stack.ts
├── scripts/               # Setup scripts
├── cdk-app.ts             # CDK app entry point
└── cdk.json               # CDK configuration
```

## Component Organization

Components follow a feature-based structure with co-located styles:

```
components/feature/
├── ComponentName.jsx      # Component logic
└── ComponentName.css      # Component styles
```

## Naming Conventions

- Components: PascalCase (e.g., `VoiceButton.jsx`)
- Services: kebab-case (e.g., `voice-assistant/client.js`)
- Lambda functions: kebab-case (e.g., `send-otp.js`)
- Types: kebab-case (e.g., `attendance.js`)
- CSS classes: kebab-case with BEM (e.g., `voice-button__icon`)

## Code Style

- Use JSDoc comments for type hints and documentation
- Export default for components, named exports for utilities
- Mock implementations clearly marked with `[MOCK]` comments
- Consistent error handling with structured error responses
- Accessibility attributes (aria-label, aria-pressed, etc.)

## Type Definitions

Types are defined in `src/types/` using JSDoc:

```javascript
/**
 * @typedef {Object} VoiceCommand
 * @property {Blob} audioData
 * @property {string} language
 * @property {string} userId
 */
```

Import types using JSDoc:

```javascript
/**
 * @typedef {import('./types/voice.js').VoiceCommand} VoiceCommand
 */
```

## Mock Data Pattern

Current implementation uses mock data with clear markers for AWS integration:

```javascript
// MOCK: In production, call actual API
console.log('[MOCK] Processing voice command');

// Mock implementation here

// Production code commented out:
// const response = await fetch(`${API_BASE_URL}/endpoint`);
```

## Documentation

- README.md files in key directories
- JSDoc comments for all functions and components
- Inline comments for complex logic
- Design and requirements documents in root
