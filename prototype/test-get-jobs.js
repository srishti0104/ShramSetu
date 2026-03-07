/**
 * Test fetching jobs from DynamoDB
 */

const testGetJobs = async () => {
  try {
    console.log('🧪 Testing Get Jobs API...');
    console.log('📍 API URL: http://localhost:3003/jobs?contractorId=employer_demo_123');
    
    const response = await fetch('http://localhost:3003/jobs?contractorId=employer_demo_123');

    console.log('\n📥 Response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Error:', error);
      return;
    }

    const result = await response.json();
    console.log('\n✅ Success! Jobs fetched from DynamoDB:');
    console.log(JSON.stringify(result, null, 2));
    console.log('\n📊 Total jobs found:', result.jobs?.length || 0);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testGetJobs();
