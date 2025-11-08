const axios = require('axios');

async function testCustomersAPI() {
  console.log('🔍 Testing Customers API...\n');
  
  try {
    const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
    
    // First, let's login to get a token
    console.log('🔐 Step 1: Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'flowtest@example.com',
      password: 'password123'
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Login successful');
      const token = loginResponse.data.token;
      console.log(`   Token: ${token.substring(0, 20)}...`);
      
      // Now test the customers endpoint
      console.log('\n👥 Step 2: Testing customers endpoint...');
      const customersResponse = await axios.get(`${API_BASE_URL}/api/customers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Customers API successful');
      console.log(`   Status: ${customersResponse.status}`);
      console.log(`   Customers count: ${customersResponse.data.length}`);
      
      if (customersResponse.data.length > 0) {
        console.log('\n📋 Sample customers:');
        customersResponse.data.slice(0, 3).forEach((customer, index) => {
          console.log(`   ${index + 1}. ${customer.companyName} - ${customer.contactName} (${customer.email})`);
        });
      } else {
        console.log('\n❌ No customers found in database');
      }
      
      // Test frontend API route
      console.log('\n🌐 Step 3: Testing frontend API route...');
      const frontendResponse = await axios.get('http://localhost:3000/api/customers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Frontend customers API successful');
      console.log(`   Status: ${frontendResponse.status}`);
      console.log(`   Customers count: ${frontendResponse.data.length}`);
      
      if (frontendResponse.data.length > 0) {
        console.log('\n📋 Frontend customers:');
        frontendResponse.data.slice(0, 3).forEach((customer, index) => {
          console.log(`   ${index + 1}. ${customer.companyName} - ${customer.contactName} (${customer.email})`);
        });
      }
      
    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
    }
    
  } catch (error) {
    if (error.response) {
      console.log('❌ API Error:', error.response.status, error.response.data);
      if (error.response.status === 401) {
        console.log('   This might be an authentication issue');
      } else if (error.response.status === 403) {
        console.log('   This might be a permission issue - user needs "customer.view" permission');
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ Connection refused. Make sure the backend server is running on port 5000');
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

if (require.main === module) {
  testCustomersAPI();
}

module.exports = testCustomersAPI;
