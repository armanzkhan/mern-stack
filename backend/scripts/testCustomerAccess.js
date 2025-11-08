const { connect, disconnect } = require('../config/_db');
const User = require('../models/User');
const Permission = require('../models/Permission');
const Role = require('../models/Role');

async function testCustomerAccess() {
  console.log('🔍 Testing Customer Access...\n');
  
  try {
    await connect();
    console.log('✅ Connected to MongoDB');

    // Find the test user with all permissions
    const testUser = await User.findOne({ email: 'flowtest@example.com' })
      .populate('permissions')
      .populate({
        path: 'roles',
        populate: {
          path: 'permissions',
          model: 'Permission'
        }
      })
      .lean();

    if (!testUser) {
      console.log('❌ Test user not found');
      return;
    }

    console.log(`👤 User: ${testUser.email}`);
    console.log(`   User ID: ${testUser.user_id}`);

    // Check direct permissions
    console.log('\n🔑 Direct Permissions:');
    testUser.permissions.forEach(perm => {
      console.log(`   - ${perm.key}: ${perm.description}`);
    });

    // Check role permissions
    console.log('\n🛡️ Role Permissions:');
    testUser.roles.forEach(role => {
      console.log(`   Role: ${role.name}`);
      if (role.permissions) {
        role.permissions.forEach(perm => {
          console.log(`     - ${perm.key}: ${perm.description}`);
        });
      }
    });

    // Simulate the getCurrentUser logic
    console.log('\n🧮 Simulating getCurrentUser logic:');
    
    const roleNames = testUser.roles.map(r => r.name);
    let rolePermissions = testUser.roles.flatMap(r => r.permissions || []);
    let directPermissions = testUser.permissions || [];
    let permissions = [...rolePermissions, ...directPermissions];
    permissions = [...new Set(permissions)].filter(p => p && p !== null && p !== undefined);
    
    const permissionKeys = permissions.map(p => typeof p === 'string' ? p : p.key);
    console.log(`   Combined permissions: ${permissionKeys.join(', ')}`);

    // Check if user has customer.view permission
    const hasCustomerView = permissionKeys.includes('customer.view');
    const hasCustomerCreate = permissionKeys.includes('customer.create');
    
    console.log(`\n🎯 Permission Tests:`);
    console.log(`   customer.view: ${hasCustomerView ? '✅' : '❌'}`);
    console.log(`   customer.create: ${hasCustomerCreate ? '✅' : '❌'}`);

    if (hasCustomerView) {
      console.log('\n🎉 SUCCESS: User has customer.view permission!');
      console.log('   The orders create page should now show real customers.');
      console.log('   User needs to log in again to get fresh token with new permissions.');
    } else {
      console.log('\n❌ ISSUE: User still lacks customer.view permission');
      console.log('   This might be a caching issue or the permissions were not saved correctly.');
    }

  } catch (error) {
    console.error('❌ Error testing customer access:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  testCustomerAccess();
}

module.exports = testCustomerAccess;
