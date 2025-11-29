const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Role = require('./models/Role');
const Permission = require('./models/Permission');

async function fixCompanyAdminNotifications() {
  try {
    console.log('🔧 FIXING COMPANY ADMIN NOTIFICATIONS PERMISSIONS');
    console.log('================================================\n');

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

    // Create or find the admin.notifications permission
    let adminNotificationsPermission = await Permission.findOne({ 
      key: 'admin.notifications',
      company_id: 'RESSICHEM'
    });

    if (!adminNotificationsPermission) {
      console.log('📝 Creating admin.notifications permission...');
      adminNotificationsPermission = new Permission({
        key: 'admin.notifications',
        name: 'Admin Notifications',
        description: 'Access to admin notification settings',
        category: 'admin',
        company_id: 'RESSICHEM',
        isActive: true
      });
      await adminNotificationsPermission.save();
      console.log('✅ Created admin.notifications permission');
    } else {
      console.log('✅ admin.notifications permission already exists');
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
        permissions: [adminNotificationsPermission._id],
        isActive: true
      });
      await companyAdminRole.save();
      console.log('✅ Created Company Admin role');
    } else {
      // Add the permission to existing role if not already present
      if (!companyAdminRole.permissions.includes(adminNotificationsPermission._id)) {
        companyAdminRole.permissions.push(adminNotificationsPermission._id);
        await companyAdminRole.save();
        console.log('✅ Added admin.notifications permission to Company Admin role');
      } else {
        console.log('✅ Company Admin role already has admin.notifications permission');
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
    console.log(`🔑 Role permissions: ${roleWithPermissions.permissions.map(perm => perm.key).join(', ')}`);

    console.log('\n✅ Company admin should now have access to admin notifications page');

  } catch (error) {
    console.error('❌ Error fixing company admin notifications:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the fix
fixCompanyAdminNotifications();
