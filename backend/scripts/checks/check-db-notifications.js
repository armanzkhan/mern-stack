// Script to check database notifications
const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const NotificationSubscription = require('./models/NotificationSubscription');

async function checkNotifications() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB');

    // Check notifications
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(10);
    console.log('\n📋 Recent Notifications:');
    console.log('Total notifications:', await Notification.countDocuments());
    
    notifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.title} - ${notif.type} - ${notif.createdAt}`);
      console.log(`   Target: ${notif.targetType} - ${notif.targetIds}`);
      console.log(`   Company: ${notif.company_id}`);
      console.log(`   Status: ${notif.status}`);
    });

    // Check notification subscriptions
    const subscriptions = await NotificationSubscription.find();
    console.log('\n🔔 Notification Subscriptions:');
    console.log('Total subscriptions:', subscriptions.length);
    
    subscriptions.forEach((sub, index) => {
      console.log(`${index + 1}. User: ${sub.user_id} - Channels: ${sub.channels.map(c => c.type).join(', ')} - Active: ${sub.isActive}`);
    });

    // Check for user creation notifications specifically
    const userNotifications = await Notification.find({ 
      $or: [
        { title: { $regex: /user.*created/i } },
        { title: { $regex: /new user/i } },
        { type: 'system' }
      ]
    }).sort({ createdAt: -1 });

    console.log('\n👤 User Creation Notifications:');
    console.log('Count:', userNotifications.length);
    userNotifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.title} - ${notif.createdAt}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Database check completed');

  } catch (error) {
    console.error('❌ Database check failed:', error);
    process.exit(1);
  }
}

checkNotifications();
