// Script to check for specific customer abc@xyz.com
const mongoose = require('mongoose');
const Customer = require('./models/Customer');
const User = require('./models/User');

async function checkSpecificCustomer() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB - Database: Ressichem');

    // Search for customer with email abc@xyz.com
    console.log('\n🔍 Searching for customer: abc@xyz.com');
    const customer = await Customer.findOne({ email: 'abc@xyz.com' });
    
    if (customer) {
      console.log('✅ Customer found in database:');
      console.log(`   ID: ${customer._id}`);
      console.log(`   Company Name: ${customer.companyName}`);
      console.log(`   Contact Name: ${customer.contactName}`);
      console.log(`   Email: ${customer.email}`);
      console.log(`   Phone: ${customer.phone}`);
      console.log(`   User ID: ${customer.user_id || 'Not linked'}`);
      console.log(`   Status: ${customer.status}`);
      console.log(`   Created: ${customer.createdAt}`);
    } else {
      console.log('❌ Customer abc@xyz.com NOT found in database');
    }

    // Search for user with email abc@xyz.com
    console.log('\n🔍 Searching for user: abc@xyz.com');
    const user = await User.findOne({ email: 'abc@xyz.com' });
    
    if (user) {
      console.log('✅ User found in database:');
      console.log(`   ID: ${user._id}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Is Customer: ${user.isCustomer}`);
      console.log(`   User Type: ${user.userType || 'Not set'}`);
      console.log(`   Company ID: ${user.company_id}`);
      console.log(`   Created: ${user.createdAt || 'Not set'}`);
    } else {
      console.log('❌ User abc@xyz.com NOT found in database');
    }

    // Check recent customers
    console.log('\n📋 Recent Customers (Last 10):');
    const recentCustomers = await Customer.find()
      .sort({ createdAt: -1 })
      .limit(10);
    
    recentCustomers.forEach((cust, index) => {
      console.log(`   ${index + 1}. ${cust.companyName} - ${cust.email} - ${cust.createdAt}`);
    });

    // Check recent users
    console.log('\n👤 Recent Users (Last 10):');
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10);
    
    recentUsers.forEach((usr, index) => {
      console.log(`   ${index + 1}. ${usr.firstName} ${usr.lastName} - ${usr.email} - Customer: ${usr.isCustomer}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Customer search completed');

  } catch (error) {
    console.error('❌ Customer search failed:', error);
    process.exit(1);
  }
}

checkSpecificCustomer();
