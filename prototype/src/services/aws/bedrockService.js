/**
 * AWS Bedrock Service
 * 
 * Provides AI-powered features using AWS Bedrock foundation models
 */

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

class BedrockService {
  constructor() {
    // Check if we have a Bedrock proxy API URL
    const proxyApiUrl = import.meta.env.VITE_BEDROCK_API_URL;
    
    console.log('🔍 Bedrock Service Initialization:');
    console.log('📍 Proxy API URL:', proxyApiUrl);
    console.log('🔑 Bearer Token:', import.meta.env.VITE_AWS_BEARER_TOKEN_BEDROCK ? 'Present' : 'Missing');
    
    if (proxyApiUrl) {
      // Use Lambda proxy for browser compatibility
      this.useProxy = true;
      this.proxyApiUrl = proxyApiUrl;
      console.log('✅ Using Bedrock Lambda Proxy:', proxyApiUrl);
    } else {
      // Fallback to direct API calls (may have CORS issues in browser)
      this.useProxy = false;
      console.log('⚠️ No proxy URL found, using direct API calls');
      const bearerToken = import.meta.env.VITE_AWS_BEARER_TOKEN_BEDROCK;
      
      if (bearerToken) {
        this.useBearerToken = true;
        this.bearerToken = bearerToken;
        this.apiEndpoint = 'https://bedrock-runtime.ap-south-1.amazonaws.com';
        console.log('🔑 Using Bearer Token authentication');
      } else {
        this.useBearerToken = false;
        console.log('🔐 Using AWS SDK authentication');
        this.client = new BedrockRuntimeClient({
          region: import.meta.env.VITE_AWS_REGION || 'ap-south-1',
          credentials: {
            accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
            secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
          }
        });
      }
    }
    
    // Use Amazon Nova 2 Lite inference profile
    this.defaultModel = 'global.amazon.nova-2-lite-v1:0';
  }

  /**
   * Generic method to invoke any Bedrock model
   */
  async invokeModel(prompt, modelId = this.defaultModel, maxTokens = 500) {
    try {
      if (this.useProxy) {
        // Use Lambda proxy (recommended for browser)
        return await this.invokeModelWithProxy(prompt, modelId, maxTokens);
      } else if (this.useBearerToken) {
        // Use Bearer Token authentication with direct API call
        return await this.invokeModelWithBearerToken(prompt, modelId, maxTokens);
      } else {
        // Use AWS SDK authentication
        return await this.invokeModelWithSDK(prompt, modelId, maxTokens);
      }
    } catch (error) {
      console.error('Bedrock API error:', error);
      
      // Handle specific AWS Bedrock errors
      if (error.message.includes('INVALID_PAYMENT_INSTRUMENT')) {
        return {
          success: false,
          error: 'AWS account needs valid payment method. Using mock response for demo.',
          content: 'Sorry, AWS Bedrock requires a valid payment method. Please use Mock AI mode for now, or add a payment method to your AWS account.',
          isMockFallback: true
        };
      }
      
      return {
        success: false,
        error: error.message,
        content: null
      };
    }
  }

  /**
   * Invoke model using Lambda Proxy (recommended for browser)
   */
  async invokeModelWithProxy(prompt, modelId, maxTokens) {
    console.log('🔄 Using Lambda Proxy for Bedrock API call...');
    console.log('📍 Model:', modelId);
    console.log('🌐 Proxy URL:', this.proxyApiUrl);

    const response = await fetch(`${this.proxyApiUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        modelId,
        maxTokens
      })
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Proxy API error:', errorText);
      throw new Error(`Proxy API error: ${response.status} - ${errorText}`);
    }

    const responseBody = await response.json();
    console.log('✅ Bedrock API success via proxy!');
    
    return {
      success: responseBody.success,
      content: responseBody.content,
      usage: responseBody.usage
    };
  }

  /**
   * Invoke model using Bearer Token (direct API call)
   */
  async invokeModelWithBearerToken(prompt, modelId, maxTokens) {
    const body = {
      anthropic_version: "bedrock-2023-05-31",
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: maxTokens,
      temperature: 0.7
    };

    console.log('🔄 Using Bearer Token for Bedrock API call...');
    console.log('📍 Model:', modelId);
    console.log('🔑 Token:', this.bearerToken.substring(0, 20) + '...');

    const response = await fetch(`${this.apiEndpoint}/model/${modelId}/invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.bearerToken}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(body)
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Bedrock API error:', errorText);
      throw new Error(`Bedrock API error: ${response.status} - ${errorText}`);
    }

    const responseBody = await response.json();
    console.log('✅ Bedrock API success!');
    
    return {
      success: true,
      content: responseBody.content[0].text,
      usage: responseBody.usage
    };
  }

  /**
   * Invoke model using AWS SDK
   */
  async invokeModelWithSDK(prompt, modelId, maxTokens) {
    const body = {
      anthropic_version: "bedrock-2023-05-31",
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: maxTokens,
      temperature: 0.7
    };

    const command = new InvokeModelCommand({
      modelId,
      body: JSON.stringify(body),
      contentType: 'application/json'
    });

    const response = await this.client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    return {
      success: true,
      content: responseBody.content[0].text,
      usage: responseBody.usage
    };
  }

  /**
   * Analyze payslip and provide insights
   */
  async analyzePayslip(payslipText, workerProfile = {}) {
    const prompt = `
You are an AI assistant helping blue-collar workers in India understand their payslips and identify wage compliance issues.

PAYSLIP DATA:
${payslipText}

WORKER PROFILE:
- State: ${workerProfile.state || 'Not specified'}
- Job Type: ${workerProfile.jobType || 'Not specified'}
- Experience: ${workerProfile.experience || 'Not specified'}

Please analyze this payslip and provide:

1. WAGE BREAKDOWN: Explain each component in simple terms
2. COMPLIANCE CHECK: Check against minimum wage laws
3. ISSUES FOUND: Any problems or discrepancies
4. RECOMMENDATIONS: What the worker should do

Keep the language simple and supportive. Focus on actionable advice.
Respond in a mix of English and Hindi if helpful for the worker.
`;

    return await this.invokeModel(prompt, this.defaultModel, 800);
  }

  /**
   * Generate job recommendations based on worker profile
   */
  async recommendJobs(workerProfile, availableJobs = []) {
    const prompt = `
You are an AI job counselor helping blue-collar workers in India find suitable employment.

WORKER PROFILE:
- Name: ${workerProfile.name || 'Worker'}
- Skills: ${workerProfile.skills || 'Not specified'}
- Experience: ${workerProfile.experience || 'Fresher'}
- Location: ${workerProfile.location || 'Not specified'}
- Preferred Job Type: ${workerProfile.preferredJobType || 'Any'}
- Languages: ${workerProfile.languages || 'Hindi, English'}

AVAILABLE JOBS:
${availableJobs.map(job => `
- ${job.title} at ${job.company}
  Location: ${job.location}
  Salary: ${job.salary}
  Requirements: ${job.requirements}
`).join('\n')}

Please provide:

1. TOP 3 RECOMMENDATIONS: Best matching jobs with reasons
2. SKILL GAPS: What skills the worker should develop
3. CAREER ADVICE: Next steps for career growth
4. TRAINING SUGGESTIONS: Specific courses or certifications

Be encouraging and practical. Use simple language.
`;

    return await this.invokeModel(prompt, this.defaultModel, 1000);
  }

  /**
   * Help worker write a better grievance
   */
  async improveGrievance(originalGrievance, grievanceType = 'general') {
    const prompt = `
You are helping a blue-collar worker in India write a clear, professional grievance letter.

ORIGINAL GRIEVANCE:
"${originalGrievance}"

GRIEVANCE TYPE: ${grievanceType}

Please help improve this grievance by:

1. REWRITTEN VERSION: A clear, professional version
2. KEY POINTS: Main issues highlighted
3. EVIDENCE NEEDED: What documentation to collect
4. NEXT STEPS: Who to submit to and follow-up actions

Keep it respectful but firm. Use simple, clear language.
Include both English and Hindi versions if helpful.
Focus on worker rights and proper procedures.
`;

    return await this.invokeModel(prompt, this.defaultModel, 800);
  }

  /**
   * Assess worker skills from description
   */
  async assessSkills(skillDescription, jobCategory = 'general') {
    const prompt = `
You are an AI skills assessor helping blue-collar workers in India understand their capabilities.

WORKER'S SKILL DESCRIPTION:
"${skillDescription}"

JOB CATEGORY: ${jobCategory}

Please provide:

1. SKILL ASSESSMENT: Rate current skills (Beginner/Intermediate/Advanced)
2. STRENGTHS: What the worker does well
3. IMPROVEMENT AREAS: Skills to develop
4. CAREER PATHS: Suitable job roles
5. TRAINING RECOMMENDATIONS: Specific courses or certifications

Be encouraging and specific. Suggest practical next steps.
Consider Indian job market and available training programs.
`;

    return await this.invokeModel(prompt, this.defaultModel, 700);
  }

  /**
   * Review job contract for fairness
   */
  async reviewContract(contractText, workerConcerns = '') {
    const prompt = `
You are a legal AI assistant helping blue-collar workers in India review job contracts.

CONTRACT TEXT:
${contractText}

WORKER CONCERNS:
${workerConcerns}

Please analyze this contract and provide:

1. SUMMARY: Key terms in simple language
2. RED FLAGS: Concerning clauses or unfair terms
3. WORKER RIGHTS: What protections the worker has
4. RECOMMENDATIONS: Accept, negotiate, or reject?
5. QUESTIONS TO ASK: What to clarify with employer

Focus on Indian labor laws and worker protection.
Use simple language and be practical.
Highlight both positive and negative aspects.
`;

    return await this.invokeModel(prompt, this.defaultModel, 1000);
  }

  /**
   * Chat assistant for general worker queries
   */
  async chatAssistant(userMessage, context = {}) {
    const prompt = `
You are ShramSetu AI, a helpful assistant for blue-collar workers in India.

USER MESSAGE: "${userMessage}"

CONTEXT:
- Worker Location: ${context.location || 'India'}
- Job Type: ${context.jobType || 'Not specified'}
- Language Preference: ${context.language || 'English/Hindi'}

Provide helpful, practical advice related to:
- Job searching and applications
- Wage and labor rights
- Skill development
- Workplace issues
- Government schemes for workers

Keep responses short, actionable, and supportive.
Use simple language and include Hindi phrases when helpful.
`;

    return await this.invokeModel(prompt, this.defaultModel, 400);
  }
}

export default new BedrockService();