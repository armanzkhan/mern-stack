// Fix permissions for customer users (corrected version)
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
    let ordersReadPermission = await Permission.findOne({ key: 'orders.read', company_id: 'RESSICHEM' });
    if (!ordersReadPermission) {
      ordersReadPermission = new Permission({
        key: 'orders.read',
        description: 'Read orders',
        company_id: 'RESSICHEM'
      });
      await ordersReadPermission.save();
      console.log('✅ Created orders.read permission');
    } else {
      console.log('✅ orders.read permission already exists');
    }

    // 2. Create other missing order permissions
    const orderPermissions = [
      { key: 'orders.create', description: 'Create orders' },
      { key: 'orders.update', description: 'Update orders' },
      { key: 'orders.delete', description: 'Delete orders' }
    ];

    for (const permData of orderPermissions) {
      let permission = await Permission.findOne({ key: permData.key, company_id: 'RESSICHEM' });
      if (!permission) {
        permission = new Permission({
          ...permData,
          company_id: 'RESSICHEM'
        });
        await permission.save();
        console.log(`✅ Created ${permData.key} permission`);
      }
    }

    // 3. Find or create Customer role
    let customerRole = await Role.findOne({ name: 'Customer' });
    if (!customerRole) {
      customerRole = new Role({
        name: 'Customer',
        description: 'Customer role with access to products, orders, and profile management',
        permissions: [],
        company_id: 'RESSICHEM'
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
    for (const permKey of customerPermissions) {
      const permission = await Permission.findOne({ key: permKey, company_id: 'RESSICHEM' });
      if (permission) {
        permissionIds.push(permission._id);
        console.log(`✅ Added ${permKey} to Customer role`);
      } else {
        console.log(`⚠️ Permission ${permKey} not found`);
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
