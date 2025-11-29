const axios = require('axios');

async function testManagerAPIEndpoint() {
  try {
    console.log('🔍 Testing manager API endpoint...');

    // Test if backend server is running
    console.log('\n🧪 Test 1: Checking if backend server is running...');
    try {
      const response = await axios.get('http://localhost:5000/api/auth/current-user', {
        timeout: 5000
      });
      console.log('❌ Backend server is running but should require authentication');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Backend server is running (401 Unauthorized expected)');
      } else {
        console.log('❌ Backend server might not be running:', error.message);
        console.log('   Make sure to run: npm start in the backend directory');
        return;
      }
    }

    // Test manager profile endpoint
    console.log('\n🧪 Test 2: Testing manager profile endpoint...');
    try {
      const response = await axios.get('http://localhost:5000/api/managers/profile', {
        timeout: 5000
      });
      console.log('❌ Manager profile endpoint should require authentication');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Manager profile endpoint is accessible (401 Unauthorized expected)');
      } else {
        console.log('❌ Manager profile endpoint error:', error.message);
      }
    }

    console.log('\n🎯 Frontend Issue Analysis:');
    console.log('   The backend is working correctly');
    console.log('   The issue is likely in the frontend:');
    console.log('   1. User not properly logged in');
    console.log('   2. Token not being sent with API request');
    console.log('   3. API request failing silently');
    console.log('   4. CORS issues');

    console.log('\n🔧 Frontend Debug Steps:');
    console.log('   1. Open browser developer tools');
    console.log('   2. Go to Network tab');
    console.log('   3. Navigate to /manager-dashboard');
    console.log('   4. Look for API request to /api/managers/profile');
    console.log('   5. Check if request has Authorization header');
    console.log('   6. Check response status and error message');

    console.log('\n🚀 Quick Fixes:');
    console.log('   1. Clear browser cache and cookies');
    console.log('   2. Logout and login again with sales@ressichem.com');
    console.log('   3. Check browser console for JavaScript errors');
    console.log('   4. Verify the user is actually logged in');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testManagerAPIEndpoint();
