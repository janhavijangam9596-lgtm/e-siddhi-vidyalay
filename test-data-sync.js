// Test script for API endpoints
async function testAPIEndpoints() {
  console.log('Testing API Endpoints...');

  const baseURL = 'http://localhost:3002/api';

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${baseURL}/health`);
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData);

    // Test 2: Dashboard stats
    console.log('2. Testing dashboard stats endpoint...');
    const statsResponse = await fetch(`${baseURL}/dashboard/stats`);
    const statsData = await statsResponse.json();
    console.log('Dashboard stats:', statsData);

    // Test 3: Students endpoint
    console.log('3. Testing students endpoint...');
    const studentsResponse = await fetch(`${baseURL}/students`);
    const studentsData = await studentsResponse.json();
    console.log(`Students count: ${studentsData.length}`);

    // Test 4: Update student stats
    console.log('4. Testing student stats update...');
    const updateResponse = await fetch(`${baseURL}/students/stats`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ total_count: 150 })
    });
    const updateData = await updateResponse.json();
    console.log('Student stats update:', updateData);

    // Test 5: Update class stats
    console.log('5. Testing class stats update...');
    const classUpdateResponse = await fetch(`${baseURL}/classes/stats`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ total_count: 12 })
    });
    const classUpdateData = await classUpdateResponse.json();
    console.log('Class stats update:', classUpdateData);

    // Test 6: Update fee stats
    console.log('6. Testing fee stats update...');
    const feeUpdateResponse = await fetch(`${baseURL}/fees/stats`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ total_collected: 50000, collection_rate: 92.3 })
    });
    const feeUpdateData = await feeUpdateResponse.json();
    console.log('Fee stats update:', feeUpdateData);

    console.log('✅ All API endpoint tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testAPIEndpoints();