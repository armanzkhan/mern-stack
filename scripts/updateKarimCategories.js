/**
 * Script to update categories for karim@gmail.com manager
 * 
 * This script allows you to assign categories to the manager karim@gmail.com
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Manager = require('../models/Manager');
const CategoryAssignment = require('../models/CategoryAssignment');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.CONNECTION_STRING || 
  "mongodb+srv://armanzaman4_db_user:1JJORz7jP2VFgTaP@cluster0.qn1babq.mongodb.net/Ressichem?retryWrites=true&w=majority";

// Categories to assign - UPDATE THESE with the actual categories you want to assign
const CATEGORIES_TO_ASSIGN = [
  // Add the 3 categories here, for example:
  // "Epoxy Adhesives and Coatings",
  // "Specialty Products",
  // "Building Care & Maintenance"
];

async function updateKarimCategories() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "Ressichem"
    });
    console.log('✅ Connected to MongoDB\n');

    const user = await User.findOne({ email: 'karim@gmail.com' });
    if (!user) {
      console.log('❌ User not found');
      await mongoose.disconnect();
      return;
    }

    console.log(`📊 Found user: ${user.email}`);
    console.log(`   User ID: ${user.user_id}\n`);

    const manager = await Manager.findOne({ user_id: user.user_id });
    if (!manager) {
      console.log('❌ Manager record not found');
      await mongoose.disconnect();
      return;
    }

    console.log(`📊 Found Manager: ${manager._id}`);
    console.log(`   Current categories: ${manager.assignedCategories.length}\n`);

    if (CATEGORIES_TO_ASSIGN.length === 0) {
      console.log('⚠️ No categories specified in CATEGORIES_TO_ASSIGN');
      console.log('   Please update the script with the categories you want to assign\n');
      await mongoose.disconnect();
      return;
    }

    // Update Manager record
    manager.assignedCategories = CATEGORIES_TO_ASSIGN.map(category => ({
      category,
      assignedBy: user._id,
      assignedAt: new Date(),
      isActive: true
    }));
    await manager.save();
    console.log(`✅ Updated Manager record with ${CATEGORIES_TO_ASSIGN.length} categories`);

    // Update User record
    if (!user.managerProfile) {
      user.managerProfile = {};
    }
    user.managerProfile.assignedCategories = CATEGORIES_TO_ASSIGN;
    await user.save();
    console.log(`✅ Updated User record with categories`);

    // Delete existing CategoryAssignment records
    await CategoryAssignment.deleteMany({ manager_id: manager._id });
    console.log(`✅ Deleted existing category assignments`);

    // Create new CategoryAssignment records
    for (const category of CATEGORIES_TO_ASSIGN) {
      const assignment = new CategoryAssignment({
        manager_id: manager._id,
        user_id: user.user_id,
        company_id: user.company_id,
        category,
        assignedBy: user._id,
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
      console.log(`✅ Created category assignment: ${category}`);
    }

    console.log(`\n✅ Successfully assigned ${CATEGORIES_TO_ASSIGN.length} categories to karim@gmail.com`);
    console.log(`   Categories: ${CATEGORIES_TO_ASSIGN.join(', ')}\n`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

if (require.main === module) {
  updateKarimCategories()
    .then(() => {
      console.log('\n✅ All done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = updateKarimCategories;

