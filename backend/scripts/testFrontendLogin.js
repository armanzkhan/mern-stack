const axios = require('axios');

async function testFrontendLogin() {
  try {
    console.log('🔍 Testing Frontend Login Flow...\n');
    
    // Step 1: Test frontend login page
    console.log('🌐 Step 1: Testing frontend login page...');
    try {
      const response = await axios.get('http://localhost:3000/auth/signin');
      console.log('✅ Frontend login page accessible');
    } catch (error) {
      console.log('❌ Frontend login page not accessible:', error.message);
      return;
    }
    
    // Step 2: Test login through frontend API
    console.log('\n🔐 Step 2: Testing login through frontend API...');
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        email: 'flowtest@example.com',
        password: 'password123'
      });
      
      if (response.data.success) {
        console.log('✅ Frontend login API successful');
        console.log('   Token received:', response.data.token ? 'Yes' : 'No');
        
        // Test orders with this token
        console.log('\n📝 Step 3: Testing orders with frontend login token...');
        const ordersResponse = await axios.get('http://localhost:3000/api/orders', {
          headers: {
            'Authorization': `Bearer ${response.data.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ Orders API with frontend login token successful');
        console.log(`   Found ${ordersResponse.data.length} orders`);
        console.log('   Orders:');
        ordersResponse.data.forEach((order, index) => {
          console.log(`     ${index + 1}. ${order.orderNumber || 'No Number'} - ${order.status} - $${order.total}`);
        });
        
      } else {
        console.log('❌ Frontend login API failed:', response.data.message);
      }
      
    } catch (error) {
      console.log('❌ Frontend login API failed:');
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.message);
      } else {
        console.log('   Error:', error.message);
      }
    }
    
    console.log('\n💡 Instructions for the user:');
    console.log('   1. Go to http://localhost:3000/auth/signin');
    console.log('   2. Login with email: flowtest@example.com, password: password123');
    console.log('   3. After login, go to http://localhost:3000/orders');
    console.log('   4. The orders should now show real data from the database');
    console.log('   5. If not, try refreshing the page (F5) or clearing browser cache');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

if (require.main === module) {
  testFrontendLogin();
}

module.exports = testFrontendLogin;
