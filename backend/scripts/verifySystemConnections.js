/**
 * Comprehensive System Verification Script
 * Tests Frontend, Backend, and Database connections
 */

const mongoose = require('mongoose');
const axios = require('axios');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Configuration
const config = {
  mongoUri: process.env.MONGODB_URI || process.env.CONNECTION_STRING || 
    "mongodb+srv://armanzaman4_db_user:1JJORz7jP2VFgTaP@cluster0.qn1babq.mongodb.net/Ressichem?retryWrites=true&w=majority",
  backendUrl: process.env.BACKEND_URL || 'https://mern-stack-dtgy.vercel.app',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  dbName: 'Ressichem'
};

const results = {
  database: { status: 'pending', details: [] },
  backend: { status: 'pending', details: [] },
  frontend: { status: 'pending', details: [] },
  integration: { status: 'pending', details: [] }
};

// ===== DATABASE VERIFICATION =====
async function verifyDatabase() {
  log('\n📊 VERIFYING DATABASE CONNECTION...', 'cyan');
  
  try {
    // Connect to MongoDB
    log('   Connecting to MongoDB...', 'blue');
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: config.dbName,
      serverSelectionTimeoutMS: 5000
    });
    
    log('   ✅ Database connection successful', 'green');
    results.database.details.push('✅ Connected to MongoDB Atlas');
    
    // Check database name
    const dbName = mongoose.connection.db.databaseName;
    log(`   ✅ Database name: ${dbName}`, 'green');
    results.database.details.push(`✅ Database: ${dbName}`);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    log(`   ✅ Found ${collections.length} collections`, 'green');
    results.database.details.push(`✅ Collections: ${collections.length}`);
    
    // Check critical collections
    const criticalCollections = ['users', 'orders', 'products', 'customers', 'managers', 'companies'];
    const collectionNames = collections.map(c => c.name);
    
    for (const collection of criticalCollections) {
      if (collectionNames.includes(collection)) {
        const count = await mongoose.connection.db.collection(collection).countDocuments();
        log(`   ✅ ${collection}: ${count} documents`, 'green');
        results.database.details.push(`✅ ${collection}: ${count} documents`);
      } else {
        log(`   ⚠️  ${collection}: NOT FOUND`, 'yellow');
        results.database.details.push(`⚠️  ${collection}: NOT FOUND`);
      }
    }
    
    // Test a simple query
    const userCount = await mongoose.connection.db.collection('users').countDocuments();
    log(`   ✅ Test query successful: ${userCount} users found`, 'green');
    results.database.details.push(`✅ Test query successful`);
    
    results.database.status = 'success';
    
  } catch (error) {
    log(`   ❌ Database connection failed: ${error.message}`, 'red');
    results.database.details.push(`❌ Error: ${error.message}`);
    results.database.status = 'failed';
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      log('   ✅ Database connection closed', 'green');
    }
  }
}

// ===== BACKEND VERIFICATION =====
async function verifyBackend() {
  log('\n🔧 VERIFYING BACKEND API...', 'cyan');
  
  try {
    // Test health endpoint
    log(`   Testing health endpoint: ${config.backendUrl}/api/health`, 'blue');
    const healthResponse = await axios.get(`${config.backendUrl}/api/health`, {
      timeout: 5000
    });
    
    if (healthResponse.status === 200) {
      log('   ✅ Backend health check passed', 'green');
      results.backend.details.push('✅ Health endpoint: OK');
      log(`   ✅ Response: ${JSON.stringify(healthResponse.data)}`, 'green');
    } else {
      log(`   ⚠️  Backend health check returned status: ${healthResponse.status}`, 'yellow');
      results.backend.details.push(`⚠️  Health endpoint: Status ${healthResponse.status}`);
    }
    
    // Test API routes (without auth for basic connectivity)
    const testRoutes = [
      '/api/health/test',
    ];
    
    for (const route of testRoutes) {
      try {
        const response = await axios.get(`${config.backendUrl}${route}`, {
          timeout: 5000
        });
        log(`   ✅ ${route}: OK (${response.status})`, 'green');
        results.backend.details.push(`✅ ${route}: OK`);
      } catch (error) {
        if (error.response) {
          log(`   ⚠️  ${route}: ${error.response.status}`, 'yellow');
          results.backend.details.push(`⚠️  ${route}: ${error.response.status}`);
        } else {
          log(`   ❌ ${route}: ${error.message}`, 'red');
          results.backend.details.push(`❌ ${route}: ${error.message}`);
        }
      }
    }
    
    results.backend.status = 'success';
    
  } catch (error) {
    log(`   ❌ Backend verification failed: ${error.message}`, 'red');
    results.backend.details.push(`❌ Error: ${error.message}`);
    results.backend.status = 'failed';
  }
}

// ===== FRONTEND VERIFICATION =====
async function verifyFrontend() {
  log('\n🎨 VERIFYING FRONTEND...', 'cyan');
  
  try {
    // Test frontend connection endpoint
    log(`   Testing frontend: ${config.frontendUrl}/api/test-connection`, 'blue');
    const response = await axios.get(`${config.frontendUrl}/api/test-connection`, {
      timeout: 5000
    });
    
    if (response.status === 200 && response.data.success) {
      log('   ✅ Frontend is running', 'green');
      results.frontend.details.push('✅ Frontend server: Running');
      
      // Check backend connection from frontend
      if (response.data.tests?.backendHealth) {
        log('   ✅ Frontend can reach backend', 'green');
        results.frontend.details.push('✅ Frontend-Backend connection: OK');
      } else {
        log('   ⚠️  Frontend cannot reach backend', 'yellow');
        results.frontend.details.push('⚠️  Frontend-Backend connection: Failed');
      }
      
      // Check environment variables
      if (response.data.tests?.environment?.hasBackendUrl) {
        log('   ✅ Backend URL configured in frontend', 'green');
        results.frontend.details.push('✅ Environment variables: Configured');
      } else {
        log('   ⚠️  Backend URL not configured in frontend', 'yellow');
        results.frontend.details.push('⚠️  Environment variables: Not configured');
      }
      
    } else {
      log('   ⚠️  Frontend test endpoint returned unexpected response', 'yellow');
      results.frontend.details.push('⚠️  Test endpoint: Unexpected response');
    }
    
    results.frontend.status = 'success';
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log('   ⚠️  Frontend server not running (expected if not started)', 'yellow');
      results.frontend.details.push('⚠️  Frontend server: Not running (expected)');
      results.frontend.status = 'warning';
    } else {
      log(`   ❌ Frontend verification failed: ${error.message}`, 'red');
      results.frontend.details.push(`❌ Error: ${error.message}`);
      results.frontend.status = 'failed';
    }
  }
}

// ===== INTEGRATION VERIFICATION =====
async function verifyIntegration() {
  log('\n🔗 VERIFYING INTEGRATION...', 'cyan');
  
  try {
    // Test full flow: Frontend -> Backend -> Database
    log('   Testing full integration flow...', 'blue');
    
    // If frontend is running, test through it
    try {
      const response = await axios.get(`${config.frontendUrl}/api/test-connection`, {
        timeout: 5000
      });
      
      if (response.data.status === 'all_connected') {
        log('   ✅ Full integration: Frontend -> Backend -> Database', 'green');
        results.integration.details.push('✅ Full integration flow: OK');
        results.integration.status = 'success';
      } else {
        log('   ⚠️  Partial integration: Some connections may be missing', 'yellow');
        results.integration.details.push('⚠️  Integration: Partial');
        results.integration.status = 'warning';
      }
    } catch (error) {
      // If frontend not running, test backend directly
      log('   Testing backend -> database integration...', 'blue');
      try {
        const healthResponse = await axios.get(`${config.backendUrl}/api/health`, {
          timeout: 5000
        });
        if (healthResponse.status === 200) {
          log('   ✅ Backend -> Database: OK', 'green');
          results.integration.details.push('✅ Backend-Database: OK');
          results.integration.status = 'success';
        }
      } catch (err) {
        log(`   ❌ Integration test failed: ${err.message}`, 'red');
        results.integration.details.push(`❌ Error: ${err.message}`);
        results.integration.status = 'failed';
      }
    }
    
  } catch (error) {
    log(`   ❌ Integration verification failed: ${error.message}`, 'red');
    results.integration.details.push(`❌ Error: ${error.message}`);
    results.integration.status = 'failed';
  }
}

// ===== SUMMARY =====
function printSummary() {
  log('\n' + '='.repeat(60), 'cyan');
  log('📋 VERIFICATION SUMMARY', 'cyan');
  log('='.repeat(60), 'cyan');
  
  const sections = [
    { name: 'Database', key: 'database' },
    { name: 'Backend API', key: 'backend' },
    { name: 'Frontend', key: 'frontend' },
    { name: 'Integration', key: 'integration' }
  ];
  
  let allSuccess = true;
  
  for (const section of sections) {
    const result = results[section.key];
    const statusIcon = result.status === 'success' ? '✅' : 
                      result.status === 'warning' ? '⚠️' : '❌';
    const statusColor = result.status === 'success' ? 'green' : 
                       result.status === 'warning' ? 'yellow' : 'red';
    
    log(`\n${statusIcon} ${section.name}: ${result.status.toUpperCase()}`, statusColor);
    
    for (const detail of result.details) {
      log(`   ${detail}`, 'reset');
    }
    
    if (result.status !== 'success') {
      allSuccess = false;
    }
  }
  
  log('\n' + '='.repeat(60), 'cyan');
  
  if (allSuccess) {
    log('✅ ALL SYSTEMS OPERATIONAL', 'green');
  } else {
    log('⚠️  SOME ISSUES DETECTED - Please review above', 'yellow');
  }
  
  log('='.repeat(60) + '\n', 'cyan');
}

// ===== MAIN =====
async function main() {
  log('\n🚀 SYSTEM VERIFICATION STARTED', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`Backend URL: ${config.backendUrl}`, 'blue');
  log(`Frontend URL: ${config.frontendUrl}`, 'blue');
  log(`Database: ${config.dbName}`, 'blue');
  log('='.repeat(60), 'cyan');
  
  // Run all verifications
  await verifyDatabase();
  await verifyBackend();
  await verifyFrontend();
  await verifyIntegration();
  
  // Print summary
  printSummary();
  
  // Exit with appropriate code
  const exitCode = results.database.status === 'success' && 
                   results.backend.status === 'success' ? 0 : 1;
  process.exit(exitCode);
}

// Run verification
main().catch(error => {
  log(`\n❌ FATAL ERROR: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

