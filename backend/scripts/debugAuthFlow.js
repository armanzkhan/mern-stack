const axios = require('axios');

async function debugAuthFlow() {
  console.log('🔍 Debugging Authentication Flow...\n');
  
  try {
    const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
    
    // Step 1: Login and get token
    console.log('🔐 Step 1: Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'flowtest@example.com',
      password: 'password123'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }
    
    console.log('✅ Login successful');
    const token = loginResponse.data.token;
    console.log(`   Token: ${token.substring(0, 30)}...`);
    
    // Step 2: Test getCurrentUser to see what permissions are loaded
    console.log('\n👤 Step 2: Testing getCurrentUser...');
    const userResponse = await axios.get(`${API_BASE_URL}/api/auth/current-user`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (userResponse.data.success) {
      const userData = userResponse.data.data;
      console.log('✅ getCurrentUser successful');
      console.log(`   User: ${userData.email}`);
      console.log(`   Roles: ${JSON.stringify(userData.roles)}`);
      console.log(`   Permissions: ${JSON.stringify(userData.permissions)}`);
      console.log(`   Is Super Admin: ${userData.isSuperAdmin}`);
      
      // Check if customer.view is in permissions
      const hasCustomerView = userData.permissions.includes('customer.view');
      console.log(`\n🎯 Permission Check:`);
      console.log(`   customer.view: ${hasCustomerView ? '✅' : '❌'}`);
      
      if (hasCustomerView) {
        console.log('\n✅ User has customer.view permission in JWT!');
        
        // Step 3: Test customers API
        console.log('\n👥 Step 3: Testing customers API...');
        const customersResponse = await axios.get(`${API_BASE_URL}/api/customers`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('✅ Customers API successful!');
        console.log(`   Status: ${customersResponse.status}`);
        console.log(`   Customers count: ${customersResponse.data.length}`);
        
        if (customersResponse.data.length > 0) {
          console.log('\n📋 Real customers from database:');
          customersResponse.data.forEach((customer, index) => {
            console.log(`   ${index + 1}. ${customer.companyName} - ${customer.contactName} (${customer.email})`);
          });
        }
        
      } else {
        console.log('\n❌ User does NOT have customer.view permission in JWT');
        console.log('   This means the permissions were not properly loaded during authentication');
        console.log('   The user needs to log in again to get fresh permissions');
      }
      
    } else {
      console.log('❌ getCurrentUser failed:', userResponse.data.message);
    }
    
  } catch (error) {
    if (error.response) {
      console.log('❌ API Error:', error.response.status, error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ Connection refused. Make sure the backend server is running on port 5000');
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

if (require.main === module) {
  debugAuthFlow();
}

module.exports = debugAuthFlow;
