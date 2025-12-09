const { connect, disconnect } = require('../config/_db');
const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const bcrypt = require('bcrypt');

async function testCompleteFlow() {
  console.log('🔍 Testing Complete User Creation and Authentication Flow...\n');
  
  try {
    await connect();
    console.log('✅ Connected to MongoDB');

    // Step 1: Find or create permissions
    console.log('\n📝 Step 1: Finding/Creating Permissions...');
    let dashboardPermission = await Permission.findOne({ key: 'dashboard.view' });
    if (!dashboardPermission) {
      dashboardPermission = await Permission.create({
        key: 'dashboard.view',
        description: 'View dashboard',
        company_id: 'RESSICHEM'
      });
      console.log(`✅ Created permission: ${dashboardPermission.key}`);
    } else {
      console.log(`✅ Found existing permission: ${dashboardPermission.key}`);
    }

    let userPermission = await Permission.findOne({ key: 'users.view' });
    if (!userPermission) {
      userPermission = await Permission.create({
        key: 'users.view',
        description: 'View users',
        company_id: 'RESSICHEM'
      });
      console.log(`✅ Created permission: ${userPermission.key}`);
    } else {
      console.log(`✅ Found existing permission: ${userPermission.key}`);
    }

    // Step 2: Create role
    console.log('\n🛡️ Step 2: Creating Role...');
    const managerRole = await Role.create({
      name: 'Manager',
      description: 'Manager role with dashboard access',
      company_id: 'RESSICHEM',
      permissions: [dashboardPermission._id, userPermission._id]
    });
    console.log(`✅ Created role: ${managerRole.name}`);

    // Step 3: Create user with role and direct permissions
    console.log('\n👤 Step 3: Creating User...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const newUser = await User.create({
      user_id: `flow_test_${Date.now()}`,
      company_id: 'RESSICHEM',
      email: 'flowtest@example.com',
      password: hashedPassword,
      firstName: 'Flow',
      lastName: 'Test',
      phone: '+1234567890',
      department: 'Testing',
      roles: [managerRole._id],
      permissions: [dashboardPermission._id], // Direct permission
      isActive: true
    });
    console.log(`✅ Created user: ${newUser.email}`);

    // Step 4: Test authentication flow
    console.log('\n🔐 Step 4: Testing Authentication Flow...');
    
    // Simulate getCurrentUser
    const userWithData = await User.findOne({ email: 'flowtest@example.com' })
      .populate('roles')
      .populate('permissions')
      .lean();

    console.log(`   User: ${userWithData.email}`);
    console.log(`   Roles: ${userWithData.roles.map(r => r.name).join(', ')}`);
    console.log(`   Direct Permissions: ${userWithData.permissions.map(p => p.key).join(', ')}`);

    // Simulate getCurrentUser logic
    const roleNames = userWithData.roles.map(r => r.name);
    let rolePermissions = userWithData.roles.flatMap(r => r.permissions || []);
    let directPermissions = userWithData.permissions || [];
    let permissions = [...rolePermissions, ...directPermissions];
    permissions = [...new Set(permissions.map(p => p.key))];

    console.log(`   Combined Permissions: ${permissions.join(', ')}`);

    // Step 5: Test frontend permission checks
    console.log('\n🎯 Step 5: Testing Frontend Permission Checks...');
    
    const hasDashboardView = permissions.includes('dashboard.view');
    const hasUserView = permissions.includes('users.view');
    const hasUserCreate = permissions.includes('users.create');

    console.log(`   dashboard.view: ${hasDashboardView ? '✅' : '❌'}`);
    console.log(`   users.view: ${hasUserView ? '✅' : '❌'}`);
    console.log(`   users.create: ${hasUserCreate ? '✅' : '❌'}`);

    // Step 6: Test routing logic
    console.log('\n🚪 Step 6: Testing Routing Logic...');
    
    const isSuperAdmin = userWithData.isSuperAdmin;
    const hasRoles = userWithData.roles && userWithData.roles.length > 0;
    
    let redirectPath = '/profile'; // Default
    if (isSuperAdmin) {
      redirectPath = '/admin/dashboard';
    } else if (hasRoles) {
      redirectPath = '/dashboard';
    }

    console.log(`   Is Super Admin: ${isSuperAdmin}`);
    console.log(`   Has Roles: ${hasRoles}`);
    console.log(`   Redirect Path: ${redirectPath}`);

    // Step 7: Test dashboard access
    console.log('\n🏠 Step 7: Testing Dashboard Access...');
    
    const canAccessDashboard = hasDashboardView || isSuperAdmin;
    console.log(`   Can Access Dashboard: ${canAccessDashboard ? '✅ YES' : '❌ NO'}`);

    if (canAccessDashboard) {
      console.log('\n🎉 SUCCESS: User should be able to access dashboard!');
      console.log('   - User has proper roles and permissions');
      console.log('   - Backend sends correct permission keys');
      console.log('   - Frontend should receive proper data');
    } else {
      console.log('\n❌ ISSUE: User cannot access dashboard');
      console.log('   - Check if user has dashboard permissions');
      console.log('   - Verify backend permission loading');
      console.log('   - Check frontend permission checking logic');
    }

  } catch (error) {
    console.error('❌ Error in complete flow test:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  testCompleteFlow();
}

module.exports = testCompleteFlow;
