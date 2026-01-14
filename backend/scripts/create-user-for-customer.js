// Script to create a User record for an existing customer
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Customer = require('../models/Customer');

const MONGODB_URI = process.env.CONNECTION_STRING || process.env.MONGODB_URI || 'mongodb+srv://armanzaman4_db_user:1JJORz7jP2VFgTaP@cluster0.qn1babq.mongodb.net/Ressichem?retryWrites=true&w=majority';

async function createUserForCustomer(customerEmail, password) {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find the customer
    const customer = await Customer.findOne({ email: customerEmail });
    if (!customer) {
      console.error(`❌ Customer not found with email: ${customerEmail}`);
      process.exit(1);
    }

    console.log('✅ Customer found:', {
      email: customer.email,
      companyName: customer.companyName,
      contactName: customer.contactName,
      company_id: customer.company_id,
      user_id: customer.user_id
    });

    // Check if User already exists
    const existingUser = await User.findOne({ 
      email: customerEmail,
      company_id: customer.company_id 
    });

    if (existingUser) {
      console.log('⚠️ User already exists for this customer:', {
        user_id: existingUser.user_id,
        email: existingUser.email,
        isCustomer: existingUser.isCustomer
      });

      // Update password if provided
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUser.password = hashedPassword;
        await existingUser.save();
        console.log('✅ Password updated for existing user');
      }

      // Link customer to user if not already linked
      if (!customer.user_id || customer.user_id.toString() !== existingUser._id.toString()) {
        customer.user_id = existingUser._id;
        await customer.save();
        console.log('✅ Linked customer to existing user');
      }

      process.exit(0);
    }

    // Create new User record
    if (!password) {
      console.error('❌ Password is required to create a new user');
      console.log('Usage: node create-user-for-customer.js <email> <password>');
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      user_id: `customer_${customer._id}`,
      email: customer.email,
      password: hashedPassword,
      firstName: customer.contactName?.split(' ')[0] || 'Customer',
      lastName: customer.contactName?.split(' ').slice(1).join(' ') || 'User',
      phone: customer.phone,
      role: 'Customer',
      department: 'Customer',
      company_id: customer.company_id,
      isCustomer: true,
      isActive: true,
      customerProfile: {
        customer_id: customer._id,
        companyName: customer.companyName,
        customerType: customer.customerType || 'regular',
        assignedManager: customer.assignedManager,
        preferences: customer.preferences
      }
    });

    await user.save();
    console.log('✅ User created successfully:', {
      user_id: user.user_id,
      email: user.email,
      company_id: user.company_id
    });

    // Link customer to user
    customer.user_id = user._id;
    await customer.save();
    console.log('✅ Linked customer to user');

    console.log('\n✅ Success! Customer can now log in with:');
    console.log(`   Email: ${customerEmail}`);
    console.log(`   Password: ${password}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Get command line arguments
const customerEmail = process.argv[2];
const password = process.argv[3];

if (!customerEmail) {
  console.error('❌ Customer email is required');
  console.log('Usage: node create-user-for-customer.js <email> <password>');
  process.exit(1);
}

createUserForCustomer(customerEmail, password);

