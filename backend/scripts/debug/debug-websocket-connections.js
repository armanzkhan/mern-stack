// Debug script to check WebSocket connections and notifications
const mongoose = require('mongoose');
const User = require('./models/User');
const Customer = require('./models/Customer');
const Notification = require('./models/Notification');
const notificationService = require('./services/notificationService');
const realtimeService = require('./services/realtimeService');

async function debugWebSocketConnections() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB - Database: Ressichem');

    console.log('\n🔍 WEBSOCKET CONNECTION DEBUG:');
    
    // Check current counts
    const userCount = await User.countDocuments();
    const customerCount = await Customer.countDocuments();
    const notificationCount = await Notification.countDocuments();
    
    console.log(`📊 Users in database: ${userCount}`);
    console.log(`📊 Customers in database: ${customerCount}`);
    console.log(`📊 Notifications in database: ${notificationCount}`);

    // Check WebSocket connections
    console.log('\n🔌 WebSocket Connection Status:');
    const connections = realtimeService.getConnections();
    console.log(`   Active connections: ${connections.length}`);
    
    if (connections.length > 0) {
      connections.forEach((conn, index) => {
        console.log(`   Connection ${index + 1}: ${conn.readyState === 1 ? 'Open' : 'Closed'}`);
      });
    } else {
      console.log('   ⚠️ No active WebSocket connections found');
      console.log('   This means the frontend is not connected to the WebSocket');
    }

    // Check recent notifications
    const recentNotifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log('\n🔔 Recent Notifications (Last 10):');
    recentNotifications.forEach((notif, index) => {
      console.log(`   ${index + 1}. ${notif.title} - ${notif.type} - ${notif.createdAt}`);
      console.log(`      Data: ${JSON.stringify(notif.data)}`);
    });

    // Test sending a notification
    console.log('\n🧪 Testing WebSocket Notification:');
    const testNotification = await notificationService.createNotification({
      title: 'WebSocket Test',
      message: 'Testing if frontend receives this notification',
      type: 'test',
      priority: 'high',
      targetType: 'company',
      targetIds: ['RESSICHEM'],
      company_id: 'RESSICHEM',
      sender_id: 'system',
      sender_name: 'System',
      data: {
        entityType: 'test',
        entityId: 'test',
        action: 'test',
        url: '/test'
      }
    });

    await notificationService.sendNotification(testNotification._id);
    console.log('✅ Test notification sent via WebSocket');

    // Check if there are any users that should be deleted
    console.log('\n🔍 Checking for users that might be orphaned:');
    const allUsers = await User.find().limit(5);
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`      ID: ${user._id}`);
      console.log(`      Is Customer: ${user.isCustomer}`);
      console.log(`      Customer Profile: ${user.customerProfile ? 'Exists' : 'Missing'}`);
      if (user.customerProfile?.customer_id) {
        console.log(`      Customer ID: ${user.customerProfile.customer_id}`);
      }
    });

    await mongoose.connection.close();
    console.log('\n✅ WebSocket debug completed');

  } catch (error) {
    console.error('❌ WebSocket debug failed:', error);
    process.exit(1);
  }
}

debugWebSocketConnections();
