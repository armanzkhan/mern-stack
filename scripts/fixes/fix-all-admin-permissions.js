const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Role = require('./models/Role');
const Permission = require('./models/Permission');

async function fixAllAdminPermissions() {
  try {
    console.log('🔧 FIXING ALL ADMIN PERMISSIONS');
    console.log('================================\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.CONNECTION_STRING || 'mongodb://localhost:27017/Ressichem', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'Ressichem'
    });
    console.log('✅ Connected to MongoDB');

    // Find the company admin user
    const companyAdmin = await User.findOne({ email: 'companyadmin@samplecompany.com' });
    if (!companyAdmin) {
      console.log('❌ Company admin user not found');
      return;
    }
    console.log(`👤 Found company admin: ${companyAdmin.firstName} ${companyAdmin.lastName}`);

    // Define all admin permissions
    const adminPermissions = [
      {
        key: 'admin.notifications',
        name: 'Admin Notifications',
        description: 'Access to admin notification settings'
      },
      {
        key: 'admin.system_logs',
        name: 'Admin System Logs',
        description: 'Access to system logs and activity'
      },
      {
        key: 'admin.dashboard',
        name: 'Admin Dashboard',
        description: 'Access to admin dashboard'
      },
      {
        key: 'admin.settings',
        name: 'Admin Settings',
        description: 'Access to admin settings'
      }
    ];

    const createdPermissions = [];

    // Create or find all admin permissions
    for (const permData of adminPermissions) {
      let permission = await Permission.findOne({ 
        key: permData.key,
        company_id: 'RESSICHEM'
      });

      if (!permission) {
        console.log(`📝 Creating ${permData.key} permission...`);
        permission = new Permission({
          key: permData.key,
          name: permData.name,
          description: permData.description,
          category: 'admin',
          company_id: 'RESSICHEM',
          isActive: true
        });
        await permission.save();
        console.log(`✅ Created ${permData.key} permission`);
      } else {
        console.log(`✅ ${permData.key} permission already exists`);
      }
      createdPermissions.push(permission._id);
    }

    // Find or create Company Admin role
    let companyAdminRole = await Role.findOne({ 
      name: 'Company Admin',
      company_id: 'RESSICHEM'
    });

    if (!companyAdminRole) {
      console.log('📝 Creating Company Admin role...');
      companyAdminRole = new Role({
        name: 'Company Admin',
        description: 'Company Administrator with full access',
        company_id: 'RESSICHEM',
        permissions: createdPermissions,
        isActive: true
      });
      await companyAdminRole.save();
      console.log('✅ Created Company Admin role');
    } else {
      // Add missing permissions to existing role
      let updated = false;
      for (const permId of createdPermissions) {
        if (!companyAdminRole.permissions.includes(permId)) {
          companyAdminRole.permissions.push(permId);
          updated = true;
        }
      }
      if (updated) {
        await companyAdminRole.save();
        console.log('✅ Added missing admin permissions to Company Admin role');
      } else {
        console.log('✅ Company Admin role already has all admin permissions');
      }
    }

    // Update the user to have the Company Admin role
    if (!companyAdmin.roles.includes(companyAdminRole._id)) {
      companyAdmin.roles.push(companyAdminRole._id);
      await companyAdmin.save();
      console.log('✅ Added Company Admin role to user');
    } else {
      console.log('✅ User already has Company Admin role');
    }

    // Verify the setup
    console.log('\n🔍 VERIFICATION:');
    console.log('================');
    
    const updatedUser = await User.findById(companyAdmin._id).populate('roles');
    console.log(`👤 User: ${updatedUser.email}`);
    console.log(`📋 Roles: ${updatedUser.roles.map(role => role.name).join(', ')}`);
    
    const roleWithPermissions = await Role.findById(companyAdminRole._id).populate('permissions');
    const adminPerms = roleWithPermissions.permissions.filter(perm => perm.key.startsWith('admin.'));
    console.log(`🔑 Admin permissions: ${adminPerms.map(perm => perm.key).join(', ')}`);

    console.log('\n✅ Company admin should now have access to all admin pages');

  } catch (error) {
    console.error('❌ Error fixing admin permissions:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the fix
fixAllAdminPermissions();
