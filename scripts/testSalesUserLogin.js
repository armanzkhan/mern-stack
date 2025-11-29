const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { generateToken } = require('../services/authService');

async function testSalesUserLogin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 Testing sales user login...');

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

    // Test password
    const testPassword = 'password123';
    const isPasswordValid = await bcrypt.compare(testPassword, salesUser.password);
    console.log(`\n🔑 Password test: ${isPasswordValid ? 'Valid' : 'Invalid'}`);

    if (isPasswordValid) {
      console.log('\n🎯 Login should work with:');
      console.log(`   Email: sales@ressichem.com`);
      console.log(`   Password: ${testPassword}`);
      
      console.log('\n📋 After login, the user should have:');
      console.log(`   - isManager: ${salesUser.isManager}`);
      console.log(`   - managerProfile: ${JSON.stringify(salesUser.managerProfile, null, 2)}`);
      
      console.log('\n🚀 Next steps:');
      console.log('   1. Login with sales@ressichem.com / password123');
      console.log('   2. Check if sidebar shows Manager Dashboard and Category Management');
      console.log('   3. Navigate to /manager-dashboard');
      console.log('   4. If still getting error, check browser console for API errors');
    } else {
      console.log('\n❌ Password is incorrect. Let me reset it...');
      
      const newPassword = 'password123';
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      salesUser.password = hashedPassword;
      await salesUser.save();
      
      console.log('✅ Password reset to: password123');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testSalesUserLogin();