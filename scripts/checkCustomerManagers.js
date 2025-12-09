const mongoose = require('mongoose');
const User = require('../models/User');
const Manager = require('../models/Manager');

const MONGODB_URI = process.env.MONGODB_URI || process.env.CONNECTION_STRING || "mongodb+srv://armanzaman4_db_user:1JJORz7jP2VFgTaP@cluster0.qn1babq.mongodb.net/Ressichem?retryWrites=true&w=majority";

async function checkCustomerManagers() {
  try {
    await mongoose.connect(MONGODB_URI, { dbName: 'Ressichem' });
    console.log('✅ Connected to MongoDB\n');

    const emails = ['ameen@amantech.com', 'aftab@ubl.com', 'areeba@ogdlc.com'];
    
    for (const email of emails) {
      console.log(`\n📧 Checking: ${email}`);
      console.log('─'.repeat(50));
      
      const user = await User.findOne({ email: email });
      if (!user) {
        console.log('❌ User not found');
        continue;
      }
      
      console.log('User Details:');
      console.log(`  - user_id: ${user.user_id}`);
      console.log(`  - isCustomer: ${user.isCustomer}`);
      console.log(`  - isManager: ${user.isManager}`);
      console.log(`  - customerProfile: ${user.customerProfile ? 'EXISTS' : 'NONE'}`);
      if (user.customerProfile) {
        console.log(`    - customer_id: ${user.customerProfile.customer_id}`);
      }
      console.log(`  - managerProfile: ${user.managerProfile ? 'EXISTS' : 'NONE'}`);
      if (user.managerProfile) {
        console.log(`    - manager_id: ${user.managerProfile.manager_id}`);
      }
      console.log(`  - role: ${user.role || 'N/A'}`);
      console.log(`  - userType: ${user.userType || 'N/A'}`);
      
      // Check Manager collection
      const manager = await Manager.findOne({ user_id: user.user_id });
      if (manager) {
        console.log(`\n⚠️ Manager record EXISTS for this user:`);
        console.log(`  - Manager _id: ${manager._id}`);
        console.log(`  - user_id: ${manager.user_id}`);
        console.log(`  - assignedCategories: ${manager.assignedCategories?.length || 0}`);
        console.log(`  - isActive: ${manager.isActive}`);
      } else {
        console.log(`\n✅ No Manager record found (correct)`);
      }
      
      // Check if user_id starts with "customer_"
      if (user.user_id && user.user_id.startsWith('customer_')) {
        console.log(`\n⚠️ WARNING: user_id starts with "customer_" - this is a customer!`);
      }
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkCustomerManagers();

