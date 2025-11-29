/**
 * Diagnostic Script: Find Missing Managers
 * 
 * This script helps identify why some managers show on localhost but not on deployed site.
 * It checks:
 * 1. All users with manager-related flags
 * 2. All Manager records
 * 3. Which managers would be returned by getAllManagers query
 * 4. Differences between what exists and what would be returned
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Manager = require('../models/Manager');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.CONNECTION_STRING || 
  "mongodb+srv://armanzaman4_db_user:1JJORz7jP2VFgTaP@cluster0.qn1babq.mongodb.net/Ressichem?retryWrites=true&w=majority";

async function diagnoseMissingManagers() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "Ressichem"
    });
    console.log('✅ Connected to MongoDB\n');

    const companyId = "RESSICHEM";

    console.log('🔍 DIAGNOSING MISSING MANAGERS');
    console.log('================================\n');

    // 1. Get all Manager records
    console.log('1️⃣ MANAGER COLLECTION');
    console.log('----------------------');
    const managerRecords = await Manager.find({ 
      company_id: companyId,
      isActive: { $ne: false }
    }).sort({ createdAt: -1 });

    console.log(`Found ${managerRecords.length} Manager records:`);
    managerRecords.forEach((m, index) => {
      console.log(`  ${index + 1}. Manager ID: ${m._id}`);
      console.log(`     User ID: ${m.user_id}`);
      console.log(`     Is Active: ${m.isActive}`);
      console.log(`     Categories: ${m.assignedCategories?.length || 0}`);
    });
    console.log('');

    // 2. Get all users that might be managers
    console.log('2️⃣ USER COLLECTION - POTENTIAL MANAGERS');
    console.log('----------------------------------------');
    const userManagers = await User.find({ 
      company_id: companyId, 
      $or: [
        { isManager: true },
        { userType: 'manager' },
        { role: 'Manager' },
        { 'managerProfile.manager_id': { $exists: true } }
      ],
      isActive: { $ne: false }
    }).select('user_id email firstName lastName managerProfile isActive createdAt userType role isManager');

    console.log(`Found ${userManagers.length} users with manager-related flags:`);
    userManagers.forEach((u, index) => {
      console.log(`  ${index + 1}. ${u.email || 'No email'}`);
      console.log(`     User ID: ${u.user_id}`);
      console.log(`     isManager: ${u.isManager}`);
      console.log(`     userType: ${u.userType || 'N/A'}`);
      console.log(`     role: ${u.role || 'N/A'}`);
      console.log(`     isActive: ${u.isActive}`);
      console.log(`     has managerProfile: ${!!u.managerProfile}`);
      console.log(`     managerProfile.manager_id: ${u.managerProfile?.manager_id || 'None'}`);
    });
    console.log('');

    // 3. Simulate getAllManagers query
    console.log('3️⃣ SIMULATING getAllManagers QUERY');
    console.log('-----------------------------------');
    const allManagers = [];

    // Add Manager records
    for (const manager of managerRecords) {
      const user = await User.findOne({ user_id: manager.user_id, company_id: companyId })
        .select('firstName lastName email');
      
      allManagers.push({
        _id: manager._id,
        user_id: manager.user_id,
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
        source: 'Manager'
      });
    }

    // Add User manager profiles
    userManagers.forEach(user => {
      const alreadyAdded = allManagers.some(m => m.user_id === user.user_id);
      
      if (!alreadyAdded) {
        allManagers.push({
          _id: user.managerProfile?.manager_id || user._id.toString(),
          user_id: user.user_id,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          source: 'User'
        });
      }
    });

    // Remove duplicates
    const uniqueManagers = allManagers.filter((manager, index, self) => 
      index === self.findIndex(m => m.user_id === manager.user_id)
    );

    console.log(`Would return ${uniqueManagers.length} managers:`);
    uniqueManagers.forEach((m, index) => {
      console.log(`  ${index + 1}. ${m.fullName || m.email || 'Unknown'} (${m.email || 'No email'})`);
      console.log(`     User ID: ${m.user_id}`);
      console.log(`     Source: ${m.source}`);
    });
    console.log('');

    // 4. Find managers that exist but wouldn't be returned
    console.log('4️⃣ MANAGERS THAT MIGHT BE MISSING');
    console.log('----------------------------------');
    
    // Get all Manager records (including inactive)
    const allManagerRecords = await Manager.find({ company_id: companyId });
    const allUserManagers = await User.find({ company_id: companyId });

    const missingManagers = [];

    // Check Manager records
    for (const manager of allManagerRecords) {
      const user = await User.findOne({ user_id: manager.user_id, company_id: companyId });
      if (!user) {
        missingManagers.push({
          type: 'Manager record without User',
          managerId: manager._id,
          userId: manager.user_id,
          isActive: manager.isActive
        });
      } else if (manager.isActive === false) {
        missingManagers.push({
          type: 'Manager with isActive: false',
          managerId: manager._id,
          userId: manager.user_id,
          email: user.email,
          isActive: manager.isActive
        });
      }
    }

    // Check User records that should be managers
    for (const user of allUserManagers) {
      if (user.isManager || user.role === 'Manager' || user.userType === 'manager') {
        const manager = await Manager.findOne({ user_id: user.user_id, company_id: companyId });
        if (!manager) {
          missingManagers.push({
            type: 'User with manager flags but no Manager record',
            userId: user.user_id,
            email: user.email,
            isManager: user.isManager,
            role: user.role,
            userType: user.userType
          });
        }
      }
    }

    if (missingManagers.length > 0) {
      console.log(`Found ${missingManagers.length} potential issues:`);
      missingManagers.forEach((m, index) => {
        console.log(`  ${index + 1}. ${m.type}`);
        if (m.email) console.log(`     Email: ${m.email}`);
        if (m.userId) console.log(`     User ID: ${m.userId}`);
        if (m.managerId) console.log(`     Manager ID: ${m.managerId}`);
        if (m.isActive !== undefined) console.log(`     Is Active: ${m.isActive}`);
      });
    } else {
      console.log('✅ No obvious issues found');
    }

    console.log('\n✅ Diagnosis complete!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  diagnoseMissingManagers()
    .then(() => {
      console.log('\n✅ All done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = diagnoseMissingManagers;

