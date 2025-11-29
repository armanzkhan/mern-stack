const mongoose = require("mongoose");
const User = require("../models/User");
const Manager = require("../models/Manager");
const CategoryAssignment = require("../models/CategoryAssignment");
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

async function checkSalesUserCategories() {
  try {
    console.log("🔍 Checking sales@ressichem.com user categories...\n");

    // Step 1: Find the sales user
    const salesUser = await User.findOne({ email: 'sales@ressichem.com' });
    
    if (!salesUser) {
      console.log("❌ Sales user not found");
      return;
    }
    
    console.log("✅ Sales user found");
    console.log("   User ID:", salesUser._id);
    console.log("   Email:", salesUser.email);
    console.log("   Name:", salesUser.firstName, salesUser.lastName);
    console.log("   Is Manager:", salesUser.isManager);
    
    if (salesUser.managerProfile) {
      console.log("   Manager Profile:");
      console.log("     - Assigned Categories:", salesUser.managerProfile.assignedCategories);
      console.log("     - Manager Level:", salesUser.managerProfile.managerLevel);
      console.log("     - Can Assign Categories:", salesUser.managerProfile.canAssignCategories);
    }

    // Step 2: Check manager record
    const manager = await Manager.findOne({ user_id: salesUser.user_id, company_id: salesUser.company_id });
    
    if (manager) {
      console.log("\n✅ Manager record found");
      console.log("   Manager ID:", manager._id);
      console.log("   Assigned Categories:", manager.getCategoryList());
      console.log("   Manager Level:", manager.managerLevel);
      console.log("   Is Active:", manager.isActive);
    } else {
      console.log("\n❌ Manager record not found");
    }

    // Step 3: Check category assignments
    const categoryAssignments = await CategoryAssignment.find({ 
      user_id: salesUser.user_id, 
      company_id: salesUser.company_id,
      isActive: true 
    });
    
    if (categoryAssignments.length > 0) {
      console.log("\n✅ Category assignments found");
      console.log("   Total Assignments:", categoryAssignments.length);
      categoryAssignments.forEach((assignment, index) => {
        console.log(`   ${index + 1}. ${assignment.category} (${assignment.isPrimary ? 'Primary' : 'Secondary'})`);
      });
    } else {
      console.log("\n❌ No category assignments found");
    }

    // Step 4: Summary
    console.log("\n📊 Summary:");
    console.log(`   User is Manager: ${salesUser.isManager ? 'Yes' : 'No'}`);
    console.log(`   Manager Record: ${manager ? 'Yes' : 'No'}`);
    console.log(`   Category Assignments: ${categoryAssignments.length}`);
    console.log(`   Assigned Categories: ${salesUser.managerProfile?.assignedCategories?.length || 0}`);

    if (salesUser.isManager && manager && categoryAssignments.length > 0) {
      console.log("\n🎉 Sales user is ready for manager dashboard testing!");
      console.log("   - Login with: sales@ressichem.com");
      console.log("   - Access: /manager-dashboard");
      console.log("   - Categories:", salesUser.managerProfile.assignedCategories.join(', '));
    } else {
      console.log("\n⚠️  Sales user needs category assignment");
    }

  } catch (error) {
    console.error("❌ Error checking sales user categories:", error);
  }
}

async function main() {
  try {
    await connectDB();
    await checkSalesUserCategories();
  } catch (error) {
    console.error("❌ Check failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkSalesUserCategories };
