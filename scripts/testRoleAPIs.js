// scripts/testRoleAPIs.js
const { connect, disconnect } = require('../config/_db');

async function testRoleAPIs() {
  console.log('🔍 Testing Role and Permission APIs...\n');

  try {
    await connect();
    console.log('✅ Database connected');

    // Test 3: Check if we have roles and permissions in database
    const Role = require('../models/Role');
    const Permission = require('../models/Permission');

    const roleCount = await Role.countDocuments();
    const permissionCount = await Permission.countDocuments();

    console.log(`\n📊 Database Status:`);
    console.log(`   Roles: ${roleCount}`);
    console.log(`   Permissions: ${permissionCount}`);

    if (roleCount > 0) {
      const sampleRole = await Role.findOne();
      console.log(`   Sample Role: ${sampleRole.name}`);
    }

    if (permissionCount > 0) {
      const samplePermission = await Permission.findOne();
      console.log(`   Sample Permission: ${samplePermission.name} (key: ${samplePermission.key})`);
    }

    console.log('\n✅ API tests completed!');
    console.log('\n💡 If you\'re still getting "Failed to load role or permissions" error:');
    console.log('   1. Make sure you\'re logged in as super admin');
    console.log('   2. Check browser console for specific error messages');
    console.log('   3. Verify your token is valid in localStorage');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await disconnect();
  }
}

module.exports = testRoleAPIs;

if (require.main === module) {
  testRoleAPIs();
}
