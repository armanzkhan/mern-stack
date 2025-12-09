const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Role = require('./models/Role');
const Permission = require('./models/Permission');

async function checkManagerPermissions() {
  try {
    console.log('🔍 CHECKING MANAGER PERMISSIONS');
    console.log('================================\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.CONNECTION_STRING || 'mongodb://localhost:27017/Ressichem', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'Ressichem'
    });
    console.log('✅ Connected to MongoDB');

    // Find manager users
    const managers = await User.find({ 
      $or: [
        { isManager: true },
        { roles: { $exists: true, $ne: [] } }
      ]
    });

    console.log(`👥 Found ${managers.length} manager users:`);

    for (const manager of managers) {
      console.log(`\n👤 Manager: ${manager.email}`);
      console.log(`   Name: ${manager.firstName} ${manager.lastName}`);
      console.log(`   Is Manager: ${manager.isManager}`);
      console.log(`   Roles: ${manager.roles}`);

      // Get role details
      if (manager.roles && manager.roles.length > 0) {
        const roles = await Role.find({ _id: { $in: manager.roles } });
        console.log(`   Role Details:`);
        for (const role of roles) {
          console.log(`     - ${role.name} (${role._id})`);
          console.log(`       Permissions: ${role.permissions?.length || 0} permissions`);
          
          if (role.permissions && role.permissions.length > 0) {
            const permissions = await Permission.find({ _id: { $in: role.permissions } });
            console.log(`       Permission Details:`);
            for (const perm of permissions) {
              console.log(`         - ${perm.name} (${perm.key})`);
            }
          }
        }
      }

      // Check specific permissions
      const hasOrdersUpdate = await checkPermission(manager, 'orders.update');
      const hasOrdersRead = await checkPermission(manager, 'orders.read');
      const hasOrdersCreate = await checkPermission(manager, 'orders.create');
      
      console.log(`   Has orders.update: ${hasOrdersUpdate ? '✅' : '❌'}`);
      console.log(`   Has orders.read: ${hasOrdersRead ? '✅' : '❌'}`);
      console.log(`   Has orders.create: ${hasOrdersCreate ? '✅' : '❌'}`);
    }

    // Check if orders.update permission exists
    const ordersUpdatePermission = await Permission.findOne({ key: 'orders.update' });
    console.log(`\n🔍 orders.update permission exists: ${ordersUpdatePermission ? '✅' : '❌'}`);
    if (ordersUpdatePermission) {
      console.log(`   Permission ID: ${ordersUpdatePermission._id}`);
      console.log(`   Permission Name: ${ordersUpdatePermission.name}`);
    }

  } catch (error) {
    console.error('❌ Error checking manager permissions:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

async function checkPermission(user, permissionKey) {
  try {
    if (!user.roles || user.roles.length === 0) return false;
    
    const roles = await Role.find({ _id: { $in: user.roles } });
    for (const role of roles) {
      if (role.permissions && role.permissions.length > 0) {
        const permissions = await Permission.find({ _id: { $in: role.permissions } });
        const hasPermission = permissions.some(p => p.key === permissionKey);
        if (hasPermission) return true;
      }
    }
    return false;
  } catch (error) {
    console.error(`Error checking permission ${permissionKey}:`, error);
    return false;
  }
}

// Run the check
checkManagerPermissions();