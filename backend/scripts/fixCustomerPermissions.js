const { connect, disconnect } = require('../config/_db');
const User = require('../models/User');
const Permission = require('../models/Permission');

async function fixCustomerPermissions() {
  console.log('🔍 Fixing Customer Permissions...\n');
  
  try {
    await connect();
    console.log('✅ Connected to MongoDB');

    // Find the test user
    const testUser = await User.findOne({ email: 'flowtest@example.com' })
      .populate('permissions')
      .lean();

    if (!testUser) {
      console.log('❌ Test user not found');
      return;
    }

    console.log(`👤 User: ${testUser.email}`);
    console.log(`   Current permissions: ${testUser.permissions?.map(p => p.key).join(', ') || 'None'}`);

    // Create or find customer permissions
    const customerViewPermission = await Permission.findOneAndUpdate(
      { key: 'customer.view' },
      { 
        key: 'customer.view',
        description: 'View customers',
        company_id: 'RESSICHEM'
      },
      { upsert: true, new: true }
    );

    const customerCreatePermission = await Permission.findOneAndUpdate(
      { key: 'customer.create' },
      { 
        key: 'customer.create',
        description: 'Create customers',
        company_id: 'RESSICHEM'
      },
      { upsert: true, new: true }
    );

    console.log(`✅ Created/found permissions:`);
    console.log(`   - ${customerViewPermission.key}`);
    console.log(`   - ${customerCreatePermission.key}`);

    // Add permissions to user
    const currentPermissionIds = testUser.permissions?.map(p => p._id) || [];
    const newPermissionIds = [
      ...currentPermissionIds,
      customerViewPermission._id,
      customerCreatePermission._id
    ];

    // Remove duplicates
    const uniquePermissionIds = [...new Set(newPermissionIds)];

    await User.findByIdAndUpdate(testUser._id, {
      permissions: uniquePermissionIds
    });

    console.log(`✅ Added customer permissions to user`);

    // Verify the update
    const updatedUser = await User.findById(testUser._id)
      .populate('permissions')
      .lean();

    console.log(`\n📋 Updated user permissions:`);
    updatedUser.permissions.forEach(perm => {
      console.log(`   - ${perm.key}: ${perm.description}`);
    });

    console.log('\n🎉 SUCCESS: User now has customer permissions!');
    console.log('   The orders create page should now show real customers.');

  } catch (error) {
    console.error('❌ Error fixing customer permissions:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  fixCustomerPermissions();
}

module.exports = fixCustomerPermissions;
