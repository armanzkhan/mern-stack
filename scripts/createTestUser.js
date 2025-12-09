const { connect, disconnect } = require('../config/_db');
const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const bcrypt = require('bcrypt');

async function createTestUser() {
  console.log('🔍 Creating Test User with Roles and Permissions...\n');
  
  try {
    await connect();
    console.log('✅ Connected to MongoDB');

    // Create a test permission
    const testPermission = await Permission.create({
      key: 'dashboard.view',
      description: 'View dashboard',
      company_id: 'RESSICHEM'
    });
    console.log(`✅ Created permission: ${testPermission.key}`);

    // Create a test role
    const testRole = await Role.create({
      name: 'Test Manager',
      description: 'Test role for dashboard access',
      company_id: 'RESSICHEM',
      permissions: [testPermission._id]
    });
    console.log(`✅ Created role: ${testRole.name}`);

    // Create a test user
    const hashedPassword = await bcrypt.hash('test123', 10);
    const testUser = await User.create({
      user_id: `test_user_${Date.now()}`,
      company_id: 'RESSICHEM',
      email: 'testuser@example.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      phone: '+1234567890',
      department: 'Testing',
      roles: [testRole._id],
      permissions: [testPermission._id], // Direct permission
      isActive: true
    });
    console.log(`✅ Created test user: ${testUser.email}`);

    // Test the user's permissions
    const userWithPermissions = await User.findById(testUser._id)
      .populate('roles')
      .populate('permissions')
      .lean();

    console.log('\n🧮 Test User Permissions:');
    console.log(`   Email: ${userWithPermissions.email}`);
    console.log(`   Roles: ${userWithPermissions.roles.map(r => r.name).join(', ')}`);
    console.log(`   Direct Permissions: ${userWithPermissions.permissions.map(p => p.key).join(', ')}`);
    
    // Simulate getCurrentUser logic
    const rolePermissions = userWithPermissions.roles.flatMap(r => r.permissions || []);
    const directPermissions = userWithPermissions.permissions || [];
    const allPermissions = [...rolePermissions, ...directPermissions];
    
    console.log(`   All Permissions: ${allPermissions.map(p => p.key || p).join(', ')}`);
    
    const hasDashboardAccess = allPermissions.some(p => {
      const permissionKey = typeof p === 'string' ? p : (p.key || p.toString());
      return permissionKey.includes('dashboard') || 
             permissionKey.includes('view');
    });

    console.log(`\n🚪 Dashboard Access: ${hasDashboardAccess ? '✅ YES' : '❌ NO'}`);

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  createTestUser();
}

module.exports = createTestUser;
