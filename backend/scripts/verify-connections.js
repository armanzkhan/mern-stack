require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { connect, disconnect } = require('../config/_db');
const mongoose = require('mongoose');

// Import models to test
const User = require('../models/User');
const Customer = require('../models/Customer');
const Manager = require('../models/Manager');
const Order = require('../models/Order');
const OrderItemApproval = require('../models/OrderItemApproval');
const Product = require('../models/Product');
const Notification = require('../models/Notification');

async function verifyConnections() {
  console.log('🔍 VERIFYING SYSTEM CONNECTIONS');
  console.log('='.repeat(80));
  console.log();

  let allChecksPassed = true;

  // 1. Database Connection
  console.log('1️⃣ DATABASE CONNECTION');
  console.log('-'.repeat(80));
  try {
    await connect();
    const dbState = mongoose.connection.readyState;
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    console.log(`✅ Database connection: ${dbStates[dbState] || 'unknown'}`);
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Port: ${mongoose.connection.port}`);
  } catch (error) {
    console.log(`❌ Database connection failed: ${error.message}`);
    allChecksPassed = false;
  }
  console.log();

  // 2. Model Access Tests
  console.log('2️⃣ MODEL ACCESS TESTS');
  console.log('-'.repeat(80));
  const models = [
    { name: 'User', model: User },
    { name: 'Customer', model: Customer },
    { name: 'Manager', model: Manager },
    { name: 'Order', model: Order },
    { name: 'OrderItemApproval', model: OrderItemApproval },
    { name: 'Product', model: Product },
    { name: 'Notification', model: Notification }
  ];

  for (const { name, model } of models) {
    try {
      const count = await model.countDocuments();
      console.log(`✅ ${name}: ${count} documents found`);
    } catch (error) {
      console.log(`❌ ${name}: Error - ${error.message}`);
      allChecksPassed = false;
    }
  }
  console.log();

  // 3. Key Data Verification
  console.log('3️⃣ KEY DATA VERIFICATION');
  console.log('-'.repeat(80));
  
  // Check for test customer
  try {
    const customer = await Customer.findOne({ email: 'zamar@gmail.com' });
    if (customer) {
      console.log(`✅ Customer "zamar@gmail.com" found`);
      console.log(`   ID: ${customer._id}`);
      console.log(`   Company: ${customer.companyName}`);
      console.log(`   Assigned Managers: ${customer.assignedManagers?.length || 0}`);
    } else {
      console.log(`⚠️ Customer "zamar@gmail.com" not found`);
    }
  } catch (error) {
    console.log(`❌ Error checking customer: ${error.message}`);
    allChecksPassed = false;
  }

  // Check for test manager
  try {
    const managerUser = await User.findOne({ email: 'shah@ressichem.com' });
    if (managerUser) {
      console.log(`✅ Manager "shah@ressichem.com" found`);
      console.log(`   User ID: ${managerUser._id}`);
      console.log(`   user_id: ${managerUser.user_id}`);
      console.log(`   isManager: ${managerUser.isManager}`);
      console.log(`   Categories in User.managerProfile: ${managerUser.managerProfile?.assignedCategories?.length || 0}`);
      
      const managerRecord = await Manager.findOne({ user_id: managerUser.user_id });
      if (managerRecord) {
        console.log(`✅ Manager record found`);
        console.log(`   Manager ID: ${managerRecord._id}`);
        console.log(`   Categories in Manager record: ${managerRecord.assignedCategories?.length || 0}`);
      } else {
        console.log(`⚠️ Manager record not found for user_id: ${managerUser.user_id}`);
      }
    } else {
      console.log(`⚠️ Manager "shah@ressichem.com" not found`);
    }
  } catch (error) {
    console.log(`❌ Error checking manager: ${error.message}`);
    allChecksPassed = false;
  }

  // Check recent orders
  try {
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('customer', 'email companyName');
    console.log(`✅ Recent orders: ${recentOrders.length} found`);
    recentOrders.forEach((order, idx) => {
      console.log(`   [${idx + 1}] ${order.orderNumber} - Customer: ${order.customer?.email || 'N/A'} - Created: ${order.createdAt}`);
    });
  } catch (error) {
    console.log(`❌ Error checking orders: ${error.message}`);
    allChecksPassed = false;
  }

  // Check approvals
  try {
    const totalApprovals = await OrderItemApproval.countDocuments({});
    const pendingApprovals = await OrderItemApproval.countDocuments({ status: 'pending' });
    console.log(`✅ Order Item Approvals: ${totalApprovals} total, ${pendingApprovals} pending`);
  } catch (error) {
    console.log(`❌ Error checking approvals: ${error.message}`);
    allChecksPassed = false;
  }
  console.log();

  // 4. Backend API Configuration
  console.log('4️⃣ BACKEND API CONFIGURATION');
  console.log('-'.repeat(80));
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  console.log(`   Backend URL: ${backendUrl}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log();

  // 5. Test Backend API Endpoint (if server is running)
  console.log('5️⃣ BACKEND API CONNECTIVITY TEST');
  console.log('-'.repeat(80));
  try {
    const healthCheck = await fetch(`${backendUrl}/api/health`).catch(() => null);
    if (healthCheck && healthCheck.ok) {
      console.log(`✅ Backend API is accessible at ${backendUrl}`);
    } else {
      console.log(`⚠️ Backend API health check failed (server may not be running)`);
      console.log(`   This is normal if the backend server is not currently running`);
    }
  } catch (error) {
    console.log(`⚠️ Cannot test backend API connectivity: ${error.message}`);
    console.log(`   This is normal if the backend server is not currently running`);
  }
  console.log();

  // 6. Frontend Configuration
  console.log('6️⃣ FRONTEND CONFIGURATION');
  console.log('-'.repeat(80));
  console.log(`   Frontend should be running on: http://localhost:3000`);
  console.log(`   Backend API URL: ${backendUrl}`);
  console.log(`   Make sure NEXT_PUBLIC_BACKEND_URL is set in frontend/.env.local`);
  console.log();

  // 7. Data Consistency Checks
  console.log('7️⃣ DATA CONSISTENCY CHECKS');
  console.log('-'.repeat(80));
  
  // Check if customer-manager assignment is consistent
  try {
    const customer = await Customer.findOne({ email: 'zamar@gmail.com' });
    const managerUser = await User.findOne({ email: 'shah@ressichem.com' });
    
    if (customer && managerUser) {
      const managerRecord = await Manager.findOne({ user_id: managerUser.user_id });
      
      if (customer.assignedManager?.manager_id || customer.assignedManagers?.length > 0) {
        console.log(`✅ Customer has manager assignment`);
        
        // Check if manager record matches
        if (managerRecord) {
          const customerManagerId = customer.assignedManager?.manager_id || customer.assignedManagers?.[0]?.manager_id;
          if (customerManagerId && customerManagerId.toString() === managerRecord._id.toString()) {
            console.log(`✅ Customer-manager assignment is consistent`);
          } else {
            console.log(`⚠️ Customer-manager assignment may be inconsistent`);
            console.log(`   Customer assignedManager: ${customerManagerId}`);
            console.log(`   Manager record ID: ${managerRecord._id}`);
          }
        }
      } else {
        console.log(`⚠️ Customer has no manager assignment`);
      }
    }
  } catch (error) {
    console.log(`❌ Error checking data consistency: ${error.message}`);
    allChecksPassed = false;
  }
  console.log();

  // 8. Summary
  console.log('='.repeat(80));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(80));
  
  if (allChecksPassed) {
    console.log('✅ All checks passed!');
    console.log();
    console.log('✅ Database connection: OK');
    console.log('✅ Model access: OK');
    console.log('✅ Data verification: OK');
    console.log();
    console.log('📝 Next steps:');
    console.log('   1. Make sure backend server is running: npm run dev (in backend/)');
    console.log('   2. Make sure frontend server is running: npm run dev (in frontend/)');
    console.log('   3. Test creating an order as customer "zamar@gmail.com"');
    console.log('   4. Check if manager "shah@ressichem.com" can see the order');
  } else {
    console.log('⚠️ Some checks failed. Please review the errors above.');
  }
  console.log();

  await disconnect();
}

verifyConnections().catch(error => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});

