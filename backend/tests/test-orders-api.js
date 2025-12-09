// Test the orders API endpoint directly
const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role');
const Permission = require('./models/Permission');
const jwt = require('jsonwebtoken');

async function testOrdersAPI() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB - Database: Ressichem');

    // Find the user with populated roles and permissions
    const user = await User.findOne({ email: 'yousuf@gmail.com' })
      .populate({
        path: 'roles',
        populate: {
          path: 'permissions',
          model: 'Permission'
        }
      });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    // Get all permissions from user's roles
    const userPermissions = [];
    if (user.roles && user.roles.length > 0) {
      for (const role of user.roles) {
        for (const permission of role.permissions) {
          userPermissions.push(permission.key);
        }
      }
    }

    // Create a JWT token
    const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
    const tokenPayload = {
      _id: user._id,
      user_id: user.user_id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      company_id: user.company_id,
      isCustomer: user.isCustomer,
      isActive: user.isActive,
      permissions: userPermissions
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });
    console.log('🔐 JWT Token created successfully');
    console.log(`   Has orders.read: ${userPermissions.includes('orders.read')}`);

    // Test the API endpoint
    const fetch = require('node-fetch');
    const response = await fetch('http://localhost:5000/api/orders', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`\n📡 API Response: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Orders fetched successfully: ${data.length} orders`);
    } else {
      const errorText = await response.text();
      console.log(`❌ API Error: ${errorText}`);
    }

    await mongoose.connection.close();
    console.log('\n✅ Orders API test completed!');

  } catch (error) {
    console.error('❌ Orders API test failed:', error);
    process.exit(1);
  }
}

testOrdersAPI();
