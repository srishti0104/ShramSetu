# ESLint Fixes Guide

## Quick Summary

**Total Errors:** 96 errors, 4 warnings  
**Root Cause:** ESLint configuration treating all files as ES modules, but Lambda functions use CommonJS

## Immediate Fix Applied

✅ **Created `.eslintrc.cjs`** with proper environment configurations:
- Lambda functions: CommonJS + Node.js globals
- Frontend: ES modules + Browser + Vite
- Infrastructure: TypeScript

## Remaining Fixes Needed

### Priority 1: Critical Errors (Blocks CI/CD)

#### 1. React Hooks - Function Declaration Order
**Files affected:** 3 files  
**Fix:** Move function declarations before `useEffect` calls

```javascript
// ❌ BEFORE (Error)
useEffect(() => {
  checkBiometricSupport();
}, []);

const checkBiometricSupport = async () => { ... };

// ✅ AFTER (Fixed)
const checkBiometricSupport = async () => { ... };

useEffect(() => {
  checkBiometricSupport();
}, []);
```

**Files to fix:**
- `src/components/auth/BiometricSetup.jsx`
- `src/components/jobs/JobSearch.jsx`
- `src/components/voice/VoiceResponse.jsx`

#### 2. React Hooks - setState in Effects
**Files affected:** 4 files  
**Fix:** Use lazy initialization or move logic outside effect

```javascript
// ❌ BEFORE (Error)
useEffect(() => {
  const saved = localStorage.getItem('key');
  if (saved === 'true') {
    setIsOnboarded(true);
  }
}, []);

// ✅ AFTER (Fixed) - Option 1: Lazy initialization
const [isOnboarded, setIsOnboarded] = useState(() => {
  return localStorage.getItem('key') === 'true';
});

// ✅ AFTER (Fixed) - Option 2: Use callback
useEffect(() => {
  const saved = localStorage.getItem('key');
  if (saved === 'true') {
    setIsOnboarded(prev => true);
  }
}, []);
```

**Files to fix:**
- `src/App.jsx`
- `src/components/auth/MobileVerification.jsx`
- `src/components/onboarding/screens/OccupationSelection.jsx`
- `src/hooks/useVoiceNarration.js`

#### 3. Impure Function During Render
**Files affected:** 1 file  
**Fix:** Use static value or lazy initialization

```javascript
// ❌ BEFORE (Error)
const [lastSyncTime, setLastSyncTime] = useState(new Date(Date.now() - 3600000));

// ✅ AFTER (Fixed)
const [lastSyncTime, setLastSyncTime] = useState(() => 
  new Date(Date.now() - 3600000)
);
```

**File to fix:**
- `src/components/sync/OfflineSync.jsx`

### Priority 2: Warnings (Should Fix)

#### Missing Dependencies in useEffect
**Files affected:** 4 files  
**Fix:** Add functions to `useCallback` or add to dependency array

```javascript
// ❌ BEFORE (Warning)
useEffect(() => {
  fetchData();
}, []);

const fetchData = async () => { ... };

// ✅ AFTER (Fixed)
const fetchData = useCallback(async () => {
  // ... implementation
}, [/* dependencies */]);

useEffect(() => {
  fetchData();
}, [fetchData]);
```

**Files to fix:**
- `src/components/attendance/AttendanceLog.jsx`
- `src/components/attendance/TOTPDisplay.jsx`
- `src/components/jobs/JobSearch.jsx`
- `src/components/voice/VoiceRecorder.jsx`

### Priority 3: Unused Variables (Code Cleanup)

#### Lambda Functions
**Fix:** Prefix with underscore or remove

```javascript
// ❌ BEFORE
const { raterId, rateeId } = params;
// ... raterId and rateeId never used

// ✅ AFTER
const { raterId: _raterId, rateeId: _rateeId } = params;
// OR remove if truly not needed
```

**Files with unused variables:**
- Multiple Lambda functions (see tasks.md for complete list)
- Frontend components (JobSearch, LocationFetch, etc.)

### Priority 4: Fast Refresh Warnings

**Files affected:** 2 files  
**Already fixed in `.eslintrc.cjs`** with `allowExportNames` configuration

## How to Apply Fixes

### Step 1: Verify ESLint Config
```bash
# The new .eslintrc.cjs should already be in place
cat .eslintrc.cjs
```

### Step 2: Run Linter
```bash
npm run lint
```

### Step 3: Fix Errors One by One
Follow the priority order above. After each fix:
```bash
npm run lint -- --fix  # Auto-fix what's possible
npm run lint           # Check remaining issues
```

### Step 4: Test Changes
```bash
npm run dev            # Verify app still works
npm run build          # Verify production build
```

## Automated Fixes Available

Some errors can be auto-fixed:
```bash
npm run lint -- --fix
```

This will automatically fix:
- Some unused variable warnings
- Some formatting issues
- Some import/export issues

## Prevention

### Pre-commit Hook (Recommended)
Add to `.husky/pre-commit`:
```bash
#!/bin/sh
npm run lint
```

### VS Code Settings
Add to `.vscode/settings.json`:
```json
{
  "eslint.validate": [
    "javascript",
    "javascriptreact"
  ],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Summary of Changes Made

1. ✅ Created `.eslintrc.cjs` with proper environment configurations
2. ✅ Deleted old `eslint.config.js`
3. ✅ Configured CommonJS for Lambda functions
4. ✅ Configured ES modules for frontend
5. ✅ Added Node.js globals (Buffer, process, require, exports)
6. ✅ Configured Fast Refresh exceptions for context files

## Next Steps

1. **Immediate:** Fix Priority 1 errors (function declarations, setState in effects)
2. **Short-term:** Fix Priority 2 warnings (missing dependencies)
3. **Maintenance:** Clean up unused variables (Priority 3)
4. **Optional:** Set up pre-commit hooks for automatic linting

## Need Help?

- Check the detailed task list: `.kiro/specs/linting-fixes/tasks.md`
- Review requirements: `.kiro/specs/linting-fixes/requirements.md`
- ESLint docs: https://eslint.org/docs/latest/
- React Hooks rules: https://react.dev/reference/rules
