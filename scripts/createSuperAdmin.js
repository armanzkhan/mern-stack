const { connect, disconnect } = require('../config/_db');
const User = require('../models/User');
const Role = require('../models/Role');

async function createSuperAdmin() {
  await connect();
  
  try {
    console.log('🔍 Creating Working Super Admin...\n');
    
    // Step 1: Check if super admin already exists
    console.log('📝 Step 1: Checking existing super admin...');
    let superAdmin = await User.findOne({ 
      email: 'superadmin@ressichem.com',
      company_id: 'RESSICHEM'
    });
    
    if (superAdmin) {
      console.log('✅ Super admin already exists, updating...');
      // Update existing user
      superAdmin.isSuperAdmin = true;
      superAdmin.isActive = true;
      await superAdmin.save();
    } else {
      console.log('📝 Step 2: Creating new super admin...');
      superAdmin = new User({
        user_id: `super_admin_${Date.now()}`,
        firstName: 'Super',
        lastName: 'Admin',
        email: 'superadmin@ressichem.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password123
        phone: '+1234567890',
        department: 'Administration',
        company_id: 'RESSICHEM',
        roles: [],
        isSuperAdmin: true,
        isActive: true
      });
      
      await superAdmin.save();
      console.log('✅ Super admin created successfully');
    }
    
    // Step 3: Test login
    console.log('\n📝 Step 3: Testing super admin login...');
    const axios = require('axios');
    
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'superadmin@ressichem.com',
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
        console.log('   Email: superadmin@ressichem.com');
        console.log('   Password: password123');
        console.log('   This user has full super admin access to all orders and features!');
        
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
    console.error('❌ Error creating super admin:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  createSuperAdmin();
}

module.exports = createSuperAdmin;
