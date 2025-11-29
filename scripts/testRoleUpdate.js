// scripts/testRoleUpdate.js
const { connect, disconnect } = require('../config/_db');
const Role = require('../models/Role');

async function testRoleUpdate() {
  console.log('🔍 Testing Role Update...\n');

  try {
    await connect();
    console.log('✅ Database connected');

    // Get a sample role
    const sampleRole = await Role.findOne();
    if (!sampleRole) {
      console.log('❌ No roles found in database');
      return;
    }

    console.log(`📝 Testing with role: ${sampleRole.name} (${sampleRole._id})`);
    console.log(`   Current description: ${sampleRole.description || 'No description'}`);

    // Test update
    const testDescription = `Updated at ${new Date().toISOString()}`;
    const updatedRole = await Role.findByIdAndUpdate(
      sampleRole._id,
      { description: testDescription },
      { new: true }
    );

    if (updatedRole) {
      console.log('✅ Role update successful!');
      console.log(`   New description: ${updatedRole.description}`);
    } else {
      console.log('❌ Role update failed');
    }

    // Verify the update
    const verifyRole = await Role.findById(sampleRole._id);
    console.log(`🔍 Verification - Current description: ${verifyRole.description}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await disconnect();
  }
}

module.exports = testRoleUpdate;

if (require.main === module) {
  testRoleUpdate();
}
