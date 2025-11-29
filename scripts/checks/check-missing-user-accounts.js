// Check which customers don't have user accounts for login
const mongoose = require('mongoose');
const User = require('./models/User');
const Customer = require('./models/Customer');

async function checkMissingUserAccounts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB - Database: Ressichem');

    console.log('\n🔍 Checking customers without user accounts:');
    
    // Get all customers
    const customers = await Customer.find();
    console.log(`📊 Total customers: ${customers.length}`);
    
    // Check which customers don't have user accounts
    const customersWithoutUsers = [];
    
    for (const customer of customers) {
      const user = await User.findOne({ email: customer.email });
      if (!user) {
        customersWithoutUsers.push(customer);
      }
    }
    
    console.log(`❌ Customers without user accounts: ${customersWithoutUsers.length}`);
    
    customersWithoutUsers.forEach((customer, index) => {
      console.log(`   ${index + 1}. ${customer.companyName} - ${customer.email}`);
    });
    
    // Check which users don't have customer records
    const users = await User.find({ isCustomer: true });
    console.log(`\n👤 Customer users: ${users.length}`);
    
    const usersWithoutCustomers = [];
    for (const user of users) {
      if (user.customerProfile?.customer_id) {
        const customer = await Customer.findById(user.customerProfile.customer_id);
        if (!customer) {
          usersWithoutCustomers.push(user);
        }
      }
    }
    
    console.log(`❌ Users without customer records: ${usersWithoutCustomers.length}`);
    
    usersWithoutCustomers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.firstName} ${user.lastName} - ${user.email}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Check completed');

  } catch (error) {
    console.error('❌ Check failed:', error);
    process.exit(1);
  }
}

checkMissingUserAccounts();
