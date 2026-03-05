/**
 * Local Bedrock Server
 * 
 * This server acts as a proxy between your React app and AWS Bedrock API.
 * It runs locally and uses AWS credentials from .env file.
 * 
 * WHY THIS EXISTS:
 * - AWS Bedrock SDK cannot be used directly in browser (CORS issues)
 * - We need a Node.js server to make AWS API calls
 * - This keeps credentials secure (not exposed to browser)
 * 
 * HOW TO USE:
 * 1. Make sure .env has AWS credentials
 * 2. Run: npm run bedrock-server
 * 3. Server runs on http://localhost:3002
 * 4. React app sends requests to this server
 * 5. Server forwards to AWS Bedrock and returns response
 */

const express = require('express');
const cors = require('cors');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
require('dotenv').config();

const app = express();
const PORT = 3002;

// Enable CORS for all origins (for local development)
app.use(cors());
app.use(express.json());

// Initialize Bedrock client with credentials from .env
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.VITE_AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.VITE_AWS_SECRET_ACCESS_KEY
  }
});

const DEFAULT_MODEL = 'global.amazon.nova-2-lite-v1:0';

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Local Bedrock Server',
    port: PORT,
    region: process.env.VITE_AWS_REGION || 'ap-south-1',
    hasCredentials: !!(process.env.VITE_AWS_ACCESS_KEY_ID && process.env.VITE_AWS_SECRET_ACCESS_KEY)
  });
});

// Chat endpoint - matches Lambda proxy API
app.post('/chat', async (req, res) => {
  console.log('📨 Received Bedrock request');
  
  try {
    const { prompt, modelId = DEFAULT_MODEL, maxTokens = 500 } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    console.log('🤖 Model:', modelId);
    console.log('💬 Prompt length:', prompt.length);
    console.log('🎯 Max tokens:', maxTokens);

    // Prepare request body based on model type
    let bedrockBody;
    
    if (modelId.includes('anthropic.claude')) {
      // Claude format
      bedrockBody = {
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
    } else if (modelId.includes('amazon.nova')) {
      // Amazon Nova format
      bedrockBody = {
        messages: [
          {
            role: 'user',
            content: [
              {
                text: prompt
              }
            ]
          }
        ],
        inferenceConfig: {
          max_new_tokens: maxTokens,
          temperature: 0.7
        }
      };
    } else {
      // Default format (try Nova format)
      bedrockBody = {
        messages: [
          {
            role: 'user',
            content: [
              {
                text: prompt
              }
            ]
          }
        ],
        inferenceConfig: {
          max_new_tokens: maxTokens,
          temperature: 0.7
        }
      };
    }

    // Create command
    const command = new InvokeModelCommand({
      modelId,
      body: JSON.stringify(bedrockBody),
      contentType: 'application/json'
    });

    console.log('🔄 Sending request to AWS Bedrock...');
    
    // Send request to Bedrock
    const response = await bedrockClient.send(command);
    
    // Parse response
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    console.log('✅ Bedrock response received');
    console.log('📊 Usage:', responseBody.usage);

    // Extract content based on model type
    let content;
    if (responseBody.content && Array.isArray(responseBody.content)) {
      // Claude format: content is array with text property
      content = responseBody.content[0].text;
    } else if (responseBody.output && responseBody.output.message) {
      // Nova format: output.message.content array
      content = responseBody.output.message.content[0].text;
    } else {
      // Fallback: try to find text anywhere
      content = responseBody.text || JSON.stringify(responseBody);
    }

    // Return response in same format as Lambda proxy
    res.json({
      success: true,
      content: content,
      usage: responseBody.usage,
      model: modelId
    });

  } catch (error) {
    console.error('❌ Bedrock error:', error);
    
    // Handle specific AWS errors
    let errorMessage = error.message;
    
    if (error.name === 'ValidationException') {
      errorMessage = 'Invalid request format or model ID';
    } else if (error.name === 'AccessDeniedException') {
      errorMessage = 'Access denied - check AWS credentials and permissions';
    } else if (error.name === 'ThrottlingException') {
      errorMessage = 'Too many requests - please wait and try again';
    } else if (error.message.includes('INVALID_PAYMENT_INSTRUMENT')) {
      errorMessage = 'AWS account needs valid payment method';
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage,
      details: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Local Bedrock Server started');
  console.log(`📍 Running on: http://localhost:${PORT}`);
  console.log(`🌍 Region: ${process.env.VITE_AWS_REGION || 'ap-south-1'}`);
  console.log(`🔑 Credentials: ${process.env.VITE_AWS_ACCESS_KEY_ID ? 'Loaded' : 'Missing'}`);
  console.log('');
  console.log('💡 Usage:');
  console.log('   - Health check: GET http://localhost:3002/health');
  console.log('   - Chat: POST http://localhost:3002/chat');
  console.log('');
  console.log('⚠️  Make sure your React app is configured to use:');
  console.log('   VITE_BEDROCK_API_URL=http://localhost:3002');
  console.log('');
  console.log('✨ Ready to process Bedrock requests!');
});
