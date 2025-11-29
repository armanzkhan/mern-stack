const mongoose = require('mongoose');
const User = require('./models/User');
const Customer = require('./models/Customer');

async function createCustomerUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/Ressichem');
    console.log('✅ Connected to MongoDB');

    // Get the first customer
    const customer = await Customer.findOne();
    if (!customer) {
      console.log('❌ No customers found');
      return;
    }

    console.log(`👤 Found customer: ${customer.email} (${customer.companyName})`);

    // Check if user already exists
    const existingUser = await User.findOne({ email: customer.email });
    if (existingUser) {
      console.log('✅ User already exists for this customer');
      return;
    }

    // Create user account for customer
    const user = new User({
      user_id: `customer_${customer._id}`,
      email: customer.email,
      password: 'customer123', // Default password
      firstName: customer.contactName?.split(' ')[0] || 'Customer',
      lastName: customer.contactName?.split(' ').slice(1).join(' ') || 'User',
      role: 'Customer',
      isActive: true,
      company_id: customer.company_id || 'RESSICHEM'
    });

    await user.save();
    console.log('✅ Created user account for customer:', {
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      role: user.role
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

createCustomerUser();
