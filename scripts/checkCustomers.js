const { connect, disconnect } = require('../config/_db');
const Customer = require('../models/Customer');

async function checkCustomers() {
  console.log('🔍 Checking Customers in Database...\n');
  
  try {
    await connect();
    console.log('✅ Connected to MongoDB');

    // Get all customers
    const customers = await Customer.find({}).sort({ createdAt: -1 });
    
    console.log(`📊 Total customers in database: ${customers.length}`);
    
    if (customers.length > 0) {
      console.log('\n👥 Customers:');
      customers.forEach((customer, index) => {
        console.log(`   ${index + 1}. ${customer.companyName}`);
        console.log(`      Contact: ${customer.contactName}`);
        console.log(`      Email: ${customer.email}`);
        console.log(`      Phone: ${customer.phone}`);
        console.log(`      Company ID: ${customer.company_id}`);
        console.log(`      Status: ${customer.status}`);
        console.log(`      Created: ${customer.createdAt}`);
        console.log('');
      });
    } else {
      console.log('\n❌ No customers found in database');
      console.log('   This explains why the orders create page shows no customers!');
      console.log('\n💡 To fix this:');
      console.log('   1. Create some customers through the /customers page');
      console.log('   2. Or add some test customers to the database');
    }

  } catch (error) {
    console.error('❌ Error checking customers:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  checkCustomers();
}

module.exports = checkCustomers;
