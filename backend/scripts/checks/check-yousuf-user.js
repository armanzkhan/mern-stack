// Check if yousuf@gmail.com exists as a user for login
const mongoose = require('mongoose');
const User = require('./models/User');
const Customer = require('./models/Customer');

async function checkYousufUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB - Database: Ressichem');

    console.log('\n🔍 Checking yousuf@gmail.com:');
    
    // Check if user exists
    const user = await User.findOne({ email: 'yousuf@gmail.com' });
    if (user) {
      console.log('✅ User found:');
      console.log(`   ID: ${user._id}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Is Customer: ${user.isCustomer}`);
      console.log(`   Is Active: ${user.isActive}`);
      console.log(`   Password: ${user.password ? 'Set' : 'Not set'}`);
    } else {
      console.log('❌ User NOT found for login');
    }

    // Check if customer exists
    const customer = await Customer.findOne({ email: 'yousuf@gmail.com' });
    if (customer) {
      console.log('\n✅ Customer found:');
      console.log(`   ID: ${customer._id}`);
      console.log(`   Company: ${customer.companyName}`);
      console.log(`   Contact: ${customer.contactName}`);
      console.log(`   Email: ${customer.email}`);
      console.log(`   User ID: ${customer.user_id || 'Not linked'}`);
    } else {
      console.log('\n❌ Customer NOT found');
    }

    // Check all users with yousuf in email
    const yousufUsers = await User.find({ email: /yousuf/i });
    console.log(`\n🔍 All users with 'yousuf' in email: ${yousufUsers.length}`);
    yousufUsers.forEach((u, index) => {
      console.log(`   ${index + 1}. ${u.email} - ${u.firstName} ${u.lastName}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Check completed');

  } catch (error) {
    console.error('❌ Check failed:', error);
    process.exit(1);
  }
}

checkYousufUser();
