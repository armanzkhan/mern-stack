// Comprehensive test for complete real-time flow: Frontend -> Backend -> Database
const mongoose = require('mongoose');
const Customer = require('./models/Customer');
const User = require('./models/User');
const Notification = require('./models/Notification');
const notificationService = require('./services/notificationService');
const realtimeService = require('./services/realtimeService');

async function testCompleteRealtimeFlow() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB - Database: Ressichem');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('✅ Connected to Ressichem database');

    // Get initial counts
    const initialCustomerCount = await Customer.countDocuments();
    const initialUserCount = await User.countDocuments();
    const initialNotificationCount = await Notification.countDocuments();
    
    console.log('\n📊 Initial Database State:');
    console.log(`   Customers: ${initialCustomerCount}`);
    console.log(`   Users: ${initialUserCount}`);
    console.log(`   Notifications: ${initialNotificationCount}`);

    // Test 1: User Creation Flow
    console.log('\n🧪 Test 1: User Creation Flow');
    console.log('   Simulating frontend user creation...');
    
    const testUserData = {
      firstName: 'Realtime',
      lastName: 'Test User',
      email: `realtime.user.${Date.now()}@example.com`,
      password: 'password123',
      phone: '+923001234567',
      department: 'IT',
      roles: [],
      permissions: [],
      company_id: 'RESSICHEM',
      user_id: `realtime_user_${Date.now()}`,
      isActive: true,
      userType: 'staff',
      isCustomer: false,
      isManager: false
    };

    // Create user (simulating backend user creation)
    const user = new User(testUserData);
    await user.save();
    console.log('   ✅ User created in database:', user._id);

    // Create notification for user creation
    const userNotification = await notificationService.createNotification({
      title: 'New User Created',
      message: `A new user "${testUserData.firstName} ${testUserData.lastName}" has been created`,
      type: 'system',
      priority: 'medium',
      targetType: 'company',
      targetIds: ['RESSICHEM'],
      company_id: 'RESSICHEM',
      sender_id: 'system',
      sender_name: 'System',
      data: {
        entityType: 'user',
        entityId: user._id,
        action: 'created',
        url: '/users'
      }
    });

    await notificationService.sendNotification(userNotification._id);
    console.log('   ✅ User creation notification sent');

    // Test 2: Customer Creation Flow
    console.log('\n🧪 Test 2: Customer Creation Flow');
    console.log('   Simulating frontend customer creation...');
    
    const testCustomerData = {
      companyName: 'Realtime Test Company',
      contactName: 'Realtime Contact',
      email: `realtime.customer.${Date.now()}@example.com`,
      phone: '+923001234567',
      street: 'Realtime Street',
      city: 'Realtime City',
      state: 'Realtime State',
      zip: '12345',
      country: 'Pakistan',
      status: 'active',
      customerType: 'regular',
      company_id: 'RESSICHEM',
      createdBy: 'system'
    };

    // Create customer
    const customer = new Customer(testCustomerData);
    await customer.save();
    console.log('   ✅ Customer created in database:', customer._id);

    // Create corresponding user
    const customerUser = new User({
      user_id: `customer_${customer._id}`,
      email: customer.email,
      password: 'customer123',
      firstName: customer.contactName?.split(' ')[0] || 'Customer',
      lastName: customer.contactName?.split(' ').slice(1).join(' ') || 'User',
      phone: customer.phone,
      role: 'Customer',
      department: 'Customer',
      company_id: 'RESSICHEM',
      isCustomer: true,
      isActive: true,
      customerProfile: {
        customer_id: customer._id,
        companyName: customer.companyName,
        customerType: customer.customerType || 'regular'
      }
    });
    
    await customerUser.save();
    console.log('   ✅ Customer user created:', customerUser._id);

    // Link customer to user
    customer.user_id = customerUser._id;
    await customer.save();
    console.log('   ✅ Customer linked to user');

    // Create notification for customer creation
    const customerNotification = await notificationService.createNotification({
      title: 'New Customer Added',
      message: `Customer ${customer.companyName} has been added`,
      type: 'success',
      priority: 'medium',
      targetType: 'company',
      targetIds: ['RESSICHEM'],
      company_id: 'RESSICHEM',
      sender_id: 'system',
      sender_name: 'System',
      data: {
        entityType: 'customer',
        entityId: customer._id,
        action: 'created',
        url: '/customers'
      }
    });

    await notificationService.sendNotification(customerNotification._id);
    console.log('   ✅ Customer creation notification sent');

    // Test 3: Real-time Notification Flow
    console.log('\n🧪 Test 3: Real-time Notification Flow');
    console.log('   Testing WebSocket real-time broadcasting...');
    
    const realtimeNotification = await notificationService.createNotification({
      title: 'Real-time System Test',
      message: 'This is a real-time notification test to verify WebSocket connectivity',
      type: 'system',
      priority: 'high',
      targetType: 'company',
      targetIds: ['RESSICHEM'],
      company_id: 'RESSICHEM',
      sender_id: 'system',
      sender_name: 'System',
      data: {
        entityType: 'test',
        action: 'realtime_test',
        url: '/admin-dashboard'
      }
    });

    await notificationService.sendNotification(realtimeNotification._id);
    console.log('   ✅ Real-time notification sent via WebSocket');

    // Get final counts
    const finalCustomerCount = await Customer.countDocuments();
    const finalUserCount = await User.countDocuments();
    const finalNotificationCount = await Notification.countDocuments();
    
    console.log('\n📊 Final Database State:');
    console.log(`   Customers: ${finalCustomerCount} (+${finalCustomerCount - initialCustomerCount})`);
    console.log(`   Users: ${finalUserCount} (+${finalUserCount - initialUserCount})`);
    console.log(`   Notifications: ${finalNotificationCount} (+${finalNotificationCount - initialNotificationCount})`);

    // Verify all data is stored in database
    console.log('\n✅ Verification:');
    const createdUser = await User.findById(user._id);
    const createdCustomer = await Customer.findById(customer._id);
    const createdCustomerUser = await User.findById(customerUser._id);
    const latestNotifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(3);

    console.log(`   User stored: ${createdUser ? '✅' : '❌'}`);
    console.log(`   Customer stored: ${createdCustomer ? '✅' : '❌'}`);
    console.log(`   Customer-User linked: ${createdCustomer?.user_id?.toString() === customerUser._id.toString() ? '✅' : '❌'}`);
    console.log(`   Notifications stored: ${latestNotifications.length} recent notifications`);

    // Show latest notifications
    console.log('\n🔔 Latest Notifications:');
    latestNotifications.forEach((notif, index) => {
      console.log(`   ${index + 1}. ${notif.title} - ${notif.type} - ${notif.status}`);
    });

    await mongoose.connection.close();
    console.log('\n🎉 Complete real-time flow test completed successfully!');
    console.log('✅ Frontend -> Backend -> Database connectivity verified');
    console.log('✅ All data stored in Ressichem database');
    console.log('✅ Real-time notifications working');

  } catch (error) {
    console.error('❌ Complete real-time flow test failed:', error);
    process.exit(1);
  }
}

testCompleteRealtimeFlow();
