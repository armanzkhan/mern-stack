// Test customer login
require('dotenv').config();
const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const TEST_EMAIL = process.env.TEST_EMAIL || 'yousuf@gmail.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'yousuf123';

async function testLogin() {
  try {
    console.log('🧪 Testing customer login...');
    console.log(`Backend URL: ${BACKEND_URL}`);
    console.log(`Email: ${TEST_EMAIL}`);
    console.log('');
    
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    console.log('✅ Login successful!');
    console.log('User Type:', response.data.user?.userType);
    console.log('Is Customer:', response.data.user?.isCustomer);
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Login failed!');
    console.error('Status:', error.response?.status);
    console.error('Error data:', JSON.stringify(error.response?.data, null, 2));
    if (error.response?.data?.error) {
      console.error('Backend error:', error.response.data.error);
    }
  }
}

testLogin();

