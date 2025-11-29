// Update Customer role with all necessary permissions
const mongoose = require('mongoose');
const Role = require('./models/Role');
const Permission = require('./models/Permission');

async function updateCustomerRole() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB - Database: Ressichem');

    // Find Customer role
    const customerRole = await Role.findOne({ name: 'Customer' });
    if (!customerRole) {
      console.log('❌ Customer role not found');
      return;
    }

    // Get all customer permissions
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
        console.log(`✅ Found ${permKey} permission`);
      } else {
        console.log(`⚠️ Permission ${permKey} not found`);
      }
    }

    // Update Customer role with all permissions
    customerRole.permissions = permissionIds;
    await customerRole.save();
    console.log(`✅ Updated Customer role with ${permissionIds.length} permissions`);

    await mongoose.connection.close();
    console.log('\n✅ Customer role updated successfully!');

  } catch (error) {
    console.error('❌ Failed to update role:', error);
    process.exit(1);
  }
}

updateCustomerRole();
