const { connect, disconnect } = require('../config/_db');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const User = require('../models/User');

async function checkSalesManagerPermissions() {
  await connect();
  
  try {
    console.log('🔍 Checking Sales Manager Permissions...\n');
    
    // Step 1: Find Sales Manager role
    console.log('📝 Step 1: Finding Sales Manager role...');
    const salesManagerRole = await Role.findOne({ name: 'Sales Manager', company_id: 'RESSICHEM' });
    
    if (!salesManagerRole) {
      console.log('❌ Sales Manager role not found');
      return;
    }
    
    console.log('✅ Sales Manager role found');
    console.log('   Role ID:', salesManagerRole._id);
    console.log('   Role Name:', salesManagerRole.name);
    
    // Step 2: Get role permissions
    console.log('\n📝 Step 2: Getting role permissions...');
    const roleWithPermissions = await Role.findById(salesManagerRole._id).populate('permissions');
    
    console.log(`✅ Role has ${roleWithPermissions.permissions.length} permissions:`);
    roleWithPermissions.permissions.forEach((perm, index) => {
      console.log(`   ${index + 1}. ${perm.key}: ${perm.description}`);
    });
    
    // Step 3: Check for dashboard permission
    console.log('\n📝 Step 3: Checking for dashboard permission...');
    const dashboardPermission = roleWithPermissions.permissions.find(p => p.key === 'view_dashboard');
    
    if (dashboardPermission) {
      console.log('✅ Dashboard permission found');
    } else {
      console.log('❌ Dashboard permission NOT found');
      console.log('   This is why the user cannot see the dashboard');
    }
    
    // Step 4: Check for other required permissions
    console.log('\n📝 Step 4: Checking for other required permissions...');
    const requiredPermissions = [
      'view_dashboard',
      'view_orders',
      'view_products',
      'customers.read',
      'customers.create',
      'order_view',
      'order_add'
    ];
    
    requiredPermissions.forEach(perm => {
      const hasPermission = roleWithPermissions.permissions.find(p => p.key === perm);
      if (hasPermission) {
        console.log(`   ✅ ${perm}: Found`);
      } else {
        console.log(`   ❌ ${perm}: Missing`);
      }
    });
    
    // Step 5: Find users with Sales Manager role
    console.log('\n📝 Step 5: Finding users with Sales Manager role...');
    const usersWithRole = await User.find({ 
      roles: salesManagerRole._id,
      company_id: 'RESSICHEM'
    }).select('user_id email firstName lastName');
    
    console.log(`✅ Found ${usersWithRole.length} users with Sales Manager role:`);
    usersWithRole.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.firstName} ${user.lastName})`);
    });
    
  } catch (error) {
    console.error('❌ Error checking Sales Manager permissions:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  checkSalesManagerPermissions();
}

module.exports = checkSalesManagerPermissions;
