const mongoose = require('mongoose');
require('dotenv').config();

// Import models and services
const User = require('./models/User');
const Notification = require('./models/Notification');
const Invoice = require('./models/Invoice');
const Order = require('./models/Order');
const OrderItemApproval = require('./models/OrderItemApproval');
const { generateToken } = require('./services/authService');

async function testFrontendBackendConnection() {
  try {
    console.log('🌐 FRONTEND-BACKEND CONNECTION TEST');
    console.log('====================================\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.CONNECTION_STRING || 'mongodb://localhost:27017/Ressichem', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'Ressichem'
    });
    console.log('✅ Database connected');

    // Test with different user types
    const testUsers = [
      'sales@ressichem.com', // Manager
      'companyadmin@samplecompany.com', // Company Admin
      'yousuf@gmail.com' // Customer
    ];

    for (const email of testUsers) {
      console.log(`\n👤 Testing with user: ${email}`);
      console.log('─'.repeat(50));

      const user = await User.findOne({ email });
      if (!user) {
        console.log('❌ User not found');
        continue;
      }

      // Generate token
      const token = await generateToken(user, "15m");
      console.log('✅ Token generated');

      // Test key API endpoints
      const endpoints = [
        { url: 'http://localhost:5000/api/orders', method: 'GET', name: 'Get Orders' },
        { url: 'http://localhost:5000/api/notifications/recent', method: 'GET', name: 'Get Notifications' },
        { url: 'http://localhost:5000/api/invoices', method: 'GET', name: 'Get Invoices' },
        { url: 'http://localhost:5000/api/orders/manager/pending-approvals', method: 'GET', name: 'Get Pending Approvals' }
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, {
            method: endpoint.method,
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          console.log(`   ${endpoint.name}: ${response.status} ${response.ok ? '✅' : '❌'}`);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.log(`      Error: ${errorText.substring(0, 100)}...`);
          }
        } catch (error) {
          console.log(`   ${endpoint.name}: ❌ Connection failed - ${error.message}`);
        }
      }
    }

    // Test specific functionality
    console.log('\n🔧 FUNCTIONALITY TESTS');
    console.log('======================');

    // Test manager permissions
    const manager = await User.findOne({ email: 'sales@ressichem.com' });
    if (manager) {
      const managerToken = await generateToken(manager, "15m");
      
      // Test discount update (this was the 403 error we fixed)
      try {
        const response = await fetch('http://localhost:5000/api/orders/update-discount', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${managerToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            approvalId: 'test-id', // This will fail but should not be 403
            discountAmount: 100,
            comments: 'Test'
          })
        });
        
        console.log(`   Discount Update API: ${response.status} ${response.status === 403 ? '❌ Still 403' : response.status === 500 ? '✅ 500 (expected - invalid ID)' : '✅'}`);
      } catch (error) {
        console.log(`   Discount Update API: ❌ ${error.message}`);
      }
    }

    // Test notification system
    const totalNotifications = await Notification.countDocuments();
    console.log(`   Notifications in DB: ${totalNotifications} ✅`);

    // Test invoice system
    const totalInvoices = await Invoice.countDocuments();
    console.log(`   Invoices in DB: ${totalInvoices} ✅`);

    // Test order system
    const totalOrders = await Order.countDocuments();
    const totalApprovals = await OrderItemApproval.countDocuments();
    console.log(`   Orders in DB: ${totalOrders} ✅`);
    console.log(`   Order Approvals in DB: ${totalApprovals} ✅`);

    console.log('\n✅ FRONTEND-BACKEND CONNECTION TEST COMPLETED');

  } catch (error) {
    console.error('❌ Error during connection test:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
testFrontendBackendConnection();
