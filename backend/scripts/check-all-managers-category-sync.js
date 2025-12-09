require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { connect, disconnect } = require('../config/_db');
const User = require('../models/User');
const Manager = require('../models/Manager');

async function checkAllManagersCategorySync(skipConnection = false) {
  let connectionEstablished = false;
  try {
    if (!skipConnection && require('mongoose').connection.readyState !== 1) {
      await connect();
      connectionEstablished = true;
    }
    if (!skipConnection) {
      console.log('✅ Connected to MongoDB\n');
    }

    // Get all managers
    const managers = await User.find({
      isManager: true,
      isActive: true
    });

    console.log(`📊 Found ${managers.length} active managers\n`);
    console.log('='.repeat(80));

    const issues = [];
    const synced = [];
    const noCategories = [];

    for (const managerUser of managers) {
      const managerRecord = await Manager.findOne({ 
        user_id: managerUser.user_id,
        company_id: managerUser.company_id 
      });

      if (!managerRecord) {
        console.log(`⚠️ Manager record not found for: ${managerUser.email}`);
        noCategories.push({
          email: managerUser.email,
          reason: 'No Manager record found'
        });
        continue;
      }

      // Get categories from Manager record
      const managerCategories = managerRecord.assignedCategories?.map(c => 
        typeof c === 'string' ? c : (c.category || c)
      ) || [];

      // Get categories from User.managerProfile
      const userCategories = managerUser.managerProfile?.assignedCategories?.map(c =>
        typeof c === 'string' ? c : (c.category || c)
      ) || [];

      // Normalize for comparison
      const normalize = (cat) => {
        if (!cat || typeof cat !== 'string') return '';
        return cat.toLowerCase().trim().replace(/\s*&\s*/g, ' and ').replace(/\s+/g, ' ');
      };

      const managerCategoriesNormalized = managerCategories.map(normalize).sort();
      const userCategoriesNormalized = userCategories.map(normalize).sort();

      const categoriesMatch = JSON.stringify(managerCategoriesNormalized) === JSON.stringify(userCategoriesNormalized);

      if (managerCategories.length === 0) {
        console.log(`⚠️ ${managerUser.email}: No categories assigned in Manager record`);
        noCategories.push({
          email: managerUser.email,
          reason: 'No categories in Manager record'
        });
      } else if (!categoriesMatch) {
        console.log(`❌ ${managerUser.email}: Categories NOT synced`);
        console.log(`   Manager record: ${managerCategories.join(', ')}`);
        console.log(`   User profile: ${userCategories.join(', ') || 'None'}`);
        issues.push({
          email: managerUser.email,
          user_id: managerUser.user_id,
          managerCategories,
          userCategories,
          managerRecordId: managerRecord._id
        });
      } else {
        console.log(`✅ ${managerUser.email}: Categories synced correctly`);
        synced.push(managerUser.email);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n📊 SUMMARY:\n');
    console.log(`✅ Properly synced: ${synced.length}`);
    console.log(`❌ Need sync: ${issues.length}`);
    console.log(`⚠️ No categories: ${noCategories.length}`);

    if (issues.length > 0) {
      console.log('\n❌ MANAGERS NEEDING SYNC:\n');
      issues.forEach((issue, idx) => {
        console.log(`${idx + 1}. ${issue.email}`);
        console.log(`   Manager record categories: ${issue.managerCategories.join(', ')}`);
        console.log(`   User profile categories: ${issue.userCategories.join(', ') || 'None'}`);
      });
    }

    if (noCategories.length > 0) {
      console.log('\n⚠️ MANAGERS WITH NO CATEGORIES:\n');
      noCategories.forEach((item, idx) => {
        console.log(`${idx + 1}. ${item.email} - ${item.reason}`);
      });
    }

    if (connectionEstablished) {
      await disconnect();
    }
    
    return {
      total: managers.length,
      synced: synced.length,
      needsSync: issues.length,
      noCategories: noCategories.length,
      issues,
      noCategoriesList: noCategories
    };
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
  checkAllManagersCategorySync()
    .then(result => {
      console.log('\n✅ Check complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { checkAllManagersCategorySync };

