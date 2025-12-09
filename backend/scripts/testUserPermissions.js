const { connect, disconnect } = require('../config/_db');
const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');

async function testUserPermissions() {
  await connect();
  
  try {
    console.log('🔍 Testing User Permissions...\n');
    
    // Find the test user
    const user = await User.findOne({ email: 'flowtest@example.com' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('👤 User:', user.email);
    console.log('   User ID:', user._id);
    console.log('   Company ID:', user.company_id);
    console.log('   Roles:', user.roles);
    
    // Get user's roles with permissions
    const userRoles = await Role.find({ _id: { $in: user.roles } }).populate('permissions');
    console.log('\n🛡️ User Roles:');
    userRoles.forEach((role, index) => {
      console.log(`   Role ${index + 1}: ${role.name}`);
      console.log(`   Permissions: ${role.permissions.map(p => p.key).join(', ')}`);
    });
    
    // Get all customer permissions
    const customerPermissions = await Permission.find({
      key: { $regex: /^customer\./ },
      company_id: user.company_id
    });
    
    console.log('\n📋 Available Customer Permissions:');
    customerPermissions.forEach(perm => {
      console.log(`   - ${perm.key}: ${perm.description}`);
    });
    
    // Check if user has customer permissions
    const userPermissionKeys = [];
    userRoles.forEach(role => {
      role.permissions.forEach(perm => {
        if (perm.key && perm.key.startsWith('customer.')) {
          userPermissionKeys.push(perm.key);
        }
      });
    });
    
    console.log('\n🔑 User Customer Permissions:');
    if (userPermissionKeys.length > 0) {
      userPermissionKeys.forEach(key => console.log(`   ✅ ${key}`));
    } else {
      console.log('   ❌ No customer permissions found');
    }
    
    // Test specific permissions
    const requiredPermissions = ['customer.view', 'customer.create', 'customer.update', 'customer.delete'];
    console.log('\n🧪 Testing Required Permissions:');
    requiredPermissions.forEach(perm => {
      const hasPermission = userPermissionKeys.includes(perm);
      console.log(`   ${perm}: ${hasPermission ? '✅ HAS' : '❌ MISSING'}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  testUserPermissions();
}

module.exports = testUserPermissions;