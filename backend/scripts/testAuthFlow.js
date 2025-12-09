const { connect, disconnect } = require('../config/_db');
const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function testAuthFlow() {
  console.log('🔍 Testing Complete Authentication Flow...\n');
  
  try {
    await connect();
    console.log('✅ Connected to MongoDB');

    // Find the test user we just created
    const testUser = await User.findOne({ email: 'testuser@example.com' })
      .populate('roles')
      .populate('permissions')
      .lean();

    if (!testUser) {
      console.log('❌ Test user not found. Please run createTestUser.js first.');
      return;
    }

    console.log(`👤 Testing User: ${testUser.email}`);
    console.log(`   User ID: ${testUser.user_id}`);
    console.log(`   Company: ${testUser.company_id}`);

    // Simulate login process
    console.log('\n🔐 Simulating Login Process:');
    
    // Check if user is super admin
    const isSuperAdmin = testUser.isSuperAdmin === true || 
                        testUser.user_id === "super_admin_001" ||
                        testUser.email === "superadmin@ressichem.com" ||
                        testUser.roles.some(r => r.name === "Super Admin");

    console.log(`   Is Super Admin: ${isSuperAdmin}`);

    // Get role names
    const roleNames = testUser.roles.map(r => r.name);
    console.log(`   Role Names: ${roleNames.join(', ')}`);

    // Get permissions from roles
    let rolePermissions = testUser.roles.flatMap(r => r.permissions || []);
    console.log(`   Role Permissions: ${rolePermissions.map(p => p.key || p).join(', ')}`);

    // Get direct permissions
    let directPermissions = testUser.permissions || [];
    console.log(`   Direct Permissions: ${directPermissions.map(p => p.key || p).join(', ')}`);

    // Combine permissions
    let permissions = [...rolePermissions, ...directPermissions];
    permissions = [...new Set(permissions)]; // Remove duplicates
    console.log(`   Combined Permissions: ${permissions.map(p => p.key || p).join(', ')}`);

    // Get permission groups
    let permissionGroups = testUser.roles.flatMap(r => r.permissionGroups || []);
    console.log(`   Permission Groups: ${permissionGroups.join(', ')}`);

    // For super admin, get all permissions
    if (isSuperAdmin) {
      const allPermissions = await Permission.find({});
      permissions = allPermissions.map(p => p.key);
      permissionGroups = ["All"];
      roleNames.push("Super Admin");
      console.log(`   Super Admin - All Permissions: ${permissions.join(', ')}`);
    }

    // Create JWT payload (simulating what getCurrentUser returns)
    const userData = {
      user_id: testUser.user_id,
      company_id: testUser.company_id,
      email: testUser.email,
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      phone: testUser.phone,
      department: testUser.department,
      roles: roleNames,
      permissions: permissions.map(p => typeof p === 'string' ? p : (p.key || p.toString())),
      permissionGroups: permissionGroups,
      isSuperAdmin: isSuperAdmin,
      isActive: testUser.isActive
    };

    console.log('\n📊 Final User Data (what frontend receives):');
    console.log(`   Roles: ${userData.roles.join(', ')}`);
    console.log(`   Permissions: ${userData.permissions.join(', ')}`);
    console.log(`   Permission Groups: ${userData.permissionGroups.join(', ')}`);
    console.log(`   Is Super Admin: ${userData.isSuperAdmin}`);

    // Test dashboard access
    const hasDashboardAccess = userData.permissions.some(p => 
      p.includes('dashboard') || 
      p.includes('view') ||
      p.includes('admin')
    ) || userData.isSuperAdmin;

    console.log(`\n🚪 Dashboard Access: ${hasDashboardAccess ? '✅ YES' : '❌ NO'}`);

    // Test specific permissions
    const hasUserCreate = userData.permissions.includes('users.create');
    const hasUserView = userData.permissions.includes('users.view');
    const hasDashboardView = userData.permissions.includes('dashboard.view');

    console.log(`\n🔑 Specific Permission Tests:`);
    console.log(`   users.create: ${hasUserCreate ? '✅' : '❌'}`);
    console.log(`   users.view: ${hasUserView ? '✅' : '❌'}`);
    console.log(`   dashboard.view: ${hasDashboardView ? '✅' : '❌'}`);

    if (!hasDashboardAccess) {
      console.log('\n💡 Issues Found:');
      console.log('   1. User may not have dashboard permissions');
      console.log('   2. Check if roles have proper permissions');
      console.log('   3. Check if direct permissions are assigned');
      console.log('   4. Verify frontend is using the correct permission checks');
    }

  } catch (error) {
    console.error('❌ Error testing auth flow:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  testAuthFlow();
}

module.exports = testAuthFlow;
