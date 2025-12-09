/**
 * Fix asif@gmail.com user record
 * Remove customer flags and recreate Manager record if needed
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Manager = require('../models/Manager');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.CONNECTION_STRING || 
  "mongodb+srv://armanzaman4_db_user:1JJORz7jP2VFgTaP@cluster0.qn1babq.mongodb.net/Ressichem?retryWrites=true&w=majority";

async function fixAsifUser() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "Ressichem"
    });
    console.log('✅ Connected to MongoDB\n');

    const user = await User.findOne({ email: 'asif@gmail.com' });
    if (!user) {
      console.log('❌ User not found');
      await mongoose.disconnect();
      return;
    }

    console.log('📊 Current User State:');
    console.log(`   Email: ${user.email}`);
    console.log(`   isManager: ${user.isManager}`);
    console.log(`   isCustomer: ${user.isCustomer}`);
    console.log(`   role: ${user.role || 'N/A'}`);
    console.log(`   has customerProfile: ${!!user.customerProfile}\n`);

    // Fix: Remove customer flags
    user.isCustomer = false;
    user.customerProfile = undefined;
    await user.save();
    console.log('✅ Removed customer flags from User record\n');

    // Check if Manager record exists
    const manager = await Manager.findOne({ user_id: user.user_id });
    if (!manager) {
      console.log('📝 Creating Manager record...');
      const newManager = new Manager({
        user_id: user.user_id,
        company_id: user.company_id,
        assignedCategories: user.managerProfile?.assignedCategories?.map(cat => ({
          category: typeof cat === 'string' ? cat : (cat.category || cat),
          assignedBy: user._id,
          assignedAt: new Date(),
          isActive: true
        })) || [],
        managerLevel: user.managerProfile?.managerLevel || 'junior',
        notificationPreferences: user.managerProfile?.notificationPreferences || {
          orderUpdates: true,
          stockAlerts: true,
          statusChanges: true,
          newOrders: true,
          lowStock: true,
          categoryReports: true
        },
        isActive: true,
        createdBy: user._id
      });
      await newManager.save();
      console.log(`✅ Created Manager record: ${newManager._id}`);
      
      // Update user's managerProfile
      if (!user.managerProfile) {
        user.managerProfile = {};
      }
      user.managerProfile.manager_id = newManager._id;
      await user.save();
      console.log('✅ Updated User record with manager_id');
    } else {
      console.log(`✅ Manager record already exists: ${manager._id}`);
    }

    console.log('\n✅ Fix completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

if (require.main === module) {
  fixAsifUser()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = fixAsifUser;

