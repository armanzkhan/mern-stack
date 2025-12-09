const { connect, disconnect } = require('../config/_db');
const Role = require('../models/Role');
const Permission = require('../models/Permission');

async function addMissingPermissionsToAdmin() {
  await connect();
  
  try {
    console.log('🔍 Adding Missing Permissions to Admin Role...\n');
    
    // Step 1: Find Admin role
    console.log('📝 Step 1: Finding Admin role...');
    const adminRole = await Role.findOne({ name: 'Admin', company_id: 'RESSICHEM' });
    
    if (!adminRole) {
      console.log('❌ Admin role not found');
      return;
    }
    
    console.log('✅ Admin role found');
    
    // Step 2: Find missing permissions
    console.log('\n📝 Step 2: Finding missing permissions...');
    const missingPermissions = [
      'dashboard.view',
      'users.view',
      'customer.view',
      'customer.create',
      'customer.update',
      'customer.delete'
    ];
    
    const permissions = await Permission.find({
      key: { $in: missingPermissions },
      company_id: 'RESSICHEM'
    });
    
    console.log(`✅ Found ${permissions.length} missing permissions:`);
    permissions.forEach(perm => {
      console.log(`   - ${perm.key}: ${perm.description}`);
    });
    
    // Step 3: Add permissions to role
    console.log('\n📝 Step 3: Adding permissions to Admin role...');
    const permissionIds = permissions.map(p => p._id);
    
    // Check which permissions are already assigned
    const existingPermissions = adminRole.permissions || [];
    const newPermissions = permissionIds.filter(id => !existingPermissions.includes(id));
    
    if (newPermissions.length > 0) {
      adminRole.permissions = [...existingPermissions, ...newPermissions];
      await adminRole.save();
      
      console.log(`✅ Added ${newPermissions.length} permissions to Admin role:`);
      newPermissions.forEach(id => {
        const perm = permissions.find(p => p._id.equals(id));
        if (perm) {
          console.log(`   - ${perm.key}: ${perm.description}`);
        }
      });
    } else {
      console.log('✅ Admin role already has all missing permissions');
    }
    
    // Step 4: Verify the permissions
    console.log('\n📝 Step 4: Verifying Admin role permissions...');
    const updatedRole = await Role.findById(adminRole._id).populate('permissions');
    
    console.log(`✅ Admin role now has ${updatedRole.permissions.length} permissions:`);
    
    // Check for the specific permissions we added
    console.log('\n🔍 Checking required permissions:');
    missingPermissions.forEach(perm => {
      const hasPermission = updatedRole.permissions.find(p => p.key === perm);
      if (hasPermission) {
        console.log(`   ✅ ${perm}: Found`);
      } else {
        console.log(`   ❌ ${perm}: Missing`);
      }
    });
    
    console.log('\n🎉 Admin role permissions updated successfully!');
    console.log('💡 The Admin user should now be able to see:');
    console.log('   - Dashboard (dashboard.view)');
    console.log('   - User Management (users.view)');
    console.log('   - Customer Management (customer.view, customer.create, etc.)');
    
  } catch (error) {
    console.error('❌ Error adding permissions:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  addMissingPermissionsToAdmin();
}

module.exports = addMissingPermissionsToAdmin;
