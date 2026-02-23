/**
 * Test Textract Lambda Function
 * 
 * This script tests the deployed Textract Lambda by sending a sample image
 */

import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.VITE_TEXTRACT_API_URL + '/extract-payslip';

// Create a simple test image (1x1 white pixel PNG)
const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

const payload = JSON.stringify({
  image: testImageBase64
});

const url = new URL(API_URL);

const options = {
  hostname: url.hostname,
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

console.log('🧪 Testing Textract Lambda...');
console.log('📍 Endpoint:', API_URL);

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\n✅ Response Status:', res.statusCode);
    console.log('📦 Response Body:', data);
    
    try {
      const parsed = JSON.parse(data);
      if (parsed.success) {
        console.log('\n✅ Textract Lambda is working!');
        console.log('📄 Extracted data:', JSON.stringify(parsed.data, null, 2));
      } else {
        console.log('\n⚠️ Lambda returned an error:', parsed.error);
      }
    } catch (e) {
      console.log('\n❌ Failed to parse response:', e.message);
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ Request failed:', error.message);
});

req.write(payload);
req.end();
