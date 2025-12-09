// Script to check customers in database
const mongoose = require('mongoose');
const Customer = require('./models/Customer');
const User = require('./models/User');

async function checkCustomers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB');

    // Check customers
    const customers = await Customer.find().sort({ createdAt: -1 });
    console.log('\n👥 Customers in Database:');
    console.log('Total customers:', customers.length);
    
    customers.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.companyName} - ${customer.contactName}`);
      console.log(`   Email: ${customer.email}`);
      console.log(`   Phone: ${customer.phone}`);
      console.log(`   Company ID: ${customer.company_id}`);
      console.log(`   User ID: ${customer.user_id}`);
      console.log(`   Status: ${customer.status}`);
      console.log(`   Created: ${customer.createdAt}`);
      console.log('   ---');
    });

    // Check users with customer type
    const customerUsers = await User.find({ 
      $or: [
        { userType: 'customer' },
        { isCustomer: true }
      ]
    }).sort({ createdAt: -1 });

    console.log('\n👤 Customer Users:');
    console.log('Total customer users:', customerUsers.length);
    
    customerUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} - ${user.email}`);
      console.log(`   User Type: ${user.userType}`);
      console.log(`   Is Customer: ${user.isCustomer}`);
      console.log(`   Company ID: ${user.company_id}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('   ---');
    });

    await mongoose.connection.close();
    console.log('\n✅ Customer check completed');

  } catch (error) {
    console.error('❌ Customer check failed:', error);
    process.exit(1);
  }
}

checkCustomers();
