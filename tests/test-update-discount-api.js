const mongoose = require('mongoose');
require('dotenv').config();

// Import models and services
const User = require('./models/User');
const { generateToken } = require('./services/authService');

async function testUpdateDiscountAPI() {
  try {
    console.log('🧪 TESTING UPDATE DISCOUNT API');
    console.log('===============================\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.CONNECTION_STRING || 'mongodb://localhost:27017/Ressichem', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'Ressichem'
    });
    console.log('✅ Connected to MongoDB');

    // Find a manager user
    const manager = await User.findOne({ 
      email: 'sales@ressichem.com'
    });

    if (!manager) {
      console.log('❌ Manager not found');
      return;
    }

    console.log(`👤 Found manager: ${manager.email}`);

    // Generate a token
    const token = await generateToken(manager, "15m");
    console.log(`🔑 Generated token`);

    // Test the API endpoint
    const response = await fetch('http://localhost:5000/api/orders/update-discount', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        approvalId: 'test-approval-id',
        discountAmount: 100,
        comments: 'Test discount update'
      })
    });

    console.log(`📡 API Response Status: ${response.status}`);
    console.log(`📡 API Response OK: ${response.ok}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ API Response:`, data);
    } else {
      const errorData = await response.text();
      console.log(`❌ API Error:`, errorData);
    }

  } catch (error) {
    console.error('❌ Error testing update discount API:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
testUpdateDiscountAPI();
