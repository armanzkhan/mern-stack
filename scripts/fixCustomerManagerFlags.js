const mongoose = require('mongoose');
const User = require('../models/User');
const Manager = require('../models/Manager');

const MONGODB_URI = process.env.MONGODB_URI || process.env.CONNECTION_STRING || "mongodb+srv://armanzaman4_db_user:1JJORz7jP2VFgTaP@cluster0.qn1babq.mongodb.net/Ressichem?retryWrites=true&w=majority";

async function fixCustomerManagerFlags() {
  try {
    await mongoose.connect(MONGODB_URI, { dbName: 'Ressichem' });
    console.log('✅ Connected to MongoDB\n');

    // Find all users with user_id starting with "customer_"
    const customerUsers = await User.find({
      user_id: { $regex: /^customer_/ }
    });

    console.log(`📋 Found ${customerUsers.length} users with customer_ user_id:\n`);

    for (const user of customerUsers) {
      console.log(`\n🔧 Fixing: ${user.email}`);
      console.log(`  - Current: isCustomer=${user.isCustomer}, isManager=${user.isManager}`);
      
      // Fix the flags
      user.isCustomer = true;
      user.isManager = false;
      
      // Remove managerProfile if it exists
      if (user.managerProfile) {
        console.log(`  - Removing managerProfile`);
        user.managerProfile = undefined;
      }
      
      await user.save();
      console.log(`  ✅ Updated: isCustomer=${user.isCustomer}, isManager=${user.isManager}`);
      
      // Delete Manager records for this user
      const managerRecords = await Manager.find({ user_id: user.user_id });
      if (managerRecords.length > 0) {
        console.log(`  - Found ${managerRecords.length} Manager record(s) to delete`);
        for (const manager of managerRecords) {
          await Manager.findByIdAndDelete(manager._id);
          console.log(`    ✅ Deleted Manager record: ${manager._id}`);
        }
      }
    }
    
    await mongoose.disconnect();
    console.log('\n✅ All fixes applied. Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixCustomerManagerFlags();

