const axios = require('axios');

async function testFrontendOrderFormat() {
  try {
    console.log('🔍 Testing Frontend Order Format...\n');
    
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
    
    // Step 2: Test the exact order format that frontend sends
    console.log('\n📝 Step 2: Testing frontend order format...');
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
      notes: 'Test order from frontend format',
      company_id: 'RESSICHEM'
    };
    
    try {
      const response = await axios.post('http://localhost:5000/api/orders', orderData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Backend order creation successful');
      console.log('   Order ID:', response.data._id);
      console.log('   Order Number:', response.data.orderNumber);
      console.log('   Status:', response.data.status);
      console.log('   Total:', response.data.total);
      
    } catch (error) {
      console.log('❌ Backend order creation failed:');
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.message);
        console.log('   Error:', error.response.data.error);
        console.log('   Full response:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.log('   Error:', error.message);
      }
    }
    
    // Step 3: Test through Next.js API
    console.log('\n📝 Step 3: Testing through Next.js API...');
    try {
      const response = await axios.post('http://localhost:3000/api/orders', orderData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Next.js API order creation successful');
      console.log('   Order ID:', response.data._id);
      console.log('   Order Number:', response.data.orderNumber);
      console.log('   Status:', response.data.status);
      console.log('   Total:', response.data.total);
      
    } catch (error) {
      console.log('❌ Next.js API order creation failed:');
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
  testFrontendOrderFormat();
}

module.exports = testFrontendOrderFormat;
