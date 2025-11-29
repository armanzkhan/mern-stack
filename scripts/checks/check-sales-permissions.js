const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Role = require('./models/Role');
const Permission = require('./models/Permission');

async function checkSalesPermissions() {
  try {
    console.log('🔍 CHECKING SALES USER PERMISSIONS');
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
    console.log(`   Name: ${salesUser.firstName} ${salesUser.lastName}`);
    console.log(`   Is Super Admin: ${salesUser.isSuperAdmin}`);
    console.log(`   Is Company Admin: ${salesUser.isCompanyAdmin}`);
    console.log(`   Is Manager: ${salesUser.isManager}`);
    console.log(`   Roles: ${salesUser.roles?.length || 0} roles`);

    // Get role details
    if (salesUser.roles && salesUser.roles.length > 0) {
      const roles = await Role.find({ _id: { $in: salesUser.roles } }).populate('permissions');
      console.log(`   Role Details:`);
      for (const role of roles) {
        console.log(`     - ${role.name} (${role._id})`);
        console.log(`       Permissions: ${role.permissions?.length || 0} permissions`);
        
        if (role.permissions && role.permissions.length > 0) {
          const adminPermissions = role.permissions.filter(p => p.key.includes('admin'));
          console.log(`       Admin Permissions: ${adminPermissions.length}`);
          adminPermissions.forEach(perm => {
            console.log(`         - ${perm.key}: ${perm.name || 'No name'}`);
          });
        }
      }
    }

    // Check specific admin permissions
    const hasAdminNotifications = await checkPermission(salesUser, 'admin.notifications');
    const hasAdminSystemLogs = await checkPermission(salesUser, 'admin.system_logs');
    const hasAdminDashboard = await checkPermission(salesUser, 'admin.dashboard');
    const hasAdminSettings = await checkPermission(salesUser, 'admin.settings');
    
    console.log(`   Admin Permissions:`);
    console.log(`     - admin.notifications: ${hasAdminNotifications ? '✅' : '❌'}`);
    console.log(`     - admin.system_logs: ${hasAdminSystemLogs ? '✅' : '❌'}`);
    console.log(`     - admin.dashboard: ${hasAdminDashboard ? '✅' : '❌'}`);
    console.log(`     - admin.settings: ${hasAdminSettings ? '✅' : '❌'}`);

    // Check if admin permissions exist
    const adminPermissions = await Permission.find({ key: { $regex: /^admin\./ } });
    console.log(`\n🔑 Admin Permissions in Database (${adminPermissions.length}):`);
    adminPermissions.forEach(perm => {
      console.log(`   - ${perm.key}: ${perm.name || 'No name'} (${perm._id})`);
    });

  } catch (error) {
    console.error('❌ Error checking sales permissions:', error);
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
checkSalesPermissions();
