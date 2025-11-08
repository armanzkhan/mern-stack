// Test complete authentication flow
const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role');
const Permission = require('./models/Permission');
const { generateToken } = require('./services/authService');
const jwt = require('jsonwebtoken');

async function testCompleteAuth() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB - Database: Ressichem');

    // Find the user with populated roles and permissions
    const user = await User.findOne({ email: 'yousuf@gmail.com' })
      .populate({
        path: 'roles',
        populate: {
          path: 'permissions'
        }
      })
      .populate('permissions');

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('\n👤 User Details:');
    console.log(`   _id: ${user._id}`);
    console.log(`   user_id: ${user.user_id}`);
    console.log(`   email: ${user.email}`);
    console.log(`   company_id: ${user.company_id}`);

    // Generate token using the authService
    console.log('\n🔐 Generating token using authService...');
    const token = await generateToken(user, "15m");
    console.log(`✅ Token generated: ${token.substring(0, 50)}...`);

    // Decode and verify the token
    const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('\n🔍 Decoded token:');
    console.log(`   user_id: ${decoded.user_id}`);
    console.log(`   _id: ${decoded._id}`);
    console.log(`   company_id: ${decoded.company_id}`);
    console.log(`   isSuperAdmin: ${decoded.isSuperAdmin}`);
    console.log(`   perms: ${decoded.perms ? 'Encrypted' : 'Not found'}`);

    // Decrypt permissions
    if (decoded.perms) {
      const { decryptObject } = require('./utils/crypto');
      try {
        const decrypted = decryptObject(decoded.perms);
        console.log('\n🔓 Decrypted permissions:');
        console.log(`   roles: ${decrypted.roles?.length || 0}`);
        console.log(`   permissions: ${decrypted.permissions?.length || 0}`);
        console.log(`   Has orders.read: ${decrypted.permissions?.includes('orders.read') || false}`);
        
        if (decrypted.permissions) {
          console.log('   Permission list:');
          decrypted.permissions.forEach(perm => {
            console.log(`     * ${perm}`);
          });
        }
      } catch (error) {
        console.log('❌ Failed to decrypt permissions:', error.message);
      }
    }

    await mongoose.connection.close();
    console.log('\n✅ Complete auth test completed!');

  } catch (error) {
    console.error('❌ Complete auth test failed:', error);
    process.exit(1);
  }
}

testCompleteAuth();
