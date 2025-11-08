const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Role = require('./models/Role');
const Permission = require('./models/Permission');

async function fixSuperAdminInvoicePermissions() {
  try {
    console.log('🔧 FIXING SUPER ADMIN INVOICE PERMISSIONS');
    console.log('========================================\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.CONNECTION_STRING || 'mongodb://localhost:27017/Ressichem', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'Ressichem'
    });
    console.log('✅ Connected to MongoDB');

    // Find super admin users
    const superAdmins = await User.find({ isSuperAdmin: true });
    console.log(`👑 Found ${superAdmins.length} super admin users`);

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

    // Create or update Super Admin role
    let superAdminRole = await Role.findOne({ name: 'Super Admin' });
    if (!superAdminRole) {
      superAdminRole = new Role({
        name: 'Super Admin',
        description: 'Super Administrator with all permissions',
        company_id: 'RESSICHEM',
        permissions: permissionIds,
        isActive: true
      });
      await superAdminRole.save();
      console.log('✅ Created Super Admin role');
    } else {
      // Add invoice permissions to existing Super Admin role
      const existingPermissions = superAdminRole.permissions || [];
      const newPermissions = [...new Set([...existingPermissions, ...permissionIds])];
      superAdminRole.permissions = newPermissions;
      await superAdminRole.save();
      console.log('✅ Updated Super Admin role with invoice permissions');
    }

    // Assign Super Admin role to super admin users
    for (const admin of superAdmins) {
      if (!admin.roles || !admin.roles.includes(superAdminRole._id)) {
        admin.roles = admin.roles ? [...admin.roles, superAdminRole._id] : [superAdminRole._id];
        await admin.save();
        console.log(`✅ Assigned Super Admin role to ${admin.email}`);
      } else {
        console.log(`✅ ${admin.email} already has Super Admin role`);
      }
    }

    // Verify the fix
    console.log('\n🔍 VERIFICATION:');
    const updatedSuperAdmins = await User.find({ isSuperAdmin: true }).populate('roles');
    for (const admin of updatedSuperAdmins) {
      console.log(`\n👤 ${admin.email}:`);
      if (admin.roles && admin.roles.length > 0) {
        for (const role of admin.roles) {
          const roleWithPerms = await Role.findById(role._id).populate('permissions');
          const invoicePerms = roleWithPerms.permissions.filter(p => p.key.includes('invoice'));
          console.log(`   Role: ${roleWithPerms.name} - Invoice permissions: ${invoicePerms.length}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error fixing super admin invoice permissions:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the fix
fixSuperAdminInvoicePermissions();
