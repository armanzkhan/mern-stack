const axios = require('axios');

async function testFrontendWithAuth() {
  try {
    console.log('🔍 Testing Frontend with Authentication...\n');
    
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
    
    // Step 2: Test frontend orders API with authentication
    console.log('\n📝 Step 2: Testing frontend orders API with auth...');
    try {
      const response = await axios.get('http://localhost:3000/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Frontend orders API with auth successful');
      console.log(`   Found ${response.data.length} orders`);
      if (response.data.length > 0) {
        response.data.forEach((order, index) => {
          console.log(`   Order ${index + 1}: ${order.orderNumber || 'No Number'} - ${order.status} - $${order.total}`);
        });
      }
    } catch (error) {
      console.log('❌ Frontend orders API with auth failed:');
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.message);
      } else {
        console.log('   Error:', error.message);
      }
    }
    
    // Step 3: Test creating an order through frontend API
    console.log('\n📝 Step 3: Testing order creation through frontend API...');
    try {
      const orderData = {
        customer: '68e79f41fc8d7f882cb2e629', // Use a real customer ID
        items: [{
          product: '68e79f41fc8d7f882cb2e625', // Use a real product ID
          quantity: 1,
          unitPrice: 1000,
          total: 1000
        }],
        subtotal: 1000,
        tax: 100,
        total: 1100,
        notes: 'Test order from frontend API',
        company_id: 'RESSICHEM'
      };
      
      const response = await axios.post('http://localhost:3000/api/orders', orderData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Order creation through frontend API successful');
      console.log('   Order ID:', response.data._id);
      console.log('   Order Number:', response.data.orderNumber);
      console.log('   Status:', response.data.status);
      console.log('   Total:', response.data.total);
      
    } catch (error) {
      console.log('❌ Order creation through frontend API failed:');
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.message);
        console.log('   Error:', error.response.data.error);
      } else {
        console.log('   Error:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

if (require.main === module) {
  testFrontendWithAuth();
}

module.exports = testFrontendWithAuth;
