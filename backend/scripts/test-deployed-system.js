/**
 * Quick Test of Deployed System
 * Tests: Backend Health, Frontend-Backend Connection, Database via Backend
 */

const https = require('https');

const BACKEND_URL = 'https://mern-stack-dtgy.vercel.app';
const FRONTEND_URL = 'https://ressichem-frontend.vercel.app';

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function testSystem() {
  console.log('🔍 TESTING DEPLOYED SYSTEM CONNECTIONS\n');
  console.log('='.repeat(60));
  
  const results = {
    backend: null,
    frontendBackend: null,
    database: null
  };

  // Test 1: Backend Health
  console.log('\n1️⃣ Testing Backend Health...');
  try {
    const backendHealth = await makeRequest(`${BACKEND_URL}/api/health`);
    results.backend = backendHealth;
    
    if (backendHealth.status === 200) {
      console.log('   ✅ Backend is ONLINE');
      console.log(`   Status: ${backendHealth.data.status || 'OK'}`);
      console.log(`   Database: ${backendHealth.data.database || 'Unknown'}`);
    } else {
      console.log(`   ❌ Backend returned status: ${backendHealth.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Backend connection FAILED: ${error.message}`);
    results.backend = { error: error.message };
  }

  // Test 2: Frontend-Backend Connection
  console.log('\n2️⃣ Testing Frontend-Backend Connection...');
  try {
    const frontendTest = await makeRequest(`${FRONTEND_URL}/api/test-connection`);
    results.frontendBackend = frontendTest;
    
    if (frontendTest.status === 200 && frontendTest.data.success) {
      console.log('   ✅ Frontend can reach Backend');
      console.log(`   Backend Health: ${frontendTest.data.tests?.backendHealth ? '✅' : '❌'}`);
      console.log(`   Backend API: ${frontendTest.data.tests?.backendApi ? '✅' : '❌'}`);
      console.log(`   Backend URL: ${frontendTest.data.tests?.environment?.backendUrl || 'Not set'}`);
    } else {
      console.log(`   ❌ Frontend-Backend connection issue`);
      console.log(`   Status: ${frontendTest.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Frontend-Backend test FAILED: ${error.message}`);
    results.frontendBackend = { error: error.message };
  }

  // Test 3: Database via Backend (test products endpoint)
  console.log('\n3️⃣ Testing Database Connection (via Backend)...');
  try {
    const productsTest = await makeRequest(`${BACKEND_URL}/api/products?limit=1`);
    results.database = productsTest;
    
    if (productsTest.status === 200) {
      console.log('   ✅ Database is accessible via Backend');
      const products = Array.isArray(productsTest.data) ? productsTest.data : productsTest.data?.products || [];
      console.log(`   Products endpoint working: ${products.length > 0 ? '✅ Has data' : '⚠️ Empty'}`);
    } else if (productsTest.status === 401) {
      console.log('   ⚠️ Database accessible but requires authentication (this is OK)');
    } else {
      console.log(`   ❌ Database test returned status: ${productsTest.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Database test FAILED: ${error.message}`);
    results.database = { error: error.message };
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 CONNECTION SUMMARY');
  console.log('='.repeat(60));
  
  const backendOk = results.backend?.status === 200;
  const frontendOk = results.frontendBackend?.status === 200 && results.frontendBackend?.data?.success;
  const databaseOk = results.database?.status === 200 || results.database?.status === 401;

  console.log(`\n   Backend (${BACKEND_URL}):        ${backendOk ? '✅ ONLINE' : '❌ OFFLINE'}`);
  console.log(`   Frontend (${FRONTEND_URL}):      ${frontendOk ? '✅ CONNECTED' : '❌ DISCONNECTED'}`);
  console.log(`   Database (via Backend):          ${databaseOk ? '✅ ACCESSIBLE' : '❌ INACCESSIBLE'}`);

  if (backendOk && frontendOk && databaseOk) {
    console.log('\n   🎉 ALL SYSTEMS OPERATIONAL!');
    console.log('   ✅ Backend ↔ Frontend ↔ Database: All Connected');
  } else {
    console.log('\n   ⚠️ SOME ISSUES DETECTED');
    if (!backendOk) console.log('   💡 Check: Backend deployment on Vercel');
    if (!frontendOk) console.log('   💡 Check: Frontend environment variables (NEXT_PUBLIC_BACKEND_URL)');
    if (!databaseOk) console.log('   💡 Check: MongoDB Atlas connection string in Vercel environment variables');
  }

  console.log('\n');
}

testSystem().catch(console.error);

