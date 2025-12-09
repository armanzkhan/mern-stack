// Fix manager permissions to use new format
const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role');
const Permission = require('./models/Permission');

async function fixManagerPermissions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB - Database: Ressichem');

    console.log('\n🔧 FIXING MANAGER PERMISSIONS:');
    
    // Get the Manager role
    const managerRole = await Role.findOne({ name: 'Manager' });
    if (!managerRole) {
      console.log('❌ Manager role not found');
      return;
    }

    console.log(`✅ Found Manager role: ${managerRole.name}`);
    console.log(`   Current permissions: ${managerRole.permissions?.length || 0}`);

    // Get all the new format permissions
    const newPermissions = [
      'orders.read',
      'orders.create',
      'orders.update',
      'orders.delete',
      'products.read',
      'products.create',
      'products.update',
      'products.delete',
      'customers.read',
      'customers.create',
      'customers.update',
      'customers.delete',
      'users.read',
      'users.create',
      'users.update',
      'users.delete',
      'notifications.read',
      'notifications.create',
      'notifications.update',
      'notifications.delete'
    ];

    const permissionIds = [];
    for (const permKey of newPermissions) {
      const permission = await Permission.findOne({ key: permKey, company_id: 'RESSICHEM' });
      if (permission) {
        permissionIds.push(permission._id);
        console.log(`✅ Added ${permKey} to Manager role`);
      } else {
        console.log(`⚠️ Permission ${permKey} not found`);
      }
    }

    // Update Manager role with new permissions
    managerRole.permissions = permissionIds;
    await managerRole.save();
    console.log(`✅ Updated Manager role with ${permissionIds.length} permissions`);

    // Update all managers to have the Manager role
    const managers = await User.find({ isManager: true });
    console.log(`\n👤 Updating ${managers.length} managers:`);
    
    for (const manager of managers) {
      console.log(`   Updating ${manager.firstName} ${manager.lastName} (${manager.email})`);
      
      // Add Manager role if not already present
      if (!manager.roles.includes(managerRole._id)) {
        manager.roles.push(managerRole._id);
        await manager.save();
        console.log(`     ✅ Added Manager role`);
      } else {
        console.log(`     ✅ Already has Manager role`);
      }
    }

    // Verify the changes
    console.log('\n🔍 VERIFICATION:');
    const updatedManagerRole = await Role.findOne({ name: 'Manager' }).populate('permissions');
    console.log(`   Manager role permissions: ${updatedManagerRole.permissions.length}`);
    
    const testManager = await User.findOne({ email: 'sales@ressichem.com' })
      .populate({
        path: 'roles',
        populate: {
          path: 'permissions'
        }
      });

    if (testManager) {
      console.log(`\n👤 Test Manager (${testManager.email}):`);
      console.log(`   Roles: ${testManager.roles.length}`);
      
      const allPermissions = new Set();
      testManager.roles.forEach(role => {
        if (role.permissions) {
          role.permissions.forEach(perm => {
            allPermissions.add(perm.key);
          });
        }
      });
      
      console.log(`   Total permissions: ${allPermissions.size}`);
      console.log(`   Has orders.read: ${allPermissions.has('orders.read')}`);
      console.log(`   Has orders.create: ${allPermissions.has('orders.create')}`);
    }

    await mongoose.connection.close();
    console.log('\n✅ Manager permissions fixed!');

  } catch (error) {
    console.error('❌ Failed to fix manager permissions:', error);
    process.exit(1);
  }
}

fixManagerPermissions();
