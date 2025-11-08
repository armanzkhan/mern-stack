const mongoose = require("mongoose");
const User = require("./models/User");
const Customer = require("./models/Customer");
const Manager = require("./models/Manager");

async function testCustomerLogin() {
  try {
    await mongoose.connect(process.env.CONNECTION_STRING || "mongodb://localhost:27017/Ressichem");
    console.log("✅ Connected to MongoDB");

    // Test customer login
    const customerEmail = "areeba@ogdlc.com";
    const customer = await Customer.findOne({ email: customerEmail });
    
    if (!customer) {
      console.log("❌ Customer not found:", customerEmail);
      return;
    }

    console.log("👤 Customer found:", {
      companyName: customer.companyName,
      email: customer.email,
      assignedManager: customer.assignedManager
    });

    // Check if customer has assigned manager
    if (customer.assignedManager?.manager_id) {
      const manager = await Manager.findById(customer.assignedManager.manager_id);
      console.log("👨‍💼 Assigned manager:", {
        manager_id: manager._id,
        user_id: manager.user_id,
        assignedCategories: manager.assignedCategories
      });
    } else {
      console.log("❌ Customer has no assigned manager");
    }

    // Check user account
    const user = await User.findOne({ email: customerEmail });
    if (user) {
      console.log("👤 User account:", {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      });
    } else {
      console.log("❌ No user account found for customer");
    }

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.connection.close();
  }
}

testCustomerLogin();
