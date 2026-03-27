# Requirements: ESLint Fixes and Code Quality Improvements

## Introduction

This spec addresses the 100 linting errors discovered during CI/CD pipeline execution. The errors stem from ESLint configuration mismatches between CommonJS (Lambda) and ES modules (frontend), React Hooks violations, and code quality issues.

## Glossary

- **ESLint**: JavaScript linting utility for code quality enforcement
- **CommonJS**: Module system using `require()` and `module.exports` (Node.js default)
- **ES Modules**: Modern JavaScript module system using `import`/`export`
- **React Hooks**: React functions that let you use state and lifecycle features
- **Lambda Functions**: AWS serverless functions using Node.js runtime
- **Fast Refresh**: React development feature for instant component updates

## Requirements

### Requirement 1: ESLint Configuration Fix

**User Story:** As a developer, I want ESLint to correctly recognize different JavaScript environments (Node.js CommonJS vs Browser ES modules), so that valid code doesn't produce false errors.

#### Acceptance Criteria

1. WHEN Lambda functions use `require()` and `exports`, THEN ESLint SHALL NOT report "not defined" errors
2. WHEN Lambda functions use Node.js globals (`Buffer`, `process`), THEN ESLint SHALL recognize them as valid
3. WHEN frontend code uses ES modules, THEN ESLint SHALL enforce module syntax
4. WHEN frontend code accesses `process.env`, THEN ESLint SHALL allow it for Vite environment variables
5. WHEN infrastructure TypeScript files are linted, THEN ESLint SHALL use TypeScript parser

### Requirement 2: React Hooks Compliance

**User Story:** As a React developer, I want to follow React Hooks best practices, so that components render predictably and avoid performance issues.

#### Acceptance Criteria

1. WHEN functions are called in `useEffect`, THEN they SHALL be declared before the effect or included in dependencies
2. WHEN `setState` is called in `useEffect`, THEN it SHALL be conditional or use a callback pattern
3. WHEN `useEffect` has dependencies, THEN all used variables SHALL be included in the dependency array
4. WHEN impure functions are needed, THEN they SHALL be called in effects, not during render
5. WHEN context files export hooks, THEN Fast Refresh warnings SHALL be suppressed with proper configuration

### Requirement 3: Unused Variables Cleanup

**User Story:** As a code maintainer, I want to remove or properly handle unused variables, so that the codebase remains clean and intentional.

#### Acceptance Criteria

1. WHEN variables are defined but unused, THEN they SHALL be either removed or prefixed with underscore
2. WHEN function parameters are intentionally unused, THEN they SHALL be prefixed with underscore
3. WHEN error objects in catch blocks are unused, THEN they SHALL be prefixed with underscore
4. WHEN destructured values are unused, THEN rest syntax SHALL be used to ignore them
5. WHEN TODO comments indicate future use, THEN variables SHALL be prefixed with underscore until implemented

### Requirement 4: Code Quality Improvements

**User Story:** As a developer, I want the codebase to follow React best practices, so that the application is maintainable and performant.

#### Acceptance Criteria

1. WHEN components need initialization, THEN effects SHALL not directly call setState synchronously
2. WHEN functions are accessed before declaration, THEN they SHALL be hoisted or reordered
3. WHEN context providers export hooks, THEN they SHALL use `allowExportNames` configuration
4. WHEN Date.now() is needed, THEN it SHALL be called in effects or event handlers, not during render
5. WHEN mock data uses timestamps, THEN they SHALL use static values or lazy initialization
