/**
 * Test Bedrock Lambda Proxy
 */

import dotenv from 'dotenv';
dotenv.config();

async function testProxy() {
  console.log('🔍 Testing Bedrock Lambda Proxy...\n');
  console.log('⏰ Current Time:', new Date().toLocaleString('en-IN'));
  console.log('📍 Testing payment method activation...\n');

  const proxyUrl = process.env.VITE_BEDROCK_API_URL;

  try {
    console.log('📤 Sending test request to proxy...');
    
    const response = await fetch(`${proxyUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: 'Hello! Reply with just "Proxy is working!"',
        modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
        maxTokens: 20
      })
    });

    console.log('📡 Response status:', response.status);

    if (response.ok) {
      const responseBody = await response.json();
      console.log('\n✅ SUCCESS! Payment method is ACTIVE!');
      console.log('🤖 AI Response:', responseBody.content);
      console.log('💰 Usage:', responseBody.usage);
      console.log('\n🎉 Your AWS Bedrock is now working!');
      console.log('🚀 You can now use real AI in your app!');
    } else {
      const errorText = await response.text();
      console.log('\n❌ Payment method NOT YET ACTIVE');
      console.log('🔍 Error:', errorText.substring(0, 200));
      
      if (errorText.includes('INVALID_PAYMENT_INSTRUMENT')) {
        console.log('\n⏰ Status: Payment method verification in progress');
        console.log('⏳ Expected wait: 2-24 hours from when you added payment method');
        console.log('📧 Check your email for AWS verification messages');
        console.log('🔄 Run this test again in a few hours');
      }
    }
    
  } catch (error) {
    console.log('\n❌ Network error:', error.message);
  }
}

testProxy();