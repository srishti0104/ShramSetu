# Requirements Document

## Introduction

This document specifies the requirements for implementing role-based routing and separate dashboards for Employer and Worker users in ShramSetu. The system currently collects user role during onboarding but does not persist it or use it for access control. This feature will enable role-specific navigation, feature filtering, and appropriate user experiences for each user type.

## Glossary

- **System**: The ShramSetu Progressive Web Application
- **User**: A person who has completed onboarding and is using the application
- **Worker**: A user with role='worker' who seeks employment and marks attendance
- **Employer**: A user with role='employer' who posts jobs and manages attendance sessions
- **Role**: A user classification stored as 'worker' or 'employer'
- **Dashboard**: The main interface shown to a user after login, containing role-appropriate features
- **Feature**: A functional module of the application (e.g., Job Search, E-Khata, Attendance)
- **Navigation**: The tab-based menu system for accessing different features
- **OnboardingContext**: The React context that manages onboarding state including role selection
- **localStorage**: Browser storage mechanism for persisting user data
- **User_Profile**: The stored user data including role, authentication tokens, and preferences

## Requirements

### Requirement 1: Role Persistence After Onboarding

**User Story:** As a user completing onboarding, I want my selected role to be saved permanently, so that I don't have to select it again on subsequent visits.

#### Acceptance Criteria

1. WHEN onboarding is completed, THE System SHALL save the user role to localStorage with key 'user_role'
2. WHEN onboarding is completed, THE System SHALL save the user role to the User_Profile object
3. THE System SHALL persist the role value as either 'worker' or 'employer'
4. WHEN the application loads, THE System SHALL retrieve the saved role from localStorage
5. IF no role is found in localStorage, THEN THE System SHALL redirect to onboarding

### Requirement 2: Role-Based Dashboard Routing

**User Story:** As a user, I want to see a dashboard tailored to my role, so that I only see features relevant to my work.

#### Acceptance Criteria

1. WHEN a Worker completes onboarding, THE System SHALL display the WorkerDashboard component
2. WHEN an Employer completes onboarding, THE System SHALL display the EmployerDashboard component
3. THE System SHALL determine dashboard routing based on the persisted role value
4. WHEN the user restarts the application, THE System SHALL route to the appropriate dashboard without re-onboarding
5. THE System SHALL maintain the current tab-based navigation pattern within each dashboard

### Requirement 3: Worker Dashboard Features

**User Story:** As a Worker, I want access to job search, attendance marking, and wage tracking features, so that I can find work and manage my employment records.

#### Acceptance Criteria

1. THE WorkerDashboard SHALL include navigation to Job Search (find jobs by skills/location)
2. THE WorkerDashboard SHALL include navigation to Attendance (TOTP input and attendance log)
3. THE WorkerDashboard SHALL include navigation to E-Khata Ledger (wage tracking)
4. THE WorkerDashboard SHALL include navigation to Payslip Auditor (payslip verification)
5. THE WorkerDashboard SHALL include navigation to Grievance Redressal (safety reporting)
6. THE WorkerDashboard SHALL include navigation to Rating System (rate employers)
7. THE WorkerDashboard SHALL include navigation to Sync (offline data management)
8. THE WorkerDashboard SHALL NOT display Session Start (TOTP creation) feature
9. THE WorkerDashboard SHALL NOT display Talent Search feature

### Requirement 4: Employer Dashboard Features

**User Story:** As an Employer, I want access to talent search, session creation, and worker management features, so that I can find workers and manage attendance.

#### Acceptance Criteria

1. THE EmployerDashboard SHALL include navigation to Talent Search (find workers by skills/location)
2. THE EmployerDashboard SHALL include navigation to Session Start (TOTP attendance creation)
3. THE EmployerDashboard SHALL include navigation to E-Khata Ledger (payment tracking)
4. THE EmployerDashboard SHALL include navigation to Grievance Redressal (view reports)
5. THE EmployerDashboard SHALL include navigation to Rating System (rate workers)
6. THE EmployerDashboard SHALL include navigation to Sync (offline data management)
7. THE EmployerDashboard SHALL NOT display Job Search feature
8. THE EmployerDashboard SHALL NOT display Attendance (TOTP input) feature
9. THE EmployerDashboard SHALL NOT display Payslip Auditor feature

### Requirement 5: Shared Feature Access

**User Story:** As any user, I want access to common features like E-Khata and Grievance Redressal, so that I can track transactions and report issues regardless of my role.

#### Acceptance Criteria

1. THE System SHALL provide E-Khata Ledger access to both Workers and Employers
2. THE System SHALL provide Grievance Redressal access to both Workers and Employers
3. THE System SHALL provide Rating System access to both Workers and Employers
4. THE System SHALL provide Sync functionality to both Workers and Employers
5. WHEN a Worker accesses E-Khata, THE System SHALL display wage receipts and payment history
6. WHEN an Employer accesses E-Khata, THE System SHALL display payment records and worker transactions
7. WHEN a Worker accesses Rating System, THE System SHALL allow rating Employers
8. WHEN an Employer accesses Rating System, THE System SHALL allow rating Workers

### Requirement 6: Job Marketplace Role Adaptation

**User Story:** As a user accessing the Job Marketplace, I want to see the appropriate interface for my role, so that Workers can search for jobs and Employers can search for talent.

#### Acceptance Criteria

1. WHEN a Worker accesses Job Marketplace, THE System SHALL display Job Search interface
2. WHEN an Employer accesses Job Marketplace, THE System SHALL display Talent Search interface
3. THE Job Search interface SHALL allow filtering by skills, location, and wage range
4. THE Talent Search interface SHALL allow filtering by skills, location, and availability
5. THE System SHALL reuse the existing JobSearch component with role-based configuration
6. THE System SHALL maintain the same geospatial matching logic for both interfaces

### Requirement 7: Access Control Enforcement

**User Story:** As a system administrator, I want role-based access control enforced, so that users cannot access features not intended for their role.

#### Acceptance Criteria

1. WHEN a Worker attempts to access Session Start, THE System SHALL display an access denied message
2. WHEN an Employer attempts to access Attendance (TOTP input), THE System SHALL display an access denied message
3. WHEN an Employer attempts to access Payslip Auditor, THE System SHALL display an access denied message
4. THE System SHALL hide navigation buttons for inaccessible features based on role
5. THE System SHALL validate role before rendering any role-restricted component
6. IF role validation fails, THEN THE System SHALL redirect to the appropriate dashboard home

### Requirement 8: Role Change and Re-onboarding

**User Story:** As a user who needs to change my role, I want to restart onboarding, so that I can update my account type.

#### Acceptance Criteria

1. WHEN the user clicks "Restart Onboarding", THE System SHALL clear the saved role from localStorage
2. WHEN the user clicks "Restart Onboarding", THE System SHALL clear the User_Profile data
3. WHEN the user clicks "Restart Onboarding", THE System SHALL redirect to the onboarding flow
4. WHEN the user completes onboarding again, THE System SHALL save the newly selected role
5. THE System SHALL route to the dashboard corresponding to the newly selected role

### Requirement 9: Backward Compatibility

**User Story:** As an existing user, I want the system to handle my existing data gracefully, so that I don't lose access to my account.

#### Acceptance Criteria

1. WHEN the application loads and no role is found, THE System SHALL redirect to onboarding
2. WHEN the application loads and an invalid role value is found, THE System SHALL redirect to onboarding
3. THE System SHALL preserve existing localStorage data for features (attendance, jobs, ledger)
4. THE System SHALL maintain compatibility with existing OnboardingContext structure
5. THE System SHALL not break existing component functionality during migration

### Requirement 10: Navigation State Persistence

**User Story:** As a user navigating between features, I want my active tab to be remembered, so that I can resume where I left off.

#### Acceptance Criteria

1. WHEN a user switches tabs within their dashboard, THE System SHALL update the activeTab state
2. WHEN a user refreshes the page, THE System SHALL restore the last active tab if valid for their role
3. IF the last active tab is not valid for the user's role, THEN THE System SHALL default to the dashboard home
4. THE System SHALL save the activeTab state to sessionStorage
5. THE System SHALL clear the activeTab state when the user logs out or restarts onboarding
