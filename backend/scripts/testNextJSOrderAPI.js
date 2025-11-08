const axios = require('axios');

async function testNextJSOrderAPI() {
  try {
    console.log('🔍 Testing Next.js Order API...\n');
    
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
    
    // Step 2: Test Next.js orders API (GET)
    console.log('\n📝 Step 2: Testing Next.js orders API (GET)...');
    try {
      const ordersResponse = await axios.get('http://localhost:3000/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Next.js orders API (GET) successful');
      console.log(`   Found ${ordersResponse.data.length} orders`);
      if (ordersResponse.data.length > 0) {
        ordersResponse.data.forEach((order, index) => {
          console.log(`   Order ${index + 1}: ${order.orderNumber || 'No Number'} - ${order.status} - $${order.total}`);
        });
      }
    } catch (error) {
      console.log('❌ Next.js orders API (GET) failed:');
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.message);
      } else {
        console.log('   Error:', error.message);
      }
    }
    
    // Step 3: Test Next.js customers API (GET)
    console.log('\n📝 Step 3: Testing Next.js customers API (GET)...');
    try {
      const customersResponse = await axios.get('http://localhost:3000/api/customers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Next.js customers API (GET) successful');
      console.log(`   Found ${customersResponse.data.length} customers`);
    } catch (error) {
      console.log('❌ Next.js customers API (GET) failed:');
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.message);
      } else {
        console.log('   Error:', error.message);
      }
    }
    
    // Step 4: Test Next.js products API (GET)
    console.log('\n📝 Step 4: Testing Next.js products API (GET)...');
    try {
      const productsResponse = await axios.get('http://localhost:3000/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Next.js products API (GET) successful');
      console.log(`   Found ${productsResponse.data.length} products`);
    } catch (error) {
      console.log('❌ Next.js products API (GET) failed:');
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
  testNextJSOrderAPI();
}

module.exports = testNextJSOrderAPI;
