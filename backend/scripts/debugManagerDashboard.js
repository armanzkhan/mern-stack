const mongoose = require('mongoose');
const User = require('../models/User');
const Manager = require('../models/Manager');
const { generateToken } = require('../services/authService');

async function debugManagerDashboard() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 Debugging manager dashboard issue...');

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

    // Test the exact API logic that the frontend is calling
    console.log('\n🧪 Testing manager profile API logic...');
    
    const userId = salesUser.user_id;
    const companyId = salesUser.company_id;

    // First try to find a Manager record
    let manager = await Manager.findOne({ user_id: userId, company_id: companyId });

    if (!manager) {
      console.log('❌ No Manager record found, checking User.managerProfile...');
      
      if (!salesUser.isManager || !salesUser.managerProfile) {
        console.log('❌ User is not a manager or has no manager profile');
        console.log('   This is why the frontend shows "Manager Profile Not Found"');
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

    // Test authentication token generation
    console.log('\n🔑 Testing authentication token...');
    
    try {
      const token = generateToken({
        user_id: salesUser.user_id,
        company_id: salesUser.company_id,
        email: salesUser.email,
        isSuperAdmin: false,
        isManager: true
      });
      console.log('✅ Token generated successfully');
      console.log(`   Token length: ${token.length}`);
    } catch (tokenError) {
      console.log('❌ Token generation failed:', tokenError.message);
    }

    console.log('\n🎯 Possible Issues:');
    console.log('   1. Frontend not properly authenticated');
    console.log('   2. API request failing due to CORS or routing');
    console.log('   3. Token not being sent correctly');
    console.log('   4. Backend server not running');
    console.log('   5. API endpoint not responding');

    console.log('\n🚀 Debug Steps:');
    console.log('   1. Check browser console for errors');
    console.log('   2. Check Network tab for API requests');
    console.log('   3. Verify backend server is running on port 5000');
    console.log('   4. Test API endpoint directly');
    console.log('   5. Check if user is properly logged in');

    console.log('\n🔧 Quick Fixes to Try:');
    console.log('   1. Clear browser cache and cookies');
    console.log('   2. Logout and login again');
    console.log('   3. Check if backend server is running');
    console.log('   4. Verify API routes are registered');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

debugManagerDashboard();
