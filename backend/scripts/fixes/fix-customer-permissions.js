// Fix permissions for customer users
const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role');
const Permission = require('./models/Permission');

async function fixCustomerPermissions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB - Database: Ressichem');

    // 1. Create missing orders.read permission
    let ordersReadPermission = await Permission.findOne({ name: 'orders.read' });
    if (!ordersReadPermission) {
      ordersReadPermission = new Permission({
        name: 'orders.read',
        description: 'Read orders',
        resource: 'orders',
        action: 'read'
      });
      await ordersReadPermission.save();
      console.log('✅ Created orders.read permission');
    } else {
      console.log('✅ orders.read permission already exists');
    }

    // 2. Create other missing order permissions
    const orderPermissions = [
      { name: 'orders.create', description: 'Create orders', resource: 'orders', action: 'create' },
      { name: 'orders.update', description: 'Update orders', resource: 'orders', action: 'update' },
      { name: 'orders.delete', description: 'Delete orders', resource: 'orders', action: 'delete' }
    ];

    for (const permData of orderPermissions) {
      let permission = await Permission.findOne({ name: permData.name });
      if (!permission) {
        permission = new Permission(permData);
        await permission.save();
        console.log(`✅ Created ${permData.name} permission`);
      }
    }

    // 3. Find or create Customer role
    let customerRole = await Role.findOne({ name: 'Customer' });
    if (!customerRole) {
      customerRole = new Role({
        name: 'Customer',
        description: 'Customer role with access to products, orders, and profile management',
        permissions: []
      });
      await customerRole.save();
      console.log('✅ Created Customer role');
    }

    // 4. Add permissions to Customer role
    const customerPermissions = [
      'orders.read',
      'orders.create',
      'orders.update',
      'products.read',
      'customers.read',
      'notifications.read'
    ];

    const permissionIds = [];
    for (const permName of customerPermissions) {
      const permission = await Permission.findOne({ name: permName });
      if (permission) {
        permissionIds.push(permission._id);
        console.log(`✅ Added ${permName} to Customer role`);
      } else {
        console.log(`⚠️ Permission ${permName} not found`);
      }
    }

    customerRole.permissions = permissionIds;
    await customerRole.save();
    console.log('✅ Updated Customer role permissions');

    // 5. Assign Customer role to yousuf@gmail.com
    const user = await User.findOne({ email: 'yousuf@gmail.com' });
    if (user) {
      user.roles = [customerRole._id];
      await user.save();
      console.log('✅ Assigned Customer role to yousuf@gmail.com');
    }

    // 6. Verify the fix
    const updatedUser = await User.findOne({ email: 'yousuf@gmail.com' }).populate('roles');
    console.log('\n🔍 Updated User Permissions:');
    console.log(`   User: ${updatedUser.firstName} ${updatedUser.lastName}`);
    console.log(`   Roles: ${updatedUser.roles.length}`);
    if (updatedUser.roles.length > 0) {
      console.log(`   Role: ${updatedUser.roles[0].name}`);
      console.log(`   Permissions: ${updatedUser.roles[0].permissions.length}`);
    }

    await mongoose.connection.close();
    console.log('\n✅ Customer permissions fixed successfully!');

  } catch (error) {
    console.error('❌ Failed to fix permissions:', error);
    process.exit(1);
  }
}

fixCustomerPermissions();
