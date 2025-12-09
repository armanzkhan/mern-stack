const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Role = require('./models/Role');
const Permission = require('./models/Permission');

async function testSalesAdminAccess() {
  try {
    console.log('🧪 TESTING SALES ADMIN ACCESS');
    console.log('==============================\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.CONNECTION_STRING || 'mongodb://localhost:27017/Ressichem', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'Ressichem'
    });
    console.log('✅ Connected to MongoDB');

    // Find sales user
    const salesUser = await User.findOne({ email: 'sales@ressichem.com' });
    
    if (!salesUser) {
      console.log('❌ Sales user not found');
      return;
    }

    console.log(`👤 Testing access for: ${salesUser.email}`);

    // Test permissions
    const testPermissions = [
      'admin.notifications',
      'notification.manage',
      'notification.view',
      'notifications.read'
    ];

    console.log('\n🔍 Permission Test Results:');
    
    for (const permKey of testPermissions) {
      const hasPermission = await checkPermission(salesUser, permKey);
      console.log(`   ${permKey}: ${hasPermission ? '✅' : '❌'}`);
    }

    // Test the fallback logic
    console.log('\n🔄 Testing Fallback Logic:');
    const hasAdminNotifications = await checkPermission(salesUser, 'admin.notifications');
    const hasNotificationManage = await checkPermission(salesUser, 'notification.manage');
    
    console.log(`   admin.notifications: ${hasAdminNotifications ? '✅' : '❌'}`);
    console.log(`   notification.manage: ${hasNotificationManage ? '✅' : '❌'}`);
    console.log(`   Should have access: ${hasAdminNotifications || hasNotificationManage ? '✅ YES' : '❌ NO'}`);

  } catch (error) {
    console.error('❌ Error testing sales admin access:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

async function checkPermission(user, permissionKey) {
  try {
    if (!user.roles || user.roles.length === 0) return false;
    
    const roles = await Role.find({ _id: { $in: user.roles } });
    for (const role of roles) {
      if (role.permissions && role.permissions.length > 0) {
        const permissions = await Permission.find({ _id: { $in: role.permissions } });
        const hasPermission = permissions.some(p => p.key === permissionKey);
        if (hasPermission) return true;
      }
    }
    return false;
  } catch (error) {
    console.error(`Error checking permission ${permissionKey}:`, error);
    return false;
  }
}

// Run the test
testSalesAdminAccess();
