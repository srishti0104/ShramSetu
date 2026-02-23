/**
 * Bedrock Lambda Proxy
 * 
 * Acts as a proxy between your React app and AWS Bedrock
 * Handles CORS and authentication
 */

const https = require('https');

const BEARER_TOKEN = process.env.AWS_BEARER_TOKEN_BEDROCK || 'YOUR_BEARER_TOKEN_HERE';
const BEDROCK_ENDPOINT = 'bedrock-runtime.ap-south-1.amazonaws.com';
const DEFAULT_MODEL = 'anthropic.claude-3-sonnet-20240229-v1:0';

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

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

    const postData = JSON.stringify(bedrockBody);

    // Make request to Bedrock
    const response = await makeBedrockRequest(modelId, postData);

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

function makeBedrockRequest(modelId, postData) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BEDROCK_ENDPOINT,
      port: 443,
      path: `/model/${modelId}/invoke`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            resolve(response);
          } catch (parseError) {
            reject(new Error(`Failed to parse response: ${parseError.message}`));
          }
        } else {
          reject(new Error(`Bedrock API error: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request error: ${error.message}`));
    });

    req.write(postData);
    req.end();
  });
}