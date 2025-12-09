// Debug user permissions in generateToken
const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role');
const Permission = require('./models/Permission');

async function debugUserPermissions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB - Database: Ressichem');

    // Find the user
    const user = await User.findOne({ email: 'yousuf@gmail.com' })
      .populate({
        path: 'roles',
        populate: {
          path: 'permissions'
        }
      })
      .populate('permissions');

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('\n👤 User Details:');
    console.log(`   _id: ${user._id}`);
    console.log(`   user_id: ${user.user_id}`);
    console.log(`   email: ${user.email}`);
    console.log(`   company_id: ${user.company_id}`);
    console.log(`   roles: ${user.roles?.length || 0}`);
    console.log(`   permissions: ${user.permissions?.length || 0}`);

    // Test getUserPermissions function
    console.log('\n🔍 Testing getUserPermissions function:');
    
    // Try with user_id and company_id
    const userByUserId = await User.findOne({ user_id: user.user_id, company_id: user.company_id })
      .populate({
        path: "roles",
        populate: {
          path: "permissions"
        }
      })
      .populate("permissions");

    if (userByUserId) {
      console.log('✅ Found user by user_id and company_id');
      console.log(`   Roles: ${userByUserId.roles?.length || 0}`);
      console.log(`   Permissions: ${userByUserId.permissions?.length || 0}`);
    } else {
      console.log('❌ User not found by user_id and company_id');
    }

    // Get permissions from roles
    const permissions = [];
    if (user.roles && user.roles.length > 0) {
      for (const role of user.roles) {
        console.log(`\n🔑 Role: ${role.name}`);
        console.log(`   Permissions: ${role.permissions?.length || 0}`);
        
        if (role.permissions) {
          for (const permission of role.permissions) {
            permissions.push(permission.key);
            console.log(`     * ${permission.key}: ${permission.description}`);
          }
        }
      }
    }

    console.log(`\n📋 Total permissions: ${permissions.length}`);
    console.log(`   Has orders.read: ${permissions.includes('orders.read')}`);

    await mongoose.connection.close();
    console.log('\n✅ User permissions debug completed!');

  } catch (error) {
    console.error('❌ User permissions debug failed:', error);
    process.exit(1);
  }
}

debugUserPermissions();
