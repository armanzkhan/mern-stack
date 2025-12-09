const mongoose = require('mongoose');
const User = require('../models/User');

async function checkAllUsers() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ressichem');
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 All users in database:');
    const users = await User.find({}).select('user_id email isManager managerProfile').lean();
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }

    users.forEach((user, index) => {
      console.log(`\n${index + 1}. User:`);
      console.log(`   User ID: ${user.user_id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Is Manager: ${user.isManager || false}`);
      console.log(`   Manager Profile:`, user.managerProfile);
    });

    console.log(`\n📊 Total users: ${users.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkAllUsers();