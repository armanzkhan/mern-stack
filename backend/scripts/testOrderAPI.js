const axios = require('axios');

async function testOrderAPI() {
  try {
    console.log('🔍 Testing Order API...\n');
    
    // Test server connectivity
    console.log('🔐 Step 1: Testing server connectivity...');
    try {
      const healthResponse = await axios.get('http://localhost:5000/api/health');
      console.log('✅ Server is running');
    } catch (error) {
      console.log('❌ Server is not running or health endpoint not available');
      console.log('   Error:', error.message);
      return;
    }
    
    // Test login
    console.log('\n🔐 Step 2: Testing login...');
    let token;
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'flowtest@example.com',
        password: 'password123'
      });
      
      if (loginResponse.data.success) {
        token = loginResponse.data.token;
        console.log('✅ Login successful');
      } else {
        console.log('❌ Login failed:', loginResponse.data.message);
        return;
      }
    } catch (error) {
      console.log('❌ Login failed:', error.message);
      return;
    }
    
    // Test getting orders
    console.log('\n📝 Step 3: Testing get orders...');
    try {
      const ordersResponse = await axios.get('http://localhost:5000/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ Found ${ordersResponse.data.length} orders`);
      if (ordersResponse.data.length > 0) {
        ordersResponse.data.forEach((order, index) => {
          console.log(`   Order ${index + 1}: ${order.orderNumber || 'No Number'} - ${order.status}`);
        });
      }
    } catch (error) {
      console.log('❌ Get orders failed:');
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.message);
      } else {
        console.log('   Error:', error.message);
      }
    }
    
    // Test getting customers
    console.log('\n📝 Step 4: Testing get customers...');
    try {
      const customersResponse = await axios.get('http://localhost:5000/api/customers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ Found ${customersResponse.data.length} customers`);
      if (customersResponse.data.length > 0) {
        console.log(`   First customer: ${customersResponse.data[0].companyName}`);
      }
    } catch (error) {
      console.log('❌ Get customers failed:');
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.message);
      } else {
        console.log('   Error:', error.message);
      }
    }
    
    // Test getting products
    console.log('\n📝 Step 5: Testing get products...');
    try {
      const productsResponse = await axios.get('http://localhost:5000/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ Found ${productsResponse.data.length} products`);
      if (productsResponse.data.length > 0) {
        console.log(`   First product: ${productsResponse.data[0].name}`);
      }
    } catch (error) {
      console.log('❌ Get products failed:');
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
  testOrderAPI();
}

module.exports = testOrderAPI;
