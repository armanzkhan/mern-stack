// Test script to manually trigger a notification
const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const notificationService = require('./services/notificationService');

async function testNotification() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB');

    // Create a test notification
    const testNotification = await notificationService.createNotification({
      title: 'Test Notification',
      message: 'This is a test notification to verify the system is working.',
      type: 'system',
      priority: 'high',
      targetType: 'company',
      targetIds: ['RESSICHEM'],
      company_id: 'RESSICHEM',
      sender_id: 'test_system',
      sender_name: 'Test System',
      data: {
        test: true,
        timestamp: new Date().toISOString()
      }
    });

    console.log('✅ Test notification created:', testNotification._id);

    // Send the notification
    await notificationService.sendNotification(testNotification._id);
    console.log('✅ Test notification sent successfully');

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Test completed successfully');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testNotification();
