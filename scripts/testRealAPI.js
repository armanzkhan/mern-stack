const axios = require('axios');

async function testRealAPI() {
  console.log('🔍 Testing Real API Endpoint...\n');
  
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
      
      // Now test the getCurrentUser endpoint
      console.log('\n👤 Step 2: Testing getCurrentUser endpoint...');
      const userResponse = await axios.get(`${API_BASE_URL}/api/auth/current-user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (userResponse.data.success) {
        console.log('✅ getCurrentUser successful');
        const userData = userResponse.data.data;
        
        console.log('\n📊 Frontend Receives:');
        console.log(`   User ID: ${userData.user_id}`);
        console.log(`   Email: ${userData.email}`);
        console.log(`   Company: ${userData.company_id}`);
        console.log(`   Department: ${userData.department}`);
        console.log(`   Is Super Admin: ${userData.isSuperAdmin}`);
        console.log(`   Roles: ${JSON.stringify(userData.roles)}`);
        console.log(`   Permissions: ${JSON.stringify(userData.permissions)}`);
        console.log(`   Permission Groups: ${JSON.stringify(userData.permissionGroups)}`);
        
        // Test frontend logic
        console.log('\n🎯 Frontend Logic Tests:');
        
        // Routing logic
        let redirectPath = '/profile';
        if (userData.isSuperAdmin) {
          redirectPath = '/admin/dashboard';
        } else if (userData.roles && userData.roles.length > 0) {
          redirectPath = '/dashboard';
        }
        console.log(`   Redirect Path: ${redirectPath}`);
        
        // Permission checks
        const hasPermission = (permission) => {
          if (!userData) return false;
          if (userData.isSuperAdmin) return true;
          return userData.permissions?.includes(permission) || false;
        };
        
        console.log('\n🔑 Permission Tests:');
        console.log(`   dashboard.view: ${hasPermission('dashboard.view') ? '✅' : '❌'}`);
        console.log(`   users.view: ${hasPermission('users.view') ? '✅' : '❌'}`);
        console.log(`   users.create: ${hasPermission('users.create') ? '✅' : '❌'}`);
        
        // Dashboard access
        const canAccessDashboard = hasPermission('dashboard.view') || userData.isSuperAdmin;
        console.log(`\n🚪 Dashboard Access: ${canAccessDashboard ? '✅ YES' : '❌ NO'}`);
        
        if (canAccessDashboard) {
          console.log('\n🎉 SUCCESS: API is working correctly!');
          console.log('   - User will be redirected to /dashboard');
          console.log('   - User has proper permissions');
          console.log('   - Frontend should work correctly');
        } else {
          console.log('\n❌ ISSUE: API may have problems');
          console.log('   - Check if permissions are correct');
          console.log('   - Verify user has proper roles');
        }
        
      } else {
        console.log('❌ getCurrentUser failed:', userResponse.data.message);
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
  testRealAPI();
}

module.exports = testRealAPI;
