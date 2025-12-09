// Test orders API directly
const mongoose = require('mongoose');
const User = require('./models/User');
const authService = require('./services/authService');

async function testOrdersAPI() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB - Database: Ressichem');

    console.log('\n🧪 TESTING ORDERS API DIRECTLY:');
    
    // Get manager and generate token
    const manager = await User.findOne({ email: 'sales@ressichem.com' })
      .populate({
        path: 'roles',
        populate: {
          path: 'permissions'
        }
      });

    if (!manager) {
      console.log('❌ Manager not found');
      return;
    }

    console.log(`\n👤 Testing with: ${manager.firstName} ${manager.lastName} (${manager.email})`);

    // Generate token using the same method as authController
    const token = authService.generateToken(manager);
    console.log(`✅ Generated token for manager`);

    // Test the API endpoint directly
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`📡 API Response Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Orders API working! Found ${data.length || 0} orders`);
      } else {
        const errorData = await response.json();
        console.log(`❌ Orders API failed: ${errorData.message}`);
      }
    } catch (apiError) {
      console.log(`❌ API call failed: ${apiError.message}`);
    }

    // Test the /api/users/me endpoint
    try {
      const response = await fetch('http://localhost:5000/api/users/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`📡 /api/users/me Response Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ /api/users/me working! User: ${data.user?.firstName} ${data.user?.lastName}`);
      } else {
        const errorData = await response.json();
        console.log(`❌ /api/users/me failed: ${errorData.message}`);
      }
    } catch (apiError) {
      console.log(`❌ /api/users/me call failed: ${apiError.message}`);
    }

    await mongoose.connection.close();
    console.log('\n✅ Orders API test completed!');

  } catch (error) {
    console.error('❌ Orders API test failed:', error);
    process.exit(1);
  }
}

testOrdersAPI();
