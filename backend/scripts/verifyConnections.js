const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || process.env.CONNECTION_STRING || 'mongodb+srv://armanzaman4_db_user:1JJORz7jP2VFgTaP@cluster0.qn1babq.mongodb.net/Ressichem?retryWrites=true&w=majority';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

console.log('🔍 Verifying System Connections...\n');
console.log('='.repeat(60));

// 1. Test MongoDB Connection
async function testMongoDB() {
  console.log('\n1️⃣ Testing MongoDB Atlas Connection...');
  try {
    await mongoose.connect(MONGODB_URI, { 
      dbName: 'Ressichem',
      serverSelectionTimeoutMS: 5000
    });
    
    // Test a simple query
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    const dbName = mongoose.connection.db.databaseName;
    
    console.log('   ✅ MongoDB Atlas: CONNECTED');
    console.log(`   📊 Database: ${dbName}`);
    console.log(`   👥 Users in database: ${userCount}`);
    
    // Test collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`   📁 Collections: ${collections.length}`);
    console.log(`   📋 Collection names: ${collections.map(c => c.name).join(', ')}`);
    
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.log('   ❌ MongoDB Atlas: CONNECTION FAILED');
    console.log(`   ⚠️ Error: ${error.message}`);
    return false;
  }
}

// 2. Test Backend API
async function testBackendAPI() {
  console.log('\n2️⃣ Testing Backend API...');
  try {
    const http = require('http');
    const url = require('url');
    
    return new Promise((resolve) => {
      const parsedUrl = url.parse(BACKEND_URL);
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 5000,
        path: '/api/users/test',
        method: 'GET',
        timeout: 5000
      };
      
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode === 200) {
            console.log('   ✅ Backend API: RUNNING');
            console.log(`   📡 Status: ${res.statusCode}`);
            try {
              const jsonData = JSON.parse(data);
              console.log(`   📊 Response: ${jsonData.message || 'OK'}`);
            } catch (e) {
              console.log(`   📊 Response: ${data.substring(0, 100)}`);
            }
            resolve(true);
          } else {
            console.log(`   ⚠️ Backend API: RESPONDED (Status: ${res.statusCode})`);
            resolve(false);
          }
        });
      });
      
      req.on('error', (error) => {
        console.log('   ❌ Backend API: NOT RUNNING');
        console.log(`   ⚠️ Error: ${error.message}`);
        console.log(`   💡 Make sure backend server is running on ${BACKEND_URL}`);
        resolve(false);
      });
      
      req.on('timeout', () => {
        console.log('   ❌ Backend API: TIMEOUT');
        console.log(`   💡 Backend server may not be running on ${BACKEND_URL}`);
        req.destroy();
        resolve(false);
      });
      
      req.end();
    });
  } catch (error) {
    console.log('   ❌ Backend API: ERROR');
    console.log(`   ⚠️ Error: ${error.message}`);
    return false;
  }
}

// 3. Test Frontend-Backend Connection
async function testFrontendBackend() {
  console.log('\n3️⃣ Testing Frontend-Backend Connection...');
  try {
    const http = require('http');
    const url = require('url');
    
    return new Promise((resolve) => {
      const parsedUrl = url.parse(BACKEND_URL);
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 5000,
        path: '/api/auth/current-user',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      };
      
      const req = http.request(options, (res) => {
        if (res.statusCode === 401 || res.statusCode === 403) {
          console.log('   ✅ Frontend-Backend: CONNECTED');
          console.log(`   📡 Status: ${res.statusCode} (Expected - requires auth)`);
          console.log('   ✅ API endpoint is accessible');
          resolve(true);
        } else if (res.statusCode === 200) {
          console.log('   ✅ Frontend-Backend: CONNECTED');
          console.log(`   📡 Status: ${res.statusCode}`);
          resolve(true);
        } else {
          console.log(`   ⚠️ Frontend-Backend: RESPONDED (Status: ${res.statusCode})`);
          resolve(false);
        }
      });
      
      req.on('error', (error) => {
        console.log('   ❌ Frontend-Backend: CONNECTION FAILED');
        console.log(`   ⚠️ Error: ${error.message}`);
        resolve(false);
      });
      
      req.on('timeout', () => {
        console.log('   ❌ Frontend-Backend: TIMEOUT');
        req.destroy();
        resolve(false);
      });
      
      req.end();
    });
  } catch (error) {
    console.log('   ❌ Frontend-Backend: ERROR');
    console.log(`   ⚠️ Error: ${error.message}`);
    return false;
  }
}

// 4. Test Database Collections
async function testDatabaseCollections() {
  console.log('\n4️⃣ Testing Database Collections...');
  try {
    await mongoose.connect(MONGODB_URI, { 
      dbName: 'Ressichem',
      serverSelectionTimeoutMS: 5000
    });
    
    const User = require('../models/User');
    const Manager = require('../models/Manager');
    const Customer = require('../models/Customer');
    const Order = require('../models/Order');
    const Product = require('../models/Product');
    
    const counts = {
      users: await User.countDocuments(),
      managers: await Manager.countDocuments(),
      customers: await Customer.countDocuments(),
      orders: await Order.countDocuments(),
      products: await Product.countDocuments()
    };
    
    console.log('   ✅ Collections: ACCESSIBLE');
    console.log(`   👥 Users: ${counts.users}`);
    console.log(`   👨‍💼 Managers: ${counts.managers}`);
    console.log(`   👤 Customers: ${counts.customers}`);
    console.log(`   📦 Orders: ${counts.orders}`);
    console.log(`   🛍️ Products: ${counts.products}`);
    
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.log('   ❌ Collections: ERROR');
    console.log(`   ⚠️ Error: ${error.message}`);
    return false;
  }
}

// Main verification
async function verifyAll() {
  const results = {
    mongodb: false,
    backend: false,
    frontendBackend: false,
    collections: false
  };
  
  results.mongodb = await testMongoDB();
  results.backend = await testBackendAPI();
  results.frontendBackend = await testFrontendBackend();
  results.collections = await testDatabaseCollections();
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Connection Summary:');
  console.log('='.repeat(60));
  console.log(`   MongoDB Atlas:     ${results.mongodb ? '✅ CONNECTED' : '❌ FAILED'}`);
  console.log(`   Backend API:       ${results.backend ? '✅ RUNNING' : '❌ NOT RUNNING'}`);
  console.log(`   Frontend-Backend:  ${results.frontendBackend ? '✅ CONNECTED' : '❌ FAILED'}`);
  console.log(`   Database Collections: ${results.collections ? '✅ ACCESSIBLE' : '❌ ERROR'}`);
  console.log('='.repeat(60));
  
  const allConnected = Object.values(results).every(r => r === true);
  
  if (allConnected) {
    console.log('\n✅ ALL SYSTEMS CONNECTED AND OPERATIONAL!');
    console.log('   Frontend ↔ Backend ↔ Database: ✅ Working');
  } else {
    console.log('\n⚠️ SOME CONNECTIONS FAILED');
    if (!results.mongodb) {
      console.log('   💡 Check MongoDB Atlas connection string and network access');
    }
    if (!results.backend) {
      console.log('   💡 Start backend server: cd backend && npm run dev');
    }
    if (!results.frontendBackend) {
      console.log('   💡 Ensure backend is running and accessible from frontend');
    }
  }
  
  process.exit(allConnected ? 0 : 1);
}

verifyAll();

