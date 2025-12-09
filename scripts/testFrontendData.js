const { connect, disconnect } = require('../config/_db');
const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const bcrypt = require('bcrypt');

async function testFrontendData() {
  console.log('🔍 Testing Frontend Data Reception...\n');
  
  try {
    await connect();
    console.log('✅ Connected to MongoDB');

    // Find the test user we created
    const testUser = await User.findOne({ email: 'flowtest@example.com' })
      .populate('roles')
      .populate('permissions')
      .lean();

    if (!testUser) {
      console.log('❌ Test user not found. Please run testCompleteFlow.js first.');
      return;
    }

    console.log(`👤 Testing User: ${testUser.email}`);
    console.log(`   User ID: ${testUser.user_id}`);
    console.log(`   Company: ${testUser.company_id}`);

    // Simulate the exact getCurrentUser logic
    console.log('\n🔐 Simulating getCurrentUser API Response...');
    
    const { user_id, company_id } = { user_id: testUser.user_id, company_id: testUser.company_id };
    
    // Check if user is super admin
    const isSuperAdmin = testUser.isSuperAdmin === true || 
                        testUser.user_id === "super_admin_001" ||
                        testUser.email === "superadmin@ressichem.com" ||
                        testUser.roles.some(r => r.name === "Super Admin");

    const roleNames = testUser.roles.map(r => r.name);
    
    // Get permissions from roles
    let rolePermissions = testUser.roles.flatMap(r => r.permissions || []);
    let permissionGroups = testUser.roles.flatMap(r => r.permissionGroups || []);
    
    // Get direct permissions assigned to user
    let directPermissions = testUser.permissions || [];
    
    // Combine role permissions and direct permissions
    let permissions = [...rolePermissions, ...directPermissions];
    
    // Remove duplicates
    permissions = [...new Set(permissions)];

    // For super admin, get all permissions from database
    if (isSuperAdmin) {
      const allPermissions = await Permission.find({});
      permissions = allPermissions.map(p => p.key);
      permissionGroups = ["All"];
      roleNames.push("Super Admin");
    }

    // Create the exact response that frontend receives
    const frontendResponse = {
      success: true,
      data: {
        user_id: testUser.user_id,
        email: testUser.email,
        company_id: testUser.company_id,
        department: testUser.department,
        isSuperAdmin,
        roles: roleNames,
        permissions: [...new Set(permissions.map(p => typeof p === 'string' ? p : p.key))],
        permissionGroups: [...new Set(permissionGroups)],
        notifications: []
      }
    };

    console.log('\n📊 Frontend Response Data:');
    console.log(JSON.stringify(frontendResponse, null, 2));

    // Test frontend logic
    console.log('\n🎯 Testing Frontend Logic...');
    
    const user = frontendResponse.data;
    
    // Test routing logic (from frontend/src/app/page.tsx)
    let redirectPath = '/profile'; // Default
    if (user.isSuperAdmin) {
      redirectPath = '/admin/dashboard';
    } else if (user.roles && user.roles.length > 0) {
      redirectPath = '/dashboard';
    }
    
    console.log(`   Redirect Path: ${redirectPath}`);
    console.log(`   Is Super Admin: ${user.isSuperAdmin}`);
    console.log(`   Has Roles: ${user.roles && user.roles.length > 0}`);
    console.log(`   Roles: ${user.roles.join(', ')}`);
    console.log(`   Permissions: ${user.permissions.join(', ')}`);

    // Test permission checks (from frontend user-context.tsx)
    const hasPermission = (permission) => {
      if (!user) return false;
      if (user.isSuperAdmin) return true;
      return user.permissions?.includes(permission) || false;
    };

    console.log('\n🔑 Permission Tests:');
    console.log(`   dashboard.view: ${hasPermission('dashboard.view') ? '✅' : '❌'}`);
    console.log(`   users.view: ${hasPermission('users.view') ? '✅' : '❌'}`);
    console.log(`   users.create: ${hasPermission('users.create') ? '✅' : '❌'}`);
    console.log(`   customers.view: ${hasPermission('customers.view') ? '✅' : '❌'}`);

    // Test dashboard access
    const canAccessDashboard = hasPermission('dashboard.view') || user.isSuperAdmin;
    console.log(`\n🚪 Dashboard Access: ${canAccessDashboard ? '✅ YES' : '❌ NO'}`);

    // Test specific dashboard features
    console.log('\n🏠 Dashboard Features:');
    console.log(`   Can view users: ${hasPermission('users.view') ? '✅' : '❌'}`);
    console.log(`   Can create users: ${hasPermission('users.create') ? '✅' : '❌'}`);
    console.log(`   Can view customers: ${hasPermission('customers.view') ? '✅' : '❌'}`);

    // Summary
    console.log('\n📋 Summary:');
    console.log(`   ✅ User has roles: ${user.roles.length > 0}`);
    console.log(`   ✅ User has permissions: ${user.permissions.length > 0}`);
    console.log(`   ✅ Should redirect to: ${redirectPath}`);
    console.log(`   ✅ Can access dashboard: ${canAccessDashboard}`);

    if (canAccessDashboard) {
      console.log('\n🎉 SUCCESS: Frontend should receive correct data!');
      console.log('   - User will be redirected to /dashboard');
      console.log('   - User has proper permissions');
      console.log('   - Dashboard features should work');
    } else {
      console.log('\n❌ ISSUE: Frontend data may be incorrect');
      console.log('   - Check if permissions are being sent correctly');
      console.log('   - Verify frontend is processing data properly');
    }

  } catch (error) {
    console.error('❌ Error testing frontend data:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  testFrontendData();
}

module.exports = testFrontendData;
