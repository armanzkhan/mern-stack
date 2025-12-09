// Test script to simulate user deletion and verify real-time updates
const mongoose = require('mongoose');
const User = require('./models/User');
const Customer = require('./models/Customer');
const Notification = require('./models/Notification');
const notificationService = require('./services/notificationService');

async function testRealtimeUserDeletion() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB - Database: Ressichem');

    // Get initial user count
    const initialUserCount = await User.countDocuments();
    console.log(`📊 Initial user count: ${initialUserCount}`);

    // Find a customer user to delete (one that has isCustomer: true)
    const customerUserToDelete = await User.findOne({ isCustomer: true });
    if (!customerUserToDelete) {
      console.log('❌ No customer users found to delete');
      return;
    }

    console.log(`\n🗑️ Deleting customer user: ${customerUserToDelete.firstName} ${customerUserToDelete.lastName} (${customerUserToDelete.email})`);

    // Check if this user has a corresponding customer record
    let correspondingCustomer = null;
    if (customerUserToDelete.customerProfile?.customer_id) {
      correspondingCustomer = await Customer.findById(customerUserToDelete.customerProfile.customer_id);
      if (correspondingCustomer) {
        console.log(`   Corresponding customer: ${correspondingCustomer.companyName}`);
      }
    }

    // Create notification before deletion (simulating the backend process)
    const notification = await notificationService.createNotification({
      title: 'User Deleted',
      message: `User ${customerUserToDelete.firstName} ${customerUserToDelete.lastName} has been deleted`,
      type: 'info',
      priority: 'medium',
      targetType: 'company',
      targetIds: ['RESSICHEM'],
      company_id: 'RESSICHEM',
      sender_id: 'system',
      sender_name: 'System',
      data: {
        entityType: 'user',
        entityId: customerUserToDelete._id,
        action: 'deleted',
        url: '/users'
      }
    });

    // Send the notification via WebSocket
    await notificationService.sendNotification(notification._id);
    console.log('✅ User deletion notification sent via WebSocket');

    // Delete the user
    await User.findByIdAndDelete(customerUserToDelete._id);
    console.log('✅ User deleted from database');

    // Delete corresponding customer if exists
    if (correspondingCustomer) {
      await Customer.findByIdAndDelete(correspondingCustomer._id);
      console.log('✅ Corresponding customer deleted');
    }

    // Get final user count
    const finalUserCount = await User.countDocuments();
    console.log(`📊 Final user count: ${finalUserCount} (-${initialUserCount - finalUserCount})`);

    // Verify the user is gone
    const deletedUser = await User.findById(customerUserToDelete._id);
    console.log(`✅ User verification: ${deletedUser ? 'Still exists' : 'Successfully deleted'}`);

    // Check recent notifications
    const recentNotifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(3);
    
    console.log('\n🔔 Recent Notifications:');
    recentNotifications.forEach((notif, index) => {
      console.log(`   ${index + 1}. ${notif.title} - ${notif.type} - ${notif.createdAt}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Real-time user deletion test completed');
    console.log('📡 The frontend should receive this deletion via WebSocket and update automatically');

  } catch (error) {
    console.error('❌ Real-time user deletion test failed:', error);
    process.exit(1);
  }
}

testRealtimeUserDeletion();
