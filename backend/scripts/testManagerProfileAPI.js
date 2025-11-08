const mongoose = require('mongoose');
const User = require('../models/User');
const Manager = require('../models/Manager');

async function testManagerProfileAPI() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 Testing manager profile logic...');

    // Find the sales user
    const salesUser = await User.findOne({ email: 'sales@ressichem.com' });
    if (!salesUser) {
      console.log('❌ Sales user not found');
      return;
    }

    console.log('✅ Sales user found:');
    console.log(`   User ID: ${salesUser.user_id}`);
    console.log(`   Company ID: ${salesUser.company_id}`);
    console.log(`   Is Manager: ${salesUser.isManager}`);
    console.log(`   Manager Profile:`, salesUser.managerProfile);

    // Test the manager profile logic from the controller
    const userId = salesUser.user_id;
    const companyId = salesUser.company_id;

    // First try to find a Manager record
    let manager = await Manager.findOne({ user_id: userId, company_id: companyId });

    console.log('\n🔍 Manager record lookup:');
    if (manager) {
      console.log('✅ Manager record found');
      console.log(`   Manager ID: ${manager._id}`);
      console.log(`   Assigned Categories: ${manager.assignedCategories.length}`);
    } else {
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

    console.log('\n🎯 Final manager object:');
    console.log(`   Manager ID: ${manager._id}`);
    console.log(`   User ID: ${manager.user_id}`);
    console.log(`   Manager Level: ${manager.managerLevel}`);
    console.log(`   Assigned Categories: ${manager.assignedCategories.length}`);
    console.log(`   Categories: ${manager.assignedCategories.map(c => c.category).join(', ')}`);

    console.log('\n✅ Manager profile logic test successful!');
    console.log('   The API should now work correctly for the sales user.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testManagerProfileAPI();
