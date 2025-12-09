const mongoose = require('mongoose');
const User = require('../models/User');
const Manager = require('../models/Manager');

async function checkManagerRecord() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 Checking sales user manager record...');

    // Find the sales user
    const salesUser = await User.findOne({ email: 'sales@ressichem.com' });
    if (!salesUser) {
      console.log('❌ Sales user not found');
      return;
    }

    console.log('✅ Sales user found:');
    console.log(`   User ID: ${salesUser.user_id}`);
    console.log(`   Email: ${salesUser.email}`);
    console.log(`   Is Manager: ${salesUser.isManager}`);
    console.log(`   Manager Profile:`, salesUser.managerProfile);

    // Check if there's a separate Manager record
    const managerRecord = await Manager.findOne({ user_id: salesUser.user_id });
    if (managerRecord) {
      console.log('\n✅ Manager record found:');
      console.log(`   Manager ID: ${managerRecord._id}`);
      console.log(`   Assigned Categories: ${managerRecord.assignedCategories.length}`);
      console.log(`   Manager Level: ${managerRecord.managerLevel}`);
    } else {
      console.log('\n❌ No separate Manager record found');
      console.log('   The manager information is only in the User model');
    }

    console.log('\n🎯 Issue Analysis:');
    console.log('   The getManagerProfile endpoint looks for a Manager record');
    console.log('   But our sales user only has manager info in User.managerProfile');
    console.log('   We need to either:');
    console.log('   1. Create a Manager record for the sales user, OR');
    console.log('   2. Update getManagerProfile to check User.managerProfile first');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkManagerRecord();
