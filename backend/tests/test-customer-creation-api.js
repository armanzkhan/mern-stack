// Test script to test customer creation API directly
const mongoose = require('mongoose');
const Customer = require('./models/Customer');
const User = require('./models/User');
const Notification = require('./models/Notification');

async function testCustomerCreationAPI() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB - Database: Ressichem');

    // Get initial counts
    const initialCustomerCount = await Customer.countDocuments();
    const initialUserCount = await User.countDocuments();
    const initialNotificationCount = await Notification.countDocuments();
    
    console.log('📊 Initial counts:');
    console.log(`   Customers: ${initialCustomerCount}`);
    console.log(`   Users: ${initialUserCount}`);
    console.log(`   Notifications: ${initialNotificationCount}`);

    // Test customer creation with the same data that would come from frontend
    console.log('\n🧪 Testing customer creation API...');
    const testCustomerData = {
      companyName: 'ABC Company',
      contactName: 'ABC Contact',
      email: 'abc@xyz.com',
      phone: '+923001234567',
      street: 'ABC Street',
      city: 'ABC City',
      state: 'ABC State',
      zip: '12345',
      country: 'Pakistan',
      status: 'active',
      customerType: 'regular',
      company_id: 'RESSICHEM',
      createdBy: 'test_admin'
    };

    console.log('📝 Customer data:', testCustomerData);

    // Create customer using the same logic as the controller
    const customer = new Customer(testCustomerData);
    await customer.save();
    console.log('✅ Customer created:', customer._id);

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
      customerProfile: {
        customer_id: customer._id,
        companyName: customer.companyName,
        customerType: customer.customerType || 'regular'
      }
    });
    
    await user.save();
    console.log('✅ User created:', user._id);

    // Link customer to user
    customer.user_id = user._id;
    await customer.save();
    console.log('✅ Customer linked to user');

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
    console.log('✅ Notification created:', notification._id);

    // Get final counts
    const finalCustomerCount = await Customer.countDocuments();
    const finalUserCount = await User.countDocuments();
    const finalNotificationCount = await Notification.countDocuments();
    
    console.log('\n📊 Final counts:');
    console.log(`   Customers: ${finalCustomerCount} (+${finalCustomerCount - initialCustomerCount})`);
    console.log(`   Users: ${finalUserCount} (+${finalUserCount - initialUserCount})`);
    console.log(`   Notifications: ${finalNotificationCount} (+${finalNotificationCount - initialNotificationCount})`);

    // Verify the customer was created
    const createdCustomer = await Customer.findOne({ email: 'abc@xyz.com' });
    const createdUser = await User.findOne({ email: 'abc@xyz.com' });
    
    console.log('\n✅ Verification:');
    console.log(`   Customer found: ${createdCustomer ? '✅' : '❌'}`);
    console.log(`   User found: ${createdUser ? '✅' : '❌'}`);
    console.log(`   Customer-User linked: ${createdCustomer?.user_id?.toString() === user._id.toString() ? '✅' : '❌'}`);

    if (createdCustomer) {
      console.log('\n📋 Customer Details:');
      console.log(`   ID: ${createdCustomer._id}`);
      console.log(`   Company: ${createdCustomer.companyName}`);
      console.log(`   Contact: ${createdCustomer.contactName}`);
      console.log(`   Email: ${createdCustomer.email}`);
      console.log(`   User ID: ${createdCustomer.user_id}`);
    }

    await mongoose.connection.close();
    console.log('\n✅ Customer creation API test completed successfully');

  } catch (error) {
    console.error('❌ Customer creation API test failed:', error);
    process.exit(1);
  }
}

testCustomerCreationAPI();
