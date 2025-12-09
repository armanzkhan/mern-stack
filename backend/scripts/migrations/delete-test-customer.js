// Test script to delete a customer and verify frontend refresh
const mongoose = require('mongoose');
const Customer = require('./models/Customer');
const User = require('./models/User');

async function deleteTestCustomer() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB - Database: Ressichem');

    // Find a customer to delete
    const customerToDelete = await Customer.findOne();
    if (!customerToDelete) {
      console.log('❌ No customers found to delete');
      return;
    }

    console.log(`🗑️ Deleting customer: ${customerToDelete.companyName} (${customerToDelete.email})`);

    // Delete the customer
    await Customer.findByIdAndDelete(customerToDelete._id);
    console.log('✅ Customer deleted from database');

    // Delete corresponding user if exists
    const userToDelete = await User.findOne({ 
      'customerProfile.customer_id': customerToDelete._id 
    });
    
    if (userToDelete) {
      await User.findByIdAndDelete(userToDelete._id);
      console.log('✅ Corresponding user deleted');
    }

    // Check final counts
    const finalCustomerCount = await Customer.countDocuments();
    const finalUserCount = await User.countDocuments();
    
    console.log(`📊 Final counts:`);
    console.log(`   Customers: ${finalCustomerCount}`);
    console.log(`   Users: ${finalUserCount}`);

    await mongoose.connection.close();
    console.log('\n✅ Customer deletion test completed');
    console.log('🔄 The frontend should now refresh automatically within 30 seconds');

  } catch (error) {
    console.error('❌ Customer deletion test failed:', error);
    process.exit(1);
  }
}

deleteTestCustomer();
