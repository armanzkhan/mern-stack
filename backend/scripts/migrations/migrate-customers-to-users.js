const mongoose = require('mongoose');
const User = require('./models/User');
const Customer = require('./models/Customer');

async function migrateCustomersToUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/Ressichem');
    console.log('✅ Connected to MongoDB');

    // Get all customers
    const customers = await Customer.find();
    console.log(`📊 Found ${customers.length} customers to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const customer of customers) {
      try {
        // Check if user already exists for this customer
        const existingUser = await User.findOne({ 
          email: customer.email,
          isCustomer: true 
        });

        if (existingUser) {
          console.log(`⏭️ User already exists for customer: ${customer.email}`);
          skippedCount++;
          continue;
        }

        // Create user for customer
        const user = new User({
          user_id: `customer_${customer._id}`,
          email: customer.email,
          password: 'customer123', // Default password
          firstName: customer.contactName?.split(' ')[0] || 'Customer',
          lastName: customer.contactName?.split(' ').slice(1).join(' ') || 'User',
          phone: customer.phone,
          role: 'Customer',
          department: 'Customer',
          company_id: customer.company_id || 'RESSICHEM',
          isCustomer: true,
          isActive: customer.status === 'active',
          customerProfile: {
            customer_id: customer._id,
            companyName: customer.companyName,
            customerType: customer.customerType || 'regular',
            assignedManager: customer.assignedManager,
            preferences: customer.preferences
          }
        });

        await user.save();
        console.log(`✅ Created user for customer: ${customer.email} (${customer.companyName})`);
        migratedCount++;

      } catch (error) {
        console.error(`❌ Failed to migrate customer ${customer.email}:`, error.message);
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`✅ Successfully migrated: ${migratedCount} customers`);
    console.log(`⏭️ Skipped (already exist): ${skippedCount} customers`);
    console.log(`❌ Failed: ${customers.length - migratedCount - skippedCount} customers`);

  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

migrateCustomersToUsers();
