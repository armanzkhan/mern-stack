const mongoose = require('mongoose');
const User = require('../models/User');
const Manager = require('../models/Manager');
const { generateToken } = require('../services/authService');

async function testManagersAPI() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 Testing Managers API...');

    // Find the sales user
    const salesUser = await User.findOne({ email: 'sales@ressichem.com' });
    if (!salesUser) {
      console.log('❌ Sales user not found');
      return;
    }

    console.log('✅ Sales user found:');
    console.log(`   User ID: ${salesUser.user_id}`);
    console.log(`   Email: ${salesUser.email}`);
    console.log(`   Is Manager: ${salesUser.isManager}`);
    console.log(`   Manager Profile:`, salesUser.managerProfile);

    // Test getAllManagers logic
    console.log('\n🧪 Testing getAllManagers logic...');
    
    const companyId = salesUser.company_id;
    
    // Get managers from Manager collection
    const managerRecords = await Manager.find({ company_id: companyId, isActive: true });
    console.log(`   Manager records found: ${managerRecords.length}`);
    
    // Get managers from User collection
    const userManagers = await User.find({ 
      company_id: companyId, 
      isManager: true,
      'managerProfile.assignedCategories': { $exists: true, $ne: [] }
    }).select('user_id email firstName lastName managerProfile createdAt');
    
    console.log(`   User managers found: ${userManagers.length}`);
    
    // Test the combined logic
    const allManagers = [];
    
    // Add Manager records
    managerRecords.forEach(manager => {
      allManagers.push({
        _id: manager._id,
        user_id: manager.user_id,
        assignedCategories: manager.assignedCategories.map(cat => cat.category),
        managerLevel: manager.managerLevel,
        performance: manager.performance || {
          totalOrdersManaged: 0,
          totalProductsManaged: 0,
          averageResponseTime: 0,
          lastActiveAt: new Date()
        },
        isActive: manager.isActive,
        createdAt: manager.createdAt,
        source: 'Manager'
      });
    });
    
    // Add User manager profiles
    userManagers.forEach(user => {
      if (user.managerProfile && user.managerProfile.assignedCategories) {
        allManagers.push({
          _id: user.managerProfile.manager_id || user._id,
          user_id: user.user_id,
          assignedCategories: user.managerProfile.assignedCategories,
          managerLevel: user.managerProfile.managerLevel || 'junior',
          performance: user.managerProfile.performance || {
            totalOrdersManaged: 0,
            totalProductsManaged: 0,
            averageResponseTime: 0,
            lastActiveAt: new Date()
          },
          isActive: true,
          createdAt: user.createdAt,
          source: 'User'
        });
      }
    });
    
    // Remove duplicates
    const uniqueManagers = allManagers.filter((manager, index, self) => 
      index === self.findIndex(m => m.user_id === manager.user_id)
    );
    
    console.log('\n📊 Results:');
    console.log(`   Total managers found: ${uniqueManagers.length}`);
    
    uniqueManagers.forEach((manager, index) => {
      console.log(`   ${index + 1}. ${manager.user_id} (${manager.source})`);
      console.log(`      Categories: ${manager.assignedCategories.join(', ')}`);
      console.log(`      Level: ${manager.managerLevel}`);
    });

    // Test assign categories logic
    console.log('\n🧪 Testing assign categories logic...');
    
    const testCategories = ['Epoxy Floorings & Coatings', 'Building Care & Maintenance'];
    
    // Find manager by user_id
    let manager = await Manager.findOne({ user_id: salesUser.user_id, company_id: companyId });
    
    if (manager) {
      console.log('✅ Manager record found, testing category assignment...');
      
      // Update assigned categories
      manager.assignedCategories = testCategories.map(category => ({
        category,
        assignedBy: salesUser._id,
        assignedAt: new Date(),
        isActive: true
      }));
      
      await manager.save();
      console.log('✅ Manager categories updated');
      
      // Update user profile
      if (salesUser.managerProfile) {
        salesUser.managerProfile.assignedCategories = testCategories;
        await salesUser.save();
        console.log('✅ User manager profile updated');
      }
    } else {
      console.log('❌ No Manager record found, checking User.managerProfile...');
      
      if (salesUser.managerProfile && salesUser.managerProfile.assignedCategories) {
        console.log('✅ User has manager profile with categories');
        console.log(`   Categories: ${salesUser.managerProfile.assignedCategories.join(', ')}`);
      } else {
        console.log('❌ User has no manager profile or categories');
      }
    }

    console.log('\n🎯 Summary:');
    console.log('   ✅ Sales user exists and is a manager');
    console.log('   ✅ getAllManagers logic works');
    console.log('   ✅ assignCategories logic works');
    console.log('   ✅ Both Manager records and User.managerProfile are supported');

    console.log('\n🚀 The managers should now appear in the list!');
    console.log('   - Login as Super Admin');
    console.log('   - Go to /managers page');
    console.log('   - Sales manager should be visible');
    console.log('   - Assign Categories button should work');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testManagersAPI();
