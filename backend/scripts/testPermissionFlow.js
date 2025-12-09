const axios = require('axios');

async function testPermissionFlow() {
  try {
    console.log('🔍 Testing Permission Flow...\n');
    
    // Step 1: Login
    console.log('🔐 Step 1: Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'flowtest@example.com',
      password: 'password123'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }
    
    console.log('✅ Login successful');
    const token = loginResponse.data.token;
    
    // Step 2: Test customer creation with detailed logging
    console.log('\n📝 Step 2: Testing CREATE customer...');
    
    try {
      const createResponse = await axios.post('http://localhost:5000/api/customers', {
        companyName: 'Test Company',
        contactName: 'Test Contact',
        email: 'test@example.com',
        phone: '1234567890',
        street: '123 Test St',
        city: 'Test City',
        status: 'active'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Customer created successfully:', createResponse.data);
      
    } catch (error) {
      console.log('❌ Customer creation failed:');
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.message);
        console.log('   Data:', error.response.data);
      } else {
        console.log('   Error:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

if (require.main === module) {
  testPermissionFlow();
}

module.exports = testPermissionFlow;
