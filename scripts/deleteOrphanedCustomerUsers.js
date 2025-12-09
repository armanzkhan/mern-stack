/**
 * Script to delete orphaned user records
 * 
 * This script finds and deletes User records that:
 * 1. Have isCustomer: true
 * 2. But their corresponding Customer record no longer exists
 * 
 * This can happen when customers are deleted directly from MongoDB
 * without going through the application's deleteCustomer function.
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Customer = require('../models/Customer');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.CONNECTION_STRING || 
  "mongodb+srv://armanzaman4_db_user:1JJORz7jP2VFgTaP@cluster0.qn1babq.mongodb.net/Ressichem?retryWrites=true&w=majority";

async function deleteOrphanedCustomerUsers() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all users with isCustomer: true
    const customerUsers = await User.find({ isCustomer: true });
    console.log(`📊 Found ${customerUsers.length} users with isCustomer: true\n`);

    let deletedCount = 0;
    let keptCount = 0;
    const deletedUsers = [];

    for (const user of customerUsers) {
      try {
        // Check if corresponding customer exists
        let customerExists = false;

        // Method 1: Check by customerProfile.customer_id
        if (user.customerProfile?.customer_id) {
          const customer = await Customer.findById(user.customerProfile.customer_id);
          if (customer) {
            customerExists = true;
          }
        }

        // Method 2: Check by email (in case customer_id reference is broken)
        if (!customerExists && user.email) {
          const customerByEmail = await Customer.findOne({ 
            email: user.email,
            company_id: user.company_id 
          });
          if (customerByEmail) {
            customerExists = true;
            // Fix the broken reference
            user.customerProfile.customer_id = customerByEmail._id;
            await user.save();
            console.log(`🔧 Fixed broken reference for user: ${user.email}`);
          }
        }

        if (!customerExists) {
          // This is an orphaned user - delete it
          console.log(`❌ Deleting orphaned user: ${user.email} (${user.firstName} ${user.lastName})`);
          console.log(`   User ID: ${user._id}`);
          console.log(`   Company: ${user.company_id}`);
          
          await User.findByIdAndDelete(user._id);
          deletedCount++;
          deletedUsers.push({
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            userId: user._id
          });
        } else {
          keptCount++;
          console.log(`✅ Keeping user: ${user.email} (customer exists)`);
        }
      } catch (error) {
        console.error(`⚠️ Error processing user ${user.email}:`, error.message);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Kept: ${keptCount} users (customer exists)`);
    console.log(`   ❌ Deleted: ${deletedCount} orphaned users`);
    
    if (deletedUsers.length > 0) {
      console.log('\n🗑️ Deleted Users:');
      deletedUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email})`);
      });
    }

    console.log('\n✅ Script completed successfully!');
    
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
  deleteOrphanedCustomerUsers()
    .then(() => {
      console.log('\n✅ All done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = deleteOrphanedCustomerUsers;

