# Shram Setu Ratings System - Production Deployment Guide

## Overview

This guide will help you deploy the comprehensive rating system to AWS production environment. The system includes:

- **DynamoDB Table**: For storing ratings data
- **Lambda Functions**: For processing ratings and statistics
- **API Gateway**: For REST API endpoints
- **EventBridge**: For event-driven tier calculations
- **CloudWatch**: For monitoring and logging

## Prerequisites

### 1. AWS CLI Configuration
```bash
aws configure
# Enter your AWS Access Key ID, Secret Access Key, and Region (ap-south-1)
```

### 2. Node.js and Dependencies
```bash
# Install Node.js 18+ and npm
node --version  # Should be 18+
npm --version
```

### 3. AWS CDK
```bash
npm install -g aws-cdk
cdk --version
```

## Deployment Steps

### Step 1: Navigate to Infrastructure Directory
```bash
cd ShramSetu/prototype/infrastructure
```

### Step 2: Run Deployment Script

**For Linux/Mac:**
```bash
chmod +x deploy-ratings.sh
./deploy-ratings.sh
```

**For Windows:**
```cmd
deploy-ratings.bat
```

### Step 3: Verify Deployment

The script will:
1. ✅ Install Lambda layer dependencies
2. ✅ Bootstrap CDK (if needed)
3. ✅ Deploy the complete stack
4. ✅ Create DynamoDB table with indexes
5. ✅ Deploy Lambda functions
6. ✅ Create API Gateway endpoints
7. ✅ Set up EventBridge rules
8. ✅ Update your .env file automatically

## API Endpoints

After deployment, you'll have these production endpoints:

```
POST   /ratings/submit              - Submit a new rating
GET    /ratings/profile/{userId}    - Get user trust profile
GET    /ratings/statistics/{userId} - Get comprehensive statistics
GET    /ratings/user/{userId}/ratings - Get user's ratings history
```

## Environment Configuration

### Development (.env)
```env
# Local development with mock server
VITE_RATINGS_API_URL=http://localhost:3003
```

### Production (.env)
```env
# Production API Gateway (updated automatically by deployment)
VITE_RATINGS_API_URL=https://your-api-id.execute-api.ap-south-1.amazonaws.com/prod
```

## Testing the Deployment

### 1. Health Check
```bash
curl -X GET "https://your-api-id.execute-api.ap-south-1.amazonaws.com/prod/ratings/profile/test-user"
```

### 2. Submit Test Rating
```bash
curl -X POST "https://your-api-id.execute-api.ap-south-1.amazonaws.com/prod/ratings/submit" \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "test-job-123",
    "raterId": "worker-456",
    "rateeId": "employer-789",
    "raterType": "worker",
    "score": 5,
    "feedback": {
      "categories": {
        "payment_timeliness": 5,
        "work_conditions": 4,
        "communication": 5
      },
      "comment": "Great employer to work with!",
      "tags": ["timely_payment", "good_behavior"]
    }
  }'
```

### 3. Get Statistics
```bash
curl -X GET "https://your-api-id.execute-api.ap-south-1.amazonaws.com/prod/ratings/statistics/employer-789?type=employer"
```

## Architecture

```
Frontend (React)
    ↓
API Gateway
    ↓
Lambda Functions
    ↓
DynamoDB + EventBridge
```

### Components

1. **DynamoDB Table**: `Shram-setu-ratings`
   - Partition Key: `ratingId`
   - GSI: `toUserId-index` (for getting ratings received)
   - GSI: `fromUserId-index` (for getting ratings given)

2. **Lambda Functions**:
   - `submit-rating`: Validates and stores ratings
   - `get-profile`: Retrieves user trust profiles
   - `get-statistics`: Calculates comprehensive statistics
   - `calculate-tier`: Updates trust tiers (EventBridge triggered)

3. **API Gateway**: RESTful endpoints with CORS enabled

4. **EventBridge**: Triggers tier recalculation on new ratings

## Monitoring

### CloudWatch Metrics
- Lambda function invocations
- Error rates and duration
- DynamoDB read/write capacity
- API Gateway request counts

### Alarms
- Lambda error rate > 5 errors in 2 periods
- DynamoDB throttling
- API Gateway 5xx errors

## Security

### IAM Roles
- Lambda execution role with minimal permissions
- DynamoDB read/write access only to ratings table
- EventBridge publish permissions

### API Gateway
- CORS enabled for frontend access
- Rate limiting: 1000 requests/second
- Burst limit: 2000 requests

## Cost Optimization

### DynamoDB
- Pay-per-request billing
- Point-in-time recovery enabled
- Encryption at rest

### Lambda
- Right-sized memory allocation
- Efficient code with minimal cold starts
- Shared layer for common dependencies

## Troubleshooting

### Common Issues

1. **Deployment Fails**
   ```bash
   # Check AWS credentials
   aws sts get-caller-identity
   
   # Check CDK bootstrap
   cdk bootstrap aws://ACCOUNT/REGION
   ```

2. **API Returns 500 Errors**
   ```bash
   # Check Lambda logs
   aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/ShramSetuRatingsStack"
   ```

3. **DynamoDB Access Denied**
   - Verify IAM role permissions
   - Check table name in environment variables

### Logs Location
```bash
# Lambda function logs
/aws/lambda/ShramSetuRatingsStack-SubmitRatingFunction-*
/aws/lambda/ShramSetuRatingsStack-GetStatisticsFunction-*
/aws/lambda/ShramSetuRatingsStack-CalculateTierFunction-*

# API Gateway logs
/aws/apigateway/ShramSetuRatingsStack-RatingsApi-*
```

## Cleanup

To remove all resources:
```bash
cdk destroy ShramSetuRatingsStack
```

**⚠️ Warning**: This will delete all rating data in DynamoDB!

## Support

For issues or questions:
1. Check CloudWatch logs for error details
2. Verify environment variables are correct
3. Test individual Lambda functions in AWS Console
4. Check API Gateway integration settings

## Next Steps

After successful deployment:
1. ✅ Update frontend to use production API
2. ✅ Test all rating workflows
3. ✅ Set up monitoring dashboards
4. ✅ Configure backup policies
5. ✅ Set up CI/CD pipeline for updates