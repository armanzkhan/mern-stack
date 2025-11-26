require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const User = require("../models/User");

async function checkManagerCustomerOverlap() {
  try {
    const mongoUri = process.env.CONNECTION_STRING || "mongodb+srv://armanzaman4_db_user:1JJORz7jP2VFgTaP@cluster0.qn1babq.mongodb.net/Ressichem?retryWrites=true&w=majority";
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "Ressichem",
    });

    console.log("🔍 Checking users with both Manager and Customer flags...\n");

    // Find all users who are managers
    const managers = await User.find({
      $or: [
        { isManager: true },
        { role: 'Manager' },
        { 'managerProfile.manager_id': { $exists: true } }
      ]
    }).select('email isManager isCustomer role managerProfile customerProfile');

    console.log("📊 All users with manager flags:");
    managers.forEach(u => {
      console.log(`  ${u.email}:`);
      console.log(`    isManager: ${u.isManager}`);
      console.log(`    isCustomer: ${u.isCustomer}`);
      console.log(`    role: ${u.role || 'undefined'}`);
      console.log(`    has managerProfile: ${!!u.managerProfile}`);
      console.log(`    has customerProfile: ${!!u.customerProfile}`);
      console.log("");
    });

    console.log("\n✅ Pure Managers (NOT customers):");
    const pureManagers = managers.filter(u => !u.isCustomer && !u.customerProfile);
    pureManagers.forEach(u => {
      console.log(`  ${u.email}`);
    });

    console.log("\n⚠️ Users who are BOTH Manager AND Customer (should be excluded from Manager filter):");
    const both = managers.filter(u => u.isCustomer || u.customerProfile);
    both.forEach(u => {
      console.log(`  ${u.email} - isManager: ${u.isManager}, isCustomer: ${u.isCustomer}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

checkManagerCustomerOverlap();

