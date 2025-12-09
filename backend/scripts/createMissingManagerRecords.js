/**
 * Script to create missing Manager records for users with isManager: true
 * 
 * This script finds users who have isManager: true but don't have a corresponding
 * Manager record in the managers collection, and creates the missing Manager records.
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Manager = require('../models/Manager');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.CONNECTION_STRING || 
  "mongodb+srv://armanzaman4_db_user:1JJORz7jP2VFgTaP@cluster0.qn1babq.mongodb.net/Ressichem?retryWrites=true&w=majority";

async function createMissingManagerRecords() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "Ressichem"
    });
    console.log('✅ Connected to MongoDB\n');

    // Find all users with isManager: true or role === 'Manager'
    const managerUsers = await User.find({
      $or: [
        { isManager: true },
        { role: 'Manager' },
        { userType: 'manager' },
        { 'managerProfile.manager_id': { $exists: true } }
      ],
      company_id: { $in: ['RESSICHEM', 'Ressichem'] } // Handle both cases
    });

    console.log(`📊 Found ${managerUsers.length} users with manager role\n`);

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const createdManagers = [];
    const errors = [];

    for (const user of managerUsers) {
      try {
        // Check if Manager record already exists
        const existingManager = await Manager.findOne({
          user_id: user.user_id,
          company_id: user.company_id
        });

        if (existingManager) {
          console.log(`⏭️ Skipping ${user.email} - Manager record already exists (ID: ${existingManager._id})`);
          skippedCount++;
          continue;
        }

        // Get assigned categories from user's managerProfile
        const assignedCategories = user.managerProfile?.assignedCategories || [];
        const categoryArray = Array.isArray(assignedCategories)
          ? assignedCategories.map(cat => typeof cat === 'string' ? cat : (cat.category || cat))
          : [];

        // Create Manager record
        const manager = new Manager({
          user_id: user.user_id,
          company_id: user.company_id,
          assignedCategories: categoryArray.map(category => ({
            category,
            assignedBy: user._id,
            assignedAt: new Date(),
            isActive: true
          })),
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

        await manager.save();
        console.log(`✅ Created Manager record for ${user.email}`);
        console.log(`   Manager ID: ${manager._id}`);
        console.log(`   User ID: ${user.user_id}`);
        console.log(`   Categories: ${categoryArray.length > 0 ? categoryArray.join(', ') : 'None'}`);

        // Update user's managerProfile with manager_id
        if (!user.managerProfile) {
          user.managerProfile = {};
        }
        user.managerProfile.manager_id = manager._id;
        user.isManager = true; // Ensure flag is set
        if (categoryArray.length > 0) {
          user.managerProfile.assignedCategories = categoryArray;
        }
        await user.save();
        console.log(`✅ Updated User record with manager_id\n`);

        createdCount++;
        createdManagers.push({
          email: user.email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          userId: user.user_id,
          managerId: manager._id,
          categories: categoryArray
        });
      } catch (error) {
        console.error(`❌ Error processing ${user.email}:`, error.message);
        errors.push({
          email: user.email,
          error: error.message
        });
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Created: ${createdCount} Manager records`);
    console.log(`   ⏭️ Skipped: ${skippedCount} (already exist)`);
    console.log(`   ❌ Errors: ${errors.length}`);

    if (createdManagers.length > 0) {
      console.log('\n✅ Created Manager Records:');
      createdManagers.forEach((m, index) => {
        console.log(`   ${index + 1}. ${m.name} (${m.email})`);
        console.log(`      Manager ID: ${m.managerId}`);
        console.log(`      Categories: ${m.categories.length > 0 ? m.categories.join(', ') : 'None'}`);
      });
    }

    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach((e, index) => {
        console.log(`   ${index + 1}. ${e.email}: ${e.error}`);
      });
    }

    console.log('\n✅ Script completed successfully!');
    
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
  createMissingManagerRecords()
    .then(() => {
      console.log('\n✅ All done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = createMissingManagerRecords;

