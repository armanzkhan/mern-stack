const { connect, disconnect } = require('../config/_db');
const Role = require('../models/Role');
const Permission = require('../models/Permission');

async function addMissingPermissionsToSalesManager() {
  await connect();
  
  try {
    console.log('🔍 Adding Missing Permissions to Sales Manager Role...\n');
    
    // Step 1: Find Sales Manager role
    console.log('📝 Step 1: Finding Sales Manager role...');
    const salesManagerRole = await Role.findOne({ name: 'Sales Manager', company_id: 'RESSICHEM' });
    
    if (!salesManagerRole) {
      console.log('❌ Sales Manager role not found');
      return;
    }
    
    console.log('✅ Sales Manager role found');
    
    // Step 2: Find missing permissions
    console.log('\n📝 Step 2: Finding missing permissions...');
    const missingPermissions = [
      'view_dashboard',
      'view_orders', 
      'view_products',
      'customers.read',
      'customers.create'
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
    console.log('\n📝 Step 3: Adding permissions to Sales Manager role...');
    const permissionIds = permissions.map(p => p._id);
    
    // Check which permissions are already assigned
    const existingPermissions = salesManagerRole.permissions || [];
    const newPermissions = permissionIds.filter(id => !existingPermissions.includes(id));
    
    if (newPermissions.length > 0) {
      salesManagerRole.permissions = [...existingPermissions, ...newPermissions];
      await salesManagerRole.save();
      
      console.log(`✅ Added ${newPermissions.length} permissions to Sales Manager role:`);
      newPermissions.forEach(id => {
        const perm = permissions.find(p => p._id.equals(id));
        if (perm) {
          console.log(`   - ${perm.key}: ${perm.description}`);
        }
      });
    } else {
      console.log('✅ Sales Manager role already has all missing permissions');
    }
    
    // Step 4: Verify the permissions
    console.log('\n📝 Step 4: Verifying Sales Manager role permissions...');
    const updatedRole = await Role.findById(salesManagerRole._id).populate('permissions');
    
    console.log(`✅ Sales Manager role now has ${updatedRole.permissions.length} permissions:`);
    
    // Check for the specific permissions we added
    const requiredPermissions = [
      'view_dashboard',
      'view_orders', 
      'view_products',
      'customers.read',
      'customers.create'
    ];
    
    console.log('\n🔍 Checking required permissions:');
    requiredPermissions.forEach(perm => {
      const hasPermission = updatedRole.permissions.find(p => p.key === perm);
      if (hasPermission) {
        console.log(`   ✅ ${perm}: Found`);
      } else {
        console.log(`   ❌ ${perm}: Missing`);
      }
    });
    
    console.log('\n🎉 Sales Manager permissions updated successfully!');
    console.log('💡 The Sales Manager user should now be able to see:');
    console.log('   - Dashboard');
    console.log('   - Orders page');
    console.log('   - Products page');
    console.log('   - Customer management');
    
  } catch (error) {
    console.error('❌ Error adding permissions:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  addMissingPermissionsToSalesManager();
}

module.exports = addMissingPermissionsToSalesManager;
