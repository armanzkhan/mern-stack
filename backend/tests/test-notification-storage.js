// Test script to verify notification storage
const mongoose = require('mongoose');
const Notification = require('./models/Notification');

async function testNotificationStorage() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB');

    // Get total notification count
    const totalNotifications = await Notification.countDocuments();
    console.log('📊 Total notifications in database:', totalNotifications);

    // Get recent notifications
    const recentNotifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(10);

    console.log('\n📋 Recent Notifications:');
    recentNotifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.title} - ${notif.type} - ${notif.createdAt}`);
      console.log(`   Company: ${notif.company_id}`);
      console.log(`   Status: ${notif.status}`);
      console.log(`   Target: ${notif.targetType} - ${notif.targetIds}`);
    });

    // Check for real-time notifications specifically
    const realtimeNotifications = await Notification.find({
      $or: [
        { title: { $regex: /real.*time/i } },
        { title: { $regex: /test.*notification/i } },
        { sender_name: 'System' }
      ]
    }).sort({ createdAt: -1 });

    console.log('\n🔔 Real-time/System Notifications:');
    console.log('Count:', realtimeNotifications.length);
    realtimeNotifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.title} - ${notif.createdAt}`);
    });

    // Check notification types distribution
    const typeStats = await Notification.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    console.log('\n📈 Notification Types Distribution:');
    typeStats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count} notifications`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Notification storage test completed');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testNotificationStorage();
