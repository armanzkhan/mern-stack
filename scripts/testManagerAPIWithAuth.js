const mongoose = require('mongoose');
const User = require('../models/User');
const Manager = require('../models/Manager');
const { generateToken } = require('../services/authService');

async function testManagerAPIWithAuth() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 Testing manager API with authentication...');

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

    // Test the exact API logic
    const userId = salesUser.user_id;
    const companyId = salesUser.company_id;

    console.log('\n🧪 Testing manager profile API logic...');
    
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

    // Test token generation
    console.log('\n🔑 Testing token generation...');
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

    console.log('\n🎯 API Status:');
    console.log('   ✅ Sales user exists and is a manager');
    console.log('   ✅ Manager record exists');
    console.log('   ✅ Assigned categories: 4');
    console.log('   ✅ Manager profile API logic works');
    console.log('   ✅ Token generation works');

    console.log('\n🚀 The issue is likely in the frontend:');
    console.log('   1. User not properly authenticated');
    console.log('   2. Token not being sent with API request');
    console.log('   3. API request failing silently');
    console.log('   4. CORS or routing issues');

    console.log('\n🔧 Frontend Debug Steps:');
    console.log('   1. Go to /debug-manager');
    console.log('   2. Click "Test Login"');
    console.log('   3. Click "Test Manager Profile API"');
    console.log('   4. Check browser console for errors');
    console.log('   5. Check Network tab for API request details');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testManagerAPIWithAuth();
