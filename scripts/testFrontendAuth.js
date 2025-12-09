const axios = require('axios');

async function testFrontendAuth() {
  try {
    console.log('🔍 Testing Frontend Authentication...\n');
    
    // Step 1: Login to get token
    console.log('🔐 Step 1: Login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'flowtest@example.com',
      password: 'password123'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log('   Token (first 50 chars):', token.substring(0, 50) + '...');
    
    // Step 2: Test frontend orders API with token
    console.log('\n📝 Step 2: Testing frontend orders API with token...');
    try {
      const response = await axios.get('http://localhost:3000/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Frontend orders API with token successful');
      console.log(`   Found ${response.data.length} orders`);
      console.log('   Orders:');
      response.data.forEach((order, index) => {
        console.log(`     ${index + 1}. ${order.orderNumber || 'No Number'} - ${order.status} - $${order.total}`);
      });
      
    } catch (error) {
      console.log('❌ Frontend orders API with token failed:');
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.message);
      } else {
        console.log('   Error:', error.message);
      }
    }
    
    // Step 3: Test frontend orders API without token
    console.log('\n📝 Step 3: Testing frontend orders API without token...');
    try {
      const response = await axios.get('http://localhost:3000/api/orders', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Frontend orders API without token successful');
      console.log(`   Found ${response.data.length} orders`);
      console.log('   Orders:');
      response.data.forEach((order, index) => {
        console.log(`     ${index + 1}. ${order.orderNumber || 'No Number'} - ${order.status} - $${order.total}`);
      });
      
    } catch (error) {
      console.log('❌ Frontend orders API without token failed:');
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.message);
      } else {
        console.log('   Error:', error.message);
      }
    }
    
    console.log('\n💡 Solution:');
    console.log('   1. Make sure you are logged in to the frontend');
    console.log('   2. Check if the token is stored in localStorage');
    console.log('   3. Try logging out and logging in again');
    console.log('   4. Clear browser cache and cookies');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

if (require.main === module) {
  testFrontendAuth();
}

module.exports = testFrontendAuth;
