const axios = require('axios');

async function debugNextJSAPI() {
  try {
    console.log('🔍 Debugging Next.js API Connection...\n');
    
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
    
    // Step 2: Test Next.js orders API with auth
    console.log('\n📝 Step 2: Testing Next.js orders API with auth...');
    try {
      const response = await axios.get('http://localhost:3000/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Next.js orders API response:');
      console.log(`   Status: ${response.status}`);
      console.log(`   Data type: ${typeof response.data}`);
      console.log(`   Data length: ${response.data?.length}`);
      console.log('   Orders:');
      response.data.forEach((order, index) => {
        console.log(`     ${index + 1}. ${order.orderNumber || 'No Number'} - ${order.status} - $${order.total}`);
      });
      
    } catch (error) {
      console.log('❌ Next.js orders API failed:');
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.message);
      } else {
        console.log('   Error:', error.message);
      }
    }
    
    // Step 3: Test backend orders API directly
    console.log('\n📝 Step 3: Testing backend orders API directly...');
    try {
      const response = await axios.get('http://localhost:5000/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Backend orders API response:');
      console.log(`   Status: ${response.status}`);
      console.log(`   Data type: ${typeof response.data}`);
      console.log(`   Data length: ${response.data?.length}`);
      console.log('   Orders:');
      response.data.forEach((order, index) => {
        console.log(`     ${index + 1}. ${order.orderNumber || 'No Number'} - ${order.status} - $${order.total}`);
      });
      
    } catch (error) {
      console.log('❌ Backend orders API failed:');
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.message);
      } else {
        console.log('   Error:', error.message);
      }
    }
    
    // Step 4: Test order creation through Next.js API
    console.log('\n📝 Step 4: Testing order creation through Next.js API...');
    try {
      const orderData = {
        customer: '68ecbc3cfcf29ba8afa544d8', // Real customer ID
        items: [{
          product: '68e79f41fc8d7f882cb2e625', // Real product ID
          quantity: 1,
          unitPrice: 4500,
          total: 4500
        }],
        subtotal: 4500,
        tax: 450,
        total: 4950,
        notes: 'Test order from Next.js API debug',
        company_id: 'RESSICHEM'
      };
      
      const response = await axios.post('http://localhost:3000/api/orders', orderData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Order creation through Next.js API successful');
      console.log('   Order ID:', response.data._id);
      console.log('   Order Number:', response.data.orderNumber);
      console.log('   Status:', response.data.status);
      console.log('   Total:', response.data.total);
      
      // Check if it's a demo order or real order
      if (response.data._id.startsWith('demo_')) {
        console.log('   ⚠️  This is a DEMO order (not saved to database)');
      } else {
        console.log('   ✅ This is a REAL order (saved to database)');
      }
      
    } catch (error) {
      console.log('❌ Order creation through Next.js API failed:');
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.message);
      } else {
        console.log('   Error:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

if (require.main === module) {
  debugNextJSAPI();
}

module.exports = debugNextJSAPI;
