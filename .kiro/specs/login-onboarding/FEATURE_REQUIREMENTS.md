# Requirements Document: Login and Onboarding Flow

## Introduction

This document outlines the requirements for the complete login and onboarding experience for Shramik-Setu, designed to be accessible, voice-first, and inclusive for users with varying literacy levels.

## Glossary

- **Onboarding_Flow**: The complete multi-step process from language selection to main interface
- **Language_Selector**: Component for choosing preferred language
- **Role_Selector**: Component for choosing user role (Worker/Employer)
- **Auth_Method**: Authentication method (Phone Number or E-Shram Card)
- **OTP_Verifier**: One-Time Password verification component
- **Location_Service**: Auto-fetch location service
- **Profile_Builder**: Component for collecting personal details
- **Onboarding_Tutorial**: Get started interface with benefits and disclaimer
- **Worker**: Employee/laborer using the platform
- **Employer**: Contractor/business hiring workers

## Requirements

### Requirement 1: Language Selection Screen

**User Story:** As a new user, I want to select my preferred language at the very beginning, so that I can use the app in a language I understand.

#### Acceptance Criteria

1. WHEN a user opens the app for the first time, THE Language_Selector SHALL display as the first screen
2. WHEN languages are displayed, THE Language_Selector SHALL show at least 10 Indian languages with native script
3. WHEN a user selects a language, THE Onboarding_Flow SHALL store the preference and apply it to all subsequent screens
4. WHEN the language is selected, THE Language_Selector SHALL provide visual and audio confirmation
5. WHEN a user wants to change language later, THE Language_Selector SHALL be accessible from settings

### Requirement 2: Role Selection Screen

**User Story:** As a user, I want to identify myself as either a worker or employer, so that the app can provide role-appropriate features.

#### Acceptance Criteria

1. WHEN language is selected, THE Role_Selector SHALL display two clear options: Worker and Employer
2. WHEN roles are displayed, THE Role_Selector SHALL use large icons and text in the selected language
3. WHEN a user selects a role, THE Onboarding_Flow SHALL configure appropriate permissions and features
4. WHEN the role is selected, THE Role_Selector SHALL provide visual confirmation
5. WHEN a user selects Worker role, THE Onboarding_Flow SHALL enable E-Shram card authentication option

### Requirement 3: Authentication Method Selection

**User Story:** As a user, I want to choose how to authenticate (phone number or E-Shram card), so that I can use the method most convenient for me.

#### Acceptance Criteria

1. WHEN role is selected, THE Auth_Method SHALL display available authentication options
2. WHEN user is a Worker, THE Auth_Method SHALL show both Phone Number and E-Shram Card options
3. WHEN user is an Employer, THE Auth_Method SHALL show only Phone Number option
4. WHEN an option is selected, THE Auth_Method SHALL display the appropriate input form
5. WHEN E-Shram card is selected, THE Auth_Method SHALL provide option to scan or manually enter card number

### Requirement 4: Phone Number Authentication

**User Story:** As a user, I want to login using my phone number and OTP, so that I can securely access the platform.

#### Acceptance Criteria

1. WHEN phone number is entered, THE Onboarding_Flow SHALL validate the format (10 digits for India)
2. WHEN phone number is valid, THE Onboarding_Flow SHALL send OTP within 10 seconds
3. WHEN OTP is sent, THE OTP_Verifier SHALL display a 6-digit input field with countdown timer
4. WHEN OTP is entered correctly, THE Onboarding_Flow SHALL authenticate the user and proceed
5. WHEN OTP is incorrect, THE OTP_Verifier SHALL allow 3 retry attempts before requiring resend

### Requirement 5: E-Shram Card Authentication

**User Story:** As a worker, I want to authenticate using my E-Shram card, so that my verified worker information is automatically loaded.

#### Acceptance Criteria

1. WHEN E-Shram card number is entered, THE Onboarding_Flow SHALL validate the format
2. WHEN card number is valid, THE Onboarding_Flow SHALL verify against government database
3. WHEN verification succeeds, THE Onboarding_Flow SHALL extract worker information (name, skills, location)
4. WHEN verification fails, THE Onboarding_Flow SHALL provide option to use phone number instead
5. WHEN E-Shram verification succeeds, THE Onboarding_Flow SHALL still require OTP verification on linked mobile

### Requirement 6: Location Auto-Fetch

**User Story:** As a user, I want my location to be automatically detected, so that I can find nearby job opportunities without manual entry.

#### Acceptance Criteria

1. WHEN authentication succeeds, THE Location_Service SHALL request location permission
2. WHEN permission is granted, THE Location_Service SHALL fetch current GPS coordinates
3. WHEN coordinates are fetched, THE Location_Service SHALL reverse geocode to get city, state, pincode
4. WHEN location fetch fails, THE Location_Service SHALL provide manual location entry option
5. WHEN location is determined, THE Onboarding_Flow SHALL display it for user confirmation

### Requirement 7: Occupation Selection (Workers)

**User Story:** As a worker, I want to select my occupation/skills, so that I can be matched with relevant job opportunities.

#### Acceptance Criteria

1. WHEN worker completes authentication, THE Profile_Builder SHALL display occupation selection screen
2. WHEN occupations are displayed, THE Profile_Builder SHALL show common categories with icons (Mason, Painter, Plumber, Electrician, Carpenter, etc.)
3. WHEN a user selects occupations, THE Profile_Builder SHALL allow multiple selections
4. WHEN occupations are selected, THE Profile_Builder SHALL provide option to add custom skills
5. WHEN occupation selection is complete, THE Profile_Builder SHALL store skills in user profile

### Requirement 8: Personal Details Collection

**User Story:** As a user, I want to provide my personal details (name, age, gender, photo), so that my profile is complete and trustworthy.

#### Acceptance Criteria

1. WHEN occupation is selected, THE Profile_Builder SHALL display personal details form
2. WHEN form is displayed, THE Profile_Builder SHALL request: Name, Age, Gender, and optional Photo
3. WHEN photo is requested, THE Profile_Builder SHALL provide options to capture or upload
4. WHEN all required fields are filled, THE Profile_Builder SHALL validate completeness
5. WHEN validation succeeds, THE Profile_Builder SHALL save profile and proceed to tutorial

### Requirement 9: Get Started Interface - Benefits

**User Story:** As a new user, I want to understand the benefits of using Shramik-Setu, so that I know what features are available.

#### Acceptance Criteria

1. WHEN profile is complete, THE Onboarding_Tutorial SHALL display benefits screen
2. WHEN benefits are shown, THE Onboarding_Tutorial SHALL highlight key features with icons and descriptions
3. WHEN benefits are displayed, THE Onboarding_Tutorial SHALL provide voice narration option
4. WHEN user views benefits, THE Onboarding_Tutorial SHALL allow skip or next navigation
5. WHEN benefits screen is complete, THE Onboarding_Tutorial SHALL proceed to disclaimer

### Requirement 10: Disclaimer and Terms

**User Story:** As a user, I want to review the terms and disclaimer, so that I understand my rights and responsibilities.

#### Acceptance Criteria

1. WHEN benefits are shown, THE Onboarding_Tutorial SHALL display disclaimer and terms screen
2. WHEN disclaimer is shown, THE Onboarding_Tutorial SHALL present key points in simple language
3. WHEN terms are displayed, THE Onboarding_Tutorial SHALL provide voice narration option
4. WHEN user reviews terms, THE Onboarding_Tutorial SHALL require explicit acceptance
5. WHEN terms are accepted, THE Onboarding_Tutorial SHALL complete onboarding and navigate to main interface

### Requirement 11: Main Interface Navigation

**User Story:** As a user who completed onboarding, I want to access the main interface, so that I can start using the platform features.

#### Acceptance Criteria

1. WHEN onboarding is complete, THE Onboarding_Flow SHALL navigate to role-appropriate main interface
2. WHEN worker completes onboarding, THE Onboarding_Flow SHALL show job search, attendance, and ledger features
3. WHEN employer completes onboarding, THE Onboarding_Flow SHALL show job posting, attendance management, and payment features
4. WHEN main interface loads, THE Onboarding_Flow SHALL display a welcome message with user's name
5. WHEN user accesses app again, THE Onboarding_Flow SHALL skip to login screen (not full onboarding)

### Requirement 12: Progress Indication

**User Story:** As a user going through onboarding, I want to see my progress, so that I know how many steps remain.

#### Acceptance Criteria

1. WHEN onboarding starts, THE Onboarding_Flow SHALL display a progress indicator
2. WHEN user completes each step, THE Onboarding_Flow SHALL update progress visually
3. WHEN progress is shown, THE Onboarding_Flow SHALL indicate current step and total steps
4. WHEN user navigates back, THE Onboarding_Flow SHALL allow returning to previous steps
5. WHEN progress reaches 100%, THE Onboarding_Flow SHALL show completion animation

### Requirement 13: Accessibility and Voice Support

**User Story:** As a user with limited literacy, I want voice guidance throughout onboarding, so that I can complete the process independently.

#### Acceptance Criteria

1. WHEN any onboarding screen loads, THE Onboarding_Flow SHALL provide voice narration option
2. WHEN voice is enabled, THE Onboarding_Flow SHALL read all text content in selected language
3. WHEN user interacts with elements, THE Onboarding_Flow SHALL provide audio feedback
4. WHEN errors occur, THE Onboarding_Flow SHALL announce them via voice
5. WHEN onboarding completes, THE Onboarding_Flow SHALL provide voice confirmation

### Requirement 14: Error Handling and Recovery

**User Story:** As a user experiencing issues during onboarding, I want clear error messages and recovery options, so that I can complete the process successfully.

#### Acceptance Criteria

1. WHEN network errors occur, THE Onboarding_Flow SHALL display retry option with clear message
2. WHEN validation fails, THE Onboarding_Flow SHALL highlight specific fields with error descriptions
3. WHEN authentication fails, THE Onboarding_Flow SHALL provide alternative authentication methods
4. WHEN location fetch fails, THE Onboarding_Flow SHALL offer manual entry option
5. WHEN any step fails, THE Onboarding_Flow SHALL save progress and allow resuming later

### Requirement 15: Data Privacy and Security

**User Story:** As a user providing personal information, I want my data to be secure and private, so that I can trust the platform.

#### Acceptance Criteria

1. WHEN collecting personal data, THE Onboarding_Flow SHALL encrypt all sensitive information
2. WHEN requesting permissions, THE Onboarding_Flow SHALL explain why each permission is needed
3. WHEN storing data, THE Onboarding_Flow SHALL comply with Indian data protection regulations
4. WHEN authentication occurs, THE Onboarding_Flow SHALL use secure HTTPS connections
5. WHEN onboarding completes, THE Onboarding_Flow SHALL provide privacy policy link
