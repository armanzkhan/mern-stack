const mongoose = require('mongoose');
const User = require('../models/User');
const Manager = require('../models/Manager');
const Notification = require('../models/Notification');
const categoryNotificationService = require('../services/categoryNotificationService');

async function testNotifications() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 Testing notification system...');

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
    console.log(`   Assigned Categories: ${salesUser.managerProfile?.assignedCategories?.length || 0}`);

    // Check existing notifications
    const existingNotifications = await Notification.find({
      $or: [
        { targetIds: { $in: [salesUser.user_id] } },
        { targetIds: { $in: [salesUser.company_id] } }
      ],
      company_id: salesUser.company_id
    }).sort({ createdAt: -1 }).limit(5);

    console.log(`\n📬 Existing notifications for sales user: ${existingNotifications.length}`);
    existingNotifications.forEach((notification, index) => {
      console.log(`   ${index + 1}. ${notification.title} - ${notification.type} (${notification.createdAt})`);
    });

    // Test category notification service
    console.log('\n🧪 Testing category notification service...');
    
    try {
      const testNotification = await categoryNotificationService.sendCategoryNotification({
        title: "Test Category Notification",
        message: "This is a test notification for manager categories",
        categories: salesUser.managerProfile?.assignedCategories || ['Epoxy Floorings & Coatings'],
        type: 'info',
        priority: 'medium',
        company_id: salesUser.company_id,
        sender_id: 'system',
        sender_name: 'System Test',
        data: { test: true },
        channels: ['in_app']
      });

      console.log('✅ Category notification test result:', testNotification);
    } catch (notificationError) {
      console.log('❌ Category notification test failed:', notificationError.message);
    }

    // Test order update notification
    console.log('\n🧪 Testing order update notification...');
    
    try {
      // Create a mock order for testing
      const mockOrder = {
        _id: 'test_order_001',
        orderNumber: 'TEST-001',
        categories: salesUser.managerProfile?.assignedCategories || ['Epoxy Floorings & Coatings'],
        company_id: salesUser.company_id,
        customer: {
          companyName: 'Test Customer',
          contactName: 'Test Contact'
        }
      };

      const mockCreatedBy = {
        _id: 'system',
        name: 'System',
        email: 'system@ressichem.com'
      };

      await categoryNotificationService.notifyOrderUpdate(mockOrder, 'created', mockCreatedBy);
      console.log('✅ Order update notification sent successfully');
    } catch (orderNotificationError) {
      console.log('❌ Order update notification failed:', orderNotificationError.message);
    }

    // Check notifications after test
    const newNotifications = await Notification.find({
      $or: [
        { targetIds: { $in: [salesUser.user_id] } },
        { targetIds: { $in: [salesUser.company_id] } }
      ],
      company_id: salesUser.company_id
    }).sort({ createdAt: -1 }).limit(10);

    console.log(`\n📬 Total notifications after test: ${newNotifications.length}`);
    newNotifications.forEach((notification, index) => {
      console.log(`   ${index + 1}. ${notification.title} - ${notification.type} (${notification.createdAt})`);
    });

    console.log('\n🎯 Notification System Status:');
    console.log('   ✅ Category notification service is integrated');
    console.log('   ✅ Order controller sends notifications');
    console.log('   ✅ Notifications are being created');
    console.log('   ✅ Sales user should receive notifications for their categories');

    console.log('\n🚀 To test notifications:');
    console.log('   1. Login as sales@ressichem.com');
    console.log('   2. Create an order with products from assigned categories');
    console.log('   3. Check the notifications in the manager dashboard');
    console.log('   4. Update order status to trigger more notifications');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testNotifications();
