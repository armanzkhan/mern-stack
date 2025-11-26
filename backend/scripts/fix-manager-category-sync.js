require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { connect, disconnect } = require('../config/_db');
const User = require('../models/User');
const Manager = require('../models/Manager');

const MANAGER_EMAIL = 'amin.irfan@ressichem.com';

async function fixManagerCategorySync() {
  try {
    await connect();
    console.log('✅ Connected to MongoDB\n');

    // Find the manager user
    const managerUser = await User.findOne({ email: MANAGER_EMAIL });
    if (!managerUser) {
      console.log(`❌ Manager user not found: ${MANAGER_EMAIL}`);
      await disconnect();
      return;
    }

    console.log(`✅ Found manager user: ${managerUser.email}`);
    console.log(`   User ID: ${managerUser._id}`);
    console.log(`   User ID (string): ${managerUser.user_id}`);

    // Find the Manager record
    const managerRecord = await Manager.findOne({ user_id: managerUser.user_id });
    if (!managerRecord) {
      console.log(`❌ Manager record not found for user_id: ${managerUser.user_id}`);
      await disconnect();
      return;
    }

    console.log(`✅ Found manager record: ${managerRecord._id}`);
    
    // Get categories from Manager record
    const managerCategories = managerRecord.assignedCategories?.map(c => 
      typeof c === 'string' ? c : (c.category || c)
    ) || [];

    console.log(`\n📋 Categories in Manager record: ${managerCategories.join(', ')}`);

    // Get current categories in User.managerProfile
    const currentUserCategories = managerUser.managerProfile?.assignedCategories?.map(c =>
      typeof c === 'string' ? c : (c.category || c)
    ) || [];

    console.log(`📋 Current categories in User.managerProfile: ${currentUserCategories.join(', ') || 'None'}`);

    // Sync categories from Manager record to User.managerProfile
    if (!managerUser.managerProfile) {
      managerUser.managerProfile = {};
    }

    // Update assignedCategories
    managerUser.managerProfile.assignedCategories = managerCategories;
    
    // Also sync notification preferences if they exist in Manager record
    if (managerRecord.notificationPreferences) {
      if (!managerUser.managerProfile.notificationPreferences) {
        managerUser.managerProfile.notificationPreferences = {};
      }
      Object.assign(managerUser.managerProfile.notificationPreferences, managerRecord.notificationPreferences);
    }

    await managerUser.save();
    console.log(`\n✅ Synced categories to User.managerProfile:`);
    console.log(`   ${managerCategories.join(', ')}`);

    // Verify the sync
    const updatedUser = await User.findById(managerUser._id);
    const syncedCategories = updatedUser.managerProfile?.assignedCategories?.map(c =>
      typeof c === 'string' ? c : (c.category || c)
    ) || [];
    
    console.log(`\n✅ Verification - Categories in User.managerProfile: ${syncedCategories.join(', ')}`);

    await disconnect();
    console.log('\n✅ Fix complete');
  } catch (error) {
    console.error('❌ Error:', error);
    await disconnect();
    process.exit(1);
  }
}

fixManagerCategorySync();

