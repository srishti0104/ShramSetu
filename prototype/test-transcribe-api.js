/**
 * Test Transcribe Lambda API
 */

import { readFileSync } from 'fs';

// Read .env
const envContent = readFileSync('.env', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex > 0) {
      const key = trimmed.substring(0, eqIndex).trim();
      const value = trimmed.substring(eqIndex + 1).trim();
      if (key && value) envVars[key] = value;
    }
  }
});

const transcribeApiUrl = envVars.VITE_TRANSCRIBE_API_URL;

console.log('🔍 Testing Transcribe Lambda API\n');
console.log('API URL:', transcribeApiUrl);

if (!transcribeApiUrl) {
  console.error('❌ VITE_TRANSCRIBE_API_URL not found in .env');
  process.exit(1);
}

// Test API health/info endpoint
console.log('\n1️⃣ Testing API endpoint...');

try {
  const response = await fetch(transcribeApiUrl);
  console.log('Status:', response.status, response.statusText);
  
  if (response.ok) {
    const data = await response.json().catch(() => response.text());
    console.log('Response:', data);
  } else {
    console.log('❌ API returned error status');
  }
} catch (error) {
  console.error('❌ Failed to connect to API:', error.message);
}

// Test with a mock transcribe request
console.log('\n2️⃣ Testing /transcribe endpoint...');

try {
  // Create a tiny mock audio (just for testing the endpoint)
  const mockAudioBase64 = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // 1x1 transparent GIF as placeholder
  
  const response = await fetch(`${transcribeApiUrl}/transcribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      audio: mockAudioBase64,
      audioFormat: 'webm',
      languageCode: 'en-IN',
      userId: 'test-user'
    })
  });

  console.log('Status:', response.status, response.statusText);
  
  const data = await response.json().catch(() => response.text());
  console.log('Response:', JSON.stringify(data, null, 2));

  if (response.ok) {
    console.log('\n✅ API is working!');
  } else {
    console.log('\n⚠️ API returned error - this might be expected for mock data');
  }
} catch (error) {
  console.error('\n❌ API test failed:', error.message);
}

console.log('\n' + '='.repeat(50));
console.log('Test complete!\n');
