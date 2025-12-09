// Test script to verify real-time notification storage
const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const notificationTriggerService = require('./services/notificationTriggerService');

async function testRealtimeStorage() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB');

    // Get initial count
    const initialCount = await Notification.countDocuments();
    console.log('📊 Initial notification count:', initialCount);

    // Create a test real-time notification
    console.log('\n🧪 Creating test real-time notification...');
    const testNotification = await notificationTriggerService.createNotification({
      title: 'Real-time Storage Test',
      message: 'This is a test to verify that real-time notifications are stored in the database.',
      type: 'system',
      priority: 'high',
      targetType: 'company',
      targetIds: ['RESSICHEM'],
      company_id: 'RESSICHEM',
      sender_id: 'test_system',
      sender_name: 'Test System',
      data: {
        test: true,
        timestamp: new Date().toISOString(),
        source: 'realtime_storage_test'
      }
    });

    console.log('✅ Test notification created:', testNotification._id);

    // Get final count
    const finalCount = await Notification.countDocuments();
    console.log('📊 Final notification count:', finalCount);
    console.log('📈 Notifications added:', finalCount - initialCount);

    // Verify the notification was stored
    const storedNotification = await Notification.findById(testNotification._id);
    if (storedNotification) {
      console.log('\n✅ Notification successfully stored in database:');
      console.log(`   Title: ${storedNotification.title}`);
      console.log(`   Type: ${storedNotification.type}`);
      console.log(`   Company: ${storedNotification.company_id}`);
      console.log(`   Status: ${storedNotification.status}`);
      console.log(`   Created: ${storedNotification.createdAt}`);
    } else {
      console.log('❌ Notification not found in database');
    }

    // Get latest notifications
    const latestNotifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(5);

    console.log('\n📋 Latest 5 Notifications:');
    latestNotifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.title} - ${notif.type} - ${notif.createdAt}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Real-time storage test completed successfully');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testRealtimeStorage();
