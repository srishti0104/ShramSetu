# Implementation Plan: Role-Based Dashboards

## Overview

This plan implements role-based routing and separate dashboards for Worker and Employer users. The implementation maintains the existing tab-based navigation pattern while introducing role persistence, access control, and tailored dashboard experiences.

## Tasks

- [x] 1. Create RoleManager utility module
  - Create `src/utils/roleManager.js` with role persistence functions
  - Implement `saveRole()`, `getRole()`, `isValidRole()`, `clearRole()`, `hasFeatureAccess()`
  - Define `FEATURE_ACCESS` map for role-based feature filtering
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 7.4, 7.5_

- [ ]* 1.1 Write property tests for RoleManager
  - **Property 1: Role Persistence After Onboarding**
  - **Property 2: Role Validation**
  - **Property 3: Role Retrieval on Load**
  - **Property 13: Access Control Enforcement**
  - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 7.1, 7.2, 7.3, 7.4**

- [ ]* 1.2 Write unit tests for RoleManager
  - Test `saveRole()` stores role in localStorage
  - Test `getRole()` retrieves role from localStorage
  - Test `isValidRole()` validates role values
  - Test `clearRole()` removes role from localStorage
  - Test `hasFeatureAccess()` checks role-feature permissions
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Create WorkerDashboard component
  - Create `src/components/dashboard/WorkerDashboard.jsx`
  - Implement tab-based navigation with `activeTab` state
  - Define `WORKER_TABS` configuration with required features
  - Implement tab switching and content rendering
  - Add "Restart Onboarding" button with callback
  - _Requirements: 2.1, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

- [ ]* 2.1 Write property tests for WorkerDashboard
  - **Property 7: Worker Dashboard Required Features**
  - **Property 8: Worker Dashboard Excluded Features**
  - **Property 19: Tab State Updates**
  - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 10.1**

- [ ]* 2.2 Write unit tests for WorkerDashboard
  - Test renders all required navigation tabs
  - Test does not render excluded features (Session Start, Talent Search)
  - Test handles tab switching correctly
  - Test calls `onRestartOnboarding` callback
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

- [x] 3. Create EmployerDashboard component
  - Create `src/components/dashboard/EmployerDashboard.jsx`
  - Implement tab-based navigation with `activeTab` state
  - Define `EMPLOYER_TABS` configuration with required features
  - Implement tab switching and content rendering
  - Add "Restart Onboarding" button with callback
  - _Requirements: 2.2, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9_

- [ ]* 3.1 Write property tests for EmployerDashboard
  - **Property 9: Employer Dashboard Required Features**
  - **Property 10: Employer Dashboard Excluded Features**
  - **Property 19: Tab State Updates**
  - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 10.1**

- [ ]* 3.2 Write unit tests for EmployerDashboard
  - Test renders all required navigation tabs
  - Test does not render excluded features (Job Search, Attendance, Payslip)
  - Test handles tab switching correctly
  - Test calls `onRestartOnboarding` callback
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9_

- [ ] 4. Checkpoint - Ensure dashboard components work independently
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Modify OnboardingContext to persist role
  - Import `roleManager` utility in `src/contexts/OnboardingContext.jsx`
  - Update `completeOnboarding()` to call `saveRole(state.role)`
  - Update `resetOnboarding()` to call `clearRole()`
  - Maintain backward compatibility with existing structure
  - _Requirements: 1.1, 1.2, 8.1, 8.2, 9.4_

- [ ]* 5.1 Write property tests for OnboardingContext
  - **Property 1: Role Persistence After Onboarding**
  - **Property 15: Onboarding Restart Cleanup**
  - **Property 17: Role Change Round Trip**
  - **Validates: Requirements 1.1, 1.2, 8.1, 8.2, 8.4, 8.5**

- [ ]* 5.2 Write unit tests for OnboardingContext
  - Test `completeOnboarding()` saves role to localStorage
  - Test `resetOnboarding()` clears role from localStorage
  - Test maintains backward compatibility
  - _Requirements: 1.1, 1.2, 8.1, 8.2, 9.4_

- [x] 6. Modify App component for role-based routing
  - Import `WorkerDashboard`, `EmployerDashboard`, and `roleManager`
  - Add `userRole` state: `const [userRole, setUserRole] = useState(null)`
  - Add role check logic in `useEffect` on mount
  - Conditionally render dashboard based on role
  - Handle invalid/missing role by redirecting to onboarding
  - Pass `handleStartOnboarding` to dashboards
  - _Requirements: 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 9.1, 9.2_

- [ ]* 6.1 Write property tests for App component
  - **Property 3: Role Retrieval on Load**
  - **Property 4: Invalid Role Handling**
  - **Property 5: Role-Based Dashboard Routing**
  - **Property 6: Dashboard Persistence Across Sessions**
  - **Validates: Requirements 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 9.1, 9.2**

- [ ]* 6.2 Write unit tests for App component
  - Test loads role on mount
  - Test routes to WorkerDashboard when role is 'worker'
  - Test routes to EmployerDashboard when role is 'employer'
  - Test redirects to onboarding when role is missing
  - Test redirects to onboarding when role is invalid
  - Test handles onboarding completion
  - Test updates role after re-onboarding
  - _Requirements: 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 9.1, 9.2_

- [ ] 7. Implement tab state persistence
  - Add `TAB_STORAGE_KEY` constant and sessionStorage helpers
  - Update both dashboards to save `activeTab` to sessionStorage on change
  - Update both dashboards to restore `activeTab` from sessionStorage on mount
  - Validate restored tab is valid for user role, default to 'home' if not
  - Clear `activeTab` from sessionStorage on logout/restart onboarding
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ]* 7.1 Write property tests for tab persistence
  - **Property 20: Tab Persistence After Refresh**
  - **Property 21: Tab State Storage**
  - **Property 22: Tab State Cleanup**
  - **Validates: Requirements 10.2, 10.3, 10.4, 10.5**

- [ ]* 7.2 Write unit tests for tab persistence
  - Test saves activeTab to sessionStorage on tab switch
  - Test restores activeTab from sessionStorage on mount
  - Test defaults to 'home' when restored tab is invalid
  - Test clears activeTab on logout
  - Test clears activeTab on restart onboarding
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 8. Checkpoint - Ensure all components integrated
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 9. Write integration tests for complete user flows
  - **Property 16: Onboarding Restart Navigation**
  - **Property 17: Role Change Round Trip**
  - **Property 18: Feature Data Preservation**
  - Test complete onboarding flow (start → select role → complete → verify dashboard)
  - Test role persistence (complete → refresh → verify same dashboard)
  - Test role change (complete → restart → select different role → verify new dashboard)
  - Test access control (login as worker → attempt employer feature → verify denied)
  - Test tab persistence (switch tab → refresh → verify tab restored)
  - **Validates: Requirements 8.3, 8.4, 8.5, 9.3**

- [ ] 10. Final verification and cleanup
  - Verify all requirements covered by implementation
  - Verify no regression in existing features
  - Verify localStorage data preserved for existing features
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from design document
- Unit tests validate specific examples and edge cases
- Integration tests validate complete user flows
- Checkpoints ensure incremental validation at key milestones
