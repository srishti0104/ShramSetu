/**
 * Bedrock Lambda Proxy
 * 
 * Acts as a proxy between your React app and AWS Bedrock
 * Handles CORS and authentication using AWS SDK with IAM role
 */

const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const REGION = process.env.REGION || 'ap-south-1';
const DEFAULT_MODEL = 'anthropic.claude-3-sonnet-20240229-v1:0';

// Initialize Bedrock client with Lambda's IAM role
const bedrockClient = new BedrockRuntimeClient({
  region: REGION
});

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  console.log('Using region:', REGION);

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { prompt, modelId = DEFAULT_MODEL, maxTokens = 500 } = body;

    if (!prompt) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Prompt is required' })
      };
    }

    // Prepare Bedrock request
    const bedrockBody = {
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

    // Make request to Bedrock using AWS SDK
    const response = await invokeBedrockModel(modelId, bedrockBody);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        content: response.content[0].text,
        usage: response.usage,
        model: modelId
      })
    };

  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};

/**
 * Invoke Bedrock model using AWS SDK
 */
async function invokeBedrockModel(modelId, bedrockBody) {
  try {
    console.log('Invoking Bedrock model:', modelId);
    
    const command = new InvokeModelCommand({
      modelId: modelId,
      body: JSON.stringify(bedrockBody),
      contentType: 'application/json',
      accept: 'application/json'
    });

    const response = await bedrockClient.send(command);
    
    // Parse the response body
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    console.log('Bedrock invocation successful');
    return responseBody;
    
  } catch (error) {
    console.error('Bedrock invocation error:', error);
    
    // Handle specific AWS errors
    if (error.name === 'AccessDeniedException') {
      throw new Error('Lambda does not have permission to invoke Bedrock. Check IAM role permissions.');
    }
    
    throw error;
  }
}