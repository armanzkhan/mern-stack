// Test manager access to orders
const mongoose = require('mongoose');
const User = require('./models/User');
const authService = require('./services/authService');

async function testManagerOrdersAccess() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB - Database: Ressichem');

    console.log('\n🧪 TESTING MANAGER ORDERS ACCESS:');
    
    // Test with sales@ressichem.com
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
    console.log(`   Is Manager: ${manager.isManager}`);
    console.log(`   Is Active: ${manager.isActive}`);
    console.log(`   Roles: ${manager.roles?.length || 0}`);

    // Generate JWT token for the manager
    try {
      const token = authService.generateToken(manager);
      console.log(`✅ Generated JWT token for manager`);
      console.log(`   Token length: ${token.length} characters`);
      
      // Decode and verify the token
      const decoded = authService.verifyToken(token);
      console.log(`✅ Token verified successfully`);
      console.log(`   User ID: ${decoded.userId}`);
      console.log(`   Email: ${decoded.email}`);
      console.log(`   Permissions: ${decoded.permissions?.length || 0}`);
      
      if (decoded.permissions) {
        console.log('   Permission keys:');
        decoded.permissions.forEach(perm => {
          console.log(`     * ${perm}`);
        });
      }
      
    } catch (tokenError) {
      console.log('❌ Token generation/verification failed:', tokenError.message);
    }

    // Test permissions specifically
    console.log('\n🔐 CHECKING SPECIFIC PERMISSIONS:');
    const requiredPermissions = ['orders.read', 'orders.create'];
    
    for (const perm of requiredPermissions) {
      const hasPermission = manager.roles?.some(role => 
        role.permissions?.some(p => p.key === perm)
      );
      console.log(`   ${perm}: ${hasPermission ? '✅' : '❌'}`);
    }

    await mongoose.connection.close();
    console.log('\n✅ Manager orders access test completed!');

  } catch (error) {
    console.error('❌ Manager orders access test failed:', error);
    process.exit(1);
  }
}

testManagerOrdersAccess();
