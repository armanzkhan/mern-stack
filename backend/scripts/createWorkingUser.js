const { connect, disconnect } = require('../config/_db');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function createWorkingUser() {
  await connect();
  
  try {
    console.log('🔍 Creating Working User...\n');
    
    // Step 1: Check if user already exists
    console.log('📝 Step 1: Checking if user exists...');
    const existingUser = await User.findOne({ email: 'test@ressichem.com' });
    
    if (existingUser) {
      console.log('✅ User already exists, updating password...');
      existingUser.password = await bcrypt.hash('password123', 10);
      await existingUser.save();
      console.log('✅ Password updated successfully');
    } else {
      console.log('📝 Step 2: Creating new user...');
      const newUser = new User({
        user_id: `user_${Date.now()}`,
        firstName: 'Test',
        lastName: 'User',
        email: 'test@ressichem.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+1234567890',
        department: 'IT',
        company_id: 'RESSICHEM',
        roles: [], // Will be assigned later
        isActive: true
      });
      
      await newUser.save();
      console.log('✅ User created successfully');
    }
    
    // Step 3: Test login
    console.log('\n📝 Step 3: Testing login...');
    const axios = require('axios');
    
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'test@ressichem.com',
        password: 'password123'
      });
      
      if (loginResponse.data.success) {
        console.log('✅ Login successful');
        console.log('   User ID:', loginResponse.data.user.user_id);
        console.log('   Email:', loginResponse.data.user.email);
        console.log('   Name:', loginResponse.data.user.firstName, loginResponse.data.user.lastName);
      } else {
        console.log('❌ Login failed:', loginResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Login test failed:', error.message);
    }
    
    console.log('\n🎉 Working user created!');
    console.log('💡 You can now login with:');
    console.log('   Email: test@ressichem.com');
    console.log('   Password: password123');
    
  } catch (error) {
    console.error('❌ Error creating user:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  createWorkingUser();
}

module.exports = createWorkingUser;
