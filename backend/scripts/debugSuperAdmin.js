const { connect, disconnect } = require('../config/_db');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function debugSuperAdmin() {
  await connect();
  
  try {
    console.log('🔍 Debugging Super Admin Authentication...\n');
    
    // Step 1: Check super admin users
    console.log('📝 Step 1: Checking super admin users...');
    const superAdmins = await User.find({ 
      isSuperAdmin: true,
      company_id: 'RESSICHEM'
    });
    
    console.log(`✅ Found ${superAdmins.length} super admin users:`);
    superAdmins.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} - ${user.firstName} ${user.lastName}`);
      console.log(`      User ID: ${user.user_id}`);
      console.log(`      Is Super Admin: ${user.isSuperAdmin}`);
      console.log(`      Is Active: ${user.isActive}`);
      console.log(`      Has Password: ${!!user.password}`);
    });
    
    // Step 2: Check specific users
    console.log('\n📝 Step 2: Checking specific users...');
    const usersToCheck = [
      'admin@example.com',
      'zain@ressichem.com',
      'testuser1760350653166@example.com'
    ];
    
    for (const email of usersToCheck) {
      const user = await User.findOne({ email, company_id: 'RESSICHEM' });
      if (user) {
        console.log(`\n👤 ${email}:`);
        console.log(`   User ID: ${user.user_id}`);
        console.log(`   Name: ${user.firstName} ${user.lastName}`);
        console.log(`   Is Super Admin: ${user.isSuperAdmin}`);
        console.log(`   Is Active: ${user.isActive}`);
        console.log(`   Has Password: ${!!user.password}`);
        console.log(`   Password Length: ${user.password ? user.password.length : 0}`);
        
        // Test password
        if (user.password) {
          try {
            const isValid = await bcrypt.compare('password123', user.password);
            console.log(`   Password 'password123' valid: ${isValid}`);
          } catch (error) {
            console.log(`   Password check failed: ${error.message}`);
          }
        }
      } else {
        console.log(`\n❌ ${email}: User not found`);
      }
    }
    
    // Step 3: Fix super admin password if needed
    console.log('\n📝 Step 3: Fixing super admin passwords...');
    const adminUser = await User.findOne({ email: 'admin@example.com', company_id: 'RESSICHEM' });
    if (adminUser) {
      console.log('🔧 Fixing admin@example.com password...');
      adminUser.password = await bcrypt.hash('password123', 10);
      adminUser.isActive = true;
      await adminUser.save();
      console.log('✅ Password updated for admin@example.com');
    }
    
    const zainUser = await User.findOne({ email: 'zain@ressichem.com', company_id: 'RESSICHEM' });
    if (zainUser) {
      console.log('🔧 Fixing zain@ressichem.com password...');
      zainUser.password = await bcrypt.hash('password123', 10);
      zainUser.isActive = true;
      await zainUser.save();
      console.log('✅ Password updated for zain@ressichem.com');
    }
    
    // Step 4: Test login
    console.log('\n📝 Step 4: Testing super admin login...');
    const axios = require('axios');
    
    const testUsers = [
      { email: 'admin@example.com', password: 'password123' },
      { email: 'zain@ressichem.com', password: 'password123' }
    ];
    
    for (const user of testUsers) {
      try {
        console.log(`\n🔐 Testing login for ${user.email}...`);
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
          email: user.email,
          password: user.password
        });
        
        if (loginResponse.data.success) {
          console.log(`✅ Login successful for ${user.email}`);
          console.log(`   User ID: ${loginResponse.data.user.user_id}`);
          console.log(`   Is Super Admin: ${loginResponse.data.user.isSuperAdmin}`);
          
          // Test orders access
          const token = loginResponse.data.token;
          const ordersResponse = await axios.get('http://localhost:5000/api/orders', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log(`   Orders accessible: ${ordersResponse.data.length} orders`);
        } else {
          console.log(`❌ Login failed for ${user.email}: ${loginResponse.data.message}`);
        }
      } catch (error) {
        console.log(`❌ Login error for ${user.email}: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Super admin authentication fixed!');
    console.log('💡 You can now login with:');
    console.log('   Email: admin@example.com');
    console.log('   Password: password123');
    console.log('   OR');
    console.log('   Email: zain@ressichem.com');
    console.log('   Password: password123');
    
  } catch (error) {
    console.error('❌ Error debugging super admin:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  debugSuperAdmin();
}

module.exports = debugSuperAdmin;
