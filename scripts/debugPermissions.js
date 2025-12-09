const { connect, disconnect } = require('../config/_db');
const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');

async function debugPermissions() {
  console.log('🔍 Debugging Permissions...\n');
  
  try {
    await connect();
    console.log('✅ Connected to MongoDB');

    // Find the test user
    const testUser = await User.findOne({ email: 'flowtest@example.com' })
      .populate('roles')
      .populate('permissions')
      .lean();

    if (!testUser) {
      console.log('❌ Test user not found');
      return;
    }

    console.log(`👤 User: ${testUser.email}`);
    console.log(`   User ID: ${testUser.user_id}`);

    // Check roles
    console.log('\n🛡️ Roles:');
    testUser.roles.forEach((role, index) => {
      console.log(`   Role ${index + 1}: ${role.name}`);
      console.log(`     ID: ${role._id}`);
      console.log(`     Permissions: ${JSON.stringify(role.permissions)}`);
      console.log(`     Permission Groups: ${JSON.stringify(role.permissionGroups)}`);
    });

    // Check direct permissions
    console.log('\n🔑 Direct Permissions:');
    testUser.permissions.forEach((perm, index) => {
      console.log(`   Permission ${index + 1}:`);
      console.log(`     ID: ${perm._id}`);
      console.log(`     Key: ${perm.key}`);
      console.log(`     Description: ${perm.description}`);
    });

    // Debug the permission loading logic
    console.log('\n🧮 Permission Loading Logic:');
    
    const roleNames = testUser.roles.map(r => r.name);
    console.log(`   Role Names: ${JSON.stringify(roleNames)}`);
    
    let rolePermissions = testUser.roles.flatMap(r => r.permissions || []);
    console.log(`   Role Permissions (raw): ${JSON.stringify(rolePermissions)}`);
    
    let permissionGroups = testUser.roles.flatMap(r => r.permissionGroups || []);
    console.log(`   Permission Groups (raw): ${JSON.stringify(permissionGroups)}`);
    
    let directPermissions = testUser.permissions || [];
    console.log(`   Direct Permissions (raw): ${JSON.stringify(directPermissions)}`);
    
    let permissions = [...rolePermissions, ...directPermissions];
    console.log(`   Combined Permissions (raw): ${JSON.stringify(permissions)}`);
    
    // Filter and map
    permissions = [...new Set(permissions)].filter(p => p && p !== null && p !== undefined);
    console.log(`   Filtered Permissions: ${JSON.stringify(permissions)}`);
    
    const permissionKeys = permissions.map(p => typeof p === 'string' ? p : p.key);
    console.log(`   Permission Keys: ${JSON.stringify(permissionKeys)}`);

    // Check if any role has null permissions
    console.log('\n🔍 Checking for null values:');
    testUser.roles.forEach((role, index) => {
      if (role.permissions) {
        role.permissions.forEach((perm, permIndex) => {
          console.log(`   Role ${index + 1}, Permission ${permIndex + 1}: ${perm} (type: ${typeof perm})`);
        });
      }
    });

  } catch (error) {
    console.error('❌ Error debugging permissions:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  debugPermissions();
}

module.exports = debugPermissions;
