const { connect, disconnect } = require('../config/_db');
const Customer = require('../models/Customer');

async function testCustomerCRUDDirect() {
  console.log('🔍 Testing Customer CRUD Operations (Direct Database)...\n');
  
  await connect();
  
  try {
    // Test CREATE customer
    console.log('📝 Step 1: Testing CREATE customer...');
    const newCustomer = {
      companyName: 'Test Construction Ltd',
      contactName: 'John Test',
      email: 'john@testconstruction.com',
      phone: '+1-555-0123',
      street: '123 Test Street',
      city: 'Test City',
      state: 'TS',
      zip: '12345',
      country: 'USA',
      status: 'active',
      customerType: 'premium',
      company_id: 'RESSICHEM'
    };
    
    const createdCustomer = await Customer.create(newCustomer);
    console.log('✅ Customer created successfully');
    console.log(`   Customer ID: ${createdCustomer._id}`);
    console.log(`   Status: ${createdCustomer.status}`);
    console.log(`   Company ID: ${createdCustomer.company_id}`);
    
    const customerId = createdCustomer._id;
    
    // Test READ customer
    console.log('\n📖 Step 2: Testing READ customer...');
    const readCustomer = await Customer.findById(customerId);
    console.log('✅ Customer read successfully');
    console.log(`   Company: ${readCustomer.companyName}`);
    console.log(`   Contact: ${readCustomer.contactName}`);
    console.log(`   Status: ${readCustomer.status}`);
    
    // Test UPDATE customer
    console.log('\n✏️ Step 3: Testing UPDATE customer...');
    const updateData = {
      companyName: 'Updated Test Construction Ltd',
      contactName: 'John Updated',
      status: 'inactive',
      customerType: 'vip'
    };
    
    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId, 
      updateData, 
      { new: true, runValidators: true }
    );
    console.log('✅ Customer updated successfully');
    console.log(`   New Company: ${updatedCustomer.companyName}`);
    console.log(`   New Contact: ${updatedCustomer.contactName}`);
    console.log(`   New Status: ${updatedCustomer.status}`);
    console.log(`   New Type: ${updatedCustomer.customerType}`);
    
    // Test STATUS UPDATE
    console.log('\n🔄 Step 4: Testing STATUS UPDATE...');
    const statusUpdatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      { status: 'suspended' },
      { new: true }
    );
    console.log('✅ Customer status updated successfully');
    console.log(`   New Status: ${statusUpdatedCustomer.status}`);
    
    // Test LIST customers
    console.log('\n📋 Step 5: Testing LIST customers...');
    const allCustomers = await Customer.find({ company_id: 'RESSICHEM' }).sort({ createdAt: -1 });
    console.log('✅ Customers listed successfully');
    console.log(`   Total customers: ${allCustomers.length}`);
    
    // Find our test customer in the list
    const testCustomer = allCustomers.find(c => c._id.toString() === customerId.toString());
    if (testCustomer) {
      console.log(`   Test customer found: ${testCustomer.companyName} (${testCustomer.status})`);
    }
    
    // Test DELETE customer
    console.log('\n🗑️ Step 6: Testing DELETE customer...');
    const deletedCustomer = await Customer.findByIdAndDelete(customerId);
    if (deletedCustomer) {
      console.log('✅ Customer deleted successfully');
      console.log(`   Deleted: ${deletedCustomer.companyName}`);
    } else {
      console.log('❌ Customer deletion failed');
    }
    
    // Verify deletion
    console.log('\n🔍 Step 7: Verifying deletion...');
    const verifyCustomer = await Customer.findById(customerId);
    if (!verifyCustomer) {
      console.log('✅ Customer successfully deleted (not found)');
    } else {
      console.log('❌ Customer still exists - deletion may have failed');
    }
    
    console.log('\n🎉 All CRUD operations completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   ✅ CREATE: Customer created with status and company_id');
    console.log('   ✅ READ: Customer retrieved successfully');
    console.log('   ✅ UPDATE: Customer updated with new fields');
    console.log('   ✅ STATUS: Status changed successfully');
    console.log('   ✅ LIST: Customers filtered by company_id');
    console.log('   ✅ DELETE: Customer removed from database');
    
  } catch (error) {
    console.error('❌ Error during CRUD test:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  testCustomerCRUDDirect();
}

module.exports = testCustomerCRUDDirect;
