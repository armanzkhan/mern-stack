// Test roles API to check if Customer role exists
const mongoose = require('mongoose');
const Role = require('./models/Role');
const Permission = require('./models/Permission');

async function testRolesAPI() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB - Database: Ressichem');

    console.log('\n🧪 TESTING ROLES API:');
    
    // Check all roles in database
    const allRoles = await Role.find({ company_id: 'RESSICHEM' });
    console.log(`\n📊 Total roles in database: ${allRoles.length}`);
    
    allRoles.forEach((role, index) => {
      console.log(`   ${index + 1}. ${role.name} (${role._id})`);
      console.log(`      Description: ${role.description || 'No description'}`);
      console.log(`      Permissions: ${role.permissions?.length || 0}`);
    });

    // Check specifically for Customer role
    const customerRole = await Role.findOne({ 
      name: 'Customer', 
      company_id: 'RESSICHEM' 
    });
    
    if (customerRole) {
      console.log(`\n✅ Customer role found:`);
      console.log(`   ID: ${customerRole._id}`);
      console.log(`   Name: ${customerRole.name}`);
      console.log(`   Description: ${customerRole.description}`);
      console.log(`   Permissions: ${customerRole.permissions?.length || 0}`);
      
      if (customerRole.permissions && customerRole.permissions.length > 0) {
        console.log(`   Permission details:`);
        const rolePermissions = await Permission.find({ 
          _id: { $in: customerRole.permissions } 
        });
        rolePermissions.forEach((perm, index) => {
          console.log(`     ${index + 1}. ${perm.key}: ${perm.description}`);
        });
      }
    } else {
      console.log(`\n❌ Customer role not found in database`);
      console.log(`   This is why the Customer role is not showing on the frontend`);
    }

    // Check all permissions
    const allPermissions = await Permission.find({ company_id: 'RESSICHEM' });
    console.log(`\n📊 Total permissions in database: ${allPermissions.length}`);
    
    const customerPermissions = allPermissions.filter(perm => 
      perm.key.includes('orders') || 
      perm.key.includes('products') || 
      perm.key.includes('customers') ||
      perm.key.includes('notifications')
    );
    
    console.log(`\n🔑 Customer-relevant permissions: ${customerPermissions.length}`);
    customerPermissions.forEach((perm, index) => {
      console.log(`   ${index + 1}. ${perm.key}: ${perm.description}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Roles API test completed!');

  } catch (error) {
    console.error('❌ Roles API test failed:', error);
    process.exit(1);
  }
}

testRolesAPI();
