// Quick test script to verify Vercel deployment
// Run with: node test-vercel-deployment.js

const https = require('https');

const BASE_URL = process.env.VERCEL_URL || 'https://mern-stack-dtgy.vercel.app';

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testDeployment() {
  console.log('🚀 Testing Vercel Deployment...\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  // Test 1: Health Check
  console.log('1️⃣ Testing Health Check (/api/health)...');
  try {
    const start = Date.now();
    const result = await makeRequest('/api/health');
    const duration = Date.now() - start;
    console.log(`   Status: ${result.status}`);
    console.log(`   Response:`, result.data);
    console.log(`   Duration: ${duration}ms`);
    if (result.status === 200 && result.data.status === 'ok') {
      console.log('   ✅ Health check passed!\n');
    } else {
      console.log('   ❌ Health check failed!\n');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 2: Health Check Test
  console.log('2️⃣ Testing Health Check Test (/api/health/test)...');
  try {
    const start = Date.now();
    const result = await makeRequest('/api/health/test');
    const duration = Date.now() - start;
    console.log(`   Status: ${result.status}`);
    console.log(`   Response:`, result.data);
    console.log(`   Duration: ${duration}ms`);
    if (result.status === 200) {
      console.log('   ✅ Health check test passed!\n');
    } else {
      console.log('   ❌ Health check test failed!\n');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 3: Login Endpoint (should return error, but not timeout)
  console.log('3️⃣ Testing Login Endpoint (/api/auth/login)...');
  try {
    const start = Date.now();
    const result = await makeRequest('/api/auth/login', 'POST', {
      email: 'test@example.com',
      password: 'test123',
    });
    const duration = Date.now() - start;
    console.log(`   Status: ${result.status}`);
    console.log(`   Response:`, result.data);
    console.log(`   Duration: ${duration}ms`);
    if (result.status !== 504 && result.status !== 500) {
      console.log('   ✅ Login endpoint is responding (expected to fail without valid credentials)\n');
    } else {
      console.log('   ❌ Login endpoint timed out or crashed!\n');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 4: Non-existent route (should return 404)
  console.log('4️⃣ Testing 404 Route (/api/nonexistent)...');
  try {
    const start = Date.now();
    const result = await makeRequest('/api/nonexistent');
    const duration = Date.now() - start;
    console.log(`   Status: ${result.status}`);
    console.log(`   Response:`, result.data);
    console.log(`   Duration: ${duration}ms`);
    if (result.status === 404) {
      console.log('   ✅ 404 handling works correctly!\n');
    } else {
      console.log('   ⚠️  Unexpected status code\n');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  console.log('✨ Testing complete!');
}

// Run tests
testDeployment().catch(console.error);

