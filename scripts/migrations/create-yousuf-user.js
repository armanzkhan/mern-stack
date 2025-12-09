// Create user account for yousuf@gmail.com
const mongoose = require('mongoose');
const User = require('./models/User');
const Customer = require('./models/Customer');
const bcrypt = require('bcryptjs');

async function createYousufUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB - Database: Ressichem');

    // Find the customer record
    const customer = await Customer.findOne({ email: 'yousuf@gmail.com' });
    if (!customer) {
      console.log('❌ Customer yousuf@gmail.com not found');
      return;
    }

    console.log(`✅ Found customer: ${customer.companyName} (${customer.email})`);

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'yousuf@gmail.com' });
    if (existingUser) {
      console.log('⚠️ User already exists, updating...');
      
      // Update existing user
      existingUser.firstName = customer.contactName?.split(' ')[0] || 'Yousuf';
      existingUser.lastName = customer.contactName?.split(' ').slice(1).join(' ') || 'Ahmed';
      existingUser.phone = customer.phone;
      existingUser.role = 'Customer';
      existingUser.department = 'Customer';
      existingUser.company_id = 'RESSICHEM';
      existingUser.isCustomer = true;
      existingUser.isActive = true;
      existingUser.customerProfile = {
        customer_id: customer._id,
        companyName: customer.companyName,
        customerType: customer.customerType || 'regular',
        assignedManager: customer.assignedManager,
        preferences: customer.preferences
      };
      
      await existingUser.save();
      console.log('✅ User updated successfully');
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash('yousuf123', 10);
      
      const user = new User({
        user_id: `customer_${customer._id}`,
        email: customer.email,
        password: hashedPassword,
        firstName: customer.contactName?.split(' ')[0] || 'Yousuf',
        lastName: customer.contactName?.split(' ').slice(1).join(' ') || 'Ahmed',
        phone: customer.phone,
        role: 'Customer',
        department: 'Customer',
        company_id: 'RESSICHEM',
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
      console.log('✅ User created successfully');
    }

    // Update customer record with user_id
    const user = await User.findOne({ email: 'yousuf@gmail.com' });
    if (user) {
      customer.user_id = user._id;
      await customer.save();
      console.log('✅ Customer linked to user');
    }

    // Verify the user can be found
    const verifyUser = await User.findOne({ email: 'yousuf@gmail.com' });
    if (verifyUser) {
      console.log('\n✅ Login credentials for yousuf@gmail.com:');
      console.log(`   Email: ${verifyUser.email}`);
      console.log(`   Password: yousuf123`);
      console.log(`   Role: ${verifyUser.role}`);
      console.log(`   Is Active: ${verifyUser.isActive}`);
      console.log(`   Is Customer: ${verifyUser.isCustomer}`);
    }

    await mongoose.connection.close();
    console.log('\n✅ User account created successfully!');

  } catch (error) {
    console.error('❌ Failed to create user:', error);
    process.exit(1);
  }
}

createYousufUser();
