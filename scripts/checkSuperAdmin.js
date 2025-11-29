// scripts/checkSuperAdmin.js
const { connect, disconnect } = require('../config/_db');
const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');

async function checkSuperAdmin() {
  await connect();

  try {
    console.log('🔍 Checking Super Admin setup...\n');

    // Check if super admin user exists
    const superAdmin = await User.findOne({ 
      $or: [
        { user_id: "super_admin_001" },
        { email: "superadmin@ressichem.com" },
        { isSuperAdmin: true }
      ]
    }).populate('roles');

    if (!superAdmin) {
      console.log('❌ No super admin user found!');
      console.log('Run: node scripts/seedSuperAdmin.js');
      return;
    }

    console.log('✅ Super Admin User Found:');
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   User ID: ${superAdmin.user_id}`);
    console.log(`   isSuperAdmin flag: ${superAdmin.isSuperAdmin}`);
    console.log(`   Roles: ${superAdmin.roles.map(r => r.name).join(', ')}`);

    // Check Super Admin role
    const superRole = await Role.findOne({ name: 'Super Admin' });
    if (superRole) {
      console.log('\n✅ Super Admin Role Found:');
      console.log(`   Role ID: ${superRole._id}`);
      console.log(`   Permission Groups: ${superRole.permissionGroups.length}`);
    } else {
      console.log('\n❌ Super Admin role not found!');
      console.log('Run: node scripts/seedInitialData.js');
    }

    // Check permissions
    const permissions = await Permission.find({});
    console.log(`\n✅ Total Permissions in Database: ${permissions.length}`);
    console.log('   Sample permissions:', permissions.slice(0, 5).map(p => p.key).join(', '));

    // Test super admin detection logic
    const isSuperAdmin = superAdmin.isSuperAdmin === true || 
                        superAdmin.user_id === "super_admin_001" ||
                        superAdmin.email === "superadmin@ressichem.com" ||
                        superAdmin.roles.some(r => r.name === "Super Admin");

    console.log(`\n✅ Super Admin Detection Test: ${isSuperAdmin ? 'PASS' : 'FAIL'}`);

  } catch (err) {
    console.error('❌ Error checking super admin:', err);
  } finally {
    await disconnect();
  }
}

module.exports = checkSuperAdmin;

if (require.main === module) {
  checkSuperAdmin();
}
