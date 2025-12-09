const mongoose = require('mongoose');
require('dotenv').config();

// Import models and services
const User = require('./models/User');
const { generateToken } = require('./services/authService');
const permissionMiddleware = require('./middleware/permissionMiddleware');

async function testPermissionMiddleware() {
  try {
    console.log('🧪 TESTING PERMISSION MIDDLEWARE');
    console.log('=================================\n');

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
    }).populate({
      path: 'roles',
      populate: {
        path: 'permissions'
      }
    });

    if (!manager) {
      console.log('❌ Manager not found');
      return;
    }

    console.log(`👤 Found manager: ${manager.email}`);
    console.log(`   Roles: ${manager.roles.length} roles`);
    console.log(`   Direct permissions: ${manager.permissions?.length || 0} permissions`);

    // Generate a token
    const token = await generateToken(manager, "15m");
    console.log(`🔑 Generated token: ${token.substring(0, 50)}...`);

    // Decode the token to see what's in it
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    console.log(`📋 Decoded token payload:`, {
      user_id: decoded.user_id,
      company_id: decoded.company_id,
      isSuperAdmin: decoded.isSuperAdmin,
      hasPerms: !!decoded.perms
    });

    // Decrypt the permissions
    const { decryptObject } = require('./utils/crypto');
    if (decoded.perms) {
      try {
        const decrypted = decryptObject(decoded.perms);
        console.log(`🔐 Decrypted permissions:`, decrypted);
        
        // Simulate the req.user object
        const reqUser = { ...decoded, ...decrypted };
        console.log(`👤 Simulated req.user:`, {
          user_id: reqUser.user_id,
          company_id: reqUser.company_id,
          isSuperAdmin: reqUser.isSuperAdmin,
          permissions: reqUser.permissions,
          roles: reqUser.roles
        });

        // Test permission check
        console.log(`\n🔍 Testing permission check for 'orders.update':`);
        const userPermissions = reqUser.permissions || [];
        const userPermissionKeys = userPermissions.map(perm => {
          if (typeof perm === 'string') return perm;
          if (perm && perm.key) return perm.key;
          return null;
        }).filter(key => key !== null);
        
        console.log(`   User permission keys:`, userPermissionKeys);
        console.log(`   Has 'orders.update': ${userPermissionKeys.includes('orders.update')}`);

      } catch (e) {
        console.error('❌ Failed to decrypt permissions:', e.message);
      }
    }

  } catch (error) {
    console.error('❌ Error testing permission middleware:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
testPermissionMiddleware();
