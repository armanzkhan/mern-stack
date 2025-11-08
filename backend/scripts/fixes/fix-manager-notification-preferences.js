// Fix manager notification preferences
const mongoose = require('mongoose');
const User = require('./models/User');

async function fixManagerNotificationPreferences() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('Connected to MongoDB - Database: Ressichem');

    console.log('\n🔧 FIXING MANAGER NOTIFICATION PREFERENCES:');
    
    // Get all managers
    const managers = await User.find({ isManager: true });
    console.log(`📊 Found ${managers.length} managers`);
    
    for (const manager of managers) {
      console.log(`\n👤 Updating ${manager.firstName} ${manager.lastName} (${manager.email})`);
      
      // Update notification preferences
      if (!manager.managerProfile) {
        manager.managerProfile = {};
      }
      
      if (!manager.managerProfile.notificationPreferences) {
        manager.managerProfile.notificationPreferences = {};
      }
      
      // Enable all notification types
      manager.managerProfile.notificationPreferences = {
        orderUpdates: true,
        stockAlerts: true,
        statusChanges: true,
        newOrders: true,
        lowStock: true,
        categoryReports: true
      };
      
      await manager.save();
      console.log(`✅ Updated notification preferences for ${manager.email}`);
    }

    // Verify the changes
    console.log('\n🔍 VERIFICATION:');
    const updatedManagers = await User.find({ isManager: true });
    
    updatedManagers.forEach((manager, index) => {
      console.log(`   ${index + 1}. ${manager.firstName} ${manager.lastName} (${manager.email})`);
      if (manager.managerProfile?.notificationPreferences) {
        const prefs = manager.managerProfile.notificationPreferences;
        console.log(`      Order Updates: ${prefs.orderUpdates}`);
        console.log(`      New Orders: ${prefs.newOrders}`);
        console.log(`      Status Changes: ${prefs.statusChanges}`);
      }
    });

    await mongoose.connection.close();
    console.log('\n✅ Manager notification preferences fixed!');

  } catch (error) {
    console.error('❌ Failed to fix notification preferences:', error);
    process.exit(1);
  }
}

fixManagerNotificationPreferences();
