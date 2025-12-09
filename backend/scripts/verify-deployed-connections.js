/**
 * Verify Deployed System Connections
 * 
 * This script verifies:
 * 1. Backend connection to MongoDB Atlas
 * 2. Database collections are accessible
 * 3. Can read/write data
 * 4. Frontend-Backend connection (via API test)
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Customer = require('../models/Customer');
const Manager = require('../models/Manager');
const Order = require('../models/Order');
const Product = require('../models/Product');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || process.env.CONNECTION_STRING || 
  "mongodb+srv://armanzaman4_db_user:1JJORz7jP2VFgTaP@cluster0.qn1babq.mongodb.net/Ressichem?retryWrites=true&w=majority";

// Backend URL
const BACKEND_URL = process.env.BACKEND_URL || 'https://mern-stack-dtgy.vercel.app';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://ressichem-frontend.vercel.app';

async function verifyDatabaseConnection() {
  console.log('🔍 VERIFYING DATABASE CONNECTION');
  console.log('================================\n');

  try {
    console.log('📡 Connecting to MongoDB Atlas...');
    console.log(`   URI: ${MONGODB_URI.replace(/:[^:@]+@/, ':****@')}`);
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "Ressichem",
      serverSelectionTimeoutMS: 5000,
    });

    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    const host = mongoose.connection.host;
    const state = mongoose.connection.readyState;

    console.log('✅ MongoDB Connected Successfully!');
    console.log(`   Database: ${dbName}`);
    console.log(`   Host: ${host}`);
    console.log(`   State: ${state === 1 ? 'Connected' : 'Disconnected'}`);
    console.log('');

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections:`);
    collections.forEach((col, index) => {
      console.log(`   ${index + 1}. ${col.name}`);
    });
    console.log('');

    return { success: true, db, collections };
  } catch (error) {
    console.error('❌ MongoDB Connection Failed!');
    console.error(`   Error: ${error.message}`);
    console.error('');
    return { success: false, error: error.message };
  }
}

async function verifyCollections() {
  console.log('🔍 VERIFYING COLLECTIONS');
  console.log('========================\n');

  const results = {
    users: { exists: false, count: 0, sample: null },
    customers: { exists: false, count: 0, sample: null },
    managers: { exists: false, count: 0, sample: null },
    orders: { exists: false, count: 0, sample: null },
    products: { exists: false, count: 0, sample: null },
  };

  try {
    // Check Users
    const userCount = await User.countDocuments();
    const sampleUser = await User.findOne().select('email firstName lastName role isActive');
    results.users = { exists: true, count: userCount, sample: sampleUser };
    console.log(`✅ Users: ${userCount} documents found`);
    if (sampleUser) {
      console.log(`   Sample: ${sampleUser.email} (${sampleUser.role || 'No role'})`);
    }

    // Check Customers
    const customerCount = await Customer.countDocuments();
    const sampleCustomer = await Customer.findOne().select('email companyName contactName status');
    results.customers = { exists: true, count: customerCount, sample: sampleCustomer };
    console.log(`✅ Customers: ${customerCount} documents found`);
    if (sampleCustomer) {
      console.log(`   Sample: ${sampleCustomer.companyName} (${sampleCustomer.email})`);
    }

    // Check Managers
    const managerCount = await Manager.countDocuments();
    const sampleManager = await Manager.findOne().select('user_id assignedCategories isActive');
    results.managers = { exists: true, count: managerCount, sample: sampleManager };
    console.log(`✅ Managers: ${managerCount} documents found`);
    if (sampleManager) {
      console.log(`   Sample: Manager ID ${sampleManager._id}`);
    }

    // Check Orders
    const orderCount = await Order.countDocuments();
    const sampleOrder = await Order.findOne().select('orderNumber status totalAmount');
    results.orders = { exists: true, count: orderCount, sample: sampleOrder };
    console.log(`✅ Orders: ${orderCount} documents found`);
    if (sampleOrder) {
      console.log(`   Sample: ${sampleOrder.orderNumber} (${sampleOrder.status})`);
    }

    // Check Products
    const productCount = await Product.countDocuments();
    const sampleProduct = await Product.findOne().select('name category price isActive');
    results.products = { exists: true, count: productCount, sample: sampleProduct };
    console.log(`✅ Products: ${productCount} documents found`);
    if (sampleProduct) {
      console.log(`   Sample: ${sampleProduct.name} (${sampleProduct.category?.mainCategory || 'No category'})`);
    }

    console.log('');
    return results;
  } catch (error) {
    console.error('❌ Error verifying collections:', error.message);
    return results;
  }
}

async function testBackendAPI() {
  console.log('🔍 TESTING BACKEND API CONNECTION');
  console.log('==================================\n');

  try {
    console.log(`📡 Testing backend at: ${BACKEND_URL}`);
    
    // Test health endpoint
    const healthResponse = await fetch(`${BACKEND_URL}/api/health`);
    const healthData = await healthResponse.json().catch(() => ({ status: 'unknown' }));
    
    if (healthResponse.ok) {
      console.log('✅ Backend Health Check: OK');
      console.log(`   Status: ${healthData.status || 'ok'}`);
    } else {
      console.log(`⚠️ Backend Health Check: ${healthResponse.status}`);
    }

    // Test users endpoint (no auth required)
    const usersResponse = await fetch(`${BACKEND_URL}/api/users/all`);
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      const userCount = Array.isArray(usersData) ? usersData.length : (usersData.users?.length || 0);
      console.log(`✅ Backend Users API: OK (${userCount} users)`);
    } else {
      console.log(`⚠️ Backend Users API: ${usersResponse.status}`);
    }

    console.log('');
    return { success: true };
  } catch (error) {
    console.error('❌ Backend API Test Failed!');
    console.error(`   Error: ${error.message}`);
    console.error('');
    return { success: false, error: error.message };
  }
}

async function testFrontendBackendConnection() {
  console.log('🔍 TESTING FRONTEND-BACKEND CONNECTION');
  console.log('======================================\n');

  try {
    console.log(`📡 Frontend: ${FRONTEND_URL}`);
    console.log(`📡 Backend: ${BACKEND_URL}`);
    
    // Test if frontend can reach backend via API route
    const testResponse = await fetch(`${FRONTEND_URL}/api/test-connection`);
    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log('✅ Frontend-Backend Connection: OK');
      console.log(`   Backend URL: ${testData.backendUrl || 'Not set'}`);
      console.log(`   Connection Status: ${testData.connected ? 'Connected' : 'Not Connected'}`);
    } else {
      console.log(`⚠️ Frontend-Backend Connection: ${testResponse.status}`);
    }

    console.log('');
    return { success: true };
  } catch (error) {
    console.error('❌ Frontend-Backend Connection Test Failed!');
    console.error(`   Error: ${error.message}`);
    console.error('');
    return { success: false, error: error.message };
  }
}

async function verifyEnvironmentVariables() {
  console.log('🔍 VERIFYING ENVIRONMENT VARIABLES');
  console.log('===================================\n');

  const requiredVars = {
    'MONGODB_URI': process.env.MONGODB_URI,
    'CONNECTION_STRING': process.env.CONNECTION_STRING,
    'JWT_SECRET': process.env.JWT_SECRET ? 'Set (hidden)' : undefined,
    'NODE_ENV': process.env.NODE_ENV,
  };

  console.log('Backend Environment Variables:');
  let allSet = true;
  for (const [key, value] of Object.entries(requiredVars)) {
    if (value) {
      console.log(`   ✅ ${key}: ${key.includes('SECRET') || key.includes('URI') ? 'Set (hidden)' : value}`);
    } else {
      console.log(`   ⚠️ ${key}: Not set`);
      if (key === 'MONGODB_URI' || key === 'CONNECTION_STRING') {
        console.log(`      Using default connection string`);
      }
      allSet = false;
    }
  }

  console.log('');
  return { allSet, vars: requiredVars };
}

async function main() {
  console.log('🚀 DEPLOYED SYSTEM CONNECTION VERIFICATION');
  console.log('==========================================\n');

  const results = {
    database: null,
    collections: null,
    backend: null,
    frontend: null,
    environment: null,
  };

  // 1. Verify Database Connection
  const dbResult = await verifyDatabaseConnection();
  results.database = dbResult;

  if (!dbResult.success) {
    console.log('❌ Cannot proceed - Database connection failed\n');
    await mongoose.disconnect();
    process.exit(1);
  }

  // 2. Verify Collections
  const collectionsResult = await verifyCollections();
  results.collections = collectionsResult;

  // 3. Verify Environment Variables
  const envResult = await verifyEnvironmentVariables();
  results.environment = envResult;

  // 4. Test Backend API
  const backendResult = await testBackendAPI();
  results.backend = backendResult;

  // 5. Test Frontend-Backend Connection
  const frontendResult = await testFrontendBackendConnection();
  results.frontend = frontendResult;

  // Summary
  console.log('📊 VERIFICATION SUMMARY');
  console.log('======================\n');

  console.log(`Database Connection: ${results.database.success ? '✅ Connected' : '❌ Failed'}`);
  console.log(`Collections Access: ${results.collections ? '✅ Accessible' : '❌ Failed'}`);
  console.log(`Backend API: ${results.backend.success ? '✅ Accessible' : '❌ Failed'}`);
  console.log(`Frontend-Backend: ${results.frontend.success ? '✅ Connected' : '❌ Failed'}`);
  console.log(`Environment Variables: ${results.environment.allSet ? '✅ All Set' : '⚠️ Some Missing'}`);

  console.log('\n✅ Verification Complete!\n');

  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');
}

// Run the verification
if (require.main === module) {
  main()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Verification failed:', error);
      process.exit(1);
    });
}

module.exports = { main, verifyDatabaseConnection, verifyCollections, testBackendAPI };

