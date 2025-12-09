const mongoose = require("mongoose");
const Manager = require("../models/Manager");
const User = require("../models/User");

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.CONNECTION_STRING || "mongodb://localhost:27017/Ressichem", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

// Assign managers to actual product categories
async function assignManagersToActualCategories() {
  try {
    console.log("👥 Assigning managers to actual product categories...");
    
    // Get all managers
    const managers = await Manager.find({ isActive: true });
    console.log(`📊 Found ${managers.length} active managers`);
    
    if (managers.length === 0) {
      console.log("❌ No managers found. Please create managers first.");
      return;
    }
    
    // Define category assignments for managers
    const categoryAssignments = [
      {
        managerIndex: 0,
        categories: [
          "Dry Mix Mortars / Premix Plasters",
          "Building Care & Maintenance"
        ]
      },
      {
        managerIndex: 1,
        categories: [
          "Epoxy Floorings & Coatings",
          "Epoxy Floorings & Coatings > Epoxy Crack Fillers",
          "Epoxy Floorings & Coatings > Epoxy Primers",
          "Epoxy Floorings & Coatings > Epoxy Mid Coats"
        ]
      },
      {
        managerIndex: 2,
        categories: [
          "Epoxy Adhesives and Coatings",
          "Epoxy Adhesives and Coatings > Resins",
          "Epoxy Adhesives and Coatings > Hardeners"
        ]
      },
      {
        managerIndex: 3,
        categories: [
          "Tiling and Grouting Materials",
          "Concrete Admixtures",
          "Building Insulation"
        ]
      },
      {
        managerIndex: 4,
        categories: [
          "Decorative Concrete",
          "Specialty Products"
        ]
      }
    ];
    
    // Assign categories to managers
    for (let i = 0; i < managers.length && i < categoryAssignments.length; i++) {
      const manager = managers[i];
      const assignment = categoryAssignments[i];
      
      if (assignment) {
        // Update manager with assigned categories
        manager.assignedCategories = assignment.categories.map(category => ({
          category,
          assignedBy: manager.createdBy || manager._id,
          assignedAt: new Date(),
          isActive: true
        }));
        
        await manager.save();
        
        // Update user profile
        const user = await User.findOne({ user_id: manager.user_id });
        if (user) {
          user.managerProfile.assignedCategories = assignment.categories;
          await user.save();
        }
        
        console.log(`✅ Manager ${i + 1} assigned to categories: ${assignment.categories.join(', ')}`);
      }
    }
    
    // If there are more managers than assignments, assign them to remaining categories
    if (managers.length > categoryAssignments.length) {
      const remainingCategories = [
        "Epoxy Floorings & Coatings > Cementitious Screeds and Repair Materials",
        "Epoxy Floorings & Coatings > Two Component Epoxy Top Coats",
        "Epoxy Floorings & Coatings > Three Component Heavy Duty Epoxy Floorings",
        "Epoxy Floorings & Coatings > Thin Coat Brush, Roller and Spray Applied",
        "Epoxy Adhesives and Coatings > Mixed Formulated Systems",
        "Epoxy Adhesives and Coatings > Additives"
      ];
      
      for (let i = categoryAssignments.length; i < managers.length; i++) {
        const manager = managers[i];
        const categoriesToAssign = remainingCategories.slice(0, 2); // Assign 2 categories per manager
        
        manager.assignedCategories = categoriesToAssign.map(category => ({
          category,
          assignedBy: manager.createdBy || manager._id,
          assignedAt: new Date(),
          isActive: true
        }));
        
        await manager.save();
        
        // Update user profile
        const user = await User.findOne({ user_id: manager.user_id });
        if (user) {
          user.managerProfile.assignedCategories = categoriesToAssign;
          await user.save();
        }
        
        console.log(`✅ Manager ${i + 1} assigned to categories: ${categoriesToAssign.join(', ')}`);
      }
    }
    
    console.log("\n🎉 Manager category assignments completed successfully!");
    
    // Display summary
    console.log("\n📋 Assignment Summary:");
    for (let i = 0; i < managers.length; i++) {
      const manager = managers[i];
      const user = await User.findOne({ user_id: manager.user_id });
      console.log(`   Manager ${i + 1}: ${user?.firstName || 'Unknown'} ${user?.lastName || ''} (${manager.user_id})`);
      console.log(`   Categories: ${manager.assignedCategories.map(cat => cat.category).join(', ')}`);
      console.log('');
    }
    
  } catch (error) {
    console.error("❌ Error assigning managers to categories:", error);
  }
}

// Main function
async function main() {
  await connectDB();
  await assignManagersToActualCategories();
  await mongoose.connection.close();
  console.log("✅ Database connection closed");
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { assignManagersToActualCategories };
