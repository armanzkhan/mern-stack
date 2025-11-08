// Test script to simulate customer deletion and verify real-time updates
const mongoose = require('mongoose');
const Customer = require('./models/Customer');
const User = require('./models/User');
const Notification = require('./models/Notification');
const notificationService = require('./services/notificationService');

async function testRealtimeCustomerDeletion() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB - Database: Ressichem');

    // Get initial customer count
    const initialCustomerCount = await Customer.countDocuments();
    console.log(`📊 Initial customer count: ${initialCustomerCount}`);

    // Find a customer to delete (use the oldest one)
    const customerToDelete = await Customer.findOne().sort({ createdAt: 1 });
    if (!customerToDelete) {
      console.log('❌ No customers found to delete');
      return;
    }

    console.log(`\n🗑️ Deleting customer: ${customerToDelete.companyName} (${customerToDelete.email})`);

    // Create notification before deletion (simulating the backend process)
    const notification = await notificationService.createNotification({
      title: 'Customer Deleted',
      message: `Customer ${customerToDelete.companyName} has been deleted`,
      type: 'info',
      priority: 'medium',
      targetType: 'company',
      targetIds: ['RESSICHEM'],
      company_id: 'RESSICHEM',
      sender_id: 'system',
      sender_name: 'System',
      data: {
        entityType: 'customer',
        entityId: customerToDelete._id,
        action: 'deleted',
        url: '/customers'
      }
    });

    // Send the notification via WebSocket
    await notificationService.sendNotification(notification._id);
    console.log('✅ Customer deletion notification sent via WebSocket');

    // Delete the customer
    await Customer.findByIdAndDelete(customerToDelete._id);
    console.log('✅ Customer deleted from database');

    // Delete corresponding user if exists
    const userToDelete = await User.findOne({ 
      'customerProfile.customer_id': customerToDelete._id 
    });
    
    if (userToDelete) {
      await User.findByIdAndDelete(userToDelete._id);
      console.log('✅ Corresponding user deleted');
    }

    // Get final customer count
    const finalCustomerCount = await Customer.countDocuments();
    console.log(`📊 Final customer count: ${finalCustomerCount} (-${initialCustomerCount - finalCustomerCount})`);

    // Verify the customer is gone
    const deletedCustomer = await Customer.findById(customerToDelete._id);
    console.log(`✅ Customer verification: ${deletedCustomer ? 'Still exists' : 'Successfully deleted'}`);

    // Check recent notifications
    const recentNotifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(3);
    
    console.log('\n🔔 Recent Notifications:');
    recentNotifications.forEach((notif, index) => {
      console.log(`   ${index + 1}. ${notif.title} - ${notif.type} - ${notif.createdAt}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Real-time customer deletion test completed');
    console.log('📡 The frontend should receive this deletion via WebSocket and update automatically');

  } catch (error) {
    console.error('❌ Real-time customer deletion test failed:', error);
    process.exit(1);
  }
}

testRealtimeCustomerDeletion();
