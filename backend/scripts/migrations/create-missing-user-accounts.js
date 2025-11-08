// Create user accounts for customers who don't have login access
const mongoose = require('mongoose');
const User = require('./models/User');
const Customer = require('./models/Customer');
const bcrypt = require('bcryptjs');

async function createMissingUserAccounts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB - Database: Ressichem');

    // Get customers without user accounts
    const customers = await Customer.find();
    const customersWithoutUsers = [];
    
    for (const customer of customers) {
      const user = await User.findOne({ email: customer.email });
      if (!user) {
        customersWithoutUsers.push(customer);
      }
    }
    
    console.log(`📊 Found ${customersWithoutUsers.length} customers without user accounts`);
    
    // Create user accounts for each customer
    for (const customer of customersWithoutUsers) {
      try {
        const hashedPassword = await bcrypt.hash('customer123', 10);
        
        const user = new User({
          user_id: `customer_${customer._id}`,
          email: customer.email,
          password: hashedPassword,
          firstName: customer.contactName?.split(' ')[0] || 'Customer',
          lastName: customer.contactName?.split(' ').slice(1).join(' ') || 'User',
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
        console.log(`✅ Created user for: ${customer.companyName} (${customer.email})`);
        
        // Link customer to user
        customer.user_id = user._id;
        await customer.save();
        console.log(`   Linked customer to user`);
        
      } catch (error) {
        console.error(`❌ Failed to create user for ${customer.email}:`, error.message);
      }
    }
    
    // Show login credentials
    console.log('\n🔑 LOGIN CREDENTIALS FOR CUSTOMERS:');
    const createdUsers = await User.find({ isCustomer: true, email: { $in: customersWithoutUsers.map(c => c.email) } });
    
    createdUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} - Password: customer123`);
    });

    await mongoose.connection.close();
    console.log('\n✅ User accounts created successfully!');

  } catch (error) {
    console.error('❌ Failed to create user accounts:', error);
    process.exit(1);
  }
}

createMissingUserAccounts();
