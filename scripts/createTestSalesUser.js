const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcrypt');

async function createTestSalesUser() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 Creating test sales user...');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'sales@ressichem.com' });
    if (existingUser) {
      console.log('✅ Sales user already exists');
      console.log(`   User ID: ${existingUser.user_id}`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Is Manager: ${existingUser.isManager}`);
      return;
    }

    // Create new sales user
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const salesUser = new User({
      user_id: 'sales_001',
      company_id: 'RESSICHEM',
      email: 'sales@ressichem.com',
      password: hashedPassword,
      department: 'Sales',
      isManager: true,
      managerProfile: {
        assignedCategories: ['Epoxy Floorings & Coatings', 'Building Care & Maintenance', 'Resins', 'Hardeners'],
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
      },
      roles: [],
      permissions: []
    });

    await salesUser.save();
    console.log('✅ Sales user created successfully');
    console.log(`   User ID: ${salesUser.user_id}`);
    console.log(`   Email: ${salesUser.email}`);
    console.log(`   Is Manager: ${salesUser.isManager}`);
    console.log(`   Assigned Categories: ${salesUser.managerProfile.assignedCategories.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

createTestSalesUser();
