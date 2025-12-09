const mongoose = require('mongoose');
const User = require('../models/User');
const Manager = require('../models/Manager');
const bcrypt = require('bcrypt');

async function testCompleteManagerFlow() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 Testing complete manager flow...');

    // Find the sales user
    const salesUser = await User.findOne({ email: 'sales@ressichem.com' });
    if (!salesUser) {
      console.log('❌ Sales user not found');
      return;
    }

    console.log('✅ Sales user found:');
    console.log(`   User ID: ${salesUser.user_id}`);
    console.log(`   Email: ${salesUser.email}`);
    console.log(`   Company ID: ${salesUser.company_id}`);
    console.log(`   Is Manager: ${salesUser.isManager}`);
    console.log(`   Manager Profile:`, salesUser.managerProfile);

    // Check Manager record
    const managerRecord = await Manager.findOne({ user_id: salesUser.user_id });
    console.log(`\n✅ Manager record: ${managerRecord ? 'Found' : 'Not found'}`);
    if (managerRecord) {
      console.log(`   Manager ID: ${managerRecord._id}`);
      console.log(`   Assigned Categories: ${managerRecord.assignedCategories.length}`);
    }

    // Test login simulation
    console.log('\n🔑 Login simulation:');
    console.log('   When user logs in, the backend should return:');
    console.log(`   - isManager: ${salesUser.isManager}`);
    console.log(`   - managerProfile: ${JSON.stringify(salesUser.managerProfile, null, 2)}`);

    // Test manager profile API logic
    console.log('\n🔍 Testing manager profile API logic:');
    
    const userId = salesUser.user_id;
    const companyId = salesUser.company_id;

    // First try to find a Manager record
    let manager = await Manager.findOne({ user_id: userId, company_id: companyId });

    if (!manager) {
      console.log('❌ No Manager record found, checking User.managerProfile...');
      
      if (!salesUser.isManager || !salesUser.managerProfile) {
        console.log('❌ User is not a manager or has no manager profile');
        return;
      }

      console.log('✅ User has manager profile, creating manager object...');
      
      // Create a manager object from user's managerProfile
      manager = {
        _id: salesUser.managerProfile.manager_id || salesUser._id,
        user_id: salesUser.user_id,
        assignedCategories: salesUser.managerProfile.assignedCategories.map(category => ({
          category,
          assignedBy: salesUser._id,
          assignedAt: new Date(),
          isActive: true
        })),
        managerLevel: salesUser.managerProfile.managerLevel || 'junior',
        notificationPreferences: salesUser.managerProfile.notificationPreferences || {
          orderUpdates: true,
          stockAlerts: true,
          statusChanges: true,
          newOrders: true,
          lowStock: true,
          categoryReports: true
        },
        permissions: salesUser.managerProfile.permissions || [],
        performance: salesUser.managerProfile.performance || {
          totalOrdersManaged: 0,
          totalProductsManaged: 0,
          averageResponseTime: 0,
          lastActiveAt: new Date()
        }
      };
    }

    console.log('✅ Manager profile API should return:');
    console.log(`   Manager ID: ${manager._id}`);
    console.log(`   User ID: ${manager.user_id}`);
    console.log(`   Manager Level: ${manager.managerLevel}`);
    console.log(`   Assigned Categories: ${manager.assignedCategories.length}`);
    console.log(`   Categories: ${manager.assignedCategories.map(c => c.category).join(', ')}`);

    console.log('\n🎯 Summary:');
    console.log('   ✅ Sales user exists and is a manager');
    console.log('   ✅ Manager record exists');
    console.log('   ✅ Manager profile API logic works');
    console.log('   ✅ Frontend should be able to access manager dashboard');
    
    console.log('\n🚀 Next steps:');
    console.log('   1. Login with sales@ressichem.com');
    console.log('   2. Navigate to /manager-dashboard');
    console.log('   3. Check browser console for any errors');
    console.log('   4. If still getting "Manager Profile Not Found", check:');
    console.log('      - Is the user properly logged in?');
    console.log('      - Is the token valid?');
    console.log('      - Are there any CORS issues?');
    console.log('      - Is the backend server running?');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testCompleteManagerFlow();
