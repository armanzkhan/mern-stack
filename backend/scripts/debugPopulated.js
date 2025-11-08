const { connect, disconnect } = require('../config/_db');
const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');

async function debugPopulated() {
  console.log('🔍 Debugging Populated Permissions...\n');
  
  try {
    await connect();
    console.log('✅ Connected to MongoDB');

    // Test the exact same query as getCurrentUser
    const user = await User.findOne({ email: 'flowtest@example.com' })
      .select("-password")
      .populate({
        path: "roles",
        populate: {
          path: "permissions",
          model: "Permission"
        }
      })
      .populate("permissions")
      .lean();

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`👤 User: ${user.email}`);
    console.log(`   User ID: ${user.user_id}`);

    // Check roles with populated permissions
    console.log('\n🛡️ Roles with Populated Permissions:');
    user.roles.forEach((role, index) => {
      console.log(`   Role ${index + 1}: ${role.name}`);
      console.log(`     ID: ${role._id}`);
      console.log(`     Permissions: ${JSON.stringify(role.permissions)}`);
      if (role.permissions && role.permissions.length > 0) {
        role.permissions.forEach((perm, permIndex) => {
          console.log(`       Permission ${permIndex + 1}: ${JSON.stringify(perm)}`);
        });
      }
    });

    // Check direct permissions
    console.log('\n🔑 Direct Permissions:');
    user.permissions.forEach((perm, index) => {
      console.log(`   Permission ${index + 1}: ${JSON.stringify(perm)}`);
    });

    // Test the permission loading logic
    console.log('\n🧮 Testing Permission Loading Logic:');
    
    const roleNames = user.roles.map(r => r.name);
    console.log(`   Role Names: ${JSON.stringify(roleNames)}`);
    
    let rolePermissions = user.roles.flatMap(r => r.permissions || []);
    console.log(`   Role Permissions: ${JSON.stringify(rolePermissions)}`);
    
    let directPermissions = user.permissions || [];
    console.log(`   Direct Permissions: ${JSON.stringify(directPermissions)}`);
    
    let permissions = [...rolePermissions, ...directPermissions];
    console.log(`   Combined Permissions: ${JSON.stringify(permissions)}`);
    
    // Filter and map
    permissions = [...new Set(permissions)].filter(p => p && p !== null && p !== undefined);
    console.log(`   Filtered Permissions: ${JSON.stringify(permissions)}`);
    
    const permissionKeys = permissions.map(p => {
      if (typeof p === 'string') {
        return p;
      } else if (p && p.key) {
        return p.key;
      } else {
        console.log(`   Warning: Permission without key: ${JSON.stringify(p)}`);
        return null;
      }
    }).filter(key => key !== null);
    
    console.log(`   Final Permission Keys: ${JSON.stringify(permissionKeys)}`);

  } catch (error) {
    console.error('❌ Error debugging populated permissions:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  debugPopulated();
}

module.exports = debugPopulated;
