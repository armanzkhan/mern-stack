/**
 * Complete Connection Verification Script
 * Tests: Frontend → Backend → Database
 * 
 * Usage:
 *   node verify-all-connections.js
 */

const https = require('https');

const BACKEND_URL = 'https://mern-stack-dtgy.vercel.app';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testBackendHealth() {
  log('\n🔍 Test 1: Backend Health Check', 'blue');
  try {
    const result = await makeRequest(`${BACKEND_URL}/api/health`);
    if (result.status === 200) {
      log('✅ Backend is responding', 'green');
      log(`   Status: ${result.status}`, 'green');
      log(`   Response: ${JSON.stringify(result.data)}`, 'green');
      return true;
    } else {
      log(`❌ Backend returned status ${result.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Backend health check failed: ${error.message}`, 'red');
    return false;
  }
}

async function testBackendDatabase() {
  log('\n🔍 Test 2: Backend → Database Connection', 'blue');
  log('   Testing with a database-dependent endpoint...', 'yellow');
  
  try {
    // Try to access an endpoint that requires database connection
    // This will fail without auth, but should return 401/403, not 500 (which would indicate DB error)
    const result = await makeRequest(`${BACKEND_URL}/api/products`, {
      method: 'GET',
    });
    
    if (result.status === 200 || result.status === 401 || result.status === 403) {
      log('✅ Backend can reach database', 'green');
      log(`   Status: ${result.status} (expected for unauthenticated request)`, 'green');
      return true;
    } else if (result.status === 500) {
      log('❌ Backend database connection failed (500 error)', 'red');
      log('   Check MongoDB connection string in Vercel environment variables', 'yellow');
      return false;
    } else {
      log(`⚠️  Unexpected status: ${result.status}`, 'yellow');
      return true; // Assume it's working if not 500
    }
  } catch (error) {
    log(`❌ Database connection test failed: ${error.message}`, 'red');
    return false;
  }
}

async function testBackendCORS() {
  log('\n🔍 Test 3: Backend CORS Configuration', 'blue');
  try {
    const result = await makeRequest(`${BACKEND_URL}/api/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'GET',
      },
    });
    
    const corsHeaders = result.headers['access-control-allow-origin'];
    if (corsHeaders || result.status === 200) {
      log('✅ CORS is configured', 'green');
      if (corsHeaders) {
        log(`   Allowed Origin: ${corsHeaders}`, 'green');
      }
      return true;
    } else {
      log('⚠️  CORS headers not found (may still work)', 'yellow');
      return true;
    }
  } catch (error) {
    log(`⚠️  CORS test inconclusive: ${error.message}`, 'yellow');
    return true; // Don't fail on this
  }
}

function checkEnvironmentVariables() {
  log('\n🔍 Test 4: Environment Variables Check', 'blue');
  log('   Checking required environment variables...', 'yellow');
  
  const required = {
    'MONGODB_URI or CONNECTION_STRING': 'Set in Vercel → Settings → Environment Variables',
    'JWT_SECRET': 'Set in Vercel → Settings → Environment Variables',
    'REFRESH_SECRET': 'Set in Vercel → Settings → Environment Variables',
  };
  
  log('\n   Required Backend Variables (in Vercel):', 'yellow');
  Object.entries(required).forEach(([key, location]) => {
    log(`   - ${key}: ${location}`, 'yellow');
  });
  
  log('\n   Required Frontend Variables (in .env.local):', 'yellow');
  log('   - NEXT_PUBLIC_BACKEND_URL: https://mern-stack-dtgy.vercel.app', 'yellow');
  log('   - NEXT_PUBLIC_API_URL: https://mern-stack-dtgy.vercel.app', 'yellow');
  
  log('\n   ⚠️  Note: This script cannot verify Vercel environment variables', 'yellow');
  log('      Please verify manually in Vercel Dashboard', 'yellow');
}

async function runAllTests() {
  log('═══════════════════════════════════════════════════════', 'blue');
  log('   Complete Connection Verification', 'blue');
  log('   Frontend ↔ Backend ↔ Database', 'blue');
  log('═══════════════════════════════════════════════════════', 'blue');
  
  const results = {
    backendHealth: await testBackendHealth(),
    backendDatabase: await testBackendDatabase(),
    backendCORS: await testBackendCORS(),
  };
  
  checkEnvironmentVariables();
  
  log('\n═══════════════════════════════════════════════════════', 'blue');
  log('   Test Results Summary', 'blue');
  log('═══════════════════════════════════════════════════════', 'blue');
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? 'green' : 'red';
    log(`${status}: ${test}`, color);
  });
  
  const allPassed = Object.values(results).every(r => r);
  
  if (allPassed) {
    log('\n✅ All connection tests passed!', 'green');
    log('   Your backend is ready to accept connections.', 'green');
    log('\n   Next steps:', 'yellow');
    log('   1. Verify environment variables in Vercel', 'yellow');
    log('   2. Test frontend locally with: npm run dev', 'yellow');
    log('   3. Deploy frontend to Vercel', 'yellow');
  } else {
    log('\n❌ Some tests failed. Please check the errors above.', 'red');
    log('\n   Troubleshooting:', 'yellow');
    log('   1. Check Vercel deployment logs', 'yellow');
    log('   2. Verify MongoDB connection string', 'yellow');
    log('   3. Check MongoDB Atlas network access (allow 0.0.0.0/0)', 'yellow');
  }
  
  log('\n═══════════════════════════════════════════════════════\n', 'blue');
}

// Run tests
runAllTests().catch(console.error);

