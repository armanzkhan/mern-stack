const mongoose = require("mongoose");
const User = require("../models/User");
const Manager = require("../models/Manager");
const CategoryAssignment = require("../models/CategoryAssignment");
const { getAllCategories } = require("../utils/productCategories");
require("dotenv").config();

const mongoUri = process.env.CONNECTION_STRING || "mongodb://localhost:27017/Ressichem";

async function connectDB() {
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "Ressichem",
    });
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

async function assignCategoriesToSalesUser() {
  try {
    console.log("🔍 Assigning categories to sales@ressichem.com user...\n");

    // Step 1: Find the sales user
    console.log("📝 Step 1: Finding sales user...");
    const salesUser = await User.findOne({ email: 'sales@ressichem.com' });
    
    if (!salesUser) {
      console.log("❌ Sales user not found");
      return;
    }
    
    console.log("✅ Sales user found");
    console.log("   User ID:", salesUser._id);
    console.log("   Email:", salesUser.email);
    console.log("   Name:", salesUser.firstName, salesUser.lastName);
    console.log("   Company ID:", salesUser.company_id);

    // Step 2: Get available categories
    console.log("\n📝 Step 2: Getting available categories...");
    const availableCategories = getAllCategories();
    const mainCategories = availableCategories.filter(cat => !cat.includes(' > '));
    
    console.log("✅ Available main categories:");
    mainCategories.forEach((category, index) => {
      console.log(`   ${index + 1}. ${category}`);
    });

    // Step 3: Assign categories to sales user
    console.log("\n📝 Step 3: Assigning categories to sales user...");
    
    // Assign some key categories for testing
    const assignedCategories = [
      "Epoxy Floorings & Coatings",
      "Building Care & Maintenance", 
      "Resins",
      "Hardeners"
    ];

    console.log("📋 Assigning categories:");
    assignedCategories.forEach((category, index) => {
      console.log(`   ${index + 1}. ${category}`);
    });

    // Step 4: Update user to be a manager
    console.log("\n📝 Step 4: Setting up user as manager...");
    
    salesUser.isManager = true;
    salesUser.managerProfile = {
      assignedCategories: assignedCategories,
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
    console.log("✅ User updated to manager profile");

    // Step 5: Create or update manager record
    console.log("\n📝 Step 5: Creating/updating manager record...");
    
    let manager = await Manager.findOne({ user_id: salesUser.user_id, company_id: salesUser.company_id });
    
    if (!manager) {
      manager = new Manager({
        user_id: salesUser.user_id,
        company_id: salesUser.company_id,
        assignedCategories: assignedCategories.map(category => ({
          category,
          assignedBy: salesUser._id, // Use the sales user's ID as the assigner
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
        permissions: {
          canUpdateStatus: true,
          canAddComments: true,
          canViewReports: true,
          canManageStock: true
        },
        performance: {
          totalOrdersManaged: 0,
          totalProductsManaged: 0,
          averageResponseTime: 0,
          lastActiveAt: new Date()
        },
        isActive: true,
        createdBy: salesUser._id
      });
      
      await manager.save();
      console.log("✅ Manager record created");
    } else {
      // Update existing manager
      manager.assignedCategories = assignedCategories.map(category => ({
        category,
        assignedBy: salesUser._id,
        assignedAt: new Date(),
        isActive: true
      }));
      manager.managerLevel = 'senior';
      await manager.save();
      console.log("✅ Manager record updated");
    }

    // Step 6: Create category assignments
    console.log("\n📝 Step 6: Creating category assignments...");
    
    for (const category of assignedCategories) {
      await CategoryAssignment.findOneAndUpdate(
        { 
          manager_id: manager._id, 
          category, 
          company_id: salesUser.company_id 
        },
        {
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
            canManageStock: true,
            canApproveOrders: true
          }
        },
        { upsert: true, new: true }
      );
      console.log(`✅ Category assignment created: ${category}`);
    }

    // Step 7: Update user with manager_id reference
    console.log("\n📝 Step 7: Linking user to manager record...");
    salesUser.managerProfile.manager_id = manager._id;
    await salesUser.save();
    console.log("✅ User linked to manager record");

    // Step 8: Display summary
    console.log("\n🎉 Summary:");
    console.log(`   ✅ User: ${salesUser.email}`);
    console.log(`   ✅ Manager ID: ${manager._id}`);
    console.log(`   ✅ Manager Level: ${manager.managerLevel}`);
    console.log(`   ✅ Assigned Categories: ${assignedCategories.length}`);
    console.log(`   ✅ Category Assignments: ${assignedCategories.length}`);
    
    console.log("\n📋 Assigned Categories:");
    assignedCategories.forEach((category, index) => {
      console.log(`   ${index + 1}. ${category}`);
    });

    console.log("\n🚀 Sales user is now ready to test the manager dashboard!");
    console.log("   - Login with: sales@ressichem.com");
    console.log("   - Access manager dashboard at: /manager-dashboard");
    console.log("   - View assigned categories and manage orders");

  } catch (error) {
    console.error("❌ Error assigning categories to sales user:", error);
    throw error;
  }
}

async function main() {
  try {
    await connectDB();
    await assignCategoriesToSalesUser();
    console.log("\n✅ Category assignment process completed!");
  } catch (error) {
    console.error("❌ Category assignment failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the script if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { assignCategoriesToSalesUser };
