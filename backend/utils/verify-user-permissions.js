// Verify user permissions are working
const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role');
const Permission = require('./models/Permission');

async function verifyUserPermissions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB - Database: Ressichem');

    // Find the user with populated roles and permissions
    const user = await User.findOne({ email: 'yousuf@gmail.com' })
      .populate({
        path: 'roles',
        populate: {
          path: 'permissions',
          model: 'Permission'
        }
      });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`\n👤 User: ${user.firstName} ${user.lastName} (${user.email})`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Is Customer: ${user.isCustomer}`);
    console.log(`   Is Active: ${user.isActive}`);

    if (user.roles && user.roles.length > 0) {
      console.log(`\n🔑 User Roles: ${user.roles.length}`);
      for (const role of user.roles) {
        console.log(`   - ${role.name}: ${role.description}`);
        console.log(`   - Permissions: ${role.permissions.length}`);
        
        for (const permission of role.permissions) {
          console.log(`     * ${permission.key}: ${permission.description}`);
        }
      }
    }

    // Check if user has orders.read permission
    const hasOrdersRead = user.roles.some(role => 
      role.permissions.some(perm => perm.key === 'orders.read')
    );

    console.log(`\n✅ Has orders.read permission: ${hasOrdersRead}`);

    await mongoose.connection.close();
    console.log('\n✅ Permission verification completed!');

  } catch (error) {
    console.error('❌ Permission verification failed:', error);
    process.exit(1);
  }
}

verifyUserPermissions();
