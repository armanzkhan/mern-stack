const axios = require('axios');

async function testCustomerCRUD() {
  console.log('🔍 Testing Customer CRUD Operations...\n');
  
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
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-company-id': 'RESSICHEM'
      };
      
      // Test CREATE customer
      console.log('\n📝 Step 2: Testing CREATE customer...');
      const newCustomer = {
        companyName: 'Test Construction Ltd',
        contactName: 'John Test',
        email: 'john@testconstruction.com',
        phone: '+1-555-0123',
        street: '123 Test Street',
        city: 'Test City',
        state: 'TS',
        zip: '12345',
        country: 'USA',
        status: 'active',
        customerType: 'premium'
      };
      
      try {
        const createResponse = await axios.post(`${API_BASE_URL}/api/customers`, newCustomer, { headers });
        console.log('✅ Customer created successfully');
        console.log(`   Customer ID: ${createResponse.data._id}`);
        console.log(`   Status: ${createResponse.data.status}`);
        console.log(`   Company ID: ${createResponse.data.company_id}`);
        
        const customerId = createResponse.data._id;
        
        // Test READ customer
        console.log('\n📖 Step 3: Testing READ customer...');
        const readResponse = await axios.get(`${API_BASE_URL}/api/customers/${customerId}`, { headers });
        console.log('✅ Customer read successfully');
        console.log(`   Company: ${readResponse.data.companyName}`);
        console.log(`   Contact: ${readResponse.data.contactName}`);
        console.log(`   Status: ${readResponse.data.status}`);
        
        // Test UPDATE customer
        console.log('\n✏️ Step 4: Testing UPDATE customer...');
        const updateData = {
          companyName: 'Updated Test Construction Ltd',
          contactName: 'John Updated',
          status: 'inactive',
          customerType: 'vip'
        };
        
        const updateResponse = await axios.put(`${API_BASE_URL}/api/customers/${customerId}`, updateData, { headers });
        console.log('✅ Customer updated successfully');
        console.log(`   New Company: ${updateResponse.data.companyName}`);
        console.log(`   New Contact: ${updateResponse.data.contactName}`);
        console.log(`   New Status: ${updateResponse.data.status}`);
        console.log(`   New Type: ${updateResponse.data.customerType}`);
        
        // Test STATUS UPDATE
        console.log('\n🔄 Step 5: Testing STATUS UPDATE...');
        const statusUpdateData = { status: 'suspended' };
        const statusResponse = await axios.put(`${API_BASE_URL}/api/customers/${customerId}`, statusUpdateData, { headers });
        console.log('✅ Customer status updated successfully');
        console.log(`   New Status: ${statusResponse.data.status}`);
        
        // Test LIST customers
        console.log('\n📋 Step 6: Testing LIST customers...');
        const listResponse = await axios.get(`${API_BASE_URL}/api/customers`, { headers });
        console.log('✅ Customers listed successfully');
        console.log(`   Total customers: ${listResponse.data.length}`);
        
        // Find our test customer in the list
        const testCustomer = listResponse.data.find(c => c._id === customerId);
        if (testCustomer) {
          console.log(`   Test customer found: ${testCustomer.companyName} (${testCustomer.status})`);
        }
        
        // Test DELETE customer
        console.log('\n🗑️ Step 7: Testing DELETE customer...');
        const deleteResponse = await axios.delete(`${API_BASE_URL}/api/customers/${customerId}`, { headers });
        console.log('✅ Customer deleted successfully');
        console.log(`   Response: ${deleteResponse.data.message}`);
        
        // Verify deletion
        console.log('\n🔍 Step 8: Verifying deletion...');
        try {
          await axios.get(`${API_BASE_URL}/api/customers/${customerId}`, { headers });
          console.log('❌ Customer still exists - deletion may have failed');
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.log('✅ Customer successfully deleted (404 not found)');
          } else {
            console.log('⚠️ Unexpected error verifying deletion:', error.message);
          }
        }
        
        console.log('\n🎉 All CRUD operations completed successfully!');
        
      } catch (error) {
        console.log('❌ CRUD operation failed:', error.response?.data || error.message);
        if (error.response?.status === 403) {
          console.log('   This might be a permission issue - user needs customer permissions');
        }
      }
      
    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
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
  testCustomerCRUD();
}

module.exports = testCustomerCRUD;
