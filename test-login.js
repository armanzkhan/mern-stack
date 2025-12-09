// Quick test script to test login endpoint locally
require('dotenv').config();
const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const TEST_EMAIL = 'companyadmin@samplecompany.com';
const TEST_PASSWORD = 'companyadmin123';

async function testLogin() {
  try {
    console.log('🧪 Testing login endpoint...');
    console.log(`Backend URL: ${BACKEND_URL}`);
    console.log(`Email: ${TEST_EMAIL}`);
    console.log('');
    
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    console.log('✅ Login successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Login failed!');
    console.error('Status:', error.response?.status);
    console.error('Error data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Error message:', error.message);
    if (error.response?.data?.error) {
      console.error('Backend error:', error.response.data.error);
    }
    if (error.response?.data?.details) {
      console.error('Error details:', error.response.data.details);
    }
  }
}

testLogin();

