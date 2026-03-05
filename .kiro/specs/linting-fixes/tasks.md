# Implementation Tasks: ESLint Fixes and Code Quality

## 1. ESLint Configuration (Requirement 1)

- [x] 1.1 Create `.eslintrc.cjs` with proper environment configurations
- [ ] 1.2 Configure CommonJS environment for Lambda functions
- [ ] 1.3 Configure ES modules environment for frontend code
- [ ] 1.4 Add Node.js globals (Buffer, process, require, exports) for Lambda
- [ ] 1.5 Configure TypeScript parser for infrastructure files
- [ ] 1.6 Delete old `eslint.config.js` file
- [ ] 1.7 Test linting on Lambda files
- [ ] 1.8 Test linting on frontend files

## 2. Lambda Functions Fixes (Requirement 1)

### 2.1 Attendance Lambda Functions
- [ ] 2.1.1 Fix `create-session.js` - Remove unused variables
- [ ] 2.1.2 Fix `generate-totp.js` - Remove unused exports
- [ ] 2.1.3 Fix `get-attendance-log.js` - Prefix unused error variable with underscore
- [ ] 2.1.4 Fix `mark-attendance.js` - Remove unused exports
- [ ] 2.1.5 Fix `validate-totp.js` - Remove unused exports

### 2.2 Auth Lambda Functions
- [ ] 2.2.1 Fix `authorizer.js` - Prefix unused error with underscore
- [ ] 2.2.2 Fix `login.js` - Use or remove refreshToken variable
- [ ] 2.2.3 Fix `refresh-token.js` - Use or remove refreshToken variable
- [ ] 2.2.4 Fix `validate-eshram.js` - Use or remove ttl variable

### 2.3 Other Lambda Functions
- [ ] 2.3.1 Fix `grievances/submit.js` - Remove unused parameters and variables
- [ ] 2.3.2 Fix `ratings/calculate-tier.js` - Remove unused exports
- [ ] 2.3.3 Fix `ratings/submit-rating.js` - Use or remove raterId/rateeId
- [ ] 2.3.4 Fix `voice/process-command.js` - Remove unused parameters

## 3. React Hooks Fixes (Requirement 2)

### 3.1 Function Declaration Order
- [ ] 3.1.1 Fix `BiometricSetup.jsx` - Move checkBiometricSupport before useEffect
- [ ] 3.1.2 Fix `JobSearch.jsx` - Move filterJobs before useEffect
- [ ] 3.1.3 Fix `VoiceResponse.jsx` - Move playAudio before useEffect

### 3.2 setState in Effects
- [ ] 3.2.1 Fix `App.jsx` - Use lazy initialization for isOnboarded state
- [ ] 3.2.2 Fix `MobileVerification.jsx` - Move canResend logic to effect cleanup
- [ ] 3.2.3 Fix `OccupationSelection.jsx` - Use useMemo for filtered occupations
- [ ] 3.2.4 Fix `useVoiceNarration.js` - Restructure autoPlay logic

### 3.3 Missing Dependencies
- [ ] 3.3.1 Fix `AttendanceLog.jsx` - Add fetchAttendanceLog to useCallback
- [ ] 3.3.2 Fix `TOTPDisplay.jsx` - Add generateTOTP to useCallback
- [ ] 3.3.3 Fix `JobSearch.jsx` - Add filterJobs to useCallback
- [ ] 3.3.4 Fix `VoiceRecorder.jsx` - Add stopRecording to useCallback

## 4. Unused Variables Cleanup (Requirement 3)

### 4.1 Frontend Components
- [ ] 4.1.1 Fix `JobSearch.jsx` - Remove unused setJobs or implement functionality
- [ ] 4.1.2 Fix `LocationFetch.jsx` - Remove unused useEffect import
- [ ] 4.1.3 Fix `OTPVerification.jsx` - Prefix unused err with underscore
- [ ] 4.1.4 Fix `PhoneNumberEntry.jsx` - Remove unused transcript
- [ ] 4.1.5 Fix `OfflineSync.jsx` - Use useMemo for lastSyncTime initialization
- [ ] 4.1.6 Fix `VoiceRecorder.jsx` - Use or remove audioBlob

### 4.2 Services
- [ ] 4.2.1 Fix `apiClient.js` - Prefix unused exception with underscore
- [ ] 4.2.2 Fix `voice-assistant/client.js` - Use or remove accessToken parameters

## 5. Context Files Fast Refresh (Requirement 4)

- [ ] 5.1 Fix `AuthContext.jsx` - Add allowExportNames for useAuth
- [ ] 5.2 Fix `OnboardingContext.jsx` - Add allowExportNames for useOnboarding
- [ ] 5.3 Update ESLint config with allowExportNames

## 6. Testing and Validation

- [ ] 6.1 Run `npm run lint` and verify all errors are resolved
- [ ] 6.2 Run `npm run dev` and verify no runtime errors
- [ ] 6.3 Test Lambda functions locally with mock events
- [ ] 6.4 Test React components for proper rendering
- [ ] 6.5 Verify Fast Refresh works in development
- [ ] 6.6 Run full test suite if available

## 7. Documentation

- [ ] 7.1 Document ESLint configuration choices
- [ ] 7.2 Add comments explaining underscore-prefixed variables
- [ ] 7.3 Update contributing guidelines with linting rules
- [ ] 7.4 Create pre-commit hook for linting (optional)
