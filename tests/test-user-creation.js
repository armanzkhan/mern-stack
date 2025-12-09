// Test script to create a user and check if notification is triggered
const mongoose = require('mongoose');
const User = require('./models/User');
const Notification = require('./models/Notification');
const notificationTriggerService = require('./services/notificationTriggerService');

async function testUserCreation() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB');

    // Create a test user
    const testUserData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test.user@example.com',
      password: 'password123',
      phone: '+923001234567',
      department: 'IT',
      roles: [],
      permissions: [],
      company_id: 'RESSICHEM',
      user_id: `test_user_${Date.now()}`,
      isActive: true,
      userType: 'staff',
      isCustomer: false,
      isManager: false
    };

    console.log('Creating test user...');
    const user = new User(testUserData);
    await user.save();
    console.log('✅ Test user created:', user.email);

    // Check notifications before
    const notificationsBefore = await Notification.countDocuments();
    console.log('Notifications before trigger:', notificationsBefore);

    // Trigger notification
    console.log('Triggering user creation notification...');
    const createdBy = { _id: 'system', name: 'System', email: 'system@ressichem.com' };
    await notificationTriggerService.triggerUserCreated(user, createdBy);
    console.log('✅ Notification trigger completed');

    // Check notifications after
    const notificationsAfter = await Notification.countDocuments();
    console.log('Notifications after trigger:', notificationsAfter);

    // Get the latest notification
    const latestNotification = await Notification.findOne().sort({ createdAt: -1 });
    if (latestNotification) {
      console.log('Latest notification:', {
        title: latestNotification.title,
        type: latestNotification.type,
        status: latestNotification.status,
        createdAt: latestNotification.createdAt
      });
    }

    await mongoose.connection.close();
    console.log('✅ Test completed successfully');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testUserCreation();
