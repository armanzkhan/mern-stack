const { connect, disconnect } = require('../config/_db');
const User = require('../models/User');

async function makeUserSuperAdmin() {
  await connect();
  
  try {
    console.log('🔍 Making User Super Admin...\n');
    
    // Step 1: Find a working user
    console.log('📝 Step 1: Finding working user...');
    const workingUser = await User.findOne({ 
      email: 'flowtest@example.com',
      company_id: 'RESSICHEM'
    });
    
    if (!workingUser) {
      console.log('❌ Working user not found');
      return;
    }
    
    console.log('✅ Found working user:', workingUser.email);
    console.log('   User ID:', workingUser.user_id);
    console.log('   Current isSuperAdmin:', workingUser.isSuperAdmin);
    
    // Step 2: Make user super admin
    console.log('\n📝 Step 2: Making user super admin...');
    workingUser.isSuperAdmin = true;
    await workingUser.save();
    
    console.log('✅ User is now super admin');
    console.log('   New isSuperAdmin:', workingUser.isSuperAdmin);
    
    // Step 3: Test login
    console.log('\n📝 Step 3: Testing super admin login...');
    const axios = require('axios');
    
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'flowtest@example.com',
        password: 'password123'
      });
      
      if (loginResponse.data.success) {
        console.log('✅ Super admin login successful');
        console.log('   User ID:', loginResponse.data.user.user_id);
        console.log('   Email:', loginResponse.data.user.email);
        console.log('   Is Super Admin:', loginResponse.data.user.isSuperAdmin);
        
        // Test orders access
        const token = loginResponse.data.token;
        const ordersResponse = await axios.get('http://localhost:5000/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`   Orders accessible: ${ordersResponse.data.length} orders`);
        console.log('   Latest orders:');
        ordersResponse.data.slice(0, 3).forEach((order, index) => {
          console.log(`     ${index + 1}. ${order.orderNumber} - ${order.status}`);
        });
        
        // Test frontend API proxy
        try {
          const frontendResponse = await axios.get('http://localhost:3000/api/orders', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          console.log(`   Frontend proxy: ${frontendResponse.data.length} orders`);
        } catch (error) {
          console.log(`   Frontend proxy failed: ${error.message}`);
        }
        
        console.log('\n🎉 Super admin is working!');
        console.log('💡 You can now login with:');
        console.log('   Email: flowtest@example.com');
        console.log('   Password: password123');
        console.log('   This user now has super admin privileges!');
        
      } else {
        console.log('❌ Super admin login failed:', loginResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Super admin login test failed:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data?.message || 'Unknown error');
      }
    }
    
  } catch (error) {
    console.error('❌ Error making user super admin:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  makeUserSuperAdmin();
}

module.exports = makeUserSuperAdmin;
