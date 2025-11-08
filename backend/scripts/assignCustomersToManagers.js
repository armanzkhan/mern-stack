const mongoose = require("mongoose");
const Customer = require("../models/Customer");
const Manager = require("../models/Manager");

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

// Assign customers to managers
async function assignCustomersToManagers() {
  try {
    console.log("👥 Assigning customers to managers...");
    
    // Get all customers
    const customers = await Customer.find({ status: 'active' });
    console.log(`📊 Found ${customers.length} active customers`);
    
    if (customers.length === 0) {
      console.log("❌ No customers found. Please create customers first.");
      return;
    }
    
    // Get all managers with their categories
    const managers = await Manager.find({ isActive: true });
    console.log(`📊 Found ${managers.length} active managers`);
    
    if (managers.length === 0) {
      console.log("❌ No managers found. Please create managers first.");
      return;
    }
    
    // Assign customers to managers based on their company type or industry
    const assignments = [];
    
    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];
      const managerIndex = i % managers.length; // Distribute customers evenly
      const manager = managers[managerIndex];
      
      // Assign customer to manager
      customer.assignedManager = {
        manager_id: manager._id,
        assignedBy: manager.createdBy || manager._id,
        assignedAt: new Date(),
        isActive: true,
        notes: `Auto-assigned based on customer distribution`
      };
      
      await customer.save();
      
      assignments.push({
        customer: customer.companyName,
        manager: manager.user_id,
        categories: manager.assignedCategories.map(cat => cat.category)
      });
      
      console.log(`✅ Assigned ${customer.companyName} to manager ${manager.user_id}`);
    }
    
    console.log("\n🎉 Customer assignments completed successfully!");
    
    // Display summary
    console.log("\n📋 Assignment Summary:");
    assignments.forEach((assignment, index) => {
      console.log(`   ${index + 1}. ${assignment.customer} → Manager: ${assignment.manager}`);
      console.log(`      Categories: ${assignment.categories.join(', ')}`);
      console.log('');
    });
    
    // Show statistics
    const assignmentStats = {};
    assignments.forEach(assignment => {
      if (!assignmentStats[assignment.manager]) {
        assignmentStats[assignment.manager] = 0;
      }
      assignmentStats[assignment.manager]++;
    });
    
    console.log("📊 Manager Assignment Statistics:");
    Object.entries(assignmentStats).forEach(([manager, count]) => {
      console.log(`   ${manager}: ${count} customers`);
    });
    
  } catch (error) {
    console.error("❌ Error assigning customers to managers:", error);
  }
}

// Main function
async function main() {
  await connectDB();
  await assignCustomersToManagers();
  await mongoose.connection.close();
  console.log("✅ Database connection closed");
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { assignCustomersToManagers };
