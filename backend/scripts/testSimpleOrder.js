const axios = require('axios');

async function testSimpleOrder() {
  try {
    console.log('🔍 Testing Simple Order Creation...\n');
    
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
    
    // Step 2: Create a simple order
    console.log('\n📝 Step 2: Creating simple order...');
    const orderData = {
      customer: "507f1f77bcf86cd799439011", // Use a dummy customer ID
      items: [
        {
          product: "507f1f77bcf86cd799439012", // Use a dummy product ID
          quantity: 1,
          unitPrice: 100
        }
      ],
      notes: 'Simple test order'
    };
    
    try {
      const orderResponse = await axios.post('http://localhost:5000/api/orders', orderData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Order created successfully');
      console.log('   Order Number:', orderResponse.data.orderNumber);
      console.log('   Status:', orderResponse.data.status);
      
    } catch (orderError) {
      console.log('❌ Order creation failed:');
      if (orderError.response) {
        console.log('   Status:', orderError.response.status);
        console.log('   Message:', orderError.response.data.message);
        console.log('   Error:', orderError.response.data.error);
      } else {
        console.log('   Error:', orderError.message);
      }
    }
    
    // Step 3: Get orders
    console.log('\n📝 Step 3: Getting orders...');
    try {
      const ordersResponse = await axios.get('http://localhost:5000/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ Found ${ordersResponse.data.length} orders`);
      ordersResponse.data.forEach((order, index) => {
        console.log(`   Order ${index + 1}: ${order.orderNumber} - ${order.status}`);
      });
      
    } catch (ordersError) {
      console.log('❌ Getting orders failed:');
      if (ordersError.response) {
        console.log('   Status:', ordersError.response.status);
        console.log('   Message:', ordersError.response.data.message);
      } else {
        console.log('   Error:', ordersError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

if (require.main === module) {
  testSimpleOrder();
}

module.exports = testSimpleOrder;
