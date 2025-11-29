const { connect, disconnect } = require('../config/_db');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const User = require('../models/User');

async function checkAdministratorPermissions() {
  await connect();
  
  try {
    console.log('🔍 Checking Administrator Role Permissions...\n');
    
    // Step 1: Find Administrator role
    console.log('📝 Step 1: Finding Administrator role...');
    const adminRole = await Role.findOne({ name: 'Administrator', company_id: 'RESSICHEM' });
    
    if (!adminRole) {
      console.log('❌ Administrator role not found');
      return;
    }
    
    console.log('✅ Administrator role found');
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
    
    // Step 4: Find users with Administrator role
    console.log('\n📝 Step 4: Finding users with Administrator role...');
    const usersWithRole = await User.find({ 
      roles: adminRole._id,
      company_id: 'RESSICHEM'
    }).select('user_id email firstName lastName');
    
    console.log(`✅ Found ${usersWithRole.length} users with Administrator role:`);
    usersWithRole.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.firstName} ${user.lastName})`);
    });
    
    // Step 5: Check specific user
    console.log('\n📝 Step 5: Checking zain@ressichem.com user...');
    const zainUser = await User.findOne({ email: 'zain@ressichem.com' })
      .populate('roles');
    
    if (zainUser) {
      console.log('✅ User found');
      console.log('   Email:', zainUser.email);
      console.log('   Name:', zainUser.firstName, zainUser.lastName);
      console.log('   Roles:', zainUser.roles.map(r => r.name).join(', '));
      console.log('   Has Administrator role:', zainUser.roles.some(r => r.name === 'Administrator'));
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Error checking Administrator permissions:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  checkAdministratorPermissions();
}

module.exports = checkAdministratorPermissions;
