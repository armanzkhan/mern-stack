const { connect, disconnect } = require('../config/_db');
const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');

async function testUserPopulate() {
  await connect();
  
  try {
    console.log('🔍 Testing User Population...\n');
    
    // Test 1: Find user without populate
    console.log('📋 Test 1: User without populate');
    const userWithoutPopulate = await User.findOne({ email: 'flowtest@example.com' });
    console.log('   User ID:', userWithoutPopulate._id);
    console.log('   Roles (raw):', userWithoutPopulate.roles);
    console.log('   Permissions (raw):', userWithoutPopulate.permissions);
    
    // Test 2: Find user with populate
    console.log('\n📋 Test 2: User with populate');
    const userWithPopulate = await User.findOne({ email: 'flowtest@example.com' })
      .populate('roles')
      .populate('permissions');
    
    console.log('   User ID:', userWithPopulate._id);
    console.log('   Roles (populated):', userWithPopulate.roles);
    console.log('   Permissions (populated):', userWithPopulate.permissions);
    
    // Test 3: Check if roles have permissions
    if (userWithPopulate.roles && userWithPopulate.roles.length > 0) {
      console.log('\n📋 Test 3: Role permissions');
      for (let i = 0; i < userWithPopulate.roles.length; i++) {
        const role = userWithPopulate.roles[i];
        console.log(`   Role ${i + 1}: ${role.name}`);
        console.log(`   Role permissions:`, role.permissions);
      }
    }
    
    // Test 4: Deep populate roles with permissions
    console.log('\n📋 Test 4: Deep populate roles with permissions');
    const userDeepPopulate = await User.findOne({ email: 'flowtest@example.com' })
      .populate({
        path: 'roles',
        populate: {
          path: 'permissions'
        }
      })
      .populate('permissions');
    
    console.log('   User ID:', userDeepPopulate._id);
    console.log('   Roles (deep populated):', userDeepPopulate.roles);
    console.log('   Permissions (populated):', userDeepPopulate.permissions);
    
    if (userDeepPopulate.roles && userDeepPopulate.roles.length > 0) {
      console.log('\n📋 Test 5: Role permissions (deep populated)');
      for (let i = 0; i < userDeepPopulate.roles.length; i++) {
        const role = userDeepPopulate.roles[i];
        console.log(`   Role ${i + 1}: ${role.name}`);
        console.log(`   Role permissions:`, role.permissions);
        if (role.permissions && role.permissions.length > 0) {
          role.permissions.forEach((perm, idx) => {
            console.log(`     Permission ${idx + 1}: ${perm.key} - ${perm.description}`);
          });
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  testUserPopulate();
}

module.exports = testUserPopulate;
