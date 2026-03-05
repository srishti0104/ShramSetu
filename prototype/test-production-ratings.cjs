/**
 * Production Ratings API Test Script
 * Tests the deployed ratings system endpoints
 */

const https = require('https');

// Configuration - Update with your deployed API Gateway URL
const API_BASE_URL = process.env.VITE_RATINGS_API_URL || 'https://your-api-id.execute-api.ap-south-1.amazonaws.com/prod';

// Test data
const testRating = {
  jobId: `test-job-${Date.now()}`,
  raterId: 'worker-test-123',
  rateeId: 'employer-test-456',
  raterType: 'worker',
  score: 5,
  feedback: {
    categories: {
      payment_timeliness: 5,
      work_conditions: 4,
      communication: 5,
      fairness: 5,
      respect: 4
    },
    comment: 'Excellent employer! Paid on time and provided good working conditions.',
    tags: ['timely_payment', 'good_behavior', 'safe_environment']
  }
};

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE_URL + path);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            data: parsedData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test functions
async function testSubmitRating() {
  console.log('🧪 Testing: Submit Rating');
  console.log('========================');
  
  try {
    const response = await makeRequest('POST', '/ratings/submit', testRating);
    
    if (response.statusCode === 201) {
      console.log('✅ Rating submitted successfully!');
      console.log('📊 Response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } else {
      console.log('❌ Failed to submit rating');
      console.log('📊 Status:', response.statusCode);
      console.log('📊 Response:', response.data);
      return null;
    }
  } catch (error) {
    console.log('❌ Error submitting rating:', error.message);
    return null;
  }
}

async function testGetProfile(userId) {
  console.log(`🧪 Testing: Get Profile for ${userId}`);
  console.log('=====================================');
  
  try {
    const response = await makeRequest('GET', `/ratings/profile/${userId}`);
    
    if (response.statusCode === 200) {
      console.log('✅ Profile retrieved successfully!');
      console.log('📊 Trust Tier:', response.data.tier);
      console.log('📊 Average Rating:', response.data.averageRating);
      console.log('📊 Total Ratings:', response.data.totalRatings);
      return response.data;
    } else {
      console.log('❌ Failed to get profile');
      console.log('📊 Status:', response.statusCode);
      console.log('📊 Response:', response.data);
      return null;
    }
  } catch (error) {
    console.log('❌ Error getting profile:', error.message);
    return null;
  }
}

async function testGetStatistics(userId, userType) {
  console.log(`🧪 Testing: Get Statistics for ${userId} (${userType})`);
  console.log('================================================');
  
  try {
    const response = await makeRequest('GET', `/ratings/statistics/${userId}?type=${userType}`);
    
    if (response.statusCode === 200) {
      console.log('✅ Statistics retrieved successfully!');
      console.log('📊 Evaluation Score:', response.data.evaluationScore);
      console.log('📊 Trust Tier:', response.data.tier);
      console.log('📊 Badges:', response.data.badges.length);
      console.log('📊 Recommendations:', response.data.recommendations.length);
      return response.data;
    } else {
      console.log('❌ Failed to get statistics');
      console.log('📊 Status:', response.statusCode);
      console.log('📊 Response:', response.data);
      return null;
    }
  } catch (error) {
    console.log('❌ Error getting statistics:', error.message);
    return null;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Production Ratings API Tests');
  console.log('=========================================');
  console.log(`🌐 API Base URL: ${API_BASE_URL}`);
  console.log('');

  // Test 1: Submit Rating
  const ratingResult = await testSubmitRating();
  console.log('');

  // Wait a moment for data to be processed
  console.log('⏳ Waiting for data processing...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log('');

  // Test 2: Get Profile
  if (ratingResult) {
    await testGetProfile(testRating.rateeId);
    console.log('');
  }

  // Test 3: Get Statistics
  await testGetStatistics(testRating.rateeId, 'employer');
  console.log('');

  // Test 4: Get Statistics for Worker
  await testGetStatistics(testRating.raterId, 'worker');
  console.log('');

  console.log('🎉 Production tests completed!');
  console.log('');
  console.log('📝 Next Steps:');
  console.log('   1. Check AWS CloudWatch logs for any errors');
  console.log('   2. Verify data in DynamoDB table');
  console.log('   3. Test the frontend with the production API');
  console.log('   4. Set up monitoring and alerts');
}

// Check if API URL is configured
if (API_BASE_URL.includes('your-api-id')) {
  console.log('❌ Please update the API_BASE_URL with your deployed API Gateway URL');
  console.log('💡 You can find it in the deployment outputs or AWS Console');
  console.log('');
  console.log('Example:');
  console.log('export VITE_RATINGS_API_URL=https://abc123.execute-api.ap-south-1.amazonaws.com/prod');
  console.log('node test-production-ratings.js');
  process.exit(1);
}

// Run the tests
runTests().catch(console.error);