// Test notifications for sales@gmail.com
const mongoose = require('mongoose');
const User = require('./models/User');
const realtimeService = require('./services/realtimeService');

async function testSalesNotifications() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB - Database: Ressichem');

    console.log('\n🧪 TESTING NOTIFICATIONS FOR SALES@RESSICHEM.COM:');
    
    // Find sales@ressichem.com user
    const salesUser = await User.findOne({ email: 'sales@ressichem.com' });
    
    if (!salesUser) {
      console.log('❌ sales@ressichem.com user not found');
      return;
    }

    console.log(`\n👤 Found user: ${salesUser.firstName} ${salesUser.lastName} (${salesUser.email})`);
    console.log(`   User ID: ${salesUser._id}`);
    console.log(`   Is Manager: ${salesUser.isManager}`);
    console.log(`   Is Active: ${salesUser.isActive}`);
    console.log(`   User Type: ${salesUser.userType}`);

    // Check WebSocket connections
    console.log(`\n🔌 WebSocket Connections:`);
    console.log(`   Total connections: ${realtimeService.getConnectionCount()}`);
    
    const managerConnections = realtimeService.getConnectionsByType('manager');
    console.log(`   Manager connections: ${managerConnections.length}`);
    
    const allConnections = realtimeService.getConnectionsByType();
    console.log(`   All connections: ${allConnections.length}`);
    
    // Test sending notification
    console.log(`\n📡 Testing notification send to user ID: ${salesUser._id}`);
    
    const testNotification = {
      type: 'item_approval_status',
      title: 'Test Item Approved',
      message: 'This is a test notification for sales@ressichem.com',
      data: {
        approvalId: 'test-approval-id',
        status: 'approved',
        orderNumber: 'TEST-ORDER-123',
        productName: 'Test Product',
        comments: 'Test comment',
        discountAmount: 0
      }
    };
    
    const sent = realtimeService.sendToUser(salesUser._id, testNotification);
    console.log(`📡 Notification sent: ${sent}`);
    
    // Wait a moment for the notification to be processed
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\n✅ Test completed!');
    console.log('\n📋 To debug further:');
    console.log('1. Check if sales@ressichem.com is logged in to the frontend');
    console.log('2. Check browser console for WebSocket connection messages');
    console.log('3. Check if SimpleNotificationManager is receiving notifications');
    console.log('4. Verify the user has isManager: true in the database');

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSalesNotifications();
