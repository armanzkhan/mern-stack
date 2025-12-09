const { connect, disconnect } = require('../config/_db');
const Role = require('../models/Role');
const Permission = require('../models/Permission');

async function checkAdminRolePermissions() {
  await connect();
  
  try {
    console.log('🔍 Checking Admin Role Permissions...\n');
    
    // Step 1: Find Admin role
    console.log('📝 Step 1: Finding Admin role...');
    const adminRole = await Role.findOne({ name: 'Admin', company_id: 'RESSICHEM' });
    
    if (!adminRole) {
      console.log('❌ Admin role not found');
      return;
    }
    
    console.log('✅ Admin role found');
    console.log('   Role ID:', adminRole._id);
    console.log('   Role Name:', adminRole.name);
    
    // Step 2: Get role permissions
    console.log('\n📝 Step 2: Getting role permissions...');
    const roleWithPermissions = await Role.findById(adminRole._id).populate('permissions');
    
    console.log(`✅ Role has ${roleWithPermissions.permissions.length} permissions:`);
    roleWithPermissions.permissions.forEach((perm, index) => {
      console.log(`   ${index + 1}. ${perm.key}: ${perm.description}`);
    });
    
    // Step 3: Check for required permissions
    console.log('\n📝 Step 3: Checking for required permissions...');
    const requiredPermissions = [
      'dashboard.view',
      'users.view',
      'user_view',
      'customer.view',
      'customer.create',
      'customer.update',
      'customer.delete',
      'order_view',
      'order_add',
      'product_view'
    ];
    
    requiredPermissions.forEach(perm => {
      const hasPermission = roleWithPermissions.permissions.find(p => p.key === perm);
      if (hasPermission) {
        console.log(`   ✅ ${perm}: Found`);
      } else {
        console.log(`   ❌ ${perm}: Missing`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error checking Admin permissions:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  checkAdminRolePermissions();
}

module.exports = checkAdminRolePermissions;
