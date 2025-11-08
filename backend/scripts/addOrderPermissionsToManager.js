const { connect, disconnect } = require('../config/_db');
const Role = require('../models/Role');
const Permission = require('../models/Permission');

async function addOrderPermissionsToManager() {
  await connect();
  
  try {
    console.log('🔍 Adding Order Permissions to Manager Role...\n');
    
    // Get Manager role
    const managerRole = await Role.findOne({ name: 'Manager', company_id: 'RESSICHEM' });
    if (!managerRole) {
      console.log('❌ Manager role not found');
      return;
    }
    
    console.log('✅ Manager role found');
    
    // Get all order permissions
    const orderPermissions = await Permission.find({
      key: { $regex: /^order/ },
      company_id: 'RESSICHEM'
    });
    
    console.log(`📋 Found ${orderPermissions.length} order permissions:`);
    orderPermissions.forEach(perm => {
      console.log(`   - ${perm.key}: ${perm.description}`);
    });
    
    // Add order permissions to Manager role
    const orderPermissionIds = orderPermissions.map(p => p._id);
    
    // Check which permissions are already assigned
    const existingPermissions = managerRole.permissions || [];
    const newPermissions = orderPermissionIds.filter(id => !existingPermissions.includes(id));
    
    if (newPermissions.length > 0) {
      managerRole.permissions = [...existingPermissions, ...newPermissions];
      await managerRole.save();
      
      console.log(`\n✅ Added ${newPermissions.length} order permissions to Manager role:`);
      newPermissions.forEach(id => {
        const perm = orderPermissions.find(p => p._id.equals(id));
        if (perm) {
          console.log(`   - ${perm.key}: ${perm.description}`);
        }
      });
    } else {
      console.log('\n✅ Manager role already has all order permissions');
    }
    
    // Verify the permissions
    console.log('\n🔍 Verifying Manager role permissions...');
    const updatedManager = await Role.findOne({ name: 'Manager', company_id: 'RESSICHEM' }).populate('permissions');
    
    console.log(`📋 Manager role now has ${updatedManager.permissions.length} permissions:`);
    updatedManager.permissions.forEach(perm => {
      console.log(`   - ${perm.key}: ${perm.description}`);
    });
    
    console.log('\n🎉 Order permissions added to Manager role successfully!');
    
  } catch (error) {
    console.error('❌ Error adding order permissions:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  addOrderPermissionsToManager();
}

module.exports = addOrderPermissionsToManager;
