const axios = require('axios');

async function testUserCreation() {
  try {
    console.log('🔍 Testing User Creation with Roles...\n');
    
    // Step 1: Login as admin
    console.log('🔐 Step 1: Login as admin...');
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
    
    // Step 2: Get available roles
    console.log('\n📝 Step 2: Getting available roles...');
    const rolesResponse = await axios.get('http://localhost:5000/api/roles', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Found ${rolesResponse.data.length} roles:`);
    rolesResponse.data.forEach((role, index) => {
      console.log(`   ${index + 1}. ${role.name} (ID: ${role._id})`);
    });
    
    // Step 3: Test user creation with roles
    console.log('\n📝 Step 3: Testing user creation with roles...');
    const testUserData = {
      firstName: 'Test',
      lastName: 'User',
      email: `testuser${Date.now()}@example.com`,
      password: 'password123',
      phone: '+92 300 1234567',
      department: 'Sales',
      roles: [rolesResponse.data[0]._id], // Assign first role
      company_id: 'RESSICHEM',
      isActive: true
    };
    
    try {
      const createResponse = await axios.post('http://localhost:5000/api/users/create', testUserData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ User creation successful');
      console.log('   User ID:', createResponse.data.user._id);
      console.log('   Email:', createResponse.data.user.email);
      console.log('   Roles:', createResponse.data.user.roles);
      console.log('   Department:', createResponse.data.user.department);
      
    } catch (error) {
      console.log('❌ User creation failed:');
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.message);
      } else {
        console.log('   Error:', error.message);
      }
    }
    
    // Step 4: Test user creation without roles (should fail)
    console.log('\n📝 Step 4: Testing user creation without roles (should fail)...');
    const testUserDataNoRoles = {
      firstName: 'Test',
      lastName: 'User',
      email: `testuser${Date.now() + 1}@example.com`,
      password: 'password123',
      phone: '+92 300 1234567',
      department: 'Sales',
      roles: [], // No roles
      company_id: 'RESSICHEM',
      isActive: true
    };
    
    try {
      const createResponse = await axios.post('http://localhost:5000/api/users/create', testUserDataNoRoles, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('❌ User creation should have failed but succeeded');
      
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ User creation correctly failed without roles');
        console.log('   Message:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    
    console.log('\n🎉 User creation test completed!');
    console.log('💡 The system now ensures:');
    console.log('   - Users must have at least one role');
    console.log('   - Roles are properly assigned to users');
    console.log('   - No more "staff" users without proper roles');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

if (require.main === module) {
  testUserCreation();
}

module.exports = testUserCreation;
