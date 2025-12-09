const axios = require('axios');

async function testZainUserLogin() {
  try {
    console.log('🔍 Testing Zain User Login...\n');
    
    // Step 1: Login as zain user
    console.log('🔐 Step 1: Login as zain user...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'zain@ressichem.com',
      password: 'password123' // Assuming default password
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Step 2: Decode JWT to check roles and permissions
    console.log('\n🔍 Step 2: Checking JWT payload...');
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(token);
    
    console.log('📋 JWT Payload:');
    console.log('   User ID:', decoded.user_id);
    console.log('   Company ID:', decoded.company_id);
    console.log('   Is Super Admin:', decoded.isSuperAdmin);
    
    // Step 3: Test API access
    console.log('\n📝 Step 3: Testing API access...');
    
    // Test dashboard access
    try {
      const dashboardResponse = await axios.get('http://localhost:5000/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Dashboard API accessible');
    } catch (error) {
      console.log('❌ Dashboard API failed:', error.response?.status, error.response?.data?.message);
    }
    
    // Test users access
    try {
      const usersResponse = await axios.get('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Users API accessible');
    } catch (error) {
      console.log('❌ Users API failed:', error.response?.status, error.response?.data?.message);
    }
    
    // Test customers access
    try {
      const customersResponse = await axios.get('http://localhost:5000/api/customers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Customers API accessible');
    } catch (error) {
      console.log('❌ Customers API failed:', error.response?.status, error.response?.data?.message);
    }
    
    // Test orders access
    try {
      const ordersResponse = await axios.get('http://localhost:5000/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Orders API accessible');
    } catch (error) {
      console.log('❌ Orders API failed:', error.response?.status, error.response?.data?.message);
    }
    
    // Test products access
    try {
      const productsResponse = await axios.get('http://localhost:5000/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Products API accessible');
    } catch (error) {
      console.log('❌ Products API failed:', error.response?.status, error.response?.data?.message);
    }
    
    console.log('\n🎉 Zain user login test completed!');
    console.log('💡 The user should now be able to:');
    console.log('   - See the dashboard');
    console.log('   - Access User Management section');
    console.log('   - Access Customer Management section');
    console.log('   - View and manage orders');
    console.log('   - View and manage products');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

if (require.main === module) {
  testZainUserLogin();
}

module.exports = testZainUserLogin;
