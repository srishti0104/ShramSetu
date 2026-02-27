# AI for Bharat Hackathon - Credits Allotment Form

## Team and Project Basics

**Team Name:** SHRIKANTHA M

**Note:** This form has been verified against the actual project implementation. All technical details, AWS services, and endpoints have been cross-checked with the deployed infrastructure.

**What is your team building?**
A voice-first Progressive Web Application (PWA) called Shram-Setu that empowers India's blue-collar workforce through accessible technology. The platform addresses critical challenges faced by daily wage workers and contractors: job discovery, wage compliance, attendance tracking, and labor rights enforcement.

**What's your primary AWS Account ID?**
808840719701 (Tanishq_Tanmay account)

---

## Resource Estimation & Necessity

**What does your current progress look like?**
GitHub Repository: https://github.com/srishti0104/ShramSetu

Current implementation includes:
- Complete React + Vite PWA frontend with voice interface
- AWS Bedrock AI Assistant integration (Claude 3 Sonnet)
- AWS Transcribe for voice-to-text conversion
- AWS Comprehend for sentiment analysis
- AWS Location Service for GPS-based job matching
- AWS Textract for payslip OCR processing
- Delta Sync with DynamoDB for offline-first functionality
- 4 deployed Lambda functions (Auth, Textract, Sync, Bedrock)
- Complete infrastructure as code using AWS CDK
- All files organized in prototype folder with design.md and requirements.md in root

---

## Proposed Architecture Stack

**Selected AWS Services:**
- ✅ Amazon Bedrock (AI/GenAI)
- ✅ AWS Lambda (Serverless compute)
- ✅ Amazon S3 (File storage)
- ✅ Amazon DynamoDB (NoSQL database)
- ✅ Amazon Transcribe (Speech-to-text)
- ✅ Amazon Polly (Text-to-speech)
- ✅ Amazon Comprehend (NLP/Sentiment analysis)
- ✅ Amazon Textract (OCR)
- ✅ Amazon Location Service (Geospatial)
- ✅ API Gateway (REST/WebSocket APIs)
- ✅ Amazon RDS PostgreSQL (Financial ledger - ACID compliance)
- ✅ ElastiCache Redis (Session management)

---

## GenAI Model Details

**What's the specific GenAI model you're using?**

**Primary Model:** Amazon Bedrock - Claude 3 Sonnet (anthropic.claude-3-sonnet-20240229-v1:0)

**Use Cases:**
1. **AI Assistant** - Conversational interface for worker queries in Hindi/English
2. **Payslip Analysis** - Analyzing wage compliance and providing insights
3. **Job Recommendations** - Matching workers with suitable opportunities
4. **Grievance Writing Assistance** - Helping workers articulate workplace issues
5. **Skills Assessment** - Evaluating worker capabilities and suggesting career paths
6. **Contract Review** - Analyzing job contracts for fairness

**Additional Models (Planned):**
- Claude 3.5 Haiku for faster, cost-effective responses
- Amazon Transcribe for multi-language voice processing (Hindi + regional languages)

---

## Data Strategy

**What are your data sources, and how will you store and process the data on AWS?**

### Data Sources:
1. **User Input:**
   - Voice recordings (workers with limited literacy)
   - Text input (contractors and literate users)
   - E-Shram card validation (government database integration)
   - GPS location data
   - Uploaded payslip images

2. **Government APIs:**
   - E-Shram database for worker verification
   - Minimum wage data by state/industry

3. **Platform-Generated Data:**
   - Job postings and applications
   - Attendance records (TOTP-based)
   - Transaction history
   - Ratings and reviews
   - Grievance reports

### Data Storage Strategy:

**Amazon DynamoDB (Primary NoSQL):**
- User profiles (workers and contractors)
- Job listings and applications
- Ratings and trust tier data
- Attendance records
- Sync operations queue
- Session management
- **Why:** High-scale, low-latency access for real-time features

**Amazon RDS PostgreSQL:**
- Financial ledger (E-Khata)
- Wage transactions
- Advance tracking
- Compliance audit logs
- **Why:** ACID compliance required for financial data integrity

**Amazon S3:**
- Voice recordings (grievances, commands)
- Payslip images and documents
- User-uploaded files
- Audio responses (cached Polly output)
- **Why:** Cost-effective storage for large files with encryption

**ElastiCache Redis:**
- Active TOTP codes (5-minute validity)
- Session tokens
- API rate limiting
- Frequently accessed data cache
- **Why:** Sub-millisecond latency for real-time operations

### Data Processing Pipeline:

1. **Voice Processing:**
   - Audio → S3 → Transcribe → Text
   - Text → Bedrock/Comprehend → Intent/Sentiment
   - Response → Polly → Audio → S3

2. **OCR Processing:**
   - Image → S3 → Textract → Extracted text
   - Text → Lambda → Parsed wage data
   - Data → RDS (ledger) + DynamoDB (cache)

3. **Geospatial Matching:**
   - Worker location → Location Service → Geocoding
   - Job locations → DynamoDB geospatial index
   - Matching algorithm → Lambda → Ranked results

4. **Offline Sync:**
   - Local IndexedDB → Sync queue → DynamoDB
   - Conflict resolution → Lambda → Merged data
   - Server updates → Push to client

### Data Security:
- **Encryption at rest:** KMS for all databases and S3
- **Encryption in transit:** TLS 1.3 for all communications
- **Field-level encryption:** E-Shram cards, mobile numbers, financial data
- **Access control:** IAM roles with least privilege
- **Audit logging:** CloudTrail for all data access

### Data Compliance:
- Indian data protection regulations
- Minimum Wage Act 1948 compliance
- Labour Act provisions
- E-Shram integration guidelines

---

## 24-Hour Goal

**What is the very first technical milestone you will achieve once credits are credited to your account?**

Activate AWS Bedrock AI Assistant and complete end-to-end testing of the voice-first workflow for blue-collar workers.

**Immediate Actions:**
1. Enable Bedrock Claude 3.5 Sonnet and test Hindi/English voice interactions
2. Validate complete pipeline: Voice → Transcribe → Bedrock → Polly → Response
3. Test core features: Payslip analysis, job recommendations, and grievance assistance
4. Replace all mock modes with real AWS services
5. Set up CloudWatch monitoring and billing alerts

**Success Metrics:**
- AI responds in <2 seconds for voice queries
- 95%+ accuracy for Hindi transcription
- Payslip OCR + AI analysis in <5 seconds
- Cost per interaction under ₹2

**Impact:** This unlocks Shram-Setu's core value - making AI accessible to 450M+ blue-collar workers through voice in their native language, critical for hackathon demo and real-world deployment.

---

## Additional Context

**Current Status:**
- ✅ All infrastructure deployed and working
- ✅ Frontend complete with toggle switches (mock vs real AWS)
- ✅ Lambda functions deployed and tested
- ✅ DynamoDB tables created and populated
- ⏳ Bedrock waiting for payment method activation (2-24 hours)

**Why We Need Credits:**
1. **Bedrock Usage:** Primary AI model for all intelligent features
2. **Transcribe:** Voice-to-text for accessibility (high volume expected)
3. **Polly:** Text-to-speech responses in multiple languages
4. **Textract:** OCR processing for payslip compliance checking
5. **Location Service:** Geospatial matching for job discovery
6. **Data Storage:** DynamoDB, S3, RDS for production workloads

**Expected Usage:**
- 1000+ workers testing during hackathon
- 10,000+ voice interactions
- 5,000+ payslip scans
- 50,000+ geospatial queries
- Continuous AI assistant conversations

**Impact:**
Shram-Setu addresses a critical need for India's 450+ million blue-collar workers who face wage theft, lack of job discovery, and limited access to labor rights. By making AI accessible through voice in regional languages, we're democratizing technology for the "Next Billion Users."

---

## Team Information

**Team Lead:** Srishti (srishti0104)
**Project Name:** Shram-Setu (Project Jan-Nyaya)
**GitHub:** https://github.com/srishti0104/ShramSetu
**Status:** Shortlisted for AI for Bharat Hackathon

**Contact:** tanishqtanmay13216@gmail.com
