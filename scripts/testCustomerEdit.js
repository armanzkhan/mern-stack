const axios = require('axios');

async function testCustomerEdit() {
  try {
    console.log('🔍 Testing Customer Edit/Update Operations...\n');
    
    // Step 1: Login
    console.log('🔐 Step 1: Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'flowtest@example.com',
      password: 'password123'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }
    
    console.log('✅ Login successful');
    const token = loginResponse.data.token;
    
    // Step 2: Create a test customer first
    console.log('\n📝 Step 2: Creating test customer...');
    let customerId;
    try {
      const createResponse = await axios.post('http://localhost:5000/api/customers', {
        companyName: 'Test Company for Edit',
        contactName: 'Test Contact',
        email: 'testedit@example.com',
        phone: '1234567890',
        street: '123 Test St',
        city: 'Test City',
        status: 'active'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Customer created successfully');
      customerId = createResponse.data._id;
      console.log('   Customer ID:', customerId);
      
    } catch (error) {
      console.log('❌ Customer creation failed:');
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.message);
      } else {
        console.log('   Error:', error.message);
      }
      return;
    }
    
    // Step 3: Test updating the customer
    console.log('\n📝 Step 3: Testing customer update...');
    try {
      const updateResponse = await axios.put(`http://localhost:5000/api/customers/${customerId}`, {
        companyName: 'Updated Test Company',
        contactName: 'Updated Test Contact',
        email: 'updatedtest@example.com',
        phone: '0987654321',
        street: '456 Updated St',
        city: 'Updated City',
        status: 'inactive'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Customer updated successfully');
      console.log('   Updated company name:', updateResponse.data.companyName);
      console.log('   Updated status:', updateResponse.data.status);
      
    } catch (error) {
      console.log('❌ Customer update failed:');
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.message);
        console.log('   Data:', error.response.data);
      } else {
        console.log('   Error:', error.message);
      }
    }
    
    // Step 4: Test status change
    console.log('\n📝 Step 4: Testing status change...');
    try {
      const statusResponse = await axios.put(`http://localhost:5000/api/customers/${customerId}`, {
        status: 'suspended'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Status changed successfully');
      console.log('   New status:', statusResponse.data.status);
      
    } catch (error) {
      console.log('❌ Status change failed:');
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.message);
      } else {
        console.log('   Error:', error.message);
      }
    }
    
    // Step 5: Clean up - delete the test customer
    console.log('\n📝 Step 5: Cleaning up test customer...');
    try {
      const deleteResponse = await axios.delete(`http://localhost:5000/api/customers/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Test customer deleted successfully');
      
    } catch (error) {
      console.log('❌ Customer deletion failed:');
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.message);
      } else {
        console.log('   Error:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

if (require.main === module) {
  testCustomerEdit();
}

module.exports = testCustomerEdit;
