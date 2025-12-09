const { connect, disconnect } = require('../config/_db');
const Permission = require('../models/Permission');

async function checkAllPermissions() {
  await connect();
  
  try {
    console.log('🔍 Checking All Available Permissions...\n');
    
    const permissions = await Permission.find({ company_id: 'RESSICHEM' }).sort({ key: 1 });
    
    console.log(`✅ Found ${permissions.length} permissions in database:`);
    permissions.forEach((perm, index) => {
      console.log(`   ${index + 1}. ${perm.key}: ${perm.description}`);
    });
    
    // Check for specific permissions we need
    console.log('\n🔍 Checking for specific permissions:');
    const requiredPermissions = [
      'view_dashboard',
      'view_orders', 
      'view_products',
      'customers.read',
      'customers.create'
    ];
    
    requiredPermissions.forEach(perm => {
      const found = permissions.find(p => p.key === perm);
      if (found) {
        console.log(`   ✅ ${perm}: Found`);
      } else {
        console.log(`   ❌ ${perm}: Missing`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error checking permissions:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  checkAllPermissions();
}

module.exports = checkAllPermissions;
