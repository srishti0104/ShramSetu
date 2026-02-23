# shram-Setu Infrastructure

AWS CDK infrastructure for the shram-Setu platform.

## Prerequisites

- Node.js 18+
- AWS CLI configured with appropriate credentials
- AWS CDK CLI installed globally: `npm install -g aws-cdk`

## Setup

```bash
cd infrastructure
npm install
```

## Deployment

### First-time deployment

```bash
# Bootstrap CDK (only needed once per account/region)
cdk bootstrap

# Deploy the stack
npm run deploy
```

### Subsequent deployments

```bash
npm run deploy
```

## Infrastructure Components

### Data Layer
- **DynamoDB Tables**: Users, Jobs, Ratings, Sync Operations, Attendance
- **PostgreSQL RDS**: Financial ledger with ACID compliance
- **S3 Buckets**: Audio recordings, payslip images, documents
- **ElastiCache Redis**: Session management and TOTP codes

### Security
- **KMS Key**: Customer-managed encryption key with automatic rotation
- **VPC**: Private subnets for RDS and ElastiCache
- **Security Groups**: Network isolation for databases

### Compute & API
- **API Gateway**: REST API with rate limiting
- **Lambda Execution Role**: Pre-configured with necessary permissions

### AWS AI/ML Services (Permissions Granted)
- Amazon Transcribe (Speech-to-text)
- Amazon Polly (Text-to-speech)
- Amazon Lex (NLU)
- Amazon Textract (OCR)
- Amazon Rekognition (Image analysis)
- Amazon Comprehend (Sentiment analysis)
- Amazon Location Service (Geospatial)

## Useful Commands

- `npm run build` - Compile TypeScript to JavaScript
- `npm run watch` - Watch for changes and compile
- `npm run cdk synth` - Synthesize CloudFormation template
- `npm run cdk diff` - Compare deployed stack with current state
- `npm run deploy` - Deploy stack to AWS
- `npm run destroy` - Destroy the stack (use with caution)

## Outputs

After deployment, the stack outputs the following values:
- API Gateway endpoint URL
- DynamoDB table names
- S3 bucket names
- RDS endpoint
- Redis endpoint
- KMS encryption key ID

## Cost Optimization

- DynamoDB uses on-demand billing
- RDS uses t3.small instance (can be scaled)
- ElastiCache uses t3.micro instance
- S3 lifecycle policies for cost-effective storage

## Security Features

- All data encrypted at rest using KMS
- TLS 1.3 for data in transit
- VPC isolation for databases
- Point-in-time recovery for DynamoDB
- Multi-AZ deployment for RDS
- Versioning enabled for S3 buckets

