// Test script to test the fixed customer creation flow
const mongoose = require('mongoose');
const Customer = require('./models/Customer');
const User = require('./models/User');
const Notification = require('./models/Notification');

async function testFixedCustomerCreation() {
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

    // Create a test customer using the fixed logic
    console.log('\n🧪 Creating test customer with fixed logic...');
    const testCustomerData = {
      companyName: 'Fixed Customer Test',
      contactName: 'Fixed Contact Person',
      email: `fixed.customer.${Date.now()}@example.com`,
      phone: '+923001234567',
      street: 'Fixed Street 123',
      city: 'Fixed City',
      state: 'Fixed State',
      zip: '12345',
      country: 'Pakistan',
      status: 'active',
      customerType: 'regular',
      company_id: 'RESSICHEM',
      createdBy: 'test_admin'
    };

    // Create customer
    const customer = new Customer(testCustomerData);
    await customer.save();
    console.log('✅ Test customer created:', customer._id);

    // Create corresponding user with proper fields
    console.log('👤 Creating corresponding user with proper fields...');
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
      userType: 'customer', // Add userType
      createdAt: new Date(), // Add createdAt
      updatedAt: new Date(), // Add updatedAt
      customerProfile: {
        customer_id: customer._id,
        companyName: customer.companyName,
        customerType: customer.customerType || 'regular'
      }
    });
    
    await user.save();
    console.log('✅ Test user created:', user._id);

    // Update customer record with user_id
    customer.user_id = user._id;
    await customer.save();
    console.log('✅ Linked customer to user:', user._id);

    // Get final counts
    const finalCustomerCount = await Customer.countDocuments();
    const finalUserCount = await User.countDocuments();
    const finalNotificationCount = await Notification.countDocuments();
    
    console.log('\n📊 Final counts:');
    console.log(`   Customers: ${finalCustomerCount} (+${finalCustomerCount - initialCustomerCount})`);
    console.log(`   Users: ${finalUserCount} (+${finalUserCount - initialUserCount})`);
    console.log(`   Notifications: ${finalNotificationCount} (+${finalNotificationCount - initialNotificationCount})`);

    // Verify the customer-user linking
    const createdCustomer = await Customer.findById(customer._id);
    const createdUser = await User.findById(user._id);
    
    console.log('\n✅ Verification:');
    console.log(`   Customer: ${createdCustomer ? 'Found' : 'Not found'}`);
    console.log(`   User: ${createdUser ? 'Found' : 'Not found'}`);
    console.log(`   Customer User ID: ${createdCustomer?.user_id}`);
    console.log(`   User Customer Profile: ${createdUser?.customerProfile?.customer_id}`);
    console.log(`   User Type: ${createdUser?.userType}`);
    console.log(`   User Created: ${createdUser?.createdAt}`);

    await mongoose.connection.close();
    console.log('\n✅ Fixed customer creation test completed successfully');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testFixedCustomerCreation();
