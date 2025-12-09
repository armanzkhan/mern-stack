#!/usr/bin/env node

/**
 * Multi-Tenant Password Reset & Seeding Script
 * 
 * Usage:
 *   node scripts/resetUserPassword.js <email> <newPassword> [companyName]
 * 
 * Examples:
 *   node scripts/resetUserPassword.js admin@example.com newpass Ressichem
 *   node scripts/resetUserPassword.js demo@example.com demo123 ABC_Chemicals
 */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Company = require("../models/Company");

async function run() {
  const mongoUri =
    process.env.MONGO_URI ||
    process.env.CONNECTION_STRING ||
    "mongodb+srv://root:kJpH8FOf546WVTJF@cluster0.w9o4g9x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "Ressichem",
  });

  console.log("✅ Connected to MongoDB");

  const [,, emailArg, passwordArg, companyArg] = process.argv;

  if (!emailArg || !passwordArg) {
    console.log("\n❌ Usage: node scripts/resetUserPassword.js <email> <newPassword> [companyName]");
    process.exit(1);
  }

  const companyName = companyArg || "Ressichem";

  try {
    // Ensure company exists or create new one
    let company = await Company.findOne({ companyName });
    if (!company) {
      company = await Company.create({
        companyName,
        companyCode: companyName.toUpperCase().replace(/\s+/g, "_"),
        address: "Default Address",
        email: `info@${companyName.toLowerCase().replace(/\s+/g, "")}.com`,
        phone: "+92-300-0000000",
      });
      console.log(`🏢 Created new company: ${company.companyName}`);
    } else {
      console.log(`🏢 Using existing company: ${company.companyName}`);
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(passwordArg, 10);

    // Find user in the selected company
    let user = await User.findOne({ email: emailArg, company_id: company._id });

    if (!user) {
      console.log(`⚠️ No user found with email ${emailArg} under ${company.companyName}`);
      console.log("Creating a new user with this email...");

      user = await User.create({
        user_id: `user_${Date.now()}`,
        company_id: company._id,
        email: emailArg,
        password: hashedPassword,
        department: "General",
        isSuperAdmin: false,
      });

      console.log(`✅ New user created for ${company.companyName}: ${emailArg}`);
    } else {
      user.password = hashedPassword;
      await user.save();
      console.log(`🔑 Password updated for user: ${emailArg}`);
    }

    console.log("\n📋 Current Companies List (for dropdown use):");
    const companies = await Company.find({}, "companyName companyCode _id");
    companies.forEach(c =>
      console.log(`- ${c.companyName} (${c.companyCode}) → ${c._id}`)
    );

    console.log("\n✅ Operation completed successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

run().catch(console.error);
