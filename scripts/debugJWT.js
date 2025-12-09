const axios = require('axios');
const jwt = require('jsonwebtoken');

async function debugJWT() {
  try {
    console.log('🔍 Debugging JWT Creation...\n');
    
    // Step 1: Login
    console.log('🔐 Step 1: Login...');
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
    
    // Step 2: Decode JWT
    console.log('\n🔍 Step 2: Decoding JWT...');
    const decoded = jwt.decode(token);
    
    console.log('📋 Raw JWT Payload:');
    console.log(JSON.stringify(decoded, null, 2));
    
    // Step 3: Check specific fields
    console.log('\n🔍 Step 3: Checking specific fields...');
    console.log('   user_id:', decoded.user_id);
    console.log('   company_id:', decoded.company_id);
    console.log('   roles:', decoded.roles);
    console.log('   permissions:', decoded.permissions);
    console.log('   isSuperAdmin:', decoded.isSuperAdmin);
    
    // Step 4: Check if permissions contain order permissions
    if (decoded.permissions && Array.isArray(decoded.permissions)) {
      console.log('\n🔍 Step 4: Checking for order permissions...');
      const orderPermissions = decoded.permissions.filter(p => p && p.includes('order'));
      console.log(`   Found ${orderPermissions.length} order permissions:`);
      orderPermissions.forEach(perm => {
        console.log(`     - ${perm}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

if (require.main === module) {
  debugJWT();
}

module.exports = debugJWT;
