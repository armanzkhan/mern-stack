// Script to check all customers and their status
const mongoose = require('mongoose');
const Customer = require('./models/Customer');
const User = require('./models/User');

async function checkAllCustomers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB - Database: Ressichem');

    // Get total count
    const totalCustomers = await Customer.countDocuments();
    console.log(`📊 Total customers in database: ${totalCustomers}`);

    // Get all customers
    const allCustomers = await Customer.find().sort({ createdAt: -1 });
    console.log('\n📋 All Customers:');
    
    allCustomers.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.companyName} - ${customer.email}`);
      console.log(`   ID: ${customer._id}`);
      console.log(`   User ID: ${customer.user_id || 'Not linked'}`);
      console.log(`   Status: ${customer.status}`);
      console.log(`   Created: ${customer.createdAt}`);
      console.log('   ---');
    });

    // Check for users with customer profiles but no corresponding customer
    console.log('\n🔍 Users with customer profiles:');
    const customerUsers = await User.find({ isCustomer: true });
    
    customerUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} - ${user.email}`);
      console.log(`   User ID: ${user._id}`);
      console.log(`   Customer Profile: ${user.customerProfile ? 'Exists' : 'Missing'}`);
      
      if (user.customerProfile && user.customerProfile.customer_id) {
        console.log(`   Referenced Customer ID: ${user.customerProfile.customer_id}`);
        
        // Check if the referenced customer exists
        Customer.findById(user.customerProfile.customer_id).then(customer => {
          if (customer) {
            console.log(`   ✅ Referenced customer exists: ${customer.companyName}`);
          } else {
            console.log(`   ❌ Referenced customer NOT found`);
          }
        });
      }
      console.log('   ---');
    });

    await mongoose.connection.close();
    console.log('\n✅ Customer check completed');

  } catch (error) {
    console.error('❌ Customer check failed:', error);
    process.exit(1);
  }
}

checkAllCustomers();
