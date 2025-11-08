const mongoose = require('mongoose');
const Customer = require('./models/Customer');
const User = require('./models/User');

async function testCustomerUserMatch() {
  try {
    await mongoose.connect('mongodb://localhost:27017/Ressichem');
    console.log('✅ Connected to MongoDB');

    const users = await User.find();
    console.log(`\n📊 Found ${users.length} users:`);
    
    for (const user of users) {
      const customer = await Customer.findOne({ email: user.email });
      console.log(`User: ${user.email} -> Customer: ${customer ? customer.companyName : 'Not found'}`);
    }

    const customers = await Customer.find();
    console.log(`\n📊 Found ${customers.length} customers:`);
    
    for (const customer of customers) {
      const user = await User.findOne({ email: customer.email });
      console.log(`Customer: ${customer.email} -> User: ${user ? user.role : 'Not found'}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testCustomerUserMatch();

