const mongoose = require('mongoose');
const axios = require('axios');
const User = require('../models/User');
const Manager = require('../models/Manager');
const { generateToken } = require('../services/authService');

async function testManagerAPI() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 Testing manager API endpoint...');

    // Find the sales user
    const salesUser = await User.findOne({ email: 'sales@ressichem.com' });
    if (!salesUser) {
      console.log('❌ Sales user not found');
      return;
    }

    console.log('✅ Sales user found:');
    console.log(`   User ID: ${salesUser.user_id}`);
    console.log(`   Email: ${salesUser.email}`);

    // Generate a token for the sales user
    const token = generateToken({
      user_id: salesUser.user_id,
      company_id: salesUser.company_id,
      email: salesUser.email,
      isSuperAdmin: false,
      isManager: true
    });

    console.log('\n🔑 Generated token for API testing');

    // Test the manager profile endpoint
    try {
      const response = await axios.get('http://localhost:5000/api/managers/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Manager profile API response:');
      console.log(`   Status: ${response.status}`);
      console.log(`   Data:`, JSON.stringify(response.data, null, 2));

    } catch (apiError) {
      console.log('❌ Manager profile API error:');
      if (apiError.response) {
        console.log(`   Status: ${apiError.response.status}`);
        console.log(`   Message: ${apiError.response.data?.message || 'Unknown error'}`);
        console.log(`   Data:`, JSON.stringify(apiError.response.data, null, 2));
      } else {
        console.log(`   Error: ${apiError.message}`);
        console.log('   Make sure the backend server is running on port 5000');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testManagerAPI();
