// Test script to create a customer and check the flow
const mongoose = require('mongoose');
const Customer = require('./models/Customer');
const User = require('./models/User');
const Notification = require('./models/Notification');

async function testCustomerCreation() {
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
    console.log('\n🧪 Creating test customer...');
    const testCustomerData = {
      companyName: 'Test Customer Company',
      contactName: 'Test Contact',
      email: 'test.customer@example.com',
      phone: '+923001234567',
      street: 'Test Street',
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

    // Create notification
    console.log('🔔 Creating notification...');
    const notification = new Notification({
      title: 'New Customer Added',
      message: `Customer ${customer.companyName} has been added`,
      type: 'success',
      priority: 'medium',
      targetType: 'company',
      targetIds: ['RESSICHEM'],
      company_id: 'RESSICHEM',
      sender_id: 'system',
      sender_name: 'System',
      status: 'sent'
    });
    
    await notification.save();
    console.log('✅ Test notification created:', notification._id);

    // Get final counts
    const finalCustomerCount = await Customer.countDocuments();
    const finalUserCount = await User.countDocuments();
    const finalNotificationCount = await Notification.countDocuments();
    
    console.log('\n📊 Final counts:');
    console.log(`   Customers: ${finalCustomerCount} (+${finalCustomerCount - initialCustomerCount})`);
    console.log(`   Users: ${finalUserCount} (+${finalUserCount - initialUserCount})`);
    console.log(`   Notifications: ${finalNotificationCount} (+${finalNotificationCount - initialNotificationCount})`);

    // Verify the customer was created correctly
    const createdCustomer = await Customer.findById(customer._id);
    const createdUser = await User.findById(user._id);
    
    console.log('\n✅ Verification:');
    console.log(`   Customer: ${createdCustomer ? 'Found' : 'Not found'}`);
    console.log(`   User: ${createdUser ? 'Found' : 'Not found'}`);
    console.log(`   User-Customer Link: ${createdUser?.customerProfile?.customer_id === customer._id ? 'Linked' : 'Not linked'}`);

    await mongoose.connection.close();
    console.log('\n✅ Customer creation test completed successfully');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testCustomerCreation();
