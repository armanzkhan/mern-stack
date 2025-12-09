const mongoose = require('mongoose');
const User = require('../models/User');
const Manager = require('../models/Manager');

async function debugManagerProfile() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 Debugging manager profile lookup...');

    // Find the sales user
    const salesUser = await User.findOne({ email: 'sales@ressichem.com' });
    if (!salesUser) {
      console.log('❌ Sales user not found');
      return;
    }

    console.log('✅ Sales user details:');
    console.log(`   User ID: ${salesUser.user_id}`);
    console.log(`   Company ID: ${salesUser.company_id}`);
    console.log(`   Email: ${salesUser.email}`);

    // Try to find manager by user_id
    const managerByUserId = await Manager.findOne({ user_id: salesUser.user_id });
    console.log(`\n🔍 Manager lookup by user_id (${salesUser.user_id}):`);
    if (managerByUserId) {
      console.log('✅ Found by user_id');
      console.log(`   Manager ID: ${managerByUserId._id}`);
      console.log(`   User ID: ${managerByUserId.user_id}`);
      console.log(`   Company ID: ${managerByUserId.company_id}`);
    } else {
      console.log('❌ Not found by user_id');
    }

    // Try to find manager by company_id
    const managerByCompany = await Manager.findOne({ company_id: salesUser.company_id });
    console.log(`\n🔍 Manager lookup by company_id (${salesUser.company_id}):`);
    if (managerByCompany) {
      console.log('✅ Found by company_id');
      console.log(`   Manager ID: ${managerByCompany._id}`);
      console.log(`   User ID: ${managerByCompany.user_id}`);
      console.log(`   Company ID: ${managerByCompany.company_id}`);
    } else {
      console.log('❌ Not found by company_id');
    }

    // List all managers
    const allManagers = await Manager.find({});
    console.log(`\n📋 All managers in database (${allManagers.length}):`);
    allManagers.forEach((manager, index) => {
      console.log(`   ${index + 1}. Manager ID: ${manager._id}`);
      console.log(`      User ID: ${manager.user_id}`);
      console.log(`      Company ID: ${manager.company_id}`);
      console.log(`      Manager Level: ${manager.managerLevel}`);
    });

    console.log('\n🎯 Test the exact lookup that getManagerProfile uses:');
    console.log(`   Manager.findOne({ user_id: "${salesUser.user_id}", company_id: "${salesUser.company_id}" })`);
    
    const exactLookup = await Manager.findOne({ 
      user_id: salesUser.user_id, 
      company_id: salesUser.company_id 
    });
    
    if (exactLookup) {
      console.log('✅ Exact lookup successful');
    } else {
      console.log('❌ Exact lookup failed - this is why the API returns 404');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

debugManagerProfile();
