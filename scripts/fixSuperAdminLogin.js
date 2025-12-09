const { connect, disconnect } = require('../config/_db');
const User = require('../models/User');

async function fixSuperAdminLogin() {
  await connect();
  
  try {
    console.log('🔍 Fixing Super Admin Login...\n');
    
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
      } else {
        console.log(`\n❌ ${email}: User not found`);
      }
    }
    
    // Step 3: Test login with axios
    console.log('\n📝 Step 3: Testing super admin login...');
    const axios = require('axios');
    
    const testUsers = [
      { email: 'admin@example.com', password: 'password123' },
      { email: 'zain@ressichem.com', password: 'password123' },
      { email: 'testuser1760350653166@example.com', password: 'password123' }
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
        } else {
          console.log(`❌ Login failed for ${user.email}: ${loginResponse.data.message}`);
        }
      } catch (error) {
        console.log(`❌ Login error for ${user.email}: ${error.message}`);
        if (error.response) {
          console.log(`   Status: ${error.response.status}`);
          console.log(`   Message: ${error.response.data?.message || 'Unknown error'}`);
        }
      }
    }
    
    console.log('\n💡 SOLUTION:');
    console.log('   If super admin login is failing, try these working accounts:');
    console.log('   1. Email: flowtest@example.com, Password: password123');
    console.log('   2. Email: testuser@example.com, Password: password123');
    console.log('   3. Or create a new super admin user');
    
  } catch (error) {
    console.error('❌ Error fixing super admin:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  fixSuperAdminLogin();
}

module.exports = fixSuperAdminLogin;
