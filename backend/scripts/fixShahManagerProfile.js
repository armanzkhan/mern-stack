/*
  Script to fix manager profile for shah@ressichem.com
  This ensures the user has isManager: true, managerProfile, and a Manager record
*/

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const User = require("../models/User");
const Manager = require("../models/Manager");
const CategoryAssignment = require("../models/CategoryAssignment");

async function fixShahManagerProfile() {
  try {
    await connect();
    
    const email = "shah@ressichem.com";
    const companyId = "RESSICHEM";
    
    // Default categories for Shah (based on migration script)
    const defaultCategories = [
      "General",
      "Construction", 
      "Building Materials"
    ];
    
    console.log(`🔍 Looking for user: ${email}`);
    
    // Find user by email
    const user = await User.findOne({ email, company_id: companyId });
    
    if (!user) {
      console.error(`❌ User not found for email: ${email}`);
      console.log("💡 The user may need to be created first.");
      process.exit(1);
    }
    
    console.log(`✅ Found user: ${user.email}`);
    console.log(`   User ID: ${user.user_id}`);
    console.log(`   Company ID: ${user.company_id}`);
    console.log(`   Is Manager: ${user.isManager}`);
    console.log(`   Has Manager Profile: ${!!user.managerProfile}`);
    
    // Check if Manager record exists
    let manager = await Manager.findOne({ user_id: user.user_id, company_id: companyId });
    
    if (!manager) {
      console.log("🆕 Creating Manager record...");
      manager = new Manager({
        user_id: user.user_id,
        company_id: companyId,
        assignedCategories: defaultCategories.map(category => ({
          category,
          assignedBy: user._id,
          assignedAt: new Date(),
          isActive: true
        })),
        managerLevel: 'senior', // Using 'senior' as default (valid enum value)
        notificationPreferences: {
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
      console.log(`✅ Created Manager record with ID: ${manager._id}`);
    } else {
      console.log(`✅ Manager record already exists: ${manager._id}`);
      
      // Update categories if needed
      const existingCategories = manager.assignedCategories
        .filter(c => c.isActive)
        .map(c => c.category);
      
      const missingCategories = defaultCategories.filter(cat => !existingCategories.includes(cat));
      
      if (missingCategories.length > 0) {
        console.log(`📝 Adding missing categories: ${missingCategories.join(', ')}`);
        missingCategories.forEach(category => {
          manager.assignedCategories.push({
            category,
            assignedBy: user._id,
            assignedAt: new Date(),
            isActive: true
          });
        });
        await manager.save();
        console.log(`✅ Updated Manager categories`);
      } else {
        console.log(`✅ Manager already has all required categories`);
      }
    }
    
    // Update User record
    console.log("📝 Updating User record...");
    user.isManager = true;
    user.managerProfile = {
      manager_id: manager._id,
      assignedCategories: defaultCategories,
      managerLevel: manager.managerLevel || 'senior',
      canAssignCategories: false,
      notificationPreferences: manager.notificationPreferences || {
        orderUpdates: true,
        stockAlerts: true,
        statusChanges: true,
        newOrders: true,
        lowStock: true,
        categoryReports: true
      }
    };
    await user.save();
    console.log(`✅ Updated User manager profile`);
    
    // Create/update CategoryAssignments
    console.log("📋 Creating/updating CategoryAssignments...");
    for (const category of defaultCategories) {
      await CategoryAssignment.findOneAndUpdate(
        { manager_id: manager._id, category, company_id: companyId },
        {
          manager_id: manager._id,
          user_id: user.user_id,
          company_id: companyId,
          category,
          assignedBy: user._id,
          isActive: true,
          isPrimary: true
        },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Created/updated ${defaultCategories.length} CategoryAssignments`);
    
    // Verify the fix
    console.log("\n🔍 Verification:");
    const verifyUser = await User.findOne({ email, company_id: companyId });
    const verifyManager = await Manager.findOne({ user_id: user.user_id, company_id: companyId });
    
    console.log(`   User.isManager: ${verifyUser.isManager}`);
    console.log(`   User.managerProfile exists: ${!!verifyUser.managerProfile}`);
    console.log(`   Manager record exists: ${!!verifyManager}`);
    if (verifyManager) {
      console.log(`   Manager categories: ${verifyManager.assignedCategories.filter(c => c.isActive).map(c => c.category).join(', ')}`);
    }
    
    console.log("\n🎉 Manager profile fix complete!");
    console.log({
      email: user.email,
      user_id: user.user_id,
      company_id: user.company_id,
      manager_id: manager._id,
      isManager: user.isManager,
      hasManagerProfile: !!user.managerProfile,
      categories: defaultCategories
    });
    
  } catch (err) {
    console.error("❌ Error:", err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  console.log("🚀 Starting fixShahManagerProfile script...");
  fixShahManagerProfile().catch(err => {
    console.error("❌ Unhandled error:", err);
    process.exit(1);
  });
}

module.exports = { fixShahManagerProfile };

