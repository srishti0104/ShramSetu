# Requirements Document: Shramik-Setu

## Introduction

Shramik-Setu (Project Jan-Nyaya) is a voice-controlled Progressive Web App designed for India's "Next Billion Users" - specifically targeting laborers and contractors who need an accessible platform for job matching, payment tracking, and labor rights enforcement. The platform prioritizes voice-first interaction, multi-language support, and some offline functionality to serve users with varying literacy levels and connectivity constraints.

## Glossary

- **Shramik_Setu_System**: The complete PWA platform including voice interface, job marketplace, and compliance features
- **Amazon_Transcribe**: The central voice transcription service handling speech-to-text conversion
- **Voice_Assistant**: The AI-powered conversational interface that processes voice commands and provides spoken responses using Amazon services
- **E_Shram_Validator**: Component that validates worker credentials against government E-Shram database
- **E_Khata_Ledger**: Digital financial ledger tracking wages, advances, and payments
- **Payslip_Auditor**: OCR and AI-powered component for analyzing payslip compliance
- **Suraksha_Module**: Safety and grievance reporting system
- **Trust_Tier_System**: Rating-based classification system for users
- **TOTP_Attendance**: Time-based One-Time Password system for attendance verification
- **Geospatial_Matcher**: Location-based job matching service
- **Delta_Sync**: Offline/online data synchronization mechanism
- **OCR_Processor**: The optical character recognition system that extracts text from payslip images and documents 
- **Legal_Calculator**: The system component that performs minimum wage calculations according to Labour Act and Minimum Wage Act
- **Rating_System**: The dual employer-employee verification and rating mechanism
- **Offline_Manager**: The system component that handles local data storage and synchronization
- **User**: Either an employee (worker) or employer using the system
- **Worker**: A blue-collar laborer, daily wage worker, or construction worker using the system
- **Employer**: A business or individual hiring temporary or contract labor
- **Job_Provider**: Individuals or small businesses offering daily wage work
- **Contractor**: Business entities or individuals hiring workers for specific projects
- **Payslip**: A document showing wage details that can be processed via OCR
- **Voice_Session**: An active conversation between the user and the voice assistant
- **OTP_System**: One-Time Password verification system for work sessions and authentication
- **Compliance_Engine**: System component that verifies wage compliance with labor laws
- **Digital_Ledger**: Electronic record-keeping system for earnings tracking
- **PWA**: Progressive Web Application optimized for mobile devices

## Requirements

### Requirement 1: Voice-First Interface System

**User Story:** As a laborer with limited literacy, I want to interact with the platform primarily through voice commands in my native language, so that I can access all features without reading complex text.

#### Acceptance Criteria

1. WHEN a user speaks in Hindi or regional languages, THE Amazon_Transcribe SHALL transcribe the audio with 95% accuracy for common labor-related vocabulary
2. WHEN voice input is received, THE Voice_Assistant SHALL process natural language intents for job search, payment queries, and grievance reporting
3. WHEN the system responds, THE Voice_Assistant SHALL provide audio responses in the user's preferred language using Amazon Polly speech synthesis
4. WHEN voice recognition fails, THE Voice_Assistant SHALL provide fallback options including simplified visual prompts and retry mechanisms
5. WHEN users switch between languages mid-conversation, THE Voice_Assistant SHALL maintain context and respond appropriately in the new language

### Requirement 2: Multi-Language Onboarding and Identity Verification

**User Story:** As a new user, I want to register using my mobile number and E-Shram card in my preferred language, so that I can quickly access the platform with verified credentials.

#### Acceptance Criteria

1. WHEN a new user accesses the platform, THE Shramik_Setu_System SHALL present language selection options including Hindi and major regional languages
2. WHEN a user provides their mobile number, THE Shramik_Setu_System SHALL send an OTP and verify the number within 60 seconds
3. WHEN a user provides E-Shram card details, THE E_Shram_Validator SHALL verify credentials against the government database and return validation status
4. WHEN E-Shram validation succeeds, THE Shramik_Setu_System SHALL extract and store verified worker information including skills and location
5. WHEN users select their role (Worker/Contractor), THE Shramik_Setu_System SHALL configure appropriate interface permissions and features
6. WHEN biometric authentication is available, THE Shramik_Setu_System SHALL enable passkey setup for future secure access

### Requirement 3: Geospatial Job Marketplace

**User Story:** As a worker, I want to find job opportunities near my location, so that I can access work without expensive transportation.

#### Acceptance Criteria

1. WHEN a worker searches for jobs, THE Geospatial_Matcher SHALL return opportunities within the city of the worker sorted by distance
2. WHEN job results are displayed, THE Shramik_Setu_System SHALL show distance, estimated travel time, and job details in the user's preferred language
3. WHEN a worker applies for a job, THE Shramik_Setu_System SHALL notify the contractor and track application status
4. WHEN contractors post jobs, THE Shramik_Setu_System SHALL require location, wage rate, duration, and skill requirements
5. WHEN job matching occurs, THE Geospatial_Matcher SHALL prioritize workers based on proximity, skills, and trust tier ratings

### Requirement 4: Dual Rating and Trust System

**User Story:** As a platform user, I want to rate my interactions with other users, so that the community can build trust and identify reliable workers and fair contractors.

#### Acceptance Criteria

1. WHEN a job is completed, THE Trust_Tier_System SHALL prompt both worker and contractor to provide ratings on a 5-point scale
2. WHEN workers rate contractors, THE Trust_Tier_System SHALL capture feedback on payment timeliness, working conditions, and treatment
3. WHEN contractors rate workers, THE Trust_Tier_System SHALL capture feedback on work quality, punctuality, and reliability
4. WHEN users view profiles, THE Trust_Tier_System SHALL display current trust tier and recent rating summaries

### Requirement 5: TOTP-Based Attendance Verification

**User Story:** As a contractor, I want to verify worker attendance securely without complex technology, so that I can maintain accurate records and prevent attendance fraud.

#### Acceptance Criteria

1. WHEN a contractor starts a work session, THE TOTP_Attendance SHALL generate a unique 6-digit code valid for 5 minutes
2. WHEN a worker arrives at the job site, THE TOTP_Attendance SHALL accept the code entry and mark the worker as present
3. WHEN the TOTP code expires, THE TOTP_Attendance SHALL generate a new code and invalidate the previous one
4. WHEN attendance is marked, THE TOTP_Attendance SHALL create an immutable audit record with timestamp and location
5. WHEN attendance disputes arise, THE TOTP_Attendance SHALL provide verifiable attendance logs with cryptographic integrity

### Requirement 6: Financial Compliance and E-Khata System

**User Story:** As a worker, I want to track my wages and verify that I'm being paid according to minimum wage laws, so that I can ensure fair compensation and have records for disputes.

#### Acceptance Criteria

1. WHEN wage payments are recorded, THE E_Khata_Ledger SHALL store transaction details including amount, date, work description, and contractor information
2. WHEN payslips are uploaded, THE Payslip_Auditor SHALL extract wage information using OCR and validate against Minimum Wage Act 1948 requirements
3. WHEN wage violations are detected, THE Payslip_Auditor SHALL flag discrepancies and suggest corrective actions
4. WHEN workers request payment history, THE E_Khata_Ledger SHALL provide comprehensive wage reports with compliance status
5. WHEN advances are given, THE E_Khata_Ledger SHALL track advance amounts and automatically deduct from future wage calculations

### Requirement 7: Voice-Based Grievance and Safety Reporting

**User Story:** As a worker facing workplace issues, I want to report problems through voice recordings in my native language, so that I can seek help even if I cannot write formal complaints.

#### Acceptance Criteria

1. WHEN a worker records a grievance, THE Suraksha_Module SHALL capture high-quality audio and store it securely with encryption
2. WHEN voice grievances are submitted, THE Suraksha_Module SHALL transcribe audio to text and identify key issues using natural language processing
3. WHEN serious violations are detected, THE Suraksha_Module SHALL automatically flag cases for urgent review and potential legal aid referral
4. WHEN workers choose anonymous reporting, THE Suraksha_Module SHALL protect user identity while maintaining case integrity
5. WHEN grievances require follow-up, THE Suraksha_Module SHALL notify relevant NGOs or legal aid organizations based on issue type and location

### Requirement 8: Offline-First Data Synchronization

**User Story:** As a user in areas with poor connectivity, I want to use the platform offline and have my data sync when connection is restored, so that I can access essential features regardless of network availability.

#### Acceptance Criteria

1. WHEN the device is offline, THE Delta_Sync SHALL allow users to view cached job listings, attendance records, and payment history
2. WHEN users perform actions offline, THE Delta_Sync SHALL queue operations locally with conflict resolution metadata with a feasible queue limit
3. WHEN connectivity is restored, THE Delta_Sync SHALL synchronize queued operations with the server using optimistic conflict resolution
4. WHEN data conflicts occur during sync, THE Delta_Sync SHALL prioritize server data for financial records and user data for preferences
5. WHEN critical operations fail to sync, THE Delta_Sync SHALL notify users and provide manual resolution options

### Requirement 9: Accessibility and High Contrast Interface

**User Story:** As a user with visual impairments or working in bright outdoor conditions, I want a high-contrast interface with large, clear elements, so that I can use the platform effectively in various lighting conditions.

#### Acceptance Criteria

1. WHEN high contrast mode is enabled, THE Shramik_Setu_System SHALL use color combinations that meet WCAG AAA contrast ratio standards
2. WHEN users interact with UI elements, THE Shramik_Setu_System SHALL provide clear visual feedback with sufficient color contrast and size
3. WHEN text is displayed, THE Shramik_Setu_System SHALL use fonts and sizes optimized for readability in outdoor lighting conditions
4. WHEN users navigate the interface, THE Shramik_Setu_System SHALL support screen reader compatibility and keyboard navigation
5. WHEN visual elements convey information, THE Shramik_Setu_System SHALL provide alternative text descriptions and audio cues

### Requirement 10: Progressive Web App Performance and Installation

**User Story:** As a user with limited device storage and data, I want a fast, installable app that works efficiently on basic smartphones, so that I can access the platform without consuming excessive resources.

#### Acceptance Criteria

1. WHEN users first visit the platform, THE Shramik_Setu_System SHALL load the initial interface within 3 seconds on 2G/3G/4G/5G connections
2. WHEN the PWA is installed, THE Shramik_Setu_System SHALL function as a native app with offline capabilities and push notifications
3. WHEN users navigate between features, THE Shramik_Setu_System SHALL provide smooth transitions with loading times under 1 second for cached content
4. WHEN the app updates, THE Shramik_Setu_System SHALL download updates in the background and prompt users to refresh when ready
5. WHEN device storage is limited, THE Shramik_Setu_System SHALL manage cache size intelligently, prioritizing essential features and recent data

### Requirement 11: OCR-Powered Payslip Processing and Document Analysis

**User Story:** As a worker, I want to upload photos of my payslips and have the system automatically extract wage information, so that I can track my earnings and verify legal compliance without manual data entry.

#### Acceptance Criteria

1. WHEN a user uploads a payslip image, THE Payslip_Auditor SHALL use OCR technology to extract text from the document
2. WHEN text extraction completes, THE Payslip_Auditor SHALL parse wage amounts, dates, employer information, and work hours
3. WHEN parsing payslip data, THE Payslip_Auditor SHALL validate extracted information for completeness and accuracy
4. IF OCR extraction fails or produces unclear results,it should try again,failing which THE Payslip_Auditor SHALL request manual verification from the user
5. WHEN payslip processing succeeds, THE Payslip_Auditor SHALL store the structured wage data in the user's E_Khata_Ledger
6. THE Payslip_Auditor SHALL support common Indian payslip formats and handle multiple languages including handwritten text
7. WHEN processing sensitive financial data, THE Payslip_Auditor SHALL encrypt all stored information

### Requirement 13: Advanced AI Integration and Natural Language Processing

**User Story:** As a user, I want to use natural voice commands to perform complex tasks like wage calculations and job searches, so that I can access advanced features without complex navigation.

#### Acceptance Criteria

1. WHEN users speak commands, THE Voice_Assistant SHALL use AI to understand intent and extract relevant parameters from natural language
2. WHEN processing voice commands, THE Voice_Assistant SHALL handle natural language variations, colloquial expressions, and mixed-language conversations
3. THE Voice_Assistant SHALL support complex multi-step workflows initiated through voice commands
4. WHEN voice commands are ambiguous, THE Voice_Assistant SHALL ask clarifying questions to ensure accurate processing
5. WHEN executing voice commands, THE Voice_Assistant SHALL provide spoken confirmations and status updates using Amazon Polly
6. THE Voice_Assistant SHALL learn from user interactions to improve command recognition and response accuracy over time
7. WHILE processing voice commands, THE Voice_Assistant SHALL maintain conversation context across multiple exchanges

### Requirement 14: Data Security and Privacy Protection

**User Story:** As a user sharing sensitive financial and personal information, I want my data to be securely stored and protected according to Indian data protection regulations, so that I can trust the platform with my private information.

#### Acceptance Criteria

1. WHEN storing user data, THE Shramik_Setu_System SHALL encrypt all sensitive information using industry-standard encryption
2. WHEN transmitting data to cloud services, THE Shramik_Setu_System SHALL use secure HTTPS connections and API authentication
3. THE Shramik_Setu_System SHALL implement role-based access control to ensure users only access their own data
4. WHEN handling E-Shram card information, THE Shramik_Setu_System SHALL comply with Indian data protection regulations and government guidelines
5. WHEN users request data deletion, THE Shramik_Setu_System SHALL permanently remove all personal information from all systems
6. THE Shramik_Setu_System SHALL regularly audit access logs and detect suspicious activities
7. WHILE processing financial data, THE Shramik_Setu_System SHALL maintain audit trails for compliance and dispute resolution purposes

### Requirement 15: Legal Compliance and Wage Verification Engine

**User Story:** As a worker, I want the system to automatically check if my wages comply with Indian labor laws and government schemes, so that I can identify potential violations and understand my rights and benefits.

#### Acceptance Criteria

1. WHEN wage data is processed, THE E_Khata_Ledger SHALL validate compliance with the Minimum Wage Act 1948 for the relevant state and industry
2. WHEN calculating legal compliance, THE E_Khata_Ledger SHALL apply current Labour Act provisions for overtime, holidays, and working hours
3. WHEN wage calculations occur, THE E_Khata_Ledger SHALL cross-reference with PM Shram Yogi Maandhan scheme benefits and eligibility
4. WHEN a wage violation is detected, THE E_Khata_Ledger SHALL provide clear explanations of the violation and worker rights
5. THE E_Khata_Ledger SHALL maintain up-to-date wage rates and legal requirements for all Indian states and union territories
6. WHILE processing wage calculations, THE E_Khata_Ledger SHALL handle different employment types (daily wage, contract, permanent, piece-rate)
