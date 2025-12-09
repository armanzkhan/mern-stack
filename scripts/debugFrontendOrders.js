const axios = require('axios');

async function debugFrontendOrders() {
  try {
    console.log('🔍 Debugging Frontend Orders Issue...\n');
    
    // Step 1: Test backend directly
    console.log('📝 Step 1: Testing backend orders API...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'flowtest@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Backend login successful');
    
    const backendOrdersResponse = await axios.get('http://localhost:5000/api/orders', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Backend has ${backendOrdersResponse.data.length} orders`);
    console.log('   Latest orders:');
    backendOrdersResponse.data.slice(0, 3).forEach((order, index) => {
      console.log(`   ${index + 1}. ${order.orderNumber} - ${order.status} (${order.createdAt})`);
    });
    
    // Step 2: Test frontend API proxy
    console.log('\n📝 Step 2: Testing frontend API proxy...');
    try {
      const frontendResponse = await axios.get('http://localhost:3000/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ Frontend API proxy shows ${frontendResponse.data.length} orders`);
      console.log('   Frontend orders:');
      frontendResponse.data.slice(0, 3).forEach((order, index) => {
        console.log(`   ${index + 1}. ${order.orderNumber} - ${order.status}`);
      });
      
      if (frontendResponse.data.length === backendOrdersResponse.data.length) {
        console.log('🎉 Frontend and backend are in sync!');
      } else {
        console.log('⚠️ Frontend and backend have different order counts');
        console.log(`   Backend: ${backendOrdersResponse.data.length}`);
        console.log(`   Frontend: ${frontendResponse.data.length}`);
      }
    } catch (error) {
      console.log('❌ Frontend API proxy failed:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
      }
    }
    
    // Step 3: Test without authentication (should fall back to demo data)
    console.log('\n📝 Step 3: Testing frontend without authentication...');
    try {
      const noAuthResponse = await axios.get('http://localhost:3000/api/orders');
      console.log(`✅ Frontend without auth shows ${noAuthResponse.data.length} orders`);
      console.log('   Demo orders:');
      noAuthResponse.data.slice(0, 3).forEach((order, index) => {
        console.log(`   ${index + 1}. ${order.orderNumber} - ${order.status}`);
      });
    } catch (error) {
      console.log('❌ Frontend without auth failed:', error.message);
    }
    
    // Step 4: Check if user needs to login again
    console.log('\n📝 Step 4: Recommendations...');
    console.log('💡 If frontend is showing demo data instead of real orders:');
    console.log('   1. Make sure you are logged in at http://localhost:3000/auth/signin');
    console.log('   2. Check browser console for authentication errors');
    console.log('   3. Clear browser cache and try again');
    console.log('   4. Make sure the token is stored in localStorage');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

if (require.main === module) {
  debugFrontendOrders();
}

module.exports = debugFrontendOrders;
