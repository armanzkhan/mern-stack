const axios = require('axios');

async function testFreshLogin() {
  try {
    console.log('🔍 Testing Fresh Login with Updated Permissions...\n');
    
    // Step 1: Login to get fresh token
    console.log('🔐 Step 1: Fresh login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'flowtest@example.com',
      password: 'password123'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Fresh login successful');
    
    // Step 2: Decode and inspect the JWT payload
    console.log('\n🔍 Step 2: Inspecting JWT payload...');
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(token);
    
    console.log('📋 JWT Payload:');
    console.log('   User ID:', decoded.userId);
    console.log('   Email:', decoded.email);
    console.log('   Roles:', decoded.roles);
    console.log('   Permissions:', decoded.permissions);
    
    // Step 3: Test orders API
    console.log('\n📝 Step 3: Testing orders API...');
    try {
      const ordersResponse = await axios.get('http://localhost:5000/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ Orders API successful - Found ${ordersResponse.data.length} orders`);
      if (ordersResponse.data.length > 0) {
        ordersResponse.data.forEach((order, index) => {
          console.log(`   Order ${index + 1}: ${order.orderNumber || 'No Number'} - ${order.status}`);
        });
      }
    } catch (error) {
      console.log('❌ Orders API failed:');
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.message);
      } else {
        console.log('   Error:', error.message);
      }
    }
    
    // Step 4: Test customers API
    console.log('\n📝 Step 4: Testing customers API...');
    try {
      const customersResponse = await axios.get('http://localhost:5000/api/customers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ Customers API successful - Found ${customersResponse.data.length} customers`);
    } catch (error) {
      console.log('❌ Customers API failed:');
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.message);
      } else {
        console.log('   Error:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

if (require.main === module) {
  testFreshLogin();
}

module.exports = testFreshLogin;
