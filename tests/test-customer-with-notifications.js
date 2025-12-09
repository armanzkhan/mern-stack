// Test script to create a customer and verify notifications
const mongoose = require('mongoose');
const Customer = require('./models/Customer');
const User = require('./models/User');
const Notification = require('./models/Notification');
const notificationService = require('./services/notificationService');

async function testCustomerWithNotifications() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB');

    // Get initial counts
    const initialCustomerCount = await Customer.countDocuments();
    const initialUserCount = await User.countDocuments();
    const initialNotificationCount = await Notification.countDocuments();
    
    console.log('📊 Initial counts:');
    console.log(`   Customers: ${initialCustomerCount}`);
    console.log(`   Users: ${initialUserCount}`);
    console.log(`   Notifications: ${initialNotificationCount}`);

    // Create a test customer
    console.log('\n🧪 Creating test customer with notifications...');
    const testCustomerData = {
      companyName: 'Test Customer with Notifications',
      contactName: 'Test Contact Person',
      email: 'test.customer.notifications@example.com',
      phone: '+923001234567',
      street: 'Test Street 123',
      city: 'Test City',
      state: 'Test State',
      zip: '12345',
      country: 'Pakistan',
      status: 'active',
      customerType: 'regular',
      company_id: 'RESSICHEM',
      createdBy: 'test_admin'
    };

    const customer = new Customer(testCustomerData);
    await customer.save();
    console.log('✅ Test customer created:', customer._id);

    // Create corresponding user
    console.log('👤 Creating corresponding user...');
    const user = new User({
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
      userType: 'customer',
      customerProfile: {
        customer_id: customer._id,
        companyName: customer.companyName,
        customerType: customer.customerType || 'regular'
      }
    });
    
    await user.save();
    console.log('✅ Test user created:', user._id);

    // Create and send notification
    console.log('🔔 Creating and sending notification...');
    const notification = await notificationService.createNotification({
      title: 'New Customer Added',
      message: `Customer ${customer.companyName} has been added`,
      type: 'success',
      priority: 'medium',
      targetType: 'company',
      targetIds: ['RESSICHEM'],
      company_id: 'RESSICHEM',
      sender_id: 'test_admin',
      sender_name: 'Test Admin',
      data: {
        entityType: 'customer',
        entityId: customer._id,
        action: 'created',
        url: '/customers'
      }
    });
    
    await notificationService.sendNotification(notification._id);
    console.log('✅ Test notification created and sent:', notification._id);

    // Get final counts
    const finalCustomerCount = await Customer.countDocuments();
    const finalUserCount = await User.countDocuments();
    const finalNotificationCount = await Notification.countDocuments();
    
    console.log('\n📊 Final counts:');
    console.log(`   Customers: ${finalCustomerCount} (+${finalCustomerCount - initialCustomerCount})`);
    console.log(`   Users: ${finalUserCount} (+${finalUserCount - initialUserCount})`);
    console.log(`   Notifications: ${finalNotificationCount} (+${finalNotificationCount - initialNotificationCount})`);

    // Get the latest notification
    const latestNotification = await Notification.findOne().sort({ createdAt: -1 });
    if (latestNotification) {
      console.log('\n🔔 Latest Notification:');
      console.log(`   Title: ${latestNotification.title}`);
      console.log(`   Message: ${latestNotification.message}`);
      console.log(`   Type: ${latestNotification.type}`);
      console.log(`   Status: ${latestNotification.status}`);
      console.log(`   Created: ${latestNotification.createdAt}`);
    }

    await mongoose.connection.close();
    console.log('\n✅ Customer creation with notifications test completed successfully');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testCustomerWithNotifications();
