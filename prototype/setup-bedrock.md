# AWS Bedrock Setup Guide

## Step 1: Enable Bedrock Model Access

1. Go to AWS Console: https://console.aws.amazon.com
2. Navigate to **Amazon Bedrock** service
3. Go to **Model access** in left sidebar
4. Click **Request model access**
5. Enable these models (recommended):
   - **Claude 3 Haiku** (fast, cheap for chat)
   - **Claude 3 Sonnet** (balanced performance)
   - **Titan Text G1 - Express** (AWS native)
   - **Llama 2 Chat 13B** (open source option)

6. Submit request (usually approved in 5-10 minutes)

## Step 2: Verify Access

```bash
aws bedrock list-foundation-models --region ap-south-1
```

Should show available models.

## Step 3: Test Bedrock API

```bash
aws bedrock-runtime invoke-model \
  --region ap-south-1 \
  --model-id anthropic.claude-3-haiku-20240307-v1:0 \
  --body '{"messages":[{"role":"user","content":"Hello"}],"max_tokens":100}' \
  --cli-binary-format raw-in-base64-out \
  output.json
```

## Models Available in ap-south-1:
- anthropic.claude-3-haiku-20240307-v1:0
- anthropic.claude-3-sonnet-20240229-v1:0
- amazon.titan-text-express-v1
- meta.llama2-13b-chat-v1

## Cost Estimates:
- Claude 3 Haiku: $0.25 per 1M input tokens, $1.25 per 1M output tokens
- Very affordable for hackathon demo!

## ✅ What's Already Integrated:

### 🤖 AI Assistant Features:
1. **Smart Payslip Analysis** - AI explains wage calculations and finds compliance issues
2. **Job Recommendations** - AI suggests suitable jobs based on worker profile
3. **Grievance Writing Help** - AI helps write professional complaints
4. **Skills Assessment** - AI evaluates worker capabilities
5. **Contract Review** - AI reviews job contracts for fairness
6. **General Chat** - AI answers worker questions about rights, wages, jobs

### 🎯 How to Test:
1. Run `npm run dev` in ShramSetu folder
2. Go to "🤖 AI Assistant" tab
3. Toggle between "AWS Bedrock AI" and "Mock AI" modes
4. Try quick actions or ask questions like:
   - "Help me understand my payslip"
   - "I'm looking for a construction job"
   - "What are my worker rights?"
   - "Help me write a grievance about unpaid wages"

### 🔧 Mock Mode:
- Works without AWS Bedrock access
- Provides realistic responses for demo
- Perfect for hackathon presentation if Bedrock isn't enabled yet

### 🚀 AWS Bedrock Mode:
- Uses real AI models (Claude 3 Haiku by default)
- Provides intelligent, contextual responses
- Supports Hindi/English mixed responses
- Costs ~$0.01 per conversation for demo

## 🎬 Demo Script Ideas:

1. **Show AI helping with payslip**: "My salary seems wrong, can you check?"
2. **Job search assistance**: "I'm a construction worker looking for jobs in Mumbai"
3. **Grievance writing**: "My employer isn't paying overtime, help me write a complaint"
4. **Worker rights**: "What are my rights as a daily wage worker?"

## 🏆 Hackathon Impact:

**Before**: Workers struggle with complex payslips, don't know their rights, can't write formal complaints

**After**: AI assistant provides instant help in Hindi/English, explains everything simply, empowers workers with knowledge

This makes your app **truly intelligent** and shows deep understanding of worker problems!