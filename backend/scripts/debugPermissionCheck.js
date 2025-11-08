const axios = require('axios');

async function debugPermissionCheck() {
  try {
    console.log('🔍 Debugging Permission Check...\n');
    
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
    
    // Decode the JWT to see what's in it
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(token);
    console.log('\n🔍 JWT Payload:');
    console.log('   User ID:', decoded.user_id);
    console.log('   Company ID:', decoded.company_id);
    console.log('   Roles:', decoded.roles);
    console.log('   Permissions:', decoded.permissions);
    console.log('   Is Super Admin:', decoded.isSuperAdmin);
    
    // Step 2: Test a simple GET request first
    console.log('\n📝 Step 2: Testing GET customers...');
    
    try {
      const getResponse = await axios.get('http://localhost:5000/api/customers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ GET customers successful');
      console.log('   Response length:', getResponse.data.length);
      
    } catch (error) {
      console.log('❌ GET customers failed:');
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.message);
      } else {
        console.log('   Error:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

if (require.main === module) {
  debugPermissionCheck();
}

module.exports = debugPermissionCheck;
