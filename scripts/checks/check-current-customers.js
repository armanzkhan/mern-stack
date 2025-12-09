// Script to check current customers in database
const mongoose = require('mongoose');
const Customer = require('./models/Customer');
const User = require('./models/User');

async function checkCurrentCustomers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB - Database: Ressichem');

    // Get all customers
    const customers = await Customer.find().sort({ createdAt: -1 });
    console.log(`📊 Total customers in database: ${customers.length}`);
    
    console.log('\n📋 Current Customers in Database:');
    customers.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.companyName} - ${customer.email}`);
      console.log(`   ID: ${customer._id}`);
      console.log(`   User ID: ${customer.user_id || 'Not linked'}`);
      console.log(`   Status: ${customer.status}`);
      console.log(`   Created: ${customer.createdAt}`);
      console.log('   ---');
    });

    // Check for users with customer profiles
    const customerUsers = await User.find({ isCustomer: true });
    console.log(`\n👤 Customer Users in Database: ${customerUsers.length}`);
    
    customerUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} - ${user.email}`);
      console.log(`   User ID: ${user._id}`);
      console.log(`   Is Customer: ${user.isCustomer}`);
      console.log(`   Customer Profile: ${user.customerProfile ? 'Exists' : 'Missing'}`);
      console.log('   ---');
    });

    await mongoose.connection.close();
    console.log('\n✅ Database check completed');

  } catch (error) {
    console.error('❌ Database check failed:', error);
    process.exit(1);
  }
}

checkCurrentCustomers();
