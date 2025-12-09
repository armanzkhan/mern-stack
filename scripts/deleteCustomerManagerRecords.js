/**
 * Script to delete Manager records that belong to customers
 * 
 * This script finds and deletes Manager records where:
 * - user_id starts with "customer_"
 * - OR the corresponding User has isCustomer: true
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Manager = require('../models/Manager');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.CONNECTION_STRING || 
  "mongodb+srv://armanzaman4_db_user:1JJORz7jP2VFgTaP@cluster0.qn1babq.mongodb.net/Ressichem?retryWrites=true&w=majority";

async function deleteCustomerManagerRecords() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "Ressichem"
    });
    console.log('✅ Connected to MongoDB\n');

    const companyId = "RESSICHEM";

    console.log('🔍 FINDING CUSTOMER MANAGER RECORDS');
    console.log('====================================\n');

    // Find all Manager records
    const allManagers = await Manager.find({ company_id: companyId });
    console.log(`📊 Found ${allManagers.length} total Manager records\n`);

    const toDelete = [];
    const toKeep = [];

    for (const manager of allManagers) {
      // Check 1: user_id starts with "customer_"
      if (manager.user_id && manager.user_id.startsWith('customer_')) {
        toDelete.push({
          manager,
          reason: 'user_id starts with "customer_"',
          user_id: manager.user_id
        });
        continue;
      }

      // Check 2: Corresponding User has isCustomer: true
      const user = await User.findOne({ 
        user_id: manager.user_id, 
        company_id: companyId 
      });

      if (user && (user.isCustomer === true || user.customerProfile?.customer_id)) {
        toDelete.push({
          manager,
          reason: 'User is a customer',
          user_id: manager.user_id,
          email: user.email
        });
        continue;
      }

      toKeep.push({
        manager,
        user_id: manager.user_id,
        email: user?.email || 'No email'
      });
    }

    console.log(`📊 Analysis:`);
    console.log(`   ✅ To Keep: ${toKeep.length} managers`);
    console.log(`   ❌ To Delete: ${toDelete.length} managers\n`);

    if (toDelete.length > 0) {
      console.log(`🗑️ MANAGERS TO DELETE:`);
      toDelete.forEach((item, index) => {
        console.log(`   ${index + 1}. Manager ID: ${item.manager._id}`);
        console.log(`      User ID: ${item.user_id}`);
        console.log(`      Email: ${item.email || 'N/A'}`);
        console.log(`      Reason: ${item.reason}`);
        console.log('');
      });

      // Ask for confirmation (in production, you might want to add a flag)
      console.log('⚠️ About to delete these Manager records...\n');

      let deletedCount = 0;
      for (const item of toDelete) {
        try {
          await Manager.findByIdAndDelete(item.manager._id);
          console.log(`✅ Deleted Manager record: ${item.manager._id} (${item.user_id})`);
          deletedCount++;
        } catch (error) {
          console.error(`❌ Error deleting ${item.manager._id}:`, error.message);
        }
      }

      console.log(`\n✅ Deleted ${deletedCount} Manager records`);
    } else {
      console.log('✅ No customer Manager records found to delete');
    }

    console.log(`\n✅ Script completed successfully!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  deleteCustomerManagerRecords()
    .then(() => {
      console.log('\n✅ All done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = deleteCustomerManagerRecords;

