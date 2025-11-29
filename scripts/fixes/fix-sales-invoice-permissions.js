const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Role = require('./models/Role');
const Permission = require('./models/Permission');

async function fixSalesInvoicePermissions() {
  try {
    console.log('🔧 FIXING SALES INVOICE PERMISSIONS');
    console.log('==================================\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.CONNECTION_STRING || 'mongodb://localhost:27017/Ressichem', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'Ressichem'
    });
    console.log('✅ Connected to MongoDB');

    // Find sales user
    const salesUser = await User.findOne({ email: 'sales@ressichem.com' });
    if (!salesUser) {
      console.log('❌ Sales user not found');
      return;
    }

    console.log(`👤 Sales User: ${salesUser.email}`);

    // Get or create invoice permissions
    const invoicePermissions = [
      'invoices.create',
      'invoices.read', 
      'invoices.update',
      'invoices.delete',
      'invoices.manage'
    ];

    const permissionIds = [];
    for (const permKey of invoicePermissions) {
      let permission = await Permission.findOne({ key: permKey });
      if (!permission) {
        permission = new Permission({
          key: permKey,
          name: `Invoice ${permKey.split('.')[1].charAt(0).toUpperCase() + permKey.split('.')[1].slice(1)}`,
          description: `Permission to ${permKey.split('.')[1]} invoices`,
          company_id: 'RESSICHEM',
          isActive: true
        });
        await permission.save();
        console.log(`✅ Created permission: ${permKey}`);
      } else {
        console.log(`✅ Found existing permission: ${permKey}`);
      }
      permissionIds.push(permission._id);
    }

    // Add invoice permissions to Sales Manager role
    const salesManagerRole = await Role.findOne({ name: 'Sales Manager' });
    if (salesManagerRole) {
      const existingPermissions = salesManagerRole.permissions || [];
      const newPermissions = [...new Set([...existingPermissions, ...permissionIds])];
      salesManagerRole.permissions = newPermissions;
      await salesManagerRole.save();
      console.log('✅ Updated Sales Manager role with invoice permissions');
    } else {
      console.log('❌ Sales Manager role not found');
    }

    // Add invoice permissions to Manager role
    const managerRole = await Role.findOne({ name: 'Manager' });
    if (managerRole) {
      const existingPermissions = managerRole.permissions || [];
      const newPermissions = [...new Set([...existingPermissions, ...permissionIds])];
      managerRole.permissions = newPermissions;
      await managerRole.save();
      console.log('✅ Updated Manager role with invoice permissions');
    } else {
      console.log('❌ Manager role not found');
    }

    // Verify the fix
    console.log('\n🔍 VERIFICATION:');
    const updatedSalesUser = await User.findOne({ email: 'sales@ressichem.com' }).populate('roles');
    console.log(`👤 Updated Sales User: ${updatedSalesUser.email}`);
    
    if (updatedSalesUser.roles && updatedSalesUser.roles.length > 0) {
      for (const role of updatedSalesUser.roles) {
        const roleWithPerms = await Role.findById(role._id).populate('permissions');
        const invoicePerms = roleWithPerms.permissions.filter(p => p.key.includes('invoice'));
        console.log(`   Role: ${roleWithPerms.name} - Invoice permissions: ${invoicePerms.length}`);
        invoicePerms.forEach(perm => {
          console.log(`     - ${perm.key}: ${perm.name || 'No name'}`);
        });
      }
    }

    // Test specific permissions
    const testPermissions = ['invoices.create', 'invoices.read', 'invoices.manage'];
    console.log('\n🧪 Testing specific permissions:');
    for (const permKey of testPermissions) {
      const hasPermission = await checkPermission(updatedSalesUser, permKey);
      console.log(`   ${permKey}: ${hasPermission ? '✅' : '❌'}`);
    }

  } catch (error) {
    console.error('❌ Error fixing sales invoice permissions:', error);
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

// Run the fix
fixSalesInvoicePermissions();
