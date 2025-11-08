const { connect, disconnect } = require('../config/_db');
const Role = require('../models/Role');
const Permission = require('../models/Permission');

async function addCorrectPermissionsToSalesManager() {
  await connect();
  
  try {
    console.log('🔍 Adding Correct Permissions to Sales Manager Role...\n');
    
    // Step 1: Find Sales Manager role
    console.log('📝 Step 1: Finding Sales Manager role...');
    const salesManagerRole = await Role.findOne({ name: 'Sales Manager', company_id: 'RESSICHEM' });
    
    if (!salesManagerRole) {
      console.log('❌ Sales Manager role not found');
      return;
    }
    
    console.log('✅ Sales Manager role found');
    
    // Step 2: Find the correct permissions
    console.log('\n📝 Step 2: Finding correct permissions...');
    const correctPermissions = [
      'dashboard.view',
      'order_view', 
      'product_view',
      'customer.view',
      'customer.create'
    ];
    
    const permissions = await Permission.find({
      key: { $in: correctPermissions },
      company_id: 'RESSICHEM'
    });
    
    console.log(`✅ Found ${permissions.length} correct permissions:`);
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
      console.log('✅ Sales Manager role already has all correct permissions');
    }
    
    // Step 4: Verify the permissions
    console.log('\n📝 Step 4: Verifying Sales Manager role permissions...');
    const updatedRole = await Role.findById(salesManagerRole._id).populate('permissions');
    
    console.log(`✅ Sales Manager role now has ${updatedRole.permissions.length} permissions:`);
    
    // Check for the specific permissions we added
    console.log('\n🔍 Checking required permissions:');
    correctPermissions.forEach(perm => {
      const hasPermission = updatedRole.permissions.find(p => p.key === perm);
      if (hasPermission) {
        console.log(`   ✅ ${perm}: Found`);
      } else {
        console.log(`   ❌ ${perm}: Missing`);
      }
    });
    
    console.log('\n🎉 Sales Manager permissions updated successfully!');
    console.log('💡 The Sales Manager user should now be able to see:');
    console.log('   - Dashboard (dashboard.view)');
    console.log('   - Orders page (order_view)');
    console.log('   - Products page (product_view)');
    console.log('   - Customer management (customer.view, customer.create)');
    
  } catch (error) {
    console.error('❌ Error adding permissions:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  addCorrectPermissionsToSalesManager();
}

module.exports = addCorrectPermissionsToSalesManager;
