/**
 * Quick Bedrock Test Script with Bearer Token
 * Run this to check if Bedrock is working with your bearer token
 */

async function testMultipleModels() {
  console.log('🔍 Testing multiple Claude models with Bearer Token...\n');

  // Get bearer token from environment variable
  const bearerToken = process.env.AWS_BEARER_TOKEN_BEDROCK;
  const apiEndpoint = 'https://bedrock-runtime.ap-south-1.amazonaws.com';
  
  if (!bearerToken) {
    console.error('❌ ERROR: AWS_BEARER_TOKEN_BEDROCK environment variable not set!');
    console.log('💡 Set it with: export AWS_BEARER_TOKEN_BEDROCK=your_token_here');
    return null;
  }
  
  // Try different model IDs for Claude 3.5 Haiku
  const modelIds = [
    'anthropic.claude-3-5-haiku-20241022-v1:0',
    'anthropic.claude-3-haiku-20240307-v1:0',
    'anthropic.claude-3-sonnet-20240229-v1:0',
    'anthropic.claude-v2:1',
    'anthropic.claude-instant-v1'
  ];

  for (const modelId of modelIds) {
    try {
      console.log(`📤 Testing model: ${modelId}`);
      
      const body = {
        anthropic_version: "bedrock-2023-05-31",
        messages: [
          {
            role: 'user',
            content: 'Hello! Reply with just "Working!"'
          }
        ],
        max_tokens: 20,
        temperature: 0.1
      };

      const response = await fetch(`${apiEndpoint}/model/${modelId}/invoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const responseBody = await response.json();
        console.log(`✅ SUCCESS with ${modelId}!`);
        console.log('🤖 AI Response:', responseBody.content[0].text);
        console.log('💰 Usage:', responseBody.usage);
        console.log('\n🎉 This model works with your bearer token!\n');
        return modelId; // Return the working model
      } else {
        const errorText = await response.text();
        console.log(`❌ Failed with ${modelId}: ${response.status} - ${errorText.substring(0, 100)}...\n`);
      }
      
    } catch (error) {
      console.log(`❌ Error with ${modelId}: ${error.message.substring(0, 100)}...\n`);
    }
  }
  
  console.log('❌ None of the models worked. The payment method issue affects all models.');
  return null;
}

testMultipleModels();