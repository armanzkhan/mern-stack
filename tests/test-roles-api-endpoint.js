// Test the actual roles API endpoint
const mongoose = require('mongoose');
const User = require('./models/User');
const authService = require('./services/authService');

async function testRolesAPIEndpoint() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB - Database: Ressichem');

    console.log('\n🧪 TESTING ROLES API ENDPOINT:');
    
    // Get a user with admin permissions to test the API
    const adminUser = await User.findOne({ 
      email: 'admin@ressichem.com' 
    }).populate({
      path: 'roles',
      populate: {
        path: 'permissions'
      }
    });

    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log(`\n👤 Testing with: ${adminUser.firstName} ${adminUser.lastName} (${adminUser.email})`);
    console.log(`   Is Super Admin: ${adminUser.isSuperAdmin}`);
    console.log(`   Company ID: ${adminUser.company_id}`);

    // Generate token for the admin user
    const token = authService.generateToken(adminUser);
    console.log(`✅ Generated token for admin user`);

    // Test the roles API endpoint
    try {
      const response = await fetch('http://localhost:5000/api/roles', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`\n📡 Roles API Response Status: ${response.status}`);
      
      if (response.ok) {
        const roles = await response.json();
        console.log(`✅ Roles API working! Found ${roles.length} roles`);
        
        roles.forEach((role, index) => {
          console.log(`   ${index + 1}. ${role.name} (${role._id})`);
          console.log(`      Description: ${role.description || 'No description'}`);
          console.log(`      Permissions: ${role.permissions?.length || 0}`);
          
          if (role.name === 'Customer') {
            console.log(`      ✅ Customer role found in API response!`);
            if (role.permissions && role.permissions.length > 0) {
              console.log(`      Customer permissions:`);
              role.permissions.forEach((perm, i) => {
                console.log(`         ${i + 1}. ${perm.key}: ${perm.description}`);
              });
            }
          }
        });
      } else {
        const errorData = await response.json();
        console.log(`❌ Roles API failed: ${errorData.message}`);
      }
    } catch (apiError) {
      console.log(`❌ Roles API call failed: ${apiError.message}`);
    }

    // Test permissions API endpoint
    try {
      const response = await fetch('http://localhost:5000/api/permissions', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`\n📡 Permissions API Response Status: ${response.status}`);
      
      if (response.ok) {
        const permissions = await response.json();
        console.log(`✅ Permissions API working! Found ${permissions.length} permissions`);
        
        const customerPermissions = permissions.filter(perm => 
          perm.key.includes('orders') || 
          perm.key.includes('products') || 
          perm.key.includes('customers') ||
          perm.key.includes('notifications')
        );
        
        console.log(`\n🔑 Customer-relevant permissions: ${customerPermissions.length}`);
        customerPermissions.forEach((perm, index) => {
          console.log(`   ${index + 1}. ${perm.key}: ${perm.description}`);
        });
      } else {
        const errorData = await response.json();
        console.log(`❌ Permissions API failed: ${errorData.message}`);
      }
    } catch (apiError) {
      console.log(`❌ Permissions API call failed: ${apiError.message}`);
    }

    await mongoose.connection.close();
    console.log('\n✅ Roles API endpoint test completed!');

  } catch (error) {
    console.error('❌ Roles API endpoint test failed:', error);
    process.exit(1);
  }
}

testRolesAPIEndpoint();
