require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { connect, disconnect } = require('../config/_db');
const User = require('../models/User');
const Manager = require('../models/Manager');
const { checkAllManagersCategorySync } = require('./check-all-managers-category-sync');

async function fixAllManagersCategorySync() {
  let connectionEstablished = false;
  try {
    if (require('mongoose').connection.readyState !== 1) {
      await connect();
      connectionEstablished = true;
    }
    console.log('✅ Connected to MongoDB\n');

    // First check all managers (skip connection since we already have one)
    console.log('🔍 Checking all managers...\n');
    const checkResult = await checkAllManagersCategorySync(true);

    if (checkResult.needsSync === 0) {
      console.log('\n✅ All managers are already synced!');
      await disconnect();
      return;
    }

    console.log(`\n🔧 Fixing ${checkResult.needsSync} manager(s)...\n`);
    console.log('='.repeat(80));

    let fixed = 0;
    let failed = 0;

    for (const issue of checkResult.issues) {
      try {
        const managerUser = await User.findOne({ 
          email: issue.email,
          user_id: issue.user_id 
        });

        if (!managerUser) {
          console.log(`❌ User not found: ${issue.email}`);
          failed++;
          continue;
        }

        const managerRecord = await Manager.findById(issue.managerRecordId);
        if (!managerRecord) {
          console.log(`❌ Manager record not found for: ${issue.email}`);
          failed++;
          continue;
        }

        // Get categories from Manager record
        const managerCategories = managerRecord.assignedCategories?.map(c => 
          typeof c === 'string' ? c : (c.category || c)
        ) || [];

        // Ensure managerProfile exists
        if (!managerUser.managerProfile) {
          managerUser.managerProfile = {};
        }

        // Sync categories
        managerUser.managerProfile.assignedCategories = managerCategories;

        // Sync notification preferences if they exist
        if (managerRecord.notificationPreferences) {
          if (!managerUser.managerProfile.notificationPreferences) {
            managerUser.managerProfile.notificationPreferences = {};
          }
          Object.assign(managerUser.managerProfile.notificationPreferences, managerRecord.notificationPreferences);
        }

        await managerUser.save();

        console.log(`✅ Fixed: ${issue.email}`);
        console.log(`   Synced categories: ${managerCategories.join(', ')}`);
        fixed++;

      } catch (error) {
        console.error(`❌ Failed to fix ${issue.email}:`, error.message);
        failed++;
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n📊 FIX SUMMARY:\n');
    console.log(`✅ Fixed: ${fixed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📋 Total checked: ${checkResult.total}`);

    if (connectionEstablished) {
      await disconnect();
    }
    console.log('\n✅ Fix complete');
  } catch (error) {
    console.error('❌ Error:', error);
    if (connectionEstablished) {
      await disconnect();
    }
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  fixAllManagersCategorySync()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { fixAllManagersCategorySync };

