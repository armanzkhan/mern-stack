const { connect, disconnect } = require('../config/_db');
const User = require('../models/User');
const Role = require('../models/Role');

async function assignSalesManagerRole() {
  await connect();
  
  try {
    console.log('🔍 Assigning Sales Manager Role to User...\n');
    
    // Step 1: Find the sales user
    console.log('📝 Step 1: Finding sales user...');
    const salesUser = await User.findOne({ email: 'sales@ressichem.com' });
    
    if (!salesUser) {
      console.log('❌ Sales user not found');
      return;
    }
    
    console.log('✅ Sales user found');
    console.log('   User ID:', salesUser._id);
    console.log('   Email:', salesUser.email);
    console.log('   Name:', salesUser.firstName, salesUser.lastName);
    
    // Step 2: Find Sales Manager role
    console.log('\n📝 Step 2: Finding Sales Manager role...');
    const salesManagerRole = await Role.findOne({ name: 'Sales Manager', company_id: 'RESSICHEM' });
    
    if (!salesManagerRole) {
      console.log('❌ Sales Manager role not found');
      return;
    }
    
    console.log('✅ Sales Manager role found');
    console.log('   Role ID:', salesManagerRole._id);
    console.log('   Role Name:', salesManagerRole.name);
    
    // Step 3: Check current roles
    console.log('\n📝 Step 3: Checking current user roles...');
    console.log(`   User currently has ${salesUser.roles.length} roles`);
    
    if (salesUser.roles.includes(salesManagerRole._id)) {
      console.log('✅ User already has Sales Manager role');
      return;
    }
    
    // Step 4: Assign Sales Manager role
    console.log('\n📝 Step 4: Assigning Sales Manager role...');
    salesUser.roles.push(salesManagerRole._id);
    await salesUser.save();
    
    console.log('✅ Sales Manager role assigned successfully');
    
    // Step 5: Verify the assignment
    console.log('\n📝 Step 5: Verifying role assignment...');
    const updatedUser = await User.findById(salesUser._id).populate('roles');
    
    console.log(`✅ User now has ${updatedUser.roles.length} roles:`);
    updatedUser.roles.forEach((role, index) => {
      console.log(`   ${index + 1}. ${role.name} (ID: ${role._id})`);
    });
    
    console.log('\n🎉 Sales Manager role assigned successfully!');
    console.log('💡 The user should now see the correct role when they log in.');
    console.log('   They will have access to:');
    console.log('   - Dashboard');
    console.log('   - Orders management');
    console.log('   - Products management');
    console.log('   - Customer management');
    
  } catch (error) {
    console.error('❌ Error assigning role:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  assignSalesManagerRole();
}

module.exports = assignSalesManagerRole;
