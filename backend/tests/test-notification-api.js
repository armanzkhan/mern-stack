const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const jwt = require('jsonwebtoken');

async function testNotificationAPI() {
  try {
    console.log('🧪 TESTING NOTIFICATION API');
    console.log('==========================\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.CONNECTION_STRING || 'mongodb://localhost:27017/Ressichem', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'Ressichem'
    });
    console.log('✅ Connected to MongoDB');

    // Find the company admin user
    const companyAdmin = await User.findOne({ 
      $or: [
        { email: 'companyadmin@samplecompany.com' },
        { email: 'companyadmin@sampleadmin.com' }
      ]
    });

    if (!companyAdmin) {
      console.log('❌ Company admin user not found');
      return;
    }

    console.log(`👤 Found company admin: ${companyAdmin.email}`);

    // Create a test token
    const token = jwt.sign(
      {
        user_id: companyAdmin.user_id,
        email: companyAdmin.email,
        company_id: companyAdmin.company_id,
        roles: companyAdmin.roles,
        isCompanyAdmin: companyAdmin.isCompanyAdmin,
        isSuperAdmin: companyAdmin.isSuperAdmin
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    console.log('🔑 Generated test token');

    // Test the API endpoint
    const response = await fetch('http://localhost:5000/api/notifications/recent?limit=5', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📡 API Response Status: ${response.status}`);
    console.log(`📡 API Response OK: ${response.ok}`);

    if (response.ok) {
      const notifications = await response.json();
      console.log(`📊 Found ${notifications.length} notifications`);
      
      if (notifications.length > 0) {
        console.log('\n📋 Sample notifications:');
        notifications.slice(0, 3).forEach((notif, index) => {
          console.log(`   ${index + 1}. ${notif.title}`);
          console.log(`      Message: ${notif.message}`);
          console.log(`      Type: ${notif.type}`);
          console.log(`      Created: ${notif.createdAt}`);
          console.log('');
        });
      }
    } else {
      const errorData = await response.text();
      console.log(`❌ API Error: ${errorData}`);
    }

  } catch (error) {
    console.error('❌ Error testing notification API:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
testNotificationAPI();
