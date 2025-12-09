const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Role = require('./models/Role');
const Permission = require('./models/Permission');

async function checkSalesRolePermissions() {
  try {
    console.log('🔍 CHECKING SALES ROLE PERMISSIONS');
    console.log('==================================\n');

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

    console.log(`👤 Sales User: ${salesUser.email}`);
    console.log(`   Roles: ${salesUser.roles?.length || 0} roles`);

    // Get detailed role information
    if (salesUser.roles && salesUser.roles.length > 0) {
      const roles = await Role.find({ _id: { $in: salesUser.roles } }).populate('permissions');
      
      for (const role of roles) {
        console.log(`\n📋 Role: ${role.name} (${role._id})`);
        console.log(`   Description: ${role.description || 'No description'}`);
        console.log(`   Company ID: ${role.company_id || 'No company ID'}`);
        console.log(`   Is Active: ${role.isActive}`);
        console.log(`   Permissions: ${role.permissions?.length || 0} permissions`);
        
        if (role.permissions && role.permissions.length > 0) {
          console.log(`   Permission Details:`);
          role.permissions.forEach(perm => {
            console.log(`     - ${perm.key}: ${perm.name || 'No name'} (${perm._id})`);
          });
        }
      }
    }

    // Check if there are notification-related permissions
    const notificationPermissions = await Permission.find({ 
      $or: [
        { key: { $regex: /notification/ } },
        { key: { $regex: /admin/ } }
      ]
    });
    
    console.log(`\n🔔 Notification & Admin Permissions Available (${notificationPermissions.length}):`);
    notificationPermissions.forEach(perm => {
      console.log(`   - ${perm.key}: ${perm.name || 'No name'} (${perm._id})`);
    });

  } catch (error) {
    console.error('❌ Error checking sales role permissions:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the check
checkSalesRolePermissions();
