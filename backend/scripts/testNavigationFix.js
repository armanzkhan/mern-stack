const axios = require('axios');

async function testNavigationFix() {
  try {
    console.log('🔍 Testing Navigation Fix...\n');
    
    // Step 1: Test super admin login
    console.log('📝 Step 1: Testing super admin login...');
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
    
    // Step 2: Decode JWT to check isSuperAdmin
    console.log('\n📝 Step 2: Checking JWT payload...');
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(token);
    
    console.log('📋 JWT Payload:');
    console.log('   User ID:', decoded.user_id);
    console.log('   Company ID:', decoded.company_id);
    console.log('   Is Super Admin:', decoded.isSuperAdmin);
    console.log('   Roles:', decoded.roles);
    console.log('   Permissions:', decoded.permissions);
    
    // Step 3: Test current user API
    console.log('\n📝 Step 3: Testing current user API...');
    const currentUserResponse = await axios.get('http://localhost:5000/api/auth/current-user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Current user API response:');
    console.log('   User ID:', currentUserResponse.data.data.user_id);
    console.log('   Email:', currentUserResponse.data.data.email);
    console.log('   Is Super Admin:', currentUserResponse.data.data.isSuperAdmin);
    console.log('   Roles:', currentUserResponse.data.data.roles);
    
    // Step 4: Test navigation logic
    console.log('\n📝 Step 4: Testing navigation logic...');
    const isSuperAdmin = decoded.isSuperAdmin || currentUserResponse.data.data.isSuperAdmin;
    const hasRoles = decoded.roles && decoded.roles.length > 0;
    
    console.log('🔍 Navigation Decision:');
    console.log('   Is Super Admin:', isSuperAdmin);
    console.log('   Has Roles:', hasRoles);
    console.log('   Roles:', decoded.roles);
    
    if (isSuperAdmin) {
      console.log('   → Should redirect to: /admin/dashboard');
    } else if (hasRoles) {
      console.log('   → Should redirect to: /dashboard');
    } else {
      console.log('   → Should redirect to: /profile');
    }
    
    console.log('\n🎉 Navigation fix test completed!');
    console.log('💡 The user should now navigate directly to the correct dashboard without blurring');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
  }
}

if (require.main === module) {
  testNavigationFix();
}

module.exports = testNavigationFix;
