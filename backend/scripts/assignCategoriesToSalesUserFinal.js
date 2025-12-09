const mongoose = require('mongoose');
const User = require('../models/User');
const Manager = require('../models/Manager');
const CategoryAssignment = require('../models/CategoryAssignment');

async function assignCategoriesToSalesUserFinal() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 Final category assignment for sales user...');

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

    // Categories to assign
    const categoriesToAssign = [
      'Epoxy Floorings & Coatings',
      'Building Care & Maintenance', 
      'Resins',
      'Hardeners'
    ];

    console.log('\n📋 Assigning categories:');
    categoriesToAssign.forEach((category, index) => {
      console.log(`   ${index + 1}. ${category}`);
    });

    // Update user's manager profile with assigned categories
    salesUser.managerProfile = {
      ...salesUser.managerProfile,
      assignedCategories: categoriesToAssign,
      managerLevel: 'senior',
      canAssignCategories: false,
      notificationPreferences: {
        orderUpdates: true,
        stockAlerts: true,
        statusChanges: true,
        newOrders: true,
        lowStock: true,
        categoryReports: true
      }
    };

    await salesUser.save();
    console.log('✅ User manager profile updated');

    // Update or create Manager record
    let manager = await Manager.findOne({ user_id: salesUser.user_id });
    
    if (manager) {
      // Update existing manager
      manager.assignedCategories = categoriesToAssign.map(category => ({
        category,
        assignedBy: salesUser._id,
        assignedAt: new Date(),
        isActive: true
      }));
      manager.managerLevel = 'senior';
      await manager.save();
      console.log('✅ Manager record updated');
    } else {
      // Create new manager record
      manager = new Manager({
        user_id: salesUser.user_id,
        company_id: salesUser.company_id,
        assignedCategories: categoriesToAssign.map(category => ({
          category,
          assignedBy: salesUser._id,
          assignedAt: new Date(),
          isActive: true
        })),
        managerLevel: 'senior',
        notificationPreferences: {
          orderUpdates: true,
          stockAlerts: true,
          statusChanges: true,
          newOrders: true,
          lowStock: true,
          categoryReports: true
        },
        isActive: true,
        createdBy: salesUser._id
      });
      
      await manager.save();
      console.log('✅ Manager record created');
    }

    // Create category assignments
    for (const category of categoriesToAssign) {
      const assignment = new CategoryAssignment({
        manager_id: manager._id,
        user_id: salesUser.user_id,
        company_id: salesUser.company_id,
        category,
        assignedBy: salesUser._id,
        isActive: true,
        isPrimary: true,
        permissions: {
          canUpdateStatus: true,
          canAddComments: true,
          canViewReports: true,
          canManageProducts: true
        }
      });
      
      await assignment.save();
      console.log(`✅ Category assignment created: ${category}`);
    }

    // Update user's manager profile with manager ID
    salesUser.managerProfile.manager_id = manager._id;
    await salesUser.save();

    console.log('\n🎉 Final Summary:');
    console.log('   ✅ User is Manager: Yes');
    console.log('   ✅ Manager Record: Created/Updated');
    console.log('   ✅ Assigned Categories: 4');
    console.log('   ✅ Category Assignments: 4');
    console.log('   ✅ Manager Level: Senior');
    console.log('   ✅ Notification Preferences: Set');

    console.log('\n📋 Assigned Categories:');
    categoriesToAssign.forEach((category, index) => {
      console.log(`   ${index + 1}. ${category}`);
    });

    console.log('\n🚀 Sales user is now ready for manager dashboard!');
    console.log('   - Login with: sales@ressichem.com');
    console.log('   - Access manager dashboard at: /manager-dashboard');
    console.log('   - Should see assigned categories and manage orders');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

assignCategoriesToSalesUserFinal();
