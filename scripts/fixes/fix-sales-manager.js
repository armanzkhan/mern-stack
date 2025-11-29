// Fix sales@ressichem.com manager configuration
const mongoose = require('mongoose');
const User = require('./models/User');

async function fixSalesManager() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB - Database: Ressichem');

    console.log('\n🔧 FIXING SALES@RESSICHEM.COM MANAGER CONFIGURATION:');
    
    // Find sales@ressichem.com user
    const salesUser = await User.findOne({ email: 'sales@ressichem.com' });
    
    if (!salesUser) {
      console.log('❌ sales@ressichem.com user not found');
      return;
    }

    console.log(`\n👤 Current user configuration:`);
    console.log(`   Email: ${salesUser.email}`);
    console.log(`   Is Manager: ${salesUser.isManager}`);
    console.log(`   Is Active: ${salesUser.isActive}`);
    console.log(`   User Type: ${salesUser.userType}`);
    console.log(`   Role: ${salesUser.role}`);

    // Fix manager configuration
    salesUser.isManager = true;
    salesUser.isActive = true;
    salesUser.role = 'Manager';
    salesUser.department = 'Sales';
    salesUser.userType = 'manager';
    
    // Add manager profile if not exists
    if (!salesUser.managerProfile) {
      salesUser.managerProfile = {
        manager_id: salesUser._id,
        assignedCategories: ['Epoxy Adhesives and Coatings', 'Construction Chemicals', 'Industrial Coatings'],
        managerLevel: 'senior',
        canAssignCategories: true,
        notificationPreferences: {
          orderUpdates: true,
          stockAlerts: true,
          statusChanges: true,
          newOrders: true,
          lowStock: true,
          categoryReports: true
        }
      };
    }

    await salesUser.save();
    console.log(`\n✅ Updated sales@ressichem.com configuration:`);
    console.log(`   Is Manager: ${salesUser.isManager}`);
    console.log(`   Is Active: ${salesUser.isActive}`);
    console.log(`   User Type: ${salesUser.userType}`);
    console.log(`   Role: ${salesUser.role}`);
    console.log(`   Manager Profile: ${salesUser.managerProfile ? 'Created' : 'Not created'}`);

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    console.log('\n🎯 Next steps:');
    console.log('1. Clear browser localStorage');
    console.log('2. Login as sales@ressichem.com');
    console.log('3. Check WebSocket connection in browser console');
    console.log('4. Test item approval notifications');

  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

fixSalesManager();
