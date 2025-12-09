// Debug script to find what happened to the customer record
const mongoose = require('mongoose');
const Customer = require('./models/Customer');
const User = require('./models/User');
const Notification = require('./models/Notification');

async function debugCustomerCreation() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB - Database: Ressichem');

    // Find the user
    const user = await User.findOne({ email: 'abc@xyz.com' });
    if (user) {
      console.log('✅ User found:');
      console.log(`   ID: ${user._id}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Is Customer: ${user.isCustomer}`);
      console.log(`   Customer Profile: ${user.customerProfile ? 'Exists' : 'Missing'}`);
      
      if (user.customerProfile) {
        console.log(`   Customer ID in profile: ${user.customerProfile.customer_id}`);
        
        // Check if the customer exists
        const customer = await Customer.findById(user.customerProfile.customer_id);
        if (customer) {
          console.log('✅ Customer found via user profile:');
          console.log(`   ID: ${customer._id}`);
          console.log(`   Company: ${customer.companyName}`);
          console.log(`   Email: ${customer.email}`);
          console.log(`   User ID: ${customer.user_id}`);
        } else {
          console.log('❌ Customer NOT found via user profile');
        }
      }
    } else {
      console.log('❌ User not found');
    }

    // Search for any customer with similar email
    console.log('\n🔍 Searching for customers with similar email...');
    const similarCustomers = await Customer.find({
      $or: [
        { email: { $regex: 'abc', $options: 'i' } },
        { companyName: { $regex: 'abc', $options: 'i' } }
      ]
    });
    
    console.log(`Found ${similarCustomers.length} similar customers:`);
    similarCustomers.forEach((cust, index) => {
      console.log(`   ${index + 1}. ${cust.companyName} - ${cust.email} - ${cust.createdAt}`);
    });

    // Check recent customers
    console.log('\n📋 Recent Customers (Last 5):');
    const recentCustomers = await Customer.find()
      .sort({ createdAt: -1 })
      .limit(5);
    
    recentCustomers.forEach((cust, index) => {
      console.log(`   ${index + 1}. ${cust.companyName} - ${cust.email} - ${cust.createdAt}`);
    });

    // Check if there are any customers with user_id matching our user
    if (user) {
      console.log('\n🔍 Searching for customers with matching user_id...');
      const customerWithUserId = await Customer.findOne({ user_id: user._id });
      if (customerWithUserId) {
        console.log('✅ Customer found with matching user_id:');
        console.log(`   ID: ${customerWithUserId._id}`);
        console.log(`   Company: ${customerWithUserId.companyName}`);
        console.log(`   Email: ${customerWithUserId.email}`);
      } else {
        console.log('❌ No customer found with matching user_id');
      }
    }

    await mongoose.connection.close();
    console.log('\n✅ Debug completed');

  } catch (error) {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  }
}

debugCustomerCreation();
