# AWS Bedrock Setup Guide

## What is Bedrock?
AWS Bedrock provides AI-powered features for ShramSetu:
- AI Chat Assistant for worker queries
- Payslip analysis and wage compliance checking
- Job recommendations based on worker profile
- Grievance writing assistance
- Skills assessment
- Contract review

## Local Development Setup

### Prerequisites
- AWS credentials in `.env` file (already configured)
- Node.js and npm installed

### How to Run

**Step 1: Start the Bedrock Server**
```bash
npm run bedrock-server
```

This starts a local server on `http://localhost:3002` that proxies requests to AWS Bedrock.

**Step 2: Start the React App** (in a separate terminal)
```bash
npm run dev
```

This starts your React app on `http://localhost:5173` or `http://localhost:5174`.

**Step 3: Test the AI Assistant**
1. Open the app in your browser
2. Navigate to the AI Assistant tab
3. Make sure the toggle shows "🤖 AWS Bedrock AI" (not Mock AI)
4. Try asking a question or use a quick action button

### How It Works

```
React App (Browser)
    ↓
    | HTTP Request to http://localhost:3002/chat
    ↓
Local Bedrock Server (Node.js)
    ↓
    | AWS SDK with credentials from .env
    ↓
AWS Bedrock API (Claude 3 Sonnet)
    ↓
    | AI Response
    ↓
Local Bedrock Server
    ↓
    | JSON Response
    ↓
React App (Browser)
```

### Configuration

The `.env` file is configured for local development:

```env
# For local development
VITE_BEDROCK_API_URL=http://localhost:3002

# For production deployment
# VITE_BEDROCK_API_URL=https://04o7dnpb7i.execute-api.ap-south-1.amazonaws.com/prod
```

### Testing

**Health Check:**
```bash
curl http://localhost:3002/health
```

**Test Chat Request:**
```bash
curl -X POST http://localhost:3002/chat \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What are worker rights in India?",
    "maxTokens": 500
  }'
```

### Features Available

1. **AI Chat Assistant** (`/ai-assistant`)
   - General worker queries
   - Job advice
   - Rights information
   - Skill development tips

2. **Payslip Analysis**
   - Wage compliance checking
   - Deduction verification
   - Minimum wage validation

3. **Job Recommendations**
   - Personalized job matching
   - Skill gap analysis
   - Career advice

4. **Grievance Writing**
   - Professional complaint drafting
   - Evidence suggestions
   - Next steps guidance

5. **Skills Assessment**
   - Current skill evaluation
   - Career path suggestions
   - Training recommendations

6. **Contract Review**
   - Legal clause analysis
   - Red flag identification
   - Worker rights protection

### Troubleshooting

**Issue: "Bedrock API error"**
- Check if bedrock-server is running on port 3002
- Verify AWS credentials in `.env` file
- Check console logs in bedrock-server terminal

**Issue: "Access denied"**
- Verify AWS credentials have Bedrock permissions
- Check IAM policy includes `bedrock:InvokeModel`

**Issue: "Invalid payment method"**
- AWS Bedrock requires a valid payment method on your account
- Add payment method in AWS Console
- Or use Mock AI mode for testing

**Issue: "CORS error"**
- Make sure bedrock-server is running
- Check that VITE_BEDROCK_API_URL points to http://localhost:3002

### Mock AI Mode

If you don't want to use AWS Bedrock (to save costs or for testing), you can toggle to Mock AI mode:

1. In the AI Assistant component, toggle the switch to "🎭 Mock AI"
2. This uses pre-written responses instead of calling AWS Bedrock
3. No AWS charges, but responses are generic

### Production Deployment

For production, you'll use the Lambda proxy instead of the local server:

1. Update `.env`:
   ```env
   VITE_BEDROCK_API_URL=https://04o7dnpb7i.execute-api.ap-south-1.amazonaws.com/prod
   ```

2. Deploy the Lambda function:
   ```bash
   cd infrastructure
   npm run deploy:bedrock
   ```

3. The Lambda function handles authentication and proxies to Bedrock

### Cost Considerations

AWS Bedrock charges per token:
- Input tokens: ~$0.003 per 1K tokens
- Output tokens: ~$0.015 per 1K tokens

Typical costs:
- Simple query: $0.001 - $0.005
- Payslip analysis: $0.01 - $0.03
- Contract review: $0.02 - $0.05

Use Mock AI mode during development to avoid charges!

## Summary

✅ **Local Development:**
- Run `npm run bedrock-server` (port 3002)
- Run `npm run dev` (port 5173/5174)
- Use `VITE_BEDROCK_API_URL=http://localhost:3002`

✅ **Production:**
- Use Lambda proxy endpoint
- No local server needed
- Lambda handles authentication

✅ **Testing:**
- Toggle between AWS Bedrock AI and Mock AI
- Mock AI is free and instant
- AWS Bedrock AI is intelligent but costs money

🎉 **You're all set!** The Bedrock functionality should now work properly.
