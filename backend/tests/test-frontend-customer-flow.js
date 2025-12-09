// Test script to simulate the exact frontend customer creation flow
const mongoose = require('mongoose');
const Customer = require('./models/Customer');
const User = require('./models/User');
const Notification = require('./models/Notification');

async function testFrontendCustomerFlow() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB - Database: Ressichem');

    // Simulate the exact data that would come from frontend form
    console.log('\n🧪 Simulating frontend customer creation flow...');
    
    const frontendFormData = {
      companyName: 'ABC Company',
      contactName: 'ABC Contact',
      email: 'abc@xyz.com',
      phone: '+923001234567',
      street: 'ABC Street',
      city: 'ABC City',
      state: 'ABC State',
      zip: '12345',
      country: 'Pakistan',
      company_id: 'RESSICHEM'
    };

    console.log('📝 Frontend form data:', frontendFormData);

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ email: 'abc@xyz.com' });
    if (existingCustomer) {
      console.log('⚠️ Customer already exists:', existingCustomer._id);
      console.log('   Company:', existingCustomer.companyName);
      console.log('   Email:', existingCustomer.email);
      console.log('   User ID:', existingCustomer.user_id);
      return;
    }

    // Simulate the backend customer controller logic
    console.log('\n🔧 Simulating backend customer controller...');
    
    const companyId = 'RESSICHEM';
    const customerData = {
      ...frontendFormData,
      company_id: companyId,
      createdBy: 'frontend_user'
    };
    
    // Create customer
    const customer = new Customer(customerData);
    await customer.save();
    console.log('✅ Customer created in backend:', customer._id);

    // Create corresponding User record for customer
    try {
      const user = new User({
        user_id: `customer_${customer._id}`,
        email: customer.email,
        password: 'customer123', // Default password
        firstName: customer.contactName?.split(' ')[0] || 'Customer',
        lastName: customer.contactName?.split(' ').slice(1).join(' ') || 'User',
        phone: customer.phone,
        role: 'Customer',
        department: 'Customer',
        company_id: companyId,
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
      console.log('✅ Created user account for customer:', user.email);
      
      // Update customer record with user_id
      customer.user_id = user._id;
      await customer.save();
      console.log('✅ Linked customer to user:', user._id);
    } catch (userError) {
      console.error('⚠️ Failed to create user for customer:', userError.message);
    }
    
    // Create notification
    try {
      const notification = new Notification({
        title: 'New Customer Added',
        message: `Customer ${customer.companyName} has been added`,
        type: 'success',
        priority: 'medium',
        targetType: 'company',
        targetIds: [companyId],
        company_id: companyId,
        sender_id: 'system',
        sender_name: 'System',
        data: {
          entityType: 'customer',
          entityId: customer._id,
          action: 'created',
          url: '/customers'
        }
      });
      
      await notification.save();
      console.log('✅ Customer creation notification created');
    } catch (notificationError) {
      console.error("Failed to create customer notification:", notificationError);
    }

    // Verify the complete flow
    console.log('\n✅ Verification:');
    const finalCustomer = await Customer.findOne({ email: 'abc@xyz.com' });
    const finalUser = await User.findOne({ email: 'abc@xyz.com' });
    const latestNotification = await Notification.findOne().sort({ createdAt: -1 });
    
    console.log(`   Customer in DB: ${finalCustomer ? '✅' : '❌'}`);
    console.log(`   User in DB: ${finalUser ? '✅' : '❌'}`);
    console.log(`   Customer-User linked: ${finalCustomer?.user_id?.toString() === finalUser?._id.toString() ? '✅' : '❌'}`);
    console.log(`   Notification created: ${latestNotification ? '✅' : '❌'}`);

    if (finalCustomer) {
      console.log('\n📋 Final Customer Details:');
      console.log(`   ID: ${finalCustomer._id}`);
      console.log(`   Company: ${finalCustomer.companyName}`);
      console.log(`   Contact: ${finalCustomer.contactName}`);
      console.log(`   Email: ${finalCustomer.email}`);
      console.log(`   User ID: ${finalCustomer.user_id}`);
      console.log(`   Status: ${finalCustomer.status}`);
      console.log(`   Created: ${finalCustomer.createdAt}`);
    }

    await mongoose.connection.close();
    console.log('\n✅ Frontend customer flow simulation completed successfully');

  } catch (error) {
    console.error('❌ Frontend customer flow simulation failed:', error);
    process.exit(1);
  }
}

testFrontendCustomerFlow();
