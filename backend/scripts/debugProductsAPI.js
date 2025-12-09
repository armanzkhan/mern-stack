const axios = require('axios');

async function debugProductsAPI() {
  try {
    console.log('🔍 Debugging Products API...\n');
    
    // Step 1: Login
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
    
    // Step 2: Test products API
    console.log('\n📝 Step 2: Testing products API...');
    try {
      const productsResponse = await axios.get('http://localhost:5000/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📋 Products API Response:');
      console.log('   Status:', productsResponse.status);
      console.log('   Data type:', typeof productsResponse.data);
      console.log('   Data length:', productsResponse.data?.length);
      console.log('   Raw data:', JSON.stringify(productsResponse.data, null, 2));
      
    } catch (error) {
      console.log('❌ Products API failed:');
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.message);
        console.log('   Data:', error.response.data);
      } else {
        console.log('   Error:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

if (require.main === module) {
  debugProductsAPI();
}

module.exports = debugProductsAPI;
