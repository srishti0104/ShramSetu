/**
 * Test Jobs API
 * Quick test to verify the jobs API is working
 */

const testJobCreation = async () => {
  try {
    console.log('🧪 Testing Jobs API...');
    console.log('📍 API URL: http://localhost:3003');
    
    const jobData = {
      contractorId: 'test_contractor_123',
      title: 'Test Construction Job',
      description: 'This is a test job posting',
      location: {
        address: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra'
      },
      city: 'Mumbai',
      status: 'open',
      wageRate: 500,
      wageType: 'daily',
      duration: '1 week',
      skillsRequired: ['Construction', 'Masonry'],
      workersNeeded: 5,
      startDate: '2026-03-10'
    };

    console.log('\n📤 Sending job data:', JSON.stringify(jobData, null, 2));

    const response = await fetch('http://localhost:3003/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobData)
    });

    console.log('\n📥 Response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Error:', error);
      return;
    }

    const result = await response.json();
    console.log('\n✅ Success! Job created:');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testJobCreation();
