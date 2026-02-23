/**
 * Diagnostic script to test Auth API endpoints
 * Run with: node diagnose-auth-api.js
 */

import dotenv from 'dotenv';
dotenv.config();

const API_URL = process.env.VITE_AUTH_API_URL;

async function testEndpoint(name, path, body) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${name}`);
  console.log(`URL: ${API_URL}${path}`);
  console.log(`Body: ${JSON.stringify(body, null, 2)}`);
  console.log('='.repeat(60));

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));

    return { success: response.ok, data };
  } catch (error) {
    console.error('Error:', error.message);
    return { success: false, error: error.message };
  }
}

async function runDiagnostics() {
  console.log('🔍 Starting Auth API Diagnostics...\n');
  console.log(`API Base URL: ${API_URL}`);

  const testPhone = '+919876543210';

  // Test 1: Send OTP
  const sendOTPResult = await testEndpoint(
    'Send OTP',
    '/auth/send-otp',
    { phoneNumber: testPhone }
  );

  if (!sendOTPResult.success) {
    console.log('\n❌ Send OTP failed. Check:');
    console.log('1. Is the API Gateway deployed?');
    console.log('2. Is the Lambda function working?');
    console.log('3. Does the Lambda have SNS permissions?');
    console.log('4. Is AWS SNS configured for SMS?');
    return;
  }

  console.log('\n✅ Send OTP successful!');
  console.log('Note: Check DynamoDB OTPTable for the OTP code');
  console.log('Table name: ShramSetuAuthStack-OTPTable8364059A-RQQ546MZRJ9X');

  // Test 2: Register (without OTP verification for testing)
  const registerResult = await testEndpoint(
    'Register User',
    '/auth/register',
    {
      phoneNumber: testPhone,
      name: 'Test User',
      role: 'worker'
    }
  );

  if (registerResult.success) {
    console.log('\n✅ Registration successful!');
    
    // Test 3: Login
    const loginResult = await testEndpoint(
      'Login User',
      '/auth/login',
      { phoneNumber: testPhone }
    );

    if (loginResult.success) {
      console.log('\n✅ Login successful!');
      console.log('JWT Token:', loginResult.data.token);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Diagnostics Complete!');
  console.log('='.repeat(60));
}

runDiagnostics();
