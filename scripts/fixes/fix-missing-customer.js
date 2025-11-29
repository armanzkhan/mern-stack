// Script to fix the missing customer record for abc@xyz.com
const mongoose = require('mongoose');
const Customer = require('./models/Customer');
const User = require('./models/User');

async function fixMissingCustomer() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB - Database: Ressichem');

    // Find the user
    const user = await User.findOne({ email: 'abc@xyz.com' });
    if (!user) {
      console.log('❌ User abc@xyz.com not found');
      return;
    }

    console.log('✅ User found:', user._id);
    console.log('   Customer Profile:', user.customerProfile);

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ email: 'abc@xyz.com' });
    if (existingCustomer) {
      console.log('✅ Customer already exists:', existingCustomer._id);
      return;
    }

    // Create the missing customer record
    console.log('\n🔧 Creating missing customer record...');
    const customerData = {
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
      user_id: user._id, // Link to the existing user
      createdBy: 'system_fix'
    };

    const customer = new Customer(customerData);
    await customer.save();
    console.log('✅ Customer created:', customer._id);

    // Update the user's customer profile to point to the new customer
    user.customerProfile.customer_id = customer._id;
    await user.save();
    console.log('✅ User customer profile updated');

    // Verify the fix
    const fixedCustomer = await Customer.findOne({ email: 'abc@xyz.com' });
    const fixedUser = await User.findOne({ email: 'abc@xyz.com' });
    
    console.log('\n✅ Verification:');
    console.log(`   Customer exists: ${fixedCustomer ? '✅' : '❌'}`);
    console.log(`   User exists: ${fixedUser ? '✅' : '❌'}`);
    console.log(`   Customer-User linked: ${fixedCustomer?.user_id?.toString() === user._id.toString() ? '✅' : '❌'}`);
    console.log(`   User profile updated: ${fixedUser?.customerProfile?.customer_id?.toString() === customer._id.toString() ? '✅' : '❌'}`);

    if (fixedCustomer) {
      console.log('\n📋 Customer Details:');
      console.log(`   ID: ${fixedCustomer._id}`);
      console.log(`   Company: ${fixedCustomer.companyName}`);
      console.log(`   Contact: ${fixedCustomer.contactName}`);
      console.log(`   Email: ${fixedCustomer.email}`);
      console.log(`   User ID: ${fixedCustomer.user_id}`);
      console.log(`   Status: ${fixedCustomer.status}`);
      console.log(`   Created: ${fixedCustomer.createdAt}`);
    }

    await mongoose.connection.close();
    console.log('\n✅ Missing customer fix completed successfully');

  } catch (error) {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  }
}

fixMissingCustomer();
