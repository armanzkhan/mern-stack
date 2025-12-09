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

async function seedManagers() {
  try {
    console.log("🌱 Starting manager seeding...");

    // Get available categories
    const availableCategories = getAllCategories();
    const mainCategories = availableCategories.filter(cat => !cat.includes(' > '));

    // Sample managers data
    const managersData = [
      {
        user_id: "manager_epoxy_001",
        email: "epoxy.manager@ressichem.com",
        firstName: "John",
        lastName: "Smith",
        password: "password123",
        assignedCategories: ["Epoxy Floorings & Coatings", "Building Care & Maintenance"],
        managerLevel: "senior"
      },
      {
        user_id: "manager_resins_001", 
        email: "resins.manager@ressichem.com",
        firstName: "Sarah",
        lastName: "Johnson",
        password: "password123",
        assignedCategories: ["Resins", "Hardeners"],
        managerLevel: "lead"
      },
      {
        user_id: "manager_systems_001",
        email: "systems.manager@ressichem.com", 
        firstName: "Mike",
        lastName: "Wilson",
        password: "password123",
        assignedCategories: ["Mixed Formulated Systems", "Additives"],
        managerLevel: "head"
      },
      {
        user_id: "manager_flooring_001",
        email: "flooring.manager@ressichem.com",
        firstName: "Lisa",
        lastName: "Brown", 
        password: "password123",
        assignedCategories: ["Dry Mix Mortars / Premix Plasters"],
        managerLevel: "junior"
      }
    ];

    const companyId = "RESSICHEM";

    for (const managerData of managersData) {
      console.log(`👤 Creating manager: ${managerData.user_id}`);

      // Create or update user
      let user = await User.findOne({ user_id: managerData.user_id, company_id: companyId });
      
      if (!user) {
        const bcrypt = require("bcrypt");
        const hashedPassword = await bcrypt.hash(managerData.password, 10);
        
        user = new User({
          user_id: managerData.user_id,
          company_id: companyId,
          email: managerData.email,
          password: hashedPassword,
          firstName: managerData.firstName,
          lastName: managerData.lastName,
          department: "Sales",
          isManager: true,
          managerProfile: {
            assignedCategories: managerData.assignedCategories,
            managerLevel: managerData.managerLevel,
            canAssignCategories: managerData.managerLevel === 'head',
            notificationPreferences: {
              orderUpdates: true,
              stockAlerts: true,
              statusChanges: true,
              newOrders: true,
              lowStock: true,
              categoryReports: true
            }
          }
        });
        
        await user.save();
        console.log(`✅ Created user: ${managerData.user_id}`);
      } else {
        // Update existing user
        user.isManager = true;
        user.managerProfile = {
          assignedCategories: managerData.assignedCategories,
          managerLevel: managerData.managerLevel,
          canAssignCategories: managerData.managerLevel === 'head',
          notificationPreferences: {
            orderUpdates: true,
            stockAlerts: true,
            statusChanges: true,
            newOrders: true,
            lowStock: true,
            categoryReports: true
          }
        };
        await user.save();
        console.log(`✅ Updated user: ${managerData.user_id}`);
      }

      // Create or update manager profile
      let manager = await Manager.findOne({ user_id: managerData.user_id, company_id: companyId });
      
      if (!manager) {
        manager = new Manager({
          user_id: managerData.user_id,
          company_id: companyId,
          assignedCategories: managerData.assignedCategories.map(category => ({
            category,
            assignedBy: "system",
            assignedAt: new Date(),
            isActive: true
          })),
          managerLevel: managerData.managerLevel,
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
          createdBy: "system"
        });
        
        await manager.save();
        console.log(`✅ Created manager profile: ${managerData.user_id}`);
      } else {
        // Update existing manager
        manager.assignedCategories = managerData.assignedCategories.map(category => ({
          category,
          assignedBy: "system",
          assignedAt: new Date(),
          isActive: true
        }));
        manager.managerLevel = managerData.managerLevel;
        await manager.save();
        console.log(`✅ Updated manager profile: ${managerData.user_id}`);
      }

      // Create category assignments
      for (const category of managerData.assignedCategories) {
        await CategoryAssignment.findOneAndUpdate(
          { 
            manager_id: manager._id, 
            category, 
            company_id: companyId 
          },
          {
            manager_id: manager._id,
            user_id: managerData.user_id,
            company_id: companyId,
            category,
            assignedBy: "system",
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
        console.log(`✅ Created category assignment: ${category} -> ${managerData.user_id}`);
      }
    }

    console.log("🎉 Manager seeding completed successfully!");
    
    // Display summary
    const totalManagers = await Manager.countDocuments({ company_id: companyId });
    const totalAssignments = await CategoryAssignment.countDocuments({ company_id: companyId });
    
    console.log(`📊 Summary:`);
    console.log(`   - Total Managers: ${totalManagers}`);
    console.log(`   - Total Category Assignments: ${totalAssignments}`);
    
    // List all managers and their categories
    const managers = await Manager.find({ company_id: companyId }).populate('assignedCategories.assignedBy');
    console.log(`\n👥 Manager Details:`);
    managers.forEach(manager => {
      console.log(`   - ${manager.user_id} (${manager.managerLevel}): ${manager.getCategoryList().join(', ')}`);
    });

  } catch (error) {
    console.error("❌ Error seeding managers:", error);
    throw error;
  }
}

async function main() {
  try {
    await connectDB();
    await seedManagers();
    console.log("✅ Manager seeding process completed!");
  } catch (error) {
    console.error("❌ Manager seeding failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { seedManagers };
