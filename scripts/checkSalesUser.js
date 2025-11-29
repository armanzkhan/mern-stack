const { connect, disconnect } = require('../config/_db');
const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');

async function checkSalesUser() {
  await connect();
  
  try {
    console.log('🔍 Checking Sales User...\n');
    
    // Step 1: Find the sales user
    console.log('📝 Step 1: Finding sales user...');
    const salesUser = await User.findOne({ email: 'sales@ressichem.com' })
      .populate('roles')
      .populate('permissions');
    
    if (!salesUser) {
      console.log('❌ Sales user not found');
      return;
    }
    
    console.log('✅ Sales user found');
    console.log('   User ID:', salesUser._id);
    console.log('   Email:', salesUser.email);
    console.log('   First Name:', salesUser.firstName);
    console.log('   Last Name:', salesUser.lastName);
    console.log('   Company ID:', salesUser.company_id);
    console.log('   Is Super Admin:', salesUser.isSuperAdmin);
    
    // Step 2: Check user roles
    console.log('\n📝 Step 2: Checking user roles...');
    console.log(`   User has ${salesUser.roles.length} roles:`);
    salesUser.roles.forEach((role, index) => {
      console.log(`     ${index + 1}. ${role.name} (ID: ${role._id})`);
    });
    
    // Step 3: Check if user has Sales Manager role
    console.log('\n📝 Step 3: Checking for Sales Manager role...');
    const hasSalesManagerRole = salesUser.roles.some(role => role.name === 'Sales Manager');
    
    if (hasSalesManagerRole) {
      console.log('✅ User has Sales Manager role');
    } else {
      console.log('❌ User does NOT have Sales Manager role');
      console.log('   This is why the user is showing as "staff"');
    }
    
    // Step 4: Check what roles the user actually has
    console.log('\n📝 Step 4: User role details...');
    salesUser.roles.forEach((role, index) => {
      console.log(`   Role ${index + 1}:`);
      console.log(`     Name: ${role.name}`);
      console.log(`     ID: ${role._id}`);
      console.log(`     Company: ${role.company_id}`);
    });
    
    // Step 5: Check if there are any other users with Sales Manager role
    console.log('\n📝 Step 5: Checking other users with Sales Manager role...');
    const salesManagerRole = await Role.findOne({ name: 'Sales Manager', company_id: 'RESSICHEM' });
    
    if (salesManagerRole) {
      const usersWithSalesManagerRole = await User.find({ 
        roles: salesManagerRole._id,
        company_id: 'RESSICHEM'
      }).select('email firstName lastName');
      
      console.log(`✅ Found ${usersWithSalesManagerRole.length} users with Sales Manager role:`);
      usersWithSalesManagerRole.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.firstName} ${user.lastName})`);
      });
    } else {
      console.log('❌ Sales Manager role not found');
    }
    
  } catch (error) {
    console.error('❌ Error checking sales user:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  checkSalesUser();
}

module.exports = checkSalesUser;
