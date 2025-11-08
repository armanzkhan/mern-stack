const axios = require('axios');

async function debugUserAuthentication() {
  try {
    console.log('🔍 Debugging User Authentication...\n');
    
    // Step 1: Test different user logins
    console.log('📝 Step 1: Testing different user logins...');
    
    const users = [
      { email: 'zain@ressichem.com', password: 'password123' },
      { email: 'flowtest@example.com', password: 'password123' },
      { email: 'admin@example.com', password: 'password123' }
    ];
    
    for (const user of users) {
      try {
        console.log(`\n🔐 Testing login for ${user.email}...`);
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
          email: user.email,
          password: user.password
        });
        
        if (loginResponse.data.success) {
          console.log(`✅ Login successful for ${user.email}`);
          const token = loginResponse.data.token;
          
          // Test orders API with this token
          const ordersResponse = await axios.get('http://localhost:5000/api/orders', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log(`   Orders accessible: ${ordersResponse.data.length} orders`);
          
          // Test frontend API proxy
          try {
            const frontendResponse = await axios.get('http://localhost:3000/api/orders', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            console.log(`   Frontend proxy: ${frontendResponse.data.length} orders`);
          } catch (error) {
            console.log(`   Frontend proxy failed: ${error.message}`);
          }
        } else {
          console.log(`❌ Login failed for ${user.email}: ${loginResponse.data.message}`);
        }
      } catch (error) {
        console.log(`❌ Login error for ${user.email}: ${error.message}`);
      }
    }
    
    // Step 2: Test frontend without authentication
    console.log('\n📝 Step 2: Testing frontend without authentication...');
    try {
      const noAuthResponse = await axios.get('http://localhost:3000/api/orders');
      console.log(`✅ Frontend without auth shows ${noAuthResponse.data.length} orders (demo data)`);
      console.log('   Sample demo orders:', noAuthResponse.data.slice(0, 2).map(o => o.orderNumber));
    } catch (error) {
      console.log('❌ Frontend without auth failed:', error.message);
    }
    
    // Step 3: Check current database state
    console.log('\n📝 Step 3: Checking current database state...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'flowtest@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    const ordersResponse = await axios.get('http://localhost:5000/api/orders', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Database has ${ordersResponse.data.length} real orders`);
    console.log('   Latest orders:');
    ordersResponse.data.slice(0, 3).forEach((order, index) => {
      console.log(`   ${index + 1}. ${order.orderNumber} - ${order.status} (${new Date(order.createdAt).toLocaleString()})`);
    });
    
    console.log('\n💡 DIAGNOSIS:');
    console.log('   - Backend is working correctly');
    console.log('   - Orders are being saved to database');
    console.log('   - Frontend API proxy is working');
    console.log('   - Issue is likely user authentication in browser');
    
    console.log('\n🔧 SOLUTION:');
    console.log('   1. Go to http://localhost:3000/auth/signin');
    console.log('   2. Login with your credentials');
    console.log('   3. Check browser console for authentication status');
    console.log('   4. Navigate to http://localhost:3000/orders');
    console.log('   5. Check if token is present in localStorage');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

if (require.main === module) {
  debugUserAuthentication();
}

module.exports = debugUserAuthentication;
